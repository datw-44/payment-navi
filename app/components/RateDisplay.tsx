import type { PaymentCandidate } from "../data";

// 順位用の最大値抽出とは分離し、条件を含む元の表記を省略しない。
export default function RateDisplay({ candidate }: { candidate: PaymentCandidate }) {
  const rate = candidate.還元率;
  const simple = rate.match(/^(最大)?(\d+(?:\.\d+)?)%(割引)?$/);
  const headline = simple
    ? `${simple[1] ? "最大 " : ""}${Number(simple[2]).toFixed(1)}%${simple[3] ? " 割引" : ""}`
    : rate;

  return (
    <div className="rate-display">
      <p className={`rate-display-value${simple ? "" : " rate-display-value-complex"}`}>
        {headline}
      </p>
      {rate.includes("最大") && <p className="rate-display-label">条件あり</p>}
      <p className="rate-display-condition">{candidate.条件要約}</p>
      {candidate.特定日限定 && (
        <p className="rate-display-date">
          特定日限定{candidate.対象日条件 ? `：${candidate.対象日条件}` : ""}
        </p>
      )}
      {/* 円換算は、換算率が明確な単一の割引率だけ。ポイントの価値は推測しない。 */}
      {simple && !simple[1] && simple[3] && (
        <p className="rate-display-estimate">
          対象となる1,000円分に適用した場合：
          {Number((Number(simple[2]) * 10).toFixed(1))}円引き（条件適用時の目安）
        </p>
      )}
    </div>
  );
}
