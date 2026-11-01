import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./siteConfig";

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, locale: "ja_JP", type: "website" },
    twitter: { card: "summary", title, description },
  };
}
