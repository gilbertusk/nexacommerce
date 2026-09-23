import { orderRepository } from '../repositories/order.repository';
import { prisma } from '../prisma/client';
import { NotFoundError, ValidationError, ForbiddenError, buildInternalServiceHeaders } from '@nexacommerce/common';
import { config } from '../config';
import { Prisma } from '../generated/client';
import { publishOrderCreated, publishOrderCancelled, publishOrderPaid, publishOrderCompleted } from '../messaging/rabbitmq';

export class OrderService {
  private async makeRequest(serviceUrl: string, path: string, method: string, body?: any) {
    const url = `${serviceUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...buildInternalServiceHeaders('order-service'),
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const resBody = await response.json() as any;
      if (!response.ok) {
        throw new ValidationError(resBody.message || `Service call to ${url} failed`);
      }
      return resBody.data;
    } catch (err: any) {
      if (err instanceof ValidationError) throw err;
      throw new ValidationError(`Communication error with service: ${err.message}`);
    }
  }

  async checkout(
    userId: string,
    body: {
      shippingAddressId: string;
      voucherCode?: string | null;
      courierName?: string | null;
      courierService?: string | null;
      shippingCost?: number | null;
      notes?: string | null;
    }
  ) {
    const { shippingAddressId, voucherCode, courierName, courierService, notes } = body;
    const shippingCostVal = body.shippingCost || 0;

    // 1. Get Cart
    const cart = await this.makeRequest(config.cartServiceUrl, `/cart/internal/cart/${userId}`, 'GET');
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    const cartProductIds = cart.items.map((item: any) => item.productId);

    // 2. Fetch products details in batch
    const products = await this.makeRequest(config.productServiceUrl, '/internal/products/batch', 'POST', {
      ids: cartProductIds,
    });

    if (products.length !== cartProductIds.length) {
      throw new ValidationError('Some products in cart no longer exist in catalog');
    }

    // Check status active
    for (const p of products) {
      if (p.status !== 'ACTIVE') {
        throw new ValidationError(`Product "${p.name}" is no longer active`);
      }
    }

    // 3. Batch check stock levels
    const stocks = await this.makeRequest(config.inventoryServiceUrl, '/inventory/internal/inventory/batch-check', 'POST', {
      productIds: cartProductIds,
    });

    // Check availability
    for (const item of cart.items) {
      const stock = stocks.find((s: any) => s.productId === item.productId);
      if (!stock || stock.availableStock < item.quantity) {
        throw new ValidationError(`Insufficient stock for product id ${item.productId}`);
      }
    }

    // 4. Get Address
    const address = await this.makeRequest(config.userServiceUrl, `/users/internal/users/${userId}/addresses/${shippingAddressId}`, 'GET');
    if (!address) {
      throw new ValidationError('Shipping address not found');
    }

    // 5. Get User Details
    const customer = await this.makeRequest(config.authServiceUrl, `/auth/internal/users/${userId}`, 'GET');
    if (!customer) {
      throw new ValidationError('Customer account details not found');
    }

    // 6. Validate Voucher if code is supplied
    let voucher: any = null;
    let discount = 0;

    if (voucherCode) {
      const validateItems = cart.items.map((item: any) => {
        const prod = products.find((p: any) => p.id === item.productId);
        return {
          price: Number(prod.price),
          quantity: item.quantity,
          categoryId: prod.categoryId,
          sellerId: prod.sellerId,
        };
      });

      const voucherResult = await this.makeRequest(config.voucherServiceUrl, '/vouchers/internal/vouchers/validate', 'POST', {
        code: voucherCode,
        userId,
        items: validateItems,
      });

      voucher = voucherResult.voucher;
      discount = Number(voucherResult.discountAmount);
    }

    // Calculate subtotal
    let subtotal = 0;
    const itemsData = cart.items.map((item: any) => {
      const prod = products.find((p: any) => p.id === item.productId);
      const priceNum = Number(prod.price);
      const itemSubtotal = priceNum * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: item.productId,
        productName: prod.name,
        productImage: prod.images && prod.images.length > 0 ? prod.images[0].url : null,
        productPrice: new Prisma.Decimal(priceNum),
        quantity: item.quantity,
        subtotal: new Prisma.Decimal(itemSubtotal),
        sellerId: prod.sellerId,
        sellerName: prod.brand ? prod.brand.name : 'Seller', // fallback
      };
    });

    const grandTotal = Math.max(0, subtotal - discount + shippingCostVal);

    // 7. Generate order number
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await orderRepository.countCreatedToday();
    const seq = String(count + 1).padStart(4, '0');
    const orderNumber = `NXC-${todayStr}-${seq}`;

    // 8. Create order in Database (transactional status: PENDING_PAYMENT)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          orderNumber,
          customerId: userId,
          customerName: customer.name,
          customerEmail: customer.email,
          subtotal: new Prisma.Decimal(subtotal),
          discount: new Prisma.Decimal(discount),
          shippingCost: new Prisma.Decimal(shippingCostVal),
          grandTotal: new Prisma.Decimal(grandTotal),
          voucherId: voucher?.id || null,
          voucherCode: voucher?.code || null,
          shippingAddressId: shippingAddressId,
          shippingAddress: address,
          courierName: courierName || null,
          courierService: courierService || null,
          status: 'PENDING_PAYMENT',
          notes: notes || null,
          expiresAt,
          items: {
            create: itemsData,
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: 'PENDING_PAYMENT',
              note: 'Order checkout initiated',
              changedBy: 'SYSTEM',
            },
          },
        },
        include: {
          items: true,
        },
      });
    });

    // 9. Reserve inventory
    const reservedItems: any[] = [];
    try {
      for (const item of order.items) {
        await this.makeRequest(config.inventoryServiceUrl, '/inventory/reserve', 'POST', {
          productId: item.productId,
          orderId: order.id,
          quantity: item.quantity,
          expiresAt: expiresAt.toISOString(),
        });
        reservedItems.push(item);
      }
    } catch (err: any) {
      // Rollback: Release inventory that succeeded
      for (const item of reservedItems) {
        await this.makeRequest(config.inventoryServiceUrl, '/inventory/release', 'POST', {
          productId: item.productId,
          orderId: order.id,
        }).catch((e) => console.error(`Rollback release failed for product ${item.productId}: ${e.message}`));
      }
      // Cancel order in DB
      await this.cancelOrderInDb(order.id, 'Inventory reservation failed');
      throw new ValidationError(`Inventory reservation failed: ${err.message}`);
    }

    // 10. Apply voucher
    if (voucher) {
      try {
        const validateItemsForApply = cart.items.map((item: any) => {
          const prod = products.find((p: any) => p.id === item.productId);
          return {
            price: Number(prod.price),
            quantity: item.quantity,
            categoryId: prod.categoryId,
            sellerId: prod.sellerId,
          };
        });

        await this.makeRequest(config.voucherServiceUrl, '/vouchers/internal/vouchers/apply', 'POST', {
          code: voucherCode,
          userId,
          orderId: order.id,
          items: validateItemsForApply,
        });
      } catch (err: any) {
        // Rollback voucher: release stock
        for (const item of order.items) {
          await this.makeRequest(config.inventoryServiceUrl, '/inventory/release', 'POST', {
            productId: item.productId,
            orderId: order.id,
          }).catch((e) => console.error(`Rollback release failed: ${e.message}`));
        }
        // Cancel order in DB
        await this.cancelOrderInDb(order.id, 'Voucher application failed');
        throw new ValidationError(`Voucher application failed: ${err.message}`);
      }
    }

    // 11. Create payment transaction
    let payment: any = null;
    try {
      payment = await this.makeRequest(config.paymentServiceUrl, '/payments/internal/payments/create', 'POST', {
        orderId: order.id,
        customerId: userId,
        amount: grandTotal,
      });
    } catch (err: any) {
      // Rollback payment: release stock & voucher
      for (const item of order.items) {
        await this.makeRequest(config.inventoryServiceUrl, '/inventory/release', 'POST', {
          productId: item.productId,
          orderId: order.id,
        }).catch((e) => console.error(`Rollback release failed: ${e.message}`));
      }
      if (voucher) {
        await this.makeRequest(config.voucherServiceUrl, '/vouchers/internal/vouchers/release', 'POST', {
          orderId: order.id,
        }).catch((e) => console.error(`Rollback voucher failed: ${e.message}`));
      }
      // Cancel order in DB
      await this.cancelOrderInDb(order.id, 'Payment creation failed');
      throw new ValidationError(`Payment invoice creation failed: ${err.message}`);
    }

    // 12. Clear Cart
    await this.makeRequest(config.cartServiceUrl, `/cart/internal/cart/${userId}`, 'DELETE').catch((e) =>
      console.error(`Clearing cart failed: ${e.message}`)
    );

    // 13. Publish OrderCreated event
    const eventItems = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.productPrice),
    }));

    await publishOrderCreated({
      orderId: order.id,
      customerId: order.customerId,
      items: eventItems,
      subtotal,
      discount,
      shippingCost: shippingCostVal,
      grandTotal,
      voucherId: order.voucherId,
      shippingAddressId: order.shippingAddressId,
    });

    return {
      order,
      payment,
    };
  }

  private async cancelOrderInDb(orderId: string, reason: string) {
    const existing = await orderRepository.findById(orderId);
    if (!existing) return;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: existing.status,
          toStatus: 'CANCELLED',
          note: reason,
          changedBy: 'SYSTEM',
        },
      });
    });
  }

  async getOrderById(id: string, actor: { userId: string; role: string }) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Authorization checks
    if (actor.role === 'CUSTOMER' && order.customerId !== actor.userId) {
      throw new ForbiddenError('Access denied: You do not own this order');
    }

    if (actor.role === 'SELLER') {
      const hasSellerItem = order.items.some((item) => item.sellerId === actor.userId);
      if (!hasSellerItem) {
        throw new ForbiddenError('Access denied: You do not own any items in this order');
      }
    }

    return order;
  }

  async listOrders(
    actor: { userId: string; role: string },
    query: { page: number; limit: number; status?: string; dateFrom?: Date; dateTo?: Date }
  ) {
    const skip = (query.page - 1) * query.limit;
    
    let customerId: string | undefined;
    let sellerId: string | undefined;

    if (actor.role === 'CUSTOMER') {
      customerId = actor.userId;
    } else if (actor.role === 'SELLER') {
      sellerId = actor.userId;
    }

    const { items, total } = await orderRepository.findAndCountAll({
      skip,
      take: query.limit,
      customerId,
      status: query.status,
      sellerId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    return {
      orders: items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async adminListAllOrders(query: { page: number; limit: number; status?: string; dateFrom?: Date; dateTo?: Date }) {
    const skip = (query.page - 1) * query.limit;

    const { items, total } = await orderRepository.findAndCountAll({
      skip,
      take: query.limit,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    return {
      orders: items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async cancelOrder(id: string, actor: { userId: string; role: string }, reason = 'Cancelled by user') {
    if (actor.role === 'SELLER') {
      throw new ForbiddenError('Sellers cannot cancel an entire multi-seller order');
    }
    const order = await this.getOrderById(id, actor);

    if (order.status !== 'PENDING_PAYMENT') {
      throw new ValidationError(`Order cannot be cancelled in its current state: ${order.status}`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: 'CANCELLED',
          note: reason,
          changedBy: actor.userId,
        },
      });
    });

    // compensation release of voucher
    if (order.voucherId) {
      await this.makeRequest(config.voucherServiceUrl, '/vouchers/internal/vouchers/release', 'POST', {
        orderId: order.id,
      }).catch((e) => console.error(`Failed to release voucher on order cancel: ${e.message}`));
    }

    // publish event order cancelled (this will trigger stock release in inventory service)
    await publishOrderCancelled(order.id, order.customerId, reason);

    return this.getOrderById(id, actor);
  }

  async handlePaymentSuccess(orderId: string, paidAt: string, amount: number) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'PAID') {
      return order; // already processed
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(paidAt),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'PAID',
          note: 'Payment received successfully',
          changedBy: 'SYSTEM',
        },
      });

      return o;
    });

    // publish order paid event
    await publishOrderPaid(order.id, order.customerId, paidAt, amount);
    return updated;
  }

  async handlePaymentFailedOrExpired(orderId: string, status: 'FAILED' | 'EXPIRED') {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'CANCELLED') {
      return order; // already processed
    }

    const targetStatus = 'CANCELLED';
    const note = status === 'EXPIRED' ? 'Payment period expired' : 'Payment failed';

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: orderId },
        data: {
          status: targetStatus,
          cancelledAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: targetStatus,
          note,
          changedBy: 'SYSTEM',
        },
      });

      return o;
    });

    // release voucher
    if (order.voucherId) {
      await this.makeRequest(config.voucherServiceUrl, '/vouchers/internal/vouchers/release', 'POST', {
        orderId: order.id,
      }).catch((e) => console.error(`Failed to release voucher on payment cancellation: ${e.message}`));
    }

    // publish order cancelled
    await publishOrderCancelled(order.id, order.customerId, note);
    return updated;
  }

  async updateOrderStatus(id: string, actor: { userId: string; role: string }, toStatus: string, note?: string) {
    const order = await this.getOrderById(id, actor);

    if (actor.role === 'SELLER' && order.items.some((item) => item.sellerId !== actor.userId)) {
      throw new ForbiddenError('Seller cannot update a multi-seller order');
    }

    const allowedStatuses = ['PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
    if (!allowedStatuses.includes(toStatus)) {
      throw new ValidationError(`Invalid order status transition: ${toStatus}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id },
        data: {
          status: toStatus,
          completedAt: toStatus === 'COMPLETED' ? new Date() : undefined,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus,
          note: note || `Status updated to ${toStatus}`,
          changedBy: actor.userId,
        },
      });

      return o;
    });

    return updated;
  }

  async handleOrderDelivered(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'DELIVERED') {
      return order;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'DELIVERED',
          note: 'Package delivered to recipient',
          changedBy: 'SYSTEM',
        },
      });

      return o;
    });

    return updated;
  }

  async handleOrderCompleted(orderId: string, actor: string = 'SYSTEM') {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'COMPLETED') {
      return order;
    }

    if (order.status !== 'DELIVERED') {
      throw new ValidationError(`Order cannot be completed from status: ${order.status}`);
    }

    const completedAt = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          completedAt,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'COMPLETED',
          note: actor === 'SYSTEM' ? 'Auto-completed after 7 days' : 'Completed by customer',
          changedBy: actor,
        },
      });

      return o;
    });

    const eventItems = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.productPrice),
    }));

    await publishOrderCompleted(order.id, order.customerId, eventItems).catch((err) =>
      console.error(`[Order Service] Failed to publish OrderCompleted: ${err.message}`)
    );

    return updated;
  }

  async checkAndCancelExpiredOrders() {
    const expiredOrders = await orderRepository.findExpiredOrders(new Date());
    for (const order of expiredOrders) {
      console.log(`[Order Service] Auto-cancelling expired order ${order.orderNumber}`);
      await this.handlePaymentFailedOrExpired(order.id, 'EXPIRED').catch((err) =>
        console.error(`Failed to auto-cancel order ${order.id}: ${err.message}`)
      );
    }
  }

  async checkAndCompleteDeliveredOrders() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const deliveredOrders = await orderRepository.findDeliveredOrdersOlderThan(sevenDaysAgo);
    for (const order of deliveredOrders) {
      console.log(`[Order Service] Auto-completing delivered order ${order.orderNumber}`);
      await this.handleOrderCompleted(order.id, 'SYSTEM').catch((err) =>
        console.error(`Failed to auto-complete order ${order.id}: ${err.message}`)
      );
    }
  }

  async getOrderItemForReview(orderId: string, orderItemId: string, customerId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) return { eligible: false, reason: 'Order not found' };
    if (order.customerId !== customerId) return { eligible: false, reason: 'Order does not belong to this customer' };
    if (order.status !== 'COMPLETED') return { eligible: false, reason: `Order status is ${order.status}, must be COMPLETED` };
    const item = order.items.find((i) => i.id === orderItemId);
    if (!item) return { eligible: false, reason: 'Order item not found in this order' };
    return { eligible: true, reason: 'OK', item, order };
  }

  async requestReturn(orderId: string, customerId: string, reason: string) {
    const order = await this.getOrderById(orderId, { userId: customerId, role: 'CUSTOMER' });

    const eligibleStatuses = ['DELIVERED', 'COMPLETED'];
    if (!eligibleStatuses.includes(order.status)) {
      throw new ValidationError(`Return can only be requested for DELIVERED or COMPLETED orders. Current status: ${order.status}`);
    }

    if (order.status === 'RETURN_REQUESTED' as any) {
      throw new ValidationError('A return request has already been submitted for this order');
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'RETURN_REQUESTED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'RETURN_REQUESTED',
          note: reason,
          changedBy: customerId,
        },
      });
    });

    return orderRepository.findById(orderId);
  }

  async updateReturnRequest(
    orderId: string,
    actor: { userId: string; role: string },
    action: 'approve' | 'reject',
    note?: string
  ) {
    const order = await this.getOrderById(orderId, actor);

    if (actor.role === 'SELLER' && order.items.some((item) => item.sellerId !== actor.userId)) {
      throw new ForbiddenError('Seller cannot decide a return for a multi-seller order');
    }

    if (order.status !== 'RETURN_REQUESTED') {
      throw new ValidationError(`Order is not in RETURN_REQUESTED status. Current status: ${order.status}`);
    }

    const toStatus = action === 'approve' ? 'REFUNDED' : order.status;
    const noteText = note || (action === 'approve' ? 'Return request approved' : 'Return request rejected');

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: action === 'approve' ? 'REFUNDED' : 'COMPLETED' },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: action === 'approve' ? 'REFUNDED' : 'COMPLETED',
          note: noteText,
          changedBy: actor.userId,
        },
      });
    });

    return orderRepository.findById(orderId);
  }
}

export const orderService = new OrderService();
