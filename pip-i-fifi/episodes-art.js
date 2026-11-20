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
  </svg>`
};
})();
