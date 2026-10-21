/* =========================================================================
   Service worker — Espace pédagogique STI
   Stratégies :
     • page, styles, scripts et données : réseau d'abord, cache de secours
       (une mise à jour en ligne est prise en compte immédiatement)
     • PDF (aide pédagogique, répartitions, annexes) : cache d'abord
       (documents volumineux, rarement modifiés → consultables hors ligne)
   ========================================================================= */
const VERSION    = "sti-espace-v1.2.0-sti-books";
const CORE_CACHE = VERSION + "-core";
const DOCS_CACHE = VERSION + "-docs";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/style.css",
  "./assets/app.js",
  "./assets/suivi-sti.js",
  "./assets/suivi-sti.css",
  "./data/livres-sti.js",
  "./data/ajustements-sti.js",
  "./assets/eleves.js",
  "./assets/admin.js",
  "./data/reference.js",
  "./data/repartition.js",
  "./data/programme.js",
  "./data/competences.js",
  "./data/memo.js",
  "./data/annexes.js",
  "./data/docs.js",
  "./supabase/config.js",
  "./assets/tesseract/tesseract.min.js",
  "./assets/tesseract/worker.min.js",
  "./assets/tesseract/core/tesseract-core-simd-lstm.wasm.js",
  "./assets/tesseract/core/tesseract-core-simd-lstm.wasm",
  "./assets/tesseract/core/tesseract-core-lstm.wasm.js",
  "./assets/tesseract/core/tesseract-core-lstm.wasm",
  "./assets/tesseract/lang/ara.traineddata.gz",
  "./assets/tesseract/lang/fra.traineddata.gz",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

const DOC_ASSETS = [
  "./docs/sti-smart-book-3si-2026.pdf",
  "./docs/sti-smart-book-4si-2026.pdf",
  "./docs/fiches-3si-2026/S5-6-3sti.pdf",
  "./docs/fiches-3si-2026/S7-8-3sti.pdf",
  "./docs/fiches-3si-2026/S9-10-3sti.pdf",
  "./docs/fiches-3si-2026/S11-12-3sti.pdf",
  "./docs/fiches-3si-2026/S13-14-3sti.pdf",
  "./docs/fiches-3si-2026/S15-16-3sti.pdf",

  "./docs/Aide-pedagogique-STI-3-4-2024.pdf",
  "./docs/Repartition-T1-3SI.pdf",
  "./docs/Repartition-T1-4SI.pdf",
  "./docs/Annexe-HTML5.pdf",
  "./docs/Annexe-CSS3.pdf",
  "./docs/Annexe-JavaScript.pdf",
  "./docs/Annexe-PHP.pdf",
  "./docs/Annexe-SQL.pdf"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const core = await caches.open(CORE_CACHE);
    await core.addAll(CORE_ASSETS.map(u => new Request(u, { cache: "reload" }))).catch(() => {});
    const docs = await caches.open(DOCS_CACHE);
    /* les PDF sont mis en cache un par un : un document absent ne bloque pas l'installation */
    await Promise.all(DOC_ASSETS.map(u => docs.add(new Request(u, { cache: "reload" })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("sti-espace-") && k !== CORE_CACHE && k !== DOCS_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   /* les appels Supabase ne sont pas mis en cache */

  const isDoc = /\.pdf($|\?)/i.test(url.pathname);

  if (isDoc) {
    event.respondWith((async () => {
      const cache = await caches.open(DOCS_CACHE);
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch (e) {
        return hit || new Response("Document indisponible hors ligne.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CORE_CACHE);
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok) cache.put(req, fresh.clone());
      return fresh;
    } catch (e) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === "navigate") {
        const page = await cache.match("./index.html");
        if (page) return page;
      }
      return new Response("Ressource indisponible hors ligne.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  })());
});
