import Link from "next/link";

export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <Link href="/" className="back-link">
        ← 店舗一覧に戻る
      </Link>
      <h1 className="legal-title">{title}</h1>
      <div className="legal-body">{children}</div>
    </main>
  );
}
