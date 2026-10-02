import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdUnit from "../../components/AdUnit";
import {
  GUIDE_ARTICLES,
  GUIDE_DISCLAIMER,
  getGuideArticle,
} from "../articles";
import { buildCalendarData } from "../calendar";
import CalendarClient from "../CalendarClient";
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
  return {
    title: article.title,
    description: article.description,
    openGraph: { title: article.title, description: article.description },
  };
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

  return (
    <main>
      <Link href="/" className="back-link">
        ← 店舗一覧に戻る
      </Link>

      <article className="guide-article">
        <h1 className="guide-title">{article.title}</h1>

        {article.id === "welcatsu" && <GuideBody sections={WELCATSU_SECTIONS} />}

        {article.id === "touch-payment" && (
          <>
            <GuideBody sections={TOUCH_PAYMENT_SECTIONS} />
            <SmbcStoreList />
          </>
        )}

        {article.id === "calendar" && (
          <>
            <p className="guide-p">
              毎月・毎週の決まった日にお得になる店舗を、当サイトのデータから自動でまとめました。店名から各店舗のページに移動できます。今日が特典日の店舗は、上部と一覧の中で色を付けて表示します。特典日の考え方は{" "}
              <Link href="/guide/welcatsu/">ウエル活のやり方</Link>
              も参考にしてください。
            </p>
            <CalendarClient data={buildCalendarData()} />
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
