import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "./siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "お得な支払い方法チェッカー",
  description: "店舗を選ぶと一番お得な支払い方法が分かります",
  // Google Search Consoleの所有権確認用（HTMLタグ方式）。
  verification: {
    google: "mNgKS6YoEkof-bqcn8TIRFbtgF77PfYj_KZoPcw4_5I",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
