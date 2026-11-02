import { WELCATSU_SECTIONS, TOUCH_PAYMENT_SECTIONS } from "../../guide/content";
// 記事固有の設定は表示形式と既存ブロックの参照だけ。本文・数値は生成しない。
export const guideConfigs = {
 welcatsu: { sections:WELCATSU_SECTIONS, takeaway:[1,0] as const, flow:[2,3,4], comparison:undefined },
 "touch-payment": { sections:TOUCH_PAYMENT_SECTIONS, takeaway:[2,1] as const, flow:[], comparison:[1,1] as const },
};
export type EditorialId = keyof typeof guideConfigs;
export const sectionId=(index:number)=>`section-${index+1}`;
