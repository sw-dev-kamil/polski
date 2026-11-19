/* =====================================================================
   PIP & FIFI — a bilingual (English → Polish) game for little ones
   ===================================================================== */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const screen = $('#screen');

/* ---------- saved state ---------- */
const KEY = 'pipfifi.v1';
let S = { stickers: [], voice: 'cartoon', excite: true, listen: true, sens: 'normal', kid: null, music: true, plOnly: false, recVoices: true, checkWords: true };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const KID = Object.assign({}, window.KID, S.kid || {});
const M = window.Music || { prepare() {}, play() {}, stop() {}, duck() {} };
M.on = S.music !== false; M.getCtx = () => AUDIO;
M.prepare && M.prepare();                       // render the tunes while the start screen is showing

/* ---------- helpers ---------- */
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const wait = ms => new Promise(r => setTimeout(r, ms));
const kidify = (s, lang) => s.replace(/\{kid\}/g, lang === 'pl' ? KID.pl : KID.en);
const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M8.6 3.6a1.5 1.5 0 0 1 2.1 0l7.3 7.3a1.5 1.5 0 0 1 0 2.2l-7.3 7.3a1.5 1.5 0 1 1-2.1-2.1L14.8 12 8.6 5.7a1.5 1.5 0 0 1 0-2.1z"/></svg>'
};

function praiseEN() {
  if (Math.random() < 0.35) return pick([`Wow! Brilliant, ${KID.en}!`, `Yay! Well done, ${KID.en}!`, `Woohoo! Go ${KID.en}!`]);
  return pick(['Woohoo!', 'Yay! Well done!', 'Wow! Brilliant!', 'Hooray!', 'Amazing!', 'You did it! Yippee!']);
}
function praisePL() {
  if (Math.random() < 0.35) return pick([`Super! Brawo, ${KID.plCall}!`, `Hura! Świetnie, ${KID.plCall}!`, `Wow! Pięknie, ${KID.plCall}!`]);
  return pick(['Brawo!', 'Hura! Super!', 'Wow! Świetnie!', 'Ojej, pięknie!', 'Juhu! Brawo!', 'Tak jest! Super!']);
}

/* =====================================================================
   VOICES — built-in iPad voices, pitched up to sound like cartoon friends
   ===================================================================== */
const hasTTS = 'speechSynthesis' in window;
const VOICE = { en: null, pl: null };
function pickVoices() {
  if (!hasTTS) return;
  const vs = speechSynthesis.getVoices();
  const en = vs.filter(v => /^en/i.test(v.lang));
  /* Fifi is a girl: female voices only. Male iPad voices are skipped. */
  const fem = /martha|kate|serena|stephanie|libby|sonia|maisie|flo|sandy|shelley|grandma|samantha|karen|moira|tessa|catherine|allison|ava|susan|zoe|nicky|siri.*(voice 2|voice 4)|female/i;
  const male = /daniel|arthur|oliver|eddy|fred|alex|aaron|gordon|rishi|tom|evan|nathan|reed|rocko|grandpa|albert|bad news|bahh|boing|bubbles|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox|ralph|junior|male/i;
  const good = /enhanced|premium|ulepsz/i, gb = v => /en.GB/i.test(v.lang);
  const girl = v => fem.test(v.name) && !/grandpa/i.test(v.name), notBoy = v => !male.test(v.name) || /female/i.test(v.name);
  VOICE.en = (S.voiceEn && en.find(v => v.name === S.voiceEn))
    || en.find(v => gb(v) && girl(v) && good.test(v.name)) || en.find(v => gb(v) && girl(v))
    || en.find(v => girl(v) && good.test(v.name)) || en.find(v => girl(v))
    || en.find(v => gb(v) && notBoy(v)) || en.find(notBoy) || en[0] || null;
  const pl = vs.filter(v => /^pl/i.test(v.lang));
  VOICE.pl = (S.voicePl && pl.find(v => v.name === S.voicePl))
    || pl.find(v => /enhanced|premium|ulepsz/i.test(v.name)) || pl.find(v => /zosia/i.test(v.name)) || pl[0] || null;
}
if (hasTTS) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
const STYLE = {
  natural: { fifi: 1.1, pip: 1.0 },
  cartoon: { fifi: 1.45, pip: 1.25 },
  extra:   { fifi: 1.7, pip: 1.5 }
};

let tk = 0; // changes whenever the screen changes → stops old speech sequences
let mouthTimer = null;
function talk(who, on) {
  clearInterval(mouthTimer);
  $$('.char').forEach(c => c.classList.remove('talking', 'open'));
  if (!on) return;
  const els = $$(`.char[data-who="${who}"]`);
  els.forEach(c => c.classList.add('talking'));
  mouthTimer = setInterval(() => els.forEach(c => c.classList.toggle('open', Math.random() > 0.3)), 95);
}
/* Excitement: each piece of a sentence gets its own pitch and speed.
   "Wow!" / "Brawo!" → high and bouncy, questions rise, normal bits stay calm. */
function pieces(text) { return (text.match(/[^!?.…]+[!?.…]*/g) || [text]).map(x => x.trim()).filter(Boolean); }
function prosody(piece, i, n, who, lang) {
  const base = (STYLE[S.voice] || STYLE.cartoon)[who];
  let pitch = base, rate = lang === 'pl' ? 0.88 : 0.98;
  if (S.excite !== false) {
    const excl = /!$/.test(piece), q = /\?$/.test(piece), short = piece.split(/\s+/).length <= 2;
    if (excl) { pitch += 0.22; rate += 0.06; }
    if (excl && short) { pitch += 0.12; rate -= 0.06; }   // stretch little cheers: "Yaaay!"
    if (q) pitch += 0.14;
    if (i === 0 && n > 1 && excl) pitch += 0.05;
    pitch += (Math.random() - 0.5) * 0.08;                   // tiny variation so it never sounds robotic-identical
  } else { rate = lang === 'pl' ? 0.8 : 0.9; }
  return { pitch: Math.max(0.5, Math.min(2, pitch)), rate };
}
/* ---------- recorded voices: Maisie (Fifi, English) + Zofia (Pip, Polish), made on Kamil's Mac ----------
   Every sentence is split into pieces ("Gdzie jest czapka?" / "Załóż czapkę!"); each piece = audio/<id>.mp3.
   If any piece of a line has no file yet, the whole line uses the iPad voice (no mixing) and the
   missing pieces are noted for the next top-up (grown-up panel). */
const lineId = (lang, text) => { let h = 0x811c9dc5; const t = lang + '|' + text; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const REC = { have: new Set(), raw: new Map(), buf: new Map(), playing: [], stop: null, total: 0, done: 0, finished: false };
const MISS_KEY = 'pipfifi.missing';
function noteMissing(lang, list) {
  try { const m = JSON.parse(localStorage.getItem(MISS_KEY) || '{}'); list.forEach(t => { m[lineId(lang, t)] = [lang, t]; }); localStorage.setItem(MISS_KEY, JSON.stringify(m)); } catch (e) {}
}
async function recPreload() {                // during the start screen: fetch every file (the service worker keeps them offline)
  try { REC.have = new Set(await (await fetch('audio/index.json', { cache: 'no-cache' })).json()); } catch (e) { REC.finished = true; return; }
  const ids = [...REC.have]; let k = 0; REC.total = ids.length;
  const worker = async () => { while (k < ids.length) { const id = ids[k++]; if (!REC.raw.has(id)) {
    try { const r = await fetch('audio/' + id + '.mp3'); if (r.ok) REC.raw.set(id, await r.arrayBuffer()); } catch (e) {} } REC.done++; } };
  await Promise.all([worker(), worker(), worker(), worker()]);
  REC.finished = true;
}
function recBuf(id) {
  if (REC.buf.has(id)) return Promise.resolve(REC.buf.get(id));
  const go = raw => new Promise(res => { try { AUDIO.decodeAudioData(raw.slice(0), b => { REC.buf.set(id, b); res(b); }, () => res(null)); } catch (e) { res(null); } });
  if (REC.raw.has(id)) return go(REC.raw.get(id));
  return fetch('audio/' + id + '.mp3').then(r => r.ok ? r.arrayBuffer() : null).then(raw => raw ? (REC.raw.set(id, raw), go(raw)) : null).catch(() => null);
}
function recStop() { REC.playing.forEach(s => { try { s.stop(); } catch (e) {} }); REC.playing = []; if (REC.stop) { const f = REC.stop; REC.stop = null; f(); } }
async function recPlay(ids) {                // resolves true when finished (or stopped), false if it couldn't play
  if (!AUDIO) return false;
  const bufs = await Promise.all(ids.map(recBuf));
  if (bufs.some(b => !b)) return false;
  return new Promise(res => {
    let t = AUDIO.currentTime + 0.02;
    bufs.forEach((b, i) => { const s = AUDIO.createBufferSource(); s.buffer = b; s.connect(AUDIO.destination); s.start(t); REC.playing.push(s); t += b.duration + (i < bufs.length - 1 ? 0.15 : 0); });
    const timer = setTimeout(() => { REC.stop = null; REC.playing = []; res(true); }, (t - AUDIO.currentTime) * 1000 + 30);
    REC.stop = () => { clearTimeout(timer); res(true); };
  });
}

function say(who, lang, text) {
  text = kidify(text, lang);
  const parts = pieces(text), ids = parts.map(p => lineId(lang, p));
  if (S.recVoices !== false && AUDIO && REC.have.size) {
    const missing = parts.filter((p, i) => !REC.have.has(ids[i]));
    if (!missing.length) return new Promise(async res => {
      recStop(); M.duck(true); talk(who, true); speakingUntil = Infinity;
      const ok = await recPlay(ids);
      if (!ok) { M.duck(false); talk(who, false); return say2(who, lang, text).then(res); }
      M.duck(false); talk(who, false); speakingUntil = performance.now() + 400; res();
    });
    noteMissing(lang, missing);
  }
  return say2(who, lang, text);
}
function say2(who, lang, text) {               // the iPad's own voice
  return new Promise(res => {
    if (!hasTTS) { talk(who, true); speakingUntil = Infinity; setTimeout(() => { talk(who, false); speakingUntil = performance.now() + 400; res(); }, 400 + text.length * 55); return; }
    let done = false;
    const fin = () => { if (done) return; done = true; M.duck(false); talk(who, false); speakingUntil = performance.now() + 400; res(); };
    const parts = pieces(text);
    M.duck(true);
    talk(who, true);
    speakingUntil = Infinity;
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      u.lang = lang === 'pl' ? 'pl-PL' : 'en-GB';
      const v = VOICE[lang]; if (v) u.voice = v;
      const pr = prosody(p, i, parts.length, who, lang);
      u.pitch = pr.pitch; u.rate = pr.rate;
      u.onstart = () => talk(who, true);
      u.onerror = fin;
      if (i === parts.length - 1) u.onend = fin;
      speechSynthesis.speak(u);
    });
    setTimeout(fin, 3000 + text.length * 140);
  });
}
async function seq(lines, my = tk) {
  for (const [who, lang, text] of lines) {
    if (my !== tk) return false;
    await say(who, lang, text);
    if (my !== tk) return false;
    await wait(220);
  }
  return my === tk;
}
function hush() { tk++; if (hasTTS) speechSynthesis.cancel(); recStop(); if (typeof Recog !== 'undefined') Recog.stop(); talk(null, false); speakingUntil = performance.now() + 300; }
function cheer(who) {
  $$(who ? `.char[data-who="${who}"]` : '.char').forEach(c => { c.classList.remove('cheer'); void c.offsetWidth; c.classList.add('cheer'); setTimeout(() => c.classList.remove('cheer'), 1200); });
}
function waveAll() { $$('.char').forEach(c => { c.classList.add('waving'); setTimeout(() => c.classList.remove('waving'), 2100); }); }

