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
