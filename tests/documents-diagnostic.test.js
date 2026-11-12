const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

test('une vérification partielle ne s’annonce jamais comme une absence de fichier', () => {
  const src = read('assets/fiche-devoir-documents.js');
  // le rendu doit disposer d'un état « je ne sais pas »
  assert.match(src, /function incomplete\(\)/);
  // et ne plus afficher « aucun fichier disponible » quand une source a échoué
  const draw = src.slice(src.indexOf('function draw()'), src.indexOf('async function refresh()'));
  assert.match(draw, /incomplete\(\) \?/);
  assert.match(draw, /Impossible de vérifier les fichiers/);
  // le cas « aucun fichier » reste réservé aux vérifications complètes
  assert.match(draw, /label \+ ' : aucun fichier disponible\.'/);
});

test('le diagnostic des documents teste projet, compte, année et séances', () => {
  const app = read('assets/app.js');
  const html = read('index.html');
  assert.match(app, /async function runDocsDiagnostic/);
  assert.match(app, /window\.runDocsDiagnostic = runDocsDiagnostic/);
  assert.match(html, /runDocsDiagnostic\(this\)/);
  assert.match(html, /id="cfg-diag-out"/);
  // les quatre maillons doivent être vérifiés
  for (const sonde of [/Projet interrogé/, /Compte :/, /Année scolaire utilisée/, /séance/, /statusForSessions/]) {
    assert.match(app, sonde);
  }
  // un projet local différent du fichier publié doit être signalé
  assert.match(app, /Ce n'est pas le projet publié/);
});

test('Cloud en panne et aucun fichier local : message de vérification impossible, jamais « aucun fichier »', async () => {
  const vm = require('node:vm');
  const records = new Map(); let init = false;
  const db = () => ({ createObjectStore() {}, close() {}, transaction() {
    const tx = { error: null, objectStore() { return {
      get() { const r = {}; setImmediate(() => { r.result = undefined; r.onsuccess?.(); setImmediate(() => tx.oncomplete?.()); }); return r; },
      put() {}
    }; } };
    return tx;
  } });
  const idb = { open() { const r = {}; setImmediate(() => { r.result = db(); if (!init) { init = true; r.onupgradeneeded?.(); } r.onsuccess?.(); }); return r; } };
  const fakeWindow = {
    indexedDB: idb,
    STI_FICHE_CLOUD: { async listMany() { throw new Error('Cloud inaccessible. Vérifiez la connexion et réessayez.'); } },
    activeProfessorProfile: () => ({ prof_id: 'prof-a' }),
    seanceVerrouillee: () => false,
    renderCahier() {},
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
    setTimeout
  };
  const fakeDocument = { createElement: () => ({ setAttribute() {}, click() {}, remove() {} }), body: { appendChild() {} } };
  vm.runInNewContext(read('assets/fiche-devoir-documents.js'), { window: fakeWindow, document: fakeDocument, setTimeout, console, Blob });
  const host = { isConnected: true, innerHTML: '', addEventListener() {} };
  fakeWindow.STI_FICHE_DEVOIR_DOCUMENTS.mount(host, { cls: '4SI2', n: 12, blk: { k: 'dc' } }, { forceDevoir: true });
  await new Promise(r => setTimeout(r, 40));
  await new Promise(r => setTimeout(r, 40));
  assert.doesNotMatch(host.innerHTML, /aucun fichier disponible/);
  assert.match(host.innerHTML, /Impossible de vérifier les fichiers/);
  assert.match(host.innerHTML, /Cloud inaccessible/);
});

/* --- Non-régression : le diagnostic doit s'exécuter pour de vrai ---------------- */
const vmMod = require('node:vm');
function extraireDiagnostic(source) {
  const i = source.indexOf('async function runDocsDiagnostic');
  const marque = 'window.runDocsDiagnostic = runDocsDiagnostic;';
  const j = source.indexOf(marque) + marque.length;
  assert.ok(i > 0 && j > i, 'la fonction de diagnostic doit exister');
  return source.slice(i, j).replace(marque, 'this.runDiag = runDocsDiagnostic;');
}

function executerDiagnostic(overrides = {}) {
  let txt = '';
  const out = { set textContent(v) { txt = v; }, get textContent() { return txt; } };
  const document = { getElementById: id => (id === 'cfg-diag-out' ? out : null) };
  const window = Object.assign({
    STI_SUPABASE: { url: 'https://oaahxobzbnmaohcmdrbu.supabase.co' },
    SCHOOL: { annee: '2026 - 2027' },
    STI_FICHES: { clsCourante: () => '4SI2' },
    SESSIONS: { '4SI2': [{ n: 12, blk: { k: 'dc' } }] },
    authSession: () => ({ user: { id: 'dabeb3f7-d0ac', email: 'aymenessouyah@gmail.com' }, expires_at: Math.floor(Date.now() / 1000) + 9999 }),
    authValid: () => true,
    activeProfessorProfile: () => ({ prof_id: 'dabeb3f7-d0ac' }),
    STI_FICHE_DEVOIR_DOCUMENTS: {
      isDevoir: s => s.blk && s.blk.k === 'dc',
      statusForSessions: async () => ({ data: { '4SI2|12': { enonce: [{ name: 'a.pdf' }], ressources: [{ name: 'b.rar' }] } }, cloudError: '', localError: '' })
    }
  }, overrides.window || {});
  const ctx = { window, document,
    cloudCfg: overrides.cloudCfg || (() => ({ url: 'https://oaahxobzbnmaohcmdrbu.supabase.co', key: 'k' })),
    console, JSON, String, Object, Array };
  vmMod.createContext(ctx);
  vmMod.runInContext(extraireDiagnostic(read('assets/app.js')), ctx);
  return ctx.runDiag(null).then(res => ({ res, txt }));
}

test('le diagnostic s’exécute réellement, va au bout et ne laisse pas « en cours… »', async () => {
  const { res, txt } = await executerDiagnostic();
  assert.doesNotMatch(res, /is not defined/, 'aucune référence hors portée');
  assert.doesNotMatch(res, /interrompu/, 'le diagnostic doit parcourir toutes les étapes');
  assert.match(res, /Projet interrogé : oaahxobzbnmaohcmdrbu/);
  assert.match(res, /C'est bien le projet publié/);
  assert.match(res, /Compte : aymenessouyah@gmail\.com/);
  assert.match(res, /Profil professeur reconnu/);
  assert.match(res, /2 fichier\(s\) visible\(s\)/);
  assert.doesNotMatch(txt, /Diagnostic en cours/, 'le message d’attente doit disparaître');
  assert.match(txt, /fichier\(s\) visible\(s\)/);
});

test('une fonction d’authentification absente n’interrompt plus le diagnostic', async () => {
  // cas réel du rapport : la fonction existait mais hors de portée
  const { res } = await executerDiagnostic({ window: { authSession: undefined, authValid: undefined, activeProfessorProfile: undefined } });
  assert.doesNotMatch(res, /is not defined/);
  assert.match(res, /Projet interrogé/);
  assert.match(res, /Année scolaire utilisée/);
  assert.match(res, /Fichiers non vérifiés/);
});

test('le diagnostic est défini à l’intérieur du module, pas après sa fermeture', () => {
  const src = read('assets/app.js');
  const fin = src.lastIndexOf('})();');
  const debut = src.indexOf('async function runDocsDiagnostic');
  assert.ok(debut > 0 && debut < fin, 'la fonction doit être dans l’IIFE pour voir cloudCfg et authValid');
});
