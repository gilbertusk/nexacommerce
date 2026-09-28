import { describe, expect, it } from "vitest";
import { normalizeOrder, type RawOrder } from "../useOrders";

describe("normalizeOrder", () => {
  it("maps the order-service database response into the customer view model", () => {
    const raw: RawOrder = {
      id: "order-1",
      status: "PENDING_PAYMENT",
      grandTotal: "125000.00",
      subtotal: "120000.00",
      shippingCost: "5000.00",
      discount: "0.00",
      items: [{
        productId: "product-1",
        productName: "Kemeja",
        productPrice: "120000.00",
        quantity: 1,
        productImage: "/kemeja.jpg",
        sellerId: "seller-1",
      }],
      shippingAddress: {
        recipientName: "Ayu",
        phone: "0812345678",
        street: "Jalan Melati 1",
        city: "Bandung",
        province: "Jawa Barat",
        postalCode: "40111",
      },
      courierName: "JNE",
      courierService: "REG",
      statusHistory: [{ id: "event-1", toStatus: "PENDING_PAYMENT", createdAt: "2026-09-23T00:00:00.000Z" }],
    };

    expect(normalizeOrder(raw)).toMatchObject({
      id: "order-1",
      status: "PENDING_PAYMENT",
      total: 125000,
      shippingCost: 5000,
      items: [{ productId: "product-1", name: "Kemeja", price: 120000, qty: 1, image: "/kemeja.jpg" }],
      address: { receiverName: "Ayu", phoneNumber: "0812345678", city: "Bandung" },
      shippingInfo: { courier: "JNE", service: "REG", cost: 5000 },
      timeline: [{ title: "PENDING_PAYMENT", isActive: true }],
    });
  });

  it("keeps one post-checkout tracking card per seller and merges live labels", () => {
    const raw: RawOrder = {
      id: "order-split",
      status: "PROCESSING",
      grandTotal: 150000,
      subtotal: 110000,
      shippingCost: 40000,
      discount: 0,
      items: [],
      shipmentBreakdown: [
        { sellerId: "seller-a", storeName: "Toko A", originCity: "Bandung", courierName: "JNE", serviceCode: "REG", cost: 18000 },
        { sellerId: "seller-b", storeName: "Toko B", originCity: "Bogor", courierName: "SiCepat", serviceCode: "BEST", cost: 22000 },
      ],
    };

    const normalized = normalizeOrder(raw, [
      { sellerId: "seller-a", courierName: "JNE", serviceCode: "REG", serviceName: "Regular", cost: 18000, trackingNumber: "TRACK-A", status: "PICKED_UP" },
      { sellerId: "seller-b", courierName: "SiCepat", serviceCode: "BEST", serviceName: "Besok Sampai", cost: 22000, trackingNumber: "TRACK-B", status: "WAITING_PICKUP" },
    ]);

    expect(normalized.shipments).toEqual([
      expect.objectContaining({ sellerId: "seller-a", storeName: "Toko A", trackingNumber: "TRACK-A", status: "PICKED_UP" }),
      expect.objectContaining({ sellerId: "seller-b", storeName: "Toko B", trackingNumber: "TRACK-B", status: "WAITING_PICKUP" }),
    ]);
  });
});
