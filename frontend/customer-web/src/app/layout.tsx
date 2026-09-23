import type { Metadata } from "next";
import { Instrument_Serif, Hanken_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXA — Editorial E-Commerce Storefront",
  description: "Sebuah kurasi premium produk sandang, kerajinan tanah liat, dan wewangian alam Nusantara. Didesain dengan estetika modern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${hankenGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-ink-primary font-sans">
        <QueryProvider>
          <Header />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
