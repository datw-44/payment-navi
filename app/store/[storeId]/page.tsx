import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStoreIdEntries, getStoreByStoreId } from "../../storeIds";
import { pageMetadata } from "../../seo";
import Link from "next/link";
import { GUIDE_ARTICLES } from "../../guide/articles";
import { getRelatedGuideIds } from "../../guide/related";
import JsonLd from "../../components/JsonLd";
import { SITE_URL } from "../../siteConfig";
import StoreGuide from "../../design/store-guide/StoreGuide";
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

  const relatedGuides = GUIDE_ARTICLES.filter((article) => getRelatedGuideIds(store).includes(article.id));
  const support = acceptance[store.店舗];
  const hasAcceptance = Boolean(support && Object.values(support).some((group) =>
    (group?.使える?.length ?? 0) + (group?.使えない?.length ?? 0) > 0));

  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "店舗一覧", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: store.店舗, item: `${SITE_URL}/store/${storeId}/` },
      ],
    }}/>
    <StoreGuide store={store} hasAcceptance={hasAcceptance}
      acceptance={<AcceptanceSection storeName={store.店舗}/>}
      relatedGuides={!!relatedGuides.length && <nav aria-label="関連ガイド">{relatedGuides.map((article) =>
        <p key={article.id}><Link href={`/guide/${article.id}/`}>{article.title} ↗</Link></p>
      )}</nav>}/>
  </>;
}
