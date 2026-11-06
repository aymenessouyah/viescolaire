const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
const interfaceReference = fs.readFileSync(path.join(root, 'assets/interface-reference.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const coursePath = path.join(root, 'Cours Ai', 'architecture_agent_ia.xlsx');

test('le bouton Mon cours Ai est rendu immédiatement après l’onglet Agent Vie Scolaire AI', () => {
  assert.match(app, /t:"Agent Vie Scolaire AI"/);
  assert.match(app, /t\.id==="v-agent" \? '<a class="tab vs-course-ai" href="\.\/Cours%20Ai\/architecture_agent_ia\.xlsx" download="architecture_agent_ia\.xlsx"/);
  assert.match(app, /<span>Mon cours Ai<\/span><\/a>' : ''\)\)\.join/);
  assert.match(fs.readFileSync(path.join(root, 'assets/theme-classe.css'), 'utf8'), /\.vs-sidebar \.vs-course-ai/);
  assert.match(interfaceReference, /querySelectorAll\(':scope > button\.tab'\)/, 'le lien de téléchargement ne doit pas interrompre l’initialisation des autres boutons');
});

test('le fichier Excel est inclus dans le dépôt et pris en charge hors ligne', () => {
  const workbook = fs.readFileSync(coursePath);
  assert.equal(workbook.subarray(0, 2).toString('hex'), '504b');
  assert.match(sw, /\.\/Cours%20Ai\/architecture_agent_ia\.xlsx/);
  assert.ok(sw.includes('pdf|xlsx'), 'le service worker doit mettre le classeur en cache comme document hors ligne');
});
