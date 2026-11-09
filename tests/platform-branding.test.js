const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('la marque latérale utilise l’icône livre d’origine et le bandeau conserve son icône', () => {
  const html = read('index.html');
  const sidebarCss = read('assets/theme-classe.css');
  const headerCss = read('assets/style.css');
  const worker = read('sw.js');
  const bookMark = '<span class="vs-brand-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z"/><path d="M12 5v15"/></svg></span>';

  assert.ok(html.includes(bookMark));
  assert.ok(sidebarCss.includes('.vs-brand-icon svg{width:23px;height:23px;stroke:currentColor}'));
  assert.ok(!sidebarCss.includes('.vs-brand-icon img{'));
  assert.ok(html.includes('<div class="logo">\n<svg'));
  assert.ok(headerCss.includes('.logo svg{width:30px;height:30px'));
  assert.ok(!worker.includes('logo-ministere-tunisie.png'));
  assert.ok(!html.includes('logo-ministere-tunisie.png'));
});
