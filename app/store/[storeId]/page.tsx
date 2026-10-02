import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStoreIdEntries, getStoreByStoreId } from "../../storeIds";
import { formatRateHeadline, parseRateValue } from "../../utils";
import StoreDetailClient from "./StoreDetailClient";
import AcceptanceSection from "../../components/AcceptanceSection";
import { acceptance } from "../../acceptance";

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

  const title = `${store.店舗}で使える支払い方法と一番お得な払い方【2026年最新】`;

  // 使えると確認できているQRコード決済の名前を、説明文に入れる（使えない店舗に「PayPay」と書かないため）。
  const qrOk = acceptance[store.店舗]?.QRコード決済?.使える ?? [];
  const qrNames = ["PayPay", "d払い", "楽天ペイ"].filter((name) => qrOk.includes(name));
  const listPhrase =
    qrNames.length >= 2
      ? `${qrNames.join("・")}など使える決済一覧`
      : "使える決済・使えない決済の一覧";
  const description = top
    ? `${store.店舗}で使える支払い方法（${listPhrase}）と、還元率が高い順のランキング。1位は${top.カード}（${formatRateHeadline(top.還元率)}）`
    : `${store.店舗}で使える支払い方法（${listPhrase}）と、お得な払い方をランキングで比較。`;

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

  return (
    <StoreDetailClient
      store={store}
      acceptance={<AcceptanceSection storeName={store.店舗} />}
    />
  );
}
