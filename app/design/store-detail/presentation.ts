import type { PaymentCandidate } from '../../data';
import { essentialConditions } from '../store-guide/essentialConditions';
export function visibleConditions(c:PaymentCandidate){
 if(c.条件要約==='通常のカード決済'&&c.条件===`${c.カード}で通常のクレジット決済をする`&&['店舗特典なし','基本還元率のみ'].includes(c.注意))return [];
 if(c.条件==='イオンカードまたは電子マネーWAONで通常決済する'&&c.条件要約==='通常のカード・WAON払い'&&c.注意==='イオングループは基本の2倍')return [c.注意];
 if(c.条件==='楽天カードで通常のクレジット決済をする（イオンは楽天ポイントカード加盟店ではない）'&&c.条件要約==='通常のカード決済'&&c.注意==='基本還元率のみ')return ['イオンは楽天ポイントカード加盟店ではない'];
 return essentialConditions(c);
}

export const aeonCondition = '毎月20日・30日に、イオンマークの付いたカード払い・WAON払い・AEON Payで決済する（お客様感謝デー）';
export function isAeonDay(c: PaymentCandidate) {
  return c.カード === 'イオンカード等（20日・30日お客様感謝デー）' && c.条件 === aeonCondition && c.注意 === '対象店舗のみ' && c.対象日条件 === '毎月20日・30日';
}
export function shortBenefitName(c: PaymentCandidate) { return isAeonDay(c) ? 'イオンカード等' : c.カード; }
export function essential(c: PaymentCandidate) {
  if (isAeonDay(c)) return ['イオンマークの付いたカード払い', 'WAON払い・AEON Pay', c.注意];
  // 通常操作を別欄で表示できる定型文だけ、原文の括弧注記を取り出す。
  // ポイント加盟店などの除外は残し、条件全文は展開欄でそのまま読める。
  const standardPrefix = `${c.カード}で通常のクレジット決済をする（`;
  if (c.条件要約 === '通常のカード決済' && c.注意 === '基本還元率のみ' && c.条件.startsWith(standardPrefix) && c.条件.endsWith('）')) {
    const exception = c.条件.slice(standardPrefix.length, -1);
    if (exception && !/[（）]/.test(exception)) return [exception];
  }
  // 日付は別の表示欄で必ず見せるため、完全に同じ重複行だけ除く。
  const lines = visibleConditions(c).filter(line => !(c.特定日限定 && line === `特典日：${c.対象日条件}`));
  // 元の省略表示で落ちていた店舗範囲・上限も一覧に残す。
  if (c.条件.includes('商業施設内など一部対象外店舗あり。') && !lines.some(x=>x.includes('対象外店舗'))) lines.push('商業施設内など一部対象外店舗あり');
  if (/上限/.test(c.注意) && !lines.some(x=>/上限/.test(x))) lines.push(c.注意);
  return [...new Set(lines)].filter(line => !lines.some(other => other !== line && other.startsWith(`${line}。`)));
}

// データの書き換えではなく表示層の抜粋。照合できない場合は既存の重要条件へ戻る。
export function facts(c: PaymentCandidate): string[] {
  // 倍率の説明は1%の算出理由であり、追加の利用条件ではない。原文は詳細に保持。
  if (c.カード === 'イオンカード・電子マネーWAON（通常時）' && c.条件要約 === '通常のカード・WAON払い'
    && c.条件 === 'イオンカードまたは電子マネーWAONで通常決済する'
    && c.還元率 === '1%' && c.注意 === 'イオングループは基本の2倍') return [];
  if (c.カード === 'JCBカードW' && c.条件要約 === '通常のカード決済'
    && c.条件 === 'JCBカードWで通常のクレジット決済をする（J-POINTパートナー特典の対象として確認できず）'
    && c.注意 === '店舗での特典の有無は、公式サイトでご確認ください') {
    return ['J-POINTパートナー特典の対象として確認できず'];
  }
  // 1%に上乗せする別条件の説明は詳細へ。1.5%を1%枠の数値に置き換えない。
  if (c.カード === 'PayPayカード' && c.条件要約 === '通常のカード決済'
    && c.条件 === 'PayPayカードで通常のクレジット決済をする'
    && c.還元率 === '1%' && c.注意 === 'ステップ達成で1.5%（要本人確認）') return [];
  return essential(c);
}

export function operation(c: PaymentCandidate) {
  // 「通常」は枠の意味で明示。原文は条件全文にそのまま保持する。
  return c.条件要約 === '通常のカード決済' ? 'カード決済'
    : c.条件要約 === '通常のカード・WAON払い' ? 'カード・WAON払い' : c.条件要約;
}
