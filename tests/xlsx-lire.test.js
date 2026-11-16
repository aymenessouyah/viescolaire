const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const xlsx = require('../assets/xlsx-lire.js');

const classeur = fs.readFileSync(path.join(__dirname, 'fixtures', 'classeur-lycee.xlsx'));
const donnees = new Uint8Array(classeur);

const classe = [
  { id:'e1', nom:'Zouaoui', prenom:'Ahmed', nomAr:'الزواوي', prenomAr:'أحمد' },
  { id:'e2', nom:'Aich',   prenom:'Ahmed', nomAr:'عيش',    prenomAr:'احمد' }
];

test('un vrai classeur Excel est ouvert et ses feuilles nommées', async () => {
  const r = await xlsx.lireFeuilles(donnees);
  assert.equal(r.feuilles.length, 1);
  assert.equal(r.feuilles[0].nom, 'Export');
  assert.equal(r.feuilles[0].lignes.length, 4);
});

test('l’arabe, le tatweel et les cellules vides sont restitués', async () => {
  const r = await xlsx.lireFeuilles(donnees);
  const lignes = r.feuilles[0].lignes;
  assert.equal(lignes[0][0], 'العدد');
  assert.equal(lignes[0][3], 'DC1');
  assert.equal(lignes[1][2], 'أحمد الزواوي');
  assert.match(lignes[2][2], /أحْمَـــد/);         // tatweel conservé à la lecture
  assert.equal(lignes[1][5] || '', '');            // cellule vide
});

test('le tatweel disparaît à la normalisation', () => {
  assert.equal(xlsx.normaliserArabe('أحْمَـــد'), 'احمد');
  assert.equal(xlsx.normaliserArabe('آمنة'), 'امنه');
});

test('les colonnes DC/DS du classeur sont reconnues', async () => {
  const r = await xlsx.lireFeuilles(donnees);
  const c = xlsx.classeurVersEpreuves(r.feuilles[0], classe);
  assert.deepEqual(c.epreuves, ['dc1','dc2','ds1','dc3','dc4','ds2']);
});

test('un élève est retrouvé même si l’ordre des mots arabes diffère', async () => {
  const r = await xlsx.lireFeuilles(donnees);
  const c = xlsx.classeurVersEpreuves(r.feuilles[0], classe);
  assert.match(c.csv, /^e1;Zouaoui;Ahmed;17;19,75/m);
});

test('un élève non retrouvé est conservé et signalé, jamais supprimé', async () => {
  const r = await xlsx.lireFeuilles(donnees);
  const c = xlsx.classeurVersEpreuves(r.feuilles[0], classe);
  assert.equal(c.lignes, 3, 'aucune ligne ne doit disparaître');
  assert.equal(c.avertissements.length, 1);
  assert.match(c.avertissements[0], /aucun élève/);
});

test('ABS et les décimales à point sont convertis pour l’import', async () => {
  const r = await xlsx.lireFeuilles(donnees);
  const c = xlsx.classeurVersEpreuves(r.feuilles[0], classe);
  assert.match(c.csv, /;19,75;/);
  assert.match(c.csv, /;ABS;/);
});

test('un fichier qui n’est pas un classeur est refusé clairement', async () => {
  await assert.rejects(() => xlsx.lireFeuilles(new Uint8Array([1,2,3,4,5])), /classeur Excel/);
});

test('le CSV produit se relit avec l’import par épreuve de l’application', async () => {
  const csv = require('../assets/student-csv.js');
  const r = await xlsx.lireFeuilles(donnees);
  // la 3e élève rejoint la classe : elle doit alors être reconnue elle aussi
  const c = xlsx.classeurVersEpreuves(r.feuilles[0], classe.concat([{ id:'e3', nom:'Hawes', prenom:'Emna', nomAr:'حواس', prenomAr:'آمنة' }]));
  const analyse = csv.analyserColonnesEpreuves(c.csv, classe.concat([{ id:'e3', nom:'Hawes', prenom:'Emna', nomAr:'حواس', prenomAr:'آمنة' }]));
  assert.deepEqual(analyse.errors, []);
  assert.equal(analyse.lignes.length, 3);
});

test('un élève absent de la classe est refusé à l’import, avec son nom dans le message', async () => {
  const csv = require('../assets/student-csv.js');
  const r = await xlsx.lireFeuilles(donnees);
  const c = xlsx.classeurVersEpreuves(r.feuilles[0], classe);
  const analyse = csv.analyserColonnesEpreuves(c.csv, classe);
  assert.equal(analyse.lignes.length, 2);
  assert.equal(analyse.errors.length, 1);
  assert.match(analyse.errors[0], /حواس/);
});
