import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStoreIdEntries, getStoreByStoreId } from "../../storeIds";
import { formatRateHeadline, parseRateValue } from "../../utils";
import StoreDetailClient from "./StoreDetailClient";

export function generateStaticParams() {
  return getAllStoreIdEntries().map(({ storeId }) => ({ storeId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeId: string }>;
}): Promise<Metadata> {
  const { storeId } = await params;
  const store = getStoreByStoreId(storeId);
  if (!store) {
    return { title: "店舗が見つかりません" };
  }

  const sorted = [...store.候補].sort(
    (a, b) => parseRateValue(b.還元率) - parseRateValue(a.還元率)
  );
  const top = sorted[0];

  const title = `${store.店舗}で一番お得な支払い方法【2026年最新】`;
  const description = top
    ? `${store.店舗}で還元率が高い支払い方法をランキングで比較。1位は${top.カード}（${formatRateHeadline(top.還元率)}）`
    : `${store.店舗}で使えるお得な支払い方法をランキングで比較。`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const store = getStoreByStoreId(storeId);
  if (!store) {
    notFound();
  }

  return <StoreDetailClient store={store} />;
}