/* =====================================================================
   LISTENING — detects that she spoke (no judging at this age).
   The mic stays open for the whole phrase card. While Pip or Fifi talk,
   listening pauses, so their voices never count as hers.
   ===================================================================== */
let speakingUntil = 0;              // no listening before this time (characters talking)
let AUDIO = null;                   // one shared AudioContext, unlocked by a tap
function unlockAudio() {
  try {
    if (!AUDIO) AUDIO = new (window.AudioContext || window.webkitAudioContext)();
    if (AUDIO.state === 'suspended') AUDIO.resume();
  } catch (e) {}
}
const Mic = {
  stream: null, an: null, buf: null, raf: 0, floor: 0.01,
  opening: null,
  open() {                                   // one request at a time (the ▶ tap and the welcome both ask)
    if (this.an && this.stream && this.stream.getAudioTracks().some(t => t.readyState === 'live')) return Promise.resolve(true);
    if (!this.opening) this.opening = this._open().finally(() => { this.opening = null; });
    return this.opening;
  },
  async _open() {
    if (this.an && this.stream && this.stream.getAudioTracks().some(t => t.readyState === 'live')) return true;
    if (this.stream) this.close();           // iOS ended it (e.g. app was in the background) → ask again
    if (!S.listen || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true } });
      unlockAudio();
      if (AUDIO.state === 'suspended') { try { await Promise.race([AUDIO.resume(), wait(300)]); } catch (e) {} } // before a tap iOS may not resume yet — fine
      this.an = AUDIO.createAnalyser(); this.an.fftSize = 1024;
      AUDIO.createMediaStreamSource(this.stream).connect(this.an);
      this.buf = new Float32Array(this.an.fftSize);
      return true;
    } catch (e) { this.close(); return false; }
  },
  level() {
    this.an.getFloatTimeDomainData(this.buf);
    let s = 0; for (let i = 0; i < this.buf.length; i++) s += this.buf[i] * this.buf[i];
    return Math.sqrt(s / this.buf.length);
  },
  /* onUtterance() fires each time she says something — after she finishes */
  watch(onUtterance, onLevel) {
    this.unwatch();
    let voiced = 0, silent = 0, inUtt = false, uttFrames = 0;
    const high = S.sens === 'high';
    const tick = () => {
      if (!this.an) return;
      const rms = this.level();
      const thr = Math.min(0.06, Math.max(high ? 0.005 : 0.008, this.floor * (high ? 2.2 : 3)));
      if (performance.now() < speakingUntil) {
        voiced = 0; silent = 0; inUtt = false; uttFrames = 0;
        onLevel && onLevel(0, false);
      } else {
        onLevel && onLevel(rms, true);
        if (rms > thr) {
          voiced++; silent = 0; if (voiced >= 6) inUtt = true;
          if (inUtt && ++uttFrames > 150) { inUtt = false; voiced = 0; uttFrames = 0; onUtterance(); } // long talking: react anyway
        } else {
          this.floor = this.floor * 0.97 + rms * 0.03;          // learns the room's background noise
          if (inUtt) { if (++silent >= 22) { inUtt = false; voiced = 0; silent = 0; uttFrames = 0; onUtterance(); } }
          else voiced = Math.max(0, voiced - 1);
        }
      }
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  },
  unwatch() { cancelAnimationFrame(this.raf); this.raf = 0; },
  close() {
    this.unwatch();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.stream = null; this.an = null;
  }
};

/* ---------- confetti ---------- */
function confetti() {
  const colors = ['#FF7A59', '#FFC93C', '#4CC373', '#4A90E2', '#FF8FC7', '#9B6BE0'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = pick(colors);
    c.style.animationDuration = 2.2 + Math.random() * 2 + 's'; c.style.animationDelay = Math.random() * .5 + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 5000);
  }
}

/* =====================================================================
   SCREENS
   ===================================================================== */
/* The mic is never switched off between screens: on iPhone/iPad every new request = a new permission popup. */
function show(html, keepMic) { hush(); Mic.unwatch(); document.body.classList.remove('rainy', 'sunny'); screen.innerHTML = `<div class="view">${html}</div>`; return tk; }
const topbar = (dots, done) => `<div class="topbar">
  <button class="round-btn" id="home" aria-label="Home">🏠</button>
  ${dots ? `<div class="dots">${Array.from({ length: dots }, (_, i) => `<i class="${i < done ? 'on' : ''}"></i>`).join('')}</div>` : '<span></span>'}
  <button class="round-btn" id="again" aria-label="Again">👂</button></div>`;
const chars = () => charHTML('fifi', 'left') + charHTML('pip', 'right');
function bindHome() { const h = $('#home'); if (h) h.onclick = () => home(false); }

/* ---------- start ---------- */
function start() {
  show(`<div class="start"><div class="title">Pip &amp; Fifi</div>
    <div class="start-row">${charHTML('fifi')}<button class="big-play" id="go" aria-label="Play">${ICON.play}</button>${charHTML('pip')}</div></div>`);
  /* download bar: voices + music tunes; ▶ stays faded until everything is ready */
  $('.start').insertAdjacentHTML('beforeend', `<div class="dl" id="dl"><div class="dl-bar"><i id="dlf"></i></div><span id="dlt">Pobieranie…</span></div>`);
  const dl = $('#dl'), playBtn = $('#go'); playBtn.classList.add('loading');
  let musicDone = false; Promise.resolve(M.prepare && M.prepare()).then(() => { musicDone = true; });
  const tick = setInterval(() => {
    if (!document.body.contains(dl)) return clearInterval(tick);
    const total = REC.total + 1, done = REC.done + (musicDone ? 1 : 0);
    const all = REC.finished && musicDone;
    $('#dlf').style.width = (all ? 100 : Math.round(done / Math.max(1, total) * 100)) + '%';
    $('#dlt').textContent = all ? '✓ Gotowe!' : `Pobieranie… ${REC.done} / ${REC.total || '…'}`;
    if (all) { clearInterval(tick); playBtn.classList.remove('loading'); dl.classList.add('ok'); setTimeout(() => dl.classList.add('hide'), 1500); }
  }, 150);
  /* Ask for the microphone NOW, on the start screen. Saying "Allow" switches the iPhone's sound
     to call mode, which cuts off anything playing — so it must happen before the welcome starts. */
  if (S.listen) {
    const go = $('#go'); go.classList.add('asking');
    Mic.open().finally(() => { Recog.warmup(); setTimeout(() => go.classList.remove('asking'), Recog.usable() ? 1300 : 0); });
  }
  $('#go').onclick = () => { unlockAudio(); playSilence(); Mic.open(); pickVoices(); M.play('walk', .55); greet(); primeSpeech(); };
}
/* iPhone on silent mutes web speech. Playing a (silent) media sound inside the tap switches
   iOS to "media playback", which ignores the silent switch — like a video does.
   Opening the microphone at the same tap does the same once it's allowed. */
let silentEl = null;
function playSilence() {
  try {
    if (!silentEl) {
      const rate = 8000, n = rate / 2, b = new ArrayBuffer(44 + n * 2), v = new DataView(b);
      const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
      v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true);
      v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
      silentEl = new Audio(URL.createObjectURL(new Blob([b], { type: 'audio/wav' })));
      silentEl.setAttribute('playsinline', ''); silentEl.loop = true;   // keeps iOS in media mode while music plays
    }
    const p = silentEl.play(); if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
/* iOS only lets speech start from a tap. Speak a silent word right inside the ▶ tap,
   so the welcome lines that come seconds later are allowed to play. */
function primeSpeech() {
  if (!hasTTS) return;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'en-GB'; speechSynthesis.speak(u); } catch (e) {}
}


/* ---------- word check: iPad dictation (Web Speech recognition) ----------
   Hears WHAT she says, not just that she speaks. Forgiving on purpose — she's 3:
   close enough counts ("capka" ≈ "czapka"), but "nie" is never taken as "tak".
   Not every setup has it (Apple long kept it off for home-screen apps; needs Siri/Dictation on):
   then the game quietly keeps the old "any voice counts" behaviour. */
const Recog = {
  api: window.SpeechRecognition || window.webkitSpeechRecognition || null,
  broken: false, cur: null, fails: 0, info: 'not used yet',
  usable() { return !!this.api && !this.broken && S.checkWords !== false; },
  failed(why) {                                  // she spoke (mic heard it) but dictation gave no words
    this.fails++; this.info = why;
    if (this.fails >= 2) { this.broken = true; this.info = 'switched off: ' + why; }
  },
  warmup() {                                     // start screen: get the dictation permission question out of the way
    if (!this.usable()) return;
    try { const r = new this.api(); r.lang = 'pl-PL'; r.onerror = e => { this.info = 'start: ' + e.error; }; r.onend = () => {};
      r.start(); setTimeout(() => { try { r.abort(); } catch (e) {} }, 1200); } catch (e) { this.info = 'start failed: ' + e.message; }
  },
  async listen(lang, ms = 7000) {                // → { heard: [...], sound: bool }   or null = can't be used here
    if (!this.usable()) return null;
    /* the game's own microphone must let go, otherwise dictation only gets silence (seen on Kamil's iPad) */
    if (Mic.stream) { Mic.close(); await wait(300); }
    return new Promise(res => {
      let r; try { r = new this.api(); } catch (e) { this.broken = true; return res(null); }
      r.lang = lang; r.continuous = false; r.interimResults = false; r.maxAlternatives = 5;
      const heard = []; let done = false, t = 0, sound = false;
      r.onsoundstart = r.onspeechstart = () => { sound = true; };
      const fin = v => { if (done) return; done = true; clearTimeout(t); if (this.cur === r) this.cur = null; try { r.abort(); } catch (e) {} if (v) v.sound = sound; res(v); };
      t = setTimeout(() => fin({ heard }), ms);
      r.onresult = e => { for (const rs of e.results) for (const a of rs) if (a.transcript) heard.push(a.transcript); this.info = 'heard: ' + heard.slice(0, 3).join(' / '); fin({ heard }); };
      r.onerror = e => { this.info = 'error: ' + e.error; if (/not-allowed|service-not-allowed|audio-capture|language-not-supported/.test(e.error)) { this.broken = true; fin(null); } else fin({ heard }); };
      r.onend = () => fin({ heard });
      try { this.cur = r; r.start(); } catch (e) { this.broken = true; fin(null); }
    });
  },
  stop() { try { this.cur && this.cur.abort(); } catch (e) {} this.cur = null; }
};
const norm = t => t.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const simW = (a, b) => (a && b) ? 1 - lev(a, b) / Math.max(a.length, b.length) : 0;
function heardScore(heard, target) {          // 0..1: how close the best guess is to the target words
  const tw = norm(target).split(' ').filter(Boolean); let best = 0;
  for (const h of heard) {
    const hw = norm(h).split(' ').filter(Boolean); if (!hw.length) continue;
    const whole = simW(hw.join(''), tw.join(''));
    const words = tw.filter(w => hw.some(x => simW(x, w) >= 0.6)).length / tw.length;
    best = Math.max(best, whole, words);
  }
  return best;
}
const WORD_OK = 0.6;
function yesNo(heard) {                         // 'yes' | 'no' | 'unclear'
  const ws = heard.flatMap(h => norm(h).split(' '));
  if (ws.some(w => ['nie', 'no', 'nope', 'nein', 'nah'].includes(w))) return 'no';
  if (ws.some(w => ['tak', 'yes', 'yeah', 'yep', 'jes', 'jest', 'ok', 'okej', 'okay', 'tag', 'dak'].includes(w))) return 'yes';
  return 'unclear';
}

