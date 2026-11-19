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

/* ---- autumn ---- */
CLOTHES.sweter = { box: [30, 104, 140, 116], svg: `
    <path d="M68 126 Q50 150 47 186" stroke="#5DB585" stroke-width="20" stroke-linecap="round" fill="none"/>
    <path d="M132 126 Q150 150 153 186" stroke="#5DB585" stroke-width="20" stroke-linecap="round" fill="none"/>
    <path d="M62 118 Q100 106 138 118 L140 208 Q100 214 60 208 Z" fill="#5DB585"/>
    <path d="M66 150 l8 -6 8 6 8 -6 8 6 8 -6 8 6 8 -6 8 6 8 -6" stroke="#FFE7A8" stroke-width="3" fill="none"/>
    <path d="M66 166 l8 -6 8 6 8 -6 8 6 8 -6 8 6 8 -6 8 6 8 -6" stroke="#FFE7A8" stroke-width="3" fill="none"/>
    <rect x="60" y="200" width="80" height="10" rx="4" fill="#4A9C70"/>
    <ellipse cx="47" cy="188" rx="10" ry="5" fill="#4A9C70"/><ellipse cx="153" cy="188" rx="10" ry="5" fill="#4A9C70"/>
    <path d="M84 110 Q100 120 116 110 L114 106 Q100 114 86 106 Z" fill="#4A9C70"/>` };
CLOTHES.kalosze = { box: [52, 244, 96, 66], svg: `
    <path d="M70 250 H98 V306 H64 Q55 306 57 298 Q59 291 70 289 Z" fill="#E8505B"/>
    <path d="M102 250 H130 V289 Q141 291 143 298 Q145 306 136 306 H102 Z" fill="#E8505B"/>
    <rect x="68" y="246" width="32" height="9" rx="4" fill="#C93E48"/><rect x="100" y="246" width="32" height="9" rx="4" fill="#C93E48"/>
    <path d="M76 260 v24 M108 260 v24" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <rect x="58" y="302" width="40" height="5" rx="2" fill="#8E2A32"/><rect x="102" y="302" width="40" height="5" rx="2" fill="#8E2A32"/>` };
CLOTHES.plaszcz = { box: [26, 98, 148, 150], svg: `
    <path d="M67 124 Q46 150 44 186" stroke="#FFD23F" stroke-width="25" stroke-linecap="round" fill="none"/>
    <path d="M133 124 Q154 150 156 186" stroke="#FFD23F" stroke-width="25" stroke-linecap="round" fill="none"/>
    <ellipse cx="44" cy="190" rx="13" ry="5" fill="#E9B820"/><ellipse cx="156" cy="190" rx="13" ry="5" fill="#E9B820"/>
    <path d="M58 116 Q100 102 142 116 L152 238 Q100 246 48 238 Z" fill="#FFD23F"/>
    <line x1="100" y1="110" x2="100" y2="242" stroke="#E9B820" stroke-width="3"/>
    <g fill="#5A4632"><rect x="104" y="134" width="12" height="5" rx="2"/><rect x="104" y="160" width="12" height="5" rx="2"/><rect x="104" y="186" width="12" height="5" rx="2"/><rect x="104" y="212" width="12" height="5" rx="2"/></g>
    <path d="M66 200 h20 v6 h-20 Z M114 200 h20 v6 h-20 Z" fill="#E9B820"/>
    <path d="M80 110 Q100 124 120 110 L117 102 Q100 114 83 102 Z" fill="#E9B820"/>` };
CLOTHES['kapelusz-deszcz'] = { box: [36, 12, 128, 72], svg: `
    <path d="M62 64 Q64 24 100 22 Q136 24 138 64 Z" fill="#FFD23F"/>
    <path d="M80 28 Q76 46 78 62 M120 28 Q124 46 122 62" stroke="#E9B820" stroke-width="3" fill="none"/>
    <path d="M42 66 Q100 50 158 66 Q164 78 152 80 Q100 66 48 80 Q36 78 42 66 Z" fill="#F2C12E"/>` };
