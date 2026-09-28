import { orderRepository } from '../repositories/order.repository';
import { prisma } from '../prisma/client';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
  buildInternalServiceHeaders,
  computeCartHash,
} from '@nexacommerce/common';
import { config } from '../config';
import crypto from 'crypto';
import { Prisma } from '../generated/client';
import {
  enqueueOrderCancelled,
  enqueueOrderCompleted,
  enqueueOrderPaid,
} from '../messaging/outbox';
import { finalizeCheckoutWithOrderCreated } from './checkout-finalization';

type TxClient = Prisma.TransactionClient;

/** Statuses at or beyond payment; a late payment event must never regress them. */
const PAID_OR_LATER_STATUSES = [
  'PAID',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_RECEIVED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

/** Statuses from which a delivery confirmation may move an order to DELIVERED. */
const DELIVERABLE_STATUSES = ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED'];

/** Statuses a redelivered OrderDelivered must leave untouched. */
const DELIVERED_OR_LATER_STATUSES = [
  'DELIVERED',
  'COMPLETED',
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_RECEIVED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
];

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

  /**
   * Convert the authenticated customer's cart into an order.
   *
   * The shipping price is never taken from the request. The caller presents a
   * quote id; this method recomputes the cart fingerprint, asks Shipping
   * Service to consume that quote, and uses the price stored against it. A
   * caller that tampers with the cart after quoting fails the hash check, and a
   * caller that replays a quote finds it already consumed.
   */
  async checkout(
    userId: string,
    body: {
      shippingAddressId: string;
      shippingQuoteId: string;
      voucherCode?: string | null;
      notes?: string | null;
    }
  ) {
    const { shippingAddressId, shippingQuoteId, voucherCode, notes } = body;

    // 0. Idempotent replay. A quote prices exactly one order (unique
    // `shipping_quote_id`), so a retried HTTP request for the same quote is
    // answered from the order it already produced instead of starting a
    // second saga. Payment creation is idempotent per order id, so asking
    // Payment Service again returns the existing invoice rather than a new one.
    const replay = await this.replayCheckout(userId, shippingQuoteId);
    if (replay) return replay;

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

    // 5b. Claim the shipping quote.
    //
    // The order id is generated here rather than by the database so the quote
    // can be claimed before any dependent state exists. Claiming first means a
    // quote is never consumed by two orders; if order creation fails
    // afterwards, the customer simply requests a new quote, and a retry with
    // the same order id is idempotent.
    const orderId = crypto.randomUUID();
    const cartHash = computeCartHash(
      cart.items.map((item: any) => ({ productId: item.productId, quantity: item.quantity })),
      {
        addressId: shippingAddressId,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
      },
    );

    const consumedQuote = await this.makeRequest(
      config.shippingServiceUrl,
      `/shipping/internal/quotes/${shippingQuoteId}/consume`,
      'POST',
      { customerId: userId, orderId, cartHash },
    );

    const shippingCostVal = Number(consumedQuote?.totalCost);
    if (!Number.isFinite(shippingCostVal) || shippingCostVal < 0) {
      throw new ValidationError('Shipping quote did not yield a usable shipping cost');
    }
    const shipments = Array.isArray(consumedQuote?.shipments) ? consumedQuote.shipments : [];

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
      if (!Number.isSafeInteger(prod.weight) || prod.weight <= 0) {
        throw new ValidationError(`Product "${prod.name}" has no valid shipping weight`);
      }
      const priceNum = Number(prod.price);
      const itemSubtotal = priceNum * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: item.productId,
        productName: prod.name,
        productImage: prod.images && prod.images.length > 0 ? prod.images[0].url : null,
        productPrice: new Prisma.Decimal(priceNum),
        quantity: item.quantity,
        weight: prod.weight,
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
          id: orderId,
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
          // Split shipment: the authoritative per-seller breakdown lives in
          // `shipmentBreakdown`. These two columns keep the first shipment for
          // the existing single-courier reads and are not the source of truth.
          courierName: shipments[0]?.courierName ?? null,
          courierService: shipments[0]?.serviceCode ?? null,
          shippingQuoteId,
          shipmentBreakdown: shipments,
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

    // 12. Finalize the checkout saga and durably enqueue OrderCreated.
    //
    // No broker call belongs on this request path. Once inventory, voucher,
    // and payment setup have succeeded, the finalization marker and event are
    // committed atomically. RabbitMQ can be offline; the dispatcher retries
    // the durable event later without losing a completed checkout.
    const eventItems = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.productPrice),
    }));

    await finalizeCheckoutWithOrderCreated({
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

    // 13. Clear the cart only after finalization is durable. Cart cleanup is
    // best effort and must not roll back a completed checkout.
    await this.makeRequest(config.cartServiceUrl, `/cart/internal/cart/${userId}`, 'DELETE').catch((e) =>
      console.error(`Clearing cart failed: ${e.message}`)
    );

    return {
      order,
      payment,
    };
  }

  /**
   * Answer a repeated checkout for a quote that already produced an order.
   * Returns null when the quote has not been used, so a first attempt proceeds.
   */
  private async replayCheckout(userId: string, shippingQuoteId: string) {
    const existing = await orderRepository.findByShippingQuoteId(shippingQuoteId);
    // Another customer's quote falls through; consuming it is refused later
    // with the same answer as an unknown quote, so nothing leaks here.
    if (!existing || existing.customerId !== userId) return null;

    if (existing.status === 'CANCELLED') {
      throw new ConflictError('Checkout for this shipping quote failed and was cancelled; request a new shipping quote');
    }
    if (!existing.checkoutFinalizedAt) {
      throw new ConflictError('Checkout for this shipping quote is still being processed');
    }

    const payment = await this.makeRequest(config.paymentServiceUrl, '/payments/internal/payments/create', 'POST', {
      orderId: existing.id,
      customerId: userId,
      amount: Number(existing.grandTotal),
    });
    return { order: existing, payment, replayed: true };
  }

  /**
   * Cancel an order whose checkout saga never finalized.
   *
   * The claim requires `checkoutFinalizedAt IS NULL`, and finalization requires
   * the order to still be PENDING_PAYMENT, so the two are mutually exclusive on
   * the order row: an order is either announced with OrderCreated or cancelled
   * as an abandoned checkout, never both. The OrderCancelled event carries
   * `checkoutFinalized: false` so Inventory still releases stock while order
   * projections do not count an order that was never announced.
   *
   * Returns false when the order finalized or changed state first.
   */
  async abandonUnfinalizedCheckout(orderId: string, reason: string): Promise<boolean> {
    const existing = await orderRepository.findById(orderId);
    if (!existing || existing.status !== 'PENDING_PAYMENT' || existing.checkoutFinalizedAt) return false;

    const cancelledAt = new Date();
    return prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: orderId, status: 'PENDING_PAYMENT', checkoutFinalizedAt: null },
        data: {
          status: 'CANCELLED',
          cancelledAt,
        },
      });
      if (claimed.count !== 1) return false;

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: 'PENDING_PAYMENT',
          toStatus: 'CANCELLED',
          note: reason,
          changedBy: 'SYSTEM',
        },
      });
      await enqueueOrderCancelled(tx, {
        orderId: existing.id,
        customerId: existing.customerId,
        reason,
        cancelledAt: cancelledAt.toISOString(),
        checkoutFinalized: false,
      });
      return true;
    });
  }

  private async cancelOrderInDb(orderId: string, reason: string) {
    await this.abandonUnfinalizedCheckout(orderId, reason);
  }

  /**
   * Recover checkout sagas interrupted between order insert and finalization
   * (process crash, lost request, hung dependency). Such an order may hold
   * reserved stock and a voucher. Cancelling it emits OrderCancelled through
   * the outbox, which Inventory consumes to release the reservation; the
   * voucher is released here and again on retry because release is
   * idempotent per order.
   */
  async recoverStalledCheckouts(now = new Date()): Promise<number> {
    const staleBefore = new Date(now.getTime() - config.checkoutFinalizationTimeoutMs);
    const stalled = await orderRepository.findUnfinalizedCheckoutsOlderThan(staleBefore, config.checkoutRecoveryBatchSize);
    let recovered = 0;
    for (const order of stalled) {
      const cancelled = await this.abandonUnfinalizedCheckout(order.id, 'Checkout saga did not finalize in time');
      if (!cancelled) continue;
      recovered += 1;
      console.warn(JSON.stringify({
        event: 'checkout.recovered',
        orderId: order.id,
        outcome: 'CANCELLED_UNFINALIZED',
      }));
      if (order.voucherId) {
        await this.makeRequest(config.voucherServiceUrl, '/vouchers/internal/vouchers/release', 'POST', {
          orderId: order.id,
        }).catch((e) => console.error(`Voucher release for recovered checkout ${order.id} failed: ${e.message}`));
      }
    }
    return recovered;
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
      return {
        ...order,
        items: order.items.filter((item) => item.sellerId === actor.userId),
      };
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

    const visibleItems = actor.role === 'SELLER'
      ? items.map((order) => ({
        ...order,
        items: order.items.filter((item) => item.sellerId === actor.userId),
      }))
      : items;

    return {
      orders: visibleItems,
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

    const cancelledAt = new Date();
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id, status: 'PENDING_PAYMENT' },
        data: {
          status: 'CANCELLED',
          cancelledAt,
        },
      });
      if (claimed.count !== 1) throw new ConflictError('Order cancellation was already processed');

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: 'CANCELLED',
          note: reason,
          changedBy: actor.userId,
        },
      });
      await enqueueOrderCancelled(tx, {
        orderId: order.id,
        customerId: order.customerId,
        reason,
        cancelledAt: cancelledAt.toISOString(),
        checkoutFinalized: Boolean(order.checkoutFinalizedAt),
      });
    });

    // compensation release of voucher
    if (order.voucherId) {
      await this.makeRequest(config.voucherServiceUrl, '/vouchers/internal/vouchers/release', 'POST', {
        orderId: order.id,
      }).catch((e) => console.error(`Failed to release voucher on order cancel: ${e.message}`));
    }

    return this.getOrderById(id, actor);
  }

  /** Run `fn` in the caller's transaction, or open one when there is none. */
  private withTx<T>(tx: TxClient | undefined, fn: (client: TxClient) => Promise<T>): Promise<T> {
    return tx ? fn(tx) : prisma.$transaction(fn);
  }

  private async loadOrder(orderId: string, tx?: TxClient) {
    const order = tx
      ? await tx.order.findUnique({ where: { id: orderId }, include: { items: true } })
      : await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  /**
   * Apply PaymentSuccess. With `tx` the transition joins the caller's
   * transaction (the consumer's inbox transaction); without it, one is opened.
   */
  async handlePaymentSuccess(orderId: string, paidAt: string, amount: number, tx?: TxClient) {
    const order = await this.loadOrder(orderId, tx);

    if (PAID_OR_LATER_STATUSES.includes(order.status)) {
      return order; // already processed
    }
    if (order.status !== 'PENDING_PAYMENT') {
      throw new ConflictError(`Payment success cannot transition order from ${order.status} to PAID`);
    }

    const updated = await this.withTx(tx, async (client) => {
      const claimed = await client.order.updateMany({
        where: { id: orderId, status: 'PENDING_PAYMENT' },
        data: {
          status: 'PAID',
          paidAt: new Date(paidAt),
        },
      });
      if (claimed.count !== 1) throw new ConflictError('Payment success was already processed');

      await client.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'PAID',
          note: 'Payment received successfully',
          changedBy: 'SYSTEM',
        },
      });
      await enqueueOrderPaid(client, {
        orderId: order.id,
        customerId: order.customerId,
        paidAt,
        amount,
      });

      return client.order.findUniqueOrThrow({ where: { id: orderId } });
    });

    return updated;
  }

  /**
   * Apply PaymentFailed/PaymentExpired. The voucher release is an HTTP call
   * and must not run inside a caller-supplied transaction, so it happens here
   * only when this method owns the transaction; the consumer releases after
   * its inbox transaction commits.
   */
  async handlePaymentFailedOrExpired(orderId: string, status: 'FAILED' | 'EXPIRED', tx?: TxClient) {
    const order = await this.loadOrder(orderId, tx);

    if (order.status === 'CANCELLED') {
      return order; // already processed
    }
    if (order.status !== 'PENDING_PAYMENT') {
      throw new ConflictError(`Payment ${status.toLowerCase()} cannot cancel an order in ${order.status}`);
    }

    const targetStatus = 'CANCELLED';
    const note = status === 'EXPIRED' ? 'Payment period expired' : 'Payment failed';
    const cancelledAt = new Date();

    const updated = await this.withTx(tx, async (client) => {
      const claimed = await client.order.updateMany({
        where: { id: orderId, status: 'PENDING_PAYMENT' },
        data: {
          status: targetStatus,
          cancelledAt,
        },
      });
      if (claimed.count !== 1) throw new ConflictError(`Payment ${status.toLowerCase()} was already processed`);

      await client.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: targetStatus,
          note,
          changedBy: 'SYSTEM',
        },
      });
      await enqueueOrderCancelled(client, {
        orderId: order.id,
        customerId: order.customerId,
        reason: note,
        cancelledAt: cancelledAt.toISOString(),
        checkoutFinalized: Boolean(order.checkoutFinalizedAt),
      });

      return client.order.findUniqueOrThrow({ where: { id: orderId } });
    });

    // release voucher
    if (!tx && order.voucherId) {
      await this.releaseVoucherForOrder(order.id).catch((e) =>
        console.error(`Failed to release voucher on payment cancellation: ${e.message}`));
    }

    return updated;
  }

  /** Idempotent per order in Voucher Service; safe to repeat on redelivery. */
  async releaseVoucherForOrder(orderId: string) {
    return this.makeRequest(config.voucherServiceUrl, '/vouchers/internal/vouchers/release', 'POST', { orderId });
  }

  async updateOrderStatus(id: string, actor: { userId: string; role: string }, toStatus: string, note?: string) {
    const order = await this.getOrderById(id, actor);

    const allowedNextStatuses: Record<string, string[]> = {
      PAID: ['PROCESSING'],
      PROCESSING: ['PACKED', 'SHIPPED'],
      PACKED: ['SHIPPED'],
    };
    if (!allowedNextStatuses[order.status]?.includes(toStatus)) {
      throw new ValidationError(`Order cannot transition from ${order.status} to ${toStatus}`);
    }

    if (toStatus === 'SHIPPED') {
      const shipment = await this.makeRequest(
        config.shippingServiceUrl,
        `/shipping/internal/shipping/${encodeURIComponent(id)}`,
        'GET',
      );
      const shipments = Array.isArray(shipment?.shipments) ? shipment.shipments : [shipment];
      if (shipments.length === 0 || shipments.some((entry: any) => !entry?.trackingNumber)) {
        throw new ValidationError('Order cannot be marked shipped without a registered tracking number');
      }
      if (shipments.some((entry: any) => !['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(entry.status))) {
        throw new ValidationError('Every seller shipment must be handed to the courier before the order can be marked shipped');
      }
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

  /**
   * Apply OrderDelivered monotonically. A redelivered or late event must not
   * move a completed, returned, or refunded order back to DELIVERED, and an
   * unpaid or cancelled order cannot be delivered at all.
   */
  async handleOrderDelivered(orderId: string, tx?: TxClient) {
    const order = await this.loadOrder(orderId, tx);

    if (DELIVERED_OR_LATER_STATUSES.includes(order.status)) {
      return order;
    }
    if (!DELIVERABLE_STATUSES.includes(order.status)) {
      throw new ValidationError(`Order cannot be marked delivered from status: ${order.status}`);
    }

    return this.withTx(tx, async (client) => {
      const claimed = await client.order.updateMany({
        where: { id: orderId, status: { in: DELIVERABLE_STATUSES } },
        data: { status: 'DELIVERED' },
      });
      if (claimed.count !== 1) {
        // A competing transition won; the next delivery re-evaluates it.
        throw new ConflictError('Order delivery transition was already processed');
      }

      await client.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'DELIVERED',
          note: 'Package delivered to recipient',
          changedBy: 'SYSTEM',
        },
      });

      return client.order.findUniqueOrThrow({ where: { id: orderId } });
    });
  }

  async handleOrderShipped(orderId: string, tx?: TxClient) {
    const order = await this.loadOrder(orderId, tx);
    if (['SHIPPED', ...DELIVERED_OR_LATER_STATUSES].includes(order.status)) return order;
    if (!['PAID', 'PROCESSING', 'PACKED'].includes(order.status)) {
      throw new ValidationError(`Order cannot be marked shipped from status: ${order.status}`);
    }

    return this.withTx(tx, async (client) => {
      const claimed = await client.order.updateMany({
        where: { id: orderId, status: { in: ['PAID', 'PROCESSING', 'PACKED'] } },
        data: { status: 'SHIPPED' },
      });
      if (claimed.count !== 1) return client.order.findUniqueOrThrow({ where: { id: orderId } });

      await client.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'SHIPPED',
          note: 'All seller shipments handed to couriers',
          changedBy: 'SYSTEM',
        },
      });
      return client.order.findUniqueOrThrow({ where: { id: orderId } });
    });
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
    const eventItems = order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.productPrice),
    }));

    const updated = await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: orderId, status: 'DELIVERED' },
        data: {
          status: 'COMPLETED',
          completedAt,
        },
      });
      if (claimed.count !== 1) throw new ConflictError('Order completion was already processed');

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'COMPLETED',
          note: actor === 'SYSTEM' ? 'Auto-completed after 7 days' : 'Completed by customer',
          changedBy: actor,
        },
      });
      await enqueueOrderCompleted(tx, {
        orderId: order.id,
        customerId: order.customerId,
        completedAt: completedAt.toISOString(),
        items: eventItems,
      });

      return tx.order.findUniqueOrThrow({ where: { id: orderId } });
    });

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

    if (order.status === 'RETURN_REQUESTED') {
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

    const previousFulfillmentStatus = order.statusHistory.find(
      (entry) => entry.toStatus === 'RETURN_REQUESTED',
    )?.fromStatus;
    if (action === 'reject' && !['DELIVERED', 'COMPLETED'].includes(previousFulfillmentStatus ?? '')) {
      throw new ValidationError('Could not determine the fulfillment state to restore after rejecting this return');
    }

    // Approval is not proof that money has been returned. Keep the order in an
    // explicit approved-but-unrefunded state until a provider refund succeeds.
    const toStatus = action === 'approve' ? 'RETURN_APPROVED' : previousFulfillmentStatus!;
    const noteText = note || (action === 'approve' ? 'Return request approved; refund remains pending' : 'Return request rejected');

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: toStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus,
          note: noteText,
          changedBy: actor.userId,
        },
      });
    });

    return orderRepository.findById(orderId);
  }

  async confirmReturnReceipt(orderId: string, adminId: string, note?: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    // A retry after a successful confirmation is safe and does not duplicate
    // the audit entry. Later refund states retain the immutable receipt data.
    if (order.returnReceivedAt) return order;
    if (order.status !== 'RETURN_APPROVED') {
      throw new ValidationError(
        `Physical return receipt requires RETURN_APPROVED order. Current status: ${order.status}`,
      );
    }

    const receivedAt = new Date();
    const receiptNote = note?.trim() || 'Physical return received and verified by admin';

    await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: orderId, status: 'RETURN_APPROVED', returnReceivedAt: null },
        data: {
          status: 'RETURN_RECEIVED',
          returnReceivedAt: receivedAt,
          returnReceivedBy: adminId,
          returnReceiptNote: receiptNote,
        },
      });
      if (claimed.count !== 1) {
        throw new ConflictError('Physical return receipt was already confirmed or the order changed');
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: 'RETURN_APPROVED',
          toStatus: 'RETURN_RECEIVED',
          note: receiptNote,
          changedBy: adminId,
        },
      });
    });

    return orderRepository.findById(orderId);
  }

  async markRefundCompleted(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.status === 'REFUNDED') return order;
    if (!['RETURN_RECEIVED', 'PARTIALLY_REFUNDED'].includes(order.status) || !order.returnReceivedAt) {
      throw new ValidationError(`Refund completion requires a physically received return. Current status: ${order.status}`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'REFUNDED' } });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'REFUNDED',
          note: 'Midtrans confirmed the refund with the payment provider',
          changedBy: 'SYSTEM',
        },
      });
    });

    return orderRepository.findById(orderId);
  }

  async markRefundPartial(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.status === 'PARTIALLY_REFUNDED') return order;
    if (order.status !== 'RETURN_RECEIVED' || !order.returnReceivedAt) {
      throw new ValidationError(`Partial refund requires a physically received return. Current status: ${order.status}`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'PARTIALLY_REFUNDED' } });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: 'PARTIALLY_REFUNDED',
          note: 'Midtrans confirmed a partial refund; remaining amount is still due',
          changedBy: 'SYSTEM',
        },
      });
    });
    return orderRepository.findById(orderId);
  }

  async createComplaint(orderId: string, customerId: string, input: { category: string; description: string }) {
    const order = await this.getOrderById(orderId, { userId: customerId, role: 'CUSTOMER' });
    if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
      throw new ValidationError(`A complaint can only be opened for a delivered order. Current status: ${order.status}`);
    }

    const category = input.category?.trim();
    const description = input.description?.trim();
    const allowedCategories = ['DAMAGED', 'MISSING_ITEM', 'WRONG_ITEM', 'QUALITY', 'OTHER'];
    if (!allowedCategories.includes(category)) throw new ValidationError('Invalid complaint category');
    if (!description || description.length < 5 || description.length > 2000) {
      throw new ValidationError('Complaint description must contain 5 to 2000 characters');
    }

    const existing = await prisma.orderComplaint.findUnique({ where: { orderId_customerId: { orderId, customerId } } });
    if (existing) throw new ValidationError('A complaint has already been submitted for this order');
    try {
      return await prisma.orderComplaint.create({
        data: { orderId, customerId, category, description },
        include: { order: { select: { orderNumber: true, status: true } } },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') throw new ConflictError('A complaint has already been submitted for this order');
      throw error;
    }
  }

  async getOrderComplaint(orderId: string, actor: { userId: string; role: string }) {
    await this.getOrderById(orderId, actor);
    return prisma.orderComplaint.findUnique({
      where: { orderId_customerId: { orderId, customerId: actor.userId } },
    });
  }

  async adminListComplaints(query: { page: number; limit: number; status?: string }) {
    const where = query.status ? { status: query.status } : {};
    const [complaints, total] = await Promise.all([
      prisma.orderComplaint.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { order: { select: { orderNumber: true, status: true, customerName: true, customerEmail: true } } },
      }),
      prisma.orderComplaint.count({ where }),
    ]);
    return { complaints, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
  }

  async adminUpdateComplaint(id: string, input: { status: string; adminNote?: string }) {
    const current = await prisma.orderComplaint.findUnique({ where: { id } });
    if (!current) throw new NotFoundError('Complaint not found');
    const allowedNext: Record<string, string[]> = {
      OPEN: ['IN_REVIEW', 'REJECTED'],
      IN_REVIEW: ['RESOLVED', 'REJECTED'],
    };
    if (!allowedNext[current.status]?.includes(input.status)) {
      throw new ValidationError(`Complaint cannot transition from ${current.status} to ${input.status}`);
    }
    const adminNote = input.adminNote?.trim();
    if (adminNote && adminNote.length > 1000) throw new ValidationError('Admin note cannot exceed 1000 characters');
    return prisma.orderComplaint.update({
      where: { id },
      data: {
        status: input.status,
        adminNote: adminNote || null,
        resolvedAt: ['RESOLVED', 'REJECTED'].includes(input.status) ? new Date() : null,
      },
      include: { order: { select: { orderNumber: true, status: true, customerName: true, customerEmail: true } } },
    });
  }
}

export const orderService = new OrderService();
