import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "../../seo";
import Breadcrumbs from "../../components/Breadcrumbs";
import { notFound } from "next/navigation";
import AdUnit from "../../components/AdUnit";
import {
  GUIDE_ARTICLES,
  GUIDE_DISCLAIMER,
  getGuideArticle,
} from "../articles";
import Calendar from "../../design/calendar/Calendar";
import { getOffers } from "../../design/calendar/data";
import calendarStyles from "../../design/calendar/calendar.module.css";
import JsonLd from "../../components/JsonLd";
import { SITE_URL } from "../../siteConfig";
import { TOUCH_PAYMENT_SECTIONS, WELCATSU_SECTIONS } from "../content";
import GuideBody from "../GuideBody";
import GuideList from "../GuideList";
import SmbcStoreList from "../SmbcStoreList";

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

  return (
    <main>
      <Breadcrumbs name={article.title} path={`/guide/${article.id}/`} />

      <article className="guide-article">
        <h1 className="guide-title">{article.title}</h1>

        {article.id === "welcatsu" && <GuideBody sections={WELCATSU_SECTIONS} />}

        {article.id === "touch-payment" && (
          <>
            <GuideBody sections={TOUCH_PAYMENT_SECTIONS} />
            <SmbcStoreList />
          </>
        )}

        <section className="guide-section">
          <h2 className="guide-h2">ほかのお得ガイド</h2>
          <GuideList articles={otherArticles} />
        </section>

        <p className="guide-disclaimer">{GUIDE_DISCLAIMER}</p>
      </article>

      {/* 記事の最後に広告を1箇所だけ表示する */}
      <AdUnit />
    </main>
  );
}
