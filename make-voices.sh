#!/bin/bash
# Polski — make ALL recorded voice lines on the Mac (free Microsoft neural voices via edge-tts).
#   zofia  = pl-PL-ZofiaNeural  (words, drills, her own lines)
#   zofia2 = Zofia a bit lower   (other women in dialogues: Mama, Kasia, shop assistant…)
#   marek  = pl-PL-MarekNeural  (men in dialogues)
#   "-slow" = the same, much slower, for the 🐢 button
# Run in Terminal:  bash make-voices.sh
# → files in ~/Desktop/polski-audio, packed into ~/Desktop/polski-audio/ALL-VOICES.zip
# Run it again after new lessons: it only makes the lines that are new.

LIST_URL="https://sw-dev-kamil.github.io/polski/audio/voice-lines.json"
echo "== Polski: making voice lines =="
command -v python3 >/dev/null 2>&1 || { echo "!! python3 not found. Run: xcode-select --install"; exit 1; }
VENV=~/.pipfifi-venv                      # same Python environment as the Pip & Fifi voices
[ -x "$VENV/bin/python" ] || python3 -m venv "$VENV" || { echo "!! could not create Python environment"; exit 1; }
"$VENV/bin/python" -m pip install --quiet --upgrade pip edge-tts || { echo "!! could not install edge-tts"; exit 1; }
OUT=~/Desktop/polski-audio; mkdir -p "$OUT"
curl -fsSL "$LIST_URL?$(date +%s)" -o "$OUT/voice-lines.json" || { echo "!! could not download the line list"; exit 1; }

"$VENV/bin/python" - "$OUT" <<'PY'
import asyncio, json, os, sys
import edge_tts
out = sys.argv[1]
lines = json.load(open(os.path.join(out, 'voice-lines.json'), encoding='utf-8'))
BASE = {'zofia': ('pl-PL-ZofiaNeural', '+0Hz'), 'zofia2': ('pl-PL-ZofiaNeural', '-12Hz'), 'marek': ('pl-PL-MarekNeural', '+0Hz')}
def voice(v):
    slow = v.endswith('-slow'); name, pitch = BASE[v.replace('-slow', '')]
    return name, pitch, ('-30%' if slow else '-5%')
todo = [l for l in lines if not os.path.exists(os.path.join(out, l['id'] + '.mp3'))]
print(f"{len(lines)} lines in the app, {len(todo)} to make now")
done = 0; failed = []
async def one(l, sem):
    global done
    name, pitch, rate = voice(l['v'])
    path = os.path.join(out, l['id'] + '.mp3')
    async with sem:
        err = None
        for attempt in range(4):
            try:
                await asyncio.wait_for(edge_tts.Communicate(l['text'], name, pitch=pitch, rate=rate).save(path + '.part'), 30)
                os.replace(path + '.part', path); done += 1
                print(f"  [{done}/{len(todo)}] {l['v']}: {l['text']}"); return
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
