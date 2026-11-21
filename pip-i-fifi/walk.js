/* =====================================================================
   PIP & FIFI — 🦔 "Spacer z Pipem": a calm walk in a forest clearing (3D).
   Olivia taps (or drags) where Pip should go; he trots there, around trees and rocks.
   Missions in Polish first (storyteller in English): find 3 mushrooms, 3 pine cones,
   3 leaves — Pip counts "Jeden! Dwa! Trzy!". Some things hide in bushes (the bush shakes
   when Pip comes close). Other things just get their Polish name. Last: find Fifi,
   who is hiding behind a tree with her tail sticking out.
   Shares models and helpers with forest.js.
   ===================================================================== */
import { THREE, GEO, MAT, C, ITEMS, part, merge, mesh, blob, makePip, paintHog, splitHogLegs, loadZuzia } from './forest.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const PI = Math.PI;
/* the world: forest clearing in front (south), a brook with a bridge across the middle, a flower meadow behind (north) */
const BX = 24, BZS = 8, BZN = -46;                                 // where Pip can walk
const BRX = 3, WB = 1.5;                                           // bridge x, brook half-width
const zb = x => -16 + 2.2 * Math.sin(x * .18);                     // the brook winds across
const inWater = (x, z) => Math.abs(z - zb(x)) < WB + .25;
const onBridge = x => Math.abs(x - BRX) < .95;
const side = (x, z) => Math.sign(z - zb(x)) || 1;                  // +1 forest side, -1 meadow side
const MISSIONS = [
  { kind: 'grzybek', n: 3, pl: 'Znajdź trzy grzybki!', en: 'Find three mushrooms!' },
  { kind: 'szyszka', n: 3, pl: 'Znajdź trzy szyszki!', en: 'Find three pine cones!' },
  { kind: 'lisc',    n: 3, pl: 'Znajdź trzy liście!',  en: 'Find three leaves!' },
  { kind: 'marchewka', n: 3, who: 'zuzia', pl: 'Znajdź trzy marchewki!', en: 'Find three carrots! They grow in the meadow.' }    // Olivia steers Zuzia for this one
];
const COUNT = ['Jeden!', 'Dwa!', 'Trzy!'];
const SUN = { x: -9, y: 14, z: 16 }, SHX = -SUN.x / SUN.y, SHZ = -SUN.z / SUN.y;

