/* =====================================================================
   PIP & FIFI — music. Original little tunes, synthesised in the browser
   (marimba, music box, soft bass, shaker). Nothing to download.
   Rendered once while the start screen is showing, then cached in memory.
   ===================================================================== */
(() => {
'use strict';
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const hz = n => { const m = /^([A-G])(#|b)?(\d)$/.exec(n); const s = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 440 * Math.pow(2, (s + 12 * (+m[3] + 1) - 69) / 12); };
const CH = { A: ['A', 'C#', 'E'], Dm: ['D', 'F', 'A'], Bb: ['A#', 'D', 'F'], Em: ['E', 'G', 'B'], C: ['C', 'E', 'G'], F: ['F', 'A', 'C'], G: ['G', 'B', 'D'], Am: ['A', 'C', 'E'], D: ['D', 'F#', 'A'] };

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
const BPB = s => s.bpb || 4;      // beats per bar (3 for a waltz)

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

/* Summer sunshine: an original sunny calypso tune (steel drum feel), 120 bpm */
function pan(c, out, t, f, v) {                   // steel-drum-ish
  osc(c, 'sine', f, t, .7, env(c, out, t, v, .7, .003));
  osc(c, 'sine', f * 2, t, .35, env(c, out, t, v * .45, .35, .003));
  osc(c, 'sine', f * 3.01, t, .18, env(c, out, t, v * .2, .18, .002));
}
const SUN = {
  bpm: 120, bars: 9, loop: false,
  chords: ['C', 'G', 'C', 'G', 'F', 'C', 'G', 'C', 'C'],
  melody: mel([
    [['G5', .5], ['E5', .5], ['G5', 1], ['A5', .5], ['G5', .5], ['E5', 1]],
    [['F5', .5], ['D5', .5], ['F5', 1], ['G5', 2]],
    [['E5', .5], ['C5', .5], ['E5', 1], ['F5', .5], ['E5', .5], ['C5', 1]],
    [['D5', 1], ['B4', 1], ['G4', 2]],
    [['A5', .5], ['A5', .5], ['C6', 1], ['A5', .5], ['G5', .5], ['F5', 1]],
    [['G5', .5], ['G5', .5], ['E5', 1], ['C5', 2]],
    [['D5', .5], ['E5', .5], ['F5', .5], ['G5', .5], ['A5', 1], ['B5', 1]],
    [['C6', 2], ['G5', 1], ['E5', 1]],
    [['C6', 3]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n]) => pan(c, out, (bar * 4 + beat) * b, hz(n), .45));
    this.chords.forEach((ch, bar) => {
      const [r, third, fifth] = CH[ch], t0 = bar * 4 * b;
      if (bar === 8) { bass(c, out, t0, hz(r + '3'), .4, 1.5); [r + '4', third + '4', fifth + '4'].forEach(n => pan(c, out, t0, hz(n), .15)); return; }
      [0, 1.5, 2, 3.5].forEach((k, i) => bass(c, out, t0 + k * b, hz((i % 2 ? fifth : r) + '3'), .34, b * .7));   // calypso bass
      [.5, 1.5, 2.5, 3.5].forEach(k => [third + '4', fifth + '4'].forEach(n => marimba(c, out, t0 + k * b, hz(n), .09)));
      for (let k = 0; k < 8; k++) shaker(c, out, t0 + k * b / 2, k % 2 ? .05 : .08);
      boop(c, out, t0, .3); boop(c, out, t0 + 2 * b, .25);
    });
  }
};

/* Train ride: an ORIGINAL choo-choo tune (placeholder until Kamil's own recording of the song), 138 bpm, loops */
function chuff(c, out, t, v) {                     // steam "ch" — low-passed noise
  if (!NOISE || NOISE.sampleRate !== c.sampleRate) shaker(c, c.createGain(), 0, 0);
  const s = c.createBufferSource(); s.buffer = NOISE;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = .8;
  s.connect(bp).connect(env(c, out, t, v, .09, .004)); s.start(t); s.stop(t + .12);
}
function whistle(c, out, t, v) {                   // toot toot!
  [0, .42].forEach(d => {
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(880, t + d); o.frequency.linearRampToValueAtTime(940, t + d + .08);
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = 1108; 
    const g = env(c, out, t + d, v, .32, .03); o.connect(g); o2.connect(g); o.start(t + d); o2.start(t + d); o.stop(t + d + .4); o2.stop(t + d + .4);
  });
}
const TRAIN = {
  bpm: 138, bars: 8, loop: true,
  chords: ['C', 'C', 'F', 'C', 'C', 'G', 'F', 'C'],
  melody: mel([
    [['C5', 1], ['E5', 1], ['G5', 1], ['G5', 1]],
    [['A5', .5], ['G5', .5], ['E5', 1], ['C5', 2]],
    [['F5', 1], ['A5', 1], ['C6', 1], ['A5', 1]],
    [['G5', 2], [null, 2]],
    [['E5', 1], ['G5', 1], ['C6', 1], ['B5', 1]],
    [['A5', .5], ['B5', .5], ['D6', 1], ['G5', 2]],
    [['F5', 1], ['E5', 1], ['D5', 1], ['B4', 1]],
    [['C5', 2], [null, 2]]
  ]),
  play(c, out, b) {
    whistle(c, out, 0, .22);
    this.melody.forEach(([bar, beat, n]) => { const t = (bar * 4 + beat) * b; marimba(c, out, t, hz(n), .45); });
    this.chords.forEach((ch, bar) => {
      const [r, third, fifth] = CH[ch], t0 = bar * 4 * b;
      [0, 2].forEach(k => bass(c, out, t0 + k * b, hz((k ? fifth : r) + '3'), .36, b * .9));
      [1, 3].forEach(k => [third + '4', fifth + '4'].forEach(n => marimba(c, out, t0 + k * b, hz(n), .1)));
      for (let k = 0; k < 8; k++) chuff(c, out, t0 + k * b / 2, k % 2 ? .18 : .32);        // ch-ch ch-ch
      if (bar === 4) whistle(c, out, t0, .16);
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


/* Forest run: bouncy skipping tune with birds tweeting, 116 bpm, 16 bars, loops (original) */
function bird(c, out, t, v) {                       // "tweet-tweet": two quick rising whistles
  [0, .13].forEach((d, i) => {
    const o = c.createOscillator(); o.type = 'sine';
    const f = 2500 + Math.random() * 500 + i * 250;
    o.frequency.setValueAtTime(f, t + d); o.frequency.exponentialRampToValueAtTime(f * 1.45, t + d + .07);
    o.connect(env(c, out, t + d, v, .08, .006)); o.start(t + d); o.stop(t + d + .1);
  });
}
function woodblock(c, out, t, v) {
  const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(1250, t); o.frequency.exponentialRampToValueAtTime(900, t + .04);
  o.connect(env(c, out, t, v, .06, .001)); o.start(t); o.stop(t + .08);
}
const FOREST = {
  bpm: 116, bars: 16, loop: true,
  chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'C', 'D', 'C', 'G', 'Am', 'D', 'G', 'C', 'D', 'G'],
  melody: mel([
    [['B4', .5], ['D5', .5], ['G5', 1], ['D5', 1], ['B4', 1]],
    [['E5', 1], ['G5', 1], ['B5', 2]],
    [['A5', .5], ['G5', .5], ['E5', 1], ['C5', 1], ['E5', 1]],
    [['D5', 2], ['F#5', 1], ['A5', 1]],
    [['B5', 1], ['A5', .5], ['G5', .5], ['D5', 1], ['G5', 1]],
    [['E5', .5], ['F#5', .5], ['G5', 1], ['B4', 2]],
    [['C5', 1], ['E5', 1], ['A5', 1], ['G5', 1]],
    [['F#5', 2], ['D5', 1], [null, 1]],
    [['E5', 1], ['G5', 1], ['C6', 1], ['B5', 1]],
    [['D6', 1], ['B5', 1], ['G5', 2]],
    [['A5', .5], ['B5', .5], ['C6', 1], ['A5', 1], ['E5', 1]],
    [['F#5', 1], ['A5', 1], ['D6', 2]],
    [['B5', .5], ['A5', .5], ['G5', 1], ['B5', 1], ['D6', 1]],
    [['E6', 1], ['C6', 1], ['A5', 2]],
    [['D6', .5], ['C6', .5], ['B5', .5], ['A5', .5], ['F#5', 1], ['A5', 1]],
    [['G5', 3], [null, 1]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n]) => { const t = (bar * 4 + beat) * b; marimba(c, out, t, hz(n), .4); if (beat === 0 && bar % 2 === 0) glock(c, out, t, hz(n) * 2, .1); });
    this.chords.forEach((ch, bar) => {
      const [r, third, fifth] = CH[ch], t0 = bar * 4 * b;
      bass(c, out, t0, hz(r + '3'), .34, b * .8); bass(c, out, t0 + b, hz(fifth + '2'), .26, b * .7);
      bass(c, out, t0 + 2 * b, hz(r + '3'), .3, b * .8); bass(c, out, t0 + 3 * b, hz(fifth + '2'), .24, b * .7);
      [0, 1, 2, 3].forEach(k => { const t = t0 + (k + .5) * b; [r, third, fifth].forEach(n => marimba(c, out, t, hz(n + '4'), .045)); shaker(c, out, t, .05); });
      [0, 2].forEach(k => boop(c, out, t0 + k * b, .3));
      if (bar % 2 === 1) woodblock(c, out, t0 + 3.5 * b, .12);
      if (bar % 4 === 1) bird(c, out, t0 + 2.6 * b, .05);
      if (bar % 4 === 3) bird(c, out, t0 + .7 * b, .04);
    });
  }
};


/* ---------- puzzle music: three calm loops, one per picture (original tunes) ---------- */
/* 🌲 forest picture: a music-box waltz in F, birds now and then */
const PZ_FOREST = {
  bpm: 84, bpb: 3, bars: 16, loop: true,
  chords: ['F', 'C', 'Dm', 'C', 'Bb', 'F', 'C', 'C', 'F', 'C', 'Dm', 'Bb', 'F', 'C', 'C', 'F'],
  melody: mel([
    [['A5', 1], ['C6', 1], ['A5', 1]], [['G5', 2], ['E5', 1]], [['F5', 1], ['A5', 1], ['D6', 1]], [['C6', 3]],
    [['D6', 1], ['C6', 1], ['A#5', 1]], [['A5', 2], ['F5', 1]], [['G5', 1], ['A5', 1], ['G5', 1]], [['E5', 3]],
    [['A5', 1], ['C6', 1], ['F6', 1]], [['E6', 2], ['C6', 1]], [['D6', 1], ['F6', 1], ['D6', 1]], [['A#5', 3]],
    [['A5', 1], ['G5', 1], ['F5', 1]], [['G5', 1], ['A5', 1], ['E5', 1]], [['G5', 2], ['E5', 1]], [['F5', 3]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n]) => { const t = (bar * 3 + beat) * b; glock(c, out, t, hz(n), .2); marimba(c, out, t, hz(n) / 2, .07); });
    this.chords.forEach((ch, bar) => { const [r, third, fifth] = CH[ch], t0 = bar * 3 * b;
      bass(c, out, t0, hz(r + '3'), .22, b * 1.6);
      [1, 2].forEach(k => [third, fifth].forEach(n => marimba(c, out, t0 + k * b, hz(n + '4'), .05)));
      if (bar % 4 === 2) bird(c, out, t0 + 1.5 * b, .035); });
  }
};
/* 🛝 playground picture: a bouncy, skipping tune in C */
const PZ_PLAY = {
  bpm: 112, bars: 16, loop: true,
  chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C', 'F', 'C', 'G', 'C', 'F', 'G', 'C', 'C'],
  melody: mel([
    [['E5', .5], ['G5', .5], ['C6', 1], ['G5', 1], ['E5', 1]], [['D5', .5], ['G5', .5], ['B5', 1], ['G5', 2]],
    [['C6', .5], ['B5', .5], ['A5', 1], ['E5', 1], ['A5', 1]], [['A5', 1], ['G5', 1], ['F5', 2]],
    [['E5', .5], ['G5', .5], ['C6', 1], ['E6', 1], ['C6', 1]], [['D6', 1], ['B5', 1], ['G5', 2]],
    [['A5', .5], ['C6', .5], ['A5', 1], ['F5', 1], ['A5', 1]], [['G5', 3], [null, 1]],
    [['F5', .5], ['A5', .5], ['C6', 1], ['A5', 1], ['F5', 1]], [['E5', .5], ['G5', .5], ['C6', 1], ['G5', 2]],
    [['D5', .5], ['G5', .5], ['B5', 1], ['D6', 1], ['B5', 1]], [['C6', 2], ['G5', 2]],
    [['A5', 1], ['C6', 1], ['F6', 1], ['C6', 1]], [['B5', 1], ['D6', 1], ['G6', 1], ['D6', 1]],
    [['E6', 1], ['D6', .5], ['C6', .5], ['G5', 1], ['E5', 1]], [['C6', 3], [null, 1]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n]) => { const t = (bar * 4 + beat) * b; marimba(c, out, t, hz(n), .34); });
    this.chords.forEach((ch, bar) => { const [r, third, fifth] = CH[ch], t0 = bar * 4 * b;
      [0, 1, 2, 3].forEach(k => { bass(c, out, t0 + k * b, hz((k % 2 ? fifth + '2' : r + '3')), .24, b * .6);
        [third, fifth].forEach(n => marimba(c, out, t0 + (k + .5) * b, hz(n + '4'), .04)); shaker(c, out, t0 + (k + .5) * b, .04); });
      [0, 2].forEach(k => boop(c, out, t0 + k * b, .22)); if (bar % 2) woodblock(c, out, t0 + 3.5 * b, .1); });
  }
};
/* 🏫 nursery picture: a gentle lullaby in G, glockenspiel over soft rolling marimba */
const PZ_NURSERY = {
  bpm: 72, bars: 16, loop: true,
  chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'Am', 'D', 'C', 'G', 'C', 'D', 'G', 'C', 'D', 'G'],
  melody: mel([
    [['B5', 2], ['D6', 2]], [['E6', 1], ['D6', 1], ['B5', 2]], [['C6', 2], ['E6', 1], ['C6', 1]], [['A5', 4]],
    [['B5', 1], ['C6', 1], ['D6', 2]], [['G6', 1], ['E6', 1], ['B5', 2]], [['C6', 1], ['B5', 1], ['A5', 2]], [['F#5', 2], ['A5', 2]],
    [['E6', 2], ['C6', 2]], [['D6', 2], ['B5', 2]], [['C6', 1], ['E6', 1], ['G6', 1], ['E6', 1]], [['D6', 4]],
    [['B5', 1], ['A5', 1], ['G5', 2]], [['E5', 1], ['G5', 1], ['C6', 2]], [['A5', 1], ['F#5', 1], ['D6', 2]], [['G5', 4]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n]) => { const t = (bar * 4 + beat) * b; glock(c, out, t, hz(n), .22); });
    this.chords.forEach((ch, bar) => { const [r, third, fifth] = CH[ch], t0 = bar * 4 * b;
      bass(c, out, t0, hz(r + '3'), .2, b * 3);
      [r, third, fifth, third, r, third, fifth, third].forEach((n, k) => marimba(c, out, t0 + k * b / 2, hz(n + (k === 4 ? '5' : '4')), .06)); });
  }
};

/* 🍲 kitchen picture: a cosy little polka in G — oom-pah bass, marimba tune, glockenspiel sparkles */
const PZ_KITCHEN = {
  bpm: 104, bars: 16, loop: true,
  chords: ['G', 'D', 'D', 'G', 'G', 'C', 'D', 'G', 'C', 'G', 'D', 'G', 'C', 'G', 'D', 'G'],
  melody: mel([
    [['D5', .5], ['G5', .5], ['B5', .5], ['G5', .5], ['D5', 1], ['G5', 1]], [['F#5', .5], ['A5', .5], ['D6', 1], ['A5', 2]],
    [['F#5', .5], ['A5', .5], ['C6', .5], ['A5', .5], ['F#5', 1], ['A5', 1]], [['G5', 1], ['B5', 1], ['G5', 2]],
    [['B5', .5], ['C6', .5], ['D6', 1], ['B5', 1], ['G5', 1]], [['C6', .5], ['D6', .5], ['E6', 1], ['C6', 1], ['G5', 1]],
    [['A5', .5], ['B5', .5], ['C6', .5], ['B5', .5], ['A5', 1], ['F#5', 1]], [['G5', 3], [null, 1]],
    [['E6', 1], ['C6', 1], ['G5', 1], ['C6', 1]], [['D6', 1], ['B5', 1], ['G5', 2]],
    [['A5', .5], ['B5', .5], ['C6', 1], ['A5', 1], ['F#5', 1]], [['G5', 1], ['D5', 1], ['G5', 2]],
    [['E5', .5], ['G5', .5], ['C6', 1], ['E6', 1], ['C6', 1]], [['D6', .5], ['C6', .5], ['B5', 1], ['G5', 1], ['B5', 1]],
    [['A5', 1], ['D6', 1], ['C6', .5], ['A5', .5], ['F#5', 1]], [['G5', 3], [null, 1]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n]) => { const t = (bar * 4 + beat) * b; marimba(c, out, t, hz(n), .34); if (beat === 0) glock(c, out, t, hz(n) * 2, .07); });
    this.chords.forEach((ch, bar) => { const [r, third, fifth] = CH[ch], t0 = bar * 4 * b;
      [0, 1, 2, 3].forEach(k => { bass(c, out, t0 + k * b, hz(k % 2 ? fifth + '2' : r + '3'), .26, b * .45);           // oom...
        [r, third, fifth].forEach(n => marimba(c, out, t0 + (k + .5) * b, hz(n + '4'), .045)); });                  // ...pah
      [0, 2].forEach(k => boop(c, out, t0 + k * b, .2)); shaker(c, out, t0 + 1.5 * b, .04); shaker(c, out, t0 + 3.5 * b, .04); });
  }
};

