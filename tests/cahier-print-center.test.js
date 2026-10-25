const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('assets/fiches.js', 'utf8');

test('le Centre d’impression compose aussi le cahier en trois colonnes', () => {
  assert.match(source, /<th>Date<\/th><th>Le travail réalisé<\/th><th>Signature<\/th>/);
  assert.match(source, /function cahierTimelineTable\(entries, signatureMarkup\)/);
  assert.match(source, /class="cp-cahier-table"/);
  assert.match(source, /root\.activeProfessorProfile\(\)/);
});

test('le Centre d’impression conserve les champs du cahier et la signature manuscrite quotidienne', () => {
  assert.match(source, /Prévu \/ préparation :/);
  assert.match(source, /Réalisé :/);
  assert.match(source, /À faire :/);
  assert.match(source, /Observations :/);
  assert.match(source, /record\.report/);
  assert.match(source, /signatureAtEnd\s*\?/);
  assert.match(source, /signatureAtEnd: !session\.contextOnly[\s\S]*?lastSessionByDate\.get/);
});

test('le cahier assemblé garde sa couverture, son emploi du temps, ses répartitions et leur ordre chronologique', () => {
  const start = source.indexOf('function printCahier(options) {');
  const end = source.indexOf('let printMenuReturnFocus', start);
  const print = source.slice(start, end);
  const cover = print.indexOf('cahierCoverPage(classes');
  const timetable = print.indexOf('cahierTimetablePage()');
  const annual = print.indexOf('cahierAnnualPage(classes)');
  const firstTerm = print.indexOf('cahierQuarterPage(1, classes)');
  assert.ok(cover >= 0 && cover < timetable && timetable < annual && annual < firstTerm);
  assert.match(print, /while \(currentQuarter < sessionQuarter\)\s*\{\s*flushTimeline\(\);[\s\S]*?parts\.push\(cahierQuarterPage\(currentQuarter, classes\)\)/);
});

test('le Centre d’impression produit le même tableau, conserve les contenus et signe une fois par jour', () => {
  const vm = require('node:vm');
  const mark = '<svg class="teacher-signature-ink" data-signature="professeur" aria-label="signature"></svg>';
  const sessionA = { cls: '3SI1', n: 1, iso: '2026-12-10', tri: 1, blk: { t: 'Planning T1-A', d: '08:00–10:00', det: 'Prévision T1-A', k: 'cours' } };
  const sessionB = { cls: '4SI2', n: 1, iso: '2026-12-10', tri: 1, blk: { t: 'Planning T1-B', d: '10:00–12:00', det: 'Prévision T1-B', k: 'cours' } };
  const sessionC = { cls: '3SI1', n: 2, iso: '2027-01-15', tri: 2, blk: { t: 'Planning T2', d: '08:00–10:00', det: 'Prévision T2', k: 'cours' } };
  const records = {
    '3SI1|1': { title: 'T1_SUJET_A', preparation: 'T1_PREPARATION_A', contenu: 'T1_REALISE_A', devoirs: 'T1_DEVOIRS_A', obs: 'T1_OBSERVATION_A', done: true },
    '4SI2|1': { title: 'T1_SUJET_B', preparation: 'T1_PREPARATION_B', contenu: 'T1_REALISE_B', devoirs: 'T1_DEVOIRS_B', obs: 'T1_OBSERVATION_B', done: true },
    '3SI1|2': { title: 'T2_SUJET', preparation: 'T2_PREPARATION', contenu: 'T2_REALISE', devoirs: 'T2_DEVOIRS', obs: 'T2_OBSERVATION', done: true }
  };
  const plan = session => ({ num: session.n, iso: session.iso, tri: session.tri, t: session.blk.t, k: session.blk.k, d: session.blk.d, det: session.blk.det });
  const school = { annee: '2026-2027', lycee: 'Lycée Rafèha', prof: 'Professeur test' };
  const root = {
    STI_DATA: { repartition3SI1: [plan(sessionA), plan(sessionC)], repartition4SI2: [plan(sessionB)] },
    SESSIONS: { '3SI1': [sessionA, sessionC], '4SI2': [sessionB] },
    store: { seances: records, times: {} },
    SCHOOL: school,
    DATA: { reference: { SCHOOL: school, JOURS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], CLASSES: {} } },
    activeProfessorProfile: () => ({ signature: 'signature-professeur' }),
    STI_SIGNATURE: { toMarkup: value => value ? mark : '' },
    addEventListener() {},
    todayISO: () => '2026-12-20'
  };
  const controls = {
    '#prm-cahier-cls': { value: 'both' },
    '#prm-cahier-tri': { value: '0' },
    '#prm-cahier-status': { value: 'all' }
  };
  const modal = { querySelector: selector => controls[selector] || null, classList: { contains: () => true, remove() {} } };
  let printedHtml = '';
  const document = {
    readyState: 'loading',
    addEventListener() {},
    getElementById: id => id === 'prm-modal' ? modal : null,
    createElement: () => ({ style: {}, set srcdoc(value) { printedHtml = value; } }),
    body: { appendChild() {} }
  };
  vm.runInNewContext(source, { window: root, document, todayISO: root.todayISO, Date, Map, Set, Promise, console });
  root.STI_FICHES.exportCahierPDF({ classe: 'both', trimestre: 0, statut: 'all' });

  assert.match(printedHtml, /<title>Cahier de textes - 3SI1 et 4SI2 - toute l’année<\/title>/);
  assert.match(printedHtml, /<th>Date<\/th><th>Le travail réalisé<\/th><th>Signature<\/th>/);
  assert.match(printedHtml, /T1_PREPARATION_A/);
  assert.match(printedHtml, /T1_REALISE_A/);
  assert.match(printedHtml, /T1_DEVOIRS_A/);
  assert.match(printedHtml, /T1_OBSERVATION_A/);
  assert.equal(printedHtml.split('data-signature="professeur"').length - 1, 2);
  const t1 = printedHtml.indexOf('T1_REALISE_B');
  const secondTerm = printedHtml.indexOf('<h2>2e trimestre</h2>');
  const t2 = printedHtml.indexOf('T2_REALISE');
  assert.ok(t1 >= 0 && t1 < secondTerm && secondTerm < t2);
});