export async function run(api) {
  const { say, sfx, M, wait, alive, S } = api;
  const host = document.getElementById('wk'), canvas = document.getElementById('wkc'), hud = document.getElementById('wkh');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !window.PF_LITE, powerPreference: 'high-performance' });
  renderer.setPixelRatio(window.PF_LITE ? 1 : Math.min(devicePixelRatio || 1, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), FOG = 0xBFE0E6;
  scene.background = new THREE.Color(FOG); scene.fog = new THREE.Fog(FOG, 26, 60);
  const cam = new THREE.PerspectiveCamera(50, 1, .1, 160);
  scene.add(new THREE.HemisphereLight(0xEFF6FF, 0x2E5A35, 1.25));
  const sun = new THREE.DirectionalLight(0xFFE9C4, 2.2); sun.position.set(SUN.x, SUN.y, SUN.z); scene.add(sun);
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 1 ? 66 : 50; cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);

  /* ---------- the world ---------- */
  let ks = 4321; const r = () => (ks = (ks * 16807) % 2147483647) / 2147483647;
  const TREE = (geo, rad, shade) => ({ geo, rad, shade, tall: true });
  const KINDS = {
    pine:  TREE(GEO.pine(1, 1), .55, { trunk: 1.6, tiers: [0, 1, 2, 3].map(i => [1.45 - i * .28, 1.5 + i * .95, 1.5 + i * .95 + 1.55 - i * .12]) }),
    pine2: TREE(GEO.pine(1.25, 2), .55, { trunk: 2, tiers: [0, 1, 2, 3].map(i => [1.45 - i * .28, 1.25 * (1.5 + i * .95), 1.25 * (1.5 + i * .95) + 1.55 - i * .12]) }),
    birch: TREE(GEO.birch(1), .45, { trunk: 3.4, tiers: [[1.3, 3.3, 4.6], [.8, 4.4, 5.6]] }),
    oak:   TREE(GEO.oak(C.orange, 1), .55, { trunk: 1.8, tiers: [[1.6, 2.2, 3.9], [1.1, 3.2, 4.6]] }),
    green: TREE(GEO.oak(C.pine1, 3), .55, { trunk: 1.8, tiers: [[1.6, 2.2, 3.9], [1.1, 3.2, 4.6]] }),
    rock:  { geo: GEO.rock(3), rad: .75, shade: { tiers: [[.7, 0, .25], [.55, .3, .5]] } },
    rock2: { geo: GEO.rock(4, 1.3), rad: .95, shade: { tiers: [[.9, 0, .35], [.7, .4, .65]] } },
    pebble: { geo: GEO.rock(8, .55), rad: 0, shade: { tiers: [[.35, 0, .15]] } },
    stump: { geo: GEO.stump(), rad: .5, shade: { tiers: [[.48, 0, .3], [.45, .6, .6]] } },
    bush:  { geo: GEO.bush(), rad: .7, shade: { tiers: [[.75, 0, .4], [.6, .4, .8]] } },
    tuft:  { geo: GEO.tuft(1), rad: 0 },
    flowers: { geo: GEO.flowers(), rad: 0 }
  };
  const objs = [];                                   // {kind, x, z, s, ry}
  const nearPath = (x, z) => Math.hypot(x, z - 4) < 3 || (Math.abs(x - BRX) < 2.2 && Math.abs(z - zb(BRX)) < WB + 3);   // keep the start and the bridge clear
  const free = (x, z, d) => !nearPath(x, z) && Math.abs(z - zb(x)) > WB + .6 + d * .5 && objs.every(o => !KINDS[o.kind].rad || Math.hypot(o.x - x, o.z - z) > d + KINDS[o.kind].rad * o.s);
  const put = (kind, x, z, s = .9 + r() * .4) => { objs.push({ kind, x, z, s, ry: r() * 6 }); return objs[objs.length - 1]; };
  /* a thick border of trees all round (none in the south, so the camera never looks through them) */
  for (let i = 0; i < 230; i++) {
    const e = r(), u = r(), k = ['pine', 'pine2', 'birch', 'pine', 'green'][i % 5];
    if (e < .38) put(k, -BX - 2 - u * 10, BZN - 6 + r() * (BZS + 14 - BZN));
    else if (e < .76) put(k, BX + 2 + u * 10, BZN - 6 + r() * (BZS + 14 - BZN));
    else put(k, -BX - 10 + r() * (2 * BX + 20), BZN - 2 - u * 10);
  }
  const scatter = (kind, n, minD, z0, z1) => { for (let i = 0, tries = 0; i < n && tries < 600; tries++) { const x = (r() * 2 - 1) * BX, z = z0 + r() * (z1 - z0); if (free(x, z, minD)) { put(kind, x, z); i++; } } };
  /* forest side */
  scatter('pine', 8, 3, -12, 4); scatter('pine2', 5, 3, -12, 4); scatter('birch', 5, 3, -12, 4);
  scatter('rock', 5, 1.5, -12, 7); scatter('rock2', 2, 1.8, -12, 7); scatter('stump', 4, 1.2, -12, 7); scatter('bush', 8, 1.6, -12, 7);
  scatter('tuft', 40, .3, -13, 8); scatter('flowers', 12, .3, -13, 8);
  /* meadow side */
  scatter('green', 7, 4, -44, -21); scatter('birch', 4, 4, -44, -21); scatter('oak', 2, 4, -44, -24);
  scatter('bush', 6, 1.8, -44, -21); scatter('rock', 3, 1.5, -44, -21);
  scatter('flowers', 70, .25, -45, -19); scatter('tuft', 40, .3, -45, -19);
  /* along the brook: pebbles and reeds */
  for (let x = -BX - 6; x < BX + 6; x += 1.3) { if (Math.abs(x - BRX) < 2.4) continue;
    if (r() < .55) objs.push({ kind: r() < .5 ? 'pebble' : 'tuft', x: x + r() * .6, z: zb(x) + (r() < .5 ? 1 : -1) * (WB + .4 + r() * .5), s: .7 + r() * .5, ry: r() * 6 }); }
  const blockers = objs.filter(o => KINDS[o.kind].rad && o.kind !== 'bush').map(o => ({ x: o.x, z: o.z, r: KINDS[o.kind].rad * o.s }));

  /* draw: tall trees inside the walk area are single meshes (so they can turn see-through), everything else instanced */
  const D = new THREE.Object3D(), bushes = [], fadeTrees = [];
  const inside = o => Math.abs(o.x) <= BX + 1 && o.z >= BZN - 1 && o.z <= BZS + 3;
  Object.entries(KINDS).forEach(([k, K]) => {
    const list = objs.filter(o => o.kind === k); if (!list.length) return;
    if (k === 'bush') { list.forEach(o => { const m = mesh(K.geo); m.position.set(o.x, 0, o.z); m.scale.setScalar(o.s * 1.2); m.rotation.y = o.ry; scene.add(m); bushes.push({ m, o, hide: null, shake: 0 }); }); return; }
    const rest = K.tall ? list.filter(o => !inside(o)) : list;
    if (K.tall) list.filter(inside).forEach(o => {
      const m = new THREE.Mesh(K.geo, MAT.clone()); m.position.set(o.x, 0, o.z); m.scale.setScalar(o.s); m.rotation.y = o.ry; scene.add(m);
      fadeTrees.push({ m, x: o.x, z: o.z, op: 1 }); });
    if (!rest.length) return;
    const im = new THREE.InstancedMesh(K.geo, MAT, rest.length);
    rest.forEach((o, i) => { D.position.set(o.x, 0, o.z); D.rotation.set(0, o.ry, 0); D.scale.setScalar(o.s); D.updateMatrix(); im.setMatrixAt(i, D.matrix); });
    scene.add(im);
  });
  const fade = (cx, cz, dt) => fadeTrees.forEach(t => {        // trees between the camera and the character go see-through
    const dz = t.z - cz, hide = dz > -.6 && dz < 9 && Math.abs(t.x - cx) < 1.9 + dz * .12;
    const want = hide ? .28 : 1; if (Math.abs(t.op - want) < .01) return;
    t.op += (want - t.op) * Math.min(1, dt * 7); const mt = t.m.material; mt.opacity = t.op;
    const tr = t.op < .98; if (mt.transparent !== tr) { mt.transparent = tr; mt.depthWrite = !tr; mt.needsUpdate = true; } });

  /* the bridge: wooden planks with rails, a gentle arch */
  const BL = 2 * WB + 2.6, bz0 = zb(BRX), archY = z => Math.max(0, .32 * (1 - Math.pow((z - bz0) / (BL / 2), 2)));
  {
    const P = [], N = 11;
    for (let i = 0; i < N; i++) { const z = bz0 - BL / 2 + (i + .5) * BL / N;
      P.push(part(new THREE.BoxGeometry(2.1, .12, BL / N * .86), i % 2 ? 0xA8743F : 0xB98450, { p: [0, archY(z) + .08, z - bz0] })); }
    [-1.05, 1.05].forEach(x => {
      for (let i = 0; i <= 4; i++) { const z = bz0 - BL / 2 + i * BL / 4; P.push(part(new THREE.BoxGeometry(.14, .7, .14), 0x8A5A35, { p: [x, archY(z) + .4, z - bz0] })); }
      for (let i = 0; i < 4; i++) { const za = bz0 - BL / 2 + i * BL / 4, zc = za + BL / 8; const y = archY(zc) + .72, ang = Math.atan2(archY(za + BL / 4) - archY(za), BL / 4);
        P.push(part(new THREE.BoxGeometry(.1, .1, BL / 4 + .05), 0x9A6338, { p: [x, y, zc - bz0], r: [-ang, 0, 0] })); }
    });
    const m = mesh(merge(P)); m.position.set(BRX, 0, bz0); scene.add(m);
  }

  /* the brook: a ribbon of water with rippling light, following the curve */
  const water = (() => {
    const pos = [], uv = [], idx = [], X0 = -BX - 16, X1 = BX + 16, NS = 90;
    for (let i = 0; i <= NS; i++) { const x = X0 + (X1 - X0) * i / NS, z = zb(x);
      pos.push(x, .04, z - WB, x, .04, z + WB); uv.push(i / 6, 0, i / 6, 1);
      if (i < NS) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    g.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => i % 3 === 1 ? 1 : 0), 3));   // facing up, so the light falls on it
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#3E8FC4'); gr.addColorStop(.5, '#5FB3E3'); gr.addColorStop(1, '#3E8FC4'); x.fillStyle = gr; x.fillRect(0, 0, 256, 64);
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2.5; x.lineCap = 'round';
    for (let i = 0; i < 14; i++) { const y = 8 + (i * 37) % 48, x0 = (i * 71) % 256; x.beginPath(); x.moveTo(x0, y); x.quadraticCurveTo(x0 + 14, y - 4, x0 + 28, y); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: t, emissive: 0x16384F, side: THREE.DoubleSide })); scene.add(m); return t;
  })();

  /* ground with baked shadows (the sun never moves); grass, a lighter meadow, muddy brook banks */
  const GW = 84, GZ0 = -64, GD = 90, PX = 11;                         // ground spans x -42..42, z -64..26
  {
    const CWx = GW * PX, CWz = GD * PX;
    const toC = (wx, wz) => [(wx + GW / 2) * PX, (wz - GZ0) * PX];
    const sh = document.createElement('canvas'); sh.width = CWx; sh.height = CWz; const x = sh.getContext('2d'); x.fillStyle = '#000';
    objs.forEach(o => { const K = KINDS[o.kind]; if (!K.shade) return; const s = o.s * (o.kind === 'bush' ? 1.2 : 1);
      if (K.shade.trunk) { const h = K.shade.trunk * s, [bx, bz] = toC(o.x, o.z), [ex, ez] = toC(o.x + SHX * h, o.z + SHZ * h);
        x.lineWidth = .4 * s * PX; x.lineCap = 'round'; x.strokeStyle = '#000'; x.beginPath(); x.moveTo(bx, bz); x.lineTo(ex, ez); x.stroke(); }
      K.shade.tiers.forEach(([rr, h, tip]) => { rr *= s; h *= s; tip *= s;
        const [ax, az] = toC(o.x + SHX * h, o.z + SHZ * h), [tx, tz] = toC(o.x + SHX * tip, o.z + SHZ * tip), R = rr * PX;
        x.beginPath(); x.arc(ax, az, R, 0, PI * 2); x.fill();
        const dx = tx - ax, dz = tz - az, L = Math.hypot(dx, dz) || 1, nx = -dz / L * R, nz = dx / L * R;
        x.beginPath(); x.moveTo(ax + nx, az + nz); x.lineTo(tx, tz); x.lineTo(ax - nx, az - nz); x.closePath(); x.fill(); }); });
    { const [bx, bz] = toC(BRX + SHX * .4, bz0 + SHZ * .4); x.fillRect(bx - 1.05 * PX, bz - BL / 2 * PX, 2.1 * PX, BL * PX); }   // the bridge's shadow on the water
    const c = document.createElement('canvas'); c.width = CWx; c.height = CWz; const y = c.getContext('2d');
    y.fillStyle = '#3F7D48'; y.fillRect(0, 0, CWx, CWz);
    const [, mz] = toC(0, -20); y.fillStyle = '#5E9A48'; y.fillRect(0, 0, CWx, mz);                      // meadow: brighter grass
    y.fillStyle = '#5A8A4C'; y.beginPath(); y.ellipse(CWx / 2, toC(0, -2)[1], (BX - 2) * PX, 11 * PX, 0, 0, 7); y.fill();   // clearing
    for (let i = 0; i < 1400; i++) { const lx = r() * CWx, ly = r() * mz; y.fillStyle = ['#FFFFFF', '#FFD23C', '#F27BB8', '#B58CF0', '#FFFFFF'][i % 5]; y.beginPath(); y.arc(lx, ly, 2 + r() * 2.2, 0, 7); y.fill(); }
    for (let i = 0; i < 300; i++) { const lx = r() * CWx, ly = mz + r() * (CWz - mz); y.fillStyle = ['#F08A24', '#D9432F', '#F2C230', '#E8C23A'][i % 4]; y.beginPath(); y.ellipse(lx, ly, 4 + r() * 4, 2 + r() * 2, r() * 3, 0, 7); y.fill(); }
    y.lineCap = 'round'; y.lineJoin = 'round';                                                          // muddy banks under the water ribbon
    [[(WB + .55) * 2, '#7A6A4A'], [(WB + .25) * 2, '#5C7FA0']].forEach(([w, col]) => { y.strokeStyle = col; y.lineWidth = w * PX; y.beginPath();
      for (let wx = -GW / 2; wx <= GW / 2; wx += .5) { const [px2, pz2] = toC(wx, zb(wx)); wx === -GW / 2 ? y.moveTo(px2, pz2) : y.lineTo(px2, pz2); } y.stroke(); });
    y.globalAlpha = .1; y.drawImage(sh, -1.5, -1.5); y.drawImage(sh, 1.5, 1.5); y.globalAlpha = .6; y.drawImage(sh, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const g = new THREE.PlaneGeometry(GW, GD); g.rotateX(-PI / 2); g.translate(0, 0, GZ0 + GD / 2);
    scene.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: t })));
  }

  /* ---------- things to find ---------- */
  const things = [];
  const PG = { lisc: [GEO.lisc(C.leafO), GEO.lisc(C.leafR), GEO.lisc(C.leafY)] };
  const geoFor = k => k === 'lisc' ? PG.lisc[Math.floor(r() * 3)] : (PG[k] = PG[k] || GEO[k]());
  const addThing = (kind, x, z, hidden = null) => { const m = mesh(geoFor(kind)); m.add(blob(.3)); m.scale.setScalar(1.55); m.position.set(x, .1, z);
    m.visible = !hidden; scene.add(m); const o = { m, kind, x, z, hidden, got: false, said: 0 }; things.push(o); return o; };
  const ZONES = { forest: [-12, 6], meadow: [-44, -21], any: [-44, 6] };
  const spot = (d, zone = 'any') => { const [z0, z1] = ZONES[zone]; for (let tries = 0; tries < 400; tries++) { const x = (r() * 2 - 1) * (BX - 1), z = z0 + r() * (z1 - z0);
    if (free(x, z, d) && things.every(o => Math.hypot(o.x - x, o.z - z) > 2.2)) return [x, z]; } return [r() * 8 - 4, r() * 8 - 4]; };
  const bushList = bushes.filter(b => b.o.z > -13).sort(() => r() - .5);
  [['grzybek', 'forest'], ['szyszka', 'forest'], ['lisc', 'any']].forEach(([kind, zone], k) => {
    for (let i = 0; i < 4; i++) {
      const b = i === 0 && bushList[k * 2];             // one of each kind hides in a bush
      if (b) { b.hide = addThing(kind, b.o.x + .9, b.o.z + .5, b); b.hide.m.position.y = -1; }
      else { const [x, z] = spot(1, zone); addThing(kind, x, z); }
    }
  });
  ['jagody', 'jagody', 'jagody', 'zoladz', 'zoladz', 'poziomka', 'poziomka', 'poziomka'].forEach(k => { const [x, z] = spot(1); addThing(k, x, z); });

  /* ---------- Pip ---------- */
  const PIP = makePip(); scene.add(PIP.g); PIP.g.add(blob(.5, 1.1)); PIP.g.children[PIP.g.children.length - 1].position.y = .03;
  new GLTFLoader().load('./models/hedgehog.glb', gl => {
    if (!alive()) return;
    const hog = paintHog(gl.scene); PIP.hogLegs = splitHogLegs(hog);
    const box = new THREE.Box3().setFromObject(hog), k = 1.0 / (box.max.y - box.min.y);
    const holder = new THREE.Group(); holder.add(hog); holder.scale.setScalar(k); holder.rotation.y = PI; hog.position.y -= box.min.y;
    PIP.m.children.forEach(c => c.visible = false); PIP.legs.forEach(l => l.visible = false); PIP.m.add(holder);
  }, undefined, e => console.warn('hedgehog model', e));
  let px = 0, pz = 4, face = PI, tx = px, tz = pz;     // the character Olivia is steering (Pip, or Zuzia during the carrot hunt)
  PIP.g.position.set(px, 0, pz);
  let ctl = 'pip';
  const pipS = { x: 0, z: 4, face: PI, ph: 0, moving: false }, zuS = { x: 0, z: 0, face: 0, ph: 0, moving: false, on: false };
  const ZU = loadZuzia(1.6, alive); ZU.add(blob(.5, 1.1)); ZU.children[ZU.children.length - 1].position.y = .03; ZU.visible = false; scene.add(ZU);
  /* the one not being steered trots/hops after the other */
  const follow = (st, x, z, dist, dt) => {
    if (side(st.x, st.z) !== side(x, z) && !(onBridge(st.x) && Math.abs(st.z - zb(st.x)) < WB + 1.3)) {   // other side of the brook: go via the bridge
      const sF = side(st.x, st.z); if (Math.abs(st.x - BRX) > .4) { x = BRX; z = zb(BRX) + sF * (WB + 1.2); dist = .1; } else { x = BRX; z = zb(BRX) - sF * (WB + 1.4); dist = .1; } }
    else if (onBridge(st.x) && Math.abs(st.z - zb(st.x)) < WB + 1.3 && side(st.x, st.z) !== side(x, z)) { x = BRX; z = zb(BRX) + side(x, z) * (WB + 1.4); dist = .1; }
    const dx = x - st.x, dz = z - st.z, d = Math.hypot(dx, dz); st.moving = d > dist;
    if (st.moving) { const sp = Math.min(d - dist, 3 * dt); st.x += dx / d * sp; st.z += dz / d * sp;
      blockers.forEach(b => { const ox = st.x - b.x, oz = st.z - b.z, od = Math.hypot(ox, oz), min = b.r + .45; if (od < min && od > 0) { st.x = b.x + ox / od * min; st.z = b.z + oz / od * min; } });
      const want = Math.atan2(-dx, -dz); let df = want - st.face; while (df > PI) df -= PI * 2; while (df < -PI) df += PI * 2; st.face += df * Math.min(1, dt * 6); st.ph += dt * 11; } };
  const lift = (x, z) => onBridge(x) ? archY(z) + .12 : 0;              // walking up and over the bridge
  const drawPip = (x, z, f, moving, ph) => { PIP.g.position.set(x, lift(x, z) + (moving ? Math.abs(Math.sin(ph)) * .08 : 0), z); PIP.g.rotation.y = f;
    PIP.m.rotation.z = moving ? Math.sin(ph) * .06 : 0;
    const legA = (i, a) => moving ? Math.sin(ph + (i % 2 ? PI : 0) + (i > 1 ? PI : 0)) * a : 0;
    PIP.legs.forEach((l, i) => l.rotation.x = legA(i, .7)); (PIP.hogLegs || []).forEach((l, i) => l.rotation.x = legA(i, .8)); };
  const drawZu = (x, z, f, moving, ph) => { const up = moving ? Math.abs(Math.sin(ph * .7)) : 0;   // hop, hop
    ZU.position.set(x, lift(x, z) + up * .45, z); ZU.rotation.y = f; ZU.scale.set(1, moving ? .9 + up * .14 : 1, 1); };

  /* ---------- Fifi hides behind a tree, tail sticking out ---------- */
  let hideTree = objs.find(o => (o.kind === 'green' || o.kind === 'birch') && Math.abs(o.x) < BX - 3 && o.z > BZN + 3 && o.z < -28);
  if (!hideTree) hideTree = objs.filter(o => o.kind.startsWith('rock') && o.z < 0).sort((a, b) => a.z - b.z)[0] || { x: -4, z: -10 };   // else behind a big rock
  const FIFI = new THREE.Group(); FIFI.position.set(hideTree.x - SHX * .0 + .2, 0, hideTree.z - 1.1); FIFI.rotation.y = PI * .5 + .3; FIFI.visible = false; scene.add(FIFI);
  let foxMixer = null;
  new GLTFLoader().load('./models/fox.glb', gl => {
    if (!alive()) return;
    const fox = gl.scene, box = new THREE.Box3();
    fox.traverse(o => { if (o.isMesh) { const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i++) box.expandByPoint(new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)));
      const c = o.geometry.attributes.color; if (c) { for (let i = 0; i < c.array.length; i++) c.array[i] = Math.min(1, c.array[i] * 1.35); c.needsUpdate = true; }
      o.material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }); o.frustumCulled = false; } });
    const k = 1.45 / (box.max.y - box.min.y); fox.scale.setScalar(k);
    fox.position.set(-(box.min.x + box.max.x) / 2 * k, -box.min.y * k, -(box.min.z + box.max.z) / 2 * k);
    const h = new THREE.Group(); h.rotation.y = PI; h.add(fox); FIFI.add(h); FIFI.add(blob(.5, .7));
    if (gl.animations[0]) { foxMixer = new THREE.AnimationMixer(fox); const a = foxMixer.clipAction(gl.animations[0]); a.play(); foxMixer.update(.1); }
  }, undefined, e => console.warn('fox model', e));

  /* ---------- HUD ---------- */
  let mi = -1, found = 0, phase = 'intro';
  const drawHud = () => {
    if (phase === 'fifi') { hud.innerHTML = `<div class="wk-card"><span>🦊</span><b>?</b></div>`; return; }
    const m = MISSIONS[mi]; if (!m) { hud.innerHTML = ''; return; }
    hud.innerHTML = `<div class="wk-card">${Array.from({ length: m.n }, (_, i) => `<span class="${i < found ? 'on' : ''}">${ITEMS[m.kind].e}</span>`).join('')}</div>`;
  };

  /* ---------- talking: never pile up ---------- */
  let talking = false;
  const talk = async lines => { if (talking || !alive()) return; talking = true; for (const [w, l, t] of lines) { if (!alive()) break; await say(w, l, t); } talking = false; };
  const told = {};
  const hint = k => { if (told[k] || talking || phase !== 'find') return; told[k] = 1;
    talk(k === 'water' ? [[ctl, 'pl', 'Strumyk!'], ...(S.plOnly ? [] : [['nar', 'en', "That's a brook! Let's find the bridge."]])]
                       : [[ctl, 'pl', 'Most!'], ...(S.plOnly ? [] : [['nar', 'en', 'A bridge! Over we go!']])]); };
  const missionLines = m => [['pip', 'pl', m.pl], ...(S.plOnly ? [] : [['nar', 'en', m.en]])];

  /* ---------- touch: tap or drag where Pip should go ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const marker = new THREE.Mesh(new THREE.RingGeometry(.35, .5, 20), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .8, depthWrite: false }));
  marker.rotation.x = -PI / 2; marker.position.y = .05; marker.visible = false; scene.add(marker);
  let down = false;
  const aim = e => { const b = canvas.getBoundingClientRect(); ndc.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1);
    ray.setFromCamera(ndc, cam); if (ray.ray.intersectPlane(ground, hit)) { tx = Math.max(-BX, Math.min(BX, hit.x)); tz = Math.max(BZN, Math.min(BZS, hit.z));
      marker.position.x = tx; marker.position.z = tz; marker.visible = true; marker.scale.setScalar(1); } };
  host.addEventListener('pointerdown', e => { if (e.target.closest('button') || phase === 'intro' || phase === 'end') return; down = true; aim(e); sfx('tick'); });
  host.addEventListener('pointermove', e => { if (down) aim(e); });
  addEventListener('pointerup', () => down = false);

  /* ---------- loop ---------- */
  let last = performance.now(), t = 0, raf = 0, walkPh = 0;
  const CAM = [9.5, 8.5];                              // height, distance behind
  const camPos = new THREE.Vector3(px, CAM[0], pz + CAM[1]);
  const frame = now => {
    if (!alive()) { cancelAnimationFrame(raf); renderer.dispose(); removeEventListener('resize', resize); return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;

    /* walk towards the target, slide around trees and rocks */
    const dx = tx - px, dz = tz - pz, d = Math.hypot(dx, dz), moving = d > .15 && phase !== 'intro';
    if (moving) {
      const sp = Math.min(d, 3.4 * dt), ox0 = px, oz0 = pz; px += dx / d * sp; pz += dz / d * sp;
      blockers.forEach(b => { const ox = px - b.x, oz = pz - b.z, od = Math.hypot(ox, oz), min = b.r + .45; if (od < min && od > 0) { px = b.x + ox / od * min; pz = b.z + oz / od * min; } });
      px = Math.max(-BX, Math.min(BX, px)); pz = Math.max(BZN, Math.min(BZS, pz));
      if (inWater(px, pz) && !onBridge(px)) {           // the brook: only over the bridge
        if (!inWater(px, oz0)) pz = oz0; else if (!inWater(ox0, pz) || onBridge(ox0)) px = ox0; else { px = ox0; pz = oz0; }
        hint('water');
      }
      if (onBridge(px) && inWater(px, pz)) hint('bridge');
      const want = Math.atan2(-dx, -dz); let df = want - face; while (df > PI) df -= PI * 2; while (df < -PI) df += PI * 2; face += df * Math.min(1, dt * 8);
      walkPh += dt * 11;
    } else marker.visible = false;
    marker.scale.setScalar(1 + Math.sin(t * 6) * .08);
    if (ctl === 'pip') { drawPip(px, pz, face, moving, walkPh);
      if (zuS.on) { follow(zuS, px, pz, 1.6, dt); drawZu(zuS.x, zuS.z, zuS.face, zuS.moving, zuS.ph); } }
    else { drawZu(px, pz, face, moving, walkPh);
      follow(pipS, px, pz, 2.2, dt); drawPip(pipS.x, pipS.z, pipS.face, pipS.moving, pipS.ph); }

    /* camera follows from above and behind */
    camPos.lerp(new THREE.Vector3(px, CAM[0], pz + CAM[1]), Math.min(1, dt * 2.5)); cam.position.copy(camPos); cam.lookAt(camPos.x, 0, camPos.z - CAM[1] - 1);
    fade(px, pz, dt); water.offset.x -= dt * .25;

    /* bushes shake and give up what they hide */
    bushes.forEach(b => { const near = Math.hypot(b.o.x - px, b.o.z - pz) < 1.9;
      if (near && b.hide && !b.hide.shown) { b.shake = .8; b.hide.shown = true; b.hide.m.visible = true; b.hide.pop = 0; sfx('pop'); }
      if (b.shake > 0) { b.shake -= dt; b.m.rotation.z = Math.sin(b.shake * 30) * .12 * b.shake; } });

    /* things: bob, get found */
    const m = MISSIONS[mi];
    things.forEach(o => {
      if (o.got) return;
      if (o.hidden && !o.shown) return;
      if (o.pop !== undefined && o.pop < 1) { o.pop = Math.min(1, o.pop + dt * 2.5); o.m.position.y = -1 + o.pop * 1.15 + Math.sin(o.pop * PI) * .8; return; }
      o.m.rotation.y += dt * 1.5; o.m.position.y = .15 + Math.sin(t * 3 + o.x) * .06;
      const dd = Math.hypot(o.x - px, o.z - pz);
      if (dd < .9 && phase === 'find') {
        if (m && o.kind === m.kind) {
          o.got = true; o.fly = 0; found++; sfx('ding'); drawHud();
          const n = found, who = m.who || 'pip'; talking = false;
          talk([[who, 'pl', ITEMS[o.kind].pl], [who, 'pl', COUNT[n - 1]]]).then(() => { if (n === m.n) nextMission(); });
        } else if (t - o.said > 4) { o.said = t; talk([[ctl, 'pl', ITEMS[o.kind].pl], ...(S.plOnly || o.toldEn ? [] : [['nar', 'en', ITEMS[o.kind].en]])]); o.toldEn = true; }
      }
    });
    things.forEach(o => { if (o.got && o.fly !== undefined && o.fly < 1) { o.fly += dt * 2; o.m.position.y += dt * 5; o.m.scale.multiplyScalar(1 - dt * 3); if (o.fly >= 1) scene.remove(o.m); } });

    /* Fifi peeks; found when Pip gets close */
    if (FIFI.visible) { FIFI.children.forEach(c => c.rotation && (c.rotation.z = 0)); if (foxMixer) foxMixer.update(phase === 'found' ? dt : 0);
      FIFI.position.y = phase === 'found' ? Math.abs(Math.sin(t * 8)) * .25 : 0;
      if (phase === 'fifi' && Math.hypot(FIFI.position.x - px, FIFI.position.z - pz) < 2.2) foundFifi(); }

    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  /* ---------- story ---------- */
  const take = who => {            // hand the steering to Pip or Zuzia
    const from = ctl === 'pip' ? pipS : zuS; Object.assign(from, { x: px, z: pz, face });
    const to = who === 'pip' ? pipS : zuS; ctl = who; px = tx = to.x; pz = tz = to.z; face = to.face; marker.visible = false;
  };
  const nextMission = async () => {
    const prev = MISSIONS[mi];
    mi++; found = 0;
    if (prev && prev.who === 'zuzia') {                 // carrots found: Zuzia says thank you, steering goes back to Pip
      phase = 'intro'; await api.seq([['zuzia', 'pl', 'Dziękuję!'], ['zuzia', 'pl', 'Mniam!'], ...(S.plOnly ? [] : [['nar', 'en', 'Zuzia is so happy!']])]);
      if (!alive()) return; take('pip'); phase = 'find';
    }
    if (mi < MISSIONS.length) {
      const m = MISSIONS[mi];
      if (m.who === 'zuzia') {                          // Zuzia hops in and asks for help
        phase = 'intro'; Object.assign(zuS, { x: BRX, z: zb(BRX) - WB - 2.5, face: PI, on: true }); ZU.visible = true;   // she comes over the bridge from her meadow
        await wait(1800); if (!alive()) return;
        await api.seq([['zuzia', 'pl', 'Cześć, Pip!'], ['zuzia', 'pl', 'Szukam marchewek!'], ['zuzia', 'pl', 'Pomożesz mi?'],
          ...(S.plOnly ? [] : [['nar', 'en', 'Now you can help Zuzia! Tap where Zuzia should hop.']])]);
        if (!alive()) return;
        for (let i = 0; i < 4; i++) { const [x, z] = spot(1.2, 'meadow'); addThing('marchewka', x, z); }
        take('zuzia'); phase = 'find';
      }
      await wait(400); if (!alive()) return; sfx('spark'); drawHud();
      await api.seq(m.who === 'zuzia' ? [['zuzia', 'pl', m.pl], ...(S.plOnly ? [] : [['nar', 'en', m.en]])] : missionLines(m));
      return;
    }
    phase = 'fifi'; drawHud(); FIFI.visible = true;
    await wait(500); if (!alive()) return;
    await api.seq([['pip', 'pl', 'Brawo!'], ['pip', 'pl', 'Gdzie jest Fifi?'], ...(S.plOnly ? [] : [['nar', 'en', 'Where is Fifi? She is hiding!']])]);
  };
  const foundFifi = async () => {
    phase = 'found'; hud.innerHTML = ''; tx = px; tz = pz;
    FIFI.lookAt(px, 0, pz); FIFI.rotateY(PI);
    sfx('spark'); api.confetti();
    await api.seq([['fifi', 'en', 'Boo! You found me!'], ['pip', 'pl', 'Cześć, Fifi!'], ['pip', 'pl', `Brawo, ${api.KID.plCall}!`]]);
    if (!alive()) return; phase = 'end';
    await wait(600); M.stop(.8); api.reward(() => api.again());
  };

  if (/quick/.test(location.hash)) window.__walk = { things, go: (x, z) => { tx = x; tz = z; }, pip: () => [px, pz], fifi: () => [FIFI.position.x, FIFI.position.z, FIFI.visible], mission: () => MISSIONS[mi] && MISSIONS[mi].kind, brook: { BRX, WB, zb }, bushes: bushes.map(b => [b.o.x, b.o.z, !!b.hide]) };   // test switch
  M.play('forest', .18);
  await api.seq([['pip', 'pl', 'Idziemy na spacer!'], ...(S.plOnly ? [] : [['fifi', 'en', "Let's go for a walk with Pip!"]])]);
  if (!alive()) return;
  host.classList.add('hints');
  await api.seq([['fifi', 'en', 'Tap where Pip should go!']]);
  setTimeout(() => host.classList.remove('hints'), 3500);
  phase = 'find'; nextMission();
}
