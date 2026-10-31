const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function moteur() {
  const window = { STI_DATA: {}, document: { readyState: 'loading', addEventListener() {} } };
  const fichiers = [
    'data/livres-sti.js', 'data/competences.js', 'data/docs.js', 'data/annexes.js',
    'assets/suivi-annexes.js', 'assets/global-search.js'
  ];
  fichiers.forEach(f => vm.runInNewContext(fs.readFileSync(f, 'utf8'), { window }, { filename: f }));
  return window.STI_SEARCH;
}

const CONTEXTE = {
  tabs: [{ id: 'v-suivi', t: 'Suivi des notions' }, { id: 'v-eleves', t: 'Mes classes &amp; élèves' }],
  sessions: {
    '3SI1': [
      { n: 1, iso: '2026-10-06', tri: 1, blk: { t: 'Découvrir le HTML5', d: 'Structure', det: 'balises sémantiques', o: 'séance 1' } },
      { n: 2, iso: '2026-10-13', tri: 1, blk: { t: 'Feuilles de style CSS3', d: 'Mise en forme', det: 'sélecteurs', o: 'séance 2' } }
    ]
  },
  store: {
    eleves: { '3SI1': [{ id: 'e1', nom: 'Ben Salah', prenom: 'Amina', groupe: 1, pc: 'PC-03' }] }
  }
};

test('les textes sont comparés sans accents ni balises', () => {
  const s = moteur();
  assert.equal(s.normalize('  Séance   Élève '), 'seance eleve');
  assert.equal(s.plain('<b>Réseaux</b> &amp; IoT'), 'Réseaux & IoT');
  assert.equal(s.plain('3<sup>ème</sup> année'), '3 ème année');
  assert.equal(s.plain('<div>'), '<div>');
});

test('l’index couvre les onglets, séances, notions, annexes, compétences, documents et élèves', () => {
  const s = moteur();
  const index = s.buildIndex(CONTEXTE);
  const types = new Set(index.map(e => e.type));
  ['Onglet', 'Séance', 'Notion', 'Annexe', 'Compétence', 'Document', 'Élève'].forEach(t =>
    assert.ok(types.has(t), 'type manquant : ' + t));
  assert.ok(index.length > 300);
  assert.ok(index.filter(e => e.type === 'Annexe').length === 234);
  const seance = index.find(e => e.type === 'Séance' && e.action.n === 2);
  assert.match(seance.label, /Séance 2 · Feuilles de style CSS3/);
  assert.equal(seance.sub, '3SI1 · 2026-10-13 · T1');
  const eleve = index.find(e => e.type === 'Élève');
  assert.equal(eleve.label, 'Ben Salah Amina');
  assert.equal(eleve.sub, '3SI1 · groupe 1 · PC-03');
  assert.deepEqual({ ...eleve.action }, { kind: 'student', cls: '3SI1', id: 'e1' });
});

test('la recherche classe les meilleurs résultats d’abord, sans tenir compte des accents', () => {
  const s = moteur();
  const index = s.buildIndex(CONTEXTE);
  const resultats = s.search(index, 'css');
  assert.ok(resultats.length > 0);
  assert.match(resultats[0].label.toLowerCase(), /css/);

  const onglet = s.search(s.buildIndex(CONTEXTE), 'mes classes eleves')[0];
  assert.equal(onglet.type, 'Onglet');
  assert.match(onglet.label, /Mes classes/);

  const notion = s.search(s.buildIndex(CONTEXTE), 'balise html')[0];
  assert.ok(['Notion', 'Séance', 'Annexe'].includes(notion.type));

  const seance = s.search(index, 'seance 2 feuilles')[0];
  assert.equal(seance.type, 'Séance');
});

test('la recherche renvoie un résultat par notion exacte et respecte la limite', () => {
  const s = moteur();
  const index = s.buildIndex(CONTEXTE);
  assert.equal(s.search(index, '').length, 0);
  assert.equal(s.search(index, '   ').length, 0);
  assert.ok(s.search(index, 'html').length <= s.limite);
  assert.ok(s.search(index, 'a', 3).length <= 3);

  const exact = s.search(index, '3si-r001')[0];
  assert.equal(exact.type, 'Notion');
  assert.deepEqual({ ...exact.action }, { kind: 'notion', cls: '3SI1', id: '3si-r001' });
});

test('chaque entrée porte une action ouvrable', () => {
  const s = moteur();
  s.buildIndex(CONTEXTE).forEach(e => {
    assert.ok(e.action && typeof e.action.kind === 'string', 'action absente pour ' + e.label);
    assert.ok(['view', 'session', 'notion', 'annexe', 'document', 'student'].includes(e.action.kind));
  });
});

test('le contexte peut être mémorisé pour l’interface', () => {
  const s = moteur();
  assert.equal(s.setContext(CONTEXTE), CONTEXTE);
  assert.equal(s.context().store, CONTEXTE.store);
});
