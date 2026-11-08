/* Stockage privé Supabase des documents de séance. Aucun service_role dans le client. */
(function (root) {
'use strict';
const BUCKET = 'documents-seances', TABLE = 'documents_seance', MAX = 10 * 1024 * 1024;
function identity() {
  const cfg = root.cloudCfg?.(), user = root.authSession?.()?.user, profile = root.activeProfessorProfile?.();
  if (!cfg?.url || !cfg.key || !cfg.auth || !user?.id || !profile) throw new Error('Connectez votre compte professeur et configurez le Cloud sécurisé.');
  const year = String(root.SCHOOL?.annee || '');
  if (!year) throw new Error('Année scolaire indisponible.');
  return {url: cfg.url.replace(/\/$/, ''), key: cfg.key, uid: String(user.id), year};
}
function same(a) {
  try { const b = identity(); return a.url === b.url && a.uid === b.uid && a.key === b.key && a.year === b.year; }
  catch (_) { return false; }
}
async function request(id, path, options = {}) {
  if (!same(id)) throw new Error('Compte ou projet Cloud changé : rechargez la page.');
  const token = await root.authToken?.();
  if (!token || !same(id)) throw new Error('Session expirée ou compte changé : reconnectez-vous.');
  const headers = Object.assign({apikey: id.key, Authorization: 'Bearer ' + token}, options.headers || {});
  let response;
  try { response = await root.fetch(id.url + path, Object.assign({}, options, {headers})); }
  catch (_) { throw new Error('Cloud inaccessible. Vérifiez la connexion et réessayez.'); }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Accès Cloud refusé : reconnectez-vous et vérifiez les droits du stockage.');
    if (response.status === 404 || response.status === 400) throw new Error('Stockage des documents indisponible : vérifiez que la migration Supabase est installée.');
    if (response.status === 409) throw new Error('Ce document a changé sur un autre appareil. Actualisez et réessayez.');
    throw new Error('Erreur Cloud (HTTP ' + response.status + '). Réessayez.');
  }
  if (!same(id)) throw new Error('Compte ou projet Cloud changé : rechargez la page.');
  return response;
}
const enc = encodeURIComponent;
const storagePath = path => '/storage/v1/object/' + BUCKET + '/' + path.split('/').map(enc).join('/');
async function deleteObject(id, path) {
  return request(id, '/storage/v1/object/' + BUCKET, {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({prefixes:[path]})});
}
function sessionParts(key) {
  const m = /^(3SI1|4SI2)\|(\d+)$/.exec(key);
  if (!m || +m[2] < 1 || +m[2] > 200) throw new Error('Séance invalide.');
  return {classe: m[1], seance: +m[2]};
}
async function listMany(keys) {
  const id = identity();
  keys.forEach(sessionParts);
  const rows = []; let offset = 0;
  do {
    const params = new URLSearchParams({select:'id,annee,classe,seance,categorie,nom,chemin,taille', prof_id:'eq.'+id.uid, annee:'eq.'+id.year, order:'id.asc', limit:'500', offset:String(offset)});
    const response = await request(id, '/rest/v1/' + TABLE + '?' + params);
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error('Réponse Cloud invalide.');
    rows.push(...page); offset += page.length;
    if (page.length < 500) break;
  } while (true);
  const result = Object.fromEntries(keys.map(key => [key, {}]));
  rows.forEach(row => {
    const key = row.classe + '|' + row.seance;
    if (!Object.prototype.hasOwnProperty.call(result, key) || !['enonce','ressources','correction'].includes(row.categorie)) return;
    (result[key][row.categorie] ||= []).push({name:row.nom, path:row.chemin, id:row.id, size:row.taille, source:'cloud'});
  });
  return result;
}
async function upload(key, type, file, previous = null, canCommit = () => true) {
  const id = identity(), session = sessionParts(key);
  if (!['enonce','ressources','correction'].includes(type) || !file?.name || file.name.length > 255 || !file.size || file.size > MAX) throw new Error('Fichier invalide ou supérieur à 10 Mo.');
  if (!root.crypto?.randomUUID) throw new Error('Navigateur incompatible avec le stockage sécurisé.');
  const path = id.uid + '/' + root.crypto.randomUUID();
  if (!canCommit()) throw new Error('Séance indisponible ou trimestre verrouillé.');
  await request(id, storagePath(path), {method:'POST', headers:{'Content-Type':'application/octet-stream','x-upsert':'false'}, body:file.blob || file});
  if (!canCommit()) throw new Error('Séance indisponible ou trimestre verrouillé : fichier non associé.');
  const payload = {prof_id:id.uid, annee:id.year, classe:session.classe, seance:session.seance, categorie:type, nom:file.name, chemin:path, taille:file.size};
  const query = previous ? '?id=eq.'+enc(previous.id)+'&chemin=eq.'+enc(previous.path) : '';
  let saved;
  try {
    const response = await request(id, '/rest/v1/' + TABLE + query, {method:previous?'PATCH':'POST',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(payload)});
    saved = await response.json();
    if (!Array.isArray(saved) || saved.length !== 1) throw new Error('Ce document a changé sur un autre appareil. Actualisez et réessayez.');
  } catch (error) {
    /* Une réponse perdue peut masquer un succès : ne jamais supprimer un objet
       qui pourrait être référencé. L'ancien fichier n'est pas supprimé. */
    throw new Error('Enregistrement Cloud à vérifier : ' + error.message);
  }
  if (previous && previous.path !== path) {
    try { await deleteObject(id, previous.path); } catch (_) { /* objet orphelin éventuel, pas de perte */ }
  }
  return saved[0];
}
async function remove(file) {
  const id = identity();
  const q = '?id=eq.'+enc(file.id)+'&chemin=eq.'+enc(file.path);
  const response = await request(id, '/rest/v1/' + TABLE + q, {method:'DELETE',headers:{Prefer:'return=representation'}});
  const removed = await response.json();
  if (!Array.isArray(removed) || removed.length !== 1) throw new Error('Ce document a changé sur un autre appareil. Actualisez et réessayez.');
  try { await deleteObject(id, file.path); }
  catch (_) { /* métadonnées supprimées : un objet orphelin est possible */ }
}
async function download(file) {
  const id = identity();
  if (!file.path?.startsWith(id.uid + '/')) throw new Error('Document invalide.');
  const response = await request(id, '/storage/v1/object/authenticated/' + BUCKET + '/' + file.path.split('/').map(enc).join('/'));
  const blob = await response.blob();
  if (!same(id)) throw new Error('Compte ou projet Cloud changé.');
  return blob;
}
root.STI_FICHE_CLOUD = { listMany, upload, remove, download };
})(typeof window !== 'undefined' ? window : globalThis);
