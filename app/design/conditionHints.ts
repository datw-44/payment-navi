import type { PaymentCandidate } from "../data";

// 表示上の整理だけを行う。資格・還元率・条件達成の判定には使わない。
// 安全な短縮が定義できない条件は全文を初期表示し、重要条件を推測で削らない。
export function conditionHints(candidate: PaymentCandidate) {
  const labels: string[] = [];
  let visibleClauses: string[] = [candidate.条件];
  const olive = "OliveフレキシブルペイのクレジットモードでスマホのVisaタッチ決済・Mastercardタッチ決済を利用する。Google Pay・Samsung WalletではMastercardタッチ決済は利用できない。商業施設内など一部対象外店舗あり。";
  const smbc = "スマホのタッチ決済（Apple Pay/Google PayでのVisaタッチ・Mastercardタッチ）";
  const mufg = "対象店舗で三菱UFJカードをクレジット決済・タッチ決済、またはApple Pay（QUICPay支払い）で支払う（スマホのVisaタッチ決済・Google Payは対象外）";
  if (candidate.条件 === olive && candidate.条件要約 === "クレジットモードでスマホタッチ") {
    labels.push("クレジットモード", "Visa / Mastercardタッチ");
    visibleClauses = candidate.条件.split("。").filter((clause) => clause.includes("Google Pay・Samsung Wallet") || clause.includes("一部対象外店舗"));
  } else if (candidate.条件 === smbc && candidate.条件要約 === "スマホのタッチ決済") {
    labels.push("Apple Pay / Google Pay", "Visa / Mastercardタッチ");
    visibleClauses = [];
  } else if (candidate.条件 === mufg && candidate.条件要約 === "カード決済/Apple Pay") {
    labels.push("Apple PayはQUICPay支払い");
    visibleClauses = ["スマホのVisaタッチ決済・Google Payは対象外"];
  }
  if (candidate.特定日限定) labels.push("特定日限定");
  return { labels, visibleClauses };
}