/* ---------- welcome: Pip & Fifi walk in, come up close, wave and chat ---------- */
function greetTopic() {
  const d = new Date(), day = d.getDay(), h = d.getHours(), weekday = day >= 1 && day <= 5;
  if (weekday && h >= 12) return { en: 'How was nursery today?', pl: 'Jak było w przedszkolu?' };
  if (weekday && h < 9) return { en: 'Are you going to nursery today?', pl: 'Idziesz dziś do przedszkola?' };
  return { en: 'How are you today?', pl: 'Jak się masz?' };
}
function hearts(n = 9) {
  for (let i = 0; i < n; i++) setTimeout(() => {
    const h = document.createElement('div'); h.className = 'heart'; h.textContent = pick(['💕', '💛', '💖', '🧡']);
    h.style.left = 25 + Math.random() * 50 + 'vw'; h.style.bottom = 30 + Math.random() * 15 + 'vh';
    document.body.appendChild(h); setTimeout(() => h.remove(), 2800);
  }, i * 120);
}
async function greet() {
  const back = S.lastGreet && Date.now() - S.lastGreet < 30 * 60 * 1000;   // played a moment ago → short hello
  S.lastGreet = Date.now(); save();
  const my = show(`<div class="greet" id="gr">
      <div class="gwrap gl">${charHTML('fifi')}</div><div class="gwrap gr">${charHTML('pip')}</div>
      <button class="talk-bubble" id="tb" aria-label="Answer">🎤</button>
      <button class="yes-btn" id="yes"><span>👍</span>Tak!</button>
      <button class="skip" id="skip" aria-label="Skip">${ICON.next}</button></div>`, true);
  const G = $('#gr'), C = $$('.char', G);
  const alive = () => my === tk && $('#gr') === G;
  const both = (cls, on) => C.forEach(c => c.classList.toggle(cls, on));
  const smile = (ms = 1600) => { both('happy', true); setTimeout(() => both('happy', false), ms); };
  const goHome = () => { if (alive()) home(false); };
  $('#skip').onclick = goHome;

  /* answering: her voice, or a tap on the bubble / Tak! / a character */
  let answer = null;
  const listen = ms => new Promise(res => {
    G.classList.add('listening'); both('listen', true);
    const t = setTimeout(() => answer && answer('timeout'), ms);
    answer = how => { answer = null; clearTimeout(t); G.classList.remove('listening'); both('listen', false); res(how); };
  });
  $('#tb').onclick = $('#yes').onclick = () => { unlockAudio(); answer && answer('tap'); };
  C.forEach(c => c.onclick = () => { if (answer) answer('tap'); else { c.classList.remove('cheer'); void c.offsetWidth; c.classList.add('cheer'); } });

  /* 1. walk in from both sides — Fifi calls out straight away (still inside the ▶ tap, so iOS allows speech) */
  void G.offsetWidth;
  say('fifi', 'en', back ? `Yoo-hoo! ${KID.en}!` : `Yoo-hoo! ${KID.en}! We're coming!`);
  await wait(80);
  both('walking', true); G.classList.add('walk');
  await wait(2300); both('walking', false);
  if (!alive()) return;
  /* 2. come up close to the screen, wave and smile */
  G.classList.add('front');
  await wait(650); if (!alive()) return;
  smile(2200); waveAll();
  const hello = back
    ? [['fifi', 'en', `Yay! You're back, ${KID.en}!`], ['pip', 'pl', `Hura! Jesteś, ${KID.plCall}!`]]
    : [['fifi', 'en', `Yay! Hello, ${KID.en}!`], ['pip', 'pl', `Hura! Cześć, ${KID.plCall}!`]];
  if (!await seq(hello, my)) return;
  if (!back) {
    hearts(); cheer(); smile();
    if (!await seq([['fifi', 'en', `We missed you, ${KID.en}!`], ['pip', 'pl', `Tęskniliśmy za tobą, ${KID.plCall}!`]], my)) return;
  }
  M.stop(1.5);                                  // music off before we listen for her
  const micOn = await Mic.open();
  if (!alive()) return;
  let wordPhase = false;                          // while dictation listens, plain 'voice heard' doesn't answer
  let spokeInWordPhase = false;
  if (micOn) Mic.watch(() => { if (wordPhase) { spokeInWordPhase = true; return; } answer && answer('voice'); }, (lv, active) => G.style.setProperty('--lv', (1 + Math.min(0.35, (active ? lv : 0) * 7)).toFixed(3)));

  /* 3. chat: how was nursery? (skipped on a quick return) */
  if (!back) {
    const q = greetTopic();
    if (!await seq([['fifi', 'en', q.en], ['pip', 'pl', q.pl]], my)) return;
    let r = await listen(micOn ? 9000 : 6000);
    if (!alive()) return;
    if (r === 'timeout' && micOn) {
      if (!await seq([['fifi', 'en', pick([`Ooh, tell us, ${KID.en}!`, 'Tell us! Was it fun?'])]], my)) return;
      r = await listen(7000); if (!alive()) return;
    }
    cheer(); smile();
    const react = r === 'timeout'
      ? [['fifi', 'en', 'Hihi! Okay!']]
      : [['fifi', 'en', pick(['Ooh! Wow!', 'Really? Wow!', 'Ooh! Lovely!', 'Wow! Brilliant!'])], ['pip', 'pl', pick(['Super!', 'Ojej! Super!', 'Wow! Ekstra!'])]];
    if (!await seq(react, my)) return;
  }

  /* 4. ready to play? → Tak! */
  G.classList.add('ask-yes');
  if (!await seq([['fifi', 'en', `Are you ready to play, ${KID.en}?`], ['pip', 'pl', `Gotowa do zabawy, ${KID.plCall}?`]], my)) return;
  /* listen: a tap on Tak!, her voice — and, where the iPad can, WHAT she says (Tak / Nie) */
  const ask = async ms => {
    if (!Recog.usable()) return listen(ms);
    wordPhase = true; spokeInWordPhase = false;
    const waiting = listen(ms);
    Recog.listen('pl-PL', ms).then(rr => {
      if (!answer) return;
      if (rr === null) { wordPhase = false; return; }          // dictation not available → back to "any voice"
      if (rr.heard.length) return answer(yesNo(rr.heard));
      if (spokeInWordPhase || rr.sound) { Recog.failed('no words while she spoke'); answer('voice'); }   // don't leave her hanging
    });
    const got = await waiting; wordPhase = false; Recog.stop(); return got;
  };
  let r = await ask(9000), noes = 0;
  while (alive() && r === 'no' && noes < 3) {                 // she said "Nie" → not yet!
    noes++;
    if (!await seq(noes === 1
      ? [['pip', 'pl', 'Nie? Ojej! Jeszcze nie?'], ['fifi', 'en', 'Not yet? Okay! Say Tak when you are ready!']]
      : [['pip', 'pl', 'Hihi! Nie?'], ['fifi', 'en', 'Tell us when you are ready!']], my)) return;
    r = await ask(15000);
  }
  if (!alive()) return;
  if (r === 'timeout' || r === 'unclear' || r === 'no') {
    if (!await seq([['fifi', 'en', 'Say yes in Polish!'], ['pip', 'pl', 'Tak!']], my)) return;
    r = await ask(8000); if (!alive()) return;
    while (alive() && r === 'no') { if (!await seq([['pip', 'pl', 'Nie? Dobrze, poczekamy!'], ['fifi', 'en', "Okay, we'll wait!"]], my)) return; r = await ask(20000); }
    if (!alive()) return;
  }
  cheer(); smile(3000); confettiSmall();
  if (!await seq([['pip', 'pl', r === 'timeout' ? 'Hura!' : 'Tak! Hura!'], ['fifi', 'en', "Yay! Let's go!"], ['pip', 'pl', 'Bawimy się!']], my)) return;
  G.classList.remove('ask-yes'); G.classList.add('leave');
  await wait(750);
  goHome();
}

