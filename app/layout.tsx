import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_NAME, SITE_URL, OPERATOR_NAME } from "./siteConfig";
import JsonLd from "./components/JsonLd";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "お支払いナビ",
  description: "店舗ごとの支払い方法、還元率の条件、特典日を比較できます",
  robots: { index: true, follow: true },
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
      <head>
        {/* Google AdSense 審査用コード。next/scriptだと静的HTMLに実タグが出ないため、素のscriptタグで全ページのheadに出力する */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4177347832172841"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <JsonLd data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": `${SITE_URL}/#publisher`, name: OPERATOR_NAME },
            { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: SITE_NAME,
              inLanguage: "ja", publisher: { "@id": `${SITE_URL}/#publisher` } },
          ],
        }} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
