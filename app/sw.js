// Concrete Jungle — service worker (réseau d'abord, cache en secours hors-ligne)
const CACHE = "cj-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/data.js",
  "./js/game.js",
  "./js/ui.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-180.svg",
  "./icons/icon-512.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Images (/assets/) : cache d'abord (rapide). Code & pages : réseau d'abord.
// On ne met en cache QUE les réponses valides (jamais les erreurs/404).
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const put = (req, res) => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
    return res;
  };
  const cacheThenNet = req => caches.match(req).then(hit => hit || fetch(req).then(res => put(req, res)));
  const netThenCache = req => fetch(req).then(res => put(req, res))
    .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")));
  e.respondWith(e.request.url.includes("/assets/") ? cacheThenNet(e.request) : netThenCache(e.request));
});
