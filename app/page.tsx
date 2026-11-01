import type { Metadata } from "next";
import HomeClient from "./design/HomePreview";
import styles from "./design/preview.module.css";
import { categoryOrder } from "./data";
import { getAllStoreIdEntries } from "./storeIds";
import { pageMetadata } from "./seo";

export const metadata: Metadata = pageMetadata(
  "/",
  "お支払いナビ｜店舗別の支払い方法・還元率比較",
  "コンビニ・スーパー・飲食店などの支払い方法を店舗名で検索。カード・QR決済の対応状況、還元率の適用条件、特典日を比較できます。",
);

export default function Home() {
  const entries = getAllStoreIdEntries();
  // 全店舗の長い解説・全候補をクライアントへ配信せず、一覧と特典日に必要な項目だけを渡す。
  const stores = entries.map(({ store, storeId }) => ({
    name: store.店舗, storeId, category: store.カテゴリ, points: store.共通ポイント,
  }));
  const deals = entries.flatMap(({ store, storeId }) => store.候補
    .filter((candidate) => candidate.特定日限定 && candidate.対象日条件)
    .map((candidate) => ({ store: store.店舗, storeId, card: candidate.カード, rate: candidate.還元率, dateCondition: candidate.対象日条件!, summary: candidate.条件要約, note: candidate.注意 })));
  return <div className={styles.shell}><HomeClient stores={stores} categories={[...categoryOrder]} deals={deals} /></div>;
}
