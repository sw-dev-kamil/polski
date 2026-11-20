/* =====================================================================
   PIP & FIFI — 🌲 forest run (3D, three.js), low-poly flat-shaded style.
   Fifi runs along a forest path. Olivia taps LEFT / RIGHT to change lane,
   taps the MIDDLE (or swipes up) to jump. She collects mushrooms, blueberries,
   acorns and wild strawberries; Pip names each one in Polish.
   Bumping into a log, stump or stone never ends the game: Fifi stumbles and carries on.

   Models are made in code from simple faceted shapes (placeholders for Kamil's models).
   Speed: every model is merged into ONE mesh with vertex colours and ONE shared material;
   all the trees / rocks / stumps along the path are InstancedMesh (one draw call per kind).
   ===================================================================== */
import * as THREE from './vendor/three.module.min.js';

const LANES = [-2.1, 0, 2.1];
const GOAL = 12;                       // items for a full basket
const ITEMS = {
  grzybek: { e: '🍄', pl: 'Grzybek!', en: 'A mushroom!' },
  jagody:  { e: '🫐', pl: 'Jagody!',  en: 'Blueberries!' },
  zoladz:  { e: '🌰', pl: 'Żołądź!',  en: 'An acorn!' },
  poziomka:{ e: '🍓', pl: 'Poziomka!', en: 'A wild strawberry!' }
};
const C = {
  fox: 0xE8742C, foxDark: 0xC75E1F, white: 0xF6EFE6, black: 0x2A211C, ear: 0x3A2A22,
  trunk: 0x8A5A35, pine1: 0x3DB34F, pine2: 0x34A146, pine3: 0x48BF58,
  ground: 0x3F7D48, ground2: 0x37713F, path: 0x7A6A4A, path2: 0x6E5F41,
  log: 0x9A6338, logIn: 0xC89A64, logDark: 0x4A3020, stone: 0x77777F, stone2: 0x8A8A93,
  cap: 0xD9433B, stem: 0xF3E6CF, berry: 0x4656B8, acorn: 0xB07438, acornCap: 0x6E4A2C,
  straw: 0xE8424A, leaf: 0x3FAE4F, grass: 0x4FB04A, grass2: 0x62C25A, daisy: 0xFFFFFF, daisyC: 0xFFD23C, pinkF: 0xF07CB8,
  cloud: 0xFFFFFF, cloud2: 0xE6EEF5, skyTop: 0x6FB6E8, skyLow: 0xBFE0E6
};
const FOG = C.skyLow;

/* ---------- building blocks: shapes → one merged, vertex-coloured, faceted geometry ---------- */
const MAT = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
const SKYMAT = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, fog: false, emissive: 0x9FA9B4 });   // clouds stay bright, facets still show
function part(geo, color, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], jitter = 0, seed = 1 } = {}) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone(); geo.dispose();
  if (jitter) {                                  // same offset for vertices at the same spot → faces stay closed
    const pos = g.attributes.position, off = new Map(); let k = seed * 9973 + 1;
    const rnd = () => ((k = (k * 16807) % 2147483647) / 2147483647 - .5) * 2 * jitter;
    for (let i = 0; i < pos.count; i++) {
      const key = pos.getX(i).toFixed(3) + ',' + pos.getY(i).toFixed(3) + ',' + pos.getZ(i).toFixed(3);
      if (!off.has(key)) off.set(key, [rnd(), rnd(), rnd()]);
      const o = off.get(key); pos.setXYZ(i, pos.getX(i) + o[0], pos.getY(i) + o[1], pos.getZ(i) + o[2]);
    }
  }
  g.scale(...s); g.rotateX(r[0]); g.rotateY(r[1]); g.rotateZ(r[2]); g.translate(...p);
  const col = new THREE.Color(color), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = col.r; a[i * 3 + 1] = col.g; a[i * 3 + 2] = col.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}
