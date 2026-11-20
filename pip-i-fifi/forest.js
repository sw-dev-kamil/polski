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
import { GLTFLoader } from './vendor/GLTFLoader.js';
/* Fifi's model: "Running Fox" by Google Data Arts Team (CC BY) — models/fox.glb, with its run animation.
   Until it has loaded (or if it ever fails), the fox made from simple shapes below is shown. */
const FOX_URL = './models/fox.glb';
const FOX_FRONT = 1;        // which way the model's nose points along z (+1 / -1); the game runs towards -z

const LANES = [-2.1, 0, 2.1];
/* two stretches: the pine forest (mushrooms + blueberries), then Pip joins and they run through
   an autumn birch wood (pine cones + leaves). bonus = little extras that also turn up. */
const STAGES = [
  { goals: { grzybek: 20, jagody: 30 }, bonus: ['zoladz', 'poziomka'], ground: 0x3F7D48, leaves: false },
  { goals: { szyszka: 10, lisc: 15 },   bonus: ['zoladz'],             ground: 0x6A8C45, leaves: true }
];
if (/quick/.test(location.hash)) STAGES.forEach(st => Object.keys(st.goals).forEach(k => st.goals[k] = 2));   // test switch: #quick
const ROW = { jagody: [2, 4], grzybek: [1, 3], lisc: [1, 3], szyszka: [1, 2] };   // how many in a little row
const COMPLETE = { grzybek: ['Wszystkie grzybki!', 'All the mushrooms!'], jagody: ['Wszystkie jagody!', 'All the blueberries!'],
  szyszka: ['Wszystkie szyszki!', 'All the pine cones!'], lisc: ['Wszystkie liście!', 'All the leaves!'] };
