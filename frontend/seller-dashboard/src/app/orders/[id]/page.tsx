'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPatch } from '@/lib/api/client';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  subtotal?: number;
  product?: {
    id: string;
    name: string;
    images?: string[];
    image?: string;
  };
  productName?: string;
  productImage?: string;
}

interface ShippingAddress {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  fullAddress?: string;
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  total: number;
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
  };
  customerName?: string;
  shippingAddress?: ShippingAddress;
  items?: OrderItem[];
  shipping?: {
    courier?: string;
    service?: string;
    trackingNumber?: string;
    status?: string;
  };
}

interface OrderResponse {
  success: boolean;
  data: Order | { order: Order };
  message?: string;
}

interface ShippingOrder {
  orderId: string;
  trackingNumber?: string | null;
  courierName?: string;
  serviceName?: string;
  status: string;
}

interface ShippingResponse {
  success: boolean;
  data: ShippingOrder;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PAID: 'Pembayaran Diterima',
  PROCESSING: 'Sedang Diproses',
  SHIPPED: 'Dalam Pengiriman',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-stone-50 text-stone-600',
  PAID: 'bg-teal-50 text-teal-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-orange-50 text-orange-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const STATUS_TIMELINE = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { token } = useSellerStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [shipment, setShipment] = useState<ShippingOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!token || !orderId) return;

