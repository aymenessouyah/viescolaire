/* Offline-first sync, v1.4.0. Durable outbox + three-way merge + server CAS.
   Credentials remain in the existing auth mechanism, never in backups.
   No anonymous sync, no last-write-wins, no unsafe REST insert fallback. */
(function(root){'use strict';
const DB='sti_offline_sync_v1',PIN='sti_sync_owner_v1',KEY='sti_espace_aymen_2026_2027',FIELDS=['times','seances','profil','classes','eleves','epreuves','notes','presences'];
const M=root.STI_MERGE,esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),clone=M.clone,eq=M.equal;
let db=null,state=null,scope='',lastSeen=null,busy=false,timer=null,queue=Promise.resolve(),initDone=false,pendingLink=null,blockedTab=false,status={code:'starting',text:'Initialisation locale…'},readyResolve;
const ready=new Promise(r=>readyResolve=r),el=id=>document.getElementById(id),now=()=>new Date().toISOString();
const defaults=()=>({times:clone(root.STI_DATA.reference.HORAIRES_DEFAUT),seances:{},profil:null,classes:null,eleves:{},epreuves:{},notes:{},presences:{}});
function biz(o){const d=defaults();for(const k of FIELDS)if(o&&o[k]!==undefined)d[k]=clone(o[k]);return d;}
const current=()=>biz(root.store),rawLocal=()=>{try{const x=localStorage.getItem(KEY);return x?biz(JSON.parse(x)):defaults();}catch(e){return defaults();}};
function useful(o){return !!root.store.saved||!!o.profil||Object.keys(o.seances||{}).length>0||['eleves','epreuves','notes','presences'].some(k=>Object.values(o[k]||{}).some(v=>Array.isArray(v)?v.length:Object.keys(v||{}).length))||!eq(o.times,defaults().times);}
function setupDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{const d=req.result;d.createObjectStore('scopes',{keyPath:'id'});d.createObjectStore('backups',{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Fermez les autres onglets pour initialiser le stockage.'));});}
function read(table,id){return new Promise((res,rej)=>{const q=db.transaction(table).objectStore(table).get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error);});}
function write(table,value){return new Promise((res,rej)=>{const tx=db.transaction(table,'readwrite');tx.objectStore(table).put(clone(value));tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||new Error('Écriture locale annulée'));});}
function allBackups(){return new Promise((res,rej)=>{const q=db.transaction('backups').objectStore('backups').getAll();q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});}
const uid=()=>root.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2);
function storageFailure(e){setStatus('storage','Stockage local indisponible — exportez vos données');console.warn('Stockage STI indisponible',e?.name||'storage');}
function persist(){if(!db||!state)return Promise.resolve();const snap=clone({...state,id:scope,local:current()});queue=queue.catch(()=>{}).then(()=>write('scopes',snap));return queue;}
async function backup(reason,data,extra={}){if(!db)throw new Error('Stockage durable indisponible');await write('backups',{id:uid(),scope,owner:state?.owner?.email||null,at:now(),reason,data:clone(data),...extra});}
function badge(){const c=['clean'].includes(status.code)?'b-green':['syncing','starting'].includes(status.code)?'b-blue':['conflict','storage','account','server'].includes(status.code)?'b-rose':'b-amber';return '<span class="badge '+c+'">'+esc(status.text)+'</span>';}
function renderStatus(){const html=badge()+(state?.lastOk?'<span class="tiny muted">Dernière synchronisation : '+esc(new Date(state.lastOk).toLocaleString('fr-FR'))+'</span>':'');for(const id of ['cloud-bar','cloud-bar-ref','cloud-bar2']){const e=el(id);if(e)e.innerHTML=html;}const b=el('sti-sync-details');if(b)b.textContent=status.code==='conflict'?'Résoudre les conflits':'Hors ligne & synchronisation';}
function setStatus(code,text){status={code,text};renderStatus();}
function signedIdentity(){const cfg=root.cloudCfg?.(),auth=root.authSession?.();if(!cfg?.url||!cfg.key)return null;if(cfg.table!=='espace_pedagogique')throw new Error('La synchronisation sécurisée nécessite la table espace_pedagogique.');if(!cfg.auth)throw new Error('Activez l’accès protégé par mot de passe dans la configuration Cloud.');if(!auth?.user?.id)return null;return{id:auth.user.id,email:auth.user.email||auth.user.id,url:cfg.url.replace(/\/$/,''),annee:root.SCHOOL.annee,scope:cfg.url.replace(/\/$/,'')+'|'+auth.user.id+'|'+root.SCHOOL.annee};}
function editing(){return !!document.querySelector('.modal.on,dialog[open]')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);}
function schedule(delay=1000){clearTimeout(timer);timer=setTimeout(()=>request(false),delay);}
function replaceLocal(data,saved){const d=biz(data);for(const k of FIELDS)root.store[k]=clone(d[k]);if(saved!==undefined)root.store.saved=saved;lastSeen=current();let stored=true;try{localStorage.setItem(KEY,JSON.stringify(root.store));}catch(e){stored=false;}if(state)state.idbOnly=!stored;return stored;}
function refresh(){root.renderAll?.(true);root.renderCompte?.();renderStatus();}
async function rpc(identity,commit=false,payload=null,expected=null){
 const token=await root.authToken();if(!token){const e=new Error('Reconnectez votre compte pour reprendre la synchronisation.');e.kind='auth';throw e;}
 const active=signedIdentity();if(active?.scope!==identity.scope)throw Object.assign(new Error('Le compte a changé. Synchronisation interrompue.'),{kind:'account'});
 const c=root.cloudCfg(),ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),12000);let r;
 try{r=await fetch(identity.url+'/rest/v1/rpc/sti_sync_snapshot',{method:'POST',headers:{apikey:c.key,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({p_annee:identity.annee,p_expected_id:expected,p_snapshot:payload,p_commit:commit}),signal:ctl.signal});}finally{clearTimeout(timeout);}
 if(!r.ok){const e=new Error(r.status===404?'Fonction SQL manquante — exécutez installation/synchronisation-atomique.sql dans Supabase.':r.status===401||r.status===403?'Connexion ou droits Supabase insuffisants ; vos changements restent sur cet appareil.':'Serveur indisponible ; les changements restent en attente.');e.kind=r.status===404?'server':r.status===401||r.status===403?'auth':'network';throw e;}
 const data=await r.json();if(signedIdentity()?.scope!==identity.scope)throw Object.assign(new Error('Compte changé — échange suspendu.'),{kind:'account'});if(!['read','retry','committed'].includes(data.status)||!Object.prototype.hasOwnProperty.call(data,'head'))throw Object.assign(new Error('Réponse du service de synchronisation invalide.'),{kind:'server'});
 if(data.head&&(!data.head.payload||typeof data.head.payload!=='object'||Array.isArray(data.head.payload)))throw Object.assign(new Error('Sauvegarde distante invalide ; rien n’a été remplacé.'),{kind:'server'});
 return data;
}
async function establish(identity,head){
 if(scope===identity.scope&&state?.owner?.id===identity.id)return true;
 const local=current(),changedOwner=!!state?.owner&&state.owner.id!==identity.id||!!state?.owner&&state.owner.url!==identity.url;
 if(changedOwner||useful(local)){
  pendingLink={identity,head,changedOwner};setStatus('account',changedOwner?'Compte différent — ouvrir cet espace explicitement':'Première connexion — choisir la reprise des données');showLink();return false;
 }
 await activate(identity,head,'remote');return true;
}
async function activate(identity,head,mode){
 const original=current();await backup('Avant association à un compte',original);if(state)await persist();
 const existing=await read('scopes',identity.scope);if(signedIdentity()?.scope!==identity.scope)throw Object.assign(new Error('Compte changé — association annulée.'),{kind:'account'});scope=identity.scope;
 state=existing||{id:scope,owner:identity,base:head?biz(head.payload):defaults(),headId:head?.id??null,lastOk:null,conflict:null,local:defaults()};state.owner=identity;
 let local=mode==='merge'?original:existing?.local||(head?biz(head.payload):defaults());
 if(mode==='merge')state.base=head?null:defaults();
 replaceLocal(local,mode==='merge'?root.store.saved:head?.payload?.saved||null);await persist();localStorage.setItem(PIN,scope);blockedTab=false;pendingLink=null;refresh();
}
async function holdConflict(base,local,remote,headId,kind='remote'){
 const data={stored:rawLocal(),base:base===undefined?null:clone(base),unknown:base===undefined,local:clone(local),remote:clone(remote),headId,kind,at:now()};
 await backup('Conflit — deux versions conservées',local,{remote:clone(remote),base:data.base});state.conflict=data;if(kind==='tab')state.idbOnly=true;await persist();setStatus('conflict','Conflits à résoudre — deux versions conservées');showConflicts();
}
async function syncLocked(manual){
 if(!navigator.onLine){setStatus('offline','Hors ligne — modifications conservées sur cet appareil');return;}
 let identity;try{identity=signedIdentity();}catch(e){setStatus('server',e.message);return;}
 if(!identity){setStatus('auth',root.cloudReady?.()?'Connexion requise — modifications locales conservées':'Local uniquement — configurez le Cloud');if(manual){if(root.cloudReady?.())root.openAuth();else root.openCloudSettings();}return;}
 if(!manual&&!root.cloudCfg().auto){setStatus('paused','Synchronisation automatique désactivée');return;}
 if(blockedTab){setStatus('account','Autre compte ouvert dans un onglet — rechargez cette page');return;}
 if(pendingLink){if(manual)showLink();return;}
 if(state?.conflict){setStatus('conflict','Conflits à résoudre — deux versions conservées');if(manual)showConflicts();return;}
 if(editing()){setStatus('pending','Modifications en attente — synchronisation après la saisie');schedule(3000);return;}
 setStatus('syncing','Synchronisation en cours…');
 for(let attempt=0;attempt<5;attempt++){
  const result=await rpc(identity),head=result.head,remote=head?biz(head.payload):defaults();
  if(editing()){setStatus('pending','Réception différée pendant la saisie');schedule(3000);return;}
  if(!await establish(identity,head))return;
  const tabMerge=M.merge(lastSeen,current(),rawLocal());if(tabMerge.conflicts.length){await holdConflict(lastSeen,current(),rawLocal(),null,'tab');return;}if(!eq(current(),tabMerge.value)){replaceLocal(tabMerge.value);refresh();}
  const local=current(),base=state.base===null?undefined:state.base,merged=M.merge(base,local,remote);
  if(merged.conflicts.length){await holdConflict(base,local,remote,head?.id??null);return;}
  if(!eq(local,merged.value))await backup('Avant réception et fusion Cloud',local);
  if(signedIdentity()?.scope!==identity.scope)throw Object.assign(new Error('Compte changé — réception annulée.'),{kind:'account'});
  if(!eq(current(),local))continue;
  state.base=clone(remote);state.headId=head?.id??null;
  if(!eq(local,merged.value)){replaceLocal(merged.value,head?.payload?.saved||now());refresh();}
  await persist();
  if(eq(merged.value,remote)){
   state.lastOk=now();state.conflict=null;await persist();if(eq(current(),remote)){setStatus('clean','À jour — données locales et Cloud concordantes');return;}setStatus('pending','Nouvelles modifications en attente');schedule(300);return;
  }
  // Any edits during the request remain queued: only the acknowledged snapshot becomes the base.
  const sent=current(),payload={...root.payLoad(),payload:{...sent,saved:root.store.saved||now(),_sti_sync:{version:1,operation:uid(),base:state.headId}}};
  const ack=await rpc(identity,true,payload,state.headId);
  if(signedIdentity()?.scope!==identity.scope){setStatus('account','Compte changé — synchronisation suspendue');return;}
  if(ack.status==='retry')continue;
  if(ack.status!=='committed'||!ack.head)throw Object.assign(new Error('Envoi non confirmé ; modifications conservées.'),{kind:'network'});
  state.base=clone(sent);state.headId=String(ack.head.id);state.lastOk=now();await persist();
  if(eq(current(),sent)){setStatus('clean','À jour — données locales et Cloud concordantes');return;}
  setStatus('pending','Nouvelles modifications en attente');
 }
 setStatus('pending','D’autres appareils travaillent — nouvelle tentative prévue');schedule(5000);
}
async function request(manual=false){await ready;if(!db){setStatus('storage','Stockage durable indisponible — exportez vos données');return;}if(busy){if(manual)setStatus('syncing','Synchronisation déjà en cours…');return;}busy=true;
 try{await queue;if(navigator.locks)await navigator.locks.request('sti-sync-'+(scope||'local'),()=>syncLocked(manual));else await syncLocked(manual);}
 catch(e){if(e.kind==='auth'){setStatus('auth',e.message);if(manual)root.openAuth();}else if(['server','account'].includes(e.kind))setStatus(e.kind,e.message);else if(e.name==='QuotaExceededError'||e.name==='InvalidStateError')storageFailure(e);else{setStatus(navigator.onLine?'pending':'offline','Échange interrompu — modifications conservées, nouvelle tentative prévue');schedule(15000);}}
 finally{busy=false;}
}
function beforeSave(o){if(!initDone||!lastSeen)return true;
 let pin;try{pin=localStorage.getItem(PIN);}catch(e){}
 if(blockedTab||(pin&&pin!==scope)){blockedTab=true;backup('Brouillon protégé — autre compte dans un onglet',biz(o)).catch(storageFailure);setStatus('account','Autre compte ouvert : brouillon conservé. Rechargez avant de continuer.');return false;}
 const local=biz(o),other=rawLocal(),m=M.merge(lastSeen,local,other);
 if(m.conflicts.length){holdConflict(lastSeen,local,other,null,'tab').catch(storageFailure);return false;}
 for(const k of FIELDS)o[k]=clone(m.value[k]);lastSeen=biz(o);return true;
}
function localChanged(){const data=current();lastSeen=clone(data);if(!initDone){ready.then(localChanged);return;}state.local=data;state.idbOnly=!eq(rawLocal(),data);persist().then(()=>{if(!state.conflict)setStatus(navigator.onLine?'pending':'offline',navigator.onLine?'Modifications en attente de synchronisation':'Hors ligne — modifications enregistrées sur cet appareil');schedule();}).catch(storageFailure);}
function dialog(){let d=el('sti-sync-dialog');if(!d){d=document.createElement('dialog');d.id='sti-sync-dialog';d.className='sti-sync-dialog';d.setAttribute('aria-labelledby','sti-sync-title');document.body.appendChild(d);}return d;}
function show(html){const d=dialog();d.innerHTML=html;if(!d.open)d.showModal();}
const closeButton='<button type="button" class="btn btn-line" data-sync="close">Plus tard</button>';
function showLink(){if(!pendingLink)return;const p=pendingLink;show(`<h2 id="sti-sync-title">${p.changedOwner?'Changer d’espace personnel':'Première synchronisation'}</h2><p>Compte : <strong>${esc(p.identity.email)}</strong></p><p>${p.changedOwner?'Les données actuellement affichées appartiennent à un autre espace. Elles seront archivées sur cet appareil ; elles ne seront pas envoyées à ce nouveau compte.':'Ce navigateur contient déjà des données. Rien ne sera écrasé sans votre choix. Une copie locale sera conservée avant la reprise.'}</p><div class="sti-sync-actions">${!p.changedOwner?'<button class="btn btn-blue" data-sync="link-merge">Fusionner mes données avec ce compte</button>':''}<button class="btn btn-line" data-sync="link-remote">Ouvrir les données de ce compte</button>${closeButton}</div><p class="tiny muted">S’il existe une copie locale en attente pour ce compte, elle est reprise et comparée au Cloud, jamais ignorée.</p>`);}
function describe(x){return x.absent?'Élément supprimé / absent':typeof x.value==='string'?x.value:JSON.stringify(x.value,null,2);}
function label(path){const names={seances:'Fiches',notes:'Notes',presences:'Présences',eleves:'Élèves',epreuves:'Épreuves',profil:'Profil',classes:'Classes',times:'Horaires',contenu:'Contenu',devoirs:'Devoirs',obs:'Observations',done:'Statut assuré',title:'Titre'};return path.map(x=>names[x]||x.replace(/^@/,'Élément ')).join(' › ')||'Ensemble des données';}
function showConflicts(){const conflictScope=scope,c=state?.conflict;if(!c)return;const m=M.merge(c.unknown?undefined:c.base,c.local,c.remote);show(`<h2 id="sti-sync-title">Choisir les versions à conserver</h2><p>${m.conflicts.length} conflit(s). Les deux versions sont sauvegardées sur cet appareil. Les changements compatibles sont déjà combinés dans la proposition.</p><form id="sti-conflict-form">${m.conflicts.map((x,i)=>`<fieldset><legend>${esc(label(x.path))}</legend><div class="sti-conflict-pair"><label><input required type="radio" name="choice-${i}" value="local"><strong>Cet appareil / votre brouillon</strong><pre>${esc(describe(x.local))}</pre></label><label><input required type="radio" name="choice-${i}" value="remote"><strong>${c.kind==='tab'?'Autre onglet':'Cloud / autre appareil'}</strong><pre>${esc(describe(x.remote))}</pre></label></div></fieldset>`).join('')}<div class="sti-sync-actions"><button class="btn btn-blue" type="submit">Valider mes choix et synchroniser</button><button class="btn btn-line" type="button" data-sync="export">Exporter les deux versions</button>${closeButton}</div></form>`);
 el('sti-conflict-form').onsubmit=async e=>{e.preventDefault();const chosen={};m.conflicts.forEach((x,i)=>chosen[x.key]=new FormData(e.target).get('choice-'+i));const resolved=M.merge(c.unknown?undefined:c.base,c.local,c.remote,chosen);if(resolved.conflicts.length)return;
 try{if(scope!==conflictScope||blockedTab){dialog().close();return;}await backup('Avant application des choix de conflit',current(),{conflict:c});if(scope!==conflictScope||blockedTab){dialog().close();return;}const latest=M.merge(c.local,current(),resolved.value);if(latest.conflicts.length){dialog().close();await holdConflict(c.local,current(),resolved.value,c.headId,c.kind);return;}if(c.kind==='remote'){state.base=clone(c.remote);state.headId=c.headId;}const crossTab=M.merge(c.stored||c.local,latest.value,rawLocal());if(crossTab.conflicts.length){for(const k of FIELDS)root.store[k]=clone(latest.value[k]);dialog().close();await holdConflict(c.stored||c.local,latest.value,rawLocal(),null,'tab');return;}state.conflict=null;replaceLocal(crossTab.value,now());await persist();dialog().close();refresh();setStatus('pending','Choix conservés — synchronisation en attente');schedule(100);}catch(error){storageFailure(error);}};
}
async function exportBackups(){const rows=await allBackups();const payload={format:'sti-sauvegardes-locales-v1',exporte:now(),courant:current(),versions:rows};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='STI-versions-locales-'+now().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
async function cacheStatus(){if(!navigator.serviceWorker?.controller)return null;return new Promise(resolve=>{const mc=new MessageChannel();const t=setTimeout(()=>resolve(null),3000);mc.port1.onmessage=e=>{clearTimeout(t);resolve(e.data);};navigator.serviceWorker.controller.postMessage({type:'OFFLINE_STATUS'},[mc.port2]);});}
async function details(){if(state?.conflict){showConflicts();return;}if(pendingLink){showLink();return;}const cache=await cacheStatus();show(`<h2 id="sti-sync-title">Hors ligne & synchronisation</h2><p>${badge()}</p><ul><li>En attente : ${state?.base&&!eq(current(),state.base)?'des modifications locales':!state?.base?'association initiale à confirmer':'aucune différence connue avec la dernière base reçue'}.</li><li>Compte lié : ${esc(state?.owner?.email||'aucun — données locales non associées')}.</li><li>Interface hors ligne : ${cache?.ready?'prête':'non confirmée — terminez le premier chargement en ligne'}.</li><li>PDF disponibles hors ligne : ${cache?cache.documents+' / '+cache.totalDocuments:'non vérifié'}.</li></ul><p>La synchronisation reprend lorsque l’application est ouverte, Internet disponible et le compte connecté. Une fenêtre de saisie ouverte retarde la réception pour protéger votre brouillon.</p><p class="tiny muted">Les copies locales ne sont pas chiffrées par l’application. Sur un appareil partagé, protégez votre session système. Ne videz pas les données du navigateur tant que des changements sont en attente.</p><div class="sti-sync-actions"><button class="btn btn-blue" data-sync="now">Synchroniser maintenant</button><button class="btn btn-line" data-sync="export">Exporter les versions locales</button><button class="btn btn-line" data-sync="cache">Retélécharger les documents hors ligne</button>${closeButton}</div>`);}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-sync]');if(!b)return;try{switch(b.dataset.sync){case'close':dialog().close();break;case'now':dialog().close();await request(true);break;case'details':await details();break;case'export':await exportBackups();break;case'cache':navigator.serviceWorker?.controller?.postMessage({type:'CACHE_DOCUMENTS',force:true});b.textContent='Téléchargement demandé ; vérifiez ensuite le compteur';break;case'link-merge':case'link-remote':{const p=pendingLink;if(!p)return;if(signedIdentity()?.scope!==p.identity.scope){dialog().close();pendingLink=null;setStatus('account','Compte changé — relancez la synchronisation');return;}await activate(p.identity,p.head,b.dataset.sync==='link-merge'?'merge':'remote');dialog().close();schedule(100);break;}}}catch(error){storageFailure(error);}});
window.addEventListener('online',()=>schedule(300));window.addEventListener('offline',()=>setStatus('offline','Hors ligne — modifications conservées sur cet appareil'));
window.addEventListener('focus',()=>schedule(500));document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(500);});
window.addEventListener('storage',e=>{if(e.key===PIN&&e.newValue&&e.newValue!==scope){blockedTab=true;setStatus('account','Autre compte ouvert dans un onglet — rechargez cette page');}if(e.key===KEY&&initDone&&!blockedTab){if(editing())return;const other=rawLocal(),m=M.merge(lastSeen,current(),other);if(m.conflicts.length){holdConflict(lastSeen,current(),other,null,'tab').catch(storageFailure);return;}if(!eq(current(),m.value)){replaceLocal(m.value);refresh();localChanged();}}});
async function init(){lastSeen=current();try{db=await setupDB();scope=localStorage.getItem(PIN)||'unbound';state=await read('scopes',scope)||{id:scope,owner:null,base:null,headId:null,local:current(),conflict:null,lastOk:null};if(state.idbOnly){replaceLocal(state.local);refresh();}await persist();initDone=true;readyResolve();if(state.conflict)setStatus('conflict','Conflits à résoudre — deux versions conservées');else setStatus(navigator.onLine?'pending':'offline',navigator.onLine?'Vérification du Cloud en attente':'Hors ligne — données locales disponibles');schedule(1200);setInterval(()=>{if(!document.hidden)schedule(100);},30000);}
 catch(e){initDone=true;readyResolve();storageFailure(e);}}
root.STI_SYNC={canUpdate:()=>!editing()&&!busy,flush:()=>persist(),request,beforeSave,localChanged,badge,renderStatus,details,onLogin:()=>{pendingLink=null;return request(true);},onLogout:()=>setStatus('auth','Déconnecté — modifications conservées sur cet appareil'),status:()=>({...status,scope,lastOk:state?.lastOk||null,pending:state?.base?!eq(current(),state.base):true,conflicts:state?.conflict?M.merge(state.conflict.unknown?undefined:state.conflict.base,state.conflict.local,state.conflict.remote).conflicts.length:0}),ready};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
