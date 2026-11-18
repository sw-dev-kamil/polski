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
let S = { stickers: [], voice: 'cartoon', listen: true, kid: null };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const KID = Object.assign({}, window.KID, S.kid || {});

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
  if (Math.random() < 0.35) return pick([`Well done, ${KID.en}!`, `Yay, ${KID.en}!`, `Brilliant, ${KID.en}!`]);
  return pick(['Well done!', 'Yay!', 'Brilliant!', 'Super!', 'Hooray!', 'You did it!']);
}
function praisePL() {
  if (Math.random() < 0.35) return pick([`Brawo, ${KID.plCall}!`, `Super, ${KID.plCall}!`, `Świetnie, ${KID.plCall}!`]);
  return pick(['Brawo!', 'Super!', 'Świetnie!', 'Hura!', 'Pięknie!', 'Tak jest!']);
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
  VOICE.en = en.find(v => /en.GB/i.test(v.lang) && /martha|kate|serena|stephanie|libby|sonia|female/i.test(v.name))
    || en.find(v => /en.GB/i.test(v.lang)) || en.find(v => /samantha|karen|moira|tessa/i.test(v.name)) || en[0] || null;
  const pl = vs.filter(v => /^pl/i.test(v.lang));
  VOICE.pl = pl.find(v => /enhanced|premium|ulepsz/i.test(v.name)) || pl.find(v => /zosia/i.test(v.name)) || pl[0] || null;
}
if (hasTTS) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
const STYLE = {
  natural: { fifi: 1.1, pip: 1.0 },
  cartoon: { fifi: 1.55, pip: 1.3 },
  extra:   { fifi: 1.9, pip: 1.65 }
};