/* ---------- home ---------- */
const TILES = [
  { id: 'colours', e: '🎈', en: 'Colours', pl: 'Kolory', s: '#F7C6CC' },
  { id: 'animals', e: '🐶', en: 'Animals', pl: 'Zwierzątka', s: '#F1D9B5' },
  { id: 'count',   e: '🍎', en: 'Counting', pl: 'Liczymy', s: '#F5C9B8' },
  { id: 'friends', e: '🧸', en: 'Playing with friends', pl: 'Zabawa z dziećmi', s: '#CDE5F7' },
  { id: 'needs',   e: '🥤', en: 'At nursery', pl: 'W przedszkolu', s: '#D3EFC9' },
  { id: 'dress',   e: '🧥', en: 'Getting dressed', pl: 'Ubieramy się', s: '#E4D4F4' },
  { id: 'songs',   e: '🎵', en: 'Songs', pl: 'Piosenki', s: '#FFD3E4' },
  { id: 'stickers',e: '⭐', en: 'Stickers', pl: 'Naklejki', s: '#F7E6A6' },
  { id: 'food',      e: '🍽️', en: 'Mealtime',      pl: 'Jedzenie',     s: '#F8D7B8' },
  { id: 'bath',      e: '🛁', en: 'Bath time',     pl: 'Kąpiel',       s: '#C9E8F5' },
  { id: 'bed',       e: '🌙', en: 'Good night',    pl: 'Dobranoc',     s: '#D9D2F2' },
  { id: 'teacher',   e: '👩‍🏫', en: 'Hello, teacher', pl: 'Dzień dobry, Pani!', s: '#F7D0D9' },
  { id: 'arts',      e: '🎨', en: 'Arts and crafts', pl: 'Zajęcia',    s: '#FCE3B0' },
  { id: 'playground',e: '🛝', en: 'Playground',    pl: 'Plac zabaw',   s: '#CFEBC4' },
  { id: 'beach',     e: '🌊', en: 'At the beach',  pl: 'Plaża',        s: '#BFE6F2' },
  { id: 'icecream',  e: '🍦', en: 'Ice cream',     pl: 'Lody',         s: '#FAD3E6' }
];
/* places on the main screen: each has its own scene and its own tiles (⭐ stickers everywhere) */
const WORLDS = [
  { id: 'home',     e: '🏠', pl: 'W domu',         en: 'At home',          tiles: ['food', 'bath', 'bed', 'stickers'] },
  { id: 'nursery',  e: '🏫', pl: 'W przedszkolu',  en: 'At nursery',       tiles: ['teacher', 'friends', 'needs', 'arts', 'dress', 'songs', 'stickers'] },
  { id: 'outside',  e: '🌳', pl: 'Na dworze',      en: 'Playing outside',  tiles: ['playground', 'colours', 'animals', 'count', 'stickers'] },
  { id: 'holidays', e: '🏖️', pl: 'Wakacje',        en: 'Holidays',         tiles: ['beach', 'icecream', 'stickers'] }
];
const SCENES = {
  home: `<svg class="scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
    <rect width="1200" height="800" fill="#FFF1DC"/><rect y="560" width="1200" height="240" fill="#E3C69E"/>
    <rect y="556" width="1200" height="10" fill="#C9A57A"/>
    <rect x="120" y="140" width="260" height="220" rx="14" fill="#BFE6FF" stroke="#fff" stroke-width="16"/>
    <path d="M250 140 V360 M120 250 H380" stroke="#fff" stroke-width="10"/><circle cx="320" cy="200" r="28" fill="#FFE066"/>
    <path d="M100 130 q40 120 0 250 h-30 V120 Z M400 130 q-40 120 0 250 h30 V120 Z" fill="#FF9AA8"/>
    <rect x="780" y="430" width="340" height="120" rx="40" fill="#7FB3E6"/><rect x="760" y="470" width="380" height="110" rx="30" fill="#6A9FD6"/>
    <rect x="780" y="575" width="20" height="30" fill="#5A4632"/><rect x="1100" y="575" width="20" height="30" fill="#5A4632"/>
    <circle cx="840" cy="470" r="30" fill="#FFC93C"/><circle cx="1060" cy="470" r="30" fill="#FF7A9A"/>
    <ellipse cx="560" cy="690" rx="260" ry="50" fill="#F7B6C2"/><ellipse cx="560" cy="690" rx="200" ry="34" fill="#FFD1DA"/>
    <rect x="1010" y="230" width="12" height="200" fill="#8B6B4A"/><path d="M970 230 h90 l-20 -70 h-50 Z" fill="#FFE7A8"/>
  </svg>`,
  nursery: `<svg class="scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
    <rect width="1200" height="800" fill="#FDF6E3"/><rect y="560" width="1200" height="240" fill="#D9C2A3"/><rect y="556" width="1200" height="10" fill="#B99A75"/>
    <path d="M0 60 Q300 130 600 60 Q900 130 1200 60" stroke="#C99A6A" stroke-width="4" fill="none"/>
    ${['#FF7A9A', '#FFC93C', '#4CC373', '#5B8DEF', '#C77DFF', '#FF9A3C', '#FF7A9A', '#FFC93C', '#4CC373', '#5B8DEF', '#C77DFF'].map((c, i) => `<path d="M${50 + i * 105} ${72 + Math.sin(i / 1.7) * 18} l26 0 -13 34 Z" fill="${c}"/>`).join('')}
    <rect x="130" y="200" width="300" height="190" rx="12" fill="#3F6B5A" stroke="#C99A6A" stroke-width="12"/>
    <text x="280" y="310" text-anchor="middle" font-size="64" font-family="sans-serif" font-weight="800" fill="#fff" opacity=".85">A B C</text>
    <rect x="760" y="500" width="320" height="24" rx="8" fill="#F29E4C"/><rect x="780" y="524" width="16" height="70" fill="#D9853A"/><rect x="1044" y="524" width="16" height="70" fill="#D9853A"/>
    <rect x="700" y="520" width="60" height="14" rx="5" fill="#4CC373"/><rect x="706" y="534" width="10" height="56" fill="#3BA862"/><rect x="744" y="534" width="10" height="56" fill="#3BA862"/><rect x="740" y="460" width="14" height="70" rx="5" fill="#4CC373"/>
    <rect x="1080" y="520" width="60" height="14" rx="5" fill="#5B8DEF"/><rect x="1086" y="534" width="10" height="56" fill="#3E6FD0"/><rect x="1124" y="534" width="10" height="56" fill="#3E6FD0"/><rect x="1086" y="460" width="14" height="70" rx="5" fill="#5B8DEF"/>
    <circle cx="860" cy="488" r="14" fill="#FF7A9A"/><rect x="930" y="470" width="40" height="30" rx="5" fill="#FFC93C"/>
  </svg>`,
  outside: `<svg class="scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
    <path d="M0 560 Q300 480 640 540 Q930 590 1200 520 V800 H0 Z" fill="#9BD67F"/><path d="M0 640 Q400 580 760 630 Q1000 660 1200 610 V800 H0 Z" fill="#7FC765"/>
    <ellipse cx="620" cy="700" rx="150" ry="40" fill="#F4DDA8"/><ellipse cx="620" cy="692" rx="128" ry="28" fill="#F8E6BC"/>
    <path d="M840 600 L880 330 H920 L960 600" stroke="#E8505B" stroke-width="12" fill="none"/><path d="M880 330 V300 M920 330 V300" stroke="#E8505B" stroke-width="10"/>
    <rect x="860" y="300" width="80" height="16" rx="6" fill="#FFC93C"/><path d="M930 316 Q1060 400 1100 590" stroke="#5B8DEF" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M120 600 L170 330 H330 L380 600" stroke="#8B6B4A" stroke-width="14" fill="none"/><path d="M200 335 V500 M280 335 V500" stroke="#5A4632" stroke-width="4"/>
    <rect x="186" y="498" width="28" height="10" rx="4" fill="#FF7A9A"/><rect x="266" y="498" width="28" height="10" rx="4" fill="#4CC373"/>
  </svg>`,
  holidays: `<svg class="scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
    <rect y="430" width="1200" height="160" fill="#4FB3E8"/><path d="M0 440 Q60 425 120 440 T240 440 T360 440 T480 440 T600 440 T720 440 T840 440 T960 440 T1080 440 T1200 440" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>
    <path d="M0 560 Q600 500 1200 560 V800 H0 Z" fill="#F4DDA8"/>
    <path d="M160 640 L190 420" stroke="#8B6B4A" stroke-width="10"/><path d="M60 440 Q190 330 320 440 Q255 410 190 440 Q125 410 60 440 Z" fill="#FF7A59"/><path d="M125 410 Q190 330 255 410" stroke="#FFE066" stroke-width="10" fill="none"/>
    <path d="M1030 650 Q1020 520 1060 380" stroke="#A0703C" stroke-width="22" fill="none"/>
    <path d="M1060 380 q-90 -20 -140 40 M1060 380 q-60 -70 -150 -50 M1060 380 q40 -80 130 -60 M1060 380 q90 0 120 70" stroke="#4CC373" stroke-width="26" fill="none" stroke-linecap="round"/>
    <circle cx="420" cy="700" r="16" fill="#FF9AA8"/><path d="M700 690 q20 -30 40 0 Z" fill="#FFC93C"/>
  </svg>`
};
const curWorld = () => WORLDS.find(w => w.id === S.world) || WORLDS[1];
function home(greet, switched) {
  const W = curWorld();
  const my = show(`<div class="world-bg w-${W.id}">${SCENES[W.id] || ''}</div>
    <button class="gear" id="gear" aria-label="Parent settings">⚙️<span class="ring"></span></button>
    <div class="worlds">${WORLDS.map(w => `<button class="wbtn ${w.id === W.id ? 'on' : ''}" data-w="${w.id}"><span>${w.e}</span><b>${w.pl}</b></button>`).join('')}</div>
    <div class="menu world-menu">${W.tiles.map(id => TILES.find(t => t.id === id)).map(t => `<button class="tile ${t.id === 'friends' ? 'wiggle' : ''}" data-t="${t.id}" style="--s:${t.s}">
      <span class="e">${t.e}</span><span class="l">${t.pl}</span></button>`).join('')}</div>
    ${charHTML('fifi', 'left')}${charHTML('pip', 'right')}`);
  $$('.char').forEach(c => c.style.width = '26vmin');
  $$('.tile').forEach(b => b.onclick = () => openTile(b.dataset.t, b));
  $$('.wbtn').forEach(b => b.onclick = () => {           // switch place: new scene, new tiles
    unlockAudio(); if (b.dataset.w === W.id) return;
    S.world = b.dataset.w; save(); home(false, true);
  });
  parentGate($('#gear'));
  waveAll();
  M.play('menu', .32);                           // gentle music while she chooses
  if (greet) seq([['fifi', 'en', `Yay! Hello, ${KID.en}!`], ['pip', 'pl', `Hura! Cześć, ${KID.plCall}!`],
    ['fifi', 'en', 'Ooh! What shall we play?'], ['pip', 'pl', 'W co się bawimy?']], my);
  else if (switched) seq([['pip', 'pl', W.pl + '!'], ...(S.plOnly ? [] : [['fifi', 'en', W.en + '!']]), ['pip', 'pl', 'W co się bawimy?']], my);
  else seq([['pip', 'pl', 'W co się bawimy?']], my);
}
let opening = false;
async function openTile(id, el) {
  if (opening) return; opening = true; unlockAudio();
  const t = TILES.find(x => x.id === id);
  hush(); const my = tk; M.stop(1.2);
  el.style.transform = 'scale(1.12)';
  const go = { colours: () => pickGame('colours'), animals: () => pickGame('animals'), count: countGame,
    friends: () => phraseGame(window.FRIENDS), needs: () => phraseGame(window.NEEDS), dress: () => seasonMenu(), songs: songsMenu, stickers: stickerBook }[id]
    || (window.TOPICS[id] && (() => phraseGame(window.TOPICS[id])));
  await Promise.race([seq([['fifi', 'en', 'Yay! ' + t.en + '!'], ['pip', 'pl', 'Hura! ' + t.pl + '!']], my), wait(3200)]);
  opening = false;
  if (my === tk) go();
}

/* ---------- pick the right one: colours & animals ---------- */
function balloonHTML(c) {
  return `<svg viewBox="0 0 100 170"><path d="M50 108 C46 125 56 140 50 168" stroke="#9A8A80" stroke-width="2" fill="none"/>
    <ellipse cx="50" cy="55" rx="40" ry="50" fill="${c.hex}"/><path d="M44 104 L56 104 L50 112 Z" fill="${c.hex}"/>
    <ellipse cx="35" cy="35" rx="9" ry="15" fill="#fff" opacity=".45" transform="rotate(-20 35 35)"/></svg>`;
}
function pickGame(kind) {
  const isCol = kind === 'colours';
  const pool = isCol ? window.COLOURS : window.ANIMALS;
  const total = 6; let round = 0; let last = null;
  const next = () => {
    if (round >= total) return reward(() => pickGame(kind));
    const n = round < 2 ? 2 : round < 4 ? 3 : 4;
    let target; do { target = pick(pool); } while (target === last && pool.length > 1); last = target;
    const opts = shuffle([target, ...shuffle(pool.filter(x => x !== target)).slice(0, n - 1)]);
    const my = show(`${topbar(total, round)}
      <div class="play">${opts.map((o, i) => isCol
        ? `<button class="balloon" data-i="${i}">${balloonHTML(o)}</button>`
        : `<button class="card" data-i="${i}">${o.emoji}</button>`).join('')}</div>${chars()}`);
    bindHome();
    const bilingual = !S.plOnly;                 // Polish-only = test mode (grown-up panel)
    const prompt = isCol
      ? [['pip', 'pl', `Gdzie jest ${target.pl} balonik?`], ...(bilingual ? [['fifi', 'en', pick([`Find the ${target.en} balloon!`, `Where's the ${target.en} balloon?`])]] : [])]
      : [['pip', 'pl', `Gdzie jest ${target.pl}?`], ...(bilingual ? [['fifi', 'en', pick([`Where is the ${target.en}?`, `Can you find the ${target.en}?`])]] : [])];
    seq(prompt, my);
    $('#again').onclick = () => { hush(); seq(prompt); };
    let solved = false;
    $$('[data-i]').forEach(b => b.onclick = async () => {
      if (solved) return;
      const o = opts[+b.dataset.i];
      hush(); const t = tk;
      if (o === target) {
        solved = true;
        b.classList.add(isCol ? 'pop' : 'yes');
        $$('[data-i]').forEach(x => { if (x !== b) x.classList.add('dim'); });
        cheer(); round++;
        const dots = $$('.dots i'); if (dots[round - 1]) dots[round - 1].classList.add('on');
        await seq(isCol
          ? [['pip', 'pl', `${cap(target.pl)}! ${praisePL()}`], ['fifi', 'en', praiseEN()]]
          : [['pip', 'pl', `${cap(target.pl)}! ${target.sound}`], ['fifi', 'en', praiseEN()]], t);
        if (t === tk) { await wait(300); if (t === tk) next(); }
      } else {
        b.classList.remove('no'); void b.offsetWidth; b.classList.add('no');
        await seq([['pip', 'pl', `To jest ${o.pl}.`], ['fifi', 'en', isCol ? `Oops, that's ${o.en}!` : `That's the ${o.en}!`],
          ['pip', 'pl', isCol ? `Gdzie jest ${target.pl} balonik?` : `Gdzie jest ${target.pl}?`]].filter(l => !S.plOnly || l[0] === 'pip'), t);
      }
    });
  };
  next();
}

