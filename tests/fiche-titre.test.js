/* Le titre d'une fiche pédagogique doit pouvoir être remplacé.
   Bug corrigé : la fenêtre « formulaire » ne proposait aucun champ de titre ; la
   fiche gardait donc « CSS3 — pseudo-classes… » même après avoir changé le
   contenu de la séance, tout en affichant la mention « (modifiée) ». */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const TITRE_REPARTITION = "CSS3 — pseudo-classes, pseudo-éléments et sélecteurs d'attributs";
const TITRE_SAISI = 'CSS3 — Transform, filter, transition, animation';

function node() {
  return {
    innerHTML: '', textContent: '', value: '', hidden: false, dataset: {}, style: {},
    classList: { add() {}, remove() {}, toggle() { return false; }, contains() { return false; } },
    appendChild() {}, insertAdjacentHTML() {}, setAttribute() {}, getAttribute() { return ''; },
    addEventListener() {}, removeEventListener() {}, querySelector() { return null; },
    querySelectorAll() { return []; }, focus() {}, isConnected: true
  };
}

function boot(edits) {
  const els = {};
  const document = {
    readyState: 'complete', hidden: false,
    getElementById: id => els[id] || (els[id] = node()),
    querySelector: () => null, querySelectorAll: () => [],
    createElement: () => node(), addEventListener() {},
    body: { style: {}, appendChild() {}, insertAdjacentHTML() {} },
    head: { appendChild() {} }
  };
  const localStorage = {
    data: edits ? { sti_fiches_edits_v1: JSON.stringify(edits) } : {},
    getItem(k) { return Object.prototype.hasOwnProperty.call(this.data, k) ? this.data[k] : null; },
    setItem(k, v) { this.data[k] = String(v); }
  };
  const store = { seances: {} };
  let saved = 0;
  const root = {
    STI_DATA: {
      fiches3SI1: {
        14: {
          n: 14, titre: TITRE_REPARTITION, date: '2026-11-10', tri: 1, nature: 'cours',
          domaines: 'CSS3', pages: 'p. 73', duree: 120,
          objectifs: [], methode: '', prerequis: [], criteres: [], etapes: [],
          maison: '', erreurs: [], axes: []
        }
      },
      fiches4SI2: {}
    },
    SESSIONS: { '3SI1': [{ cls: '3SI1', n: 14, iso: '2026-11-10' }], '4SI2': [] },
    store, localStorage, document, save() { saved++; }, toast() {}, addEventListener() {}
  };
  root.window = root;
  const sandbox = {
    window: root, document, localStorage, Date, Promise, console, setTimeout, clearTimeout,
    requestAnimationFrame: fn => fn(), fetch: () => Promise.reject(new Error('hors ligne')),
    MutationObserver: function () { this.observe = () => {}; }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync('assets/fiches.js', 'utf8'), sandbox, { filename: 'assets/fiches.js' });
  sandbox.window.STI_FICHES.cls('3SI1');
  return { root, sandbox, store, savedCount: () => saved };
}

const prepLine = (sandbox, n) => vm.runInContext(`window.STI_FICHES.prepText(${n}).split('\\n')[0]`, sandbox);

test('le formulaire propose un champ « titre » et le relit', () => {
  const html = fs.readFileSync('assets/fiche-formulaire.html', 'utf8');
  assert.match(html, /<label for="titre">Titre de la séance/);
  assert.match(html, /<input type="text" id="titre"/);
  const js = fs.readFileSync('assets/fiches.js', 'utf8');
  assert.match(js, /set\('titre', f\.titre \|\| ''\)/, 'le formulaire est rempli avec le titre de la fiche');
  assert.match(js, /titre: h\('titre'\)/, 'le titre saisi est relu à l’enregistrement');
  assert.match(js, /if \(d\.titre\) f\.titre = d\.titre/, 'le titre saisi remplace celui de la répartition');
});

test('le formulaire et la fiche partagent la même version', () => {
  const html = fs.readFileSync('assets/fiche-formulaire.html', 'utf8');
  const js = fs.readFileSync('assets/fiches.js', 'utf8');
  const build = /data-form-build="([^"]+)"/.exec(html)[1];
  assert.ok(js.includes(`const FORM_BUILD = '${build}'`), `FORM_BUILD doit valoir ${build}`);
});

test('sans modification, la fiche garde le titre de la répartition', () => {
  const t = boot(null);
  assert.equal(prepLine(t.sandbox, 14), 'Séance 14 — ' + TITRE_REPARTITION);
});

test('un titre enregistré dans la fiche remplace celui de la répartition', () => {
  const t = boot({ '3SI1|14': { titre: TITRE_SAISI } });
  assert.equal(prepLine(t.sandbox, 14), 'Séance 14 — ' + TITRE_SAISI);
  assert.equal(t.sandbox.window.STI_FICHES.edits()['3SI1|14'].titre, TITRE_SAISI);
});

test('la liste, les sélecteurs d’impression et la recherche suivent le titre enregistré', () => {
  /* la liste est reconstruite à partir des fiches effectives, pas des données brutes */
  const js = fs.readFileSync('assets/fiches.js', 'utf8');
  assert.match(js, /function list\(\) \{ return Object\.values\(base\(\)\)\.map\(b => fiche\(b\.n\)\)/);
});

test('la fiche « modifiée » dont le titre n’a pas bougé suit le titre saisi dans le cahier', () => {
  /* cas signalé : fiche marquée (modifiée), titre resté celui de la répartition,
     alors que la séance a été renommée « Transform, filter, transition, animation » */
  const t = boot({ '3SI1|14': { titre: TITRE_REPARTITION, modules: 'CSS3' } });
  t.store.seances['3SI1|14'] = { title: TITRE_SAISI, titleFromFiche: false };
  assert.equal(prepLine(t.sandbox, 14), 'Séance 14 — ' + TITRE_SAISI);
});

test('un titre renommé n’est pas écrasé par la synchro du cahier de textes', () => {
  const t = boot({ '3SI1|14': { titre: TITRE_SAISI } });
  t.store.seances['3SI1|14'] = { title: TITRE_SAISI, titleFromFiche: false };
  vm.runInContext('window.STI_FICHES.fillPreparations()', t.sandbox);
  const rec = t.store.seances['3SI1|14'];
  assert.equal(rec.title, TITRE_SAISI);
  assert.equal(rec.titleFromFiche, false, 'un titre saisi à la main reste marqué comme tel');
});

test('un titre encore automatique est rafraîchi après correction de la répartition', () => {
  const t = boot(null);
  t.store.seances['3SI1|14'] = { title: 'Ancien titre prévu', titleFromFiche: true };
  vm.runInContext('window.STI_FICHES.fillPreparations()', t.sandbox);
  assert.equal(t.store.seances['3SI1|14'].title, TITRE_REPARTITION);
  assert.equal(t.store.seances['3SI1|14'].titleFromFiche, true);
});
