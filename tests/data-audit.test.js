const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function module() {
  const window = {};
  vm.runInNewContext(fs.readFileSync('assets/data-audit.js', 'utf8'), { window }, { filename: 'assets/data-audit.js' });
  return window.STI_DATA_AUDIT;
}

function contextePropre() {
  return {
    sessions: {
      '3SI1': [{ n: 1, iso: '2026-09-15' }, { n: 2, iso: '2026-09-22' }]
    },
    livres: { '3SI1': { items: [{ id: 'n1', label: 'Titre' }, { id: 'n2', label: 'Paragraphe' }] } },
    annexItems: [{ id: 'a1' }, { id: 'a2' }],
    store: {
      classes: [{ id: '3SI1' }],
      seances: { '3SI1|1': { done: true, notions: ['n1'], annexes: ['a1'] } },
      eleves: { '3SI1': [{ id: 's1', nom: 'Ben Salah' }] },
      epreuves: { '3SI1': [{ id: 'e1', titre: 'DS', date: '2026-09-29' }] },
      notes: { e1: { s1: { n: 12 } } },
      presences: { '3SI1': { '2026-09-15': { s1: 'p' } } }
    }
  };
}

test('des données cohérentes ne signalent aucun problème', () => {
  const a = module().audit(contextePropre());
  assert.equal(a.ok, true);
  assert.equal(a.total, 0);
  assert.equal(a.stats.fiches, 1);
  assert.equal(a.stats.notions, 2);
  assert.equal(a.stats.annexes, 2);
  assert.equal(a.stats.eleves, 1);
  assert.equal(a.stats.epreuves, 1);
  assert.equal(a.stats.notes, 1);
  assert.equal(a.stats.appels, 1);
});

test('les fiches orphelines et les identifiants inconnus sont repérés', () => {
  const ctx = contextePropre();
  ctx.store.seances['3SI1|9'] = { done: true, notions: ['n1'] };
  ctx.store.seances['3SI1|1'].notions.push('inconnue');
  ctx.store.seances['3SI1|1'].annexes.push('annexe-fantome');
  const a = module().audit(ctx);
  const codes = Object.fromEntries(Array.from(a.problemes, p => [p.code, p]));
  assert.equal(a.ok, false);
  assert.equal(codes['fiche-fantome'].nombre, 1);
  assert.equal(codes['notion-inconnue'].nombre, 1);
  assert.equal(codes['annexe-inconnue'].nombre, 1);
  assert.equal(codes['fiche-fantome'].niveau, 'attention');
});

test('les doublons de référentiel, d’élèves et d’épreuves sont comptés', () => {
  const ctx = contextePropre();
  ctx.livres['3SI1'].items.push({ id: 'n1', label: 'Doublon' });
  ctx.store.eleves['3SI1'].push({ id: 's1', nom: 'Ben Salah' });
  ctx.store.epreuves['3SI1'].push({ id: 'e9', titre: 'DS', date: '2026-09-29' });
  const a = module().audit(ctx);
  const codes = Object.fromEntries(Array.from(a.problemes, p => [p.code, p]));
  assert.equal(codes['referentiel-doublon'].nombre, 1);
  assert.equal(codes['referentiel-doublon'].niveau, 'alerte');
  assert.equal(codes['eleve-doublon'].nombre, 1);
  assert.equal(codes['epreuve-doublon'].nombre, 1);
  assert.ok(a.alertes >= 2);
});

test('les notes et appels rattachés à des objets supprimés sont signalés', () => {
  const ctx = contextePropre();
  ctx.store.notes['e-supprimee'] = { s1: { n: 8 } };
  ctx.store.notes.e1['s-inconnu'] = { n: 9 };
  ctx.store.presences['3SI1']['2026-12-25'] = { s1: 'a' };
  const a = module().audit(ctx);
  const codes = Object.fromEntries(Array.from(a.problemes, p => [p.code, p]));
  assert.equal(codes['note-orpheline'].nombre, 1);
  assert.equal(codes['note-eleve-inconnu'].nombre, 1);
  assert.equal(codes['appel-hors-seance'].nombre, 1);
  assert.equal(codes['appel-hors-seance'].niveau, 'info');
});