/* ---------- counting ---------- */
function countGame() {
  const rounds = [2, 3, 1, 4, 3, 5]; let r = 0;
  const next = () => {
    if (r >= rounds.length) return reward(countGame);
    const n = rounds[r]; const thing = pick(window.COUNT_THINGS);
    const my = show(`${topbar(rounds.length, r)}
      <div class="count-area">${Array.from({ length: n }, (_, i) => `<button class="thing" data-k="${i}">${thing.emoji}</button>`).join('')}</div>${chars()}`);
    bindHome();
    const prompt = r === 0 ? [['fifi', 'en', 'Ooh! Let\'s count! Tap them one by one!'], ['pip', 'pl', 'Hura! Liczymy!']] : [['pip', 'pl', 'Liczymy!']];
    seq(prompt, my);
    $('#again').onclick = () => { hush(); seq([['fifi', 'en', 'Tap them one by one!'], ['pip', 'pl', 'Liczymy!']]); };
    let count = 0;
    $$('.thing').forEach(b => b.onclick = async () => {
      if (b.classList.contains('counted') || count >= n) return;
      count++;
      b.classList.add('counted', 'hop');
      b.insertAdjacentHTML('beforeend', `<span class="n">${count}</span>`);
      hush(); const t = tk;
      if (count < n) { say('pip', 'pl', window.NUMBERS[count - 1].pl); return; }
      r++;
      const dots = $$('.dots i'); if (dots[r - 1]) dots[r - 1].classList.add('on');
      await say('pip', 'pl', window.NUMBERS[count - 1].pl);
      if (t !== tk) return;
      $('.view').insertAdjacentHTML('beforeend', `<div class="big-number">${n}</div>`);
      cheer();
      await seq([['pip', 'pl', `${cap(window.NUMBERS[n - 1].pl)}! ${praisePL()}`], ['fifi', 'en', `${cap(window.NUMBERS[n - 1].en)}! ${praiseEN()}`]], t);
      if (t === tk) { await wait(400); if (t === tk) next(); }
    });
  };
  next();
}


