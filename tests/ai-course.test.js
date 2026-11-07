const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
const guide = fs.readFileSync(path.join(root, 'Cours Ai', 'agent-ia-guide.html'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const theme = fs.readFileSync(path.join(root, 'assets/theme-classe.css'), 'utf8');
const colorMode = fs.readFileSync(path.join(root, 'assets/color-mode.js'), 'utf8');

test('Mon cours Ai ouvre uniquement la page de guide dédiée depuis l’onglet Agent Vie Scolaire AI', () => {
  assert.match(app, /t:"Agent Vie Scolaire AI"/);
  assert.match(app, /t\.id==="v-agent" \? '<a class="tab vs-course-ai" href="\.\/Cours%20Ai\/agent-ia-guide\.html"/);
  assert.doesNotMatch(app, /vs-course-ai[^>]+architecture_agent_ia\.xlsx/);
  assert.match(guide, /class="back" href="\.\.\/index\.html"/);
  assert.match(theme, /\.vs-sidebar \.vs-course-ai/);
});

test('le guide autonome reprend les sections et le contenu du fichier fourni, sans dépendance externe', () => {
  for (const id of ['archi', 'flux', 'cycle', 'agent', 'glossaire']) assert.match(guide, new RegExp('id="' + id + '"'));
  assert.match(guide, /Construire un agent IA, comme ouvrir un restaurant/);
  assert.match(guide, /Glossaire/);
  assert.doesNotMatch(guide, /<(?:script|link)\b[^>]+(?:src|href)=["']https?:\/\//i);
  assert.doesNotMatch(guide, /architecture_agent_ia\.xlsx|feuille Excel|XLSX/i);
});

test('un bouton accessible permet de revenir en haut après le défilement', () => {
  assert.match(guide, /id="back-to-top" type="button" aria-label="Remonter en haut de la page"/);
  assert.match(guide, /window\.scrollY<360/);
  assert.match(guide, /window\.scrollTo\(\{top:0,behavior:/);
  assert.match(guide, /prefers-reduced-motion: reduce/);
});

test('le thème du guide reprend le choix clair/sombre enregistré par le site', () => {
  assert.match(guide, /localStorage\.getItem\('sti_color_mode_v1'\)/);
  assert.match(guide, /html\[data-color-mode="dark"\]/);
  assert.match(colorMode, /sti_color_mode_v1/);
  assert.match(guide, /#F5F2E8/i);
  assert.match(guide, /#10402f/i);
});

test('le guide est disponible hors ligne dans le cache principal', () => {
  assert.match(serviceWorker, /\.\/Cours%20Ai\/agent-ia-guide\.html/);
  assert.doesNotMatch(serviceWorker, /agent-ia-guide-data\.js/);
});