test('l’export complet est daté, versionné et détaché du store vivant', () => {
  const m = module();
  const ctx = contextePropre();
  const paquet = m.exportBundle(ctx);
  assert.equal(paquet.format, 'espace-pedagogique-sti');
  assert.equal(paquet.formatVersion, 1);
  assert.ok(typeof paquet.exportedAt === 'string' && paquet.exportedAt.length >= 10);
  assert.equal(paquet.controle.ok, true);
  assert.equal(paquet.store.seances['3SI1|1'].done, true);
  paquet.store.seances['3SI1|1'].done = false;
  assert.equal(ctx.store.seances['3SI1|1'].done, true, 'le store d’origine ne doit pas être modifié');
  assert.equal(JSON.parse(JSON.stringify(paquet)).store.eleves['3SI1'][0].nom, 'Ben Salah');
});

test('un export actuel ou ancien est relu et validé', () => {
  const m = module();
  const paquet = m.exportBundle(contextePropre());
  const actuel = m.readBundle(JSON.stringify(paquet));
  assert.equal(actuel.ok, true);
  assert.equal(actuel.application, paquet.application);
  assert.equal(actuel.store.seances['3SI1|1'].done, true);

  const ancien = m.readBundle(JSON.stringify({ exporte: '2026-10-01', donnees: { seances: {} } }));
  assert.equal(ancien.ok, true);
  assert.ok(ancien.avertissements.some(a => /ancien/i.test(a)));
  assert.ok(ancien.avertissements.some(a => /eleves/.test(a)));
});

test('un fichier illisible ou étranger est refusé avec un message clair', () => {
  const m = module();
  const casse = m.readBundle('{ pas du json');
  assert.equal(casse.ok, false);
  assert.match(casse.erreurs[0], /illisible/i);

  const etranger = m.readBundle(JSON.stringify({ format: 'autre-application', store: {} }));
  assert.equal(etranger.ok, false);
  assert.match(etranger.erreurs[0], /format/i);

  assert.equal(m.readBundle(JSON.stringify([1, 2, 3])).ok, false);
  assert.equal(m.readBundle(JSON.stringify({ hello: 'world' })).ok, false);
});

test('la restauration recopie uniquement les sections connues', () => {
  const m = module();
  const cible = { seances: {}, notes: {}, inconnue: 'gardée' };
  m.restore(cible, { seances: { '3SI1|1': { done: true } }, notes: { e1: {} }, intrus: true });
  assert.equal(Object.keys(cible.seances).length, 1);
  assert.equal(cible.seances['3SI1|1'].done, true);
  assert.equal(cible.inconnue, 'gardée');
  assert.equal(cible.intrus, undefined);
  assert.equal(m.cles.includes('seances'), true);
});

test('le référentiel réel (631 notions, 234 annexes) ne déclenche aucun faux positif', () => {
  const window = { STI_DATA: {} };
  ['data/livres-sti.js', 'data/annexes.js', 'assets/suivi-annexes.js', 'assets/data-audit.js']
    .forEach(f => vm.runInNewContext(fs.readFileSync(f, 'utf8'), { window }, { filename: f }));
  const a = window.STI_DATA_AUDIT.audit({
    sessions: { '3SI1': [], '4SI2': [] },
    livres: window.STI_DATA.livresSTI,
    annexItems: window.STI_ANNEX_TRACK.items,
    store: {}
  });
  assert.equal(a.stats.notions, 631);
  assert.equal(a.stats.annexes, 234);
  assert.equal(a.ok, true, a.problemes.filter(p => p.nombre).map(p => p.code).join(', '));
});