/* ---------- getting dressed: nursery cloakroom, toy box with clothes ---------- */
const ROOM = `<div class="room" id="room"><div class="wall"></div>
  <svg class="lockers" viewBox="0 0 300 222">
    <rect x="0" y="0" width="300" height="180" rx="8" fill="#E8C9A0"/>
    ${['#BFE3F5', '#FFD6E0', '#D7F0C8', '#FFE9A8'].map((c, i) => { const x = 10 + i * 72; return `
      <rect x="${x}" y="10" width="64" height="160" rx="5" fill="${c}"/>
      <rect x="${x}" y="10" width="64" height="12" fill="#000" opacity=".06"/>
      <circle cx="${x + 32}" cy="38" r="5" fill="#9A8A80"/><path d="M${x + 32} 38 v8 q0 5 6 5" stroke="#9A8A80" stroke-width="3" fill="none"/>
      <circle cx="${x + 32}" cy="150" r="11" fill="#fff"/>`; }).join('')}
    <path d="M42 144 l2.6 5.3 5.8 .8 -4.2 4.1 1 5.8 -5.2 -2.7 -5.2 2.7 1 -5.8 -4.2 -4.1 5.8 -.8 Z" fill="#FFC93C"/>
    <path d="M114 156 c-8 -6 -9 -12 -4 -14 c3 -1 4 1 4 3 c0 -2 1 -4 4 -3 c5 2 4 8 -4 14 Z" fill="#FF6B8A"/>
    <circle cx="186" cy="150" r="5" fill="#FFB020"/><path d="M186 140 v4 M186 156 v4 M176 150 h4 M192 150 h4" stroke="#FFB020" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="258" cy="150" r="3" fill="#FFC93C"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${258 + 5.5 * Math.cos(a * Math.PI / 180)}" cy="${150 + 5.5 * Math.sin(a * Math.PI / 180)}" r="3.4" fill="#C77DFF"/>`).join('')}
    <path d="M240 50 q18 -8 36 0 l4 52 q-22 6 -44 0 Z" fill="#7FBF6A"/><path d="M240 54 l-6 34 M276 54 l6 34" stroke="#7FBF6A" stroke-width="9" stroke-linecap="round"/>
    <path d="M90 118 h18 v14 h-22 q-3 -8 4 -8 Z M114 118 h18 v14 h-18 Z" fill="#5B8DEF"/>
    <rect x="-6" y="182" width="312" height="14" rx="5" fill="#C99A6A"/>
    <rect x="14" y="196" width="10" height="26" fill="#B5875A"/><rect x="276" y="196" width="10" height="26" fill="#B5875A"/>
  </svg><div class="floor"></div></div>`;
function snow(sec = 5) {
  for (let i = 0; i < 45; i++) setTimeout(() => {
    const f = document.createElement('div'); f.className = 'flake'; f.textContent = Math.random() < .5 ? '❄' : '•';
    f.style.left = Math.random() * 100 + 'vw'; f.style.fontSize = (2 + Math.random() * 3) + 'vmin';
    f.style.animationDuration = (3 + Math.random() * 3) + 's';
    document.body.appendChild(f); setTimeout(() => f.remove(), 6500);
  }, Math.random() * sec * 1000);
}
/* season choice: ❄️ zima, 🍂 jesień, ☀️ lato */
function seasonMenu() {
  const SE = window.SEASONS;
  const my = show(`${topbar(0, 0)}<div class="menu seasons">${Object.keys(SE).map(k =>
    `<button class="tile" data-s="${k}" style="--s:${SE[k].s}"><span class="e">${SE[k].e}</span><span class="l">${cap(SE[k].pl)}</span></button>`).join('')}</div>${chars()}`);
  bindHome();
  $$('.seasons .tile').forEach(t => t.onclick = async () => {
    unlockAudio(); hush(); const k = t.dataset.s, se = SE[k], tt = tk;
    t.classList.add('picked');
    await seq([['pip', 'pl', cap(se.pl) + '!'], ...(S.plOnly ? [] : [['fifi', 'en', cap(se.en) + '!']])], tt);
    if (tt === tk) dressGame(k);
  });
  $('#again').onclick = () => { hush(); seq([['pip', 'pl', 'Zima, jesień czy lato?'], ...(S.plOnly ? [] : [['fifi', 'en', 'Winter, autumn or summer?']])]); };
  waveAll();
  seq([['pip', 'pl', `Zima, jesień czy lato, ${KID.plCall}?`], ...(S.plOnly ? [] : [['fifi', 'en', 'Winter, autumn or summer?']])], my);
}
/* outside after dressing: snow (winter), rain & puddles (autumn), sunshine (summer) */
function rain(sec = 14) {
  for (let i = 0; i < 90; i++) setTimeout(() => {
    const f = document.createElement('div'); f.className = 'drop';
    f.style.left = Math.random() * 100 + 'vw'; f.style.animationDuration = (.6 + Math.random() * .5) + 's';
    document.body.appendChild(f); setTimeout(() => f.remove(), 1400);
  }, Math.random() * sec * 1000);
  for (let i = 0; i < 12; i++) setTimeout(() => {
    const f = document.createElement('div'); f.className = 'flake leaf'; f.textContent = pick(['🍂', '🍁', '🍂']);
    f.style.left = Math.random() * 100 + 'vw'; f.style.fontSize = (3 + Math.random() * 2) + 'vmin'; f.style.animationDuration = (4 + Math.random() * 3) + 's';
    document.body.appendChild(f); setTimeout(() => f.remove(), 7500);
  }, Math.random() * sec * 1000);
}
function sunshine(sec = 14) {
  for (let i = 0; i < 10; i++) setTimeout(() => {
    const f = document.createElement('div'); f.className = 'flutter'; f.textContent = pick(['🦋', '🦋', '🌼', '🐝']);
    f.style.top = 20 + Math.random() * 50 + 'vh'; f.style.animationDuration = (6 + Math.random() * 4) + 's';
    document.body.appendChild(f); setTimeout(() => f.remove(), 10500);
  }, Math.random() * sec * 1000);
}
const OUTSIDE = {
  winter: { song: 'snow', fx: snow, go: ['Hura! Idziemy na dwór!', `Yay! All dressed, ${'{kid}'}! Let's go outside!`], fun: ['Śnieg! Hura!', 'Wheee! Snow!'] },
  autumn: { song: 'walk', fx: rain, go: ['Hura! Idziemy na dwór!', "Yay! All dressed! Let's jump in the puddles!"], fun: ['Kałuże! Hop, hop!', 'Splash! Splash!'], cls: 'rainy' },
  summer: { song: 'sun', fx: sunshine, go: ['Hura! Idziemy na dwór!', "Yay! All dressed! Let's play in the sunshine!"], fun: ['Słoneczko! Hura!', 'Wheee! Sunshine!'], cls: 'sunny' }
};
function dressGame(season, mode) {
  season = season || S.lastSeason || 'winter'; S.lastSeason = season;
  const SE = window.SEASONS[season], C = SE.clothes, A = window.DRESS_ART, byId = id => C.find(c => c.id === id);
  S.dressNext = (S.dressNext && typeof S.dressNext === 'object') ? S.dressNext : {};
  mode = mode || (S.dressNext[season] === 'off' ? 'off' : 'on');   // per season: get dressed → next time take off
  S.dressNext[season] = mode === 'on' ? 'off' : 'on'; save();
  const dressing = mode === 'on';
  const order = dressing ? C.map(c => c.id) : C.map(c => c.id).reverse();
  const worn = new Set(dressing ? [] : order);
  let step = 0, busy = true, hintT = 0;
  const my = show(`${ROOM}${topbar(order.length, 0)}
    <div class="kid" id="kid">${A.kid([...worn], SE.layers)}</div>
    <div class="toybox"><div class="tb-back"></div><div class="tb-items">${shuffle(C.map(c => c.id)).map(id =>
      `<div class="item ${worn.has(id) ? 'gone' : ''}" data-id="${id}" style="--r:${(Math.random() * 16 - 8).toFixed(1)}deg">${A.item(id)}</div>`).join('')}</div>
      <div class="tb-front"></div></div>${chars()}`);
  bindHome();
  const kid = $('#kid'), alive = () => $('#kid') === kid;
  const putPL = c => c.take ? `Weź ${c.acc}!` : `Załóż ${c.acc}!`, putEN = c => c.take ? `Take the ${c.en}!` : `Put on the ${c.en}!`;
  const offPL = c => c.take ? `Odłóż ${c.acc}!` : `Zdejmij ${c.acc}!`, offEN = c => c.take ? `Put the ${c.en} away!` : `Take off the ${c.en}!`;
  const target = () => byId(order[step]);
  const jest = c => c.plural ? 'są' : 'jest';
  const where = c => `Gdzie ${jest(c)} ${c.pl}?`;
  const ask = c => {
    const bi = !S.plOnly;                         // Fifi (English) + Pip (Polish); Polish-only = test mode (grown-up panel)
    if (dressing) return [['pip', 'pl', `${where(c)} ${putPL(c)}`], ...(bi ? [['fifi', 'en', putEN(c)]] : [])];
    return [['pip', 'pl', offPL(c)], ...(bi ? [['fifi', 'en', offEN(c)]] : [])];
  };
  const hintLater = () => {                       // after a while, the right one glows
    clearTimeout(hintT);
    hintT = setTimeout(() => {
      if (!alive() || busy) return;
      const id = target().id;
      if (dressing) { const el = $(`.item[data-id="${id}"]`); el && el.classList.add('hint'); }
      else { const g = $(`.cl[data-cl="${id}"]`, kid); g && g.classList.add('hint'); }
    }, 9000);
  };
  const clearHint = () => { clearTimeout(hintT); $$('.hint').forEach(x => x.classList.remove('hint')); };
  const prompt = async () => { busy = false; hintLater(); await seq(ask(target())); };
  $('#again').onclick = () => { hush(); seq(ask(target())); };

  const baseRect = el => { const t = el.style.transform; el.style.transition = 'none'; el.style.transform = 'none'; const r = el.getBoundingClientRect(); el.style.transform = t; return r; };
  const toLayer = (el, id) => {                   // transform that puts the box item exactly over its place on the child
    const L = $(`.cl[data-cl="${id}"]`, kid).getBoundingClientRect(), B = baseRect(el);
    const sc = Math.min(L.width / B.width, L.height / B.height) || 1;
    return `translate(${L.left + L.width / 2 - (B.left + B.width / 2)}px, ${L.top + L.height / 2 - (B.top + B.height / 2)}px) scale(${sc})`;
  };
  const backToBox = el => { el.style.transition = ''; el.style.transform = ''; };

  const done = async () => {
    busy = true; clearHint(); hush(); const t = tk;
    kid.classList.add('happy'); cheer();
    if (dressing) {
      const O = OUTSIDE[season];
      if (!await seq([['pip', 'pl', O.go[0]], ...(S.plOnly ? [] : [['fifi', 'en', O.go[1]]])], t)) return;
      $('#room').classList.add('out'); $('.toybox').classList.add('out');
      if (O.cls) document.body.classList.add(O.cls);
      M.play(O.song, .6); const t0 = performance.now();            // Jingle Bells in the snow, a march in the rain, a sunny tune in summer
      kid.classList.add('hop'); O.fx(14); confettiSmall();
      if (season === 'autumn') kid.insertAdjacentHTML('beforeend', '<div class="puddle"></div>');
      const dance = setInterval(() => { if (t !== tk) return clearInterval(dance); cheer(); }, 1800);
      if (!await seq([['pip', 'pl', O.fun[0]], ...(S.plOnly ? [] : [['fifi', 'en', O.fun[1]]])], t)) { clearInterval(dance); return; }
      const left = (M.on && M.length(O.song) ? M.length(O.song) * 1000 : 3000) - (performance.now() - t0);
      await wait(Math.max(1500, left)); clearInterval(dance); if (t !== tk) return;
      M.stop(1); document.body.classList.remove('rainy', 'sunny');
      sayClothes(season, order);
    } else {
      if (!await seq([['pip', 'pl', `Brawo, ${KID.plCall}! Gotowe!`], ['fifi', 'en', 'All done! Well done!']], t)) return;
      sayClothes(season, order);
    }
  };
  const success = async () => {
    const c = target(); step++; clearHint(); hush(); const t = tk;
    const dots = $$('.dots i'); if (dots[step - 1]) dots[step - 1].classList.add('on');
    cheer('pip');
    const lines = [['pip', 'pl', `${cap(c.pl)}! ${praisePL()}`]];
    if (!S.plOnly) lines.push(['fifi', 'en', praiseEN()]);
    if (!await seq(lines, t)) return;
    if (step >= order.length) return done();
    prompt();
  };
  const wrong = async o => {
    const c = target(); hush(); const t = tk;
    const lines = [['pip', 'pl', `To ${jest(o)} ${o.pl}.`]];
    if (!S.plOnly) lines.push(['fifi', 'en', `That's the ${o.en}!`]);
    lines.push(['pip', 'pl', dressing ? where(c) : offPL(c)]);
    await seq(lines, t);
  };

  /* putting on: drag a piece from the box onto the child — or just tap it */
  const put = (el, id) => {
    busy = true;
    el.classList.remove('drag'); el.style.transition = 'transform .45s cubic-bezier(.4,.1,.3,1)';
    requestAnimationFrame(() => { el.style.transform = toLayer(el, id); });
    setTimeout(() => {
      el.classList.add('gone'); el.style.transition = 'none'; el.style.transform = '';
      const g = $(`.cl[data-cl="${id}"]`, kid); g.classList.add('on', 'pop'); setTimeout(() => g.classList.remove('pop'), 500);
      worn.add(id); success();
    }, 470);
  };
  $$('.item').forEach(el => el.addEventListener('pointerdown', e => {
    if (!dressing || busy || el.classList.contains('gone')) return;
    e.preventDefault(); unlockAudio();
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
    const sx = e.clientX, sy = e.clientY; let moved = false;
    el.classList.add('drag'); el.style.transition = 'none';
    const mv = ev => { const dx = ev.clientX - sx, dy = ev.clientY - sy; if (Math.hypot(dx, dy) > 12) moved = true; el.style.transform = `translate(${dx}px, ${dy}px) scale(1.15)`; };
    const up = ev => {
      el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      if (busy) return backToBox(el);
      const K = kid.getBoundingClientRect(), pad = 30;
      const onKid = ev.clientX > K.left - pad && ev.clientX < K.right + pad && ev.clientY > K.top - pad && ev.clientY < K.bottom + pad;
      const id = el.dataset.id;
      if (moved && !onKid) { el.classList.remove('drag'); return backToBox(el); }   // dropped somewhere else: just goes back
      if (id === target().id) return put(el, id);
      el.classList.remove('drag'); backToBox(el);
      el.classList.remove('no'); void el.offsetWidth; el.classList.add('no');
      wrong(byId(id));
    };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }));

  /* taking off: tap the piece on the child → it flies back into the box */
  kid.addEventListener('click', e => {
    if (dressing || busy) return;
    const g = e.target.closest('.cl.on'); if (!g) return;
    unlockAudio();
    const id = g.dataset.cl;
    if (id !== target().id) { g.classList.remove('nope'); void g.getBBox(); g.classList.add('nope'); return wrong(byId(id)); }
    busy = true;
    const el = $(`.item[data-id="${id}"]`);
    el.style.transition = 'none'; el.style.transform = toLayer(el, id); el.classList.remove('gone');
    g.classList.remove('on'); worn.delete(id);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = 'transform .5s cubic-bezier(.3,1.3,.5,1)'; el.style.transform = ''; }));
    setTimeout(success, 450);
  });

  (async () => {
    await wait(200); if (!alive()) return;
    const intro = dressing
      ? ({ winter: [['pip', 'pl', `Zima! Ubieramy się na dwór, ${KID.plCall}!`], ['fifi', 'en', "Ooh! It's winter! Let's get dressed to play outside!"]],
           autumn: [['pip', 'pl', `Jesień! Pada deszcz! Ubieramy się, ${KID.plCall}!`], ['fifi', 'en', "It's autumn and it's raining! Let's get dressed!"]],
           summer: [['pip', 'pl', `Lato! Jest ciepło! Ubieramy się, ${KID.plCall}!`], ['fifi', 'en', "It's summer and it's warm! Let's get dressed!"]] })[season]
      : (season === 'winter' ? [['pip', 'pl', `Brrr! Wracamy! Rozbieramy się, ${KID.plCall}!`], ['fifi', 'en', "We're back inside! Let's take our clothes off!"]]
                             : [['pip', 'pl', `Wracamy! Rozbieramy się, ${KID.plCall}!`], ['fifi', 'en', "We're back inside! Let's take our things off!"]]);
    if (!await seq(intro.filter(l => !S.plOnly || l[0] === 'pip'), my)) return;
    prompt();
  })();
}

/* after dressing / undressing: practise saying the clothes words */
function sayClothes(season, order) {
  const list = order.map(id => {
    const c = window.SEASONS[season].clothes.find(x => x.id === id);
    return { pl: cap(c.pl) + '!', en: cap(c.en), art: window.DRESS_ART.item(id),
      whyEn: c.plural ? `These are the ${c.en}!` : `This is the ${c.en}!` };
  });
  phraseGame(list, {
    intro: [['pip', 'pl', `Teraz mówimy, ${KID.plCall}!`], ['fifi', 'en', "Now let's say the words!"]],
    done: () => reward(() => dressGame(season))
  });
}