function merge(parts) {
  let n = 0; parts.forEach(g => n += g.attributes.position.count);
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
  parts.forEach(g => { pos.set(g.attributes.position.array, o * 3); col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); });
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('color', new THREE.BufferAttribute(col, 3));
  m.computeVertexNormals(); return m;
}
const mesh = geo => new THREE.Mesh(geo, MAT);
const BLOB = new THREE.MeshBasicMaterial({ color: 0x0F2414, transparent: true, opacity: .45, depthWrite: false });
const blob = (r, sx = 1) => { const b = new THREE.Mesh(new THREE.CircleGeometry(r, 14), BLOB); b.rotation.x = -PI / 2; b.scale.x = sx; b.renderOrder = 1; return b; };
const Cone = (r, h, seg = 6) => new THREE.ConeGeometry(r, h, seg);
const Cyl = (a, b, h, seg = 6, open = false) => new THREE.CylinderGeometry(a, b, h, seg, 1, open);
const Ball = (r, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
const Ico = r => new THREE.IcosahedronGeometry(r, 0);
const PI = Math.PI;

/* ---------- placeholder models: swap any of these for Kamil's models later ---------- */
const GEO = {
  pine(tall = 1, seed = 1) {
    const P = [part(Cyl(.16, .24, 2.2 * tall), C.trunk, { p: [0, 1.1 * tall, 0] })];
    for (let i = 0; i < 4; i++) {
      const r = 1.45 - i * .28, h = 1.55 - i * .12, y = 1.5 * tall + i * .95 * tall;
      P.push(part(Cone(r, h, 6), [C.pine1, C.pine2, C.pine3][(i + seed) % 3], { p: [0, y + h / 2, 0], r: [0, (i * .5 + seed) % 1, 0], jitter: .05, seed: seed * 7 + i }));
    }
    return merge(P);
  },
  stump() {
    return merge([part(Cyl(.42, .5, .6, 7, true), C.log, { p: [0, .3, 0] }), part(Cyl(.32, .34, .6, 7, true), C.logIn, { p: [0, .3, 0] }),
      part(new THREE.RingGeometry(.32, .42, 7), C.logIn, { p: [0, .6, 0], r: [-PI / 2, 0, 0] }), part(new THREE.CircleGeometry(.32, 7), C.logDark, { p: [0, .45, 0], r: [-PI / 2, 0, 0] })]);
  },
  log() {    // hollow log lying across one lane
    return merge([part(Cyl(.36, .36, 1.7, 7, true), C.log, { p: [0, .36, 0], r: [0, 0, PI / 2] }),
      part(Cyl(.27, .27, 1.7, 7, true), C.logDark, { p: [0, .36, 0], r: [0, 0, PI / 2] }),
      part(new THREE.RingGeometry(.27, .36, 7), C.logIn, { p: [.85, .36, 0], r: [0, PI / 2, 0] }),
      part(new THREE.RingGeometry(.27, .36, 7), C.logIn, { p: [-.85, .36, 0], r: [0, -PI / 2, 0] })]);
  },
  rock(seed = 3, big = 1) { return merge([part(new THREE.DodecahedronGeometry(.6 * big, 0), seed % 2 ? C.stone : C.stone2, { p: [0, .32 * big, 0], s: [1.25, .75, 1], jitter: .12, seed })]); },
  tuft(seed = 1) {
    const P = []; for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2 + seed;
      P.push(part(Cone(.06, .55 + (i % 2) * .2, 3), i % 2 ? C.grass : C.grass2, { p: [Math.cos(a) * .12, .3, Math.sin(a) * .12], r: [Math.sin(a) * .5, 0, Math.cos(a) * .5] })); }
    return merge(P);
  },
  flowers() {
    const P = []; [[0, 0, C.daisy], [.25, .15, C.pinkF], [-.2, .2, C.daisy]].forEach(([x, z, c]) => {
      P.push(part(Cyl(.015, .015, .45, 3), C.grass, { p: [x, .22, z] }));
      P.push(part(Ball(.09, 6, 2), c, { p: [x, .46, z], s: [1, .35, 1] })); P.push(part(Ball(.035, 4, 2), C.daisyC, { p: [x, .49, z] }));
    }); P.push(part(Cone(.05, .4, 3), C.grass2, { p: [.1, .2, -.1], r: [.3, 0, -.2] }));
    return merge(P);
  },
  cloud(seed = 1) {  // chunky faceted cloud: a few lumpy balls with a flat-ish bottom
    let k = seed * 7919; const r = () => ((k = (k * 16807) % 2147483647) / 2147483647);
    const P = [], n = 4 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 1.5 + (r() - .5) * .6, rad = 1.1 + r() * .9 - Math.abs(x) * .12;
      P.push(part(new THREE.IcosahedronGeometry(rad, 0), r() > .35 ? C.cloud : C.cloud2, { p: [x, rad * .35, (r() - .5) * 1.2], s: [1.1, .8, 1], jitter: .12, seed: seed * 13 + i })); }
    return merge(P);
  },
  grzybek() { return merge([part(Cyl(.14, .19, .38, 6), C.stem, { p: [0, .19, 0] }), part(Ball(.36, 7, 3), C.cap, { p: [0, .42, 0], s: [1, .7, 1] }),
    ...[[.17, .6, .14], [-.15, .58, .15], [.02, .66, -.17]].map(p => part(Ico(.06), C.white, { p }))]); },
  jagody() { return merge([...[[0, .28, 0], [.18, .24, .08], [-.17, .25, .06], [.05, .22, -.18], [-.06, .44, .02], [.12, .42, -.06]].map(p => part(Ico(.14), C.berry, { p })),
    part(Cone(.22, .08, 5), C.leaf, { p: [0, .58, .04] })]); },
  zoladz() { return merge([part(Ball(.24, 6, 4), C.acorn, { p: [0, .32, 0], s: [.9, 1.25, .9] }), part(Ball(.26, 6, 2), C.acornCap, { p: [0, .54, 0], s: [1, .55, 1] }), part(Cyl(.03, .03, .16, 4), C.acornCap, { p: [0, .7, 0] })]); },
  poziomka() { return merge([part(Cone(.27, .5, 7), C.straw, { p: [0, .32, 0], r: [PI, 0, 0] }), part(Cone(.24, .1, 6), C.leaf, { p: [0, .6, 0] }), part(Cyl(.02, .02, .14, 3), C.leaf, { p: [0, .7, 0] })]); }
};

