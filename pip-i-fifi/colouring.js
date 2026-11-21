/* =====================================================================
   PIP & FIFI — 🖍️ colouring pages.
   Tap a crayon (Pip says its colour in Polish), then tap the picture: the area fills
   with a little splash. ↩️ undoes, ⭐ finishes. Her colouring is kept until she finishes.
   Each page = two pictures made from a drawing (see make notes in colouring/README):
     *-lines.png  the outlines (dark, transparent elsewhere), drawn on top
     *-areas.png  every fillable area numbered (red channel = number × step, 0 = line)
   ===================================================================== */
export const PAGES = [
  { id: 'puddles', lines: './colouring/puddles-lines.png', areas: './colouring/puddles-areas.png', step: 20, thumb: './colouring/puddles-thumb.jpg',
    music: 'pzForest', done: [['pip', 'pl', 'Fifi i Pip w kałuży!'], ['fifi', 'en', 'Splashing in the puddles!']] },
  { id: 'forest', lines: './colouring/forest-lines.png', areas: './colouring/forest-areas.png', step: 4, thumb: './colouring/forest-thumb.jpg',
    music: 'pzForest', done: [['pip', 'pl', 'Skaczemy w kałużach!'], ['fifi', 'en', 'Jumping in the puddles in our wellies!']] }
];
export const CRAYONS = [
  { pl: 'Czerwony!', hex: '#F0525A' }, { pl: 'Pomarańczowy!', hex: '#FF9A3C' }, { pl: 'Żółty!', hex: '#FFD23F' },
  { pl: 'Zielony!', hex: '#4CC373' }, { pl: 'Niebieski!', hex: '#4A90E2' }, { pl: 'Fioletowy!', hex: '#9B6BE0' },
  { pl: 'Różowy!', hex: '#FF8FC7' }, { pl: 'Brązowy!', hex: '#A8714A' }, { pl: 'Czarny!', hex: '#3A3335' }, { pl: 'Biały!', hex: '#FFFFFF' }
];
const CHEERS = [['pip', 'pl', 'Ojej, pięknie!'], ['fifi', 'en', 'Ooh!'], ['pip', 'pl', 'Wow!'], ['fifi', 'en', 'Wow!'], ['pip', 'pl', 'Pięknie, Oliwko!']];

const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

