import type { Metadata } from "next";
import { pageMetadata } from "../../seo";
import { notFound } from "next/navigation";
import AdUnit from "../../components/AdUnit";
import {
  GUIDE_ARTICLES,
  getGuideArticle,
} from "../articles";
import Calendar from "../../design/calendar/Calendar";
import { getOffers } from "../../design/calendar/data";
import calendarStyles from "../../design/calendar/calendar.module.css";
import JsonLd from "../../components/JsonLd";
import { SITE_URL } from "../../siteConfig";
import GuideList from "../GuideList";
import Article from "../../design/guides/Article";
import { guideConfigs } from "../../design/guides/config";

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((article) => ({ articleId: article.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleId: string }>;
}): Promise<Metadata> {
  const { articleId } = await params;
  const article = getGuideArticle(articleId);
  if (!article) return { title: "記事が見つかりません" };
  return pageMetadata(`/guide/${article.id}/`, article.title, article.description);
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;
  const article = getGuideArticle(articleId);
  if (!article) notFound();

  const otherArticles = GUIDE_ARTICLES.filter((a) => a.id !== article.id);

  if (article.id === "calendar") return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "店舗一覧", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: article.title, item: `${SITE_URL}/guide/calendar/` },
    ] }}/>
    <Calendar offers={getOffers()} relatedGuides={<>
      <section className={calendarStyles.relatedGuides}><h2>ほかのお得ガイド</h2><GuideList articles={otherArticles}/></section>
      <AdUnit/>
    </>}/>
  </>;

  if (!Object.hasOwn(guideConfigs, article.id)) notFound();
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "店舗一覧", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: article.title, item: `${SITE_URL}/guide/${article.id}/` },
    ] }}/>
    <Article article={article}/>
  </>;
}