/* Fifi: a low-poly fox on four legs, built from parts so the code can animate them
   (Kamil's model later: body, head, tail and 4 legs as separate objects, origins at the joints) */
function makeFox() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(mesh(merge([
    part(Ball(.5, 7, 5), C.fox, { p: [0, .82, 0], s: [.75, .72, 1.45], jitter: .03, seed: 5 }),
    part(Ball(.36, 6, 4), C.white, { p: [0, .68, -.38], s: [.7, .7, 1.1] })
  ])));
  const head = new THREE.Group(); head.position.set(0, 1.12, -.72); body.add(head);
  head.add(mesh(merge([
    part(Ball(.33, 7, 5), C.fox, { s: [1, .9, 1.05], jitter: .02, seed: 9 }),
    part(Cone(.2, .55, 6), C.white, { p: [0, -.08, -.4], r: [-PI / 2, 0, 0] }),
    part(Cone(.14, .5, 6), C.fox, { p: [0, -.02, -.38], r: [-PI / 2 - .12, 0, 0] }),
    part(Ico(.06), C.black, { p: [0, -.06, -.66] }),
    part(Cone(.14, .38, 4), C.fox, { p: [-.17, .34, .02], r: [0, 0, .22] }), part(Cone(.14, .38, 4), C.fox, { p: [.17, .34, .02], r: [0, 0, -.22] }),
    part(Cone(.08, .2, 4), C.ear, { p: [-.17, .45, .02], r: [0, 0, .22] }), part(Cone(.08, .2, 4), C.ear, { p: [.17, .45, .02], r: [0, 0, -.22] }),
    part(Ico(.045), C.black, { p: [-.15, .06, -.27] }), part(Ico(.045), C.black, { p: [.15, .06, -.27] })
  ])));
  const tail = new THREE.Group(); tail.position.set(0, .95, .66); body.add(tail);
  tail.add(mesh(merge([
    part(Ball(.26, 6, 5), C.fox, { p: [0, .02, .45], s: [.9, .9, 2.1], jitter: .02, seed: 13 }),
    part(Cone(.21, .38, 6), C.white, { p: [0, .02, 1.02], r: [PI / 2, 0, 0] })
  ]))); tail.rotation.x = .35;
  const legGeo = () => merge([part(Cyl(.08, .06, .62, 5), C.foxDark, { p: [0, -.25, 0] }), part(Cyl(.065, .07, .26, 5), C.black, { p: [0, -.5, 0] })]);
  const legs = [[-.2, -.42], [.2, -.42], [-.2, .42], [.2, .42]].map(([x, z]) => { const l = mesh(legGeo()); l.position.set(x, .66, z); g.add(l); return l; });
  return { g, body, head, tail, legs };
}

