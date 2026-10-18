const C = "ajanda-v15";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(["./", "index.html", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png"]).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});

/* Önce ağ: her açılışta güncel dosya alınır (tarayıcı önbelleği atlanır).
   Yalnızca başarılı (200) yanıtlar saklanır; çevrimdışıyken saklanan kopya kullanılır. */
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  const ayniKaynak = u.origin === location.origin;
  if (e.request.method !== "GET" || (!ayniKaynak && !u.hostname.endsWith("gstatic.com"))) return;
  e.respondWith(
    fetch(e.request, ayniKaynak ? { cache: "no-cache" } : undefined)
      .then(r => {
        if (r && r.ok) { const kopya = r.clone(); caches.open(C).then(c => c.put(e.request, kopya)); }
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
