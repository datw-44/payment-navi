import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "お得な支払い方法チェッカー｜店舗別カード還元率比較【2026年最新】",
  description:
    "コンビニ・スーパー・ドラッグストア・飲食店など主要チェーン店で、還元率が一番高い支払い方法をランキングで比較できます。",
};

export default function Home() {
  return <HomeClient />;
}
