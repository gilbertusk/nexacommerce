"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/store/useAdminStore";

interface PlatformConfig {
  siteName: string;
  maintenanceMode: boolean;
  maxFileSize: string;
  defaultCurrency: string;
  defaultLanguage: string;
  commissionRate: string;
  minWithdrawal: string;
}

const DEFAULT_CONFIG: PlatformConfig = {
  siteName: "NexaCommerce",
  maintenanceMode: false,
  maxFileSize: "5",
  defaultCurrency: "IDR",
  defaultLanguage: "id",
  commissionRate: "5",
  minWithdrawal: "100000",
};

export default function SettingsPage() {
  const admin = useAdminStore((s) => s.admin);
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(key: keyof PlatformConfig, value: string | boolean) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Pengaturan Platform</h1>
        <p className="text-sm text-ink-secondary">Konfigurasi dan parameter global NexaCommerce.</p>
      </div>

      {/* Admin Profile */}
      <div className="bg-white hairline rounded-sm">
        <div className="p-5 hairline-b">
          <h2 className="text-sm font-bold text-ink-primary">Profil Administrator</h2>
        </div>
        <div className="p-5 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-ink-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-2xl">shield_person</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-ink-primary">{admin?.name ?? "System Admin"}</p>
            <p className="text-sm text-ink-secondary">{admin?.email ?? "—"}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold bg-paper text-primary mt-1 w-fit">
              {admin?.role ?? "ADMIN"}
            </span>
          </div>
        </div>
      </div>

      {/* Platform Config */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="bg-white hairline rounded-sm">
          <div className="p-5 hairline-b">
            <h2 className="text-sm font-bold text-ink-primary">Konfigurasi Umum</h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Nama Platform
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Mata Uang Default
              </label>
              <select
                value={config.defaultCurrency}
                onChange={(e) => handleChange("defaultCurrency", e.target.value)}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="IDR">IDR — Rupiah</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Bahasa Default
              </label>
              <select
                value={config.defaultLanguage}
                onChange={(e) => handleChange("defaultLanguage", e.target.value)}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2 hairline-t mt-2">
              <div>
                <p className="text-sm font-medium text-ink-primary">Mode Pemeliharaan</p>
                <p className="text-xs text-ink-secondary mt-0.5">Platform tidak dapat diakses selain admin.</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange("maintenanceMode", !config.maintenanceMode)}
                className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${config.maintenanceMode ? "bg-primary" : "bg-hairline"}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${config.maintenanceMode ? "translate-x-5" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white hairline rounded-sm">
          <div className="p-5 hairline-b">
            <h2 className="text-sm font-bold text-ink-primary">Konfigurasi Bisnis</h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Komisi Platform (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={config.commissionRate}
                onChange={(e) => handleChange("commissionRate", e.target.value)}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[10px] text-ink-secondary">Persentase komisi dari setiap transaksi.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Minimum Penarikan (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={config.minWithdrawal}
                onChange={(e) => handleChange("minWithdrawal", e.target.value)}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Ukuran File Maksimum (MB)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={config.maxFileSize}
                onChange={(e) => handleChange("maxFileSize", e.target.value)}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-sm text-sm hairline bg-green-50 text-green-700 border-green-200">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Pengaturan berhasil disimpan.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-ink-primary text-white rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-ink-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Pengaturan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
