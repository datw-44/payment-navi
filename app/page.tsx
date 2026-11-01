import type { Metadata } from "next";
import HomeClient from "./HomeClient";
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
    .map((candidate) => ({
      店舗: store.店舗,
      storeId,
      candidate: { カード: candidate.カード, 還元率: candidate.還元率, 対象日条件: candidate.対象日条件! },
    })));
  return <HomeClient stores={stores} categories={[...categoryOrder]} deals={deals} />;
}
