import type { PaymentCandidate } from '../../data';

// 表示上の比較範囲。公式の現行性を認証するルールではない。
// 単に「通常の」で始まるか・数値が単一かでは分類しない。
// 既存の名称、率、操作、条件全文、注意が以下の明示した組合せに合う場合のみ扱う。
// 未知の文・上乗せ・確認できない条件は、率を変えず条件確認の一覧へ戻す。
export function ordinaryRate(c: PaymentCandidate, storeName: string): number | null {
  if (c.特定日限定 || c.対象日条件) return null;
  const basicNotes = ['基本還元率のみ', '店舗特典なし', 'コンビニ特典なし'];
  const rates: Record<string, string> = {
    'リクルートカード': '1.2%', '楽天カード': '1%', 'dカード': '1%',
    'PayPayカード': '1%', 'イオンカード': '0.5%', '三井住友カード（NL）等': '0.5%',
  };
  if (c.カード === 'イオンカード・電子マネーWAON（通常時）' && c.還元率 === '1%'
    && c.条件要約 === '通常のカード・WAON払い'
    && c.条件 === 'イオンカードまたは電子マネーWAONで通常決済する'
    && c.注意 === 'イオングループは基本の2倍') return 1;
  if (rates[c.カード] !== c.還元率 || c.条件要約 !== '通常のカード決済') return null;
  const notes = c.カード === 'PayPayカード' ? ['ステップ達成で1.5%（要本人確認）'] : basicNotes;
  if (!notes.includes(c.注意)) return null;
  const suffixes: Record<string, string[]> = {
    'リクルートカード': [''],
    '楽天カード': ['', `（${storeName}は楽天ポイントカード加盟店ではない）`,
      `（${storeName}は楽天ポイントカード加盟店ではないため、提示による二重取りは不可）`,
      '（ヨドバシは楽天ポイントカード加盟店ではない）', '（提示分とは別枠）',
      '（ポイントカード提示分は別候補）', '（LaCuCa提示との併用は別候補）'],
    'dカード': ['', `（${storeName}はdポイント加盟店ではない）`,
      '（d払い経由ではなくカードをそのまま利用）', '（dポイントカード提示との併用は別候補）',
      '（dポイントカードの店頭提示は非対応）', '（提示分とは別枠）', '（ポイントカード提示分は別候補）'],
    'PayPayカード': ['', '（PayPayアプリのQRコード決済ではなくカードをそのまま利用）'],
    'イオンカード': ['', '（イオングループ店舗ではないため特典対象外）', `（${storeName}はイオングループ外）`],
    '三井住友カード（NL）等': ['', '（イオングループはVポイント優遇の対象外）'],
  };
  return suffixes[c.カード]?.some(s => c.条件 === `${c.カード}で通常のクレジット決済をする${s}`)
    ? Number(c.還元率.slice(0, -1)) : null;
}

export type RateGroup = { rate: number; rank: number; candidates: PaymentCandidate[] };
export function groupCandidates(candidates: PaymentCandidate[], storeName: string) {
  const normal: PaymentCandidate[] = [], conditional: PaymentCandidate[] = [], discounts: PaymentCandidate[] = [], days: PaymentCandidate[] = [];
  for (const c of candidates) {
    if (c.特定日限定 || c.対象日条件) days.push(c);
    else if (c.還元率.includes('割引')) discounts.push(c);
    else if (ordinaryRate(c, storeName) !== null) normal.push(c);
    else conditional.push(c);
  }
  const rates = [...new Set(normal.map(c => ordinaryRate(c, storeName)!))].sort((a,b) => b-a);
  let rank = 1;
  const groups: RateGroup[] = rates.map(rate => {
    const items = normal.filter(c => ordinaryRate(c, storeName) === rate);
    const group = { rate, rank, candidates: items }; rank += items.length; return group;
  });
  return { groups, conditional, discounts, days };
}

export const rateParts = (c: PaymentCandidate) => c.還元率.match(/^(最大|約)?(\d+(?:\.\d+)?)%(割引)?(?:（([^）]+)）)?$/);
export const candidateSignature = (c: PaymentCandidate) => JSON.stringify([c.カード, c.還元率, c.条件要約, c.条件, c.注意, c.ポイント種類, c.特定日限定 ?? false, c.対象日条件 ?? '']);
