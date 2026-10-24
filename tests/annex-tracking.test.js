const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const dataSource = fs.readFileSync('data/annexes.js', 'utf8');
const moduleSource = fs.readFileSync('assets/suivi-annexes.js', 'utf8');

function tracker() {
  const window = { STI_DATA: {} };
  vm.runInNewContext(dataSource, { window }, { filename: 'data/annexes.js' });
  vm.runInNewContext(moduleSource, { window }, { filename: 'assets/suivi-annexes.js' });
  return window.STI_ANNEX_TRACK;
}

test('le suivi couvre les 234 éléments des cinq annexes avec des identifiants uniques', () => {
  const t = tracker();
  assert.equal(t.items.length, 234);
  assert.equal(new Set(t.items.map(item => item.id)).size, 234);
  assert.deepEqual(
    Object.fromEntries([...new Set(t.items.map(item => item.annexId))].map(id => [id, t.items.filter(item => item.annexId === id).length])),
    { html: 61, css: 53, js: 41, php: 45, sql: 34 }
  );
});

test('les identifiants inconnus et les doublons ne sont pas repris', () => {
  const t = tracker();
  const a = t.items[0].id;
  const b = t.items[1].id;
  assert.deepEqual([...t.ids([a, a, 'inconnu', b])], [a, b]);
  assert.deepEqual([...t.ids(null)], []);
});

test('la couverture distingue les séances assurées des séances prévues et sépare les classes', () => {
  const t = tracker();
  const ids = t.items.slice(0, 6).map(item => item.id);
  const context = {
    sessions: {
      '3SI1': [
        { n: 1, iso: '2026-10-10' },
        { n: 2, iso: '2026-10-11' },
        { n: 3, iso: '2026-10-20' }
      ],
      '4SI2': [{ n: 1, iso: '2026-10-12' }]
    },
    store: { seances: {
      '3SI1|1': { done: true, annexes: [ids[0], ids[1]] },
      '3SI1|2': { done: false, annexes: [ids[1], ids[2], ids[4]] },
      '3SI1|3': { done: true, annexes: [ids[5]] },
      '4SI2|1': { done: true, annexes: [ids[2], ids[3]] }
    } }
  };
  const firstClass = t.summary(context, '3SI1', '2026-10-15');
  assert.deepEqual([...firstClass.covered].sort(), [ids[0], ids[1]].sort());
  assert.deepEqual([...firstClass.planned].sort(), [ids[2], ids[4], ids[5]].sort());

  const secondClass = t.summary(context, '4SI2', '2026-10-15');
  assert.deepEqual([...secondClass.covered].sort(), [ids[2], ids[3]].sort());
  assert.equal(secondClass.planned.size, 0);

  const allClasses = t.summary(context, 'all', '2026-10-15');
  assert.deepEqual([...allClasses.covered].sort(), [ids[0], ids[1], ids[2], ids[3]].sort());
  assert.deepEqual([...allClasses.planned].sort(), [ids[4], ids[5]].sort());
});
