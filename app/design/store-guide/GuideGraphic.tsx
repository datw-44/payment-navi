// この試作用に作成した3方向の道しるべ。文字で示す選択肢を補助する装飾SVG。
export default function GuideGraphic() {
  return <svg viewBox="0 0 240 190" fill="none" aria-hidden="true">
    <path d="M120 168v-52M120 118 69 87M120 118l52-31M120 116V57" stroke="#202124" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
    <path d="m120 16 25 25h-10v47h-30V41H95Z" fill="#4169a8"/>
    <text x="120" y="65" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="Arial,sans-serif">A</text>
    <path d="M18 75 43 52l3 12h45l8 27H46l-3 12Z" fill="white" stroke="#202124" strokeWidth="2.5"/>
    <text x="65" y="84" textAnchor="middle" fill="#202124" fontSize="18" fontWeight="700" fontFamily="Arial,sans-serif">B</text>
    <path d="m222 75-25-23-3 12h-45l-8 27h53l3 12Z" fill="#d9e5f4" stroke="#4169a8" strokeWidth="2.5"/>
    <text x="175" y="84" textAnchor="middle" fill="#202124" fontSize="18" fontWeight="700" fontFamily="Arial,sans-serif">C</text>
    <path d="M91 169h58" stroke="#4169a8" strokeWidth="2.5"/>
  </svg>;
}
