/* =====================================================================
   RECORDED VOICES — shared by the app and by tools/voice-lines.js
   Every Polish sentence the app can say has an mp3 in audio/, named by
   lineId(voice, text). Voices (made on Kamil's Mac with make-voices.sh):
     zofia  = her own lines, words, drills   (pl-PL-ZofiaNeural)
     zofia2 = other women in dialogues       (Zofia, a bit lower)
     marek  = men in dialogues               (pl-PL-MarekNeural)
   Each has a "-slow" version for the 🐢 button.
   ===================================================================== */
(function (root) {
  const MALE = ['Vânzător', 'Kamil', 'Tata', 'Domnul'];        // dialogue speakers with a man's voice
  root.voiceKey = who => (!who || who === 'Tu') ? 'zofia' : (MALE.includes(who) ? 'marek' : 'zofia2');
  root.cleanSpeech = t => String(t).replace(/\(.*?\)/g, '').replace(/…/g, ', ').replace(/\s+/g, ' ').replace(/[,\s]+$/, '').trim();
  root.lineId = (voice, text) => {
    let h = 0x811c9dc5; const t = voice + '|' + text;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  };
})(typeof window !== 'undefined' ? window : globalThis);
