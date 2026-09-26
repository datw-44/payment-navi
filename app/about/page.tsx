import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";
import { OPERATOR_NAME, SITE_NAME } from "../siteConfig";

export const metadata: Metadata = {
  title: `運営者情報｜${SITE_NAME}`,
  description: `${SITE_NAME}の運営者、サイトの目的、情報の更新方針について`,
};

export default function AboutPage() {
  return (
    <LegalPage title="運営者情報">
      <section>
        <h2>運営者</h2>
        <p>{OPERATOR_NAME}</p>
      </section>
      <section>
        <h2>サイトの目的</h2>
        <p>
          {SITE_NAME}は、コンビニ・スーパー・ドラッグストアなどの店舗ごとに、クレジットカードやQRコード決済など「一番お得な支払い方法」をひと目で比較できるサイトです。毎日の買い物で、無理なくポイントを貯める手助けになることを目指しています。
        </p>
      </section>
      <section>
        <h2>情報の更新方針</h2>
        <p>
          掲載している還元率や条件は、各社の公式サイトをもとに、毎週確認しています。キャンペーンや制度の変更があった場合は、確認でき次第、内容を更新します。
        </p>
      </section>
      <section>
        <h2>広告について</h2>
        <p>
          当サイトにはアフィリエイト広告が含まれる場合があります。詳しくは
          <a href="/privacy/">プライバシーポリシー</a>をご覧ください。
        </p>
      </section>
      <section>
        <h2>情報の正確性と免責</h2>
        <p>
          掲載内容は正確を期していますが、最新性・完全性を保証するものではありません。還元率や適用条件は予告なく変更されることがあり、実際の店舗での取り扱いと異なる場合があります。お申し込みやご利用の前に、必ず各社の公式サイトで最新の情報をご確認ください。当サイトの情報を利用したことで生じた損害について、当サイトは責任を負いかねます。
        </p>
      </section>
    </LegalPage>
  );
}
