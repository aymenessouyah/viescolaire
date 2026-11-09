const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('le logo du ministère remplace l’icône de livre et reste disponible hors ligne', () => {
  const html = read('index.html');
  const css = read('assets/style.css');
  const worker = read('sw.js');
  const imagePath = path.join(root, 'assets/logo-ministere-tunisie.png');
  const png = fs.readFileSync(imagePath);

  assert.match(html, /class="logo"[\s\S]*?<img src="\.\/assets\/logo-ministere-tunisie\.png" alt="Ministère de l’Éducation de Tunisie">[\s\S]*?<\/div>/);
  assert.match(css, /\.logo img\{[^}]*object-fit:contain/);
  assert.match(worker, /"\.\/assets\/logo-ministere-tunisie\.png"/);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});
