import type { MetadataRoute } from "next";
import { getAllStoreIdEntries } from "./storeIds";
import { SITE_URL } from "./siteConfig";

// output: 'export' で静的な sitemap.xml として書き出すために明示指定する。
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const storeUrls: MetadataRoute.Sitemap = getAllStoreIdEntries().map(
    ({ storeId }) => ({
      url: `${SITE_URL}/store/${storeId}/`,
      lastModified: now,
    })
  );

  const pageUrls: MetadataRoute.Sitemap = ["privacy", "about", "contact"].map(
    (path) => ({ url: `${SITE_URL}/${path}/`, lastModified: now })
  );

  return [{ url: `${SITE_URL}/`, lastModified: now }, ...storeUrls, ...pageUrls];
}
