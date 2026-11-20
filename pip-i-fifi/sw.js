/* Offline cache. Bump VERSION when files change. */
const VERSION = 'pipfifi-v40';
const AUDIO_CACHE = 'pipfifi-audio';   // recorded voice pieces never change (name = id) → kept across updates
const FILES = ['./', './index.html', './style.css', './game.js', './characters.js', './content.js', './music.js', './dressup-art.js', './bake-art.js', './teddy-art.js', './episodes-art.js', './episodes.js', './forest.js', './vendor/three.module.min.js', './vendor/GLTFLoader.js', './vendor/BufferGeometryUtils.js', './models/fox.glb', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSION && x !== AUDIO_CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (/\/audio\/[0-9a-f]{8}\.mp3$/.test(new URL(e.request.url).pathname)) {     // voice pieces: cache first
    e.respondWith(caches.open(AUDIO_CACHE).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