export async function run(api) {
  const { say, sfx, M, wait, alive, S } = api;
  const host = document.getElementById('fr'), canvas = document.getElementById('frc'), hud = document.getElementById('frh');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));   // iPad: 1.5 looks the same at arm's length, far less work
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(FOG);
  scene.fog = new THREE.Fog(FOG, 26, 64);
  const cam = new THREE.PerspectiveCamera(55, 1, .1, 160);
  scene.add(new THREE.HemisphereLight(0xEFF6FF, 0x2E5A35, 1.25));
  const sun = new THREE.DirectionalLight(0xFFE9C4, 2.2); sun.position.set(-9, 14, 6); sun.target.position.set(0, 0, -10);
  /* the sun never moves → shadows of trees, rocks and stumps are painted onto the ground once (see bake below).
     Fifi and the things on the path get soft round shadow spots. No shadow maps = much less work for the iPad. */
  const SUN = new THREE.Vector3(-9, 14, 16);                 // towards the sun (position − target)
  const SHX = -SUN.x / SUN.y, SHZ = -SUN.z / SUN.y;          // ground shift per unit of height
  scene.add(sun, sun.target);

  /* sky: a big dome, blue at the top fading into the misty horizon (no fog on it) */
  {
    const g = new THREE.SphereGeometry(120, 16, 10, 0, PI * 2, 0, PI / 2), pos = g.attributes.position, col = new Float32Array(pos.count * 3);
    const top = new THREE.Color(C.skyTop), low = new THREE.Color(C.skyLow), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { c.copy(low).lerp(top, Math.pow(Math.max(0, pos.getY(i) / 120), .55)); col.set([c.r, c.g, c.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const dome = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false })); dome.position.y = -2; scene.add(dome);
  }
  /* low-poly clouds drifting slowly across the sky */
  const clouds = [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
    const m = new THREE.Mesh(GEO.cloud(i + 1), SKYMAT);
    m.position.set(-60 + i * 17 + Math.random() * 8, 11 + Math.random() * 6, -70 - Math.random() * 30);
    m.scale.setScalar(1.6 + Math.random() * 1.4); m.rotation.y = Math.random() * .6 - .3; scene.add(m); return m;
  });

  const resize = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h;
    cam.fov = w / h < 1 ? 70 : 55; cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);

  /* ground: 4 faceted tiles that leapfrog forward. Each tile carries its own trees, rocks and stumps,
     so their shadows can be painted into the tile's texture once, at the start. */
  const TILE = 30, TW = 70, NT = 4, tiles = [];
  const tileGeo = seed => {
    const g = new THREE.PlaneGeometry(TW, TILE, 35, 15); g.rotateX(-PI / 2);
    const pos = g.attributes.position; let k = seed;
    const rnd = () => ((k = (k * 16807) % 2147483647) / 2147483647 - .5);
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), edge = Math.abs(z) > TILE / 2 - .01, onPath = Math.abs(x) < 3.6;
      pos.setY(i, edge ? 0 : rnd() * (onPath ? .06 : .3)); }
    const ng = g.toNonIndexed(), p = ng.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let t = 0; t < p.count; t += 3) {
      const cx = (p.getX(t) + p.getX(t + 1) + p.getX(t + 2)) / 3, r = rnd();
      c.setHex(Math.abs(cx) < 3.1 ? (r > 0 ? C.path : C.path2) : Math.abs(cx) < 3.9 ? (r > 0 ? C.path2 : C.ground2) : (r > .1 ? C.ground : C.ground2));
      for (let v = 0; v < 3; v++) col.set([c.r, c.g, c.b], (t + v) * 3);
    }
    ng.setAttribute('color', new THREE.BufferAttribute(col, 3)); ng.computeVertexNormals(); g.dispose(); return ng;
  };

  /* scenery kinds; shade = how its shadow is drawn: tiers [radius, height of the disc, height of the tip], trunk height */
  const KINDS = [
    { geo: GEO.pine(1, 1), n: 15, side: [4.6, 22], sc: [.9, 1.4], shade: { trunk: 1.6, tiers: [0, 1, 2, 3].map(i => [1.45 - i * .28, 1.5 + i * .95, 1.5 + i * .95 + 1.55 - i * .12]) } },
    { geo: GEO.pine(1.25, 2), n: 13, side: [5.5, 24], sc: [.9, 1.3], shade: { trunk: 2, tiers: [0, 1, 2, 3].map(i => [1.45 - i * .28, 1.25 * (1.5 + i * .95), 1.25 * (1.5 + i * .95) + 1.55 - i * .12]) } },
    { geo: GEO.stump(), n: 2, side: [4, 9], sc: [.8, 1.2], shade: { tiers: [[.48, 0, .3], [.45, .6, .6]] } },
    { geo: GEO.rock(3), n: 2, side: [4, 10], sc: [.7, 1.6], shade: { tiers: [[.7, 0, .25], [.55, .3, .5]] } },
    { geo: GEO.rock(4, 1.3), n: 2, side: [5, 12], sc: [.8, 1.5], shade: { tiers: [[.9, 0, .35], [.7, .4, .65]] } },
    { geo: GEO.tuft(1), n: 10, side: [3.4, 8], sc: [.7, 1.3] },
    { geo: GEO.flowers(), n: 5, side: [3.6, 7], sc: [.8, 1.2] }
  ];
  let ks = 777; const srnd = () => (ks = (ks * 16807) % 2147483647) / 2147483647;     // same forest every time
  const layout = Array.from({ length: NT }, () => KINDS.map(K => Array.from({ length: K.n }, () => ({
    x: (srnd() < .5 ? -1 : 1) * (K.side[0] + srnd() * (K.side[1] - K.side[0])), z: (srnd() - .5) * TILE,
    s: K.sc[0] + srnd() * (K.sc[1] - K.sc[0]), ry: srnd() * 6 }))));

  /* bake: paint every shadow that falls on tile i (from its own trees and its neighbours') into a texture */
  const PX = 15, CW = TW * PX, CH = TILE * PX;
  const bake = ti => {
    const sh = document.createElement('canvas'); sh.width = CW; sh.height = CH; const x = sh.getContext('2d'); x.fillStyle = '#000';
    const toC = (wx, wz) => [(wx + TW / 2) * PX, (wz + TILE / 2) * PX];
    const disc = (cx, cz, r, h, tip) => {                     // a tier: disc at height h + its tip, projected along the sun
      const [ax, az] = toC(cx + SHX * h, cz + SHZ * h), [tx, tz] = toC(cx + SHX * tip, cz + SHZ * tip), R = r * PX;
      x.beginPath(); x.arc(ax, az, R, 0, PI * 2); x.fill();
      const dx = tx - ax, dz = tz - az, L = Math.hypot(dx, dz) || 1, nx = -dz / L * R, nz = dx / L * R;
      x.beginPath(); x.moveTo(ax + nx, az + nz); x.lineTo(tx, tz); x.lineTo(ax - nx, az - nz); x.closePath(); x.fill();
    };
    [-1, 0, 1].forEach(d => {                                 // neighbours: d = -1 is the tile in front (+z)
      const src = layout[(ti + d + NT) % NT], oz = -d * TILE;
      KINDS.forEach((K, k) => { if (!K.shade) return; src[k].forEach(o => {
        const cz = o.z + oz, s = o.s;
        if (K.shade.trunk) { const h = K.shade.trunk * s, [bx, bz] = toC(o.x, cz), [ex, ez] = toC(o.x + SHX * h, cz + SHZ * h);
          x.lineWidth = .4 * s * PX; x.lineCap = 'round'; x.strokeStyle = '#000'; x.beginPath(); x.moveTo(bx, bz); x.lineTo(ex, ez); x.stroke(); }
        K.shade.tiers.forEach(([r, h, tip]) => disc(o.x, cz, r * s, h * s, tip * s));
      }); });
    });
    const c = document.createElement('canvas'); c.width = CW; c.height = CH; const y = c.getContext('2d');
    y.fillStyle = '#fff'; y.fillRect(0, 0, CW, CH);
    y.globalAlpha = .1; y.drawImage(sh, -1.5, -1.5); y.drawImage(sh, 1.5, 1.5);   // a hint of soft edge
    y.globalAlpha = .64; y.drawImage(sh, 0, 0);               // strong, even darkness (also where shadows overlap)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  };
  for (let i = 0; i < NT; i++) {
    const m = new THREE.Mesh(tileGeo(11 + i * 31), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, map: bake(i) }));
    m.position.z = 10 - TILE / 2 - i * TILE; scene.add(m); tiles.push(m);
  }

  /* scenery drawn as InstancedMesh (one draw call per kind), following its tile */
  const D = new THREE.Object3D();
  const deco = KINDS.map((K, k) => { const im = new THREE.InstancedMesh(K.geo, MAT, K.n * NT); im.frustumCulled = false; scene.add(im); return { im, k }; });
  const drawDeco = () => deco.forEach(({ im, k }) => {
    let n = 0; tiles.forEach((tm, ti) => layout[ti][k].forEach(o => {
      D.position.set(o.x, 0, tm.position.z + o.z); D.rotation.set(0, o.ry, 0); D.scale.setScalar(o.s); D.updateMatrix(); im.setMatrixAt(n++, D.matrix);
    })); im.instanceMatrix.needsUpdate = true;
  });

  /* Fifi */
  const F = makeFox(); scene.add(F.g); const fBlob = blob(.55, .8); scene.add(fBlob);
  let lane = 1, fx = 0, fy = 0, vy = 0, stumble = 0;
  cam.position.set(0, 3.3, 6.4); cam.lookAt(0, 1, -5);

  /* things on the path */
  const things = [];
  let speed = 0, target = 0, spawnZ = 0, count = 0, finished = false, started = false;
  const got = Object.fromEntries(Object.keys(ITEMS).map(k => [k, 0])), heardFirst = {};
  const PATHGEO = { log: GEO.log(), stump: GEO.stump(), stone: GEO.rock(7, 1.05) };
  Object.keys(ITEMS).forEach(k => PATHGEO[k] = GEO[k]());
  const drawHud = () => {
    hud.innerHTML = `<div class="fr-basket">🧺 ${Array.from({ length: GOAL }, (_, i) => `<i class="${i < count ? 'on' : ''}"></i>`).join('')}</div>
      <div class="fr-got">${Object.entries(got).filter(([, n]) => n).map(([k, n]) => `<span>${ITEMS[k].e}<b>${n}</b></span>`).join('')}</div>`;
  };
  drawHud();
  const spawn = z => {
    const kinds = Object.keys(ITEMS), l = Math.floor(Math.random() * 3);
    if (Math.random() < .27 && count > 0) {          // an obstacle (never at the very start)
      const ob = ['log', 'stump', 'stone'][Math.floor(Math.random() * 3)], m = mesh(PATHGEO[ob]);
      const b = blob(ob === 'log' ? .5 : .55, ob === 'log' ? 2 : 1.1); b.position.set(SHX * .25, .03, SHZ * .25); m.add(b);
      m.position.set(LANES[l], 0, z); if (ob !== 'log') m.rotation.y = Math.random() * 6; scene.add(m); things.push({ m, kind: ob, lane: l, z, item: false });
    } else {
      const k = kinds[Math.floor(Math.random() * kinds.length)], n = Math.random() < .35 ? 2 : 1;
      for (let i = 0; i < n; i++) { const m = mesh(PATHGEO[k]); m.add(blob(.3)); m.scale.setScalar(1.3); m.position.set(LANES[l], .15, z - i * 2.2); scene.add(m); things.push({ m, kind: k, lane: l, z: z - i * 2.2, item: true }); }
    }
  };
  for (let z = -18; z > -60; z -= 7) spawn(z);
  spawnZ = -60;

  /* talking: never pile up lines while running */
  let talking = false;
  const talk = async lines => { if (talking || !alive()) return; talking = true; for (const [w, l, t] of lines) { if (!alive()) break; await say(w, l, t); } talking = false; };

  /* controls: left third / right third / middle = jump; swipes too */
  let sx = 0, sy = 0;
  const move = d => { if (!started || finished) return; const n = Math.max(0, Math.min(2, lane + d)); if (n !== lane) { lane = n; sfx('tick'); } };
  const jump = () => { if (!started || finished) return; if (fy < .05) { vy = 7.2; sfx('pop'); } };
  host.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  host.addEventListener('pointerup', e => {
    if (e.target.closest('button')) return;
    const dx = e.clientX - sx, dy = e.clientY - sy, W = host.clientWidth;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) return move(dx > 0 ? 1 : -1);
    if (dy < -40) return jump();
    const x = e.clientX - host.getBoundingClientRect().left;
    if (x < W / 3) move(-1); else if (x > W * 2 / 3) move(1); else jump();
  });
  addEventListener('keydown', e => { if (!alive()) return; if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); if (e.key === ' ' || e.key === 'ArrowUp') jump(); });

  /* ---------- the loop ---------- */
  let last = performance.now(), t = 0, raf = 0;
  const pop = [];
  const frame = now => {
    if (!alive()) { cancelAnimationFrame(raf); renderer.dispose(); removeEventListener('resize', resize); return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
    speed += (target - speed) * Math.min(1, dt * 1.5);
    const dz = speed * dt;

    tiles.forEach(m => { m.position.z += dz; if (m.position.z - TILE / 2 > 12) m.position.z -= TILE * tiles.length; });
    drawDeco();
    clouds.forEach(c => { c.position.x += dt * .8; if (c.position.x > 75) c.position.x = -75; });

    /* Fifi: lanes, jump, gallop */
    fx += (LANES[lane] - fx) * Math.min(1, dt * 10);
    vy -= 20 * dt; fy = Math.max(0, fy + vy * dt); if (fy === 0) vy = Math.max(0, vy);
    const run = speed > .5 && fy === 0 ? 1 : 0, ph = t * Math.max(speed, 3) * 1.5;
    F.g.position.set(fx, fy + run * Math.abs(Math.sin(ph)) * .1, 0);
    fBlob.position.set(fx + .1, .04, -.05); fBlob.scale.set(.8 * (1 - Math.min(.5, fy * .25)), 1 - Math.min(.5, fy * .25), 1);
    F.g.rotation.z = (LANES[lane] - fx) * -.15; F.g.rotation.y = (LANES[lane] - fx) * .25;
    F.legs[0].rotation.x = F.legs[1].rotation.x = run * Math.sin(ph) * .8 + (fy > 0 ? -.6 : 0);
    F.legs[2].rotation.x = F.legs[3].rotation.x = run * Math.sin(ph + PI * .8) * .8 + (fy > 0 ? .6 : 0);
    F.legs[1].rotation.x += run * .15; F.legs[3].rotation.x -= run * .15;
    F.body.rotation.x = run * Math.sin(ph) * .05; F.head.rotation.x = run * Math.sin(ph + 1) * .06;
    F.tail.rotation.y = Math.sin(t * 5) * .3; F.tail.rotation.x = .35 + run * Math.sin(ph) * .12;
    if (stumble > 0) { stumble -= dt; F.body.rotation.z = Math.sin(stumble * 14) * .25; } else F.body.rotation.z = 0;
    cam.position.x += (fx * .45 - cam.position.x) * Math.min(1, dt * 3); cam.lookAt(cam.position.x * .6, 1, -5);

    for (let i = things.length - 1; i >= 0; i--) {
      const o = things[i]; o.z += dz; o.m.position.z = o.z;
      if (o.item) { o.m.rotation.y += dt * 2; o.m.position.y = .15 + Math.sin(t * 4 + o.z) * .08; o.m.children[0].position.y = (.04 - o.m.position.y) / 1.3; }
      if (!o.done && Math.abs(o.z) < .75 && o.lane === lane) {
        if (o.item) {
          o.done = true; things.splice(i, 1); pop.push({ m: o.m, v: 0 });
          count++; got[o.kind]++; sfx('ding'); drawHud();
          const it = ITEMS[o.kind];
          if (!heardFirst[o.kind] && !S.plOnly) { heardFirst[o.kind] = 1; talk([['pip', 'pl', it.pl], ['fifi', 'en', it.en]]); }
          else talk([['pip', 'pl', it.pl]]);
          if (count >= GOAL) finish();
          continue;
        } else if (fy < (o.kind === 'log' ? .55 : .75)) {
          o.done = true; stumble = .6; speed = 2; sfx('plop');
          talk([[Math.random() < .5 ? 'pip' : 'fifi', ...(Math.random() < .5 ? ['pl', 'Ojej!'] : ['en', 'Oops!'])]]);
        }
      }
      if (o.z > 8) { scene.remove(o.m); things.splice(i, 1); }
    }
    for (let i = pop.length - 1; i >= 0; i--) { const p = pop[i]; p.v += dt; p.m.position.y += dt * 6; p.m.scale.multiplyScalar(1 - dt * 2.5); if (p.v > .5) { scene.remove(p.m); pop.splice(i, 1); } }

    if (!finished) { spawnZ += dz; while (spawnZ > -60) { spawnZ -= 6 + Math.random() * 4; spawn(spawnZ); } }
    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  /* ---------- start + finish ---------- */
  const finish = async () => {
    if (finished) return; finished = true; target = 0;
    things.filter(o => !o.item).forEach(o => scene.remove(o.m));
    await wait(1200); if (!alive()) return;
    vy = 6; api.confetti();
    while (talking) await wait(100);
    await api.seq([['pip', 'pl', 'Brawo! Pełny koszyk!'], ...(S.plOnly ? [] : [['fifi', 'en', 'Our basket is full! Well done, {kid}!']])]);
    if (!alive()) return;
    M.stop(.8); api.reward(() => api.again());
  };

  M.play('forest', .26);
  await api.seq([['pip', 'pl', 'Idziemy do lasu!'], ...(S.plOnly ? [] : [['fifi', 'en', "Let's go to the forest! Help me fill the basket!"]])]);
  if (!alive()) return;
  host.classList.add('hints');
  await api.seq([['fifi', 'en', 'Tap here and here to move me. Tap the middle to jump!']]);
  started = true; speed = 0; target = 7.5;
  setTimeout(() => host.classList.remove('hints'), 4000);
  const faster = setInterval(() => { if (!alive()) return clearInterval(faster); if (!finished) target = Math.min(10, target + .25); }, 8000);
}
