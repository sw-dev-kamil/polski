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
    <g class="eye"><ellipse cx="${rx}" cy="${y}" rx="8" ry="10" fill="#2B2118"/><circle cx="${rx + 2.5}" cy="${y - 3.5}" r="3" fill="#fff"/></g>
    <path class="eye-happy" d="M${lx - 9} ${y + 3} Q${lx} ${y - 9} ${lx + 9} ${y + 3} M${rx - 9} ${y + 3} Q${rx} ${y - 9} ${rx + 9} ${y + 3}" fill="none" stroke="#2B2118" stroke-width="4.5" stroke-linecap="round"/>`;
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


  /* ---- episode cast: Pani Sowa (owl teacher), Zuzia (bunny), Kuba (bear cub) ---- */
  const sowaSVG = () => `<svg viewBox="0 0 200 250" aria-hidden="true">
    <path d="M52 62 L44 18 L80 46 Z M148 62 L156 18 L120 46 Z" fill="#7E6248"/>
    <ellipse cx="100" cy="160" rx="78" ry="86" fill="#9C7B5B"/>
    <ellipse cx="100" cy="176" rx="50" ry="62" fill="#EBDDC2"/>
    <path d="M78 150 l8 8 8 -8 M106 150 l8 8 8 -8 M86 176 l8 8 8 -8 M100 200 l8 8 8 -8 M78 200 l8 8 8 -8" stroke="#C9B48F" stroke-width="3" fill="none"/>
    <path d="M24 150 Q10 200 46 228 Q40 188 54 150 Z" fill="#7E6248"/>
    <g class="arm-wave" style="transform-origin:160px 150px"><path d="M176 150 Q192 200 154 228 Q160 188 146 150 Z" fill="#7E6248"/></g>
    <ellipse cx="100" cy="86" rx="72" ry="58" fill="#9C7B5B"/>
    <circle cx="70" cy="84" r="26" fill="#fff"/><circle cx="130" cy="84" r="26" fill="#fff"/>
    <circle cx="70" cy="84" r="29" fill="none" stroke="#C99A6A" stroke-width="4"/><circle cx="130" cy="84" r="29" fill="none" stroke="#C99A6A" stroke-width="4"/><path d="M99 82 h2" stroke="#C99A6A" stroke-width="4"/>
    <g class="eye"><circle cx="72" cy="86" r="11" fill="#2B2118"/><circle cx="75" cy="82" r="3.5" fill="#fff"/></g>
    <g class="eye"><circle cx="128" cy="86" r="11" fill="#2B2118"/><circle cx="131" cy="82" r="3.5" fill="#fff"/></g>
    <path class="eye-happy" d="M60 90 Q72 76 84 90 M116 90 Q128 76 140 90" fill="none" stroke="#2B2118" stroke-width="5" stroke-linecap="round"/>
    <path class="mouth-c" d="M92 108 L100 122 L108 108 Z" fill="#F2A23C"/>
    <g class="mouth-o"><path d="M91 106 L100 116 L109 106 Z" fill="#F2A23C"/><path d="M93 118 L100 128 L107 118 Z" fill="#E08A26"/></g>
    <path d="M70 134 Q100 150 130 134 L126 146 Q100 160 74 146 Z" fill="#FF8FB1"/><circle cx="100" cy="148" r="7" fill="#FF6F9A"/>
    <ellipse cx="78" cy="244" rx="16" ry="6" fill="#F2A23C"/><ellipse cx="122" cy="244" rx="16" ry="6" fill="#F2A23C"/>
  </svg>`;
  const zuziaSVG = () => `<svg viewBox="0 0 200 250" aria-hidden="true">
    <path d="M70 92 C52 30 58 0 74 2 C92 4 92 50 88 92 Z" fill="#F4EEF0"/><path d="M74 86 C64 40 66 16 74 16 C84 18 84 52 82 86 Z" fill="#FFC1D4"/>
    <path d="M130 92 C148 30 142 0 126 2 C108 4 108 50 112 92 Z" fill="#F4EEF0"/><path d="M126 86 C136 40 134 16 126 16 C116 18 116 52 118 86 Z" fill="#FFC1D4"/>
    <path d="M58 168 Q100 150 142 168 L152 236 Q100 250 48 236 Z" fill="#FF8FB1"/>
    <path d="M58 180 Q38 196 44 214" stroke="#F4EEF0" stroke-width="16" stroke-linecap="round" fill="none"/>
    <g class="arm-wave" style="transform-origin:142px 178px"><path d="M142 180 Q162 196 156 214" stroke="#F4EEF0" stroke-width="16" stroke-linecap="round" fill="none"/></g>
    <circle cx="100" cy="122" r="56" fill="#F4EEF0"/>
    <path d="M118 74 l16 -10 2 18 Z M118 74 l-14 -12 -2 18 Z" fill="#FF6F9A"/><circle cx="118" cy="74" r="6" fill="#FF4F86"/>
    ${eyes(80, 120, 116)}
    <circle cx="66" cy="138" r="9" fill="#FFB6C9" opacity=".8"/><circle cx="134" cy="138" r="9" fill="#FFB6C9" opacity=".8"/>
    <ellipse cx="100" cy="134" rx="7" ry="5" fill="#FF7A9A"/>
    ${mouth(100, 148)}
    <ellipse cx="80" cy="242" rx="18" ry="8" fill="#F4EEF0"/><ellipse cx="120" cy="242" rx="18" ry="8" fill="#F4EEF0"/>
  </svg>`;
  const kubaSVG = () => `<svg viewBox="0 0 200 230" aria-hidden="true">
    <circle cx="56" cy="58" r="22" fill="#B07A4F"/><circle cx="144" cy="58" r="22" fill="#B07A4F"/><circle cx="56" cy="58" r="11" fill="#E8C9A0"/><circle cx="144" cy="58" r="11" fill="#E8C9A0"/>
    <path d="M56 152 Q100 138 144 152 L148 214 Q100 226 52 214 Z" fill="#5B8DEF"/><path d="M90 150 l10 14 10 -14" stroke="#FFE066" stroke-width="5" fill="none"/>
    <path d="M58 164 Q38 180 44 200" stroke="#B07A4F" stroke-width="18" stroke-linecap="round" fill="none"/>
    <g class="arm-wave" style="transform-origin:142px 162px"><path d="M142 164 Q162 180 156 200" stroke="#B07A4F" stroke-width="18" stroke-linecap="round" fill="none"/></g>
    <circle cx="100" cy="100" r="56" fill="#B07A4F"/>
    <ellipse cx="100" cy="122" rx="28" ry="21" fill="#E8C9A0"/>
    ${eyes(80, 120, 94)}
    <ellipse cx="100" cy="112" rx="10" ry="7" fill="#3A2A20"/>
    ${mouth(100, 128)}
    <ellipse cx="78" cy="222" rx="20" ry="9" fill="#B07A4F"/><ellipse cx="122" cy="222" rx="20" ry="9" fill="#B07A4F"/>
  </svg>`;
  const CAST = { pip: () => pipSVG(), fifi: () => fifiSVG(), sowa: sowaSVG, zuzia: zuziaSVG, kuba: kubaSVG };

  window.charHTML = (who, extra = '') =>
    `<div class="char ${who} ${extra}" data-who="${who}">${(CAST[who] || CAST.pip)()}</div>`;
})();