CLOTHES.parasol = { box: [84, -6, 132, 222], shelfBox: [60, 10, 80, 200], shelf: `
    <path d="M100 30 L118 150 Q100 158 82 150 Z" fill="#5B8DEF"/><path d="M100 30 L106 150 M100 30 L94 150" stroke="#3E6FD0" stroke-width="2"/>
    <line x1="100" y1="16" x2="100" y2="186" stroke="#5A4632" stroke-width="4" stroke-linecap="round"/>
    <path d="M100 186 q0 12 -10 12 q-8 0 -8 -8" stroke="#5A4632" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  svg: `
    <line x1="150" y1="10" x2="155" y2="204" stroke="#5A4632" stroke-width="4" stroke-linecap="round"/>
    <path d="M156 202 q1 12 -9 13 q-8 0 -8 -8" stroke="#5A4632" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M88 70 Q150 -4 212 70 Q197 60 181 70 Q166 60 150 70 Q135 60 119 70 Q104 60 88 70 Z" fill="#5B8DEF"/>
    <path d="M150 6 Q130 36 119 70 M150 6 Q170 36 181 70 M150 6 V70" stroke="#3E6FD0" stroke-width="2.5" fill="none"/>
    <circle cx="150" cy="6" r="4" fill="#5A4632"/>` };
/* ---- summer ---- */
CLOTHES.spodenki = { box: [64, 192, 72, 52], svg: `
    <path d="M68 198 H132 L131 240 H106 L101 220 H99 L94 240 H69 Z" fill="#6FA8DC"/>
    <rect x="68" y="196" width="64" height="8" rx="3" fill="#4F8BC2"/>
    <path d="M80 214 v10 M120 214 v10" stroke="#4F8BC2" stroke-width="2.5" stroke-linecap="round"/>` };
CLOTHES.koszulka = { box: [42, 104, 116, 108], svg: `
    <path d="M66 120 L46 146 L60 156 L72 138 Z" fill="#FF6F61"/><path d="M134 120 L154 146 L140 156 L128 138 Z" fill="#FF6F61"/>
    <path d="M64 118 Q100 106 136 118 L138 206 Q100 212 62 206 Z" fill="#FF6F61"/>
    <path d="M86 112 Q100 122 114 112" stroke="#E2554A" stroke-width="4" fill="none"/>
    <path d="M100 140 l5 10 11 1.5 -8 7.5 2 11 -10 -5.2 -10 5.2 2 -11 -8 -7.5 11 -1.5 Z" fill="#FFE066"/>` };
CLOTHES.klapki = { box: [60, 278, 80, 30], svg: `
    <ellipse cx="84" cy="299" rx="18" ry="7" fill="#4CC3D9"/><ellipse cx="116" cy="299" rx="18" ry="7" fill="#4CC3D9"/>
    <path d="M84 296 L75 287 M84 296 L93 287 M116 296 L107 287 M116 296 L125 287" stroke="#FF7A9A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="84" cy="296" r="3" fill="#FF7A9A"/><circle cx="116" cy="296" r="3" fill="#FF7A9A"/>` };
CLOTHES.okulary = { box: [68, 62, 64, 30], svg: `
    <rect x="72" y="66" width="26" height="20" rx="8" fill="#2B2B3A"/><rect x="102" y="66" width="26" height="20" rx="8" fill="#2B2B3A"/>
    <path d="M98 74 h4 M72 72 L60 68 M128 72 L140 68" stroke="#2B2B3A" stroke-width="3" stroke-linecap="round"/>
    <path d="M77 72 l6 -3 M107 72 l6 -3" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>` };
CLOTHES['kapelusz-slonce'] = { box: [34, 6, 132, 72], svg: `
    <ellipse cx="100" cy="58" rx="64" ry="14" fill="#F3D27A"/>
    <path d="M66 56 Q68 16 100 14 Q132 16 134 56 Z" fill="#F7DC8E"/>
    <rect x="66" y="44" width="68" height="10" rx="3" fill="#FF7A9A"/>
    <path d="M44 58 Q100 72 156 58" stroke="#E2BE5E" stroke-width="2" fill="none"/>` };
CLOTHES.wiaderko = { box: [24, 192, 44, 60], svg: `
    <path d="M32 200 Q46 182 60 200" stroke="#5A4632" stroke-width="3" fill="none"/>
    <path d="M28 210 H64 L59 248 H33 Z" fill="#FFC93C"/>
    <rect x="26" y="206" width="40" height="8" rx="3" fill="#F0A92A"/>
    <path d="M38 224 l6 -6 6 6 6 -6" stroke="#fff" stroke-width="2.5" fill="none" opacity=".7"/>` };

const ORDER = ['spodnie', 'buty', 'kurtka', 'szalik', 'rekawiczki', 'czapka'];   // winter: bottom → top on the body

window.DRESS_ART = {
  ORDER,
  kid(worn, layers = ORDER) {
    return `<svg class="kid-svg" viewBox="0 0 200 320">${BASE}${layers.map(id =>
      `<g class="cl ${worn && worn.includes(id) ? 'on' : ''}" data-cl="${id}">${CLOTHES[id].svg}</g>`).join('')}</svg>`;
  },
  item(id) {
    const c = CLOTHES[id], b = c.shelfBox || c.box;
    return `<svg viewBox="${b.join(' ')}">${c.shelf || c.svg}</svg>`;
  }
};
})();
