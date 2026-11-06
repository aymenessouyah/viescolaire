const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
const interfaceReference = fs.readFileSync(path.join(root, 'assets/interface-reference.js'), 'utf8');
const guide = fs.readFileSync(path.join(root, 'Cours Ai', 'agent-ia-guide.html'), 'utf8');
const guideDataSource = fs.readFileSync(path.join(root, 'Cours Ai', 'agent-ia-guide-data.js'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const guideData = Function(guideDataSource.replace(/^window\./, 'const window = {}; window.') + '\nreturn window.AGENT_IA_GUIDE_DATA;')();

test('Mon cours Ai ouvre uniquement la nouvelle page web du cours', () => {
  assert.match(app, /t\.id==="v-agent" \? '<a class="tab vs-course-ai" href="\.\/Cours%20Ai\/agent-ia-guide\.html"/);
  assert.doesNotMatch(app, /vs-course-ai[^>]+architecture_agent_ia\.xlsx/);
  assert.match(interfaceReference, /querySelectorAll\(':scope > button\.tab'\)/, 'le lien du cours ne doit pas interrompre l’initialisation des onglets');
  assert.match(guide, /<a class="back-link" href="\.\.\/index\.html"/);
});

test('la page du cours propose exactement les six feuilles du classeur', () => {
  assert.equal(guideData.length, 6);
  assert.deepEqual(guideData.map(sheet => sheet.name), [
    'Composants', 'Cycle de création', 'Mon agent Vie Scolaire',
    "Flux d'une requête", "Points d'attention", 'Glossaire'
  ]);
  assert.match(guide, /sheet\.blocks\.map\(renderBlock\)/);
  assert.match(guide, /dialog\.showModal\(\)/);
});

test('le contenu des six feuilles est rendu dans des tableaux HTML et reste complet', () => {
  assert.ok(guideData.every(sheet => sheet.blocks.length && sheet.blocks.every(block => block.headers.length && block.rows.length)));
  assert.equal(guideData.find(sheet => sheet.name === 'Glossaire').blocks[0].rows.length, 30);
  assert.equal(guideData.find(sheet => sheet.name === 'Mon agent Vie Scolaire').blocks[0].rows.length, 8);
  assert.match(guide, /<table>/);
  assert.match(guide, /aria-label="Feuilles du cours"/);
  assert.match(guide, /@media\(max-width:650px\)/);
  assert.match(guide, /data-color-mode="dark"/);
});

test('la page et ses données sont mises en cache pour la consultation hors ligne', () => {
  assert.match(serviceWorker, /\.\/Cours%20Ai\/agent-ia-guide\.html/);
  assert.match(serviceWorker, /\.\/Cours%20Ai\/agent-ia-guide-data\.js/);
});
