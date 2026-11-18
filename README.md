# Polski: Polish for Romanian speakers (v1)

A web app that installs on the iPhone home screen. It works offline and saves progress on the phone.

## Put it online (one time, ~10 minutes)
1. On github.com, create a new **public** repository, e.g. `polski`.
2. Click **Add file → Upload files** and drag in **everything inside this folder**: `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, and the `data` and `icons` folders. Then commit.
3. Go to **Settings → Pages**. Under "Branch", choose `main` and `/ (root)`, then save.
4. After a minute or two, the app is live at `https://YOUR-USERNAME.github.io/polski/`.

## Install on her iPhone
1. Open the link in **Safari** (not Chrome).
2. Tap **Share → Add to Home Screen**.
3. Open it from the new "Polski" icon.

Tips for her phone:
- **Better voice:** Settings → Accessibility → Spoken Content → Voices → Polish → download "Zosia (Enhanced)".
- **Pronunciation check:** the app asks for microphone / speech recognition permission the first time. Dictation must be on (Settings → General → Keyboard → Enable Dictation).
- If the automatic check doesn't work in the home-screen app, the microphone switches to **record & compare** mode: she records herself and plays it back next to the model.

## Editing content
- All lessons are in `data/lessons.js`. Each day is one block; copy a block to add a new day. Every word needs a new, unique `id`.
- The dialogue name "Maria" (day 2) is a placeholder. Replace it with her name in `data/lessons.js`.
- After changing any file, open `sw.js`, change `polski-v1` to `polski-v2` (v3, ...), and upload the changed files. Phones then pick up the update the next time the app is opened with internet.
