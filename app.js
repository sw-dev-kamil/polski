/* =====================================================================
   Polski — Romanian → Polish learning app
   Plain JavaScript, no build step. Content lives in data/lessons.js.
   ===================================================================== */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const LESSONS = window.LESSONS || [];
const SOUNDS = window.SOUNDS || [];

/* ---------- word index ---------- */
const WORDS = {};
LESSONS.forEach(l => l.words.forEach(w => { WORDS[w.id] = Object.assign({}, w, { day: l.day }); }));
const SAY_BY_TEXT = {};
Object.values(WORDS).forEach(w => { if (w.say) SAY_BY_TEXT[norm(w.pl)] = w.say; });

/* ---------- icons ---------- */
const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};
const PRAISE = ['Bravo! 👏', 'Corect! ✨', 'Super! 🎉', 'Exact! 💪', 'Foarte bine! 🌟', 'Perfect! 🙌'];

/* ---------- storage ---------- */
const KEY = 'polski.v1';
const DEFAULTS = { done: {}, srs: {}, streak: { count: 0, last: null }, settings: { slow: false, tr: true }, stats: { spoken: 0 } };
let S = load();
function load() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  const s = JSON.parse(JSON.stringify(DEFAULTS));
  Object.assign(s, saved);
  s.settings = Object.assign({}, DEFAULTS.settings, saved.settings || {});
  s.stats = Object.assign({}, DEFAULTS.stats, saved.stats || {});
  return s;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------- dates & streak ---------- */
function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function today() { return ymd(new Date()); }
function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); }
function bumpStreak() {
  const t = today();
  if (S.streak.last === t) return;
  S.streak.count = S.streak.last === addDays(-1) ? S.streak.count + 1 : 1;
  S.streak.last = t;
}
function streakNow() { return (S.streak.last === today() || S.streak.last === addDays(-1)) ? S.streak.count : 0; }

/* ---------- spaced repetition (simple Leitner boxes) ---------- */
const INTERVALS = [0, 1, 2, 4, 7, 15, 30, 60]; // days per box
function learnWord(id) { if (!S.srs[id]) S.srs[id] = { box: 1, due: addDays(1) }; }
function grade(id, g) { // 0 = didn't know, 1 = hard, 2 = knew it
  const c = S.srs[id] || { box: 1 };
  if (g === 0) c.box = 1;
  if (g === 2) c.box = Math.min(c.box + 1, INTERVALS.length - 1);
  c.due = addDays(Math.max(1, INTERVALS[c.box]));
  S.srs[id] = c;
}
function dueIds(excludeDay) {
  const t = today();
  return Object.keys(S.srs).filter(id => WORDS[id] && S.srs[id].due <= t && WORDS[id].day !== excludeDay);
}

/* ---------- helpers ---------- */
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function norm(s) { return String(s).toLowerCase().replace(/[.,!?…;:"„”'()\-–—]/g, ' ').replace(/\s+/g, ' ').trim(); }
function stripDia(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l'); }
function toast(msg, ms = 2200) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), ms);
}
function confetti() {
  const colors = ['#DC3B41', '#FFFFFF', '#F5C542', '#2E9E62', '#0091FF', '#8E4EC6'];
  for (let i = 0; i < 46; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = pick(colors);
    c.style.animationDuration = 2 + Math.random() * 1.8 + 's';
    c.style.animationDelay = Math.random() * .4 + 's';
    c.style.boxShadow = '0 0 0 1px rgba(0,0,0,.05)';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4500);
  }
}
function haptic() { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} }

/* =====================================================================
   SPEECH: text-to-speech
   ===================================================================== */
let plVoice = null;
const hasTTS = 'speechSynthesis' in window;
function pickVoice() {
  if (!hasTTS) return;
  const vs = speechSynthesis.getVoices().filter(v => /^pl/i.test(v.lang));
  plVoice = vs.find(v => /enhanced|premium|ulepsz/i.test(v.name)) || vs.find(v => /zosia/i.test(v.name)) || vs[0] || null;
}
if (hasTTS) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

function speak(text, slow) {
  return new Promise(res => {
    if (!hasTTS) return res();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/…/g, ', '));
    u.lang = 'pl-PL';
    if (plVoice) u.voice = plVoice;
    u.rate = slow ? 0.55 : (S.settings.slow ? 0.78 : 0.92);
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    u.onend = fin; u.onerror = fin;
    speechSynthesis.speak(u);
    setTimeout(fin, 4000 + text.length * 180);
  });
}
function stopSpeaking() { if (hasTTS) speechSynthesis.cancel(); }

/* =====================================================================
   SPEECH: recognition (pronunciation check)
   ===================================================================== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let srBroken = false; // set when the browser refuses recognition, so we switch to recording mode
function listen() {
  return new Promise((resolve, reject) => {
    if (!SR || srBroken) return reject('unsupported');
    stopSpeaking();
    const r = new SR();
    r.lang = 'pl-PL'; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
    let got = false;
    r.onresult = e => {
      got = true;
      const res = e.results[0]; const alts = [];
      for (let i = 0; i < res.length; i++) alts.push(res[i].transcript);
      resolve(alts);
    };
    r.onerror = e => { if (!got) { got = true; reject(e.error || 'error'); } };
    r.onend = () => { if (!got) { got = true; reject('no-speech'); } };
    try { r.start(); } catch (err) { got = true; reject('start'); }
    setTimeout(() => { try { r.stop(); } catch (e) {} }, 7000);
  });
}

const DIGITS = { 0: 'zero', 1: 'jeden', 2: 'dwa', 3: 'trzy', 4: 'cztery', 5: 'pięć', 6: 'sześć', 7: 'siedem', 8: 'osiem', 9: 'dziewięć', 10: 'dziesięć', 12: 'dwanaście' };
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function similarity(a, b) { return 1 - lev(a, b) / (Math.max(a.length, b.length) || 1); }

/* Compare what was heard with the target, word by word.
   ok   = recognised exactly
   near = almost (small sound difference)
   miss = not recognised */
