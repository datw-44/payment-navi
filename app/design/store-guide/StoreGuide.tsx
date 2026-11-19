import type { ReactNode } from 'react';
import type { StorePayments } from '../../data';
import { getStoreId } from '../../storeIds';
import StoreDetail from '../store-detail/StoreDetail';

// URL・メタデータ・構造化データを担う既存ルートはそのまま維持する。
export default function StoreGuide(props: {
  store: StorePayments; acceptance: ReactNode; hasAcceptance: boolean; relatedGuides: ReactNode;
}) {
  return <StoreDetail {...props} storeId={getStoreId(props.store.店舗) ?? ''} />;
}
