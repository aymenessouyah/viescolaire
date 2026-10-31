const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const { chargerAide, markdown } = require('../tools/aide-md.js');

function stubDom() {
  const nodes = {};
  const noeud = id => nodes[id] || (nodes[id] = {
    id, innerHTML: '', value: '', textContent: '', dataset: {},
    classList: { add() {}, remove() {}, contains: () => false },
    addEventListener() {}, focus() {}, hasAttribute: () => false,
    setAttribute() {}, removeAttribute() {}
  });
  return {
    nodes,
    readyState: 'complete',
    getElementById: noeud,
    querySelector: () => ({ id: 'v-cours' }),
    addEventListener() {},
    body: { classList: { add() {}, remove() {} } }
  };
}

function interfaceAide() {
  const contexte = { print() {}, go(vue) { contexte.__vue = vue; } };
  contexte.document = stubDom();
  contexte.window = contexte;
  vm.createContext(contexte);
  ['data/aide.js', 'assets/help.js'].forEach(f =>
    vm.runInContext(fs.readFileSync(f, 'utf8'), contexte, { filename: f }));
  contexte.__dom = contexte.document;
  return contexte;
}

test('le guide couvre tous les onglets de l’application', () => {
  const aide = chargerAide();
  const app = fs.readFileSync('assets/app.js', 'utf8');
  const bloc = /const TABS = \[([\s\S]*?)\];/.exec(app)[1];
  const vues = [...bloc.matchAll(/id:"([^"]+)"/g)].map(m => m[1]);
  assert.ok(vues.length >= 16, 'onglets détectés : ' + vues.length);
  const couvertes = new Set(aide.sections.map(s => s.vue).filter(Boolean));
  const manquantes = vues.filter(v => !couvertes.has(v));
  assert.deepEqual(manquantes, [], 'onglets sans rubrique d’aide : ' + manquantes.join(', '));
});

test('chaque rubrique est complète et les identifiants sont uniques', () => {
  const aide = chargerAide();
  const ids = aide.sections.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length, 'identifiants en double');
  const cats = new Set(aide.categories.map(c => c.id));
  aide.sections.forEach(s => {
    assert.ok(s.categorie && cats.has(s.categorie), s.id + ' : catégorie inconnue');
    assert.ok(s.titre && s.titre.length > 3, s.id + ' : titre manquant');
    assert.ok(s.resume && s.resume.length > 15, s.id + ' : résumé trop court');
    assert.ok(Array.isArray(s.etapes) && s.etapes.length >= 2, s.id + ' : moins de deux étapes');
    (s.etapes || []).forEach(e => assert.ok(typeof e === 'string' && e.trim().length > 10, s.id + ' : étape vide'));
    (s.astuces || []).forEach(a => assert.ok(typeof a === 'string' && a.trim().length > 10, s.id + ' : astuce vide'));
  });
  assert.ok(aide.faq.length >= 3);
  aide.faq.forEach(item => assert.ok(item.q && item.r));
});

test('la recherche ignore accents et majuscules et accepte plusieurs mots', () => {
  const { STI_HELP } = interfaceAide();
  assert.equal(STI_HELP.search('').length, STI_HELP.sections().length);
  const accents = STI_HELP.search('PRESENCES').map(s => s.id);
  assert.ok(accents.includes('presences'));
  const bilan = STI_HELP.search('bilan trimestre').map(s => s.id);
  assert.ok(bilan.includes('bilan'));
  assert.equal(STI_HELP.search('zzzzz').length, 0);
  assert.equal(STI_HELP.pourVue('v-cahier').id, 'cahier');
});

test('la fenêtre d’aide affiche la rubrique de l’écran courant et filtre le sommaire', () => {
  const contexte = interfaceAide();
  const { STI_HELP } = contexte;
  assert.equal(STI_HELP.open(), true);
  const article = contexte.__dom.nodes['aide-article'].innerHTML;
  assert.match(article, /Suivi des cours et fiches de séance|Ouvrir l’écran concerné/);
  assert.match(contexte.__dom.nodes['aide-sommaire'].innerHTML, /Premiers pas/);

  assert.equal(STI_HELP.open('bilan'), true);
  assert.match(contexte.__dom.nodes['aide-article'].innerHTML, /Bilan de fin de trimestre/);
  assert.match(contexte.__dom.nodes['aide-article'].innerHTML, /Imprimer \/ PDF/);

  STI_HELP.filtrer('presence');
  const sommaire = contexte.__dom.nodes['aide-sommaire'].innerHTML;
  assert.match(sommaire, /Appel et présences/);
  assert.doesNotMatch(sommaire, /Tableau de bord/);
  assert.equal(STI_HELP.courante(), STI_HELP.search('presence')[0].id);
  assert.match(STI_HELP.search('presence')[0].titre, /pr[ée]sence/i);
  assert.match(contexte.__dom.nodes['aide-compte'].textContent.trim(), /^[12] rubrique\(s\) trouvée\(s\)$/);
  assert.match(contexte.__dom.nodes['aide-article'].innerHTML, /pr[ée]sence/i);
});

test('le bouton d’aide est présent dans la page et dans le menu du compte', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  assert.match(index, /id="btn-aide"[^>]*onclick="STI_HELP\.toggle\(\)"/);
  assert.match(index, /<dialog id="aide-dialog"/);
  assert.match(index, /id="aide-sommaire"/);
  assert.match(index, /id="aide-article"/);
  assert.match(index, /<script src="data\/aide\.js"><\/script>/);
  assert.match(index, /<script src="assets\/help\.js"><\/script>/);
  assert.match(index, /href="assets\/help\.css"/);
  assert.match(index, /Aide et guide/);
  assert.match(fs.readFileSync('assets/help.js', 'utf8'), /event\.key === 'F1'/);
});

test('le cache hors ligne embarque le guide', () => {
  const worker = fs.readFileSync('sw.js', 'utf8');
  ['"./assets/help.css"', '"./assets/help.js"', '"./data/aide.js"'].forEach(fichier =>
    assert.ok(worker.includes(fichier), 'absent du cache : ' + fichier));
});

test('docs/AIDE-ENSEIGNANT.md est identique au contenu de data/aide.js', () => {
  const attendu = markdown(chargerAide());
  const ecrit = fs.readFileSync('docs/AIDE-ENSEIGNANT.md', 'utf8');
  assert.equal(ecrit, attendu, 'régénérer avec : node tools/aide-md.js');
  assert.match(ecrit, /^# Guide du professeur/);
  assert.match(ecrit, /## Questions fréquentes/);
});
