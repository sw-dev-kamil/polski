/* =====================================================================
   PIP & FIFI — teddy for the bath game (original art). Each body part is
   its own <g data-part> so it can be tapped, foamed and highlighted.
   ===================================================================== */
(() => {
const BR = '#B07A4F', LT = '#E8C9A0', DK = '#4A3428';
const PARTS = {
  nozki: `<ellipse cx="112" cy="352" rx="34" ry="38" fill="${BR}"/><ellipse cx="188" cy="352" rx="34" ry="38" fill="${BR}"/>
    <ellipse cx="112" cy="360" rx="20" ry="20" fill="${LT}"/><ellipse cx="188" cy="360" rx="20" ry="20" fill="${LT}"/>`,
  raczki: `<ellipse cx="80" cy="245" rx="26" ry="56" fill="${BR}" transform="rotate(22 80 245)"/><ellipse cx="220" cy="245" rx="26" ry="56" fill="${BR}" transform="rotate(-22 220 245)"/>
    <circle cx="66" cy="290" r="18" fill="${LT}"/><circle cx="234" cy="290" r="18" fill="${LT}"/>`,
  body: `<ellipse cx="150" cy="265" rx="80" ry="96" fill="${BR}"/>`,
  brzuszek: `<ellipse cx="150" cy="278" rx="50" ry="60" fill="${LT}"/>`,
  uszy: `<circle cx="92" cy="72" r="30" fill="${BR}"/><circle cx="208" cy="72" r="30" fill="${BR}"/><circle cx="92" cy="72" r="16" fill="${LT}"/><circle cx="208" cy="72" r="16" fill="${LT}"/>`,
  glowa: `<circle cx="150" cy="122" r="72" fill="${BR}"/>
    <circle cx="124" cy="112" r="8" fill="${DK}"/><circle cx="176" cy="112" r="8" fill="${DK}"/><circle cx="127" cy="109" r="2.5" fill="#fff"/><circle cx="179" cy="109" r="2.5" fill="#fff"/>
    <ellipse cx="150" cy="150" rx="36" ry="27" fill="${LT}"/><path d="M138 160 q12 10 24 0" stroke="${DK}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="112" cy="138" rx="11" ry="7" fill="#F2A0A0" opacity=".6"/><ellipse cx="188" cy="138" rx="11" ry="7" fill="#F2A0A0" opacity=".6"/>`,
  nos: `<circle cx="150" cy="142" r="24" fill="transparent"/><ellipse cx="150" cy="142" rx="15" ry="11" fill="${DK}"/><ellipse cx="146" cy="138" rx="4" ry="2.5" fill="#fff" opacity=".6"/>`
};
const ORDER = ['nozki', 'raczki', 'body', 'brzuszek', 'uszy', 'glowa', 'nos'];   // drawing order (bottom → top)
const FOAM_AT = { glowa: [150, 70], uszy: [[92, 72], [208, 72]], nos: [150, 142], brzuszek: [150, 270], raczki: [[66, 280], [234, 280]], nozki: [[112, 350], [188, 350]] };
window.TEDDY_ART = {
  svg(highlight) {
    return `<svg viewBox="0 0 300 400" class="teddy-svg">${ORDER.map(p => `<g data-part="${p}" class="${p === highlight ? 'hl' : ''}">${PARTS[p]}</g>`).join('')}<g class="mud">${[[118, 92, 13], [190, 160, 10], [120, 250, 16], [178, 300, 12], [70, 230, 11], [230, 270, 10], [110, 345, 13], [196, 362, 11], [205, 80, 8]].map(([x, y, r]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .75}" fill="#6B4A2E" opacity=".7"/><circle cx="${x + r}" cy="${y - r * .6}" r="${r * .3}" fill="#6B4A2E" opacity=".6"/>`).join('')}</g><g class="foam-layer"></g></svg>`;
  },
  foam(id) {                                      // a cluster of bubbles at that part
    const at = FOAM_AT[id], spots = Array.isArray(at[0]) ? at : [at];
    return spots.map(([x, y]) => [0, 1, 2, 3, 4, 5].map(i => {
      const a = i * 1.05, r = 10 + (i % 3) * 5, d = i ? 18 : 0;
      return `<circle cx="${x + Math.cos(a) * d}" cy="${y + Math.sin(a) * d}" r="${r}" fill="#fff" stroke="#CFE8FF" stroke-width="2" opacity=".95"/>`;
    }).join('')).join('');
  }
};
})();
