import Link from "next/link";
import { GUIDE_ARTICLES, type GuideArticle } from "./articles";

// 記事へのリンクカード一覧（トップページ・店舗ページ・記事末尾で共通利用）。
export default function GuideList({
  articles = GUIDE_ARTICLES,
}: {
  articles?: GuideArticle[];
}) {
  return (
    <div className="guide-card-list">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/guide/${article.id}/`}
          className="guide-card"
        >
          <span className="guide-card-title">{article.title}</span>
          <span className="guide-card-summary">{article.summary}</span>
        </Link>
      ))}
    </div>
  );
}
