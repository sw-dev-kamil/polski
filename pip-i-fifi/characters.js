/* =====================================================================
   Pip the hedgehog and Fifi the fox — original characters, drawn as SVG.
   Parts with classes are animated by CSS: .eye (blink), .mouth-o / .mouth-c
   (talking), .arm-wave (waving).
   ===================================================================== */
(() => {
  function spikes(cx, cy, r1, r2, n, a0, a1) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const t = a0 + (a1 - a0) * i / n;
      const tm = a0 + (a1 - a0) * (i + 0.5) / n;
      const x1 = cx + r1 * Math.cos(t), y1 = cy + r1 * Math.sin(t);
      d += (i === 0 ? 'M' : 'L') + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' ';
      if (i < n) {
        const x2 = cx + r2 * Math.cos(tm), y2 = cy + r2 * Math.sin(tm);
        d += 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' ';
      }
    }
    return d + 'Z';
  }

  const eyes = (lx, rx, y) => `
    <g class="eye"><ellipse cx="${lx}" cy="${y}" rx="8" ry="10" fill="#2B2118"/><circle cx="${lx + 2.5}" cy="${y - 3.5}" r="3" fill="#fff"/></g>
    <g class="eye"><ellipse cx="${rx}" cy="${y}" rx="8" ry="10" fill="#2B2118"/><circle cx="${rx + 2.5}" cy="${y - 3.5}" r="3" fill="#fff"/></g>`;
  const mouth = (x, y) => `
    <path class="mouth-c" d="M${x - 10} ${y} Q${x} ${y + 9} ${x + 10} ${y}" fill="none" stroke="#5A2E22" stroke-width="3.5" stroke-linecap="round"/>
    <g class="mouth-o"><ellipse cx="${x}" cy="${y + 3}" rx="8.5" ry="8" fill="#7A2E2E"/><ellipse cx="${x}" cy="${y + 7}" rx="5" ry="3" fill="#F08A8A"/></g>`;

  window.pipSVG = () => `
  <svg viewBox="0 0 200 220" class="char-svg">
    <ellipse cx="100" cy="212" rx="62" ry="7" fill="rgba(0,0,0,.12)"/>
    <path d="${spikes(100, 128, 78, 98, 15, Math.PI * 0.95, Math.PI * 2.05)}" fill="#7A5232"/>
    <path d="${spikes(100, 128, 68, 84, 13, Math.PI * 1.0, Math.PI * 2.0)}" fill="#946640"/>
    <ellipse cx="100" cy="150" rx="74" ry="60" fill="#946640"/>
    <ellipse cx="62" cy="96" rx="13" ry="12" fill="#E6C08F"/><ellipse cx="62" cy="96" rx="7" ry="6" fill="#F2A7A0"/>
    <ellipse cx="138" cy="96" rx="13" ry="12" fill="#E6C08F"/><ellipse cx="138" cy="96" rx="7" ry="6" fill="#F2A7A0"/>
    <ellipse cx="100" cy="142" rx="56" ry="50" fill="#F4DDB8"/>
    <ellipse cx="62" cy="186" rx="13" ry="16" fill="#E6C08F" transform="rotate(20 62 186)"/>
    <g class="arm-wave" style="transform-origin:140px 178px"><ellipse cx="146" cy="176" rx="12" ry="17" fill="#E6C08F" transform="rotate(-25 146 176)"/></g>
    <ellipse cx="78" cy="206" rx="20" ry="9" fill="#6B4423"/><ellipse cx="122" cy="206" rx="20" ry="9" fill="#6B4423"/>
    ${eyes(80, 120, 128)}
    <circle cx="64" cy="150" r="9" fill="#F7A1A1" opacity=".7"/><circle cx="136" cy="150" r="9" fill="#F7A1A1" opacity=".7"/>
    <ellipse cx="100" cy="150" rx="18" ry="13" fill="#FBEBD3"/>
    <ellipse cx="100" cy="144" rx="9" ry="7" fill="#3A2A20"/><circle cx="97" cy="142" r="2.2" fill="#fff" opacity=".7"/>
    ${mouth(100, 162)}
  </svg>`;

  window.fifiSVG = () => `
  <svg viewBox="0 0 200 220" class="char-svg">
    <ellipse cx="100" cy="212" rx="60" ry="7" fill="rgba(0,0,0,.12)"/>
    <g class="tail"><path d="M124 194 C172 204 202 166 190 120 C184 98 162 92 154 108 C164 140 150 166 122 172 Z" fill="#F28C38"/>
      <path d="M190 120 C184 98 162 92 154 108 C160 120 178 128 190 120 Z" fill="#FFF7EE"/></g>
    <ellipse cx="100" cy="178" rx="40" ry="32" fill="#F28C38"/>
    <ellipse cx="100" cy="184" rx="24" ry="22" fill="#FFF7EE"/>
    <ellipse cx="78" cy="206" rx="16" ry="8" fill="#5A3A2A"/><ellipse cx="122" cy="206" rx="16" ry="8" fill="#5A3A2A"/>
    <ellipse cx="66" cy="182" rx="10" ry="15" fill="#E5782A" transform="rotate(20 66 182)"/>
    <g class="arm-wave" style="transform-origin:132px 176px"><ellipse cx="136" cy="174" rx="10" ry="15" fill="#E5782A" transform="rotate(-25 136 174)"/></g>
    <path d="M48 78 L42 22 L88 58 Z" fill="#F28C38"/><path d="M54 66 L51 36 L76 56 Z" fill="#FFC9B0"/>
    <path d="M152 78 L158 22 L112 58 Z" fill="#F28C38"/><path d="M146 66 L149 36 L124 56 Z" fill="#FFC9B0"/>
    <ellipse cx="100" cy="108" rx="62" ry="52" fill="#F28C38"/>
    <path d="M40 112 C50 150 80 160 100 160 C120 160 150 150 160 112 C140 128 120 126 100 140 C80 126 60 128 40 112 Z" fill="#FFF7EE"/>
    ${eyes(78, 122, 104)}
    <circle cx="60" cy="128" r="9" fill="#F7A1A1" opacity=".75"/><circle cx="140" cy="128" r="9" fill="#F7A1A1" opacity=".75"/>
    <ellipse cx="100" cy="132" rx="8" ry="6" fill="#2B2118"/><circle cx="97" cy="130" r="2" fill="#fff" opacity=".7"/>
    ${mouth(100, 146)}
  </svg>`;

  window.charHTML = (who, extra = '') =>
    `<div class="char ${who} ${extra}" data-who="${who}">${who === 'pip' ? pipSVG() : fifiSVG()}</div>`;
})();
