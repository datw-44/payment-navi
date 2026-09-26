import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";
import { CONTACT_EMAIL, OPERATOR_NAME, SITE_NAME } from "../siteConfig";

export const metadata: Metadata = {
  title: `お問い合わせ｜${SITE_NAME}`,
  description: `${SITE_NAME}へのお問い合わせ先`,
};

export default function ContactPage() {
  return (
    <LegalPage title="お問い合わせ">
      <section>
        <h2>連絡先</h2>
        <p>
          掲載内容の誤りのご指摘や、その他のお問い合わせは、下記までご連絡ください。
        </p>
        <dl className="legal-contact">
          <dt>運営者</dt>
          <dd>{OPERATOR_NAME}</dd>
          <dt>メールアドレス</dt>
          <dd>
            {CONTACT_EMAIL ? (
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            ) : (
              ""
            )}
          </dd>
        </dl>
      </section>
      <section>
        <p className="legal-small">
          ※すべてのお問い合わせに返信できるとは限りません。あらかじめご了承ください。
        </p>
      </section>
    </LegalPage>
  );
}
