/* =====================================================================
   PIP & FIFI — episode scripts. Fifi (English) is NEW at the Polish nursery
   and doesn't speak Polish yet — like Olivia. Pip helps her.
   Steps: scene, put, walk, face, say, emo, wave, cam, ask (Olivia joins in), music, sfx, wait, tower, end.
   x = position along the floor (0–1600). Lines: [who, text] — Fifi and the narrator ('nar') speak English, everyone else Polish.
   title: the opening card (episode name + narrator).
   ===================================================================== */
window.EPISODES = [
  { id: 'ep1', title: 'Dzień dobry!', titleEn: 'Saying hello.', e: '👋', steps: [
    { scene: 'outside' }, { title: true },
    { put: { fifi: { x: -200 } } }, { music: 'walk' },
    { walk: { fifi: 520 }, dur: 2600 },
    { say: ['nar', 'This is Fifi the fox.'] },
    { say: ['nar', "Today is Fifi's very first day at a new nursery."] },
    { emo: { fifi: 'shy' } }, { cam: 'fifi' },
    { say: ['fifi', "This is my new nursery..."] },
    { say: ['fifi', "I'm a little bit scared."] },
    { cam: 'wide' }, { put: { pip: { x: 1800, face: 'l' } } },
    { say: ['nar', 'Here comes Pip the hedgehog! Pip is Fifi\'s best friend.'] },
    { walk: { pip: 820 }, dur: 2000 },
    { say: ['pip', 'Cześć, Fifi!'] }, { emo: { fifi: 'happy' } }, { wave: 'fifi' },
    { say: ['fifi', 'Hello, Pip!'] }, { emo: { fifi: 'shy' } },
    { say: ['fifi', "But I don't speak Polish!"] },
    { say: ['pip', 'Nie szkodzi! Pomogę ci!'] }, { emo: { fifi: 'happy' } }, { cam: 'fifi' },
    { say: ['fifi', "Pip will help me! Will you help me too, {kid}?"] },
    { cam: 'wide' }, { say: ['nar', 'Fifi and Pip go inside.'] }, { face: { fifi: 'r' } }, { walk: { fifi: 1100, pip: 1250 }, dur: 2200 },

    { scene: 'hall' }, { music: null },
    { put: { fifi: { x: -150 }, pip: { x: -320 }, sowa: { x: 1280, face: 'l' } } },
    { walk: { fifi: 560, pip: 380 }, dur: 2200 },
    { say: ['nar', 'This is Pani Sowa. She is the teacher.'] },
    { wave: 'sowa' }, { say: ['sowa', 'Dzień dobry, dzieci!'], cam: 'sowa' },
    { cam: 'wide' }, { say: ['pip', 'Dzień dobry, proszę Pani!'] }, { emo: { fifi: 'shy' } },
    { ask: { want: 'Dzień dobry', fifi: '{kid}, what do we say to the teacher?', whisper: 'Dzień dobry!' } },
    { emo: { fifi: 'happy' } }, { say: ['sowa', 'Dzień dobry, Fifi! Witaj w przedszkolu!'], cam: 'sowa' },
    { cam: 'fifi' }, { say: ['fifi', 'She said: welcome to nursery!'] },
    { cam: 'wide' }, { say: ['sowa', 'Chodźcie się bawić!'] },
    { face: { fifi: 'r', pip: 'r' } }, { walk: { fifi: 1700, pip: 1700, sowa: 1800 }, dur: 2200 },

    { scene: 'room' }, { music: 'menu' },
    { put: { zuzia: { x: 1040, face: 'l' }, kuba: { x: 1300, face: 'l' }, fifi: { x: -150 }, pip: { x: -330 } } },
    { tower: 'show' },
    { walk: { fifi: 520, pip: 340 }, dur: 2200 },
    { say: ['nar', 'In the playroom, there are two children.'] },
    { say: ['nar', 'This is Zuzia the bunny...'], cam: 'zuzia' }, { say: ['nar', '...and this is Kuba the bear.'], cam: 'kuba' }, { cam: 'wide' },
    { wave: 'zuzia' }, { say: ['zuzia', 'Cześć!'] }, { wave: 'kuba' }, { say: ['kuba', 'Cześć!'] }, { emo: { fifi: 'shy' } },
    { ask: { want: 'Cześć', fifi: '{kid}, help me! What do I say to them?', whisper: 'Cześć!' } },
    { emo: { fifi: 'happy' } }, { say: ['zuzia', 'Jestem Zuzia!'], cam: 'zuzia' }, { say: ['kuba', 'A ja jestem Kuba!'], cam: 'kuba' },
    { cam: 'fifi' }, { say: ['fifi', 'Zuzia and Kuba! I want to play with them!'] },
    { ask: { want: 'Pobawisz się ze mną', fifi: 'What do I say, {kid}?', whisper: 'Pobawisz się ze mną?' } },
    { cam: 'wide' }, { say: ['kuba', 'Tak! Chodź!'] }, { say: ['zuzia', 'Budujemy wieżę!'] },
    { walk: { fifi: 860, pip: 700 }, dur: 1500 },
    { say: ['nar', 'Fifi and her new friends are building a tower.'] },
    { tower: 'build' }, { emo: { fifi: 'happy', zuzia: 'happy', kuba: 'happy' } },
    { say: ['nar', 'A very... very... tall tower!'] },
    { tower: 'fall' }, { say: ['nar', 'Oh dear!'] }, { say: ['kuba', 'Ojej!'] }, { say: ['zuzia', 'Hihi!'] }, { cheer: 'all' },
    { cam: 'fifi' }, { say: ['fifi', 'I said hello to everyone... and now I have new friends!'] },
    { cam: 'wide' }, { say: ['pip', 'Brawo, Fifi! Brawo, {kidCall}!'] },
    { say: ['nar', 'Fifi loves her new nursery!'] }, { cheer: 'all' },
    { end: true }
  ] }
];