let tk = 0; // changes whenever the screen changes → stops old speech sequences
let mouthTimer = null;
function talk(who, on) {
  clearInterval(mouthTimer);
  $$('.char').forEach(c => c.classList.remove('talking', 'open'));
  if (!on) return;
  const els = $$(`.char[data-who="${who}"]`);
  els.forEach(c => c.classList.add('talking'));
  mouthTimer = setInterval(() => els.forEach(c => c.classList.toggle('open', Math.random() > 0.35)), 110);
}
function say(who, lang, text) {
  return new Promise(res => {
    text = kidify(text, lang);
    if (!hasTTS) { talk(who, true); setTimeout(() => { talk(who, false); res(); }, 400 + text.length * 55); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'pl' ? 'pl-PL' : 'en-GB';
    const v = VOICE[lang]; if (v) u.voice = v;
    u.pitch = Math.min(2, (STYLE[S.voice] || STYLE.cartoon)[who]);
    u.rate = lang === 'pl' ? 0.8 : 0.9;
    let done = false;
    const fin = () => { if (done) return; done = true; talk(who, false); res(); };
    u.onstart = () => talk(who, true);
    u.onend = fin; u.onerror = fin;
    talk(who, true);
    speechSynthesis.speak(u);
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
function hush() { tk++; if (hasTTS) speechSynthesis.cancel(); talk(null, false); stopListening(); }
function cheer(who) {
  $$(who ? `.char[data-who="${who}"]` : '.char').forEach(c => { c.classList.remove('cheer'); void c.offsetWidth; c.classList.add('cheer'); setTimeout(() => c.classList.remove('cheer'), 1200); });
}
function waveAll() { $$('.char').forEach(c => { c.classList.add('waving'); setTimeout(() => c.classList.remove('waving'), 2100); }); }

/* =====================================================================
   LISTENING — just detects that she spoke (no judging at this age)
   ===================================================================== */
let micStop = null;
function stopListening() { if (micStop) { micStop(false); micStop = null; } }
async function hearVoice(ms, onLevel) {
  if (!S.listen || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch (e) { return null; }
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const an = ctx.createAnalyser(); an.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(an);
  const buf = new Float32Array(an.fftSize);
  return new Promise(res => {
    let loud = 0, raf = 0; const t0 = performance.now(); let ended = false;
    const done = v => {
      if (ended) return; ended = true; cancelAnimationFrame(raf);
      stream.getTracks().forEach(t => t.stop()); try { ctx.close(); } catch (e) {}
      onLevel && onLevel(0); micStop = null; res(v);
    };
    micStop = done;
    const tick = () => {
      an.getFloatTimeDomainData(buf);
      let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      const rms = Math.sqrt(s / buf.length);
      onLevel && onLevel(rms);
      loud = rms > 0.03 ? loud + 1 : Math.max(0, loud - 0.5);
      if (loud > 12) return done(true);              // ~0.2 s of voice
      if (performance.now() - t0 > ms) return done(false);
      raf = requestAnimationFrame(tick);
    };
    tick();
  });
}

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
function show(html) { hush(); screen.innerHTML = `<div class="view">${html}</div>`; return tk; }
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
  $('#go').onclick = () => { pickVoices(); home(true); };
}

/* ---------- home ---------- */
const TILES = [
  { id: 'colours', e: '🎈', en: 'Colours', pl: 'Kolory', s: '#F7C6CC' },
  { id: 'animals', e: '🐶', en: 'Animals', pl: 'Zwierzątka', s: '#F1D9B5' },
  { id: 'count',   e: '🍎', en: 'Counting', pl: 'Liczymy', s: '#F5C9B8' },
  { id: 'friends', e: '🧸', en: 'Playing with friends', pl: 'Zabawa z dziećmi', s: '#CDE5F7' },
  { id: 'needs',   e: '🥤', en: 'At nursery', pl: 'W przedszkolu', s: '#D3EFC9' },
  { id: 'stickers',e: '⭐', en: 'Stickers', pl: 'Naklejki', s: '#F7E6A6' }
];
function home(greet) {
  const my = show(`
    <button class="gear" id="gear" aria-label="Parent settings">⚙️<span class="ring"></span></button>
    <div class="menu">${TILES.map(t => `<button class="tile ${t.id === 'friends' ? 'wiggle' : ''}" data-t="${t.id}" style="--s:${t.s}">
      <span class="e">${t.e}</span><span class="l">${t.pl}</span></button>`).join('')}</div>
    ${charHTML('fifi', 'left')}${charHTML('pip', 'right')}`);
  $$('.char').forEach(c => c.style.width = '26vmin');
  $$('.tile').forEach(b => b.onclick = () => openTile(b.dataset.t, b));
  parentGate($('#gear'));
  waveAll();
  if (greet) seq([['fifi', 'en', `Hello, ${KID.en}!`], ['pip', 'pl', `Cześć, ${KID.plCall}!`],
    ['fifi', 'en', 'What shall we play?'], ['pip', 'pl', 'W co się bawimy?']], my);
  else seq([['pip', 'pl', 'W co się bawimy?']], my);
}
let opening = false;
async function openTile(id, el) {
  if (opening) return; opening = true;
  const t = TILES.find(x => x.id === id);
  hush(); const my = tk;
  el.style.transform = 'scale(1.12)';
  const go = { colours: () => pickGame('colours'), animals: () => pickGame('animals'), count: countGame,
    friends: () => phraseGame(window.FRIENDS), needs: () => phraseGame(window.NEEDS), stickers: stickerBook }[id];
  await Promise.race([seq([['fifi', 'en', t.en + '!'], ['pip', 'pl', t.pl + '!']], my), wait(2600)]);
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
    const bilingual = round < 3;
    const prompt = isCol
      ? (bilingual ? [['fifi', 'en', `Find the ${target.en} balloon!`], ['pip', 'pl', cap(target.pl) + '!']] : [['pip', 'pl', `Gdzie jest ${target.pl} balonik?`]])
      : (bilingual ? [['fifi', 'en', `Where is the ${target.en}?`], ['pip', 'pl', cap(target.pl) + '!']] : [['pip', 'pl', `Gdzie jest ${target.pl}?`]]);
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
        await seq([['fifi', 'en', isCol ? `Oops, that's ${o.en}!` : `That's the ${o.en}!`],
          ['pip', 'pl', `To jest ${o.pl}. Gdzie jest ${target.pl}?`]], t);
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
    const prompt = r === 0 ? [['fifi', 'en', 'Let\'s count! Tap them one by one!'], ['pip', 'pl', 'Liczymy!']] : [['pip', 'pl', 'Liczymy!']];
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

/* ---------- say it: playing with friends & nursery words ---------- */
function phraseGame(list) {
  let i = 0;
  const again = () => phraseGame(list);
  const next = async () => {
    if (i >= list.length) return reward(again);
    const p = list[i];
    const my = show(`${topbar(list.length, i)}
      <div class="phrase" id="ph"><button class="pic" id="pic">${p.emoji}</button>
        <div class="pl">${kidify(p.pl, 'pl')}</div><div class="en">${kidify(p.en, 'en')}</div>
        <div class="your-turn" id="yt"></div></div>${chars()}`);
    bindHome();
    const ph = $('#ph'), yt = $('#yt');
    $('#pic').onclick = () => { hush(); say('pip', 'pl', p.pl); };
    $('#again').onclick = () => { hush(); run(); };
    const showNext = () => {
      if ($('#nx')) return;
      $('.view').insertAdjacentHTML('beforeend', `<button class="next-btn" id="nx" aria-label="Next">${ICON.next}</button>`);
      $('#nx').onclick = () => { i++; next(); };
    };
    async function run() {
      const t = tk;
      yt.textContent = '';
      const ok = await seq([['fifi', 'en', p.why], ['pip', 'pl', p.pl], ['fifi', 'en', Math.random() < 0.4 ? `Your turn, ${KID.en}!` : 'Your turn! Say it!']], t);
      if (!ok) return;
      yt.textContent = '🎤 …';
      ph.classList.add('listening');
      const heard = await hearVoice(5500, lv => ph.style.setProperty('--lv', (1 + Math.min(0.35, lv * 6)).toFixed(3)));
      ph.classList.remove('listening'); yt.textContent = '';
      if (t !== tk) return;
      if (heard) {
        cheer(); confettiSmall();
        await seq([['pip', 'pl', praisePL()], ['fifi', 'en', praiseEN()]], t);
      } else {
        await seq([['fifi', 'en', 'Let\'s say it together!'], ['pip', 'pl', p.pl]], t);
      }
      if (t === tk) showNext();
    }
    run();
    setTimeout(() => { if (my === tk) showNext(); }, 9000); // never get stuck
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
  seq([['fifi', 'en', `A sticker for you, ${KID.en}!`], ['pip', 'pl', `Naklejka dla ciebie! Brawo, ${KID.plCall}!`]], my).then(ok => ok && cheer());
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
function parentPanel() {
  hush(); pickVoices();
  const segBtn = (key, val, label) => `<button data-k="${key}" data-v="${val}" class="${String(S[key]) === String(val) ? 'on' : ''}">${label}</button>`;
  const el = document.createElement('div'); el.className = 'parent';
  el.innerHTML = `<div class="box"><h3>For grown-ups</h3>
    <div class="row"><div><b>Voices</b><div class="small">EN: ${VOICE.en ? VOICE.en.name : 'default'} · PL: ${VOICE.pl ? VOICE.pl.name : 'default'}</div></div>
      <div class="seg">${segBtn('voice', 'natural', 'Natural')}${segBtn('voice', 'cartoon', 'Cartoon')}${segBtn('voice', 'extra', 'Extra')}</div></div>
    <div class="row"><div><b>Listen for her voice</b><div class="small">uses the microphone on "your turn"</div></div>
      <div class="seg">${segBtn('listen', 'true', 'On')}${segBtn('listen', 'false', 'Off')}</div></div>
    <div class="row"><div><b>Her name</b><div class="small">English · Polish · Polish when calling her</div></div>
      <div style="display:flex;gap:6px"><input id="n1" value="${KID.en}" size="7"><input id="n2" value="${KID.pl}" size="7"><input id="n3" value="${KID.plCall}" size="7"></div></div>
    <div class="row"><div><b>Stickers</b><div class="small">${S.stickers.length} collected</div></div><button class="pbtn" id="rs">Reset</button></div>
    <div class="row" style="border:0"><button class="pbtn" id="tv">Test voices</button><button class="pbtn main" id="cl">Done</button></div></div>`;
  document.body.appendChild(el);
  $$('.seg button', el).forEach(b => b.onclick = () => {
    const k = b.dataset.k; S[k] = k === 'listen' ? b.dataset.v === 'true' : b.dataset.v; save();
    $$(`.seg button[data-k="${k}"]`, el).forEach(x => x.classList.toggle('on', x === b));
  });
  $('#tv', el).onclick = () => { seq([['fifi', 'en', `Hello, ${$('#n1', el).value}!`], ['pip', 'pl', `Cześć, ${$('#n3', el).value}!`]]); };
  let armed = false;
  $('#rs', el).onclick = e => { if (!armed) { armed = true; e.target.textContent = 'Sure?'; return; } S.stickers = []; save(); e.target.textContent = 'Done'; };
  $('#cl', el).onclick = () => {
    KID.en = $('#n1', el).value.trim() || KID.en; KID.pl = $('#n2', el).value.trim() || KID.pl; KID.plCall = $('#n3', el).value.trim() || KID.plCall;
    S.kid = { en: KID.en, pl: KID.pl, plCall: KID.plCall }; save();
    el.remove(); home(false);
  };
}

/* ---------- boot ---------- */
start();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
