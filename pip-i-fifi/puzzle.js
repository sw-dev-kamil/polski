/* =====================================================================
   PIP & FIFI — 🧩 jigsaw puzzles.
   Real jigsaw pieces (round tabs) cut from a picture. A faint picture on the board shows
   where things go; drag a piece near its place and it snaps in. 4, 6 or 9 pieces.
   To add a picture: put it in puzzles/ and add it to PICTURES below.
   ===================================================================== */
export const PICTURES = [
  { id: 'fifi-pip', src: './puzzles/fifi-pip.jpg', thumb: './puzzles/fifi-pip-thumb.jpg',
    done: [['pip', 'pl', 'To Fifi i Pip!'], ['fifi', 'en', "It's me and Pip!"]] },
  { id: 'playground', src: './puzzles/playground.jpg', thumb: './puzzles/playground-thumb.jpg',
    done: [['pip', 'pl', 'Plac zabaw!'], ['pip', 'pl', 'Huśtawka! Zjeżdżalnia!'], ['fifi', 'en', 'A swing and a slide!']] },
  { id: 'nursery', src: './puzzles/nursery.jpg', thumb: './puzzles/nursery-thumb.jpg',
    done: [['pip', 'pl', 'W przedszkolu!'], ['pip', 'pl', 'Klocki!'], ['fifi', 'en', 'Building a tower with Pani Sowa!']] }
];
export const SIZES = [{ n: 4, c: 2, r: 2 }, { n: 6, c: 3, r: 2 }, { n: 9, c: 3, r: 3 }];

/* one side of a piece: straight (0) or with a tab going out (+1) / in (-1). Drawn from (x0,y0) to (x1,y1). */
function edge(p, x0, y0, x1, y1, tab, K) {
  if (!tab) { p.lineTo(x1, y1); return; }
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = uy * tab, ny = -ux * tab;   // normal points out of the piece
  const P = (a, b) => [x0 + ux * (L / 2 + (a - .5) * K) + nx * K * b, y0 + uy * (L / 2 + (a - .5) * K) + ny * K * b];   // tab size follows the short side
  p.lineTo(...P(.36, 0));
  p.bezierCurveTo(...P(.4, 0), ...P(.42, .06), ...P(.38, .12));
  p.bezierCurveTo(...P(.32, .22), ...P(.4, .3), ...P(.5, .3));
  p.bezierCurveTo(...P(.6, .3), ...P(.68, .22), ...P(.62, .12));
  p.bezierCurveTo(...P(.58, .06), ...P(.6, 0), ...P(.64, 0));
  p.lineTo(x1, y1);
}

