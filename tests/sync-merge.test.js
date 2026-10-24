const test = require('node:test');
const assert = require('node:assert/strict');
const { merge } = require('../assets/sync-merge.js');

const plain = value => JSON.parse(JSON.stringify(value));

test('fusionne automatiquement les changements faits sur des champs différents', () => {
  const result = merge(
    { fiche: { titre: 'Cours', contenu: 'Prévu' } },
    { fiche: { titre: 'Cours modifié', contenu: 'Prévu' } },
    { fiche: { titre: 'Cours', contenu: 'Réalisé' } }
  );

  assert.deepEqual(plain(result.value), {
    fiche: { titre: 'Cours modifié', contenu: 'Réalisé' }
  });
  assert.equal(result.conflicts.length, 0);
});

test('signale une modification concurrente du même champ et applique un choix explicite', () => {
  const base = { seance: { contenu: 'Ancien' } };
  const local = { seance: { contenu: 'Version téléphone' } };
  const remote = { seance: { contenu: 'Version ordinateur' } };
  const conflict = merge(base, local, remote);

  assert.equal(conflict.conflicts.length, 1);
  assert.deepEqual(plain(merge(base, local, remote, {
    [conflict.conflicts[0].key]: 'remote'
  }).value), remote);
});

test('préserve une suppression locale et signale suppression contre modification', () => {
  const conflict = merge(
    { fiches: { '3SI1|1': { contenu: 'Cours' } } },
    { fiches: {} },
    { fiches: { '3SI1|1': { contenu: 'Cours complété' } } }
  );

  assert.equal(conflict.conflicts.length, 1);
  assert.equal(conflict.conflicts[0].local.absent, true);
  assert.equal(conflict.conflicts[0].remote.absent, false);
});

test('fusionne les ajouts indépendants dans une liste indexée par identifiant', () => {
  const result = merge(undefined,
    { eleves: [{ id: 'a', nom: 'Élève A' }] },
    { eleves: [{ id: 'b', nom: 'Élève B' }] }
  );

  assert.equal(result.conflicts.length, 0);
  assert.deepEqual(result.value.eleves.map(eleve => eleve.id).sort(), ['a', 'b']);
});

test('combine les ajouts de notions sans créer de conflit', () => {
  const result = merge(
    { epreuve: { notions: ['HTML'] } },
    { epreuve: { notions: ['HTML', 'CSS'] } },
    { epreuve: { notions: ['HTML', 'PHP'] } }
  );

  assert.equal(result.conflicts.length, 0);
  assert.deepEqual(result.value.epreuve.notions.sort(), ['CSS', 'HTML', 'PHP']);
});

test('fusionne les cases d’annexes cochées indépendamment sur deux appareils', () => {
  const result = merge(
    { seances: { '3SI1|1': { annexes: ['html:a'] } } },
    { seances: { '3SI1|1': { annexes: ['html:a', 'css:b'] } } },
    { seances: { '3SI1|1': { annexes: ['html:a', 'php:c'] } } }
  );

  assert.equal(result.conflicts.length, 0);
  assert.deepEqual(result.value.seances['3SI1|1'].annexes.sort(), ['css:b', 'html:a', 'php:c']);
});