/* 🎠 friends at the playground: a swinging see-saw tune in D, lilting 6/8 feel (3 quick beats per half bar) */
const PZ_FRIENDS = {
  bpm: 150, bpb: 6, bars: 16, loop: true,
  chords: ['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D', 'G', 'D', 'G', 'A', 'D', 'G', 'A', 'D'],
  melody: mel([
    [['F#5', 2], ['A5', 1], ['D6', 2], ['A5', 1]], [['B5', 2], ['G5', 1], ['B5', 3]],
    [['A5', 2], ['F#5', 1], ['A5', 2], ['D6', 1]], [['C#6', 3], ['A5', 3]],
    [['F#5', 2], ['A5', 1], ['D6', 2], ['F#6', 1]], [['E6', 2], ['D6', 1], ['B5', 3]],
    [['C#6', 2], ['B5', 1], ['A5', 2], ['G5', 1]], [['F#5', 3], ['D5', 3]],
    [['G5', 2], ['B5', 1], ['D6', 2], ['B5', 1]], [['A5', 2], ['F#5', 1], ['D5', 3]],
    [['G5', 2], ['A5', 1], ['B5', 2], ['D6', 1]], [['C#6', 2], ['E6', 1], ['A5', 3]],
    [['D6', 2], ['F#6', 1], ['A6', 2], ['F#6', 1]], [['G6', 2], ['E6', 1], ['B5', 3]],
    [['A5', 2], ['C#6', 1], ['E6', 2], ['C#6', 1]], [['D6', 6]]
  ]),
  play(c, out, b) {
    this.melody.forEach(([bar, beat, n]) => { const t = (bar * 6 + beat) * b; marimba(c, out, t, hz(n), .32); if (beat === 0) glock(c, out, t, hz(n) * 2, .08); });
    this.chords.forEach((ch, bar) => { const [r, third, fifth] = CH[ch], t0 = bar * 6 * b;
      [0, 3].forEach(k => { bass(c, out, t0 + k * b, hz((k ? fifth + '2' : r + '3')), .26, b * 1.6); boop(c, out, t0 + k * b, .18);
        [1, 2].forEach(q => marimba(c, out, t0 + (k + q) * b, hz((q === 1 ? third : fifth) + '4'), .045)); });
      shaker(c, out, t0 + 2 * b, .035); shaker(c, out, t0 + 5 * b, .035); if (bar % 4 === 3) bird(c, out, t0 + 4 * b, .03); });
  }
};