/* ---------- say it: playing with friends & nursery words ---------- */
let saidYourTurn = false; // "Your turn!" is spoken only once per visit — after that a visual cue
function phraseGame(list, opts = {}) {
  let i = 0, card = 0;
  saidYourTurn = false;
  const again = () => phraseGame(list, opts);
  const next = async () => {
    if (i >= list.length) return opts.done ? opts.done() : reward(again);
    const p = list[i]; const c = ++card;
    show(`${topbar(list.length, i)}
      <div class="phrase" id="ph"><button class="pic ${p.art ? 'art' : ''}" id="pic">${p.art || p.emoji}</button>
        <div class="pl">${kidify(p.pl, 'pl')}</div><div class="en">${kidify(p.en, 'en')}</div>
        <div class="your-turn" id="yt"></div></div>${chars()}`, true);
    bindHome();
    const ph = $('#ph'), yt = $('#yt');
    let praised = 0, busy = false, nudged = false, lastVoice = 0, nudgeTimer = 0;
    const alive = () => c === card && $('#ph') === ph;

    const showNext = () => {
      if (!alive() || $('#nx')) return;
      $('.view').insertAdjacentHTML('beforeend', `<button class="next-btn" id="nx" aria-label="Next">${ICON.next}</button>`);
      $('#nx').onclick = () => { clearTimeout(nudgeTimer); i++; next(); };
    };
    const armNudge = () => {
      clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(async () => {
        if (!alive() || busy || praised) return;
        if (!nudged) {
          nudged = true; busy = true;
          await seq(S.plOnly ? [['pip', 'pl', `Powiedz: ${p.pl}`]] : [['fifi', 'en', 'Let\'s say it together!'], ['pip', 'pl', p.pl]]);
          busy = false; armNudge();
        } else showNext();
      }, 6500);
    };
    let spoke = false;
    async function onVoice(checked) {
      if (useWords && checked !== true) { spoke = true; return; }          // with dictation, only a matching word counts
      if (!alive() || busy) return;
      busy = true; praised++; lastVoice = performance.now(); clearTimeout(nudgeTimer);
      cheer(); confettiBurst();
      const lines = praised === 1
        ? [['pip', 'pl', praisePL()], ['fifi', 'en', praiseEN()]]
        : praised < 4 ? [['pip', 'pl', pick(['Super!', 'Brawo!', 'Hura! Jeszcze raz!', 'Wow! Pięknie!', 'Juhu!'])]]
        : [];                                   // after a few times: just a happy jump, no talking
      if (lines.length) await seq(lines);
      busy = false;
      if (alive()) showNext();
    }
    let useWords = false, tries = 0;
    async function checkWords() {             // dictation: did she say (close to) the word?
      while (alive()) {
        yt.textContent = '🎤'; ph.classList.add('listening'); spoke = false;
        const rr = await Recog.listen('pl-PL', 7000);
        ph.classList.remove('listening');
        if (!alive()) return;
        if (rr === null) { useWords = false; armNudge(); return; }   // not available → old behaviour
        if (!rr.heard.length && (spoke || rr.sound)) {   // she spoke, dictation gave no words → accept, like before
          Recog.failed('no words while she spoke');
          if (!Recog.usable()) useWords = false;
          busy = false; await onVoice(true); return;
        }
        if (!rr.heard.length) {               // she said nothing
          if (!nudged) { nudged = true; busy = true; await seq(S.plOnly ? [['pip', 'pl', `Powiedz: ${p.pl}`]] : [['fifi', 'en', 'Let\'s say it together!'], ['pip', 'pl', p.pl]]); busy = false; continue; }
          showNext(); return;
        }
        if (heardScore(rr.heard, p.pl) >= WORD_OK) { busy = false; await onVoice(true); return; }
        tries++; busy = true;
        if (tries >= 3) {                      // never make her feel stuck
          await seq([['pip', 'pl', `Dobra próba! ${p.pl}`], ...(S.plOnly ? [] : [['fifi', 'en', 'Good try!']])]);
          busy = false; showNext(); return;
        }
        await seq(S.plOnly ? [['pip', 'pl', `Prawie! Posłuchaj: ${p.pl}`]]
          : [['pip', 'pl', 'Prawie!'], ['fifi', 'en', 'Almost! Listen again!'], ['pip', 'pl', p.pl]]);
        busy = false;
      }
    }
    async function intro() {
      busy = true; yt.textContent = '';
      const lines = S.plOnly ? [['pip', 'pl', p.pl]] : [['pip', 'pl', p.pl], ['fifi', 'en', p.whyEn || `${p.why} ${p.en}`], ['pip', 'pl', p.pl]];
      if (card === 1 && opts.intro) lines.unshift(...opts.intro.filter(l => !S.plOnly || l[0] === 'pip'));
      if (!saidYourTurn) { saidYourTurn = true; lines.push(S.plOnly ? ['pip', 'pl', `Twoja kolej, ${KID.plCall}! Powiedz!`] : ['fifi', 'en', `Ooh! Your turn, ${KID.en}! Say it!`]); }
      await seq(lines);
      busy = false;
      if (!alive()) return;
      useWords = Recog.usable();
      if (useWords) { checkWords(); return; }
      yt.textContent = micOn ? '🎤' : '';
      if (micOn) armNudge(); else { await seq([['pip', 'pl', p.pl]]); showNext(); }
    }

    $('#pic').onclick = async () => { if (!alive()) return; hush(); busy = true; await say('pip', 'pl', p.pl); busy = false; };
    $('#again').onclick = () => { hush(); clearTimeout(nudgeTimer); intro(); };

    const micOn = await Mic.open();          // asks for the microphone once, then stays open
    if (!alive()) return;
    if (micOn) Mic.watch(onVoice, (lv, active) => {
      ph.classList.toggle('listening', active);
      ph.style.setProperty('--lv', (1 + Math.min(0.35, lv * 7)).toFixed(3));
    });
    intro();
    setTimeout(() => { if (alive() && !useWords) showNext(); }, 14000); // never get stuck (the word check has its own way out)
  };
  next();
}
function confettiSmall() { for (let k = 0; k < 2; k++) setTimeout(() => confettiBurst(), k * 150); }
function confettiBurst() {
  const colors = ['#FF7A59', '#FFC93C', '#4CC373', '#4A90E2', '#FF8FC7'];
  for (let i = 0; i < 18; i++) {
    const c = document.createElement('div'); c.className = 'confetti';
    c.style.left = 30 + Math.random() * 40 + 'vw'; c.style.background = pick(colors);
    c.style.animationDuration = 1.8 + Math.random() * 1.2 + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 3500);
  }
}

/* ---------- reward & sticker book ---------- */
function reward(again) {
  const fresh = window.STICKERS.filter(s => !S.stickers.includes(s));
  const st = fresh.length ? pick(fresh) : pick(window.STICKERS);
  if (fresh.length) S.stickers.push(st); save();
  const my = show(`<div class="reward"><div class="sticker-big">${st}</div>
    <div class="reward-btns"><button class="round-btn" id="rh" style="width:15vmin;height:15vmin;font-size:8vmin">🏠</button>
    <button class="round-btn" id="ra" style="width:15vmin;height:15vmin;font-size:8vmin">🔁</button></div></div>${chars()}`);
  confetti(); cheer();
  $('#rh').onclick = () => home(false);
  $('#ra').onclick = again;
  seq([['fifi', 'en', `Wow! Yay! A sticker for you, ${KID.en}!`], ['pip', 'pl', `Hura! Naklejka dla ciebie! Brawo, ${KID.plCall}!`]], my).then(ok => ok && cheer());
}

