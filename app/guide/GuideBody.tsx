import Link from "next/link";
import type { ReactNode } from "react";
import { getStoreId } from "../storeIds";
import type { GuideSection } from "./content";

// 本文中の {{店舗名}} / {{@記事ID|表示文字}} をリンクに変換する。
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, index) => {
    const match = part.match(/^\{\{([^}]+)\}\}$/);
    if (!match) return part;
    const token = match[1];
    if (token.startsWith("@")) {
      const [id, label] = token.slice(1).split("|");
      return (
        <Link key={index} href={`/guide/${id}/`}>
          {label ?? id}
        </Link>
      );
    }
    const storeId = getStoreId(token);
    if (!storeId) return token;
    return (
      <Link key={index} href={`/store/${storeId}/`}>
        {token}
      </Link>
    );
  });
}

export default function GuideBody({ sections }: { sections: GuideSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <section className="guide-section" key={section.heading}>
          <h2 className="guide-h2">{section.heading}</h2>
          {section.blocks.map((block, blockIndex) => {
            switch (block.type) {
              case "p":
                return (
                  <p className="guide-p" key={blockIndex}>
                    {renderInline(block.text)}
                  </p>
                );
              case "sub":
                return (
                  <h3 className="guide-h3" key={blockIndex}>
                    {block.text}
                  </h3>
                );
              case "ul":
                return (
                  <ul className="guide-list" key={blockIndex}>
                    {block.items.map((item) => (
                      <li key={item}>{renderInline(item)}</li>
                    ))}
                  </ul>
                );
              case "ol":
                return (
                  <ol className="guide-list" key={blockIndex}>
                    {block.items.map((item) => (
                      <li key={item}>{renderInline(item)}</li>
                    ))}
                  </ol>
                );
              case "note":
                return (
                  <p className="guide-note" key={blockIndex}>
                    {renderInline(block.text)}
                  </p>
                );
            }
          })}
        </section>
      ))}
    </>
  );
}
