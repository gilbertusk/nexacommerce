"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore } from "@/lib/store/useUserStore";
import { useAddresses, useUserProfile, useUpdateProfile } from "@/lib/api/hooks/useProfile";
import EmptyState from "@/components/ui/EmptyState";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useUserStore();

  const { data: profileData, isLoading } = useUserProfile();
  const { data: addressesData } = useAddresses();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState("");

  if (!user) {
    return (
      <div className="py-20">
        <EmptyState
          icon="lock"
          title="Login Diperlukan"
          description="Anda harus masuk ke akun Anda terlebih dahulu untuk melihat profil."
          actionLabel="Login Sekarang"
          actionHref="/auth/login?redirect=/profile"
        />
      </div>
    );
  }

  const profile = profileData?.data?.user;
  const addresses = addressesData?.data?.addresses ?? [];

  const handleStartEdit = () => {
    setEditName(profile?.name ?? user.name);
    setEditPhone(profile?.phone ?? "");
    setIsEditing(true);
    setUpdateSuccess(false);
    setUpdateError("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      await updateProfile.mutateAsync({
        name: editName,
        phone: editPhone,
      });
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Gagal memperbarui profil.");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Page Header */}
      <div className="border-b border-hairline pb-8 mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-2">
          Profil Saya
        </h1>
        <p className="text-xs text-ink-secondary">
          Kelola rincian akun dan preferensi pengiriman Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Profile Card (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface border border-hairline p-6 rounded-sm">
            <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-4 pb-2 border-b border-hairline">
              Detail Akun
            </h3>

            {isLoading ? (
              <div className="flex flex-col gap-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-paper" />
                <div className="h-4 w-2/3 bg-paper rounded-xs" />
                <div className="h-3 w-1/2 bg-paper rounded-xs" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-primary border border-hairline">
                    <span className="material-symbols-outlined text-2xl">account_circle</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-ink-primary">{profile?.name ?? user.name}</span>
                    <span className="text-[10px] text-ink-secondary">{profile?.email ?? user.email}</span>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="flex flex-col gap-3 text-xs text-ink-secondary">
                    <div className="flex justify-between items-center py-1.5 border-b border-hairline/60">
                      <span>Peran Akun</span>
                      <span className="font-semibold text-ink-primary uppercase tracking-wider">{profile?.role ?? user.role}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex justify-between items-center py-1.5 border-b border-hairline/60">
                        <span>Telepon</span>
                        <span className="font-mono text-ink-primary">{profile.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1.5 border-b border-hairline/60">
                      <span>Status</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">verified</span> Terverifikasi
                      </span>
                    </div>

                    {updateSuccess && (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] px-2 py-1.5 rounded-sm font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check</span>
                        Profil berhasil diperbarui.
                      </div>
                    )}

                    <button
                      onClick={handleStartEdit}
                      className="mt-2 bg-surface hover:bg-paper text-ink-primary text-[10px] uppercase font-bold tracking-widest py-2.5 rounded-xs border border-hairline transition-colors cursor-pointer"
                    >
                      Edit Profil
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">Nama Lengkap</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-paper text-xs text-ink-primary px-3 py-2 w-full focus:outline-hidden rounded-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">Nomor Telepon</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="bg-paper text-xs text-ink-primary px-3 py-2 w-full focus:outline-hidden rounded-xs"
                      />
                    </div>

                    {updateError && (
                      <p className="text-[10px] text-rose-800 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {updateError}
                      </p>
                    )}

                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-surface text-ink-primary text-[10px] uppercase font-bold py-2 border border-hairline rounded-xs"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={updateProfile.isPending}
                        className="flex-1 bg-primary text-white text-[10px] uppercase font-bold py-2 rounded-xs disabled:opacity-50"
                      >
                        {updateProfile.isPending ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-surface border border-hairline p-6 rounded-sm flex flex-col gap-2">
            <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-2 pb-2 border-b border-hairline">
              Menu Cepat
            </h3>
            {[
              { href: "/orders", icon: "receipt_long", label: "Riwayat Pesanan" },
              { href: "/wishlist", icon: "favorite", label: "Wishlist Saya" },
              { href: "/addresses", icon: "location_on", label: "Buku Alamat" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 py-2 text-xs text-ink-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-ink-secondary">{item.icon}</span>
                <span>{item.label}</span>
                <span className="material-symbols-outlined text-xs ml-auto text-ink-secondary">chevron_right</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 py-2 text-xs text-rose-700 hover:text-rose-900 transition-colors mt-1 pt-3 border-t border-hairline cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>

        {/* Right Side: Address Preview (col-span-8) */}
        <div className="lg:col-span-8 bg-surface border border-hairline p-6 md:p-8 rounded-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-2xl text-ink-primary">Buku Alamat</h3>
            <Link
              href="/addresses"
              className="text-xs uppercase font-bold tracking-widest text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">manage_accounts</span>
              Kelola Alamat
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-paper animate-pulse rounded-xs" />
              ))}
            </div>
          ) : addresses.length > 0 ? (
            <div className="flex flex-col gap-4">
              {addresses.slice(0, 3).map((addr) => (
                <div key={addr.id} className="bg-surface p-4 border border-hairline rounded-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-ink-primary">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="bg-primary/10 text-primary text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm">Default</span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-ink-primary mt-2">{addr.receiverName}</h4>
                  <span className="font-mono text-xs text-ink-secondary mt-0.5 block tabular-nums">{addr.phoneNumber}</span>
                  <p className="text-xs text-ink-secondary leading-relaxed mt-2 max-w-xl">
                    {addr.street}, {addr.city}, {addr.province}, {addr.postalCode}
                  </p>
                </div>
              ))}
              {addresses.length > 3 && (
                <Link href="/addresses" className="text-xs text-primary hover:underline font-semibold">
                  Lihat semua {addresses.length} alamat →
                </Link>
              )}
            </div>
          ) : (
            <div className="py-8 text-center bg-paper/20 rounded-xs">
              <p className="text-xs text-ink-secondary mb-3">Belum ada alamat pengiriman tersimpan.</p>
              <Link
                href="/addresses"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Tambah Alamat Pertama
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
