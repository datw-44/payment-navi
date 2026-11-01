import type { MetadataRoute } from "next";
import { getAllStoreIdEntries } from "./storeIds";
import { SITE_URL } from "./siteConfig";
import { GUIDE_ARTICLES } from "./guide/articles";

// output: 'export' で静的な sitemap.xml として書き出すために明示指定する。
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // 実際のページ更新日を管理していないため、ビルド日時をlastModifiedに使わない。

  const storeUrls: MetadataRoute.Sitemap = getAllStoreIdEntries().map(
    ({ storeId }) => ({
      url: `${SITE_URL}/store/${storeId}/`,
    })
  );

  const guideUrls: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((article) => ({
    url: `${SITE_URL}/guide/${article.id}/`,
  }));

  const pageUrls: MetadataRoute.Sitemap = ["privacy", "about", "contact"].map(
    (path) => ({ url: `${SITE_URL}/${path}/` })
  );

  return [{ url: `${SITE_URL}/` }, ...storeUrls, ...guideUrls, ...pageUrls];
}