export async function run(api) {
  const { say, sfx, M, wait, alive, S } = api;
  const host = document.getElementById('pz');
  const img = new Image(); img.src = api.pic.src; await img.decode().catch(() => {}); if (!alive()) return;
  const { c: COLS, r: ROWS } = api.size;
  const IW = img.naturalWidth, IH = img.naturalHeight;

  /* layout: board on the left (landscape) or top (portrait), tray for loose pieces in the rest */
  const W = host.clientWidth, H = host.clientHeight, land = W >= H;
  const maxBW = land ? W * .56 : W * .9, maxBH = land ? H * .78 : H * .5;
  const scale = Math.min(maxBW / IW, maxBH / IH), BW = IW * scale, BH = IH * scale;
  const BX = land ? W * .04 + (W * .58 - BW) / 2 : (W - BW) / 2, BY = land ? (H - BH) / 2 + H * .03 : H * .1;
  const cw = BW / COLS, ch = BH / ROWS, T = Math.min(cw, ch) * .3;   // T = room for tabs

  const board = document.createElement('div'); board.className = 'pz-board';
  Object.assign(board.style, { left: BX + 'px', top: BY + 'px', width: BW + 'px', height: BH + 'px', backgroundImage: `url(${api.pic.src})` });
  host.appendChild(board);

  /* tabs: random, matching between neighbours */
  const hT = [...Array(ROWS + 1)].map((_, y) => [...Array(COLS)].map(() => (y === 0 || y === ROWS) ? 0 : (Math.random() < .5 ? 1 : -1)));
  const vT = [...Array(ROWS)].map(() => [...Array(COLS + 1)].map((_, x) => (x === 0 || x === COLS) ? 0 : (Math.random() < .5 ? 1 : -1)));
  const dpr = Math.min(devicePixelRatio || 1, 2), pieces = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const cv = document.createElement('canvas'), w = cw + 2 * T, h = ch + 2 * T;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const g = cv.getContext('2d'); g.scale(dpr, dpr);
    const p = new Path2D(); p.moveTo(T, T);
    const K = Math.min(cw, ch);
    edge(p, T, T, T + cw, T, -hT[y][x], K);                    // top: a tab of the piece above points down into us
    edge(p, T + cw, T, T + cw, T + ch, vT[y][x + 1], K);       // right
    edge(p, T + cw, T + ch, T, T + ch, hT[y + 1][x], K);       // bottom
    edge(p, T, T + ch, T, T, -vT[y][x], K);                    // left
    p.closePath();
    g.save(); g.clip(p);
    g.drawImage(img, -(x * cw - T), -(y * ch - T), BW, BH);    // whole picture, shifted (safe in Safari), clipped to the piece
    g.restore();
    g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,255,255,.85)'; g.stroke(p);
    const el = document.createElement('div'); el.className = 'pz-piece'; el.appendChild(cv);
    host.appendChild(el);
    const home = { x: BX + x * cw - T, y: BY + y * ch - T };
    pieces.push({ el, cv, g, home, x: 0, y: 0, done: false, w, h });
  }

  /* the tray: loose pieces sit smaller, neatly spread in a grid, and grow to full size when picked up */
  const TX0 = land ? BX + BW + 24 : 12, TX1 = W - 12, TY0 = land ? 80 : BY + BH + 24, TY1 = H - 12;
  const pw = pieces[0].w, ph = pieces[0].h, n = pieces.length;
  let best = { s: 0 };
  for (let c = 1; c <= n; c++) { const r = Math.ceil(n / c), s = Math.min((TX1 - TX0) / c / pw, (TY1 - TY0) / r / ph, 1) * .96; if (s > best.s) best = { s, c, r }; }
  const TS = best.s, cellW = (TX1 - TX0) / best.c, cellH = (TY1 - TY0) / best.r;
  const order = pieces.slice().sort(() => Math.random() - .5);
  order.forEach((pc, i) => {
    pc.s = TS; pc.tx = TX0 + (i % best.c) * cellW + (cellW - pw * TS) / 2; pc.ty = TY0 + Math.floor(i / best.c) * cellH + (cellH - ph * TS) / 2;
    pc.x = pc.tx; pc.y = pc.ty; place(pc); pc.el.style.zIndex = 10 + i;
    pc.el.style.animation = `pzIn .5s ${i * .07}s both cubic-bezier(.3,1.5,.5,1)`;
  });
  function place(pc) { pc.el.style.left = pc.x + 'px'; pc.el.style.top = pc.y + 'px'; pc.el.style.setProperty('--s', pc.s); }

  if (/quick/.test(location.hash)) window.__pz = pieces;   // test switch
  /* dragging: find the top piece that is really under the finger (not its empty corners) */
  let drag = null, z = 100, placed = 0, talkN = 0;
  const under = (cx, cy) => pieces.filter(pc => !pc.done).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex).find(pc => {
    const r = pc.el.getBoundingClientRect(), lx = cx - r.left, ly = cy - r.top;
    if (lx < 0 || ly < 0 || lx > r.width || ly > r.height) return false;
    return pc.g.getImageData(Math.floor(lx / r.width * pc.cv.width), Math.floor(ly / r.height * pc.cv.height), 1, 1).data[3] > 20;
  });
  host.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    const pc = under(e.clientX, e.clientY); if (!pc) return;
    const fx = (e.clientX - pc.x) / (pc.w * pc.s), fy = (e.clientY - pc.y) / (pc.h * pc.s);      // keep the same spot under the finger while it grows
    pc.s = 1; pc.x = e.clientX - fx * pc.w; pc.y = e.clientY - fy * pc.h; place(pc);
    drag = { pc, ox: e.clientX - pc.x, oy: e.clientY - pc.y }; pc.el.style.zIndex = ++z; pc.el.classList.add('lift');
    host.setPointerCapture && host.setPointerCapture(e.pointerId); sfx('tick');
  });
  host.addEventListener('pointermove', e => { if (!drag) return; drag.pc.x = e.clientX - drag.ox; drag.pc.y = e.clientY - drag.oy; place(drag.pc); });
  const drop = async () => {
    if (!drag) return; const pc = drag.pc; drag = null; pc.el.classList.remove('lift');
    if (Math.hypot(pc.x - pc.home.x, pc.y - pc.home.y) < Math.min(cw, ch) * .38) {
      pc.x = pc.home.x; pc.y = pc.home.y; pc.el.classList.add('snap'); place(pc); pc.done = true; pc.el.style.zIndex = 5; placed++;
      sfx('ding');
      if (placed === pieces.length) return finish();
      if (++talkN % 2 === 1) say(...(talkN % 4 === 1 ? ['pip', 'pl', 'Pasuje!'] : ['fifi', 'en', 'It fits!']));
    } else { pc.s = TS; pc.el.classList.add('back'); pc.x = pc.tx; pc.y = pc.ty; place(pc); setTimeout(() => pc.el.classList.remove('back'), 450); }   // not there yet: back to the tray
  };
  host.addEventListener('pointerup', drop); host.addEventListener('pointercancel', drop);

  const finish = async () => {
    board.classList.add('full'); sfx('spark'); api.confetti();
    await wait(700); if (!alive()) return;
    await api.seq([['pip', 'pl', 'Brawo! Ułożone!'], ...(S.plOnly ? [] : [['fifi', 'en', 'You did it, {kid}!']])]);
    if (!alive()) return;
    if (api.pic.done) await api.seq(S.plOnly ? api.pic.done.filter(l => l[1] === 'pl') : api.pic.done);
    if (!alive()) return; await wait(500); api.reward(() => api.again());
  };

  await api.seq([['pip', 'pl', 'Układamy puzzle!'], ...(S.plOnly ? [] : [['fifi', 'en', 'Drag the pieces to the picture!']])]);
}
