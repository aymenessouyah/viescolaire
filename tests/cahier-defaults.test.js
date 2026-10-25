const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const cahierDefaults = require('../assets/cahier-defaults.js');

const dataWindow = { STI_DATA: {} };
for (const file of ['data/repartition3SI1.js', 'data/repartition4SI2.js']) {
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), { window: dataWindow }, { filename: file });
}
const datedPlansFromApp = {
  '3SI1': dataWindow.STI_DATA.repartition3SI1,
  '4SI2': dataWindow.STI_DATA.repartition4SI2
};

const sessions = {
  '3SI1': [
    { iso: '2026-09-15', tri: 1 },
    { iso: '2026-12-17', tri: 1 },
    { iso: '2027-01-05', tri: 2 },
    { iso: '2027-03-10', tri: 2 },
    { iso: '2027-04-06', tri: 3 },
    { iso: '2027-06-10', tri: 3 }
  ],
  '4SI2': [
    { iso: '2026-09-17', tri: 1 },
    { iso: '2026-12-18', tri: 1 },
    { iso: '2027-01-07', tri: 2 },
    { iso: '2027-03-12', tri: 2 },
    { iso: '2027-04-08', tri: 3 },
    { iso: '2027-06-12', tri: 3 }
  ]
};

test('détermine le trimestre courant à partir des trimestres des séances datées', () => {
  assert.equal(cahierDefaults.currentTrimester(sessions, '2026-10-25'), 1);
  assert.equal(cahierDefaults.currentTrimester(sessions, '2027-02-01'), 2);
  assert.equal(cahierDefaults.currentTrimester(sessions, '2027-05-15'), 3);
});

test('un jour sans séance au milieu de la période conserve le trimestre correspondant', () => {
  assert.equal(cahierDefaults.currentTrimester(sessions, '2026-11-01'), 1);
});

test('dans une coupure entre deux périodes, retient le trimestre dont une séance est la plus proche', () => {
  assert.equal(cahierDefaults.currentTrimester(sessions, '2026-12-28'), 2);
  assert.equal(cahierDefaults.currentTrimester(sessions, '2026-12-23'), 1);
});

test('les répartitions réelles déterminent le trimestre courant selon les dates de 2026-2027', () => {
  assert.equal(cahierDefaults.currentTrimester({}, '2026-10-25', datedPlansFromApp), 1);
  assert.deepEqual(cahierDefaults.initialFilters({}, '2026-10-25', datedPlansFromApp), {
    tri: 1,
    status: 'done'
  });
  assert.equal(cahierDefaults.currentTrimester({}, '2026-12-29', datedPlansFromApp), 2);
});

test('les valeurs de trimestre des séances priment sur une période codée en dur', () => {
  const customSchedule = {
    '3SI1': [
      { iso: '2026-10-01', tri: 3 },
      { iso: '2026-10-31', tri: 3 }
    ]
  };
  assert.equal(cahierDefaults.currentTrimester(customSchedule, '2026-10-15'), 3);
});

test('la répartition annuelle datée prime sur le trimestre généré par défaut', () => {
  const generatedSessions = {
    '3SI1': [
      { iso: '2026-12-03', tri: 1 },
      { iso: '2026-12-29', tri: 1 },
      { iso: '2027-01-04', tri: 2 }
    ],
    '4SI2': [
      { iso: '2026-12-28', tri: 1 },
      { iso: '2027-01-04', tri: 2 }
    ]
  };
  const datedPlans = {
    '3SI1': [
      { iso: '2026-12-03', tri: 1 },
      { iso: '2026-12-29', tri: 2 }
    ],
    '4SI2': [
      { iso: '2026-12-28', tri: 1 },
      { iso: '2027-01-04', tri: 2 }
    ]
  };
  assert.equal(cahierDefaults.currentTrimester(generatedSessions, '2026-12-29'), 1);
  assert.equal(cahierDefaults.currentTrimester(generatedSessions, '2026-12-29', datedPlans), 2);
  assert.deepEqual(cahierDefaults.initialFilters(generatedSessions, '2026-12-29', datedPlans), {
    tri: 2,
    status: 'done'
  });
});

test('hors des périodes renseignées, choisit le trimestre daté le plus proche', () => {
  assert.equal(cahierDefaults.currentTrimester(sessions, '2026-08-20'), 1);
  assert.equal(cahierDefaults.currentTrimester(sessions, '2027-07-01'), 3);
  assert.equal(cahierDefaults.currentTrimester({}, '2026-10-25'), 1);
});

test('les filtres initiaux sélectionnent le trimestre courant et les séances assurées', () => {
  assert.deepEqual(cahierDefaults.initialFilters(sessions, '2027-02-01'), {
    tri: 2,
    status: 'done'
  });
});

test('l’ouverture garde le statut explicitement demandé tout en utilisant le trimestre courant', () => {
  assert.deepEqual(cahierDefaults.filtersForOpen(sessions, '2027-02-01'), {
    tri: 2,
    status: 'done',
    cls: 'both'
  });
  assert.deepEqual(cahierDefaults.filtersForOpen(sessions, '2027-02-01', 'pending', '3SI1'), {
    tri: 2,
    status: 'pending',
    cls: '3SI1'
  });
  assert.deepEqual(cahierDefaults.filtersForOpen(sessions, '2027-02-01', 'all', '4SI2'), {
    tri: 2,
    status: 'all',
    cls: '4SI2'
  });
});
