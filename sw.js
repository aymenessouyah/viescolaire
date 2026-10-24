/* Cache atomique par version. Aucun jeton ni appel Cloud n'est mis en cache. */
const VERSION='sti-espace-v1.6.0-avancement';
const CORE_CACHE=VERSION+'-core',DOCS_CACHE='sti-espace-offline-documents-v1';
const CORE_ASSETS=["./assets/color-mode.css","./assets/color-mode.js",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/style.css",
  "./assets/app.js",
  "./assets/suivi-sti.js",
  "./assets/suivi-sti.css",
  "./assets/theme-classe.css",
  "./assets/theme-classe.js",
  "./assets/interface-reference.js",
  "./assets/interface-reference.css",
  "./assets/agent-sti.js",
  "./assets/agent-sti.css",
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
  "./assets/offline-sync.js",
  "./assets/offline-sync.css",
  "./assets/sync-merge.js",
  "./assets/fiches.js",
  "./assets/fiches.css",
  "./assets/fiche-formulaire.html",
  "./assets/annexes-fonctions.js",
  "./data/fiches.js",
  "./data/fiches3SI1.js",
  "./data/repartition4SI2.js",
  "./data/repartition3SI1.js"
],DOC_ASSETS=[
  "./docs/fiches-4si-2026/Fiches_4SI2_2026-2027.pdf",
  "./docs/fiches-4si-2026/S1.pdf",
  "./docs/fiches-4si-2026/S2.pdf",
  "./docs/fiches-4si-2026/S3.pdf",
  "./docs/fiches-4si-2026/S4.pdf",
  "./docs/fiches-4si-2026/S5.pdf",
  "./docs/fiches-4si-2026/S6.pdf",
  "./docs/fiches-4si-2026/S7.pdf",
  "./docs/fiches-4si-2026/S8.pdf",
  "./docs/fiches-4si-2026/S9.pdf",
  "./docs/fiches-4si-2026/S10.pdf",
  "./docs/fiches-4si-2026/S11.pdf",
  "./docs/fiches-4si-2026/S12.pdf",
  "./docs/fiches-4si-2026/S13.pdf",
  "./docs/fiches-4si-2026/S14.pdf",
  "./docs/fiches-4si-2026/S15.pdf",
  "./docs/fiches-4si-2026/S16.pdf",
  "./docs/fiches-4si-2026/S17.pdf",
  "./docs/fiches-4si-2026/S18.pdf",
  "./docs/fiches-4si-2026/S19.pdf",
  "./docs/fiches-4si-2026/S20.pdf",
  "./docs/fiches-4si-2026/S21.pdf",
  "./docs/fiches-4si-2026/S22.pdf",
  "./docs/fiches-4si-2026/S23.pdf",
  "./docs/fiches-4si-2026/S24.pdf",
  "./docs/fiches-4si-2026/S25.pdf",
  "./docs/fiches-4si-2026/S26.pdf",
  "./docs/fiches-4si-2026/S27.pdf",
  "./docs/fiches-4si-2026/S28.pdf",
  "./docs/fiches-4si-2026/S29.pdf",
  "./docs/fiches-4si-2026/S30.pdf",
  "./docs/fiches-4si-2026/S31.pdf",
  "./docs/fiches-4si-2026/S32.pdf",
  "./docs/fiches-4si-2026/S33.pdf",
  "./docs/fiches-4si-2026/S34.pdf",
  "./docs/fiches-4si-2026/S35.pdf",
  "./docs/fiches-4si-2026/S36.pdf",
  "./docs/fiches-4si-2026/S37.pdf",
  "./docs/fiches-4si-2026/S38.pdf",
  "./docs/fiches-4si-2026/S39.pdf",
  "./docs/fiches-4si-2026/S40.pdf",
  "./docs/fiches-4si-2026/S41.pdf",
  "./docs/fiches-4si-2026/S42.pdf",
  "./docs/fiches-4si-2026/S43.pdf",
  "./docs/fiches-4si-2026/S44.pdf",
  "./docs/fiches-4si-2026/S45.pdf",
  "./docs/fiches-4si-2026/S46.pdf",
  "./docs/fiches-4si-2026/S47.pdf",
  "./docs/fiches-4si-2026/S48.pdf",
  "./docs/fiches-4si-2026/S49.pdf",
  "./docs/fiches-4si-2026/S50.pdf",
  "./docs/sti-smart-book-3si-2026.pdf",
  "./docs/sti-smart-book-4si-2026.pdf",
  "./docs/fiches-3si-2026/Fiches_3SI1_2026-2027.pdf",
  "./docs/fiches-3si-2026/S1.pdf",
  "./docs/fiches-3si-2026/S2.pdf",
  "./docs/fiches-3si-2026/S3.pdf",
  "./docs/fiches-3si-2026/S4.pdf",
  "./docs/fiches-3si-2026/S5.pdf",
  "./docs/fiches-3si-2026/S6.pdf",
  "./docs/fiches-3si-2026/S7.pdf",
  "./docs/fiches-3si-2026/S8.pdf",
  "./docs/fiches-3si-2026/S9.pdf",
  "./docs/fiches-3si-2026/S10.pdf",
  "./docs/fiches-3si-2026/S11.pdf",
  "./docs/fiches-3si-2026/S12.pdf",
  "./docs/fiches-3si-2026/S13.pdf",
  "./docs/fiches-3si-2026/S14.pdf",
  "./docs/fiches-3si-2026/S15.pdf",
  "./docs/fiches-3si-2026/S16.pdf",
  "./docs/fiches-3si-2026/S17.pdf",
  "./docs/fiches-3si-2026/S18.pdf",
  "./docs/fiches-3si-2026/S19.pdf",
  "./docs/fiches-3si-2026/S20.pdf",
  "./docs/fiches-3si-2026/S21.pdf",
  "./docs/fiches-3si-2026/S22.pdf",
  "./docs/fiches-3si-2026/S23.pdf",
  "./docs/fiches-3si-2026/S24.pdf",
  "./docs/fiches-3si-2026/S25.pdf",
  "./docs/fiches-3si-2026/S26.pdf",
  "./docs/fiches-3si-2026/S27.pdf",
  "./docs/fiches-3si-2026/S28.pdf",
  "./docs/fiches-3si-2026/S29.pdf",
  "./docs/fiches-3si-2026/S30.pdf",
  "./docs/fiches-3si-2026/S31.pdf",
  "./docs/fiches-3si-2026/S32.pdf",
  "./docs/fiches-3si-2026/S33.pdf",
  "./docs/fiches-3si-2026/S34.pdf",
  "./docs/fiches-3si-2026/S35.pdf",
  "./docs/fiches-3si-2026/S36.pdf",
  "./docs/fiches-3si-2026/S37.pdf",
  "./docs/fiches-3si-2026/S38.pdf",
  "./docs/fiches-3si-2026/S39.pdf",
  "./docs/fiches-3si-2026/S40.pdf",
  "./docs/fiches-3si-2026/S41.pdf",
  "./docs/fiches-3si-2026/S42.pdf",
  "./docs/fiches-3si-2026/S43.pdf",
  "./docs/fiches-3si-2026/S44.pdf",
  "./docs/fiches-3si-2026/S45.pdf",
  "./docs/fiches-3si-2026/S46.pdf",
  "./docs/fiches-3si-2026/S47.pdf",
  "./docs/fiches-3si-2026/S48.pdf",
  "./docs/fiches-3si-2026/S49.pdf",
  "./docs/fiches-3si-2026/S50.pdf",
  "./docs/fiches-3si-2026/S51.pdf",
  "./docs/fiches-3si-2026/S52.pdf",
  "./docs/fiches-3si-2026/S53.pdf",
  "./docs/fiches-3si-2026/S54.pdf"
];
const corePaths=new Set(CORE_ASSETS.map(p=>new URL(p,self.registration.scope).pathname));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CORE_CACHE);
 try{await cache.addAll(CORE_ASSETS.map(p=>new Request(p,{cache:'reload'})));}
 catch(e){await caches.delete(CORE_CACHE);throw e;} // Keep the old active worker if a mandatory file is unavailable.
 /* prise en main immédiate de la nouvelle version (correctifs PDF, fiches, 3SI1) */
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 await self.clients.claim();
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('sti-espace-')&&k!==CORE_CACHE&&k!==DOCS_CACHE).map(k=>caches.delete(k)));
})()));
let downloading=null;
async function cacheDocuments(force=false){if(downloading)return downloading;downloading=(async()=>{const cache=await caches.open(DOCS_CACHE);for(const path of DOC_ASSETS){try{if(!force&&await cache.match(path))continue;const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),15000);try{const r=await fetch(path,{signal:ctl.signal});if(r.ok)await cache.put(path,r);}finally{clearTimeout(t);}}catch(e){/* Missing PDFs don't block the offline interface. */}}})();try{await downloading;}finally{downloading=null;}}
self.addEventListener('message',event=>{
 const type=event.data?.type;
 if(type==='SKIP_WAITING')event.waitUntil(self.skipWaiting());
 if(type==='CACHE_DOCUMENTS')event.waitUntil(cacheDocuments(!!event.data.force));
 if(type==='OFFLINE_STATUS')event.waitUntil((async()=>{const c=await caches.open(CORE_CACHE),d=await caches.open(DOCS_CACHE);const ready=(await Promise.all(CORE_ASSETS.map(x=>c.match(x)))).every(Boolean);const documents=(await Promise.all(DOC_ASSETS.map(x=>d.match(x)))).filter(Boolean).length;event.ports[0]?.postMessage({ready,documents,totalDocuments:DOC_ASSETS.length,version:VERSION});})());
});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;
 const scopePath=new URL(self.registration.scope).pathname;
 /* Le repli sur index.html ne concerne QUE les navigations de pages : sans cette
    exception, un PDF (ou une image, un zip, un document Word/Excel) ouvert dans un
    onglet était remplacé par l'application. */
 const fichier=/\.[a-z0-9]{2,5}$/i.test(url.pathname) && !/\/(index\.html)?$/i.test(url.pathname);
 if(req.mode==='navigate'&&url.pathname.startsWith(scopePath)&&!fichier){
  event.respondWith((async()=>{const cache=await caches.open(CORE_CACHE);return await cache.match('./index.html')||fetch(req);})());return;
 }
 if(corePaths.has(url.pathname)){
  event.respondWith((async()=>{const cache=await caches.open(CORE_CACHE);const hit=await cache.match(req,{ignoreSearch:true});return hit||fetch(req);})());return;
 }
 if(/\.pdf$/i.test(url.pathname)||url.pathname.includes('/assets/tesseract/')||url.pathname.includes('/icons/')){
  event.respondWith((async()=>{const cache=await caches.open(DOCS_CACHE),hit=await cache.match(req,{ignoreSearch:true});if(hit)return hit;try{const r=await fetch(req);if(r.ok)await cache.put(req,r.clone());return r;}catch(e){return new Response('Ce document n’a pas encore été téléchargé. Reconnectez-vous puis ouvrez-le une fois.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
 }
});