function scoreAttempt(target, alts) {
  const display = target.replace(/[.,!?…;:"„”()]/g, ' ').split(/\s+/).filter(Boolean);
  const tw = display.map(w => norm(w));
  let best = null;
  for (const alt of alts) {
    const hw = norm(alt).split(' ').filter(Boolean).map(t => DIGITS[t] || t);
    let total = 0;
    const res = tw.map((w, i) => {
      let st = 'miss', bestS = 0;
      for (const h of hw) {
        if (h === w) { st = 'ok'; break; }
        const s = stripDia(h) === stripDia(w) ? 0.9 : similarity(stripDia(h), stripDia(w));
        if (s > bestS) bestS = s;
      }
      if (st !== 'ok') st = bestS >= 0.7 ? 'near' : 'miss';
      total += st === 'ok' ? 1 : st === 'near' ? 0.5 : 0;
      return { w: display[i], st };
    });
    if (!best || total > best.total) best = { total, res, heard: alt };
  }
  best.ratio = best.total / tw.length;
  return best;
}

/* ---------- voice recorder (listen to yourself) ---------- */
const Rec = { mr: null, chunks: [], url: null, stream: null };
async function recStart() {
  Rec.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  Rec.chunks = [];
  Rec.mr = new MediaRecorder(Rec.stream);
  Rec.mr.ondataavailable = e => { if (e.data && e.data.size) Rec.chunks.push(e.data); };
  Rec.mr.start();
}
function recStop() {
  return new Promise(res => {
    if (!Rec.mr) return res(null);
    Rec.mr.onstop = () => {
      const blob = new Blob(Rec.chunks, { type: Rec.mr.mimeType || 'audio/mp4' });
      if (Rec.url) URL.revokeObjectURL(Rec.url);
      Rec.url = URL.createObjectURL(blob);
      Rec.stream.getTracks().forEach(t => t.stop());
      Rec.mr = null; res(Rec.url);
    };
    Rec.mr.stop();
  });
}
function recCancel() { if (Rec.mr) { try { Rec.mr.stop(); Rec.stream.getTracks().forEach(t => t.stop()); } catch (e) {} Rec.mr = null; } }

/* ---------- reusable "say it" widget ---------- */
function speakWidget(el, target, opts = {}) {
  const say = opts.say !== undefined ? opts.say : SAY_BY_TEXT[norm(target)];
  const useSR = !!SR && !srBroken;
  el.innerHTML = `
    <div class="card speak-card">
      <div class="pl">${target}</div>
      ${say ? `<div class="say">„${say}”</div>` : ''}
      ${opts.tr ? `<div class="muted" style="margin-top:8px">${opts.tr}</div>` : ''}
      <div class="mic-wrap">
        <button class="icon-btn" data-a="play" aria-label="Ascultă">${ICON.play}</button>
        <button class="mic" data-a="mic" aria-label="Vorbește">${useSR ? ICON.mic : ICON.mic}</button>
        <button class="icon-btn" data-a="slow" aria-label="Ascultă rar">🐢</button>
      </div>
      <div class="muted small" data-r="hint">${useSR ? 'Ascultă, apoi apasă microfonul și spune cu voce tare' : 'Ascultă, apoi înregistrează-te și compară'}</div>
      <div data-r="out"></div>
      <div class="rec-row" data-r="recrow" ${useSR ? '' : 'hidden'}>
        <button class="chip" data-a="rec">⏺ Înregistrează-te</button>
        <button class="chip" data-a="me" hidden>▶ Ascultă-te</button>
      </div>
    </div>`;
  if (Rec.url) { URL.revokeObjectURL(Rec.url); Rec.url = null; }
  const out = $('[data-r="out"]', el), hint = $('[data-r="hint"]', el), mic = $('[data-a="mic"]', el);
  let busy = false, recording = false;

  $('[data-a="play"]', el).onclick = () => speak(target);
  $('[data-a="slow"]', el).onclick = () => speak(target, true);

  async function toggleRecord(btn, isMic) {
    if (!recording) {
      try { stopSpeaking(); await recStart(); } catch (e) { hint.textContent = 'Permite accesul la microfon ca să te poți înregistra.'; return; }
      recording = true;
      if (isMic) { mic.classList.add('listening'); mic.innerHTML = ICON.stop; hint.textContent = 'Vorbește… apasă din nou când ai terminat'; }
      else btn.textContent = '⏹ Stop';
    } else {
      recording = false;
      await recStop();
      if (isMic) { mic.classList.remove('listening'); mic.innerHTML = ICON.mic; }
      else btn.textContent = '⏺ Înregistrează-te';
      hint.textContent = 'Compară: ascultă modelul, apoi pe tine.';
      if (isMic) out.innerHTML = `<div class="rec-row"><button class="btn soft" data-a="model2">▶ Model</button><button class="btn ghost" data-a="me2">▶ Tu</button></div>`;
      const meBtn = $('[data-a="me"]', el); if (meBtn) meBtn.hidden = false;
      $$('[data-a="me2"],[data-a="me"]', el).forEach(b => b.onclick = () => Rec.url && new Audio(Rec.url).play());
      $$('[data-a="model2"]', el).forEach(b => b.onclick = () => speak(target));
      S.stats.spoken++; save();
      opts.onResult && opts.onResult(null);
    }
  }

  mic.onclick = async () => {
    haptic();
    if (!SR || srBroken) return toggleRecord(null, true);
    if (busy) return;
    busy = true; mic.classList.add('listening'); hint.textContent = 'Te ascult…'; out.innerHTML = '';
    try {
      const alts = await listen();
      const r = scoreAttempt(target, alts);
      const msg = r.ratio >= 0.999 ? `<div class="feedback good">${pick(PRAISE)} Am înțeles perfect.</div>`
        : r.ratio >= 0.6 ? `<div class="feedback warn">Aproape! Ascultă cuvintele galbene/roșii și mai încearcă.</div>`
        : `<div class="feedback bad">Mai încearcă — ascultă întâi rar 🐢</div>`;
      out.innerHTML = `<div class="result-words">${r.res.map(x => `<span class="wtag ${x.st}">${x.w}</span>`).join('')}</div>
        <div class="heard">Am auzit: „${r.heard}”</div>${msg}`;
      hint.textContent = 'Apasă din nou ca să mai încerci';
      S.stats.spoken++; save();
      opts.onResult && opts.onResult(r.ratio);
    } catch (err) {
      if (err === 'no-speech' || err === 'aborted') {
        hint.textContent = 'N-am auzit nimic. Mai încearcă, puțin mai tare.';
      } else if (err === 'not-allowed') {
        hint.textContent = 'Permite accesul la microfon și la recunoașterea vocală pentru această aplicație.';
      } else {
        // recognition not available here → switch to record & compare
        srBroken = true;
        mic.classList.remove('listening'); busy = false;
        hint.textContent = 'Verificarea automată nu merge aici. Apasă microfonul, înregistrează-te și compară cu modelul.';
        $('[data-r="recrow"]', el).hidden = true;
        return;
      }
    }
    mic.classList.remove('listening'); busy = false;
  };

  const recBtn = $('[data-a="rec"]', el);
  if (recBtn) recBtn.onclick = () => toggleRecord(recBtn, false);
}

/* =====================================================================
   NAVIGATION
   ===================================================================== */
let tab = 'home';
let L = null; // current lesson state
let token = 0; // invalidates async playback when the screen changes

$$('#tabbar button').forEach(b => b.onclick = () => { haptic(); setTab(b.dataset.tab); });
function setTab(t) {
  tab = t; token++; stopSpeaking();
  $$('#tabbar button').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  document.body.classList.remove('in-lesson');
  window.scrollTo(0, 0);
  ({ home: renderHome, lessons: renderLessons, words: renderWords, sounds: renderSounds, settings: renderSettings })[t]();
}

function lessonMinutes(l) { return Math.round(l.words.length * 1.8 + 12 + 8 + (l.grammar ? 8 : 0)); }
function isUnlocked(l) { return l.day === 1 || !!S.done[l.day - 1]; }

/* ---------- HOME ---------- */
function renderHome() {
  const h = new Date().getHours();
  const greet = h < 18 ? 'Dzień dobry!' : 'Dobry wieczór!';
  const greetRo = h < 18 ? 'Bună ziua!' : 'Bună seara!';
  const next = LESSONS.find(l => !S.done[l.day]);
  const doneToday = Object.values(S.done).includes(today());
  const due = dueIds().length;
  const learned = Object.keys(S.srs).length;
  const doneCount = Object.keys(S.done).length;

  let hero;
  if (!next) {
    hero = `<div class="hero" style="--c:#2E9E62"><div class="big-emoji">🏆</div>
      <div class="eyebrow">Felicitări</div><h2>Săptămâna 1 terminată!</h2>
      <p>Continuă cu recapitularea zilnică. Lecții noi vin în curând.</p></div>`;
  } else if (doneToday) {
    hero = `<div class="hero" style="--c:#2E9E62"><div class="big-emoji">🎉</div>
      <div class="eyebrow">Gata pe azi</div><h2>Bravo!</h2>
      <p>Revino mâine pentru Ziua ${next.day} — sau continuă acum dacă ai chef.</p>
      <button class="btn press" data-start="${next.day}">Continuă cu Ziua ${next.day}</button></div>`;
  } else {
    hero = `<div class="hero" style="--c:${next.color}"><div class="big-emoji">${next.emoji}</div>
      <div class="eyebrow">Lecția de azi · Ziua ${next.day}</div><h2>${next.title}</h2>
      <p>${next.subtitle} · ~${lessonMinutes(next)} min</p>
      <button class="btn press" data-start="${next.day}">Începe</button></div>`;
  }

  // phrase of the day: from learned words, else from day 1
  const pool = learned ? Object.keys(S.srs).map(id => WORDS[id]).filter(Boolean) : LESSONS[0].words;
  const dayNum = Math.floor(Date.now() / 864e5);
  const phrase = pool[dayNum % pool.length];

  app.innerHTML = `<div class="page">
    <div class="top-row">
      <div><div class="eyebrow">${greetRo}</div><h1>${greet}</h1></div>
      <button class="gear press" id="gear" aria-label="Setări">${ICON.gear}</button>
    </div>
    ${hero}
    <div class="stats">
      <div class="stat"><b>${streakNow()}🔥</b><span>zile la rând</span></div>
      <div class="stat"><b>${learned}</b><span>cuvinte</span></div>
      <div class="stat"><b>${doneCount}/${LESSONS.length}</b><span>lecții</span></div>
    </div>
    ${due ? `<button class="list-item press" id="review" style="--c:#0091FF">
        <div class="badge">🔁</div><div class="grow"><h3>Recapitulare</h3>
        <div class="sub">${due} ${due === 1 ? 'cuvânt te așteaptă' : 'cuvinte te așteaptă'}</div></div><span class="muted">›</span></button>`
      : (learned ? `<div class="list-item" style="--c:#2E9E62"><div class="badge">✓</div><div class="grow"><h3>Recapitulare</h3><div class="sub">Nimic de repetat acum</div></div></div>` : '')}
    ${(() => {
      const lastDone = LESSONS.filter(l => S.done[l.day] && (window.PARTNER || {})[l.day]).pop();
      return lastDone ? `<button class="list-item press" id="duoHome" data-d="${lastDone.day}" style="--c:#8E4EC6">
        <div class="badge">👫</div><div class="grow"><h3>Exersează în doi</h3>
        <div class="sub">Ziua ${lastDone.day} · ${lastDone.title} — 5 minute cu partenerul</div></div><span class="muted">›</span></button>` : '';
    })()}
    <h2>Fraza zilei</h2>
    <div class="card" style="display:flex;align-items:center;gap:14px">
      <button class="icon-btn accent" id="potd">${ICON.play}</button>
      <div class="grow"><div style="font-size:20px;font-weight:700">${phrase.pl}</div>
      <div class="muted">${phrase.ro}${phrase.say ? ` · <i>„${phrase.say}”</i>` : ''}</div></div>
    </div>
    <div id="voiceTip"></div>
  </div>`;

  $$('[data-start]').forEach(b => b.onclick = () => startLesson(+b.dataset.start));
  const rv = $('#review'); if (rv) rv.onclick = startReview;
  const dh = $('#duoHome'); if (dh) dh.onclick = () => startPartner(+dh.dataset.d);
  $('#potd').onclick = () => speak(phrase.pl);
  $('#gear').onclick = () => setTab('settings');

  setTimeout(() => {
    pickVoice();
    const tip = $('#voiceTip');
    if (tip && hasTTS && !plVoice) tip.innerHTML = `<div class="card small"><b>💡 Sfat:</b> pentru o voce poloneză mai bună, pe iPhone mergi la
      <i>Configurări → Accesibilitate → Conținut vorbit → Voci → Polonă</i> și descarcă vocea „Zosia (îmbunătățită)”.</div>`;
  }, 900);
}

/* ---------- LESSONS LIST ---------- */
function renderLessons() {
  app.innerHTML = `<div class="page"><div class="eyebrow">Săptămâna 1</div><h1>Lecții</h1>
    ${LESSONS.map(l => {
      const open = isUnlocked(l), done = !!S.done[l.day];
      return `<button class="list-item press ${open ? '' : 'locked'}" data-day="${l.day}" style="--c:${l.color}">
        <div class="badge">${open ? l.emoji : '🔒'}</div>
        <div class="grow"><div class="eyebrow" style="font-size:11px">Ziua ${l.day}${l.grammar ? ' · gramatică' : ''}</div>
        <h3>${l.title}</h3><div class="sub">${l.subtitle}</div></div>
        ${done ? '<div class="check">✓</div>' : `<span class="muted small">${lessonMinutes(l)}′</span>`}
      </button>`;
    }).join('')}
    <p class="muted small" style="text-align:center;margin-top:18px">Recomandare: o lecție pe zi + recapitularea. Lecțiile terminate pot fi refăcute oricând.</p>
  </div>`;
  $$('[data-day]').forEach(b => b.onclick = () => {
    const l = LESSONS.find(x => x.day === +b.dataset.day);
    if (!isUnlocked(l)) return toast('Termină mai întâi Ziua ' + (l.day - 1));
    startLesson(l.day);
  });
}

/* ---------- WORDS ---------- */
function renderWords(filter = '') {
  const f = norm(filter);
  const groups = LESSONS.map(l => {
    const ws = l.words.filter(w => !f || norm(w.pl).includes(f) || norm(w.ro).includes(f) || stripDia(norm(w.pl)).includes(stripDia(f)));
    if (!ws.length) return '';
    return `<h2 style="font-size:17px">${l.emoji} Ziua ${l.day} · ${l.title}</h2><div class="card" style="padding:4px 14px">
      ${ws.map(w => {
        const c = S.srs[w.id]; const lvl = c ? Math.min(5, c.box) : 0;
        return `<div class="word-row"><button class="icon-btn" data-say="${w.id}">${ICON.play}</button>
          <div class="grow"><div class="pl">${w.pl}</div><div class="ro">${w.ro}</div></div>
          <div class="lvl" title="nivel">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('')}</div></div>`;
      }).join('')}</div>`;
  }).join('');
  const first = !$('#q');
  if (first || tab !== 'words') {
    app.innerHTML = `<div class="page"><div class="eyebrow">${Object.keys(S.srs).length} învățate</div><h1>Cuvinte</h1>
      <input id="q" class="search" placeholder="Caută în română sau poloneză" autocomplete="off" value="${filter}"><div id="wl"></div></div>`;
    $('#q').oninput = e => renderWords(e.target.value);
  }
  $('#wl').innerHTML = groups || '<p class="muted">Nimic găsit.</p>';
  $$('[data-say]').forEach(b => b.onclick = () => speak(WORDS[b.dataset.say].pl));
}

/* ---------- SOUNDS ---------- */
function renderSounds() {
  app.innerHTML = `<div class="page"><div class="eyebrow">Ghid de pronunție</div><h1>Sunete</h1>
    <p class="muted" style="margin-top:-6px">Polona se citește aproape cum se scrie. Atinge o literă ca să auzi un exemplu.</p>
    <div class="sound-grid">${SOUNDS.map((s, i) => `<button class="sound press" data-i="${i}">
      <div class="l">${s.pl}</div><div class="r">≈ ${s.ro}</div><div class="e">${s.ex} · ${s.exRo}</div></button>`).join('')}</div>
    <div class="card" style="margin-top:14px"><b>Accent:</b> aproape mereu pe <b>penultima silabă</b> — dzię<b>ku</b>ję, prze<b>pra</b>szam, przed<b>szko</b>le.</div>
  </div>`;
  $$('.sound').forEach(b => b.onclick = () => speak(SOUNDS[+b.dataset.i].ex, true));
}

/* ---------- SETTINGS ---------- */
function renderSettings() {
  pickVoice();
  app.innerHTML = `<div class="page">
    <button class="chip" id="back">‹ Înapoi</button>
    <h1 style="margin-top:14px">Setări</h1>
    <div class="card">
      <div class="setting"><div><b>Viteza vocii</b><div class="muted small">pentru toate frazele</div></div>
        <div class="seg"><button data-s="0" class="${S.settings.slow ? '' : 'on'}">Normal</button><button data-s="1" class="${S.settings.slow ? 'on' : ''}">Mai rar</button></div></div>
      <div class="setting"><div><b>Traducere în dialoguri</b></div>
        <div class="seg"><button data-t="1" class="${S.settings.tr ? 'on' : ''}">Da</button><button data-t="0" class="${S.settings.tr ? '' : 'on'}">Nu</button></div></div>
      <div class="setting"><div><b>Vocea</b><div class="muted small">${plVoice ? plVoice.name : 'voce implicită'}</div></div>
        <button class="btn soft" id="test" style="height:40px">Test</button></div>
      <div class="setting"><div><b>Verificare pronunție</b><div class="muted small">${SR && !srBroken ? 'disponibilă' : 'înregistrare și comparare'}</div></div></div>
    </div>
    <div class="card"><div class="setting"><div><b>Șterge progresul</b><div class="muted small">începi de la Ziua 1</div></div>
      <button class="btn ghost" id="reset" style="height:40px;color:var(--bad)">Șterge</button></div></div>
    <p class="muted small" style="text-align:center">Polski · v2 · progresul e salvat doar pe acest telefon</p>
  </div>`;
  $('#back').onclick = () => setTab('home');
  $$('[data-s]').forEach(b => b.onclick = () => { S.settings.slow = b.dataset.s === '1'; save(); renderSettings(); });
  $$('[data-t]').forEach(b => b.onclick = () => { S.settings.tr = b.dataset.t === '1'; save(); renderSettings(); });
  $('#test').onclick = () => speak('Dzień dobry! Jak się masz?');
  let armed = false;
  $('#reset').onclick = e => {
    if (!armed) { armed = true; e.target.textContent = 'Sigur?'; setTimeout(() => { armed = false; if (e.target.isConnected) e.target.textContent = 'Șterge'; }, 3000); return; }
    S = JSON.parse(JSON.stringify(DEFAULTS)); save(); toast('Progres șters'); setTab('home');
  };
}

/* =====================================================================
   LESSON ENGINE
   ===================================================================== */
function startLesson(day) {
  const les = LESSONS.find(l => l.day === day);
  const steps = [];
  const due = shuffle(dueIds(day)).slice(0, 20);
  if (due.length) steps.push({ type: 'review', ids: due });
  steps.push({ type: 'learn' }, { type: 'quiz' }, { type: 'dialogue' }, { type: 'pronounce' });
  if (les.grammar) steps.push({ type: 'grammar' });
  L = { les, steps, si: 0, mode: 'lesson', scores: [] };
  enterLesson();
}
function startReview() {
  const ids = shuffle(dueIds()).slice(0, 30);
  if (!ids.length) return toast('Nimic de repetat acum');
  L = { les: null, steps: [{ type: 'review', ids }], si: 0, mode: 'review', scores: [] };
  enterLesson();
}
function enterLesson() { document.body.classList.add('in-lesson'); token++; runStep(); }
function exitLesson() { token++; stopSpeaking(); recCancel(); L = null; setTab(tab === 'settings' ? 'home' : tab); }
function runStep() {
  token++; stopSpeaking(); recCancel(); window.scrollTo(0, 0);
  if (L.si >= L.steps.length) return finish();
  const st = L.steps[L.si];
  STEPS[st.type](st);
}
function nextStep() { L.si++; runStep(); }
function shell(label, inner, frac = 0) {
  const p = ((L.si + frac) / L.steps.length) * 100;
  app.innerHTML = `<div class="lesson-top"><button class="close-btn" id="x" aria-label="Închide">✕</button>
    <div class="progress"><i style="width:${p}%"></i></div></div>
    <div class="slide-in"><div class="step-label">${label}</div>${inner}</div>`;
  $('#x').onclick = exitLesson;
}

const STEPS = {
  /* ---- review due words (flip cards) ---- */
  review(st) {
    if (!st.q) { st.q = st.ids.slice(); st.n = 0; st.total = st.q.length; st.again = []; }
    if (!st.q.length) return nextStep();
    const id = st.q[0], w = WORDS[id];
    shell('Recapitulare', `
      <div class="card flash">
        <div class="emoji">${w.emoji || '💬'}</div>
        <div style="font-size:26px;font-weight:700">${w.ro}</div>
        <div id="ans" class="hidden-answer" style="margin-top:20px"><div class="pl">${w.pl}</div>${w.say ? `<div class="say">„${w.say}”</div>` : ''}</div>
        <div class="reveal-hint" id="hint">Spune-l cu voce tare în poloneză, apoi verifică.</div>
      </div>
      <div class="footer-actions" id="fa"><button class="btn block" id="show">Arată răspunsul</button></div>`, st.n / st.total);
    $('#show').onclick = () => {
      $('#ans').classList.remove('hidden-answer'); $('#hint').remove(); speak(w.pl);
      $('#ans').onclick = () => speak(w.pl);
      $('#fa').innerHTML = `<div class="btn-row"><button class="btn ghost" data-g="0">Nu știam</button>
        <button class="btn ghost" data-g="1">Greu</button><button class="btn good" data-g="2">Știam</button></div>`;
      $$('[data-g]').forEach(b => b.onclick = () => {
        haptic();
        const g = +b.dataset.g; grade(id, g); save();
        st.q.shift(); st.n++;
        if (g === 0 && !st.again.includes(id)) { st.again.push(id); st.q.push(id); st.total++; }
        STEPS.review(st);
      });
    };
  },

  /* ---- new words, one card at a time ---- */
  learn(st) {
    const ws = L.les.words;
    st.i = st.i || 0;
    if (st.i >= ws.length) return nextStep();
    const w = ws[st.i];
    learnWord(w.id); save();
    shell(`Cuvinte noi · ${st.i + 1}/${ws.length}`, `
      <div class="card flash">
        <div class="emoji">${w.emoji || '💬'}</div>
        <div class="pl">${w.pl}</div>
        ${w.say ? `<div class="say">„${w.say}”</div>` : ''}
        <div class="ro">${w.ro}</div>
        <div class="audio-row"><button class="icon-btn accent" id="p">${ICON.play}</button><button class="icon-btn" id="ps">🐢</button></div>
      </div>
      <div class="muted small" style="text-align:center">Ascultă și repetă cu voce tare de 2–3 ori.</div>
      <div class="footer-actions"><div class="btn-row">
        ${st.i > 0 ? '<button class="btn ghost" id="prev" style="flex:.4">‹</button>' : ''}
        <button class="btn" id="next">${st.i === ws.length - 1 ? 'Gata, la exerciții' : 'Următorul'}</button></div></div>`, st.i / ws.length);
    const my = token;
    setTimeout(() => { if (my === token) speak(w.pl); }, 350);
    $('#p').onclick = () => speak(w.pl);
    $('#ps').onclick = () => speak(w.pl, true);
    $('#next').onclick = () => { haptic(); st.i++; token++; STEPS.learn(st); };
    const pv = $('#prev'); if (pv) pv.onclick = () => { st.i--; token++; STEPS.learn(st); };
  },

  /* ---- multiple-choice practice of today's words ---- */
  quiz(st) {
    if (!st.q) { st.q = shuffle(L.les.words).map((w, i) => ({ w, t: i % 2 })); st.total = st.q.length; st.n = 0; }
    if (!st.q.length) return nextStep();
    const { w, t } = st.q[0];
    const others = shuffle(L.les.words.filter(x => x.id !== w.id)).slice(0, 3);
    const opts = shuffle([w, ...others]);
    const prompt = t === 0
      ? `<div class="muted">Cum spui în poloneză?</div><div class="question">${w.emoji || ''} ${w.ro}</div>`
      : `<div class="muted">Ce înseamnă?</div><div class="question" style="display:flex;align-items:center;gap:14px"><button class="icon-btn accent" id="pp">${ICON.play}</button><span>${w.pl}</span></div>`;
    shell('Exercițiu', `${prompt}
      <div class="options">${opts.map(o => `<button class="option" data-id="${o.id}">${t === 0 ? o.pl : o.ro}</button>`).join('')}</div>
      <div id="fb"></div><div class="footer-actions" id="fa"></div>`, st.n / st.total);
    if (t === 1) { const my = token; setTimeout(() => { if (my === token) speak(w.pl); }, 300); $('#pp').onclick = () => speak(w.pl); }
    let answered = false;
    $$('.option').forEach(b => b.onclick = () => {
      if (answered) return; answered = true; haptic();
      const ok = b.dataset.id === w.id;
      b.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) $(`.option[data-id="${w.id}"]`).classList.add('correct');
      speak(w.pl);
      $('#fb').innerHTML = ok ? `<div class="feedback good">${pick(PRAISE)}</div>`
        : `<div class="feedback bad">Corect: <b>${w.pl}</b> — ${w.ro}. Revine la final.</div>`;
      st.q.shift(); st.n++;
      if (!ok) { st.q.push({ w, t }); st.total++; }
      L.scores.push(ok ? 1 : 0);
      $('#fa').innerHTML = `<button class="btn block" id="nx">Continuă</button>`;
      $('#nx').onclick = () => STEPS.quiz(st);
    });
  },

  /* ---- dialogue: listen, then play your role ---- */
  dialogue(st) {
    const d = L.les.dialogue;
    if (st.phase === 'role') return STEPS.role(st);
    const tr = S.settings.tr;
    shell('Dialog', `
      <h2 style="margin-top:0">${d.title}</h2>
      <div class="toggle-row"><button class="chip ${tr ? 'on' : ''}" id="trt">Traducere</button>
        <button class="chip" id="all">▶ Ascultă tot</button><button class="chip" id="allslow">🐢 Rar</button></div>
      <div class="chat">${d.lines.map((ln, i) => `<button class="bubble ${ln.me ? 'me' : ''}" data-i="${i}">
        <div class="who">${ln.who}</div><div class="pl">${ln.pl}</div>${tr ? `<div class="tr">${ln.ro}</div>` : ''}</button>`).join('')}</div>
      <p class="muted small" style="text-align:center">Atinge o replică s-o asculți. Replicile roșii sunt ale tale.</p>
      <div class="footer-actions"><button class="btn block" id="go">Joacă rolul tău →</button></div>`, 0.1);
    $('#trt').onclick = () => { S.settings.tr = !S.settings.tr; save(); STEPS.dialogue(st); };
    const playAll = async slow => {
      const my = ++token;
      for (const b of $$('.bubble')) {
        if (my !== token) return;
        $$('.bubble').forEach(x => x.classList.remove('playing'));
        b.classList.add('playing'); b.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await speak(d.lines[+b.dataset.i].pl, slow);
        await new Promise(r => setTimeout(r, 350));
      }
      $$('.bubble').forEach(x => x.classList.remove('playing'));
    };
    $('#all').onclick = () => playAll(false);
    $('#allslow').onclick = () => playAll(true);
    $$('.bubble').forEach(b => b.onclick = () => { token++; $$('.bubble').forEach(x => x.classList.remove('playing')); b.classList.add('playing'); speak(d.lines[+b.dataset.i].pl).then(() => b.classList.remove('playing')); });
    $('#go').onclick = () => { st.phase = 'role'; st.ri = 0; runStepKeep(st); };
  },
  role(st) {
    const d = L.les.dialogue, lines = d.lines;
    if (st.ri >= lines.length) return nextStep();
    const ln = lines[st.ri];
    const hist = lines.slice(0, st.ri).map(x => `<div class="bubble ${x.me ? 'me' : ''}" style="animation:none"><div class="who">${x.who}</div><div class="pl">${x.pl}</div></div>`).join('');
    const frac = 0.3 + 0.7 * (st.ri / lines.length);
    if (!ln.me) {
      shell('Rolul tău', `<h2 style="margin-top:0">${d.title}</h2><div class="chat">${hist}
        <div class="bubble playing"><div class="who">${ln.who}</div><div class="pl">${ln.pl}</div>${S.settings.tr ? `<div class="tr">${ln.ro}</div>` : ''}</div></div>
        <div class="footer-actions"><div class="btn-row"><button class="btn ghost" id="rep">↻ Din nou</button><button class="btn" id="nx">Continuă</button></div></div>`, frac);
      const my = token;
      setTimeout(() => { if (my === token) speak(ln.pl); }, 300);
      $('#rep').onclick = () => speak(ln.pl);
      $('#nx').onclick = () => { st.ri++; runStepKeep(st); };
    } else {
      shell('Rolul tău', `<h2 style="margin-top:0">${d.title}</h2><div class="chat">${hist}</div>
        <div class="muted small" style="margin:14px 0 8px">Rândul tău — spune:</div><div id="sw"></div>
        <div class="footer-actions"><button class="btn block" id="nx">Mai departe</button></div>`, frac);
      speakWidget($('#sw'), ln.pl, { tr: ln.ro });
      $('#nx').onclick = () => { st.ri++; runStepKeep(st); };
      setTimeout(() => { const c = $('.chat'); if (c && c.lastElementChild) c.lastElementChild.scrollIntoView({ block: 'center' }); }, 50);
    }
  },

  /* ---- pronunciation drill ---- */
  pronounce(st) {
    const items = L.les.pronounce;
    st.i = st.i || 0;
    if (st.i >= items.length) return nextStep();
    const target = items[st.i];
    const w = Object.values(WORDS).find(x => norm(x.pl) === norm(target));
    shell(`Pronunție · ${st.i + 1}/${items.length}`, `<div id="sw"></div>
      <div class="footer-actions"><div class="btn-row"><button class="btn ghost" id="skip">Sari peste</button><button class="btn" id="nx">Următorul</button></div></div>`, st.i / items.length);
    let best = null;
    speakWidget($('#sw'), target, { tr: w ? w.ro : '', onResult: r => { if (r !== null) best = Math.max(best || 0, r); } });
    const my = token; setTimeout(() => { if (my === token) speak(target); }, 350);
    const go = () => { if (best !== null) L.scores.push(best); st.i++; runStepKeep(st); };
    $('#nx').onclick = go; $('#skip').onclick = go;
  },

  /* ---- grammar bite + mini quiz ---- */
  grammar(st) {
    const g = L.les.grammar;
    if (!st.phase) {
      shell('Gramatică', `<h2 style="margin-top:0">${g.title}</h2><div class="card grammar">${g.html}</div>
        <div class="footer-actions"><button class="btn block" id="nx">Am înțeles — exercițiu</button></div>`, 0.2);
      $('#nx').onclick = () => { st.phase = 'quiz'; st.qi = 0; runStepKeep(st); };
      return;
    }
    if (st.qi >= g.quiz.length) return nextStep();
    const q = g.quiz[st.qi];
    shell('Gramatică · exercițiu', `<div class="question">${q.q}</div>
      <div class="options">${q.options.map((o, i) => `<button class="option" data-i="${i}">${o}</button>`).join('')}</div>
      <div id="fb"></div><div class="footer-actions" id="fa"></div>`, 0.4 + 0.6 * (st.qi / g.quiz.length));
    let answered = false;
    $$('.option').forEach(b => b.onclick = () => {
      if (answered) return; answered = true; haptic();
      const ok = +b.dataset.i === q.answer;
      b.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) $(`.option[data-i="${q.answer}"]`).classList.add('correct');
      $('#fb').innerHTML = ok ? `<div class="feedback good">${pick(PRAISE)}</div>` : `<div class="feedback bad">Răspuns corect: <b>${q.options[q.answer]}</b></div>`;
      L.scores.push(ok ? 1 : 0);
      $('#fa').innerHTML = `<button class="btn block" id="nx">Continuă</button>`;
      $('#nx').onclick = () => { st.qi++; runStepKeep(st); };
    });
  }
};
// re-render the current step without resetting it
function runStepKeep(st) { token++; stopSpeaking(); recCancel(); window.scrollTo(0, 0); STEPS[st.type](st); }

