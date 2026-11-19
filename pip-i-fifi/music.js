/* =====================================================================
   PIP & FIFI — music. Original little tunes, synthesised in the browser
   (marimba, music box, soft bass, shaker). Nothing to download.
   Rendered once while the start screen is showing, then cached in memory.
   ===================================================================== */
(() => {
'use strict';
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const hz = n => { const m = /^([A-G])(#|b)?(\d)$/.exec(n); const s = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 440 * Math.pow(2, (s + 12 * (+m[3] + 1) - 69) / 12); };
const CH = { C: ['C', 'E', 'G'], F: ['F', 'A', 'C'], G: ['G', 'B', 'D'], Am: ['A', 'C', 'E'], D: ['D', 'F#', 'A'] };

/* ---------- instruments ---------- */
function env(c, out, t, peak, decay, attack = 0.004) {
  const g = c.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(out); return g;
}
function osc(c, type, f, t, len, to) { const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.connect(to); o.start(t); o.stop(t + len + 0.05); return o; }
function marimba(c, out, t, f, v) {
  const d = Math.min(1.1, 180 / f + 0.25);
  osc(c, 'sine', f, t, d, env(c, out, t, v, d));
  osc(c, 'sine', f * 3.93, t, d * 0.3, env(c, out, t, v * 0.22, d * 0.3));
  osc(c, 'sine', f * 9.6, t, 0.05, env(c, out, t, v * 0.05, 0.05, 0.002));
}
function glock(c, out, t, f, v) {
  osc(c, 'sine', f, t, 1.6, env(c, out, t, v, 1.6, 0.002));
  osc(c, 'sine', f * 2.76, t, 0.6, env(c, out, t, v * 0.3, 0.6, 0.002));
  osc(c, 'sine', f * 5.4, t, 0.25, env(c, out, t, v * 0.12, 0.25, 0.002));
}
function bass(c, out, t, f, v, len) {
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(out);
  osc(c, 'triangle', f, t, len, env(c, lp, t, v, len, 0.01));
  osc(c, 'sine', f * 2, t, len * 0.5, env(c, lp, t, v * 0.3, len * 0.5, 0.01)); // so small speakers hear it
}
function boop(c, out, t, v) {               // soft "footstep" drum
  const o = c.createOscillator(); o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
  o.connect(env(c, out, t, v, 0.18, 0.003)); o.start(t); o.stop(t + 0.25);
}
let NOISE = null;
function shaker(c, out, t, v) {
  if (!NOISE || NOISE.sampleRate !== c.sampleRate) {
    NOISE = c.createBuffer(1, c.sampleRate * 0.1, c.sampleRate);
    const d = NOISE.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource(); s.buffer = NOISE;
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5500;
  s.connect(hp).connect(env(c, out, t, v, 0.045, 0.005)); s.start(t); s.stop(t + 0.1);
}

function sleighBells(c, out, t, v) {          // jingle: a few bright metallic noise bursts
  if (!NOISE || NOISE.sampleRate !== c.sampleRate) shaker(c, c.createGain(), 0, 0);
  [0, .018, .041].forEach((d, i) => {
    const s = c.createBufferSource(); s.buffer = NOISE;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 7000 + i * 900; bp.Q.value = 6;
    s.connect(bp).connect(env(c, out, t + d, v * (1 - i * .25), .09, .002)); s.start(t + d); s.stop(t + d + .12);
  });
}

/* ---------- songs: [bar, beat, note, beats] ---------- */
function mel(bars) { const out = []; bars.forEach((bar, b) => { let beat = 0; bar.forEach(([n, len]) => { if (n) out.push([b, beat, n, len]); beat += len; }); }); return out; }

/* Walking in: bouncy oom-pah march, 128 bpm */
const WALK = {
  bpm: 128, bars: 9, loop: false,
  chords: ['C', 'F', 'C', 'Am', 'F', 'C', 'G', 'C', 'C'],
  melody: mel([
    [['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1]],
    [['F5', 1], ['A5', 1], ['G5', 2]],
    [['E5', 1], ['G5', 1], ['C6', 1], ['G5', 1]],
    [['A5', 1], ['G5', 1], ['E5', 2]],
    [['F5', 1], ['F5', 1], ['A5', 1], ['F5', 1]],
    [['E5', 1], ['E5', 1], ['G5', 1], ['E5', 1]],
    [['D5', 1], ['E5', 1], ['F5', 1], ['D5', 1]],
    [['C5', 1], ['E5', .5], ['G5', .5], ['C6', 2]],
    [['C6', 3]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n, len]) => { const t = (bar * 4 + beat) * b; marimba(c, out, t, hz(n), .5); if (bar === 8) glock(c, out, t, hz(n), .25); });
    this.chords.forEach((ch, bar) => {
      const [r, third, fifth] = CH[ch], t0 = bar * 4 * b;
      if (bar === 8) { bass(c, out, t0, hz(r + '3'), .45, 1.5); [r + '4', third + '4', fifth + '4'].forEach(n => marimba(c, out, t0, hz(n), .18)); boop(c, out, t0, .5); return; }
      [0, 2].forEach(k => { bass(c, out, t0 + k * b, hz((k ? fifth : r) + '3'), .42, b * .9); boop(c, out, t0 + k * b, .45); });
      [1, 3].forEach(k => [third + '4', fifth + '4'].forEach(n => marimba(c, out, t0 + k * b, hz(n), .13)));
      for (let k = 0; k < 4; k++) shaker(c, out, t0 + (k + .5) * b, .07);
    });
  }
};

/* Outside in the snow: "Jingle Bells" chorus (J. L. Pierpont, 1857 — public domain), 132 bpm */
const SNOW = {
  bpm: 132, bars: 9, loop: false,
  chords: ['C', 'C', 'C', 'C', 'F', 'C', 'G', 'C', 'C'],
  melody: mel([
    [['E5', 1], ['E5', 1], ['E5', 2]],
    [['E5', 1], ['E5', 1], ['E5', 2]],
    [['E5', 1], ['G5', 1], ['C5', 1.5], ['D5', .5]],
    [['E5', 4]],
    [['F5', 1], ['F5', 1], ['F5', 1.5], ['F5', .5]],
    [['F5', 1], ['E5', 1], ['E5', 1], ['E5', .5], ['E5', .5]],
    [['G5', 1], ['G5', 1], ['F5', 1], ['D5', 1]],
    [['C5', 3], [null, 1]],
    [['C6', 2]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n]) => { const t = (bar * 4 + beat) * b; marimba(c, out, t, hz(n), .5); glock(c, out, t, hz(n) * 2, .1); });
    this.chords.forEach((ch, bar) => {
      const [r, third, fifth] = CH[ch], t0 = bar * 4 * b;
      if (bar === 8) { glock(c, out, t0, hz('C6'), .3); glock(c, out, t0, hz('E6'), .2); bass(c, out, t0, hz('C3'), .4, 1.6); sleighBells(c, out, t0, .5); return; }
      [0, 2].forEach(k => { bass(c, out, t0 + k * b, hz((k ? fifth : r) + '3'), .38, b * .9); boop(c, out, t0 + k * b, .3); });
      [1, 3].forEach(k => [third + '4', fifth + '4'].forEach(n => marimba(c, out, t0 + k * b, hz(n), .1)));
      for (let k = 0; k < 8; k++) sleighBells(c, out, t0 + k * b / 2, k % 2 ? .22 : .38);   // sleigh bells on every half beat
    });
  }
};

/* Menu: gentle music-box loop, 96 bpm, 16 bars */
const MENU = {
  bpm: 96, bars: 16, loop: true,
  chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'G', 'C', 'F', 'C', 'G', 'C', 'F', 'C', 'G', 'G'],
  melody: mel([
    [['E5', 1], ['G5', 1], ['C6', 2]],
    [['B5', 1], ['A5', 1], ['E5', 2]],
    [['F5', 1], ['A5', 1], ['C6', 1], ['A5', 1]],
    [['G5', 3], [null, 1]],
    [['E5', 1], ['G5', 1], ['E5', 1], ['C5', 1]],
    [['D5', 1], ['E5', 1], ['A4', 2]],
    [['F5', 1], ['E5', 1], ['D5', 1], ['B4', 1]],
    [['C5', 3], [null, 1]],
    [['A5', .5], ['G5', .5], ['F5', 1], ['A5', 2]],
    [['G5', .5], ['F5', .5], ['E5', 1], ['G5', 2]],
    [['F5', 1], ['E5', 1], ['D5', 1], ['G5', 1]],
    [['E5', 2], ['C5', 2]],
    [['A5', 1], ['C6', 1], ['A5', 1], ['F5', 1]],
    [['G5', 1], ['E5', 1], ['C5', 2]],
    [['D5', 1], ['F5', 1], ['B5', 1], ['D6', 1]],
    [['G5', 2], [null, 2]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n]) => { const t = (bar * 4 + beat) * b; marimba(c, out, t, hz(n), .42); if (beat === 0 && bar % 4 === 0) glock(c, out, t, hz(n) * 2, .12); });
    this.chords.forEach((ch, bar) => {
      const [r, third, fifth] = CH[ch], t0 = bar * 4 * b;
      bass(c, out, t0, hz(r + '3'), .3, b * 1.8); bass(c, out, t0 + 2 * b, hz(fifth + '3'), .22, b * 1.6);
      [r, third, fifth, third, r, third, fifth, third].forEach((n, k) => marimba(c, out, t0 + k * b / 2, hz(n + '4'), k % 2 ? .07 : .1));
      if (bar >= 8) [1, 3].forEach(k => shaker(c, out, t0 + (k + .5) * b, .045));
    });
  }
};

/* ---------- render a song into an AudioBuffer ---------- */
const RATE = 24000;
function render(song) {
  const b = 60 / song.bpm, len = song.bars * 4 * b, tail = 2.5;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const c = new OAC(1, Math.ceil((len + tail) * RATE), RATE);
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(c.destination);
  const dry = c.createGain(); dry.gain.value = .8; dry.connect(comp);
  const rev = c.createConvolver(), ir = c.createBuffer(1, RATE * 1.4, RATE), d = ir.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  rev.buffer = ir; const wet = c.createGain(); wet.gain.value = .18; rev.connect(wet).connect(comp);
  const bus = c.createGain(); bus.connect(dry); bus.connect(rev);
  song.play(c, bus, b);
  const done = buf => {
    const x = buf.getChannelData(0), L = Math.round(len * RATE);
    if (song.loop) for (let i = L; i < x.length; i++) x[i - L] += x[i];   // wrap the echo tail round → seamless loop
    let peak = 0; for (let i = 0; i < x.length; i++) peak = Math.max(peak, Math.abs(x[i]));
    if (peak > 0) { const k = .9 / peak; for (let i = 0; i < x.length; i++) x[i] *= k; }
    return { buf, loopEnd: L / RATE };
  };
  const p = c.startRendering();
  return p && p.then ? p.then(done) : new Promise(res => { c.oncomplete = e => res(done(e.renderedBuffer)); });
}

/* ---------- player ---------- */
const SONGS = { walk: WALK, menu: MENU, snow: SNOW };
window.Music = {
  on: true, getCtx: () => null, songs: {}, ready: null,
  src: null, g: null, cur: null, base: 0, ducked: false, undo: 0,
  prepare(name) {                            // walk-in first, then the menu tune
    if (!this.ready) {
      this.ready = {};
      let chain = Promise.resolve();
      Object.keys(SONGS).forEach(k => { chain = this.ready[k] = chain.then(() => render(SONGS[k])).then(r => { this.songs[k] = r; }).catch(() => {}); });
    }
    return name ? this.ready[name] : Promise.all(Object.values(this.ready));
  },
  level() { return this.base * (this.ducked ? 0.3 : 1); },
  length(name) { return this.songs[name] ? this.songs[name].loopEnd : 0; },
  play(name, vol) {
    if (!this.on) return;
    if (this.cur === name) return;
    this.stop(0.4);
    this.cur = name;
    const go = () => {
      const c = this.getCtx(), s0 = this.songs[name];
      if (this.cur !== name || !this.on || !c || !s0 || this.src) return;
      const s = c.createBufferSource(); s.buffer = s0.buf;
      if (SONGS[name].loop) { s.loop = true; s.loopStart = 0; s.loopEnd = s0.loopEnd; }
      const g = c.createGain(); s.connect(g).connect(c.destination);
      this.base = vol; const t = c.currentTime;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(this.level(), t + 0.25);
      s.onended = () => { if (this.src === s) { this.src = null; this.g = null; this.cur = null; } };
      s.start(); this.src = s; this.g = g;
    };
    this.songs[name] ? go() : this.prepare(name).then(go);
  },
  duck(on) {                                 // quieter while Pip or Fifi talk
    clearTimeout(this.undo);
    const apply = () => {
      this.ducked = on; const c = this.getCtx(); if (!this.g || !c) return;
      const t = c.currentTime, g = this.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.setTargetAtTime(this.level(), t, 0.12);
    };
    if (on) apply(); else this.undo = setTimeout(apply, 700);
  },
  stop(sec = 0.8) {
    this.cur = null;
    const s = this.src, g = this.g, c = this.getCtx(); this.src = null; this.g = null;
    if (!s || !c) return;
    const t = c.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + sec);
    try { s.stop(t + sec + 0.05); } catch (e) {}
  }
};
})();