export async function run(api) {
  const { say, sfx, wait, alive, S, save } = api, page = api.page;
  const host = document.getElementById('cl');
  host.innerHTML = `<div class="cl-pic"><canvas></canvas></div>
    <div class="cl-pal">${CRAYONS.map((c, i) => `<button class="cl-cr" data-i="${i}" style="--c:${c.hex}"><i></i></button>`).join('')}
      <button class="cl-btn cl-undo" aria-label="undo">↩️</button><button class="cl-btn cl-done" aria-label="done">⭐</button></div>`;
  const [lines, areas] = await Promise.all([load(page.lines), load(page.areas)]).catch(() => []);
  if (!alive() || !lines) return;
  const W = areas.naturalWidth, H = areas.naturalHeight, N = W * H, cv = host.querySelector('canvas'), g = cv.getContext('2d');
  cv.width = W; cv.height = H; host.style.setProperty('--ar', W / H); host.classList.toggle('wide', W / H > 1.4);
  // area map → list of pixels per area
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H;
  const tg = tmp.getContext('2d', { willReadFrequently: true }); tg.drawImage(areas, 0, 0);
  const A = tg.getImageData(0, 0, W, H).data, lab = new Uint8Array(N), count = [], step = page.step || 20;
  for (let i = 0; i < N; i++) { const k = Math.round(A[i * 4] / step); lab[i] = k; count[k] = (count[k] || 0) + 1; }
  const px = count.map(c => new Uint32Array(c || 0)), fillN = count.map(() => 0);
  for (let i = 0; i < N; i++) { const k = lab[i]; px[k][fillN[k]++] = i; }
  // the colour layer (white paper), kept as ImageData
  const paper = document.createElement('canvas'); paper.width = W; paper.height = H;
  const pg = paper.getContext('2d'); pg.fillStyle = '#fff'; pg.fillRect(0, 0, W, H);
  const P = pg.getImageData(0, 0, W, H);
  const store = S.colouring = S.colouring || {}; const mine = store[page.id] = store[page.id] || {};
  const paint = (k, hex) => { const [r, gg, b] = rgb(hex), d = P.data, list = px[k]; for (let j = 0; j < list.length; j++) { const o = list[j] * 4; d[o] = r; d[o + 1] = gg; d[o + 2] = b; } };
  for (const k in mine) if (px[k]) paint(+k, mine[k]);
  pg.putImageData(P, 0, 0);
  const draw = () => { g.drawImage(paper, 0, 0); g.drawImage(lines, 0, 0); };
  draw();

  let cur = null, busy = false, fills = 0; const undo = [];
  const pick = i => { cur = CRAYONS[i]; host.querySelectorAll('.cl-cr').forEach((b, j) => b.classList.toggle('on', j === i)); sfx('tick'); say('pip', 'pl', cur.pl); };
  host.querySelectorAll('.cl-cr').forEach(b => b.onclick = () => pick(+b.dataset.i));

  // grow the new colour out from the finger, like paint spreading
  const splash = (k, hex, x, y) => new Promise(res => {
    const before = document.createElement('canvas'); before.width = W; before.height = H; before.getContext('2d').drawImage(paper, 0, 0);
    paint(k, hex); pg.putImageData(P, 0, 0);
    let x0 = W, y0 = H, x1 = 0, y1 = 0; for (const i of px[k]) { const a = i % W, b = (i / W) | 0; if (a < x0) x0 = a; if (a > x1) x1 = a; if (b < y0) y0 = b; if (b > y1) y1 = b; }
    const R = Math.max(Math.hypot(x - x0, y - y0), Math.hypot(x - x1, y - y0), Math.hypot(x - x0, y - y1), Math.hypot(x - x1, y - y1)) + 4;
    const t0 = performance.now(), D = 380 + Math.min(500, R);
    const f = now => {
      const u = Math.max(0, Math.min(1, (now - t0) / D)), r = R * (1 - Math.pow(1 - u, 3));
      g.drawImage(before, 0, 0); g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); g.drawImage(paper, 0, 0); g.restore(); g.drawImage(lines, 0, 0);
      u < 1 && alive() ? requestAnimationFrame(f) : (draw(), res());
    };
    requestAnimationFrame(f);
  });

  cv.addEventListener('pointerdown', async e => {
    if (busy) return;
    if (!cur) { host.querySelector('.cl-pal').classList.add('nudge'); setTimeout(() => host.querySelector('.cl-pal').classList.remove('nudge'), 700); say('fifi', 'en', 'Pick a crayon first!'); return; }
    const r = cv.getBoundingClientRect(), x = Math.round((e.clientX - r.left) / r.width * W), y = Math.round((e.clientY - r.top) / r.height * H);
    let k = 0;   // tapped right on a line: take the nearest area
    for (let d = 0; d <= 14 && !k; d += 2) for (let a = 0; a < 12 && !k; a++) { const xx = Math.round(x + d * Math.cos(a / 2)), yy = Math.round(y + d * Math.sin(a / 2)); if (xx >= 0 && yy >= 0 && xx < W && yy < H) k = lab[yy * W + xx]; }
    if (!k || mine[k] === cur.hex) return;
    busy = true; undo.push([k, mine[k]]); mine[k] = cur.hex; save();
    sfx('pop'); await splash(k, cur.hex, x, y); busy = false;
    if (++fills % 4 === 0) say(...CHEERS[(fills / 4 - 1) % CHEERS.length]);
  });
  host.querySelector('.cl-undo').onclick = () => {
    const u = undo.pop(); if (!u || busy) return; const [k, prev] = u;
    if (prev) mine[k] = prev; else delete mine[k]; save();
    paint(k, prev || '#FFFFFF'); pg.putImageData(P, 0, 0); draw(); sfx('tick');
  };
  host.querySelector('.cl-done').onclick = async () => {
    if (busy || !Object.keys(mine).length) return; busy = true;
    sfx('spark'); api.confetti(); host.classList.add('finished');
    await wait(600); if (!alive()) return;
    await api.seq([['pip', 'pl', 'Pięknie, Oliwko!'], ...(S.plOnly ? [] : [['fifi', 'en', 'What a beautiful picture!']])]);
    if (!alive()) return;
    if (page.done) await api.seq(S.plOnly ? page.done.filter(l => l[1] === 'pl') : page.done);
    delete store[page.id]; save();        // next time: a fresh page
    if (!alive()) return; await wait(400); api.reward(() => api.again());
  };

  await api.seq([['pip', 'pl', 'Kolorujemy!'], ...(S.plOnly ? [] : [['fifi', 'en', 'Pick a crayon, then tap the picture!']])]);
}
