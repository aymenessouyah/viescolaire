/* Préférence d’affichage locale uniquement : aucune donnée de cours ni écriture Cloud. */
(function(){'use strict';const KEY='sti_color_mode_v1',html=document.documentElement;
function render(){const dark=html.dataset.colorMode==='dark',b=document.getElementById('ref-theme-toggle');if(b){b.setAttribute('aria-label',dark?'Activer le mode clair':'Activer le mode sombre');b.title=dark?'Passer au mode clair':'Passer au mode sombre';b.setAttribute('aria-pressed',String(dark));b.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">'+(dark?'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>':'<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>')+'</svg>';}
const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=dark?'#111b18':'#10402F';}
function apply(mode,persist){html.dataset.colorMode=mode==='dark'?'dark':'light';if(persist)try{localStorage.setItem(KEY,html.dataset.colorMode);}catch(e){}render();}
document.addEventListener('click',e=>{if(e.target.closest('#ref-theme-toggle'))apply(html.dataset.colorMode==='dark'?'light':'dark',true);});
window.addEventListener('storage',e=>{if(e.key===KEY)apply(e.newValue,false);});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
