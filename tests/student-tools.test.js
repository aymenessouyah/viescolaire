const test = require('node:test');
const assert = require('node:assert/strict');
const studentCsv = require('../assets/student-csv.js');
const reports = require('../assets/student-reports.js');

const roster = [
  { id:'student-1', nom:'Ben Ali', prenom:'Aïcha', nomAr:'بن علي', prenomAr:'عائشة', groupe:1, pc:'P01' },
  { id:'student-2', nom:'Trabelsi', prenom:'Ahmed', groupe:2, pc:'P02' }
];

test('le parseur CSV gère le BOM, le point-virgule, les guillemets et les retours de ligne', () => {
  const rows = studentCsv.parseRows('\uFEFFnom;prenom;observation\r\n"Ben;Ali";Aïcha;"ligne 1\nligne 2"');
  assert.deepEqual(rows, [
    ['nom','prenom','observation'],
    ['Ben;Ali','Aïcha','ligne 1\nligne 2']
  ]);
});

test('le modèle CSV de classe met à jour par ID ou nom sans supprimer les élèves absents du fichier', () => {
  const csv = studentCsv.exportRoster(roster).replace('P01','P11');
  assert.equal(studentCsv.parseRows(csv)[0].slice(-1)[0], 'action');
  const plan = studentCsv.planRosterImport(csv, roster, 2);
  assert.equal(plan.errors.length, 0);
  assert.equal(plan.updates, 2);
  assert.equal(plan.adds, 0);
  assert.equal(plan.deletes, 0);
  assert.equal(plan.rows[0].student.pc, 'P11');
  assert.equal(plan.rows[1].matchId, 'student-2');
  const partial = studentCsv.planRosterImport('id;nom;prenom;groupe\nstudent-1;Ben Ali;;', roster, 2);
  assert.deepEqual(partial.rows[0].student, {nom:'Ben Ali'});
});

test('la suppression CSV exige une action explicite et l’ID d’un élève de la classe', () => {
  const plan = studentCsv.planRosterImport('id;action\nstudent-2;supprimer', roster, 2);
  assert.equal(plan.errors.length, 0);
  assert.equal(plan.adds, 0);
  assert.equal(plan.updates, 0);
  assert.equal(plan.deletes, 1);
  assert.equal(plan.rows[0].action, 'delete');
  assert.equal(plan.rows[0].matchId, 'student-2');

  const missingId = studentCsv.planRosterImport('id;action\n;supprimer', roster, 2);
  assert.match(missingId.errors[0], /ID obligatoire/);
  const unknownId = studentCsv.planRosterImport('id;action\nnot-in-class;supprimer', roster, 2);
  assert.match(unknownId.errors[0], /absent de cette classe/);
  const implicit = studentCsv.planRosterImport('id;nom\nstudent-1;Ben Ali', roster, 2);
  assert.equal(implicit.deletes, 0);
});

test('l’import de classe bloque les groupes invalides et les doublons de noms', () => {
  const invalid = studentCsv.planRosterImport(
    'nom;prenom;groupe\nAli;Sara;1\nAli;Sara;1\nAli;Mona;3', [], 2
  );
  assert.equal(invalid.errors.length, 2);
  assert.equal(invalid.rows.length, 1);
});

test('le modèle CSV de notes conserve les absences et n’efface pas une note vide implicitement', () => {
  const exam = { id:'exam-1', bareme:20 };
  const notes = {
    'student-1':{ n:15 },
    'student-2':{ abs:true }
  };
  const csv = studentCsv.exportGrades(exam, roster, notes);
  const plan = studentCsv.planGradeImport(csv, exam, roster);
  assert.equal(plan.errors.length, 0);
  assert.deepEqual(plan.rows.map(row => row.action), ['note','absent']);
  const unchanged = studentCsv.planGradeImport(
    'id;note;absent;effacer\nstudent-1;;;', exam, roster
  );
  assert.equal(unchanged.errors.length, 0);
  assert.equal(unchanged.rows.length, 0);
});

test('l’import des notes valide les IDs et le barème, et permet un effacement explicite', () => {
  const plan = studentCsv.planGradeImport(
    'id;note;absent;effacer\nstudent-1;18,5;0;0\nstudent-2;;;1',
    { id:'exam-1', bareme:20 }, roster
  );
  assert.equal(plan.errors.length, 0);
  assert.deepEqual(plan.rows.map(row => row.action), ['note','clear']);
  assert.equal(plan.rows[0].note, 18.5);
  const invalid = studentCsv.planGradeImport(
    'id;note\nunknown;21', { id:'exam-1', bareme:20 }, roster
  );
  assert.equal(invalid.rows.length, 0);
  assert.equal(invalid.errors.length, 1);
});

test('le bilan individuel normalise les notes, ignore les absences d’épreuve et résume les compétences', () => {
  const summary = reports.summarizeBulletin({
    studentId:'student-1',
    exams:[
      { id:'e1', titre:'Contrôle', date:'2026-10-01', bareme:20 },
      { id:'e2', titre:'TP', date:'2026-10-15', bareme:10 },
      { id:'e3', titre:'DS', date:'2026-12-01', bareme:20 }
    ],
    gradeRecords:{ e1:{'student-1':{n:14}}, e2:{'student-1':{n:8}}, e3:{'student-1':{abs:true}} },
    attendance:[{date:'2026-10-01',status:'p'},{date:'2026-10-08',status:'a'},{date:'2026-10-15',status:'r'}],
    competencies:[{code:'A',domaine:'Programmation',t:'Créer un site'},{code:'B',domaine:'Réseaux',t:'Comprendre un réseau'}],
    competencyStatus:{A:'acquis',B:'renforcer'}
  });
  assert.equal(summary.gradeCount, 2);
  assert.equal(summary.average, 15);
  assert.equal(summary.presence.absences, 1);
  assert.equal(summary.presence.retards, 1);
  assert.equal(summary.skillCounts.acquis, 1);
  assert.equal(summary.skillCounts.renforcer, 1);
});