/* ---------- songs: list + song screen with an animation ---------- */
function songsMenu() {
  const L = window.SONGS;
  if (L.length === 1) return songScreen(L[0]);            // only one song so far → straight in
  const my = show(`${topbar(0, 0)}<div class="menu seasons">${L.map((g, i) =>
    `<button class="tile" data-i="${i}" style="--s:#FFD3E4"><span class="e">${g.e}</span><span class="l">${g.title}</span></button>`).join('')}</div>${chars()}`);
  bindHome();
  $$('.seasons .tile').forEach(t => t.onclick = () => { unlockAudio(); songScreen(L[+t.dataset.i]); });
  seq([['pip', 'pl', 'Piosenki! Którą śpiewamy?'], ...(S.plOnly ? [] : [['fifi', 'en', 'Songs! Which one shall we sing?']])], my);
}
const TRAIN_ART = {
  loco: `<svg viewBox="0 0 200 150" class="loco">
    <rect x="18" y="58" width="104" height="52" rx="12" fill="#E8505B"/>
    <rect x="112" y="22" width="66" height="88" rx="10" fill="#C93E48"/>
    <rect x="124" y="34" width="42" height="34" rx="8" fill="#BFE3F5"/>
    <rect x="40" y="26" width="22" height="34" rx="4" fill="#5A4632"/><rect x="34" y="20" width="34" height="10" rx="4" fill="#3E3024"/>
    <circle cx="18" cy="84" r="10" fill="#FFE066"/>
    <path d="M6 110 L22 96 L22 112 Z" fill="#5A4632"/>
    <rect x="18" y="104" width="160" height="10" rx="4" fill="#8E2A32"/>
    <g class="wheel" style="transform-origin:52px 120px"><circle cx="52" cy="120" r="18" fill="#3E3024"/><circle cx="52" cy="120" r="7" fill="#FFC93C"/><path d="M52 102 V138 M34 120 H70" stroke="#FFC93C" stroke-width="3"/></g>
    <g class="wheel" style="transform-origin:110px 120px"><circle cx="110" cy="120" r="18" fill="#3E3024"/><circle cx="110" cy="120" r="7" fill="#FFC93C"/><path d="M110 102 V138 M92 120 H128" stroke="#FFC93C" stroke-width="3"/></g>
    <g class="wheel" style="transform-origin:158px 124px"><circle cx="158" cy="124" r="14" fill="#3E3024"/><circle cx="158" cy="124" r="5" fill="#FFC93C"/><path d="M158 110 V138 M144 124 H172" stroke="#FFC93C" stroke-width="3"/></g>
  </svg>`,
  car: c => `<svg viewBox="0 0 160 150" class="car">
    <rect x="8" y="40" width="144" height="70" rx="12" fill="${c}"/>
    <rect x="8" y="40" width="144" height="12" rx="6" fill="#000" opacity=".1"/>
    <rect x="22" y="54" width="116" height="40" rx="10" fill="#FFF8E7"/>
    <rect x="0" y="100" width="160" height="10" rx="4" fill="#5A4632"/>
    <g class="wheel" style="transform-origin:42px 122px"><circle cx="42" cy="122" r="15" fill="#3E3024"/><circle cx="42" cy="122" r="5" fill="#FFC93C"/><path d="M42 107 V137 M27 122 H57" stroke="#FFC93C" stroke-width="3"/></g>
    <g class="wheel" style="transform-origin:118px 122px"><circle cx="118" cy="122" r="15" fill="#3E3024"/><circle cx="118" cy="122" r="5" fill="#FFC93C"/><path d="M118 107 V137 M103 122 H133" stroke="#FFC93C" stroke-width="3"/></g>
  </svg>`
};
function songScreen(song) {
  const CARS = ['#5B8DEF', '#4CC373', '#FFC93C', '#C77DFF'];
  const my = show(`${topbar(0, 0)}
    <div class="rail"></div><div class="station"><div class="st-sign">Stacja</div></div><div class="platform" id="plat"></div>
    <div class="train" id="train">
      <div class="tcar loco-wrap">${TRAIN_ART.loco}<div class="driver">${charHTML('pip')}</div></div>
      ${CARS.map((c, i) => `<div class="tcar">${TRAIN_ART.car(c)}<div class="seat" id="seat${i}"></div></div>`).join('')}
    </div>
    <button class="big-play song-play" id="sp" aria-label="Play">${ICON.play}</button>
    <div class="song-title">${song.e} ${song.title}</div>`);
  bindHome();
  M.stop(.5);
  const train = $('#train'), seats = CARS.map((c, i) => $('#seat' + i)), plat = $('#plat');
  seats[0].innerHTML = charHTML('fifi');                         // Fifi rides in the first carriage
  setTimeout(() => alive() && wait4(), 50);
  const riders = window.ANIMALS.map(a => a.emoji);
  let x = 0, speed = 0, target = 0, phase = 'in', stopT = 0, nextSeat = 1, raf = 0, playing = false, audio = null, smokeT = 0;
  const W = () => innerWidth, TW = () => train.getBoundingClientRect().width;
  const startX = () => W() + 20, stopX = () => W() * 0.5 - TW() * 0.12, endX = () => -TW() - 40;
  x = startX();
  let who = '';
  const wait4 = () => {                                        // the next passenger waits (and bounces) on the platform
    who = riders[Math.floor(Math.random() * riders.length)];
    plat.innerHTML = `<span class="waiting">${who}</span>`;
  };
  const board = () => {                                        // …and hops into the next free seat when the train stops
    const w = plat.querySelector('.waiting'); if (w) w.classList.add('hop');
    setTimeout(() => { if (!alive()) return;
      plat.innerHTML = ''; const seat = seats[nextSeat]; if (!seat) return;
      seat.innerHTML = `<span class="rider">${who}</span>`; nextSeat = nextSeat >= seats.length - 1 ? 1 : nextSeat + 1;
      if (nextSeat === 1) setTimeout(() => seats.slice(1).forEach(s => s.innerHTML = ''), 2500);   // everyone gets off after a full train
    }, 1300);
  };
  const alive = () => $('#train') === train;
  const puff = () => {
    const r = train.querySelector('.loco').getBoundingClientRect(), p = document.createElement('div');
    p.className = 'smoke'; p.style.left = (r.left + r.width * 0.25) + 'px'; p.style.top = (r.top + r.height * 0.08) + 'px';
    document.body.appendChild(p); setTimeout(() => p.remove(), 1800);
  };
  let last = performance.now();
  const step = now => {
    if (!alive()) { cancelAnimationFrame(raf); return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const cruise = W() * 0.22;
    if (phase === 'in' || phase === 'out') speed += (cruise - speed) * dt * 2;
    if (phase === 'in') { const d = x - stopX(); if (d < cruise * 0.9) speed = Math.max(20, cruise * d / (cruise * 0.9)); if (d <= 2) { phase = 'stop'; stopT = now; speed = 0; board(); } }
    if (phase === 'stop' && now - stopT > 2600) phase = 'out';
    if (phase === 'out' && x < endX()) { x = startX(); phase = 'in'; wait4(); }
    x -= speed * dt;
    train.style.transform = `translateX(${x}px)`;
    train.classList.toggle('moving', speed > 15);
    if (speed > 15 && now - smokeT > 380) { smokeT = now; puff(); }
    raf = requestAnimationFrame(step);
  };
  const stopAll = () => { playing = false; if (audio) audio.pause(); M.stop(.4); $('#sp') && ($('#sp').innerHTML = ICON.play); };
  const play = async () => {
    unlockAudio(); hush(); playing = true; $('#sp').innerHTML = '❚❚';
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    let ok = false;
    try { const r = await fetch(song.file, { method: 'HEAD', cache: 'no-cache' }); ok = r.ok; } catch (e) {}
    if (!alive() || !playing) return;
    if (ok) {                                                   // Kamil's recording
      if (!audio) { audio = new Audio(song.file); audio.onended = () => { stopAll(); cheer(); confettiSmall(); }; }
      audio.play().catch(() => {});
    } else M.play(song.fallback, .6, true);                    // until then: an original choo-choo tune
  };
  $('#sp').onclick = () => playing ? stopAll() : play();
  $('#again').onclick = () => { stopAll(); if (audio) audio.currentTime = 0; play(); };
  const leave = () => { if (audio) { audio.pause(); audio = null; } M.stop(.3); };
  $('#home').addEventListener('click', leave);
  raf = requestAnimationFrame(t => { last = t; step(t); });
  seq([['pip', 'pl', 'Jedzie pociąg! Ciuch, ciuch!'], ...(S.plOnly ? [] : [['fifi', 'en', "Choo choo! All aboard! Let's sing!"]])], my).then(ok => { if (ok && alive()) play(); });
}

function stickerBook() {
  const my = show(`${topbar(0, 0)}<div class="book">${window.STICKERS.map(s =>
    `<button class="slot ${S.stickers.includes(s) ? 'has' : ''}" data-s="${s}">${S.stickers.includes(s) ? s : ''}</button>`).join('')}</div>${chars()}`);
  bindHome();
  const n = S.stickers.length;
  const lines = n ? [['fifi', 'en', `Look, ${KID.en}! Your stickers!`], ['pip', 'pl', 'Twoje naklejki!']]
    : [['fifi', 'en', 'Play a game to win a sticker!'], ['pip', 'pl', 'Zagrajmy!']];
  seq(lines, my);
  $('#again').onclick = () => { hush(); seq(lines); };
  $$('.slot.has').forEach(b => b.onclick = () => { b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3) rotate(10deg)' }, { transform: 'scale(1)' }], { duration: 450 }); hush(); say('pip', 'pl', praisePL()); });
}

/* ---------- parent settings (hold the gear for 1.5 s) ---------- */
function parentGate(btn) {
  let timer = null;
  const startHold = e => { e.preventDefault(); btn.classList.add('holding'); timer = setTimeout(() => { btn.classList.remove('holding'); parentPanel(); }, 1500); };
  const endHold = () => { clearTimeout(timer); btn.classList.remove('holding'); };
  btn.addEventListener('pointerdown', startHold);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, endHold));
}
function voiceOptions(lang) {
  if (!hasTTS) return '<option>default</option>';
  const cur = VOICE[lang] ? VOICE[lang].name : '';
  const list = speechSynthesis.getVoices().filter(v => new RegExp('^' + lang, 'i').test(v.lang))
    .sort((a, b) => (/GB|PL/i.test(b.lang) - /GB|PL/i.test(a.lang)) || a.name.localeCompare(b.name));
  const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return list.map(v => `<option value="${esc(v.name)}" ${v.name === cur ? 'selected' : ''}>${esc(v.name)} (${v.lang})</option>`).join('') || '<option>default</option>';
}
function parentPanel() {
  hush(); pickVoices();
  const segBtn = (key, val, label) => `<button data-k="${key}" data-v="${val}" class="${String(S[key]) === String(val) ? 'on' : ''}">${label}</button>`;
  const el = document.createElement('div'); el.className = 'parent';
  el.innerHTML = `<div class="box"><h3>For grown-ups</h3>
    <div class="row"><div><b>Voices</b><div class="small">how high they sound</div></div>
      <div class="seg">${segBtn('voice', 'natural', 'Natural')}${segBtn('voice', 'cartoon', 'Cartoon')}${segBtn('voice', 'extra', 'Extra')}</div></div>
    <div class="row"><div><b>Fifi's voice</b><div class="small">English · pick a girl's voice</div></div>
      <div style="display:flex;gap:6px"><select id="ve" class="vsel">${voiceOptions('en')}</select><button class="pbtn" id="tf">▶</button></div></div>
    <div class="row"><div><b>Pip's voice</b><div class="small">Polish</div></div>
      <div style="display:flex;gap:6px"><select id="vp" class="vsel">${voiceOptions('pl')}</select><button class="pbtn" id="tp">▶</button></div></div>
    <div class="row"><div><b>Voices</b><div class="small">recorded Maisie &amp; Zofia: ${REC.have.size} pieces · missing: ${Object.keys(JSON.parse(localStorage.getItem(MISS_KEY) || '{}')).length}</div></div>
      <div class="seg">${segBtn('recVoices', 'true', 'Recorded')}${segBtn('recVoices', 'false', 'iPad')}</div></div>
    <div class="row"><div><b>Check her words</b><div class="small">${Recog.api ? (Recog.broken ? 'off for now' : 'uses iPad dictation') : 'not available in this app mode – try in Safari'} · last: ${String(Recog.info).replace(/</g, '&lt;')}</div></div>
      <div class="seg">${segBtn('checkWords', 'true', 'On')}${segBtn('checkWords', 'false', 'Off')}</div></div>
    <div class="row"><div><b>Language</b><div class="small">Polish only = test what she knows (just Pip asks)</div></div>
      <div class="seg">${segBtn('plOnly', 'false', 'Both')}${segBtn('plOnly', 'true', 'Polish only')}</div></div>
    <div class="row"><div><b>Music</b><div class="small">walk-in tune and menu music</div></div>
      <div class="seg">${segBtn('music', 'true', 'On')}${segBtn('music', 'false', 'Off')}</div></div>
    <div class="row"><div><b>Excited voices</b><div class="small">bouncy cheers, rising questions</div></div>
      <div class="seg">${segBtn('excite', 'true', 'On')}${segBtn('excite', 'false', 'Off')}</div></div>
    <div class="row"><div><b>Listen for her voice</b><div class="small">uses the microphone on "your turn"</div></div>
      <div class="seg">${segBtn('listen', 'true', 'On')}${segBtn('listen', 'false', 'Off')}</div></div>
    <div class="row"><div><b>Microphone sensitivity</b><div class="small">"High" if her voice is often missed</div></div>
      <div class="seg">${segBtn('sens', 'normal', 'Normal')}${segBtn('sens', 'high', 'High')}</div></div>
    <div class="row"><div><b>Her name</b><div class="small">English · Polish · Polish when calling her</div></div>
      <div style="display:flex;gap:6px"><input id="n1" value="${KID.en}" size="7"><input id="n2" value="${KID.pl}" size="7"><input id="n3" value="${KID.plCall}" size="7"></div></div>
    <div class="row"><div><b>Stickers</b><div class="small">${S.stickers.length} collected</div></div><button class="pbtn" id="rs">Reset</button></div>
    <div class="row" style="border:0"><button class="pbtn" id="tv">Test voices</button><button class="pbtn main" id="cl">Done</button></div></div>`;
  document.body.appendChild(el);
  $$('.seg button', el).forEach(b => b.onclick = () => {
    const k = b.dataset.k; S[k] = (k === 'listen' || k === 'excite' || k === 'music' || k === 'plOnly' || k === 'recVoices' || k === 'checkWords') ? b.dataset.v === 'true' : b.dataset.v; save();
    if (k === 'music') { M.on = S.music; if (!S.music) M.stop(.3); }
    $$(`.seg button[data-k="${k}"]`, el).forEach(x => x.classList.toggle('on', x === b));
  });
  $('#ve', el).onchange = e => { S.voiceEn = e.target.value; save(); pickVoices(); hush(); say('fifi', 'en', `Yay! Hello, ${$('#n1', el).value}! I'm Fifi!`); };
  $('#vp', el).onchange = e => { S.voicePl = e.target.value; save(); pickVoices(); hush(); say('pip', 'pl', `Hura! Cześć, ${$('#n3', el).value}! Jestem Pip!`); };
  $('#tf', el).onclick = () => { hush(); say('fifi', 'en', `Yay! Hello, ${$('#n1', el).value}! I'm Fifi!`); };
  $('#tp', el).onclick = () => { hush(); say('pip', 'pl', `Hura! Cześć, ${$('#n3', el).value}! Jestem Pip!`); };
  $('#tv', el).onclick = () => { seq([['fifi', 'en', `Hello, ${$('#n1', el).value}! Yay! Well done!`], ['pip', 'pl', `Cześć, ${$('#n3', el).value}! Hura! Brawo!`]]); };
  let armed = false;
  $('#rs', el).onclick = e => { if (!armed) { armed = true; e.target.textContent = 'Sure?'; return; } S.stickers = []; save(); e.target.textContent = 'Done'; };
  $('#cl', el).onclick = () => {
    KID.en = $('#n1', el).value.trim() || KID.en; KID.pl = $('#n2', el).value.trim() || KID.pl; KID.plCall = $('#n3', el).value.trim() || KID.plCall;
    S.kid = { en: KID.en, pl: KID.pl, plCall: KID.plCall }; save();
    el.remove(); home(false);
  };
}

/* ---------- boot ---------- */
window.PF = { lineId, pieces };
document.addEventListener('visibilitychange', () => {   // app in background → music pauses
  if (!AUDIO) return;
  try { document.hidden ? AUDIO.suspend() : AUDIO.resume(); } catch (e) {}
});
recPreload();
start();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