    async function fetchOrder() {
      setIsLoading(true);
      setError('');
      try {
        const res = await apiGet<OrderResponse>(
          `/api/v1/orders/${orderId}`,
          token!,
        );
        if (res.success) {
          const raw = res.data;
          const o: Order = 'id' in raw ? raw : (raw as { order: Order }).order;
          setOrder(o);
          try {
            const shippingRes = await apiGet<ShippingResponse>(
              `/api/v1/shipping/${encodeURIComponent(orderId)}`,
              token!,
            );
            setShipment(shippingRes.data);
          } catch {
            setShipment(null);
          }
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Gagal memuat detail pesanan.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [token, orderId]);

  async function updateStatus(newStatus: 'PROCESSING' | 'SHIPPED') {
    if (!token || !order) return;
    setIsUpdating(true);
    setActionError('');
    try {
      if (newStatus === 'SHIPPED') {
        if (!shipment?.trackingNumber) {
          throw new Error('Pesanan belum memiliki nomor tracking dari layanan pengiriman.');
        }

        if (shipment.status === 'WAITING_PICKUP') {
          const shippingRes = await apiPatch<ShippingResponse>(
            `/api/v1/shipping/${encodeURIComponent(orderId)}/status`,
            {
              status: 'PICKED_UP',
              location: order.shippingAddress?.city,
              note: 'Paket diserahkan ke kurir oleh penjual',
            },
            token,
          );
          setShipment(shippingRes.data);
        } else if (!['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(shipment.status)) {
          throw new Error(`Shipment belum dapat dikirim dari status ${shipment.status}.`);
        }
      }

      await apiPatch(
        `/api/v1/orders/${orderId}/status`,
        { status: newStatus },
        token,
      );
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Gagal memperbarui status.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-paper animate-pulse rounded-sm" />
          <div className="h-8 w-48 bg-paper animate-pulse rounded-xs" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white hairline rounded-sm p-6">
              <div className="h-4 w-24 bg-paper animate-pulse rounded-xs mb-4" />
              {[...Array(3)].map((__, j) => (
                <div
                  key={j}
                  className="h-3 w-full bg-paper animate-pulse rounded-xs mb-2"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col gap-4 max-w-4xl">
        <Link
          href="/orders"
          className="flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors w-fit"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Kembali ke Pesanan
        </Link>
        <div className="bg-red-50 hairline border-red-200 rounded-sm p-6 text-sm text-red-700">
          {error || 'Pesanan tidak ditemukan.'}
        </div>
      </div>
    );
  }

  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const statusColor = STATUS_COLORS[order.status] ?? 'bg-stone-50 text-stone-600';
  const currentTimelineIdx = STATUS_TIMELINE.indexOf(order.status);
  const subtotal = order.subtotal ?? order.items?.reduce((s, item) => s + (item.subtotal ?? item.price * item.quantity), 0) ?? 0;
  const shippingCost = order.shippingCost ?? 0;
  const discount = order.discount ?? 0;
  const canHandOffShipment = Boolean(
    shipment?.trackingNumber
    && ['WAITING_PICKUP', 'PICKED_UP', 'IN_TRANSIT'].includes(shipment.status),
  );

  const addr = order.shippingAddress;
  const addressStr = addr?.fullAddress ?? [
    addr?.address,
    addr?.city,
    addr?.province,
    addr?.postalCode,
  ].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="w-8 h-8 flex items-center justify-center hairline rounded-sm hover:bg-surface transition-colors text-ink-secondary"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
          </Link>
          <div>
            <h1 className="text-2xl font-serif text-ink-primary">
              Pesanan #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-ink-secondary">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-sm text-xs uppercase tracking-widest font-bold ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-sm">error</span>
          {actionError}
        </div>
      )}

      {/* Status Timeline */}
      <div className="bg-white hairline rounded-sm p-6">
        <h2 className="font-serif text-base text-ink-primary mb-4">
          Timeline Pesanan
        </h2>
        <div className="flex items-center gap-0">
          {STATUS_TIMELINE.map((status, idx) => {
            const isPast = currentTimelineIdx >= idx;
            const isCurrent = currentTimelineIdx === idx;
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div key={status} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      isCancelled && isCurrent
                        ? 'bg-red-600 text-white'
                        : isPast && !isCancelled
                          ? 'bg-primary text-white'
                          : 'bg-paper hairline text-ink-secondary'
                    }`}
                  >
                    {isPast && !isCancelled ? (
                      <span className="material-symbols-outlined text-sm">
                        check
                      </span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-[10px] text-ink-secondary text-center whitespace-nowrap">
                    {STATUS_LABELS[status]?.split(' ')[0]}
                  </span>
                </div>
                {idx < STATUS_TIMELINE.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-4 ${
                      currentTimelineIdx > idx && !isCancelled
                        ? 'bg-primary'
                        : 'bg-hairline'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3 flex-wrap">
          {order.status === 'PAID' && (
            <button
              onClick={() => updateStatus('PROCESSING')}
              disabled={isUpdating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-sm transition-colors flex items-center gap-2"
            >
              {isUpdating ? (
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-sm">
                  play_arrow
                </span>
              )}
              Proses Pesanan
            </button>
          )}
          {order.status === 'PROCESSING' && (
            <>
            <button
              onClick={() => updateStatus('SHIPPED')}
              disabled={isUpdating || !canHandOffShipment}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold rounded-sm transition-colors flex items-center gap-2"
            >
              {isUpdating ? (
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-sm">
                  local_shipping
                </span>
              )}
              Serahkan ke Kurir
            </button>
            {!canHandOffShipment && (
              <p role="status" className="self-center text-xs text-amber-900">
                Shipment aktif dan nomor tracking diperlukan sebelum status pesanan dapat diubah.
              </p>
            )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white hairline rounded-sm p-6">
          <h2 className="font-serif text-base text-ink-primary mb-4 hairline-b pb-3">
            Informasi Pelanggan
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex gap-3">
              <span className="text-ink-secondary w-20 shrink-0">Nama</span>
              <span className="text-ink-primary font-medium">
                {order.customerName ?? order.customer?.name ?? '—'}
              </span>
            </div>
            {(order.customer?.phone ?? addr?.phone) && (
              <div className="flex gap-3">
                <span className="text-ink-secondary w-20 shrink-0">
                  Telepon
                </span>
                <span className="text-ink-primary">
                  {order.customer?.phone ?? addr?.phone}
                </span>
              </div>
            )}
            {order.customer?.email && (
              <div className="flex gap-3">
                <span className="text-ink-secondary w-20 shrink-0">Email</span>
                <span className="text-ink-primary">
                  {order.customer.email}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white hairline rounded-sm p-6">
          <h2 className="font-serif text-base text-ink-primary mb-4 hairline-b pb-3">
            Alamat Pengiriman
          </h2>
          <div className="text-sm text-ink-primary">
            {addr?.name && (
              <p className="font-medium mb-1">{addr.name}</p>
            )}
            <p className="text-ink-secondary leading-relaxed">
              {addressStr || 'Alamat tidak tersedia'}
            </p>
          </div>

          {/* Shipping Info */}
          {(shipment || order.shipping) && (
            <div className="mt-4 pt-4 hairline-t flex flex-col gap-1.5 text-sm">
              {(shipment?.courierName || order.shipping?.courier) && (
                <div className="flex gap-3">
                  <span className="text-ink-secondary w-24 shrink-0">
                    Kurir
                  </span>
                  <span className="text-ink-primary">
                    {shipment?.courierName ?? order.shipping?.courier}
                    {(shipment?.serviceName ?? order.shipping?.service)
                      ? ` — ${shipment?.serviceName ?? order.shipping?.service}`
                      : ''}
                  </span>
                </div>
              )}
              {(shipment?.trackingNumber ?? order.shipping?.trackingNumber) && (
                <div className="flex gap-3">
                  <span className="text-ink-secondary w-24 shrink-0">
                    No. Resi
                  </span>
                  <span className="text-ink-primary font-mono">
                    {shipment?.trackingNumber ?? order.shipping?.trackingNumber}
                  </span>
                </div>
              )}
              {shipment?.status && (
                <div className="flex gap-3">
                  <span className="text-ink-secondary w-24 shrink-0">Status kirim</span>
                  <span className="text-ink-primary">{shipment.status}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white hairline rounded-sm">
        <div className="p-5 hairline-b">
          <h2 className="font-serif text-base text-ink-primary">
            Item Pesanan
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="hairline-b">
                <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 px-5 pr-5">
                  Produk
                </th>
                <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-5">
                  Harga
                </th>
                <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-5">
                  Qty
                </th>
                <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-5">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {order.items?.map((item) => {
                const imageUrl =
                  item.product?.images?.[0] ??
                  item.product?.image ??
                  item.productImage ??
                  null;
                const name =
                  item.product?.name ?? item.productName ?? 'Produk';
                const itemSubtotal =
                  item.subtotal ?? item.price * item.quantity;

                return (
                  <tr key={item.id} className="hover:bg-surface transition-colors">
                    <td className="py-3 px-5 pr-5">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-12 h-12 object-cover rounded-sm hairline"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-surface hairline rounded-sm flex items-center justify-center">
                            <span className="material-symbols-outlined text-ink-secondary text-sm">
                              image
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-ink-primary">
                          {name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-5 text-right tabular-nums text-ink-secondary">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="py-3 pr-5 text-right tabular-nums text-ink-primary">
                      {item.quantity}
                    </td>
                    <td className="py-3 pr-5 text-right tabular-nums font-medium text-ink-primary">
                      {formatRupiah(itemSubtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Breakdown */}
        <div className="p-5 hairline-t">
          <div className="ml-auto max-w-xs flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-secondary">Subtotal</span>
              <span className="tabular-nums text-ink-primary">
                {formatRupiah(subtotal)}
              </span>
            </div>
            {shippingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-secondary">Biaya Pengiriman</span>
                <span className="tabular-nums text-ink-primary">
                  {formatRupiah(shippingCost)}
                </span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-secondary">Diskon</span>
                <span className="tabular-nums text-green-700">
                  −{formatRupiah(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between hairline-t pt-2 font-bold">
              <span className="text-ink-primary">Total</span>
              <span className="tabular-nums text-ink-primary text-base font-serif">
                {formatRupiah(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
