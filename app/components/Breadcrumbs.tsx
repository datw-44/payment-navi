import Link from "next/link";
import { SITE_URL } from "../siteConfig";
import JsonLd from "./JsonLd";

export default function Breadcrumbs({ name, path }: { name: string; path: string }) {
  return (
    <>
      <nav className="breadcrumbs" aria-label="パンくずリスト">
        <Link href="/">店舗一覧</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{name}</span>
      </nav>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "店舗一覧", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
        ],
      }} />
    </>
  );
}
