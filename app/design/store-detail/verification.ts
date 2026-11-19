import records from './verification-records.json';
import type { PaymentCandidate } from '../../data';
import type { JstDate } from '../../utils';
import { iso, matchesDay } from '../calendar/model';
import { candidateSignature } from './model';

export type VerificationStatus = 'verified' | 'partial' | 'unverified' | 'possible-change';
export type VerificationRecord = {
  storeId: string; candidateName: string; status: VerificationStatus;
  verifiedAt: string | null; attemptedAt: string; urls: string[]; reason: string;
  // 将来の公式検証後にのみ作成する表示承認。現存17件には設定しない。
  displayApproval?: {
    candidateSignature: string; storeIds: string[]; validFrom: string; validThrough: string;
    reviewBy: string; scopeConfirmed: boolean;
  };
};
export function getVerification(storeId: string, name: string): VerificationRecord | undefined {
  return (records as VerificationRecord[]).find(r => r.storeId === storeId && r.candidateName === name);
}
export function verificationMessage(status: VerificationStatus = 'unverified') {
  if (status === 'verified') return '対象店舗・商品・支払い条件をご確認ください。';
  if (status === 'partial') return '支払い方法や対象外条件など、一部の条件は未確認です。';
  if (status === 'possible-change') return '日程や適用条件に変更の可能性があります。公式案内をご確認ください。';
  return '最新の対象条件は未確認です。';
}
export function verificationLabel(status: VerificationStatus) {
  return { verified: '確認済み', partial: '一部確認', unverified: '未確認', 'possible-change': '終了・変更の可能性' }[status];
}
export function sourceName(url: string) {
  const host = new URL(url).hostname;
  return ({ 'www.aeon.co.jp': 'イオンカード公式', 'www.aeonretail.jp': 'イオンリテール公式', 'faq.aeon.co.jp': 'イオンカード公式FAQ' } as Record<string,string>)[host] ?? host;
}
export const japaneseDate = (date: string) => new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long', day: 'numeric',
}).format(new Date(date));
function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
// 日付一致だけでは昇格しない。条件変更・期限切れ・対象店不一致も保留。
// 「該当日の案内」であり、利用者本人の適用を保証する判定ではない。
export function isVerifiedForDay(storeId: string, c: PaymentCandidate, r: VerificationRecord | undefined, today: JstDate | null) {
  const a = r?.displayApproval;
  if (!today || !r || r.status !== 'verified' || !r.verifiedAt || !a || !a.scopeConfirmed) return false;
  if (r.storeId !== storeId || r.candidateName !== c.カード || !a.storeIds.includes(storeId)) return false;
  if (!r.urls.length || r.urls.some(u => !u.startsWith('https://'))) return false;
  if (!Number.isFinite(Date.parse(r.verifiedAt)) || japaneseDate(r.verifiedAt) === '') return false;
  const date = iso(today);
  if (new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date(r.verifiedAt)) > date) return false;
  if (![a.validFrom,a.validThrough,a.reviewBy].every(validDate)) return false;
  return a.validFrom <= date && date <= a.validThrough && date <= a.reviewBy
    && a.candidateSignature === candidateSignature(c)
    && c.特定日限定 === true && !!c.対象日条件 && matchesDay(c.対象日条件, today);
}
