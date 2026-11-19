/* =====================================================================
   PIP & FIFI — dress-up drawings (original art)
   One child in a vest + clothes drawn in the SAME coordinates (viewBox 0 0 200 320),
   so each piece of clothing lands exactly on the body.
   box = the part of the picture shown on the shelf.
   ===================================================================== */
(() => {
const SKIN = '#FFDDC1', HAIR = '#8B5A2B';

const BASE = `
  <circle cx="54" cy="66" r="14" fill="${HAIR}"/><circle cx="146" cy="66" r="14" fill="${HAIR}"/>
  <circle cx="63" cy="57" r="5" fill="#FF7A9A"/><circle cx="137" cy="57" r="5" fill="#FF7A9A"/>
  <rect x="76" y="208" width="20" height="78" rx="10" fill="${SKIN}"/>
  <rect x="104" y="208" width="20" height="78" rx="10" fill="${SKIN}"/>
  <ellipse cx="84" cy="290" rx="15" ry="9" fill="#fff" stroke="#E5D8CC" stroke-width="2"/>
  <ellipse cx="116" cy="290" rx="15" ry="9" fill="#fff" stroke="#E5D8CC" stroke-width="2"/>
  <path d="M68 128 Q50 150 46 196" stroke="${SKIN}" stroke-width="16" stroke-linecap="round" fill="none"/>
  <path d="M132 128 Q150 150 154 196" stroke="${SKIN}" stroke-width="16" stroke-linecap="round" fill="none"/>
  <circle cx="46" cy="203" r="10" fill="${SKIN}"/><circle cx="154" cy="203" r="10" fill="${SKIN}"/>
  <rect x="92" y="104" width="16" height="18" fill="${SKIN}"/>
  <path d="M66 122 Q100 110 134 122 L136 206 Q100 212 64 206 Z" fill="#fff" stroke="#EADFD4" stroke-width="2"/>
  <path d="M68 200 H132 V224 Q118 230 104 224 L100 214 L96 224 Q82 230 68 224 Z" fill="#9ED3F0"/>
  <circle cx="100" cy="70" r="42" fill="${SKIN}"/>
  <path d="M58 70 Q58 26 100 26 Q142 26 142 70 Q130 48 114 54 Q102 42 88 54 Q72 48 58 70 Z" fill="${HAIR}"/>
  <g class="eye"><ellipse cx="86" cy="76" rx="5" ry="6.5" fill="#2B2118"/><circle cx="87.5" cy="73.5" r="1.8" fill="#fff"/></g>
  <g class="eye"><ellipse cx="114" cy="76" rx="5" ry="6.5" fill="#2B2118"/><circle cx="115.5" cy="73.5" r="1.8" fill="#fff"/></g>
  <ellipse cx="76" cy="90" rx="8" ry="5" fill="#FF9E9E" opacity=".6"/><ellipse cx="124" cy="90" rx="8" ry="5" fill="#FF9E9E" opacity=".6"/>
  <ellipse cx="100" cy="86" rx="3" ry="2.2" fill="#F2B096"/>
  <path class="kid-mouth" d="M90 95 Q100 104 110 95" stroke="#B5523B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path class="kid-mouth-open" d="M89 94 Q100 110 111 94 Z" fill="#B5523B"/>`;

const mittenL = `<ellipse cx="45" cy="207" rx="13" ry="15" fill="#FFC93C"/><ellipse cx="57" cy="200" rx="5" ry="7.5" fill="#FFC93C" transform="rotate(25 57 200)"/>
  <rect x="34" y="188" width="22" height="8" rx="4" fill="#F0A92A"/><path d="M38 210 h14" stroke="#F0A92A" stroke-width="2.5" stroke-linecap="round"/>`;
const mittenR = `<ellipse cx="155" cy="207" rx="13" ry="15" fill="#FFC93C"/><ellipse cx="143" cy="200" rx="5" ry="7.5" fill="#FFC93C" transform="rotate(-25 143 200)"/>
  <rect x="144" y="188" width="22" height="8" rx="4" fill="#F0A92A"/><path d="M148 210 h14" stroke="#F0A92A" stroke-width="2.5" stroke-linecap="round"/>`;

/* drawn in this order on the child (bottom → top) */
const CLOTHES = {
  spodnie: { box: [62, 192, 76, 96], svg: `
    <path d="M68 198 H132 L130 282 H106 L101 224 H99 L94 282 H70 Z" fill="#3F6FB5"/>
    <rect x="68" y="196" width="64" height="9" rx="3" fill="#345C99"/>
    <path d="M76 250 h14 M110 250 h14" stroke="#345C99" stroke-width="3" stroke-linecap="round"/>` },
  buty: { box: [54, 256, 92, 56], svg: `
    <path d="M72 266 H96 V306 H66 Q57 306 59 298 Q61 290 72 288 Z" fill="#8B4A2E"/>
    <path d="M104 266 H128 V288 Q139 290 141 298 Q143 306 134 306 H104 Z" fill="#8B4A2E"/>
    <rect x="69" y="261" width="30" height="10" rx="5" fill="#F4E6D2"/><rect x="101" y="261" width="30" height="10" rx="5" fill="#F4E6D2"/>
    <rect x="60" y="302" width="36" height="5" rx="2" fill="#5E3220"/><rect x="104" y="302" width="36" height="5" rx="2" fill="#5E3220"/>` },
  kurtka: { box: [28, 100, 144, 126], svg: `
    <path d="M68 126 Q48 150 45 186" stroke="#F26B4E" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M132 126 Q152 150 155 186" stroke="#F26B4E" stroke-width="24" stroke-linecap="round" fill="none"/>
    <ellipse cx="45" cy="190" rx="12" ry="5" fill="#D9533A"/><ellipse cx="155" cy="190" rx="12" ry="5" fill="#D9533A"/>
    <path d="M60 118 Q100 104 140 118 L144 214 Q100 222 56 214 Z" fill="#F26B4E"/>
    <path d="M62 150 Q100 158 138 150 M60 182 Q100 190 140 182" stroke="#E25C40" stroke-width="2.5" fill="none"/>
    <line x1="100" y1="112" x2="100" y2="218" stroke="#D9533A" stroke-width="3"/>
    <rect x="70" y="190" width="18" height="13" rx="4" fill="#D9533A"/><rect x="112" y="190" width="18" height="13" rx="4" fill="#D9533A"/>
    <path d="M80 112 Q100 126 120 112 L118 104 Q100 116 82 104 Z" fill="#D9533A"/>` },
  szalik: { box: [68, 98, 66, 78], svg: `
    <path d="M77 106 Q100 120 123 106 L125 121 Q100 135 75 121 Z" fill="#4CC373"/>
    <path d="M86 108 l3 13 M100 112 v14 M114 108 l-3 13" stroke="#FFE066" stroke-width="4"/>
    <rect x="106" y="118" width="17" height="46" rx="5" fill="#4CC373" transform="rotate(-6 114 118)"/>
    <path d="M107 134 l16 -2 M108 148 l16 -2" stroke="#FFE066" stroke-width="5" />
    <path d="M110 164 v7 M115 164 v7 M120 163 v7" stroke="#3BA862" stroke-width="2.5" stroke-linecap="round"/>` },
  rekawiczki: { box: [28, 184, 144, 42], shelf: `<g transform="translate(40 0)">${mittenL}</g><g transform="translate(-40 0)">${mittenR}</g>`, shelfBox: [60, 182, 80, 46],
    svg: mittenL + mittenR },
  czapka: { box: [46, 4, 108, 76], svg: `
    <path d="M56 64 Q58 20 100 18 Q142 20 144 64 Z" fill="#4A90E2"/>
    <path d="M78 26 Q74 44 76 62 M100 18 V62 M122 26 Q126 44 124 62" stroke="#3A78C2" stroke-width="3" fill="none"/>
    <rect x="52" y="56" width="96" height="17" rx="8.5" fill="#3A78C2"/>
    <circle cx="100" cy="15" r="11" fill="#fff"/><circle cx="96" cy="12" r="3" fill="#EEF4FF"/>` }
};
const ORDER = ['spodnie', 'buty', 'kurtka', 'szalik', 'rekawiczki', 'czapka'];   // bottom → top on the body

window.DRESS_ART = {
  ORDER,
  kid(worn) {
    return `<svg class="kid-svg" viewBox="0 0 200 320">${BASE}${ORDER.map(id =>
      `<g class="cl ${worn && worn.includes(id) ? 'on' : ''}" data-cl="${id}">${CLOTHES[id].svg}</g>`).join('')}</svg>`;
  },
  item(id) {
    const c = CLOTHES[id], b = c.shelfBox || c.box;
    return `<svg viewBox="${b.join(' ')}">${c.shelf || c.svg}</svg>`;
  }
};
})();
