/* =====================================================================
   PIP & FIFI — episode scenes (original art), each 1600 × 900 "world" units.
   Ground line ≈ y 820 (characters stand on it).
   ===================================================================== */
(() => {
const flags = (y, n, w) => Array.from({ length: n }, (_, i) => {
  const c = ['#FF7A9A', '#FFC93C', '#4CC373', '#5B8DEF', '#C77DFF', '#FF9A3C'][i % 6], x = 40 + i * w;
  return `<path d="M${x} ${y + Math.sin(i / 1.6) * 14} l30 0 -15 38 Z" fill="${c}"/>`;
}).join('');
window.EP_SCENES = {
  outside: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ED1FF"/><stop offset="1" stop-color="#DDF3FF"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#sk)"/>
    <circle cx="1420" cy="130" r="70" fill="#FFE066"/><circle cx="1420" cy="130" r="100" fill="#FFE066" opacity=".25"/>
    <g fill="#fff" opacity=".9"><ellipse cx="260" cy="150" rx="90" ry="34"/><ellipse cx="320" cy="130" rx="60" ry="36"/><ellipse cx="900" cy="100" rx="80" ry="28"/><ellipse cx="950" cy="86" rx="50" ry="30"/></g>
    <path d="M0 640 Q400 560 800 620 Q1200 680 1600 600 V900 H0 Z" fill="#9BD67F"/>
    <rect x="860" y="330" width="560" height="420" rx="16" fill="#FFE7C2"/>
    <path d="M830 340 L1140 170 L1450 340 Z" fill="#E8505B"/>
    <rect x="980" y="380" width="320" height="64" rx="14" fill="#fff" stroke="#5B8DEF" stroke-width="6"/>
    <text x="1140" y="425" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="38" fill="#5B8DEF">PRZEDSZKOLE</text>
    <rect x="900" y="480" width="110" height="100" rx="12" fill="#BFE3F5" stroke="#fff" stroke-width="8"/><rect x="1270" y="480" width="110" height="100" rx="12" fill="#BFE3F5" stroke="#fff" stroke-width="8"/>
    <rect x="1080" y="540" width="120" height="210" rx="14" fill="#C77DFF"/><circle cx="1180" cy="650" r="8" fill="#FFE066"/>
    <path d="M1080 540 q60 -50 120 0" fill="#B35FF0"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${60 + i * 90}" y="660" width="16" height="100" rx="6" fill="#fff"/>`).join('')}
    <rect x="50" y="680" width="720" height="14" rx="6" fill="#fff"/><rect x="50" y="720" width="720" height="14" rx="6" fill="#fff"/>
    <path d="M1060 900 Q1110 800 1140 750 L1220 750 Q1250 800 1300 900 Z" fill="#F4DDA8"/>
    <g><rect x="160" y="420" width="26" height="200" fill="#8B6B4A"/><circle cx="173" cy="400" r="90" fill="#6FBF5A"/><circle cx="120" cy="440" r="60" fill="#7FCB69"/><circle cx="230" cy="430" r="62" fill="#5EAE4B"/></g>
    <path d="M0 800 Q800 770 1600 800 V900 H0 Z" fill="#7FC765"/>
  </svg>`,
  garden: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="skg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FC8E8"/><stop offset="1" stop-color="#E4F1FA"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#skg)"/>
    <g class="sun"><circle cx="1430" cy="120" r="66" fill="#FFE066"/><circle cx="1430" cy="120" r="96" fill="#FFE066" opacity=".25"/></g>
    <g fill="#fff" opacity=".85"><ellipse cx="300" cy="140" rx="110" ry="38"/><ellipse cx="370" cy="118" rx="70" ry="40"/><ellipse cx="1000" cy="110" rx="90" ry="30"/></g>
    <path d="M0 610 Q400 540 800 600 Q1200 660 1600 580 V900 H0 Z" fill="#8FCB72"/>
    <rect x="0" y="700" width="1600" height="200" fill="#9BD67F"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(i => `<rect x="${20 + i * 92}" y="600" width="16" height="96" rx="6" fill="#fff"/>`).join('')}
    <rect x="0" y="620" width="1600" height="13" rx="6" fill="#fff"/><rect x="0" y="660" width="1600" height="13" rx="6" fill="#fff"/>
    <g><rect x="150" y="380" width="28" height="260" fill="#8B6B4A"/><circle cx="164" cy="350" r="110" fill="#5DB85A"/><circle cx="90" cy="400" r="70" fill="#4FA84D"/><circle cx="240" cy="395" r="72" fill="#4FA84D"/>
      <circle cx="120" cy="330" r="12" fill="#E8505B"/><circle cx="210" cy="300" r="12" fill="#E8505B"/><circle cx="180" cy="410" r="12" fill="#E8505B"/></g>
    <g><rect x="1180" y="430" width="22" height="300" rx="8" fill="#5B8DEF"/><rect x="1260" y="430" width="22" height="300" rx="8" fill="#5B8DEF"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="1180" y="${470 + i * 52}" width="100" height="12" rx="5" fill="#5B8DEF"/>`).join('')}
      <rect x="1166" y="410" width="130" height="30" rx="10" fill="#E8505B"/>
      <path d="M1290 420 Q1420 520 1500 730 L1550 730 Q1460 500 1300 400 Z" fill="#FFC93C"/></g>
    <g><rect x="470" y="690" width="300" height="70" rx="14" fill="#E7B56C"/><rect x="484" y="700" width="272" height="40" rx="10" fill="#F6DCA0"/>
      <path d="M560 712 q20 -24 40 0 Z" fill="#E8C47E"/><rect x="680" y="676" width="10" height="40" rx="4" fill="#E8505B" transform="rotate(20 685 696)"/><path d="M640 712 l30 0 -6 -22 -18 0 Z" fill="#4CC373"/></g>
  </svg>`,
  hall: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#FFF3DC"/><rect y="600" width="1600" height="300" fill="#E3C69E"/><rect y="594" width="1600" height="12" fill="#C9A57A"/>
    ${[0, 1, 2, 3, 4, 5].map(i => { const x = 120 + i * 150, c = ['#BFE3F5', '#FFD6E0', '#D7F0C8', '#FFE9A8', '#E4D4F4', '#FFD9B8'][i]; return `
      <rect x="${x}" y="220" width="130" height="330" rx="10" fill="#E8C9A0"/><rect x="${x + 10}" y="232" width="110" height="300" rx="8" fill="${c}"/>
      <circle cx="${x + 65}" cy="280" r="9" fill="#9A8A80"/><circle cx="${x + 65}" cy="500" r="22" fill="#fff"/>`; }).join('')}
    <text x="185" y="510" font-size="28" text-anchor="middle">⭐</text><text x="335" y="510" font-size="28" text-anchor="middle">❤️</text><text x="485" y="510" font-size="28" text-anchor="middle">☀️</text>
    <text x="635" y="510" font-size="28" text-anchor="middle">🌸</text><text x="785" y="510" font-size="28" text-anchor="middle">🦋</text><text x="935" y="510" font-size="28" text-anchor="middle">🍎</text>
    <path d="M330 300 q30 -12 60 0 l6 90 q-36 10 -72 0 Z" fill="#7FBF6A"/><path d="M630 300 q30 -12 60 0 l6 90 q-36 10 -72 0 Z" fill="#FF8FB1"/>
    <rect x="110" y="560" width="900" height="26" rx="10" fill="#C99A6A"/>
    <rect x="1180" y="250" width="260" height="420" rx="16" fill="#C77DFF"/><rect x="1200" y="270" width="220" height="150" rx="10" fill="#BFE3F5"/><circle cx="1405" cy="470" r="10" fill="#FFE066"/>
    <path d="M40 80 Q800 140 1560 80" stroke="#C99A6A" stroke-width="4" fill="none"/>${flags(84, 17, 92)}
  </svg>`,
  room: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#FDF6E3"/><rect y="610" width="1600" height="290" fill="#D9C2A3"/><rect y="604" width="1600" height="12" fill="#B99A75"/>
    <path d="M40 70 Q800 130 1560 70" stroke="#C99A6A" stroke-width="4" fill="none"/>${flags(74, 17, 92)}
    <rect x="120" y="180" width="300" height="230" rx="14" fill="#BFE6FF" stroke="#fff" stroke-width="16"/><path d="M270 180 V410 M120 295 H420" stroke="#fff" stroke-width="10"/>
    <rect x="520" y="200" width="320" height="200" rx="12" fill="#3F6B5A" stroke="#C99A6A" stroke-width="12"/>
    <text x="680" y="320" text-anchor="middle" font-size="70" font-family="sans-serif" font-weight="800" fill="#fff" opacity=".85">A B C</text>
    <rect x="1020" y="300" width="460" height="16" rx="6" fill="#C99A6A"/><rect x="1020" y="440" width="460" height="16" rx="6" fill="#C99A6A"/>
    <text x="1060" y="292" font-size="70">🧸🚂🎨🪀</text><text x="1060" y="432" font-size="70">📚🧩🥁🪁</text>
    <ellipse cx="900" cy="790" rx="560" ry="80" fill="#9AD0F0"/><ellipse cx="900" cy="790" rx="470" ry="58" fill="#B8E0F7"/>
  </svg>`,
  washroom: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#EAF6FB"/>
    ${Array.from({ length: 13 }, (_, i) => `<path d="M${i * 128} 0 V610" stroke="#D3EAF3" stroke-width="4"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${i * 110} H1600" stroke="#D3EAF3" stroke-width="4"/>`).join('')}
    <rect y="610" width="1600" height="290" fill="#B8DDEB"/><rect y="604" width="1600" height="12" fill="#8FC3D8"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 200 - 100} 900 L${i * 200} 610" stroke="#A5D2E3" stroke-width="5"/>`).join('')}
    ${[600, 1000].map(x => `
      <rect x="${x - 120}" y="230" width="240" height="190" rx="22" fill="#CFEFFA" stroke="#fff" stroke-width="12"/><path d="M${x - 70} 260 l60 -0 M${x - 70} 285 l35 0" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
      <rect x="${x - 26}" y="580" width="52" height="250" rx="10" fill="#fff"/>
      <path d="M${x - 140} 540 H${x + 140} Q${x + 130} 610 ${x} 615 Q${x - 130} 610 ${x - 140} 540 Z" fill="#fff" stroke="#D3EAF3" stroke-width="5"/>
      <ellipse cx="${x}" cy="548" rx="118" ry="14" fill="#DDF1F8"/>
      <rect x="${x - 12}" y="470" width="24" height="62" rx="8" fill="#B9C3CC"/><path d="M${x - 12} 476 h-46 a10 10 0 0 0 -10 10 v14 h22 v-6 h34 z" fill="#B9C3CC"/>
      <circle cx="${x}" cy="466" r="14" fill="#E8505B"/>`).join('')}
    <g><rect x="120" y="300" width="14" height="60" rx="5" fill="#C99A6A"/><rect x="92" y="350" width="70" height="120" rx="12" fill="#FFC93C"/>
       <rect x="1470" y="300" width="14" height="60" rx="5" fill="#C99A6A"/><rect x="1442" y="350" width="70" height="120" rx="12" fill="#7FC8F8"/></g>
    <circle cx="800" cy="120" r="44" fill="#fff" stroke="#C99A6A" stroke-width="8"/><text x="800" y="138" text-anchor="middle" font-size="50">🫧</text>
  </svg>`,
  dining: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#FFF3D9"/><rect y="610" width="1600" height="290" fill="#E7C9A0"/><rect y="604" width="1600" height="12" fill="#C9A47A"/>
    <path d="M40 70 Q800 130 1560 70" stroke="#C99A6A" stroke-width="4" fill="none"/>${flags(74, 17, 92)}
    <rect x="1180" y="170" width="300" height="230" rx="14" fill="#BFE6FF" stroke="#fff" stroke-width="16"/><path d="M1330 170 V400 M1180 285 H1480" stroke="#fff" stroke-width="10"/>
    <rect x="160" y="190" width="220" height="170" rx="10" fill="#fff" stroke="#C99A6A" stroke-width="10"/><text x="270" y="300" text-anchor="middle" font-size="90">🍎</text>
    <text x="760" y="320" text-anchor="middle" font-size="64" font-family="sans-serif" font-weight="800" fill="#E8955A" opacity=".85">SMACZNEGO!</text>
    ${[450, 700, 950, 1200].map((x, i) => `<rect x="${x - 70}" y="470" width="140" height="190" rx="18" fill="${['#FF8FA3', '#FFC93C', '#7FC8F8', '#8FD694'][i]}"/><rect x="${x - 54}" y="486" width="108" height="20" rx="8" fill="#fff" opacity=".45"/>`).join('')}
  </svg>`,
  lesson: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect width="1600" height="900" fill="#EEF4FF"/><rect y="610" width="1600" height="290" fill="#D9C2A3"/><rect y="604" width="1600" height="12" fill="#B99A75"/>
    <path d="M40 70 Q800 130 1560 70" stroke="#C99A6A" stroke-width="4" fill="none"/>${flags(74, 17, 92)}
    <rect x="520" y="150" width="560" height="250" rx="14" fill="#3F6B5A" stroke="#C99A6A" stroke-width="14"/>
    <text x="800" y="250" text-anchor="middle" font-size="64" font-family="sans-serif" font-weight="800" fill="#fff" opacity=".9">A B C</text>
    <text x="800" y="350" text-anchor="middle" font-size="64">🐱 🐶 🍎</text>
    <rect x="1180" y="170" width="300" height="230" rx="14" fill="#BFE6FF" stroke="#fff" stroke-width="16"/><path d="M1330 170 V400 M1180 285 H1480" stroke="#fff" stroke-width="10"/>
    <g font-size="60"><text x="130" y="250">🎨</text><text x="250" y="250">✏️</text><text x="130" y="360">📏</text><text x="250" y="360">🖍️</text></g>
    ${[450, 700, 950, 1200].map((x, i) => `<rect x="${x - 70}" y="470" width="140" height="190" rx="18" fill="${['#FF8FA3', '#FFC93C', '#7FC8F8', '#8FD694'][i]}"/><rect x="${x - 54}" y="486" width="108" height="20" rx="8" fill="#fff" opacity=".45"/>`).join('')}
  </svg>`,
  park: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="skp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD3F2"/><stop offset="1" stop-color="#E4F4FB"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#skp)"/>
    <g fill="#fff" opacity=".9"><ellipse cx="260" cy="130" rx="100" ry="34"/><ellipse cx="330" cy="110" rx="64" ry="36"/><ellipse cx="1180" cy="100" rx="90" ry="30"/></g>
    <path d="M0 600 Q400 530 800 590 Q1200 650 1600 570 V900 H0 Z" fill="#8FCB72"/><rect y="690" width="1600" height="210" fill="#9BD67F"/>
    <path d="M-20 900 Q300 760 700 790 T1620 760 V900 Z" fill="#E7D3A8"/>
    ${[[140, 1], [420, .8], [1300, 1.1], [1520, .85]].map(([x, k]) => `<g transform="translate(${x} 600) scale(${k})"><rect x="-14" y="-170" width="28" height="180" fill="#8B6B4A"/><circle cx="0" cy="-210" r="95" fill="#5DB85A"/><circle cx="-70" cy="-160" r="60" fill="#4FA84D"/><circle cx="72" cy="-165" r="62" fill="#4FA84D"/></g>`).join('')}
    <ellipse cx="1060" cy="700" rx="230" ry="58" fill="#7FC8F8"/><ellipse cx="1060" cy="694" rx="200" ry="44" fill="#A5DBFA"/>
    <g font-size="64"><text x="960" y="712">🦆</text><text x="1080" y="700">🦆</text></g>
    <g><rect x="560" y="600" width="12" height="80" fill="#8B6B4A"/><rect x="520" y="560" width="92" height="56" rx="8" fill="#fff" stroke="#8B6B4A" stroke-width="6"/><text x="566" y="600" text-anchor="middle" font-size="36">🦆</text></g>
    <g fill="#F7A7C0"><circle cx="300" cy="760" r="9"/><circle cx="330" cy="772" r="9"/><circle cx="1400" cy="770" r="9"/></g><g fill="#FFE066"><circle cx="315" cy="782" r="9"/><circle cx="1420" cy="790" r="9"/></g>
  </svg>`
};
window.EP_FRONT = {     // drawn in front of the characters (the table they sit behind)
  lesson: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect x="270" y="690" width="40" height="150" rx="8" fill="#B07A47"/><rect x="1290" y="690" width="40" height="150" rx="8" fill="#B07A47"/>
    <rect x="240" y="650" width="1120" height="56" rx="18" fill="#C98B52"/><rect x="240" y="650" width="1120" height="18" rx="9" fill="#DDA36A"/>
  </svg>`,
  dining: `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
    <rect x="270" y="690" width="40" height="150" rx="8" fill="#B07A47"/><rect x="1290" y="690" width="40" height="150" rx="8" fill="#B07A47"/>
    <rect x="240" y="650" width="1120" height="56" rx="18" fill="#C98B52"/><rect x="240" y="650" width="1120" height="18" rx="9" fill="#DDA36A"/>
    <path d="M250 668 h1100 v18 q-550 30 -1100 0 z" fill="#fff" opacity=".55"/>
    ${[['zuzia', 450], ['fifi', 700], ['pip', 950], ['kuba', 1200]].map(([w, x]) => `
      <g id="plate-${w}"><ellipse cx="${x}" cy="652" rx="78" ry="20" fill="#fff" stroke="#E3E3E3" stroke-width="4"/><ellipse cx="${x}" cy="648" rx="54" ry="11" fill="#F2F2F2"/>
        <ellipse class="soup" cx="${x}" cy="647" rx="52" ry="10" fill="#F2A541" opacity="0"/><circle class="soup" cx="${x - 14}" cy="645" r="5" fill="#7FBF5E" opacity="0"/><circle class="soup" cx="${x + 16}" cy="648" r="5" fill="#E8505B" opacity="0"/></g>
      <rect x="${x + 82}" y="600" width="12" height="52" rx="5" fill="#C9CED4"/><ellipse cx="${x + 88}" cy="600" rx="12" ry="8" fill="#C9CED4"/>`).join('')}
    <g id="cup-fifi"><path d="M770 590 h44 l-6 62 h-32 z" fill="#E8F6FF" stroke="#9CC9E4" stroke-width="4"/><rect id="cup-water" x="776" y="650" width="32" height="0" fill="#7FC8F8" opacity=".85"/></g>
  </svg>`
};
})();
