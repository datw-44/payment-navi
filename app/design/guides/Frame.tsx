"use client";
import type { ReactNode } from "react";
import { PreviewHeader, PreviewFooter } from "../../design/Chrome";
import { useMyCards } from "../../hooks/useMyCards";
import MyCardsModal from "../../components/MyCardsModal";
import chrome from "../../design/preview.module.css";
import styles from "./editorial.module.css";
export default function Frame({children}:{children:ReactNode}) {
 const cards=useMyCards();
 return <div className={`${chrome.shell} ${styles.scope}`}><PreviewHeader count={cards.myCardIds?.size??0} onOpen={cards.openModal}/>{children}<PreviewFooter/>{cards.isModalOpen&&<MyCardsModal myCardIds={cards.myCardIds} onToggle={cards.toggleMyCard} onClose={cards.closeModal}/>}</div>;
}
