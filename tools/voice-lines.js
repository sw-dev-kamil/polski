/* Builds audio/voice-lines.json: every Polish line the app can say.
   Run after changing content:  node tools/voice-lines.js            */
const fs = require('fs'), path = require('path');
global.window = globalThis;
const root = path.join(__dirname, '..');
require(path.join(root, 'data/voices.js'));
fs.readdirSync(path.join(root, 'data')).filter(f => /^(lessons|week\d+)\.js$/.test(f))
  .sort((a, b) => (a === 'lessons.js' ? -1 : b === 'lessons.js' ? 1 : a.localeCompare(b, 'en', { numeric: true })))
  .forEach(f => require(path.join(root, 'data', f)));

const out = new Map();
const add = (voice, text) => {
  text = cleanSpeech(text); if (!text) return;
  for (const v of [voice, voice + '-slow']) { const id = lineId(v, text); if (!out.has(id)) out.set(id, { id, v, text }); }
};
for (const l of window.LESSONS) {
  l.words.forEach(w => add('zofia', w.pl));
  (l.pronounce || []).forEach(p => add('zofia', p));
  l.dialogue.lines.forEach(ln => { add(voiceKey(ln.who), ln.pl); if (ln.me) add('zofia', ln.pl); });
}
Object.values(window.PARTNER || {}).flat().forEach(c => add('zofia', c.q));
(window.SOUNDS || []).forEach(s => add('zofia', s.ex));
['Dzień dobry! Jak się masz?', 'Wspaniale!', 'Bardzo dobrze!'].forEach(t => add('zofia', t));

const list = [...out.values()];
fs.writeFileSync(path.join(root, 'audio/voice-lines.json'), JSON.stringify(list, null, 0));
const n = {}; list.forEach(l => n[l.v] = (n[l.v] || 0) + 1);
console.log(list.length, 'lines', n);
