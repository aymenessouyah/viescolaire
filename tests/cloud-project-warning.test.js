const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const app = read('assets/app.js');
const html = read('index.html');

/* On extrait les fonctions du bloc « projet Cloud » et on les évalue dans un
   contexte minimal : c'est le comportement, pas le texte du source, qui compte. */
function bloc(source) {
  const debut = source.indexOf('const CLOUD_WARN_KEY');
  const fin = source.indexOf('function renderCloudBar()');
  assert.ok(debut > 0 && fin > debut, 'le bloc du contrôle projet doit exister');
  return source.slice(debut, fin);
}

const PUBLIE = 'https://oaahxobzbnmaohcmdrbu.supabase.co';

function espace({local = PUBLIE, publie = PUBLIE, dissuade = 0, toast = []} = {}) {
  const storage = new Map();
  if (local !== null) storage.set('sti_cloud_cfg', JSON.stringify({url: local, key: 'ancienne-cle'}));
  if (dissuade) storage.set('sti_cloud_project_warn_dismissed', String(dissuade));
  storage.set('sti_cloud_session', JSON.stringify({user: {id: 'u'}}));
  const localStorage = {
    getItem: k => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: k => storage.delete(k)
  };
  const boite = { hidden: true };
  const textes = {};
  const document = {
    getElementById: id => (id === 'cloud-project-warning' ? boite : (textes[id] = textes[id] || { textContent: '' })),
  };
  const window = { STI_SUPABASE: { url: publie, anonKey: 'cle-publiee', table: 'espace_pedagogique', auth: true } };
  const ctx = { window, document, localStorage, Date, JSON, String, Number, console };
  const vm = require('node:vm');
  vm.createContext(ctx);
  vm.runInContext('const CLOUD_KEY = "sti_cloud_cfg";' + bloc(app) +
    'function renderCloudBar(){ renderCloudProjectWarning(); }', ctx);
  vm.runInContext('this.api = {cloudProjectMismatch, renderCloudProjectWarning, adoptPublishedCloud, dismissCloudProjectWarning, publishedProject, localProject};', ctx);
  ctx.toast = t => toast.push(t);
  ctx.openAuth = () => toast.push('auth');
  ctx.authClear = () => storage.delete('sti_cloud_session');
  vm.runInContext('this.toast = undefined;', ctx);
  return { api: ctx.api, storage, boite, textes, toast, window, ctx };
}

test('aucun avertissement quand l’appareil consulte le projet publié', () => {
  const e = espace();
  assert.equal(e.api.cloudProjectMismatch(), null);
  e.api.renderCloudProjectWarning();
  assert.equal(e.boite.hidden, true);
});

test('un ancien projet mémorisé est signalé, avec les deux noms', () => {
  const e = espace({ local: 'https://vywujxmepvcbgedgmger.supabase.co' });
  const m = e.api.cloudProjectMismatch();
  assert.ok(m, 'le désaccord doit être détecté');
  assert.equal(m.pubRef, 'oaahxobzbnmaohcmdrbu');
  assert.equal(m.locRef, 'vywujxmepvcbgedgmger');
  e.api.renderCloudProjectWarning();
  assert.equal(e.boite.hidden, false);
  assert.match(e.textes['cloud-project-warning-text'].textContent, /vywujxmepvcbgedgmger/);
  assert.match(e.textes['cloud-project-warning-text'].textContent, /oaahxobzbnmaohcmdrbu/);
});

test('« plus tard » masque l’avertissement sans toucher à la configuration', () => {
  const e = espace({ local: 'https://vywujxmepvcbgedgmger.supabase.co' });
  e.api.dismissCloudProjectWarning();
  assert.equal(e.api.cloudProjectMismatch(), null);
  assert.equal(JSON.parse(e.storage.get('sti_cloud_cfg')).url, 'https://vywujxmepvcbgedgmger.supabase.co');
  // et cela reste masqué au rechargement
  assert.ok(+e.storage.get('sti_cloud_project_warn_dismissed') > Date.now());
});

test('un masquage expiré ramène l’avertissement', () => {
  const e = espace({ local: 'https://vywujxmepvcbgedgmger.supabase.co', dissuade: Date.now() - 1000 });
  assert.ok(e.api.cloudProjectMismatch());
});

test('« revenir au projet publié » reprend l’URL et la clé du dépôt, puis renvoie à la connexion', () => {
  const e = espace({ local: 'https://vywujxmepvcbgedgmger.supabase.co' });
  e.api.adoptPublishedCloud();
  const cfg = JSON.parse(e.storage.get('sti_cloud_cfg'));
  assert.equal(cfg.url, PUBLIE);
  assert.equal(cfg.key, 'cle-publiee');
  assert.equal(cfg.auth, true);
  assert.equal(cfg.table, 'espace_pedagogique');
  // l'ancienne session appartenait à l'autre projet : elle est effacée
  assert.equal(e.storage.get('sti_cloud_session'), undefined);
  assert.equal(e.api.cloudProjectMismatch(), null);
});

test('sans projet publié, rien n’est écrasé', () => {
  const e = espace({ local: 'https://vywujxmepvcbgedgmger.supabase.co', publie: '' });
  assert.equal(e.api.cloudProjectMismatch(), null, 'pas de comparaison sans référence publiée');
});

test('la page prévoit le bandeau, son texte et les trois actions', () => {
  assert.match(html, /id="cloud-project-warning"/);
  assert.match(html, /id="cloud-project-warning-text"/);
  assert.match(html, /adoptPublishedCloud\(\)/);
  assert.match(html, /openCloudSettings\(\)/);
  assert.match(html, /dismissCloudProjectWarning\(\)/);
  assert.match(html, /role="alert"/);
  // et il est bien rendu à chaque rafraîchissement de la barre Cloud
  assert.match(app, /function renderCloudBar\(\)\{\s*try \{ renderCloudProjectWarning\(\); \}/);
});
