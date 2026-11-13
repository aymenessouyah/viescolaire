const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const page = read('Carnet de liens/carnet.html');
const moduleSource = read('assets/liens-cloud.js');
const app = read('assets/app.js');
const sw = read('sw.js');
const migration = read('supabase/migrations/20261112_liens_utiles.sql');

/* Charge le module client avec un faux Cloud en mémoire. */
function chargerModule({ lignes = [], echec = null, id = 'prof-a' } = {}) {
  const appels = [];
  const store = lignes.slice();
  const fetch = async (url, options = {}) => {
    appels.push({ url, method: options.method || 'GET' });
    if (echec) return { ok: false, status: echec, json: async () => ({}) };
    const u = new URL(url);
    const meth = (options.method || 'GET').toUpperCase();
    const rep = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
    if (meth === 'GET') return rep(store.slice());
    if (meth === 'POST') {
      const l = JSON.parse(options.body);
      const n = Object.assign({ id: 'id-' + (store.length + 1), created_at: 'c', updated_at: 'c' }, l);
      store.push(n); return rep([n], 201);
    }
    if (meth === 'PATCH') {
      const lid = decodeURIComponent(u.searchParams.get('id').replace('eq.', ''));
      const i = store.findIndex(x => x.id === lid);
      if (i < 0) return rep([]);
      Object.assign(store[i], JSON.parse(options.body)); return rep([store[i]]);
    }
    if (meth === 'DELETE') {
      const lid = decodeURIComponent(u.searchParams.get('id').replace('eq.', ''));
      const i = store.findIndex(x => x.id === lid);
      if (i >= 0) store.splice(i, 1);
      return rep('');
    }
    return rep('', 404);
  };
  const root_ = {
    cloudCfg: () => ({ url: 'https://projet.supabase.co', key: 'cle-publique' }),
    authSession: () => ({ user: { id } }),
    authToken: async () => 'jeton',
    fetch, URL
  };
  vm.runInNewContext(moduleSource, { window: root_, URL, fetch, console });
  return { api: root_.STI_LIENS, store, appels };
}

test('la page existe, est liée au site et se charge sans ressource manquante', () => {
  assert.match(page, /<html lang="fr">/);
  assert.match(page, /Mon carnet de liens/);
  assert.match(page, /STI V2\.0 By A'e/);
  assert.match(page, /<script src="\.\.\/assets\/liens-cloud\.js"><\/script>/);
  // toutes les ressources référencées existent réellement
  for (const m of page.matchAll(/(?:src|href)="(\.\.[^"]+)"/g)) {
    const rel = decodeURIComponent(m[1]).replace(/^\.\.\//, '');
    assert.ok(fs.existsSync(path.join(root, rel)), 'ressource absente : ' + rel);
  }
});

test('le bouton est dans le menu, juste après « Mon cours Ai »', () => {
  const iCarnet = app.indexOf('Mon carnet de liens</span>');
  const iAi = app.indexOf('Mon cours Ai</span>');
  assert.ok(iCarnet > 0, 'le libellé du bouton doit exister');
  assert.ok(iAi > 0);
  // un test existant impose que le cours Ai reste collé au ternaire de l'onglet
  // Agent ; le carnet vient donc immédiatement après, dans le même bloc.
  assert.ok(iCarnet > iAi, 'le carnet suit le cours Ai');
  assert.ok(iCarnet - iAi < 600, 'les deux boutons se suivent dans le même bloc');
  assert.equal(app.match(/Mon carnet de liens<\/span>/g).length, 1, 'un seul bouton');
  assert.match(app, /Carnet%20de%20liens\/carnet\.html/);
  // même apparence que le bouton du cours Ai
  const bloc = app.slice(iCarnet - 400, iCarnet);
  assert.match(bloc, /tab vs-course-ai/);
  // et la page est mise en cache hors ligne
  assert.match(sw, /\.\/Carnet%20de%20liens\/carnet\.html/);
  assert.match(sw, /\.\/assets\/liens-cloud\.js/);
});

test('la migration protège la table : RLS, quatre politiques, anon exclu', () => {
  assert.match(migration, /create table if not exists public\.liens_utiles/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on public\.liens_utiles from public, anon/);
  for (const p of ['select', 'insert', 'update', 'delete']) {
    assert.match(migration, new RegExp('create policy "liens_utiles_' + p + '"'));
  }
  // les URL non http(s) sont refusées par la base elle-même
  const regle = migration.split('\n').find(l => l.includes('url ~*'));
  assert.ok(regle, 'la contrainte sur l’URL doit exister dans la migration');
  assert.ok(regle.includes('^https?:'), 'le schéma http(s) doit être exigé');
  assert.ok(regle.includes('space'), 'les espaces doivent être interdits');
});

test('les adresses dangereuses sont refusées', () => {
  const { api } = chargerModule();
  for (const mauvaise of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'ftp://x.tn',
    'https://', 'https://exem ple.tn', 'entree.tn', 'mailto:a@b.tn']) {
    assert.throws(() => api.normaliserUrl(mauvaise), /./, 'aurait dû refuser : ' + mauvaise);
  }
  assert.equal(api.normaliserUrl('  https://developer.mozilla.org/fr/  '), 'https://developer.mozilla.org/fr/');
  assert.equal(api.normaliserUrl('http://exemple.tn'), 'http://exemple.tn');
});