const CONE_ICON = '<svg viewBox="0 0 20 24" width="1em" height="1.1em" style="vertical-align:-.15em"><ellipse cx="10" cy="13" rx="7" ry="10" fill="#8A5A2E"/><path d="M4 9h12M3.5 13h13M4 17h12M6 21h8M10 3v20" stroke="#5B3A1C" stroke-width="1.4"/></svg>';
const ITEMS = {
  grzybek: { e: '🍄', pl: 'Grzybek!', en: 'A mushroom!' },
  jagody:  { e: '🫐', pl: 'Jagody!',  en: 'Blueberries!' },
  zoladz:  { e: '🌰', pl: 'Żołądź!',  en: 'An acorn!' },
  poziomka:{ e: '🍓', pl: 'Poziomka!', en: 'A wild strawberry!' },
  szyszka: { e: CONE_ICON, pl: 'Szyszka!', en: 'A pine cone!' },
  lisc:    { e: '🍂', pl: 'Liść!',    en: 'A leaf!' }
};
const C = {
  fox: 0xE8742C, foxDark: 0xC75E1F, white: 0xF6EFE6, black: 0x2A211C, ear: 0x3A2A22,
  trunk: 0x8A5A35, pine1: 0x3DB34F, pine2: 0x34A146, pine3: 0x48BF58,
  ground: 0x3F7D48, path: 0x86704C, pathEdge: 0x5F7542,
  log: 0x9A6338, logIn: 0xC89A64, logDark: 0x4A3020, stone: 0x77777F, stone2: 0x8A8A93,
  cap: 0xD9433B, stem: 0xF3E6CF, berry: 0x4656B8, acorn: 0xB07438, acornCap: 0x6E4A2C,
  straw: 0xE8424A, leaf: 0x3FAE4F, grass: 0x4FB04A, grass2: 0x62C25A, daisy: 0xFFFFFF, daisyC: 0xFFD23C, pinkF: 0xF07CB8,
  birch: 0xF1EEE6, birchMark: 0x2E2A26, gold: 0xE8C23A, goldGreen: 0xC4C949, orange: 0xE07B2A, red: 0xC9452E,
  cone1: 0x8A5A2E, cone2: 0x6E4523, leafO: 0xF08A24, leafR: 0xD9432F, leafY: 0xF2C230,
  hog: 0x7A5034, hogSpike: 0x4E3322, hogFace: 0xEBCFA5, hogNose: 0x241A14, cheek: 0xF29C9C,
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
  birch(seed = 1) {   // autumn birch: white trunk with dark marks, golden faceted crown
    const P = [part(Cyl(.17, .22, 3.6, 6), C.birch, { p: [0, 1.8, 0] })];
    for (let i = 0; i < 7; i++) P.push(part(new THREE.BoxGeometry(.22, .05, .06), C.birchMark, { p: [Math.sin(i * 2.3) * .17, .5 + i * .42, Math.cos(i * 2.3) * .17], r: [0, i * 2.3, (i % 2 - .5) * .3] }));
    [[0, 4.1, 0, 1.25], [.6, 3.5, .2, .9], [-.55, 3.6, -.25, .95], [0, 4.9, .1, .8]].forEach(([x, y, z, r], i) =>
      P.push(part(new THREE.IcosahedronGeometry(r, 0), i % 2 ? C.goldGreen : C.gold, { p: [x, y, z], jitter: .08, seed: seed * 5 + i })));
    return merge(P);
  },
  oak(color, seed = 1) {   // round autumn tree, orange or red
    const P = [part(Cyl(.22, .32, 2.2, 6), C.trunk, { p: [0, 1.1, 0] })];
    [[0, 3, 0, 1.5], [.9, 2.6, .3, 1.05], [-.9, 2.7, -.2, 1.1], [.1, 3.8, -.2, 1]].forEach(([x, y, z, r], i) =>
      P.push(part(new THREE.IcosahedronGeometry(r, 0), i === 3 ? C.gold : color, { p: [x, y, z], jitter: .1, seed: seed * 3 + i })));
    return merge(P);
  },
  szyszka() {
    const P = []; [.1, .2, .24, .21, .15].forEach((r, i) => P.push(part(Cone(r, .2, 7), i % 2 ? C.cone2 : C.cone1, { p: [0, .12 + i * .12, 0], r: [PI, i * .4, 0] })));
    P.push(part(Cone(.09, .16, 6), C.cone1, { p: [0, .78, 0] })); return merge(P);
  },
  lisc(color) {
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(.34, .2, .3, .45); sh.quadraticCurveTo(.22, .72, 0, .95);
    sh.quadraticCurveTo(-.22, .72, -.3, .45); sh.quadraticCurveTo(-.34, .2, 0, 0);
    return merge([part(new THREE.ExtrudeGeometry(sh, { depth: .05, bevelEnabled: false, curveSegments: 3 }), color, { p: [0, .12, -.025] }),
      part(Cyl(.02, .02, .2, 3), C.trunk, { p: [0, .05, 0] }), part(new THREE.BoxGeometry(.025, .7, .07), C.trunk, { p: [0, .48, 0] })]);
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
/* Pip the hedgehog in 3D (front = -z): tan face with a pointy snout, a coat of chunky brown spikes
   sweeping backwards, four short legs (separate, so they can trot) */
function makePip() {
  const g = new THREE.Group(), body = new THREE.Group(), P = []; g.add(body);
  const TAN = 0xD9AE7E, TAN2 = 0xC99A68, SP = [0x6B4226, 0x7E5232, 0x5A3820, 0x8A5C3A];
  P.push(part(Ball(.5, 7, 5), TAN, { p: [0, .5, 0], s: [.72, .62, 1.0], jitter: .02, seed: 3 }));             // tummy / body
  P.push(part(Ball(.36, 7, 5), TAN, { p: [0, .55, -.45], s: [.95, .9, 1], jitter: .02, seed: 4 }));           // head
  P.push(part(Cone(.27, .58, 7), TAN, { p: [0, .47, -.82], r: [-PI / 2 - .14, 0, 0], jitter: .015, seed: 6 })); // snout
  P.push(part(Ico(.08), 0x241A14, { p: [0, .43, -1.1] }));                                                  // nose
  [-1, 1].forEach(sx => {
    P.push(part(Ico(.055), 0x161210, { p: [sx * .25, .62, -.62] }));                                          // eyes
    P.push(part(Ball(.13, 6, 4), TAN2, { p: [sx * .3, .8, -.38], s: [1, .9, .45], r: [0, sx * .5, 0] }));    // ears
    P.push(part(Ball(.08, 6, 4), 0x8A5C3A, { p: [sx * .31, .8, -.42], s: [1, .9, .3], r: [0, sx * .5, 0] }));
  });
  // spiky coat: a brown shell + many chunky spikes pointing out and back
  const C0 = new THREE.Vector3(0, .62, .1), R = new THREE.Vector3(.52, .5, .66);
  P.push(part(Ball(1, 7, 5), SP[0], { p: [C0.x, C0.y, C0.z], s: [R.x, R.y, R.z], jitter: .03, seed: 8 }));
  const up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), e = new THREE.Euler(), N = 90;
  for (let i = 0; i < N; i++) {
    const y = 1 - (i + .5) / N * 2, rr = Math.sqrt(1 - y * y), th = i * 2.39996;
    const n = new THREE.Vector3(Math.cos(th) * rr, y, Math.sin(th) * rr);
    if (n.y < -.3 || (n.z < -.3 && n.y < .55) || n.z < -.72) continue;      // keep the face and tummy clear
    const base = new THREE.Vector3(n.x * R.x, n.y * R.y, n.z * R.z).add(C0);
    const dir = n.clone().add(new THREE.Vector3(0, .1, .75)).normalize();     // sweep backwards
    const len = .3 + ((i * 37) % 10) / 10 * .16;
    q.setFromUnitVectors(up, dir); e.setFromQuaternion(q, 'ZYX');
    P.push(part(Cone(.13, len, 4), SP[i % 4], { p: [base.x + dir.x * len * .4, base.y + dir.y * len * .4, base.z + dir.z * len * .4], r: [e.x, e.y, e.z] }));
  }
  const m = mesh(merge(P)); body.add(m);
  const legs = [[-.24, -.3], [.24, -.3], [-.24, .32], [.24, .32]].map(([x, z]) => {
    const l = mesh(merge([part(Cyl(.12, .13, .24, 6), TAN2, { p: [0, -.12, 0] }), part(Ball(.13, 6, 3), TAN2, { p: [0, -.22, -.05], s: [1, .5, 1.3] })]));
    l.position.set(x, .28, z); g.add(l); return l; });
  return { g, m: body, legs };
}

/* colour the grey hedgehog model (models/hedgehog.glb, face towards +z, feet at y = 0):
   face, tummy and feet tan, eyes and nose black, everything else a mix of spike browns */
function paintHog(root) {
  root.updateMatrixWorld(true);
  const SP = [0x6B4226, 0x7E5232, 0x5A3820, 0x8A5C3A].map(h => new THREE.Color(h));
  const TAN = new THREE.Color(0xD9AE7E), TAN2 = new THREE.Color(0xC99A68), BLACK = new THREE.Color(0x1A1310), EAR = new THREE.Color(0xB8875A);
  const v = [0, 1, 2].map(() => new THREE.Vector3()), c = new THREE.Vector3(), n = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
  const near = (p, x, y, z, r) => Math.hypot(p.x - x, p.y - y, p.z - z) < r;
  root.traverse(o => {
    if (!o.isMesh) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry; o.geometry = g;
    const pos = g.attributes.position, col = new Float32Array(pos.count * 3);
    for (let t = 0; t < pos.count; t += 3) {
      for (let k = 0; k < 3; k++) v[k].fromBufferAttribute(pos, t + k).applyMatrix4(o.matrixWorld);
      c.copy(v[0]).add(v[1]).add(v[2]).divideScalar(3);
      n.crossVectors(e1.subVectors(v[1], v[0]), e2.subVectors(v[2], v[0])).normalize();
      const d = c.clone().sub(new THREE.Vector3(0, .026, 0)).normalize();
      let k;
      const all = (x, y, z, r) => v.every(p => near(p, x, y, z, r));                         // the whole triangle inside the bump
      if (all(0, .0232, .0488, .0055)) k = BLACK;                                              // nose
      else if (all(.012, .030, .036, .0052) || all(-.012, .030, .036, .0052)) k = BLACK;         // eyes
      else if (near(c, .012, .042, .030, .0055) || near(c, -.012, .042, .030, .0055)) k = EAR;     // ears
      else if (c.y < .0075) k = TAN2;                                                          // feet
      else if (n.y < -.5) k = TAN;                                                             // tummy
      else if (c.z > .018 && c.y < .038 && d.z > .5) k = TAN;                                  // face
      else k = SP[(t / 3 * 7 + (n.x > 0 ? 1 : 0)) % 4];                                        // spikes
      for (let q = 0; q < 3; q++) col.set([k.r, k.g, k.b], (t + q) * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.deleteAttribute('normal');
    g.applyMatrix4(o.matrixWorld); o.position.set(0, 0, 0); o.quaternion.identity(); o.scale.set(1, 1, 1);   // shape now in model space
    o.material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  });
  root.updateMatrixWorld(true);
  return root;
}
/* cut the 4 little legs out of the hedgehog so they can trot; each leg pivots at its top */
const HOG_LEGS = [[.0145, .0205], [-.0145, .0205], [.021, -.02], [-.021, -.02]], HOG_LEG_TOP = .008;
function splitHogLegs(root) {
  let mesh0 = null; root.traverse(o => { if (o.isMesh && !mesh0) mesh0 = o; }); if (!mesh0) return [];
  const g = mesh0.geometry, pos = g.attributes.position, col = g.attributes.color;
  const parts = [[], [], [], [], []];                       // 0 = body, 1..4 = legs
  for (let t = 0; t < pos.count; t += 3) {
    let ymax = -1, cx = 0, cz = 0; for (let k = 0; k < 3; k++) { ymax = Math.max(ymax, pos.getY(t + k)); cx += pos.getX(t + k) / 3; cz += pos.getZ(t + k) / 3; }
    let leg = 0; if (ymax < HOG_LEG_TOP) HOG_LEGS.forEach(([x, z], i) => { if (Math.hypot(cx - x, cz - z) < .0085) leg = i + 1; });
    parts[leg].push(t);
  }
  const build = (list, ox, oy, oz) => { const P = new Float32Array(list.length * 9), Cc = new Float32Array(list.length * 9);
    list.forEach((t, i) => { for (let k = 0; k < 3; k++) { P.set([pos.getX(t + k) - ox, pos.getY(t + k) - oy, pos.getZ(t + k) - oz], (i * 3 + k) * 3); Cc.set([col.getX(t + k), col.getY(t + k), col.getZ(t + k)], (i * 3 + k) * 3); } });
    const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.BufferAttribute(P, 3)); ng.setAttribute('color', new THREE.BufferAttribute(Cc, 3)); return ng; };
  mesh0.geometry = build(parts[0], 0, 0, 0);
  return HOG_LEGS.map(([x, z], i) => { const m = new THREE.Mesh(build(parts[i + 1], x, HOG_LEG_TOP, z), mesh0.material); m.position.set(x, HOG_LEG_TOP, z); mesh0.parent.add(m); return m; });
}

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
  const tileGeo = () => { const g = new THREE.PlaneGeometry(TW, TILE, 1, 1); g.rotateX(-PI / 2); return g; };

  /* scenery kinds; shade = how its shadow is drawn: tiers [radius, height of the disc, height of the tip], trunk height */
  const KINDS_A = [
    { geo: GEO.pine(1, 1), n: 24, side: [4.4, 22], sc: [.9, 1.4], shade: { trunk: 1.6, tiers: [0, 1, 2, 3].map(i => [1.45 - i * .28, 1.5 + i * .95, 1.5 + i * .95 + 1.55 - i * .12]) } },
    { geo: GEO.pine(1.25, 2), n: 20, side: [5.2, 25], sc: [.9, 1.3], shade: { trunk: 2, tiers: [0, 1, 2, 3].map(i => [1.45 - i * .28, 1.25 * (1.5 + i * .95), 1.25 * (1.5 + i * .95) + 1.55 - i * .12]) } },
    { geo: GEO.stump(), n: 4, side: [4, 10], sc: [.8, 1.2], shade: { tiers: [[.48, 0, .3], [.45, .6, .6]] } },
    { geo: GEO.rock(3), n: 6, side: [3.9, 12], sc: [.7, 1.6], shade: { tiers: [[.7, 0, .25], [.55, .3, .5]] } },
    { geo: GEO.rock(4, 1.3), n: 4, side: [5, 14], sc: [.8, 1.5], shade: { tiers: [[.9, 0, .35], [.7, .4, .65]] } },
    { geo: GEO.tuft(1), n: 10, side: [3.4, 8], sc: [.7, 1.3] },
    { geo: GEO.flowers(), n: 5, side: [3.6, 7], sc: [.8, 1.2] }
  ];
  const BIRCH = { trunk: 3.4, tiers: [[1.3, 3.3, 4.6], [.8, 4.4, 5.6]] }, OAK = { trunk: 1.8, tiers: [[1.6, 2.2, 3.9], [1.1, 3.2, 4.6]] };
  const KINDS_B = [
    { geo: GEO.birch(1), n: 16, side: [4.4, 20], sc: [.9, 1.3], shade: BIRCH },
    { geo: GEO.birch(2), n: 12, side: [5, 24], sc: [1, 1.4], shade: BIRCH },
    { geo: GEO.oak(C.orange, 1), n: 8, side: [5, 22], sc: [.9, 1.3], shade: OAK },
    { geo: GEO.oak(C.red, 2), n: 6, side: [6, 24], sc: [.9, 1.3], shade: OAK },
    { geo: GEO.pine(1.2, 3), n: 6, side: [9, 25], sc: [.9, 1.3], shade: KINDS_A[1].shade },
    { geo: GEO.rock(5), n: 6, side: [3.9, 12], sc: [.7, 1.6], shade: KINDS_A[3].shade },
    { geo: GEO.stump(), n: 3, side: [4, 10], sc: [.8, 1.2], shade: KINDS_A[2].shade },
    { geo: GEO.tuft(2), n: 12, side: [3.4, 8], sc: [.7, 1.3] }
  ];
  let stage = 0, KINDS = KINDS_A, layout = [];
  const makeLayout = seed => { let ks = seed; const srnd = () => (ks = (ks * 16807) % 2147483647) / 2147483647;     // same forest every time
    layout = Array.from({ length: NT }, () => KINDS.map(K => Array.from({ length: K.n }, () => ({
      x: (srnd() < .5 ? -1 : 1) * (K.side[0] + srnd() * (K.side[1] - K.side[0])), z: (srnd() - .5) * TILE,
      s: K.sc[0] + srnd() * (K.sc[1] - K.sc[0]), ry: srnd() * 6 })))); };
  makeLayout(777);

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
    const hex = n => '#' + n.toString(16).padStart(6, '0');
    y.fillStyle = hex(STAGES[stage].ground); y.fillRect(0, 0, CW, CH);           // grass: one colour
    if (STAGES[stage].leaves) {                                                   // autumn: fallen leaves on the grass
      let k = 99 + ti * 17; const r = () => (k = (k * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 700; i++) { const lx = r() * CW, ly = r() * CH; if (Math.abs(lx - CW / 2) < 3.6 * PX) continue;
        y.fillStyle = hex([C.leafO, C.leafR, C.leafY, C.gold][i % 4]); y.beginPath(); y.ellipse(lx, ly, 5 + r() * 5, 2.5 + r() * 2.5, r() * 3, 0, 7); y.fill(); }
    }
    const P0 = (TW / 2 - 3.3) * PX, PW = 6.6 * PX;
    y.fillStyle = hex(C.pathEdge); y.fillRect(P0 - .35 * PX, 0, PW + .7 * PX, CH); // soft edge of the path
    y.fillStyle = hex(C.path); y.fillRect(P0, 0, PW, CH);                          // path: one colour
    y.globalAlpha = .1; y.drawImage(sh, -1.5, -1.5); y.drawImage(sh, 1.5, 1.5);   // a hint of soft edge
    y.globalAlpha = .64; y.drawImage(sh, 0, 0);               // strong, even darkness (also where shadows overlap)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  };
  for (let i = 0; i < NT; i++) {
    const m = new THREE.Mesh(tileGeo(), new THREE.MeshLambertMaterial({ map: bake(i) }));
    m.position.z = 10 - TILE / 2 - i * TILE; scene.add(m); tiles.push(m);
  }

  /* scenery drawn as InstancedMesh (one draw call per kind), following its tile */
  const D = new THREE.Object3D();
  let deco = [];
  const buildDeco = () => { deco.forEach(d => { scene.remove(d.im); d.im.dispose(); });
    deco = KINDS.map((K, k) => { const im = new THREE.InstancedMesh(K.geo, MAT, K.n * NT); im.frustumCulled = false; scene.add(im); return { im, k }; }); };
  buildDeco();
  const setStage = st => {            // swap the whole forest (behind a quick fade)
    stage = st; KINDS = st ? KINDS_B : KINDS_A; makeLayout(777 + st * 4242); buildDeco();
    tiles.forEach((m, i) => { m.material.map.dispose(); m.material.map = bake(i); m.material.needsUpdate = true; });
  };
  const drawDeco = () => deco.forEach(({ im, k }) => {
    let n = 0; tiles.forEach((tm, ti) => layout[ti][k].forEach(o => {
      D.position.set(o.x, 0, tm.position.z + o.z); D.rotation.set(0, o.ry, 0); D.scale.setScalar(o.s); D.updateMatrix(); im.setMatrixAt(n++, D.matrix);
    })); im.instanceMatrix.needsUpdate = true;
  });

  /* Fifi */
  const F = makeFox(); scene.add(F.g);
  let mixer = null, foxRun = null, foxBlob = 1;
  new GLTFLoader().load(FOX_URL, gl => {
    if (!alive()) return;
    const fox = gl.scene, box = new THREE.Box3();            // size from the base shape only (morph targets would inflate it)
    fox.traverse(o => { if (o.isMesh) { const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i++) box.expandByPoint(new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i))); } });
    const size = box.getSize(new THREE.Vector3());
    const k = 1.45 / size.y;                                  // about as tall as the shape fox (the Google fox is long and slim)
    fox.scale.setScalar(k); fox.position.set(-(box.min.x + box.max.x) / 2 * k, -box.min.y * k, -(box.min.z + box.max.z) / 2 * k);
    const holder = new THREE.Group(); holder.rotation.y = FOX_FRONT > 0 ? PI : 0; holder.add(fox);
    fox.traverse(o => { if (!o.isMesh) return;
      const c = o.geometry.attributes.color; if (c) { for (let i = 0; i < c.array.length; i++) c.array[i] = Math.min(1, c.array[i] * 1.35); c.needsUpdate = true; }   // its colours are a bit dark under our light
      o.material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }); o.frustumCulled = false; });
    foxBlob = .75;
    F.body.visible = false; F.legs.forEach(l => l.visible = false);
    F.body.parent.add(holder); F.model = holder;
    if (gl.animations[0]) { mixer = new THREE.AnimationMixer(fox); foxRun = mixer.clipAction(gl.animations[0]); foxRun.play(); }
  }, undefined, e => console.warn('fox model', e)); const fBlob = blob(.55, .8); scene.add(fBlob);
  let lane = 1, fx = 0, fy = 0, vy = 0, stumble = 0;
  cam.position.set(0, 3.3, 6.4); cam.lookAt(0, 1, -5);

  /* Pip: waits by the path after the first stretch, then runs alongside */
  const PIP = makePip(), pBlob = blob(.42, 1.1); PIP.g.add(pBlob); pBlob.position.y = .03;
  let pipMode = 'off'; PIP.g.visible = false; scene.add(PIP.g);
  new GLTFLoader().load('./models/hedgehog.glb', gl => {      // Kamil's hedgehog, coloured in code (paintHog)
    if (!alive()) return;
    const hog = paintHog(gl.scene); PIP.hogLegs = splitHogLegs(hog); const box = new THREE.Box3().setFromObject(hog), k = 1.0 / (box.max.y - box.min.y);
    const holder = new THREE.Group(); holder.add(hog); holder.scale.setScalar(k); holder.rotation.y = PI;   // its face points +z, the game's front is -z
    hog.position.y -= box.min.y;
    PIP.m.children.forEach(c => c.visible = false); PIP.legs.forEach(l => l.visible = false); PIP.m.add(holder);
  }, undefined, e => console.warn('hedgehog model', e));
  let paused = false;

  /* things on the path */
  const things = [];
  let speed = 0, target = 0, spawnZ = 0, count = 0, finished = false, started = false;
  const got = Object.fromEntries(Object.keys(ITEMS).map(k => [k, 0])), heardFirst = {};
  const PATHGEO = { log: GEO.log(), stump: GEO.stump(), stone: GEO.rock(7, 1.05) };
  Object.keys(ITEMS).forEach(k => { if (k !== 'lisc') PATHGEO[k] = GEO[k](); });
  const GOALS = () => STAGES[stage].goals;
  const done = k => got[k] >= GOALS()[k], allDone = () => Object.keys(GOALS()).every(done);
  PATHGEO.lisc = [GEO.lisc(C.leafO), GEO.lisc(C.leafR), GEO.lisc(C.leafY)];
  const drawHud = () => {
    hud.innerHTML = `<div class="fr-goals">${Object.entries(GOALS()).map(([k, n]) => `<div class="fr-goal${done(k) ? ' full' : ''}"><span>${ITEMS[k].e}</span>
        <div class="fr-bar"><i style="width:${Math.min(100, got[k] / n * 100)}%"></i></div><b>${Math.min(got[k], n)}/${n}</b></div>`).join('')}</div>
      <div class="fr-got">${Object.entries(got).filter(([k, n]) => n && STAGES[stage].bonus.includes(k)).map(([k, n]) => `<span>${ITEMS[k].e}<b>${n}</b></span>`).join('')}</div>`;
  };
  drawHud();
  const spawn = z => {
    const l = Math.floor(Math.random() * 3);
    if (Math.random() < .27 && count > 0) {          // an obstacle (never at the very start)
      const ob = ['log', 'stump', 'stone'][Math.floor(Math.random() * 3)], m = mesh(PATHGEO[ob]);
      const b = blob(ob === 'log' ? .5 : .55, ob === 'log' ? 2 : 1.1); b.position.set(SHX * .25, .03, SHZ * .25); m.add(b);
      m.position.set(LANES[l], 0, z); if (ob !== 'log') m.rotation.y = Math.random() * 6; scene.add(m); things.push({ m, kind: ob, lane: l, z, item: false });
    } else {
      const need = Object.keys(GOALS()).filter(q => !done(q)), bonus = STAGES[stage].bonus, pick = a => a[Math.floor(Math.random() * a.length)];
      const k = Math.random() < .18 || !need.length ? pick(bonus) : pick(need);
      const [a, b] = ROW[k] || [1, 1], n = a + Math.floor(Math.random() * (b - a + 1));
      for (let i = 0; i < n; i++) { const m = mesh(k === 'lisc' ? pick(PATHGEO.lisc) : PATHGEO[k]); m.add(blob(.3)); m.scale.setScalar(1.3); m.position.set(LANES[l], .15, z - i * 2.2); scene.add(m); things.push({ m, kind: k, lane: l, z: z - i * 2.2, item: true }); }
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
    fBlob.position.set(fx + .1, .04, -.05); fBlob.scale.set(.8 * foxBlob * (1 - Math.min(.5, fy * .25)), foxBlob * 1.6 * (1 - Math.min(.5, fy * .25)), 1);
    F.g.rotation.z = (LANES[lane] - fx) * -.15; F.g.rotation.y = (LANES[lane] - fx) * .25;
    F.legs[0].rotation.x = F.legs[1].rotation.x = run * Math.sin(ph) * .8 + (fy > 0 ? -.6 : 0);
    F.legs[2].rotation.x = F.legs[3].rotation.x = run * Math.sin(ph + PI * .8) * .8 + (fy > 0 ? .6 : 0);
    F.legs[1].rotation.x += run * .15; F.legs[3].rotation.x -= run * .15;
    F.body.rotation.x = run * Math.sin(ph) * .05; F.head.rotation.x = run * Math.sin(ph + 1) * .06;
    F.tail.rotation.y = Math.sin(t * 5) * .3; F.tail.rotation.x = .35 + run * Math.sin(ph) * .12;
    if (stumble > 0) { stumble -= dt; F.body.rotation.z = Math.sin(stumble * 14) * .25; } else F.body.rotation.z = 0;
    if (F.model) {                                            // the Google fox: its own run cycle, speed follows Fifi's speed
      F.model.rotation.z = F.body.rotation.z; F.model.rotation.x = fy > 0 ? -.15 : 0;
      if (mixer) mixer.update(speed > .5 ? dt * Math.min(1.3, Math.max(.45, speed / 8)) * (fy > 0 ? .4 : 1) : 0);
    }
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
          if (GOALS()[o.kind] && got[o.kind] === GOALS()[o.kind] && !allDone()) {   // one kind complete
            const [pl, en] = COMPLETE[o.kind]; setTimeout(() => talk([['pip', 'pl', pl], ['fifi', 'en', en]]), 900);
          }
          if (allDone()) stage === 0 ? meetPip() : finish();
          continue;
        } else if (fy < (o.kind === 'log' ? .55 : .75)) {
          o.done = true; stumble = .6; speed = 2; sfx('plop');
          talk([[Math.random() < .5 ? 'pip' : 'fifi', ...(Math.random() < .5 ? ['pl', 'Ojej!'] : ['en', 'Oops!'])]]);
        }
      }
      if (o.z > 8) { scene.remove(o.m); things.splice(i, 1); }
    }
    for (let i = pop.length - 1; i >= 0; i--) { const p = pop[i]; p.v += dt; p.m.position.y += dt * 6; p.m.scale.multiplyScalar(1 - dt * 2.5); if (p.v > .5) { scene.remove(p.m); pop.splice(i, 1); } }

    if (pipMode === 'waiting') { PIP.g.position.z += dz; PIP.g.position.y = Math.abs(Math.sin(t * 5)) * .12; if (PIP.g.position.z > -2.6) target = 0; }
    if (pipMode === 'running') { const rp = t * Math.max(speed, 3) * 1.8;
      PIP.g.position.set(3.35, (speed > .5 ? Math.abs(Math.sin(rp)) * .16 : 0), -.6 + Math.sin(t * .7) * .4); PIP.m.rotation.z = speed > .5 ? Math.sin(rp) * .06 : 0;
      PIP.legs.forEach((l, i) => l.rotation.x = speed > .5 ? Math.sin(rp * 1.2 + (i % 2 ? PI : 0) + (i > 1 ? PI : 0)) * .7 : 0);
      (PIP.hogLegs || []).forEach((l, i) => l.rotation.x = speed > .5 ? Math.sin(rp * 1.2 + (i % 2 ? PI : 0) + (i > 1 ? PI : 0)) * .8 : 0); }
    if (pipMode === 'waiting' && PIP.hogLegs) PIP.hogLegs.forEach((l, i) => l.rotation.x = Math.sin(t * 10 + i * 1.6) * .35);   // happy little tippy-taps
    if (!finished && !paused) { spawnZ += dz; while (spawnZ > -60) { spawnZ -= 6 + Math.random() * 4; spawn(spawnZ); } }
    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  /* ---------- halfway: meet Pip, then the autumn wood ---------- */
  let meeting = false;
  const meetPip = async () => {
    if (meeting) return; meeting = true; paused = true;
    things.filter(o => o.z < -1).forEach(o => { scene.remove(o.m); o.done = true; o.z = 99; });
    await wait(1200); if (!alive()) return;
    PIP.g.position.set(3.0, 0, -32); PIP.g.rotation.y = PI - .5; PIP.g.visible = true; pipMode = 'waiting'; target = 5;
    while (talking) await wait(100);
    await api.seq([['fifi', 'en', "Look! It's Pip!"]]);
    while (alive() && speed > .3) await wait(100); if (!alive()) return;
    pipMode = 'still'; PIP.g.position.y = 0;
    await api.seq([['pip', 'pl', 'Cześć, Fifi!'], ...(S.plOnly ? [] : [['fifi', 'en', 'Pip! Our basket is full!']]),
      ['pip', 'pl', 'Brawo! Teraz szukamy szyszek i liści!'], ...(S.plOnly ? [] : [['fifi', 'en', "Now let's find pine cones and leaves!"]]),
      ['pip', 'pl', 'Biegniemy razem!'], ...(S.plOnly ? [] : [['fifi', 'en', "Let's run together!"]])]);
    if (!alive()) return;
    const fade = document.createElement('div'); fade.className = 'fr-fade'; host.appendChild(fade);
    await wait(30); fade.classList.add('on'); await wait(600); if (!alive()) return;
    setStage(1); things.forEach(o => scene.remove(o.m)); things.length = 0;
    PIP.g.rotation.y = 0; pipMode = 'running'; spawnZ = -24; drawHud();
    fade.classList.remove('on'); await wait(600); fade.remove();
    paused = false; target = 7.5;
  };

  /* ---------- start + finish ---------- */
  const finish = async () => {
    if (finished) return; finished = true; target = 0;
    things.filter(o => !o.item).forEach(o => scene.remove(o.m));
    await wait(1200); if (!alive()) return;
    vy = 6; api.confetti();
    while (talking) await wait(100);
    PIP.m.rotation.z = 0;
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
  const faster = setInterval(() => { if (!alive()) return clearInterval(faster); if (!finished && !paused && target > 0) target = Math.min(10, target + .25); }, 8000);
}
export { makePip, paintHog, splitHogLegs };
