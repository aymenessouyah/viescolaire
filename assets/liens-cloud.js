/* Carnet de liens utiles du professeur — lecture et écriture dans la table
   Supabase `liens_utiles` (voir supabase/migrations/20261112_liens_utiles.sql).
   Aucune clé service_role ici : ce sont les règles RLS qui protègent la table.
   Aucune écriture optimiste : on n'affiche un lien qu'après confirmation de la
   base, et une erreur est toujours remontée telle quelle. */
(function (root) {
'use strict';
const TABLE = 'liens_utiles';
const CATEGORIES = ['Cours', 'Exercices', 'Outils', 'Références', 'Autre'];
const MAX_TITRE = 120, MAX_URL = 2048, MAX_DESC = 300;

/* ---------- accès Cloud ---------- */
function identity() {
  const cfg = root.cloudCfg?.();
  const user = root.authSession?.()?.user;
  if (!cfg?.url || !cfg?.key) throw new Error('Aucun projet Cloud configuré sur cet appareil.');
  if (!user?.id) throw new Error('Connectez votre profil professeur pour gérer le carnet.');
  return { url: String(cfg.url).replace(/\/$/, ''), key: cfg.key, uid: String(user.id) };
}
function same(a) {
  try { const b = identity(); return a.url === b.url && a.uid === b.uid && a.key === b.key; }
  catch (_) { return false; }
}
async function request(id, path, options = {}) {
  if (!same(id)) throw new Error('Compte ou projet Cloud changé : rechargez la page.');
  const token = await root.authToken?.();
  if (!token || !same(id)) throw new Error('Session expirée : reconnectez-vous.');
  const headers = Object.assign({ apikey: id.key, Authorization: 'Bearer ' + token }, options.headers || {});
  let response;
  try { response = await root.fetch(id.url + '/rest/v1/' + path, Object.assign({}, options, { headers })); }
  catch (_) { throw new Error('Cloud inaccessible. Vérifiez la connexion et réessayez.'); }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Accès refusé : reconnectez-vous.');
    if (response.status === 404 || response.status === 400) throw new Error('Carnet indisponible : la migration Supabase liens_utiles n’est pas installée sur ce projet.');
    if (response.status === 409) throw new Error('Ce lien a changé sur un autre appareil. Rechargez et réessayez.');
    throw new Error('Erreur Cloud (HTTP ' + response.status + '). Réessayez.');
  }
  if (!same(id)) throw new Error('Compte ou projet Cloud changé : rechargez la page.');
  return response;
}
const enc = encodeURIComponent;

/* ---------- validation (miroir des contraintes SQL) ---------- */
function nettoyer(champ) {
  const v = champ == null ? '' : String(champ);
  return v.replace(/[\u0000-\u001f\u007f]/g, '').trim();
}
function normaliserUrl(brut) {
  const url = nettoyer(brut);
  if (!url) throw new Error('L’adresse du lien est obligatoire.');
  if (url.length > MAX_URL) throw new Error('Adresse trop longue (2048 caractères au maximum).');
  if (!/^https?:\/\//i.test(url)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) throw new Error('Seules les adresses http:// et https:// sont acceptées.');
    throw new Error('L’adresse doit commencer par https:// (ou http://).');
  }
  if (/[\s<>"']/.test(url)) throw new Error('L’adresse ne doit contenir ni espace ni caractère « < », « > », guillemet.');
  let parse;
  try { parse = new URL(url); } catch (_) { throw new Error('Adresse illisible.'); }
  if (!parse.hostname || parse.hostname.indexOf('.') < 0) throw new Error('Adresse incomplète : indiquez le domaine complet, par exemple https://www.exemple.tn.');
  return url;
}
function valider(champ) {
  const titre = nettoyer(champ.titre);
  if (!titre) throw new Error('Le titre est obligatoire.');
  if (titre.length > MAX_TITRE) throw new Error('Titre trop long (120 caractères au maximum).');
  const description = nettoyer(champ.description);
  if (description.length > MAX_DESC) throw new Error('Description trop longue (300 caractères au maximum).');
  const categorie = CATEGORIES.includes(nettoyer(champ.categorie)) ? nettoyer(champ.categorie) : 'Autre';
  return { titre, url: normaliserUrl(champ.url), categorie, description };
}

/* ---------- opérations ---------- */
function ligneVersLien(r) {
  return {
    id: r.id, titre: r.titre, url: r.url, categorie: r.categorie,
    description: r.description || '', ordre: r.ordre || 0,
    cree: r.created_at, modifie: r.updated_at
  };
}
async function lister() {
  const id = identity();
  const query = 'select=id,titre,url,categorie,description,ordre,created_at,updated_at' +
    '&prof_id=eq.' + enc(id.uid) + '&order=categorie.asc,ordre.asc,created_at.asc';
  const response = await request(id, TABLE + '?' + query);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('Réponse Cloud invalide.');
  if (!same(id)) throw new Error('Compte changé pendant le chargement.');
  return rows.map(ligneVersLien);
}
async function ajouter(champ) {
  const id = identity(), propre = valider(champ);
  const response = await request(id, TABLE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(Object.assign({}, propre, { prof_id: id.uid }))
  });
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows.length) throw new Error('Le lien n’a pas été enregistré.');
  return ligneVersLien(rows[0]);
}
async function modifier(lienId, champ) {
  if (!lienId) throw new Error('Lien inconnu.');
  const id = identity(), propre = valider(champ);
  const response = await request(id, TABLE + '?id=eq.' + enc(lienId) + '&prof_id=eq.' + enc(id.uid), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(propre)
  });
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows.length) throw new Error('Ce lien n’existe plus : rechargez la liste.');
  return ligneVersLien(rows[0]);
}
async function supprimer(lienId) {
  if (!lienId) throw new Error('Lien inconnu.');
  const id = identity();
  await request(id, TABLE + '?id=eq.' + enc(lienId) + '&prof_id=eq.' + enc(id.uid), { method: 'DELETE' });
  return true;
}
root.STI_LIENS = {
  CATEGORIES, TABLE, MAX_TITRE, MAX_URL, MAX_DESC,
  valider, normaliserUrl, nettoyer,
  lister, ajouter, modifier, supprimer,
  _test: { identity, request, ligneVersLien }
};
})(typeof window !== 'undefined' ? window : globalThis);