/* ---------- render a song into an AudioBuffer ---------- */
const RATE = 24000;
function render(song) {
  const b = 60 / song.bpm, len = song.bars * BPB(song) * b, tail = 2.5;
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

/* ---------- ready-made tune files ---------- */
function decodeFile(ab, m) {
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  return new Promise(res => {
    try {
      const c = new OAC(1, RATE, RATE);
      const ok = buf => {
        if (!m.loop) return res({ buf, loopEnd: m.body, loopStart: 0 });
        // the file is: ½ s of the loop's end, the loop, ½ s of its start — so even if the decoder
        // adds a few ms of silence at the front, the loop points still land inside real music
        const extra = Math.max(0, Math.min(buf.duration - (m.body + 2 * m.pre), 2112 / RATE));
        res({ buf, loopStart: m.pre + extra, loopEnd: m.pre + m.body + extra });
      };
      const p = c.decodeAudioData(ab.slice(0), ok, () => res(null));
      if (p && p.catch) p.catch(() => res(null));
    } catch (e) { res(null); }
  });
}

/* ---------- player ---------- */
const SONGS = { walk: WALK, menu: MENU, snow: SNOW, sun: SUN, train: TRAIN, forest: FOREST, pzForest: PZ_FOREST, pzPlay: PZ_PLAY, pzNursery: PZ_NURSERY, pzKitchen: PZ_KITCHEN, pzFriends: PZ_FRIENDS };
window.Music = {
  on: true, getCtx: () => null, songs: {}, ready: null,
  src: null, g: null, cur: null, base: 0, ducked: false, undo: 0,
  /* The tunes come as small ready-made files (music/*.m4a, made from the recipes above), so the iPad
     only has to play them — composing them live was too heavy for older iPads. prepare() downloads
     every file (kept offline by the service worker); a tune is decoded only when it is first played.
     If a file is missing, the tune is composed live from its recipe as before. */
  prepare(name) {
    if (!this.index) this.index = fetch('music/index.json').then(r => r.ok ? r.json() : null).catch(() => null);
    if (!this.raw) {
      this.raw = {};
      this.allRaw = this.index.then(idx => Promise.all(Object.keys(SONGS).map(k => this.raw[k] = (idx && idx[k]
        ? fetch('music/' + k + '.m4a').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null) : Promise.resolve(null)))));
    }
    if (!name) return this.allRaw;
    this.ready = this.ready || {};
    if (!this.ready[name]) this.ready[name] = this.allRaw.then(() => this.raw[name]).then(ab => this.index.then(idx => ab ? decodeFile(ab, idx[name]) : null))
      .then(r => r || render(SONGS[name])).then(r => { this.songs[name] = r; }).catch(() => {});
    return this.ready[name];
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
      if (SONGS[name].loop) { s.loop = true; s.loopStart = s0.loopStart || 0; s.loopEnd = s0.loopEnd; }
      const g = c.createGain(); s.connect(g).connect(c.destination);
      this.base = vol; const t = c.currentTime;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(this.level(), t + 0.25);
      s.onended = () => { if (this.src === s) { this.src = null; this.g = null; this.cur = null; } };
      s.start(0, s0.loopStart || 0); this.src = s; this.g = g;
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
