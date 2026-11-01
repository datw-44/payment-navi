// 「お得ガイド」の記事一覧。URLは /guide/[id]/ 。
export type GuideArticle = {
  id: string;
  // ページのtitle（h1にも使う）
  title: string;
  // meta description
  description: string;
  // トップページ・店舗ページの一覧に出す短い説明
  summary: string;
};

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    id: "welcatsu",
    title: "ウエル活のやり方｜毎月20日に必要な準備と利用条件",
    description:
      "ウエルシアのお客様感謝デーでWAON POINTを使うための準備、利用条件、当日の手順、対象外商品への注意を解説します。",
    summary: "毎月20日、ポイントが1.5倍の価値になる使い方",
  },
  {
    id: "touch-payment",
    title: "スマホのタッチ決済とは？三井住友カードの条件と注意点",
    description:
      "三井住友カードの対象店舗と支払い条件を解説。スマホとカード現物のタッチ決済の違い、Apple Pay・Google Payの注意点、端末の金額上限を確認できます。",
    summary: "スマホのタッチ決済の条件と、支払い方法の違い",
  },
  {
    id: "calendar",
    title: "お得な日カレンダー【毎月版】特典日がある店舗まとめ",
    description:
      "店舗ごとの毎月・毎週の特典日を一覧で確認。対象日、支払い条件、店舗ページをチェックできます。開催状況は各社公式案内もご確認ください。",
    summary: "毎月の特典日を日付順に一覧。今日の特典日も分かる",
  },
];

export function getGuideArticle(id: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((article) => article.id === id);
}

export const GUIDE_DISCLAIMER =
  "情報は2026年10月時点のものです。最新の情報は各社の公式サイトでご確認ください。";
