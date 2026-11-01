import type { PaymentCandidate } from "../../data";
import { lawsonConditions } from "./lawsonConditions";
import { conditionProfiles } from "./conditionProfiles";

export function conditionPresentation(candidate: PaymentCandidate) {
  const specific = lawsonConditions(candidate);
  const profile = conditionProfiles.find((item) => item.condition === candidate.条件 && item.note === candidate.注意);
  // 「通常のカード決済」と同じことだけを述べる完全一致文は、操作欄との重複を避ける。
  const ordinary = candidate.条件要約 === "通常のカード決済" && candidate.条件 === `${candidate.カード}で通常のクレジット決済をする`;
  const lines = specific ?? profile?.lines ?? (ordinary ? [candidate.注意] : [candidate.条件, candidate.注意]);
  const unique = [...new Set(lines.filter(Boolean))];
  if (candidate.特定日限定 && candidate.対象日条件) {
    unique.unshift(`特典日：${candidate.対象日条件}`);
  }
  return { lines: unique, kind: specific ? "specific" : profile ? "profile" : ordinary ? "ordinary" : "verbatim" };
}
export function essentialConditions(candidate: PaymentCandidate): string[] { return conditionPresentation(candidate).lines; }
