/* Sauvegarde hebdomadaire Google Drive — autorisation et données restent propres à chaque professeur.
   Les jetons OAuth ne sont conservés qu'en mémoire ; aucune clé privée n'est embarquée dans l'application. */
(function(root){
'use strict';
const WEEK_MS=7*24*60*60*1000;
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME='Espace pédagogique STI - Sauvegardes';
const PREF_PREFIX='sti_drive_backup_v1:';
const el=id=>document.getElementById(id);
let token='',tokenExpiresAt=0,gisPromise=null,checkPromise=null,dialogMode='',needsUserAction=false,lastCheckAt=0,promptedForKey='';
let statusValue={text:'En attente de vérification',kind:'pending'};

function clientId(){return String(root.STI_SUPABASE?.googleDriveClientId||'').trim();}
function activeSnapshot(){try{return root.STI_SYNC?.backupSnapshot?.()||null;}catch(error){return null;}}
function storageKey(snapshot){return PREF_PREFIX+encodeURIComponent(snapshot.userId)+':'+encodeURIComponent(snapshot.schoolYear);}
function readPrefs(snapshot){try{return JSON.parse(localStorage.getItem(storageKey(snapshot))||'{}')||{};}catch(error){return {};}}
function writePrefs(snapshot,prefs){try{localStorage.setItem(storageKey(snapshot),JSON.stringify(prefs));return true;}catch(error){return false;}}
function isDue(createdAt,now=Date.now()){
  if(!createdAt)return true;
  const time=typeof createdAt==='number'?createdAt:Date.parse(createdAt);
  return !Number.isFinite(time)||now-time>=WEEK_MS;
}
function setStatus(text,kind='pending'){
  statusValue={text,kind};
  const node=el('sti-drive-status');
  if(node){node.textContent=text;node.dataset.state=kind;node.classList.remove('b-green','b-amber','b-blue','b-grey','b-rose');node.classList.add(({ok:'b-green',warning:'b-amber',pending:'b-blue',idle:'b-grey'})[kind]||'b-grey');}
}
function status(){return {...statusValue};}
function dialog(){return el('drive-backup-dialog');}
function setMessage(text,kind='info'){
  const node=el('drive-backup-message');
  if(!node)return;
  node.textContent=text||'';
  node.dataset.state=kind;
  node.hidden=!text;
}
function setActions({primary='',secondary='',later='Fermer'}={}){
  const p=el('drive-backup-primary'),s=el('drive-backup-secondary'),l=el('drive-backup-later');
  if(p){p.textContent=primary;p.hidden=!primary;p.disabled=false;}
  if(s){s.textContent=secondary;s.hidden=!secondary;s.disabled=false;}
  if(l){l.textContent=later;l.hidden=!later;l.disabled=false;}
}
function showDialog(mode,{message='',messageKind='info'}={}){
  const d=dialog();if(!d)return;
  dialogMode=mode;setMessage(message,messageKind);
  const title=el('drive-backup-title'),description=el('drive-backup-description');
  if(mode==='configuration'){
    if(title)title.textContent='Sauvegarde hebdomadaire dans Google Drive';
    if(description)description.textContent='Cette option attend la configuration OAuth Google de l’application. Aucune donnée n’est envoyée pour le moment.';
    setActions({later:'Fermer'});
    setMessage('Le responsable de l’application doit activer l’API Google Drive et renseigner un Client ID OAuth Web public dans supabase/config.js. Ne publiez aucun secret client.', 'warning');
  }else if(mode==='unavailable'){
    if(title)title.textContent='Espace professeur non prêt';
    if(description)description.textContent='Connectez-vous et laissez la synchronisation de votre espace se terminer avant de gérer les sauvegardes Drive.';
    setActions({later:'Fermer'});
  }else if(mode==='consent'){
    if(title)title.textContent='Activer la sauvegarde hebdomadaire ?';
    if(description)description.textContent='Avec votre accord, une copie JSON complète de vos données professeur sera créée dans le compte Google Drive que vous choisirez, maintenant puis au plus une fois tous les 7 jours. Chaque copie porte une date et toutes les versions sont conservées. Votre accord est mémorisé sur cet appareil.';
    setActions({primary:'Donner mon accord et choisir mon Drive',later:'Pas maintenant'});
  }else{
    if(title)title.textContent='Sauvegarde Drive activée';
    if(description)description.textContent='Les copies datées sont gardées dans le dossier privé « Espace pédagogique STI - Sauvegardes ». Une nouvelle copie est créée après 7 jours, à la prochaine ouverture en ligne de l’application.';
    setActions({primary:'Sauvegarder maintenant',secondary:'Désactiver sur cet appareil',later:'Fermer'});
  }
  if(!d.open){try{d.showModal();}catch(error){d.setAttribute('open','');}}
}
function closeDialog(){const d=dialog();if(!d)return;try{if(d.open)d.close();else d.removeAttribute('open');}catch(error){d.removeAttribute('open');}dialogMode='';}
function deferConsent(days=30){
  const snapshot=activeSnapshot();
  if(snapshot){const old=readPrefs(snapshot);writePrefs(snapshot,{...old,enabled:false,consentStatus:'later',dismissedUntil:Date.now()+days*24*60*60*1000});}
  setStatus('Non activée — vous pouvez donner votre accord depuis les réglages','idle');
  closeDialog();
}
function editingTeacherData(){
  return !!document.querySelector('.modal.on,dialog[open]:not(#drive-backup-dialog)')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
}
function loadGoogleIdentity(){
  if(root.google?.accounts?.oauth2)return Promise.resolve();
  if(gisPromise)return gisPromise;
  gisPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;
    script.onload=()=>root.google?.accounts?.oauth2?resolve():reject(new Error('Le service d’autorisation Google n’a pas démarré.'));
    script.onerror=()=>reject(new Error('Impossible de charger le service Google. Vérifiez la connexion Internet.'));
    document.head.appendChild(script);
  }).catch(error=>{gisPromise=null;throw error;});
  return gisPromise;
}
function requestToken(prompt=''){
  const id=clientId();if(!id)return Promise.reject(new Error('Configuration Google OAuth manquante.'));
  if(!prompt&&token&&Date.now()<tokenExpiresAt-60000)return Promise.resolve(token);
  const start=()=>new Promise((resolve,reject)=>{
    let settled=false;
    const fail=error=>{if(settled)return;settled=true;reject(error instanceof Error?error:new Error('Autorisation Google interrompue.'));};
    try{
      const client=root.google.accounts.oauth2.initTokenClient({
        client_id:id,scope:DRIVE_SCOPE,
        callback:response=>{
          if(settled)return;
          if(response?.error){fail(Object.assign(new Error('L’accès Google Drive a été refusé ou doit être autorisé à nouveau.'),{code:response.error,tokenFailure:true}));return;}
          if(!response?.access_token){fail(Object.assign(new Error('Google n’a pas renvoyé de jeton d’accès.'),{tokenFailure:true}));return;}
          settled=true;token=response.access_token;tokenExpiresAt=Date.now()+(Number(response.expires_in)||3600)*1000;needsUserAction=false;resolve(token);
        },
        error_callback:error=>fail(Object.assign(new Error(error?.type==='popup_failed_to_open'?'La fenêtre Google a été bloquée. Autorisez les fenêtres pop-up puis réessayez.':'Autorisation Google interrompue.'),{code:error?.type||'google_popup',tokenFailure:true}))
      });
      client.requestAccessToken(prompt?{prompt}:{prompt:'none'});
    }catch(error){fail(error);}
  });
  /* Si GIS est déjà chargé, l'appel de popup reste dans le geste utilisateur courant. */
  if(root.google?.accounts?.oauth2)return start();
  return loadGoogleIdentity().then(start);
}
function googleError(error){
  if(!root.navigator?.onLine)return 'Connexion Internet requise : la copie sera réessayée lorsque l’application sera ouverte en ligne.';
  if(error?.code==='popup_closed_by_user'||error?.code==='access_denied')return 'Autorisation Google annulée. Aucune copie n’a été envoyée.';
  if(error?.code==='popup_failed_to_open'||error?.code==='google_popup')return error.message||'Autorisation Google interrompue.';
  return error?.message||'La sauvegarde Google Drive a échoué. Réessayez plus tard.';
}
async function driveRequest(url,options={},accessToken=token){
  const headers={...(options.headers||{}),Authorization:'Bearer '+accessToken};
  const response=await fetch(url,{...options,headers});
  if(!response.ok){if(response.status===401)token='';const message=response.status===401?'Autorisation Google expirée. Ouvrez la gestion Drive pour réessayer.':response.status===403?'Accès refusé par Google Drive. Vérifiez l’autorisation de votre compte et la configuration OAuth.':response.status===429?'Limite temporaire de Google Drive atteinte. Réessayez plus tard.':'Google Drive est temporairement indisponible ('+response.status+').';throw Object.assign(new Error(message),{httpStatus:response.status});}
  if(response.status===204)return null;
  return response.json();
}
function filesUrl(query,orderBy='createdTime desc'){
  const params=new URLSearchParams({q:query,spaces:'drive',pageSize:'10',orderBy,fields:'files(id,name,mimeType,createdTime)'});
  return 'https://www.googleapis.com/drive/v3/files?'+params.toString();
}
async function findOrCreateFolder(accessToken){
  const name=FOLDER_NAME.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const data=await driveRequest(filesUrl("name = '"+name+"' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"),{},accessToken);
  if(data?.files?.length)return data.files[0].id;
  const created=await driveRequest('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:FOLDER_NAME,mimeType:'application/vnd.google-apps.folder',description:'Copies hebdomadaires privées de l’Espace pédagogique STI.'})
  },accessToken);
  if(!created?.id)throw new Error('Google Drive n’a pas créé le dossier de sauvegarde.');
  return created.id;
}
async function latestBackup(folderId,accessToken){
  const query="'"+String(folderId).replace(/'/g,"\\'")+"' in parents and name contains 'sti-backup-' and trashed = false";
  const result=await driveRequest(filesUrl(query),{},accessToken);
  return result?.files?.[0]||null;
}
function backupFilename(date=new Date()){
  return 'sti-backup-'+date.toISOString().replace(/[:.]/g,'-')+'.json';
}
async function uploadSnapshot(snapshot,folderId,accessToken){
  const filename=backupFilename();
  const payload={format:'sti-professor-backup-v1',exportedAt:new Date().toISOString(),schoolYear:snapshot.schoolYear,applicationVersion:root.APP_VER||null,data:snapshot.data};
  const boundary='sti_drive_'+(root.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
  const metadata={name:filename,mimeType:'application/json',parents:[folderId],description:'Sauvegarde datée de l’Espace pédagogique STI'};
  const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(metadata)+'\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(payload,null,2)+'\r\n--'+boundary+'--';
  const result=await driveRequest('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime',{
    method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body
  },accessToken);
  if(!result?.id)throw new Error('Google Drive n’a pas confirmé la création de la copie.');
  return result;
}
function dateLabel(value){const date=new Date(value);return Number.isNaN(date.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium'}).format(date);}
function dueLabel(value){const due=new Date(Date.parse(value)+WEEK_MS);return Number.isNaN(due.getTime())?'à vérifier':dateLabel(due.toISOString());}
async function runAutomaticCheck(){
  const snapshot=activeSnapshot();if(!snapshot)return;
  const prefs=readPrefs(snapshot);if(!prefs.enabled)return;
  if(!clientId()){setStatus('Configuration Google requise','warning');return;}
  if(!root.navigator?.onLine){setStatus('En attente de connexion Internet','warning');return;}
  if(editingTeacherData()){setStatus('En attente de la fin de votre saisie','pending');return;}
  if(needsUserAction){setStatus('Autorisation Google requise — ouvrir les réglages','warning');return;}
  try{
    const accessToken=await requestToken('');
    const current=activeSnapshot();if(!current||current.userId!==snapshot.userId||current.schoolYear!==snapshot.schoolYear)return;
    const folderId=await findOrCreateFolder(accessToken);
    const latest=await latestBackup(folderId,accessToken);
    if(latest&&!isDue(latest.createdTime)){
      setStatus('Active — prochaine copie à partir du '+dueLabel(latest.createdTime),'ok');return;
    }
    if(editingTeacherData())return;
    const fresh=activeSnapshot();if(!fresh||fresh.userId!==snapshot.userId||fresh.schoolYear!==snapshot.schoolYear||!readPrefs(fresh).enabled)return;
    const created=await uploadSnapshot(fresh,folderId,accessToken);
    setStatus('Copie créée le '+dateLabel(created.createdTime||new Date().toISOString()),'ok');
    if(dialogMode==='enabled')setMessage('Votre copie datée a été créée dans votre dossier Google Drive. Les anciennes versions sont conservées.','success');
  }catch(error){
    if(error?.tokenFailure||error?.httpStatus===401)needsUserAction=true;
    const message=googleError(error);setStatus(needsUserAction?'Autorisation Google requise — ouvrir les réglages':'En attente — '+message,'warning');
    if(dialogMode==='enabled')setMessage(message,'warning');
  }
}
function check(force=false){
  const now=Date.now();if(checkPromise)return checkPromise;
  if(!force&&now-lastCheckAt<5*60*1000)return Promise.resolve();
  lastCheckAt=now;
  checkPromise=runAutomaticCheck().finally(()=>{checkPromise=null;});
  return checkPromise;
}
async function enable(){
  const snapshot=activeSnapshot();if(!snapshot){showDialog('unavailable');return;}
  if(!clientId()){showDialog('configuration');return;}
  if(!root.navigator?.onLine){setMessage('Une connexion Internet est nécessaire pour autoriser Google Drive.','warning');return;}
  const primary=el('drive-backup-primary'),later=el('drive-backup-later');if(primary)primary.disabled=true;if(later)later.disabled=true;
  setMessage('Ouverture de l’autorisation Google…','info');
  let consentGranted=false;
  try{
    const accessToken=await requestToken('consent select_account');
    const current=activeSnapshot();if(!current||current.userId!==snapshot.userId||current.schoolYear!==snapshot.schoolYear)throw new Error('Le compte professeur a changé. Reconnectez-vous avant de continuer.');
    consentGranted=true;
    writePrefs(current,{enabled:true,consentStatus:'enabled',dismissedUntil:0});
    const folderId=await findOrCreateFolder(accessToken);
    const created=await uploadSnapshot(current,folderId,accessToken);
    setStatus('Copie créée le '+dateLabel(created.createdTime||new Date().toISOString()),'ok');
    showDialog('enabled',{message:'Votre accord est enregistré sur cet appareil et la première copie datée a été créée dans votre Drive. Les versions précédentes ne seront pas supprimées.',messageKind:'success'});
  }catch(error){
    const message=googleError(error);
    if(consentGranted){
      setStatus('Sauvegarde activée — première copie à réessayer','warning');
      showDialog('enabled',{message:'Votre accord est enregistré, mais la première copie n’a pas abouti : '+message+' Elle sera réessayée lorsque l’application sera ouverte en ligne.',messageKind:'warning'});
    }else{
      if(error?.code==='popup_closed_by_user'||error?.code==='access_denied'){
        const current=activeSnapshot();if(current)writePrefs(current,{...readPrefs(current),enabled:false,consentStatus:'later',dismissedUntil:Date.now()+24*60*60*1000});
      }
      showDialog('consent',{message,messageKind:'warning'});
    }
  }finally{if(primary)primary.disabled=false;if(later)later.disabled=false;}
}
async function backupNow(){
  const snapshot=activeSnapshot();if(!snapshot){showDialog('unavailable');return;}
  if(!clientId()){showDialog('configuration');return;}
  if(!root.navigator?.onLine){setMessage('Connectez-vous à Internet pour lancer la sauvegarde.','warning');return;}
  const primary=el('drive-backup-primary'),secondary=el('drive-backup-secondary');if(primary)primary.disabled=true;if(secondary)secondary.disabled=true;
  setMessage('Recherche du dossier puis préparation de la copie…','info');
  try{
    needsUserAction=false;
    const accessToken=await requestToken('select_account');
    const current=activeSnapshot();if(!current||current.userId!==snapshot.userId||current.schoolYear!==snapshot.schoolYear)throw new Error('Le compte professeur a changé. Reconnectez-vous avant de continuer.');
    const folderId=await findOrCreateFolder(accessToken);
    const created=await uploadSnapshot(current,folderId,accessToken);
    setStatus('Copie créée le '+dateLabel(created.createdTime||new Date().toISOString()),'ok');
    setMessage('La nouvelle copie datée a été créée. Toutes les anciennes versions sont conservées.','success');
  }catch(error){if(error?.tokenFailure||error?.httpStatus===401)needsUserAction=true;setStatus(needsUserAction?'Autorisation Google requise — ouvrir les réglages':'Sauvegarde impossible — réessayez plus tard','warning');setMessage(googleError(error),'warning');}
  finally{if(primary)primary.disabled=false;if(secondary)secondary.disabled=false;}
}
function disable(){
  const snapshot=activeSnapshot();if(snapshot)writePrefs(snapshot,{...readPrefs(snapshot),enabled:false,consentStatus:'disabled',dismissedUntil:0});
  token='';tokenExpiresAt=0;needsUserAction=false;setStatus('Sauvegarde Drive désactivée','idle');closeDialog();
}
function openSettings(){
  const snapshot=activeSnapshot();
  if(!snapshot){showDialog('unavailable');return;}
  if(!clientId()){showDialog('configuration');return;}
  if(readPrefs(snapshot).enabled)showDialog('enabled',{message:statusValue.text,messageKind:statusValue.kind});
  else showDialog('consent');
}
function workspaceReady(){
  const snapshot=activeSnapshot();if(!snapshot){if(!root.isProfessorConnected?.())setStatus('Disponible après connexion professeur','idle');return;}
  if(!clientId()){setStatus('Configuration Google requise','warning');return;}
  const prefs=readPrefs(snapshot);
  if(prefs.consentStatus==='later'&&Number(prefs.dismissedUntil)<=Date.now())promptedForKey='';
  if(prefs.enabled){if(!lastCheckAt||Date.now()-lastCheckAt>=5*60*1000)setStatus('Sauvegarde Drive activée — vérification…','pending');void check(false);return;}
  if(prefs.consentStatus==='disabled'||prefs.consentStatus==='later'&&Number(prefs.dismissedUntil)>Date.now()){
    setStatus(prefs.consentStatus==='disabled'?'Sauvegarde Drive désactivée':'Accord reporté — gérer dans les réglages','idle');return;
  }
  if(editingTeacherData()){setStatus('Accord Drive disponible dans les réglages','idle');return;}
  setStatus('Votre accord est demandé pour Google Drive','warning');
  const key=storageKey(snapshot);
  if(promptedForKey!==key&&!dialog()?.open){promptedForKey=key;showDialog('consent');}
}
function bindDialog(){
  const d=dialog();if(!d||d.dataset.driveBound)return;d.dataset.driveBound='true';
  el('drive-backup-later')?.addEventListener('click',()=>{if(dialogMode==='consent')deferConsent();else closeDialog();});
  el('drive-backup-primary')?.addEventListener('click',()=>{if(dialogMode==='consent')void enable();else if(dialogMode==='enabled')void backupNow();});
  el('drive-backup-secondary')?.addEventListener('click',()=>disable());
  d.addEventListener('cancel',event=>{event.preventDefault();if(dialogMode==='consent')deferConsent();else closeDialog();});
  d.addEventListener('click',event=>{if(event.target===d){if(dialogMode==='consent')deferConsent();else closeDialog();}});
}
function init(){
  bindDialog();
  if(clientId())void loadGoogleIdentity().catch(()=>{});
  /* Le coordinateur hors ligne appelle workspaceReady() après chaque échange Cloud.
     Cela évite de sauvegarder un état local avant la fusion initiale avec Supabase. */
}
function onLogout(){token='';tokenExpiresAt=0;needsUserAction=false;promptedForKey='';closeDialog();setStatus('Disponible après connexion professeur','idle');}
root.STI_DRIVE_BACKUP={openSettings,workspaceReady,onLogout,check,status,policy:Object.freeze({isDue,weekMs:WEEK_MS,scope:DRIVE_SCOPE})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
