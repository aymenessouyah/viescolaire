const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

test('une vérification partielle ne s’annonce jamais comme une absence de fichier', () => {
  const src = read('assets/fiche-devoir-documents.js');
  // le rendu doit disposer d'un état « je ne sais pas »
  assert.match(src, /function incomplete\(\)/);
  // et ne plus afficher « aucun fichier disponible » quand une source a échoué
  const draw = src.slice(src.indexOf('function draw()'), src.indexOf('async function refresh()'));
  assert.match(draw, /incomplete\(\) \?/);
  assert.match(draw, /Impossible de vérifier les fichiers/);
  // le cas « aucun fichier » reste réservé aux vérifications complètes
  assert.match(draw, /label \+ ' : aucun fichier disponible\.'/);
});

test('le diagnostic des documents teste projet, compte, année et séances', () => {
  const app = read('assets/app.js');
  const html = read('index.html');
  assert.match(app, /async function runDocsDiagnostic/);
  assert.match(app, /window\.runDocsDiagnostic = runDocsDiagnostic/);
  assert.match(html, /runDocsDiagnostic\(this\)/);
  assert.match(html, /id="cfg-diag-out"/);
  // les quatre maillons doivent être vérifiés
  for (const sonde of [/Projet interrogé/, /Compte :/, /Année scolaire utilisée/, /séance/, /statusForSessions/]) {
    assert.match(app, sonde);
  }
  // un projet local différent du fichier publié doit être signalé
  assert.match(app, /Ce n'est pas le projet publié/);
});
