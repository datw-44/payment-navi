import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";
import { OPERATOR_NAME, SITE_NAME } from "../siteConfig";

export const metadata: Metadata = {
  title: `プライバシーポリシー｜${SITE_NAME}`,
  description: `${SITE_NAME}のプライバシーポリシー（広告・Cookie・アクセス解析・個人情報の取り扱い）`,
};

export default function PrivacyPage() {
  return (
    <LegalPage title="プライバシーポリシー">
      <section>
        <h2>個人情報の取得について</h2>
        <p>
          {SITE_NAME}（運営：{OPERATOR_NAME}
          、以下「当サイト」）は、氏名・住所・電話番号などの個人情報を取得しません。
          「マイカード」で選択した支払い方法の情報は、お使いの端末のブラウザ内（localStorage）にのみ保存され、当サイトや第三者のサーバーには送信されません。ブラウザのデータを削除すると、この情報も消去されます。
        </p>
      </section>
      <section>
        <h2>アフィリエイトプログラムについて</h2>
        <p>
          当サイトは、カード会社や決済事業者の商品・サービスを紹介するアフィリエイトプログラムを利用しています。当サイト内のリンクを経由して申し込みがあった場合、当サイトが運営者として報酬を受け取ることがあります。ただし、還元率などの掲載内容は、報酬の有無にかかわらず公式情報をもとに作成しています。
        </p>
      </section>
      <section>
        <h2>広告配信とCookieについて</h2>
        <p>
          アフィリエイトプログラムや広告配信サービスでは、広告の効果測定や配信のためにCookie（クッキー）が使用される場合があります。Cookieにより収集される情報には、氏名・住所・メールアドレスなど個人を特定するものは含まれません。
        </p>
        <p>
          ブラウザの設定でCookieを無効にすることもできます。ただし、無効にすると一部のサービスが正しく動作しない場合があります。
        </p>
      </section>
      <section>
        <h2>アクセス解析について</h2>
        <p>
          当サイトでは、アクセス状況の把握や改善のために、Google Search
          Consoleなどのアクセス解析・検索状況の確認ツールを利用しています。今後、Google
          アナリティクスなどのアクセス解析ツールを導入する場合があります。これらのツールはCookieを使用して、個人を特定しない形でトラフィックデータを収集します。収集されるデータは各ツールの提供元のプライバシーポリシーに基づいて管理されます。
        </p>
      </section>
      <section>
        <h2>免責事項</h2>
        <p>
          掲載情報の正確性には注意を払っていますが、内容を保証するものではありません。最新の条件は、各社の公式サイトでご確認ください。詳しくは
          <a href="/about/">運営者情報</a>をご覧ください。
        </p>
      </section>
      <section>
        <h2>改定について</h2>
        <p>
          本ポリシーは、法令の変更や運営内容の変更に応じて、予告なく改定することがあります。
        </p>
      </section>
    </LegalPage>
  );
}
