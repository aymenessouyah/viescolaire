const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'eleves.js'), 'utf8');

/* Ces vérifications lisent le source plutôt que d'exécuter la page : elles
   garantissent que le professeur garde la main sur les dates, et qu'aucune
   modification d'épreuve ne peut effacer les notes. */

test('une épreuve peut être modifiée après sa création', () => {
  assert.match(source, /function modifierEpreuve\s*\(/, 'modifierEpreuve doit exister');
  assert.match(source, /window\.modifierEpreuve\s*=/, 'la fonction doit être exposée pour les gestionnaires inline');
});

test('le bouton Modifier est proposé sur chaque épreuve', () => {
  assert.match(source, /elEtat\(\{epreuve:'mod:\$\{e\.id\}'\}\)/, 'le bouton doit ouvrir le formulaire de modification');
});

test('le formulaire de modification pré-remplit la date, le titre et le barème', () => {
  assert.match(source, /id="ep-mod-date"[^>]*value="\$\{e\.date\|\|""\}/);
  assert.match(source, /id="ep-mod-titre"[^>]*value="\$\{escapeHtml\(e\.titre\)\}"/);
  assert.match(source, /id="ep-mod-bareme"[^>]*value="\$\{e\.bareme\|\|20\}"/);
});

test('modifier une épreuve ne supprime ni les notes ni les présences', () => {
  const debut = source.indexOf('function modifierEpreuve');
  const fin = source.indexOf('function presetsOfficiels');
  const corps = source.slice(debut, fin);
  assert.ok(corps.length > 0);
  assert.doesNotMatch(corps, /delete\s+store\.notes/, 'aucune note ne doit être supprimée');
  assert.doesNotMatch(corps, /store\.presences\s*=/, 'aucune présence ne doit être écrasée');
  assert.doesNotMatch(corps, /epreuvesDe\(cid\)\.push/, 'aucune épreuve ne doit être recréée');
});

test('un barème abaissé sous une note existante demande confirmation', () => {
  const debut = source.indexOf('function modifierEpreuve');
  const fin = source.indexOf('function presetsOfficiels');
  const corps = source.slice(debut, fin);
  assert.match(corps, /horsBareme/, 'les notes au-dessus du nouveau barème doivent être repérées');
  assert.match(corps, /confirm\(/, 'le professeur doit confirmer avant tout écrasement');
});

test('la date n’est jamais figée ailleurs que dans l’épreuve elle-même', () => {
  // le pré-remplissage officiel ne doit pas s'approprier la date : il propose,
  // il n'impose pas. On vérifie qu'aucun verrou de date n'existe dans le rendu.
  const debut = source.indexOf('function vueEpreuves');
  const fin = source.indexOf('function vueEpreuveDetail') > 0
    ? source.indexOf('function vueEpreuveDetail')
    : debut + 12000;
  const rendu = source.slice(debut, fin);
  assert.doesNotMatch(rendu, /readonly/, 'la ligne d’épreuve ne doit pas verrouiller la date');
  assert.doesNotMatch(rendu, /disabled[^>]*ep-mod-date/, 'le champ date doit rester modifiable');
});

test('la page reste syntaxiquement valide', () => {
  assert.doesNotThrow(() => execFileSync('node', ['--check', path.join(__dirname, '..', 'assets', 'eleves.js')]));
});
