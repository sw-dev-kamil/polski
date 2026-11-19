/* =====================================================================
   PIP & FIFI — baking drawings (original art): ingredients, bowl, oven, cake
   ===================================================================== */
(() => {
const ING = {
  maka: `<svg viewBox="0 0 100 120"><path d="M22 30 Q20 18 30 16 H70 Q80 18 78 30 L84 108 Q50 116 16 108 Z" fill="#F3E3C3"/>
    <path d="M28 16 l6 -8 6 8 6 -8 6 8 6 -8 6 8 6 -8" stroke="#D9C39A" stroke-width="4" fill="none"/>
    <circle cx="50" cy="66" r="20" fill="#fff"/><path d="M50 52 V82 M50 60 l-7 -5 M50 60 l7 -5 M50 68 l-7 -5 M50 68 l7 -5 M50 76 l-7 -5 M50 76 l7 -5" stroke="#E2B04A" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  cukier: `<svg viewBox="0 0 100 120"><rect x="20" y="30" width="60" height="80" rx="12" fill="#DDF1FF" stroke="#9CCBEA" stroke-width="4"/>
    <rect x="16" y="20" width="68" height="16" rx="6" fill="#FF7A9A"/>
    <g fill="#fff" stroke="#C8DDEB" stroke-width="2"><rect x="30" y="72" width="16" height="16" rx="3"/><rect x="50" y="76" width="16" height="16" rx="3"/><rect x="38" y="54" width="16" height="16" rx="3"/><rect x="56" y="58" width="14" height="14" rx="3"/></g></svg>`,
  jajka: `<svg viewBox="0 0 100 120"><path d="M8 70 H92 L86 104 H14 Z" fill="#C9B49A"/><path d="M8 70 H92 L88 78 H12 Z" fill="#B39C80"/>
    <ellipse cx="30" cy="58" rx="16" ry="21" fill="#FFF8EC" stroke="#EADBC4" stroke-width="2"/><ellipse cx="54" cy="52" rx="16" ry="21" fill="#F6E1C6" stroke="#E5CBA8" stroke-width="2"/>
    <ellipse cx="76" cy="60" rx="15" ry="20" fill="#FFF8EC" stroke="#EADBC4" stroke-width="2"/><ellipse cx="50" cy="44" rx="5" ry="7" fill="#fff" opacity=".6"/></svg>`,
  mleko: `<svg viewBox="0 0 100 120"><path d="M30 26 H70 V40 L80 52 V110 H20 V52 L30 40 Z" fill="#fff" stroke="#D5E3EE" stroke-width="3"/>
    <rect x="30" y="14" width="40" height="14" rx="4" fill="#5B8DEF"/><path d="M20 72 H80 V96 H20 Z" fill="#5B8DEF"/>
    <path d="M30 84 q8 -10 16 0 q8 10 16 0 q6 -6 10 -2" stroke="#fff" stroke-width="3" fill="none"/></svg>`,
  maslo: `<svg viewBox="0 0 100 120"><path d="M10 80 L50 96 L92 76 L52 62 Z" fill="#E6EEF5"/>
    <path d="M18 62 L50 74 L84 58 L84 74 L50 90 L18 78 Z" fill="#FFD95A"/><path d="M18 62 L52 48 L84 58 L50 74 Z" fill="#FFE68A"/>
    <path d="M50 74 V90" stroke="#E9C13E" stroke-width="2"/></svg>`
};
const BOWL = `<svg viewBox="0 0 300 200" class="bowl-svg">
  <ellipse cx="150" cy="60" rx="135" ry="34" fill="#E9F3FB"/>
  <ellipse class="batter" cx="150" cy="64" rx="118" ry="26" fill="#FFF6E8" opacity="0"/>
  <g class="swirl" style="transform-origin:150px 64px" opacity="0"><path d="M100 64 Q150 40 200 64 Q150 88 110 66" stroke="#F0D9A8" stroke-width="5" fill="none" stroke-linecap="round"/></g>
  <path d="M15 60 Q30 190 150 190 Q270 190 285 60 Q270 100 150 100 Q30 100 15 60 Z" fill="#7FB3E6"/>
  <path d="M40 120 Q150 150 260 120" stroke="#fff" stroke-width="6" fill="none" opacity=".5"/>
  <ellipse cx="150" cy="60" rx="135" ry="34" fill="none" stroke="#5E95CC" stroke-width="8"/>
</svg>`;
const SPOON = `<svg viewBox="0 0 60 200" class="spoon-svg"><rect x="24" y="0" width="12" height="140" rx="6" fill="#C9935A"/><ellipse cx="30" cy="160" rx="22" ry="34" fill="#D9A46A"/></svg>`;
const OVEN = `<svg viewBox="0 0 300 280" class="oven-svg">
  <rect x="10" y="10" width="280" height="260" rx="22" fill="#E9EDF2" stroke="#C7CED6" stroke-width="6"/>
  <rect x="10" y="10" width="280" height="56" rx="22" fill="#D5DBE2"/>
  <circle cx="70" cy="38" r="14" fill="#8E99A6"/><circle cx="120" cy="38" r="14" fill="#8E99A6"/><rect x="190" y="26" width="76" height="24" rx="6" fill="#2B2B3A"/>
  <text class="oven-timer" x="228" y="45" text-anchor="middle" font-size="20" font-family="sans-serif" font-weight="800" fill="#7CFF8A"></text>
  <rect class="oven-window" x="40" y="88" width="220" height="150" rx="16" fill="#3A2F2A"/>
  <rect class="oven-glow" x="40" y="88" width="220" height="150" rx="16" fill="#FF9A3C" opacity="0"/>
  <rect x="60" y="246" width="180" height="12" rx="6" fill="#8E99A6"/>
</svg>`;
const CAKE = `<svg viewBox="0 0 240 200" class="cake-svg">
  <ellipse cx="120" cy="182" rx="110" ry="14" fill="#D5DBE2"/>
  <path class="cake-body" d="M30 110 Q30 70 120 66 Q210 70 210 110 V170 Q120 186 30 170 Z" fill="#E8B45E"/>
  <path d="M30 110 Q120 128 210 110 V122 Q120 140 30 122 Z" fill="#D49A44"/>
  <path class="icing" d="M34 104 Q40 74 120 70 Q200 74 206 104 Q190 116 176 106 Q160 120 146 108 Q130 122 116 108 Q100 122 86 108 Q70 120 56 106 Q44 116 34 104 Z" fill="#FFB6C9" opacity="0"/>
  <g class="sprinkles" opacity="0">${[[70, 90, '#5B8DEF'], [96, 82, '#4CC373'], [120, 92, '#FFC93C'], [146, 80, '#C77DFF'], [170, 92, '#5B8DEF'], [84, 98, '#FF7A59'], [158, 98, '#4CC373'], [132, 76, '#FF7A59']].map(([x, y, c], i) => `<rect x="${x}" y="${y}" width="10" height="4" rx="2" fill="${c}" transform="rotate(${i * 37} ${x + 5} ${y + 2})"/>`).join('')}</g>
  <g class="berries" opacity="0"><path d="M104 60 q16 -2 16 14 q-8 14 -16 14 q-8 0 -16 -14 q0 -16 16 -14 Z" fill="#E8505B"/><path d="M96 58 l8 6 8 -6 -8 -4 Z" fill="#4CC373"/>
    <path d="M136 62 q14 -2 14 12 q-7 12 -14 12 q-7 0 -14 -12 q0 -14 14 -12 Z" fill="#E8505B"/><path d="M129 60 l7 5 7 -5 -7 -4 Z" fill="#4CC373"/></g>
</svg>`;
const TIN = `<svg viewBox="0 0 240 120" class="tin-svg"><path d="M20 30 H220 L206 110 H34 Z" fill="#B8C2CC"/><path d="M28 34 H212 L210 52 H30 Z" fill="#FFF1C9"/><rect x="14" y="24" width="212" height="12" rx="6" fill="#8E99A6"/></svg>`;
window.BAKE_ART = { ING, BOWL, SPOON, OVEN, CAKE, TIN,
  DECO: { posypka: `<svg viewBox="0 0 100 120"><rect x="28" y="30" width="44" height="80" rx="10" fill="#fff" stroke="#E5D8CC" stroke-width="3"/><rect x="24" y="18" width="52" height="16" rx="5" fill="#C77DFF"/>${[[38,60,'#5B8DEF'],[54,70,'#4CC373'],[44,84,'#FFC93C'],[58,92,'#FF7A59'],[40,98,'#C77DFF']].map(([x,y,c])=>`<rect x="${x}" y="${y}" width="10" height="4" rx="2" fill="${c}"/>`).join('')}</svg>`,
    truskawki: `<svg viewBox="0 0 100 120"><ellipse cx="50" cy="96" rx="40" ry="14" fill="#fff" stroke="#E5D8CC" stroke-width="3"/><path d="M38 56 q16 -2 16 14 q-8 18 -16 18 q-8 0 -16 -18 q0 -16 16 -14 Z" fill="#E8505B"/><path d="M30 54 l8 6 8 -6 -8 -4 Z" fill="#4CC373"/><path d="M64 60 q14 -2 14 12 q-7 16 -14 16 q-7 0 -14 -16 q0 -14 14 -12 Z" fill="#E8505B"/><path d="M57 58 l7 5 7 -5 -7 -4 Z" fill="#4CC373"/></svg>`,
    lukier: `<svg viewBox="0 0 100 120"><path d="M34 40 h32 l-4 70 h-24 Z" fill="#FFB6C9"/><rect x="30" y="30" width="40" height="14" rx="5" fill="#FF7A9A"/><path d="M46 110 l4 8 4 -8 Z" fill="#FF7A9A"/></svg>` }
};
})();
