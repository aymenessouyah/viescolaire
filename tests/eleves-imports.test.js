const test = require('node:test');
const assert = require('node:assert/strict');
const csv = require('../assets/student-csv.js');

const classe = [
  { id:'e1', nom:'Zouaoui', prenom:'Ahmed', groupe:1 },
  { id:'e2', nom:'Abed', prenom:'Ala', groupe:1 },
  { id:'e3', nom:'Gharbi', prenom:'Imen', groupe:1 },
  { id:'e4', nom:'Brahmi', prenom:'Abderrahmen', groupe:1 }
];

/* ---------- nettoyage des noms ---------- */

test('les espaces surnuméraires et les minuscules sont détectés, jamais appliqués d’office', () => {
  const r = csv.controlerNom('ben ahmed ', 'nour');
  assert.equal(r.aCorriger, true);
  assert.equal(r.apres.nom, 'Ben Ahmed');
  assert.equal(r.apres.prenom, 'Nour');
  assert.ok(r.raisons.includes('espace surnuméraire'));
  assert.ok(r.raisons.includes('majuscules'));
  // l'original n'est pas modifié
  assert.equal(r.avant.nom, 'ben ahmed ');
});

test('un nom déjà propre n’est pas signalé', () => {
  const r = csv.controlerNom('Zouaoui', 'Ahmed');
  assert.equal(r.aCorriger, false);
  assert.deepEqual(r.raisons, []);
});

test('les particules restent en minuscules dans un nom composé', () => {
  assert.equal(csv.majusculesNom('ben maatoug'), 'Ben Maatoug');
  assert.equal(csv.majusculesNom('el gharbi'), 'El Gharbi');
});

test('le tatweel arabe et les espaces invisibles sont retirés', () => {
  assert.equal(csv.nomPropre('أحْـــمَد'), 'أحْمَد'.replace(/[\u0640]/g, ''));
  assert.equal(csv.nomPropre('  Ali\u200b  '), 'Ali');
});

/* ---------- colonnes d'épreuve ---------- */

test('les colonnes dc1, dc2, ds1… d’un fichier du lycée sont reconnues', () => {
  const cols = csv.colonnesEpreuves(['id','nom','prenom','dc1','dc2','ds1']);
  assert.deepEqual(cols.map(c => c.cle), ['dc1','dc2','ds1']);
  assert.deepEqual(cols.map(c => c.type), ['DC','DC','DS']);
});

test('un fichier à une colonne par épreuve est analysé et relié aux élèves', () => {
  const texte = 'id;nom;prenom;dc1;dc2;ds1\r\n'
    + ';Zouaoui;Ahmed;17;19,75;15\r\n'
    + ';Abed;Ala;12,5;17;ABS\r\n'
    + ';Gharbi;Imen;5,5;*;\r\n';
  const r = csv.analyserColonnesEpreuves(texte, classe);
  assert.equal(r.epreuves.length, 3);
  assert.equal(r.lignes.length, 3);
  assert.deepEqual(r.errors, []);
  assert.equal(r.epreuves[0].titre, 'Devoir de contrôle n°1');
  assert.equal(r.lignes[0].cellules.dc2, '19,75');
});

test('ABS et * deviennent une absence, une cellule vide ne devient rien', () => {
  const texte = 'nom;prenom;dc1;ds1\r\nZouaoui;Ahmed;ABS;*\r\nAbed;Ala;;\r\n';
  const r = csv.analyserColonnesEpreuves(texte, classe);
  assert.equal(r.lignes[0].cellules.dc1, 'ABS');
  assert.equal(r.lignes[0].cellules.ds1, 'ABS');
  assert.equal(r.lignes[1].cellules.dc1, '');
});

test('un élève inconnu est signalé et n’est jamais inventé', () => {
  const texte = 'nom;prenom;dc1\r\nInconnu;Personne;10\r\nZouaoui;Ahmed;17\r\n';
  const r = csv.analyserColonnesEpreuves(texte, classe);
  assert.equal(r.lignes.length, 1);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /introuvable/);
});

test('un homonyme non identifiable par l’ID est refusé, pas deviné', () => {
  const doublons = classe.concat([{ id:'e5', nom:'Zouaoui', prenom:'Ahmed', groupe:2 }]);
  const texte = 'nom;prenom;dc1\r\nZouaoui;Ahmed;17\r\n';
  const r = csv.analyserColonnesEpreuves(texte, doublons);
  assert.equal(r.lignes.length, 0);
  assert.match(r.errors[0], /plusieurs élèves/);
});

test('un fichier sans colonne d’épreuve est refusé avec un message clair', () => {
  const texte = 'id;nom;prenom;note\r\n;Zouaoui;Ahmed;17\r\n';
  const r = csv.analyserColonnesEpreuves(texte, classe);
  assert.equal(r.epreuves.length, 0);
  assert.match(r.errors[0], /Aucune colonne d’épreuve/);
});

test('l’ancien import par une seule colonne « note » continue de fonctionner', () => {
  const texte = 'id;nom;prenom;note\r\ne1;Zouaoui;Ahmed;17\r\n';
  const plan = csv.planGradeImport(texte, { bareme:20 }, classe);
  assert.equal(plan.rows.length, 1);
  assert.equal(plan.errors.length, 0);
});
