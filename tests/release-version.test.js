const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const app = read('assets/app.js');
const html = read('index.html');
const worker = read('sw.js');
const readme = read('README.md');

test('la version, le cache hors ligne et la version attendue sont synchronisés', () => {
  const version = /const APP_VER = "(v\d+\.\d+\.\d+)"/.exec(app)?.[1];
  assert.ok(version, 'APP_VER doit suivre le format vMAJEUR.MINEUR.CORRECTIF');
  assert.match(app, /const APP_UPDATED_AT = "\d{4}-\d{2}-\d{2} \(GMT\+1\)"/);
  assert.ok(html.includes(`var ATTENDU = "${version}"`));
  assert.ok(worker.includes(`const VERSION='sti-espace-${version}'`));
  assert.ok(html.includes('id="app-release"'));
  assert.match(app, /app-release[\s\S]*APP_VER[\s\S]*APP_UPDATED_AT/);
  assert.match(app, /window\.APP_UPDATED_AT = APP_UPDATED_AT/);
});

test('la procédure de mise à jour exige une version et une date GMT+1', () => {
  assert.match(readme, /À chaque modification publiée de la plateforme/);
  assert.match(readme, /GMT\+1/);
});
