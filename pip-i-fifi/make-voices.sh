#!/bin/bash
# Pip & Fifi — make ALL recorded voice lines on the Mac (free Microsoft voices via edge-tts).
#   Fifi = Maisie cartoon (en-GB-MaisieNeural, +15Hz, +5%)
#   Pip  = Zofia cartoon  (pl-PL-ZofiaNeural,  +25Hz, +5%)
#   Cartoons: Pani Sowa = Zofia grown-up, Zuzia = Zofia high, Kuba = Marek pitched up,
#             storyteller = Ryan (British man)
# Run in Terminal:  bash make-voices.sh
# → files in ~/Desktop/pip-fifi-audio, packed into ~/Desktop/pip-fifi-audio/ALL-VOICES.zip
# Run it again after new content: it only makes the lines that are new.

LIST_URL="https://sw-dev-kamil.github.io/polski/pip-i-fifi/audio/voice-lines.json"
echo "== Pip & Fifi: making voice lines =="
command -v python3 >/dev/null 2>&1 || { echo "!! python3 not found. Run: xcode-select --install"; exit 1; }
VENV=~/.pipfifi-venv
[ -x "$VENV/bin/python" ] || python3 -m venv "$VENV" || { echo "!! could not create Python environment"; exit 1; }
"$VENV/bin/python" -m pip install --quiet --upgrade pip edge-tts || { echo "!! could not install edge-tts"; exit 1; }
OUT=~/Desktop/pip-fifi-audio; mkdir -p "$OUT"
curl -fsSL "$LIST_URL?$(date +%s)" -o "$OUT/voice-lines.json" || { echo "!! could not download the line list"; exit 1; }

"$VENV/bin/python" - "$OUT" <<'PY'
import asyncio, json, os, sys
import edge_tts
out = sys.argv[1]
lines = json.load(open(os.path.join(out, 'voice-lines.json'), encoding='utf-8'))
VOICE = {'en': ('en-GB-MaisieNeural', '+15Hz', '+5%'), 'pl': ('pl-PL-ZofiaNeural', '+25Hz', '+5%'),
         'sowa': ('pl-PL-ZofiaNeural', '-6Hz', '-6%'),      # the teacher: calm grown-up lady
         'zuzia': ('pl-PL-ZofiaNeural', '+55Hz', '+8%'),    # little bunny girl
         'kuba': ('pl-PL-MarekNeural', '+45Hz', '+6%'),     # little bear boy
         'nar': ('en-GB-RyanNeural', '+0Hz', '-6%')}        # the storyteller (English, warm British man)
todo = [l for l in lines if not os.path.exists(os.path.join(out, l['id'] + '.mp3'))]
print(f"{len(lines)} lines in the game, {len(todo)} to make now")
done = 0; failed = []
async def one(l, sem):
    global done
    v, pitch, rate = VOICE[l.get('v') or l['lang']]
    path = os.path.join(out, l['id'] + '.mp3')
    async with sem:
        for attempt in range(4):
            try:
                await asyncio.wait_for(edge_tts.Communicate(l['text'], v, pitch=pitch, rate=rate).save(path + '.part'), 30)   # a stuck line is retried
                os.replace(path + '.part', path); done += 1
                print(f"  [{done}/{len(todo)}] {l.get('v') or l['lang']}: {l['text']}"); return
            except (Exception, asyncio.TimeoutError) as e:
                err = e or 'timed out'; await asyncio.sleep(2 + attempt * 3)
        failed.append(l); print(f"  !! failed: {l['text']} ({err})")
async def main():
    sem = asyncio.Semaphore(4)
    await asyncio.gather(*(one(l, sem) for l in todo))
asyncio.run(main())
have = sorted(l['id'] for l in lines if os.path.exists(os.path.join(out, l['id'] + '.mp3')))
json.dump(have, open(os.path.join(out, 'index.json'), 'w'))
print(f"== {len(have)} of {len(lines)} lines ready" + (f", {len(failed)} failed (run again to retry)" if failed else ""))
PY
cd "$OUT" && rm -f ALL-VOICES.zip && zip -q ALL-VOICES.zip *.mp3 index.json && echo "== Packed: $OUT/ALL-VOICES.zip ($(du -h ALL-VOICES.zip | cut -f1))"
open "$OUT"
