"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// 店舗ページの解説文の下に1箇所だけ表示するAdSense広告ユニット（記事下）。
// adsbygoogle.js自体はapp/layout.tsxで全ページ共通で読み込み済みのため、
// ここでは広告枠（ins）の描画と、マウント時の1回だけのpush呼び出しのみ行う。
export default function AdUnit() {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // 広告ブロッカー等でadsbygoogleが読み込めない場合は何もしない
    }
  }, []);

  return (
    <div className="ad-slot">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4177347832172841"
        data-ad-slot="5796298256"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
