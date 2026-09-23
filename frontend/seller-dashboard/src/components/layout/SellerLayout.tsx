"use client";

import React from "react";
import Sidebar from "./Sidebar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface font-sans text-ink-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white hairline-b flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          <div className="flex-1 max-w-lg">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-ink-secondary text-lg">search</span>
              <input 
                type="text" 
                placeholder="Cari pesanan, produk, atau laporan..." 
                className="w-full pl-10 pr-4 py-2 bg-surface hairline rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="w-8 h-8 flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
