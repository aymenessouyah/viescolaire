const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const app = fs.readFileSync('assets/app.js', 'utf8');
const reference = fs.readFileSync('data/reference.js', 'utf8');

function referenceData() {
  const window = {};
  vm.runInNewContext(reference, { window });
  return window.STI_DATA.reference;
}

test('les deux classes portent la mention des deux groupes sur leur première page', () => {
  const classes = referenceData().CLASSES;
  for (const id of ['3SI1', '4SI2']) {
    assert.equal(classes[id].groupes, 2);
    assert.match(classes[id].long, /Groupes : 1 et 2/);
    assert.doesNotMatch(classes[id].long, /— groupe [12]$/i);
  }
});

function renderCahier(classe) {
  const start = app.indexOf('function renderCahier(){');
  const end = app.indexOf('/* Rappels du cahier', start);
  assert.ok(start >= 0 && end > start);
  const sessions = {
    '3SI1': [{ cls: '3SI1', n: 1, iso: '2026-10-20', tri: 1, blk: { t: 'HTML', k: 'cours' } }],
    '4SI2': [{ cls: '4SI2', n: 1, iso: '2026-10-23', tri: 1, blk: { t: 'SQL', k: 'cours' } }]
  };
  const box = { innerHTML: '', querySelector: () => ({}) };
  const sandbox = {
    window: { STI_CAHIER_DEFAULTS: { currentTrimester: () => 1 } },
    document: { getElementById: id => id === 'v-cahier' ? box : null },
    isProfessorConnected: () => true,
    todayISO: () => '2026-10-27',
    SESSIONS: sessions, CAHIER_PLANS: {}, store: { seances: {} },
    cahCls: classe, cahTri: 0, cahStatus: 'all',
    classesCahier: () => ['3SI1', '4SI2'],
    sessionsOf: cls => sessions[cls], seanceState: () => 'attente',
    lundiDe: () => '2026-10-19', activeProfessorProfile: () => null,
    ic: () => '', escapeHtml: value => String(value),
    fmtLong: value => value, fmtShort: value => value,
    clsChip: () => 'b-green', slotsTxt: () => '', titleOf: s => s.blk.t,
    seanceVerrouillee: () => null
  };
  vm.runInNewContext(app.slice(start, end), sandbox);
  sandbox.renderCahier();
  return box.innerHTML;
}

test('le cahier à l’écran indique les groupes pour chaque classe et chaque séance', () => {
  const html = renderCahier('both');
  const summary = html.match(/<p class="cah-groups-summary">([\s\S]*?)<\/p>/)?.[1] || '';
  assert.match(summary, /3SI1<\/strong> · Groupes : 1 et 2/);
  assert.match(summary, /4SI2<\/strong> · Groupes : 1 et 2/);
  const rows = html.match(/<tr class="cah-row [\s\S]*?<\/tr>/g) || [];
  assert.equal(rows.length, 2);
  for (const row of rows) assert.match(row, /<small class="cah-groups">Groupes : 1 et 2<\/small>/);
});

test('le résumé du cahier respecte le filtre de classe', () => {
  for (const [selected, other] of [['3SI1', '4SI2'], ['4SI2', '3SI1']]) {
    const html = renderCahier(selected);
    const summary = html.match(/<p class="cah-groups-summary">([\s\S]*?)<\/p>/)?.[1] || '';
    assert.match(summary, new RegExp(selected + '<\\/strong> · Groupes : 1 et 2'));
    assert.doesNotMatch(summary, new RegExp(other));
    assert.equal((html.match(/class="cah-groups"/g) || []).length, 1);
  }
});
