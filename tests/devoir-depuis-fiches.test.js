const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const racine = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(racine, 'assets', 'app.js'), 'utf8');
const eleves = fs.readFileSync(path.join(racine, 'assets', 'eleves.js'), 'utf8');
const reference = fs.readFileSync(path.join(racine, 'assets', 'interface-reference.js'), 'utf8');

/* Exécute juste la table des types, sans charger la page entière. */
function chargerTypes() {
  const debut = app.indexOf('const TYPES_EPREUVE');
  const fin = app.indexOf('function ic(');
  assert.ok(debut > 0 && fin > debut, 'la table des types doit être présente');
  const vm = require('node:vm');
  const contexte = {};
  vm.createContext(contexte);
  vm.runInContext(app.slice(debut, fin) + ';this.lib = libEpreuve; this.canon = typeEpreuveCanonique;', contexte);
  return contexte;
}

test('un seul libellé pour un même devoir, quel que soit le format enregistré', () => {
  const {lib} = chargerTypes();
  assert.equal(lib('dc'), 'Devoir de contrôle');
  assert.equal(lib('DC'), 'Devoir de contrôle');
  assert.equal(lib('Devoir de contrôle'), 'Devoir de contrôle');
  assert.equal(lib('ds'), 'Devoir de synthèse');
  assert.equal(lib('DS'), 'Devoir de synthèse');
  assert.equal(lib('devoir de synthese'), 'Devoir de synthèse');
  assert.equal(lib('TP'), 'TP / pratique');
  assert.equal(lib('dm'), 'Devoir maison');
});

test('le type enregistré est toujours le code canonique', () => {
  const {canon} = chargerTypes();
  assert.equal(canon('DC'), 'dc');
  assert.equal(canon('Devoir de contrôle'), 'dc');
  assert.equal(canon('Devoir de synthèse'), 'ds');
  assert.equal(canon(''), 'autre');
  assert.equal(canon(null), 'autre');
});

test('la répartition affiche le libellé, jamais le code brut', () => {
  assert.match(reference, /type-chip[^]{0,80}libEpreuve/);
  assert.doesNotMatch(reference, /type-chip">\$\{esc\(e\.type\)\}/);
});

test('le bouton d’ajout de devoir est présent sur les deux fiches demandées', () => {
  const fiche = reference.slice(reference.indexOf("el('v-fiche')"), reference.indexOf("el('v-avancement')"));
  const debutDevoirs = reference.indexOf("el('v-devoirs')");
  const finDevoirs = reference.indexOf("el('v-edt')") > debutDevoirs
    ? reference.indexOf("el('v-edt')")
    : debutDevoirs + 12000;
  const devoirs = reference.slice(debutDevoirs, finDevoirs);
  assert.match(fiche, /add-devoir/, 'la fiche pédagogique doit porter le bouton');
  assert.match(devoirs, /add-devoir/, 'la répartition doit porter le bouton');
});

test('la date reste libre : elle n’est jamais imposée par une autre fiche', () => {
  const debut = eleves.indexOf('function ajouterDevoir');
  const fin = eleves.indexOf('function addEpreuve');
  const corps = eleves.slice(debut, fin);
  assert.ok(corps.length > 0);
  // une valeur par défaut est permise (aujourd'hui), un verrou ne l'est pas
  assert.doesNotMatch(corps, /readonly/, 'le champ date ne doit pas être verrouillé');
  assert.doesNotMatch(corps, /disabled[^>]*dev-date/, 'le champ date doit rester actif');
  assert.match(corps, /id="dev-date" type="date" value="\$\{escapeHtml\(opts\.date \|\| todayISO\(\)\)\}"/);
});

test('un devoir ne peut pas être créé deux fois à la même date', () => {
  const debut = eleves.indexOf('function ajouterDevoir');
  const fin = eleves.indexOf('function addEpreuve');
  const corps = eleves.slice(debut, fin);
  assert.match(corps, /existe déjà pour cette classe et cette date/);
});

test('la création passe par le type canonique partout', () => {
  // création simple
  assert.match(eleves, /type:\(window\.typeEpreuveCanonique \? window\.typeEpreuveCanonique\(g\("ep-type"\)\)/);
  // modification
  assert.match(eleves, /epreuve\.type = window\.typeEpreuveCanonique/);
  // nouvel ajout depuis une fiche
  assert.match(eleves, /type:\(window\.typeEpreuveCanonique \? window\.typeEpreuveCanonique\(champ\("dev-type"\)\.value\)/);
  // modal de la répartition
  assert.match(reference, /typeEpreuveCanonique\(el\('ref-ex-type'\)\.value\)/);
});

test('les trois fichiers modifiés restent syntaxiquement valides', () => {
  ['assets/app.js', 'assets/eleves.js', 'assets/interface-reference.js'].forEach(f => {
    assert.doesNotThrow(() => execFileSync('node', ['--check', path.join(racine, f)]), f);
  });
});
