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
    title: "ウエル活のやり方【2026年最新】毎月20日に1.5倍で買う手順",
    description:
      "ウエルシアで毎月20日にWAON POINTを使うと、実質33%引き相当（1.5倍）で買えるウエル活のやり方を解説。準備・当日の手順・よくある失敗・似た特典がある他店まで。",
    summary: "毎月20日、ポイントが1.5倍の価値になる使い方",
  },
  {
    id: "touch-payment",
    title: "スマホのタッチ決済とは？還元率が7%になる仕組みと注意点",
    description:
      "三井住友カードの7%還元は「スマホのタッチ決済」が対象。カードを差し込む決済との違い、Apple Pay・Google Payの設定方法、1万円の条件、対象店舗をまとめました。",
    summary: "7%還元の条件と、Apple Pay・Google Payの設定方法",
  },
  {
    id: "calendar",
    title: "お得な日カレンダー【毎月版】特典日がある店舗まとめ",
    description:
      "毎月・毎週の特典日がある店舗を日付順にまとめたカレンダー。ウエルシア20日、イオン20・30日、ローソン10・20日など。今日が特典日の店舗もひと目で分かります。",
    summary: "毎月の特典日を日付順に一覧。今日の特典日も分かる",
  },
];

export function getGuideArticle(id: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((article) => article.id === id);
}

export const GUIDE_DISCLAIMER =
  "情報は2026年10月時点のものです。最新の情報は各社の公式サイトでご確認ください。";
