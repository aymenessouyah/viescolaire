const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('le logo du ministère remplace la marque du menu latéral et reste disponible hors ligne', () => {
  const html = read('index.html');
  const sidebarCss = read('assets/theme-classe.css');
  const headerCss = read('assets/style.css');
  const worker = read('sw.js');
  const png = fs.readFileSync(path.join(root, 'assets/logo-ministere-tunisie.png'));

  assert.ok(html.includes('<span class="vs-brand-icon"><img src="./assets/logo-ministere-tunisie.png" alt="Ministère de l’Éducation de Tunisie"></span>'));
  assert.ok(sidebarCss.includes('.vs-themed .vs-brand-icon img{') && sidebarCss.includes('object-fit:contain'));
  assert.ok(worker.includes('"./assets/logo-ministere-tunisie.png"'));
  assert.ok(html.includes('<div class="logo">\n<svg'));
  assert.ok(headerCss.includes('.logo svg{width:30px;height:30px'));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});
