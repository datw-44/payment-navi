import Link from "next/link";
import { OPERATOR_NAME, SITE_NAME } from "../siteConfig";

export default function Footer() {
  return (
    <footer className="site-footer">
      <nav className="site-footer-links" aria-label="サイト情報">
        <Link href="/privacy/">プライバシーポリシー</Link>
        <Link href="/about/">運営者情報</Link>
        <Link href="/contact/">お問い合わせ</Link>
      </nav>
      <p className="site-footer-copy">
        © {SITE_NAME}（{OPERATOR_NAME}）
      </p>
    </footer>
  );
}
