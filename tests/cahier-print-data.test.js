const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('assets/cahier-print-data.js', 'utf8');
const window = {};
vm.runInNewContext(source, { window }, { filename: 'assets/cahier-print-data.js' });
const printData = window.STI_CAHIER_PRINT_DATA;
const sessions = {
  '3SI1': [
    { cls: '3SI1', n: 1, iso: '2026-10-01', tri: 1 },
    { cls: '3SI1', n: 2, iso: '2026-10-08', tri: 1 },
    { cls: '3SI1', n: 3, iso: '2027-01-10', tri: 2 },
    { cls: '3SI1', n: 4, iso: '2026-12-20', tri: 1 }
  ],
  '4SI2': [
    { cls: '4SI2', n: 1, iso: '2026-10-15', tri: 1 },
    { cls: '4SI2', n: 2, iso: '2027-01-15', tri: 2 }
  ]
};
const records = {
  '3SI1|2': { done: true },
  '3SI1|3': { done: false },
  '4SI2|1': { done: true }
};
const today = '2026-12-20';
const keys = list => Array.from(list, session => `${session.cls}|${session.n}`);

test('le cahier imprimé peut être limité à une classe et un trimestre', () => {
  assert.deepEqual(keys(printData.select(sessions, records, {
    classe: '3SI1', trimestre: 1, statut: 'all'
  }, today)), ['3SI1|1', '3SI1|2', '3SI1|4']);
  assert.deepEqual(keys(printData.select(sessions, records, {
    classe: '4SI2', trimestre: 1, statut: 'all'
  }, today)), ['4SI2|1']);
});

test('les filtres d’état distinguent les séances à confirmer, assurées, reportées et à venir', () => {
  const select = statut => keys(printData.select(sessions, records, {
    classe: 'both', trimestre: 0, statut
  }, today));
  assert.deepEqual(select('pending'), ['3SI1|1']);
  assert.deepEqual(select('done'), ['3SI1|2', '4SI2|1']);
  assert.deepEqual(select('reported'), ['3SI1|3']);
  assert.deepEqual(select('future'), ['4SI2|2']);
  assert.equal(printData.state(sessions['3SI1'][3], {}, today), 'today');
});

test('la répartition datée par classe corrige le trimestre et le contenu des séances imprimées', () => {
  const normalized = printData.withPlans(sessions, {
    '3SI1': [
      { num: 1, iso: '2026-09-15', tri: 1, t: 'Première séance', d: 'HTML5' },
      { num: 4, iso: '2026-12-20', tri: 2, t: 'Reprise après le T1', d: 'JavaScript' }
    ]
  });
  const first = normalized['3SI1'].find(session => session.n === 1);
  const boundary = normalized['3SI1'].find(session => session.n === 4);
  assert.equal(first.iso, '2026-09-15');
  assert.equal(first.blk.t, 'Première séance');
  assert.equal(first.blk.d, 'HTML5');
  assert.equal(boundary.tri, 2);
  assert.deepEqual(keys(printData.select(normalized, records, {
    classe: '3SI1', trimestre: 2, statut: 'all'
  }, today)), ['3SI1|4', '3SI1|3']);
});

test('le cahier ajoute le dernier cours de chaque trimestre précédent comme repère de transition', () => {
  const selected = printData.select(sessions, records, {
    classe: 'both', trimestre: 2, statut: 'all'
  }, today);
  const ordered = printData.chronology(selected, sessions, {
    classe: 'both', trimestre: 2, statut: 'all'
  });
  assert.deepEqual(keys(ordered), ['4SI2|1', '3SI1|4', '3SI1|3', '4SI2|2']);
  assert.deepEqual(Array.from(ordered, session => session.contextOnly), [true, true, false, false]);
  assert.equal(ordered[1].contextForTrimester, 2);
});

test('les séances T1 déjà imprimées ne sont pas dupliquées dans la chronologie annuelle', () => {
  const selected = printData.select(sessions, records, {
    classe: 'both', trimestre: 0, statut: 'all'
  }, today);
  const ordered = printData.chronology(selected, sessions, {
    classe: 'both', trimestre: 0, statut: 'all'
  });
  assert.equal(ordered.length, selected.length);
  assert.equal(ordered.some(session => session.contextOnly), false);
});

test('la fin du T1 reprend le trimestre propre à chaque répartition de classe', () => {
  const dataWindow = { STI_DATA: {} };
  for (const file of ['data/reference.js', 'data/repartition3SI1.js', 'data/repartition4SI2.js']) {
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), { window: dataWindow }, { filename: file });
  }
  const plans = {
    '3SI1': dataWindow.STI_DATA.repartition3SI1,
    '4SI2': dataWindow.STI_DATA.repartition4SI2
  };
  const sourceByClass = Object.fromEntries(Object.entries(plans).map(([className, plan]) => [
    className,
    plan.map(entry => ({ cls: className, n: entry.num, iso: entry.iso, tri: 1, blk: {} }))
  ]));
  const normalized = printData.withPlans(sourceByClass, plans);
  assert.equal(normalized['3SI1'].find(session => session.n === 21).tri, 1);
  assert.equal(normalized['3SI1'].find(session => session.n === 22).tri, 2);
  assert.equal(normalized['3SI1'].find(session => session.n === 23).tri, 2);
  assert.equal(normalized['4SI2'].find(session => session.n === 22).tri, 1);
});
