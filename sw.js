/* Cache atomique par version. Aucun jeton ni appel Cloud n'est mis en cache. */
const VERSION='sti-espace-v1.5.4-annexes-tracking';
const CORE_CACHE=VERSION+'-core',DOCS_CACHE='sti-espace-offline-documents-v1';
const CORE_ASSETS=["./assets/color-mode.css","./assets/color-mode.js",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/style.css",
  "./assets/app.js",
  "./assets/suivi-sti.js",
  "./assets/suivi-annexes.js",
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
  "./data/fiches.js",
  "./data/repartition4SI2.js"
],DOC_ASSETS=[
  "./docs/fiches-4si-2026/Fiches_4SI2_2026-2027.pdf",
  "./docs/fiches-4si-2026/S1-2.pdf",
  "./docs/fiches-4si-2026/S11-12.pdf",
  "./docs/fiches-4si-2026/S13-14.pdf",
  "./docs/fiches-4si-2026/S15-16.pdf",
  "./docs/fiches-4si-2026/S17-18.pdf",
  "./docs/fiches-4si-2026/S19-20.pdf",
  "./docs/fiches-4si-2026/S21-22.pdf",
  "./docs/fiches-4si-2026/S23-24.pdf",
  "./docs/fiches-4si-2026/S25-26.pdf",
  "./docs/fiches-4si-2026/S27-28.pdf",
  "./docs/fiches-4si-2026/S29-30.pdf",
  "./docs/fiches-4si-2026/S3-4.pdf",
  "./docs/fiches-4si-2026/S31-32.pdf",
  "./docs/fiches-4si-2026/S33-34.pdf",
  "./docs/fiches-4si-2026/S35-36.pdf",
  "./docs/fiches-4si-2026/S37-38.pdf",
  "./docs/fiches-4si-2026/S39-40.pdf",
  "./docs/fiches-4si-2026/S41-42.pdf",
  "./docs/fiches-4si-2026/S43-44.pdf",
  "./docs/fiches-4si-2026/S45-46.pdf",
  "./docs/fiches-4si-2026/S47-48.pdf",
  "./docs/fiches-4si-2026/S49-50.pdf",
  "./docs/fiches-4si-2026/S5-6.pdf",
  "./docs/fiches-4si-2026/S7-8.pdf",
  "./docs/fiches-4si-2026/S9-10.pdf",
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
const corePaths=new Set(CORE_ASSETS.map(p=>new URL(p,self.registration.scope).pathname));
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CORE_CACHE);
 try{await cache.addAll(CORE_ASSETS.map(p=>new Request(p,{cache:'reload'})));}
 catch(e){await caches.delete(CORE_CACHE);throw e;} // Keep the old active worker if a mandatory file is unavailable.
 if(!self.registration.active)await self.skipWaiting();
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
 if(req.mode==='navigate'&&url.pathname.startsWith(new URL(self.registration.scope).pathname)){
  event.respondWith((async()=>{const cache=await caches.open(CORE_CACHE);return await cache.match('./index.html')||fetch(req);})());return;
 }
 if(corePaths.has(url.pathname)){
  event.respondWith((async()=>{const cache=await caches.open(CORE_CACHE);const hit=await cache.match(req,{ignoreSearch:true});return hit||fetch(req);})());return;
 }
 if(/\.pdf$/i.test(url.pathname)||url.pathname.includes('/assets/tesseract/')||url.pathname.includes('/icons/')){
  event.respondWith((async()=>{const cache=await caches.open(DOCS_CACHE),hit=await cache.match(req,{ignoreSearch:true});if(hit)return hit;try{const r=await fetch(req);if(r.ok)await cache.put(req,r.clone());return r;}catch(e){return new Response('Ce document n’a pas encore été téléchargé. Reconnectez-vous puis ouvrez-le une fois.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
 }
});
