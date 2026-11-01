import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStoreIdEntries, getStoreByStoreId } from "../../storeIds";
import { pageMetadata } from "../../seo";
import Breadcrumbs from "../../components/Breadcrumbs";
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

  const title = `${store.店舗}の支払い方法｜カード・QR決済と還元率比較`;

  // 使えると確認できているQRコード決済の名前を、説明文に入れる（使えない店舗に「PayPay」と書かないため）。
  const qrOk = acceptance[store.店舗]?.QRコード決済?.使える ?? [];
  const qrNames = ["PayPay", "d払い", "楽天ペイ"].filter((name) => qrOk.includes(name));
  const listPhrase =
    qrNames.length >= 2
      ? `${qrNames.join("・")}など使える決済一覧`
      : "使える決済・使えない決済の一覧";
  const description = `${store.店舗}で使える支払い方法（${listPhrase}）を確認。カード・QR決済の還元条件、特定日特典、登録した支払い方法での比較を紹介します。店舗ごとの対象外条件もご確認ください。`;

  return pageMetadata(`/store/${storeId}/`, title, description);
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
      breadcrumb={<Breadcrumbs name={store.店舗} path={`/store/${storeId}/`} />}
      acceptance={<AcceptanceSection storeName={store.店舗} />}
    />
  );
}