function finish() {
  const score = L.scores.length ? Math.round(100 * L.scores.reduce((a, b) => a + b, 0) / L.scores.length) : null;
  if (L.mode === 'lesson') S.done[L.les.day] = S.done[L.les.day] || today();
  bumpStreak(); save();
  const isLesson = L.mode === 'lesson';
  const next = isLesson ? LESSONS.find(l => l.day === L.les.day + 1) : null;
  app.innerHTML = `<div class="done page">
    <div class="trophy">${isLesson ? '🏆' : '✅'}</div>
    <h1 style="margin-top:12px">${isLesson ? `Ziua ${L.les.day} terminată!` : 'Recapitulare gata!'}</h1>
    <p class="muted">${isLesson ? 'Wspaniale! — <i>Minunat!</i>' : 'Cuvintele revin exact când e nevoie.'}</p>
    <div class="stats" style="margin-top:24px">
      <div class="stat"><b>${streakNow()}🔥</b><span>zile la rând</span></div>
      <div class="stat"><b>${Object.keys(S.srs).length}</b><span>cuvinte</span></div>
      <div class="stat"><b>${score === null ? '—' : score + '%'}</b><span>scor</span></div>
    </div>
    ${next ? `<p class="muted small">Mâine: <b>${next.emoji} ${next.title}</b></p>` : ''}
    <div class="footer-actions">
      ${isLesson && (window.PARTNER || {})[L.les.day] ? `<button class="btn block soft" id="duo" style="margin-bottom:10px">👫 Exersează în doi</button>` : ''}
      <button class="btn block" id="home">Înapoi acasă</button></div>
  </div>`;
  const duo = $('#duo'); if (duo) { const d = L.les.day; duo.onclick = () => { L = null; startPartner(d); }; }
  confetti();
  speak(isLesson ? 'Wspaniale!' : 'Bardzo dobrze!');
  $('#home').onclick = () => { L = null; setTab('home'); };
}