test('titre obligatoire, longueurs bornées, catégorie inconnue ramenée à Autre', () => {
  const { api } = chargerModule();
  assert.throws(() => api.valider({ titre: '   ', url: 'https://a.tn' }), /titre/i);
  assert.throws(() => api.valider({ titre: 'x'.repeat(121), url: 'https://a.tn' }), /titre/i);
  assert.throws(() => api.valider({ titre: 'ok', url: 'https://a.tn', description: 'x'.repeat(301) }), /description/i);
  const l = api.valider({ titre: ' Titre ', url: 'https://a.tn', categorie: 'Inconnue' });
  assert.equal(l.categorie, 'Autre');
  assert.equal(l.titre, 'Titre');
});

test('ajouter, modifier et supprimer parlent à la table du professeur', async () => {
  const { api, store, appels } = chargerModule();
  assert.deepEqual(await api.lister(), []);

  const cree = await api.ajouter({ titre: 'MDN', url: 'https://developer.mozilla.org/fr/', categorie: 'Références', description: 'Doc' });
  assert.equal(store.length, 1);
  assert.equal(cree.titre, 'MDN');
  assert.equal(store[0].prof_id, 'prof-a', 'le propriétaire est envoyé explicitement');

  const modifie = await api.modifier(cree.id, { titre: 'MDN HTML', url: 'https://developer.mozilla.org/fr/docs/Web/HTML', categorie: 'Références', description: '' });
  assert.equal(modifie.titre, 'MDN HTML');
  assert.equal(store[0].titre, 'MDN HTML');

  assert.equal(await api.supprimer(cree.id), true);
  assert.equal(store.length, 0);

  // aucune requête ne vise un autre professeur
  for (const a of appels) if (a.method !== 'POST') assert.ok(a.url.includes('prof_id'), 'filtre prof_id absent : ' + a.url);
});

test('une erreur Cloud est remontée, jamais masquée', async () => {
  for (const [statut, motif] of [[401, /reconnectez/i], [404, /migration/i], [500, /HTTP 500/]]) {
    const { api } = chargerModule({ echec: statut });
    await assert.rejects(() => api.lister(), motif);
  }
});

test('la page ne dessine jamais un lien sans échappement', () => {
  // le titre et l'adresse passent par esc() dans le rendu
  assert.match(page, /function esc\(/);
  const rendu = page.slice(page.indexOf('function rendre()'), page.indexOf('function charger()'));
  assert.match(rendu, /esc\(l\.titre\)/);
  assert.match(rendu, /esc\(l\.url\)/);
  assert.match(rendu, /rel="noopener noreferrer"/);
  // et le rendu insère du texte, jamais du HTML issu de la base
  assert.doesNotMatch(rendu, /innerHTML\s*=\s*l\./);
});