/* ---------- PRACTICE TOGETHER ---------- */
function startPartner(day) {
  const items = (window.PARTNER || {})[day];
  if (!items) return;
  const les = LESSONS.find(l => l.day === day);
  document.body.classList.add('in-lesson'); token++; stopSpeaking(); window.scrollTo(0, 0);
  app.innerHTML = `<div class="page">
    <div class="lesson-top"><button class="close-btn" id="x" aria-label="Închide">✕</button>
      <div class="grow" style="flex:1;font-weight:700">👫 Exersează în doi · Ziua ${day}</div></div>
    <div class="card small" style="background:var(--accent-soft)">
      <div><b>🇷🇴 Pentru tine:</b> partenerul citește întrebarea în poloneză. Răspunde fără să te uiți la răspuns, apoi verifică.</div>
      <div style="margin-top:8px"><b>🇵🇱 Dla partnera:</b> mów powoli i naturalnie, chwal każdą próbę i poprawiaj najwyżej jeden błąd naraz. Potem zamieńcie się rolami.</div>
    </div>
    <h2 style="margin-top:18px">${les.emoji} ${les.title}</h2>
    ${items.map((it, i) => `<div class="card">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="icon-btn" data-p="${i}" aria-label="Ascultă">${ICON.play}</button>
        <div class="grow" style="flex:1"><div style="font-size:20px;font-weight:700">${it.q}</div><div class="muted">${it.ro}</div></div>
      </div>
      <button class="chip" data-r="${i}" style="margin-top:12px">Arată un răspuns bun</button>
      <div data-a="${i}" hidden class="feedback good" style="margin-top:10px">${it.a}</div>
    </div>`).join('')}
    <div class="footer-actions"><button class="btn block" id="done">Gata</button></div>
  </div>`;
  const leave = () => { token++; stopSpeaking(); setTab('home'); };
  $('#x').onclick = leave; $('#done').onclick = () => { bumpStreak(); save(); leave(); };
  $$('[data-p]').forEach(b => b.onclick = () => speak(items[+b.dataset.p].q.replace(/\(.*?\)/g, '')));
  $$('[data-r]').forEach(b => b.onclick = () => { b.hidden = true; $(`[data-a="${b.dataset.r}"]`).hidden = false; });
}

/* ---------- boot ---------- */
document.addEventListener('visibilitychange', () => { if (!document.hidden && !L && tab === 'home') renderHome(); });
setTab('home');
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
})();
