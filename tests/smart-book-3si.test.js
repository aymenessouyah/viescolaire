const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('data/livres-sti.js', 'utf8');

function books() {
  const window = {};
  vm.runInNewContext(source, { window }, { filename: 'data/livres-sti.js' });
  return window.STI_DATA.livresSTI;
}

const COMPLEMENTS = [
  ['transform: translateX(px)', 'CSS3', 62],
  ['transform: translateY(px)', 'CSS3', 62],
  ['transform: skewX(deg)', 'CSS3', 62],
  ['transform: skewY(deg)', 'CSS3', 62],
  ['linear-gradient(direction, couleur1, couleur2, …)', 'CSS3', 62],
  ['rgb(r, v, b)', 'CSS3', 62],
  ['hsl(h, s%, l%)', 'CSS3', 62],
  ['filter: blur(px)', 'CSS3', 62],
  ['filter: invert(%)', 'CSS3', 62],
  ['parseInt(ch)', 'JavaScript', 67],
  ['parseFloat(ch)', 'JavaScript', 67],
  ['x.valueOf()', 'JavaScript', 67],
  ['confirm(message)', 'JavaScript', 67],
  ['setTimeout(fonction, délai)', 'JavaScript', 67],
  ['clearInterval(id)', 'JavaScript', 67],
  ['removeEventListener(événement, fonction)', 'JavaScript', 67],
  ['objet.getTime(…)', 'JavaScript', 67],
  ['objet.setTime(…)', 'JavaScript', 67],
  ['NOW()', 'SQL / BD', 71]
];

test('le référentiel 3SI1 suit le Smart Book mis à jour : 288 notions uniques', () => {
  const L = books();
  const items = L['3SI1'].items;
  assert.equal(items.length, 288);
  assert.equal(new Set(items.map(item => item.id)).size, 288);
  assert.deepEqual(
    Object.fromEntries([...new Set(items.map(item => item.domain))].map(d => [d, items.filter(item => item.domain === d).length])),
    { HTML5: 76, CSS3: 92, JavaScript: 88, 'SQL / BD': 32 }
  );
  assert.equal(L['4SI2'].items.length, 333, 'le référentiel 4SI2 ne change pas');
});

test('les compléments du livre (p. 62, 67 et 71) sont référencés avec leur page', () => {
  const items = books()['3SI1'].items;
  COMPLEMENTS.forEach(([label, domain, page]) => {
    const found = items.filter(item => item.label === label);
    assert.equal(found.length, 1, `notion absente ou en double : ${label}`);
    assert.equal(found[0].domain, domain, `domaine de ${label}`);
    assert.deepEqual(Array.from(found[0].pages), [page], `page de ${label}`);
    assert.ok(found[0].description && found[0].description.length > 5, `description de ${label}`);
  });
});

test('les identifiants ajoutés ne remplacent aucun identifiant existant', () => {
  const items = books()['3SI1'].items;
  const added = items.filter(item => Number(item.id.slice(5)) >= 270);
  assert.equal(added.length, 19);
  assert.deepEqual(
    Array.from(added.map(item => item.id)),
    Array.from({ length: 19 }, (_, i) => '3si-r' + String(270 + i))
  );
  const legacy = items.filter(item => Number(item.id.slice(5)) < 270);
  assert.equal(legacy.length, 269);
});

test('le PDF du Smart Book 3e SI déposé correspond au référentiel annoncé', () => {
  const L = books()['3SI1'];
  assert.equal(L.book, 'docs/sti-smart-book-3si-2026.pdf');
  assert.equal(L.start, 58);
  assert.equal(L.end, 72);
  const pdf = fs.readFileSync(L.book);
  assert.ok(pdf.length > 100000, 'le PDF du livre est présent');
  assert.equal(pdf.subarray(0, 5).toString('latin1'), '%PDF-');
});

test('le référentiel publie la date d’édition et les 19 notions ajoutées', () => {
  const c = books()['3SI1'];
  assert.deepEqual(JSON.parse(JSON.stringify(c.edition)), {
    date: '2026-10-31',
    label: 'Édition 2026 — compléments p. 62, 67 et 71',
    added: 19,
    pages: [62, 67, 71],
    domains: { CSS3: 9, JavaScript: 9, 'SQL / BD': 1 }
  });
  const flagged = c.items.filter(item => item.added === true);
  assert.equal(flagged.length, 19);
  assert.deepEqual(Array.from(flagged.map(item => item.id)), Array.from({ length: 19 }, (_, i) => '3si-r' + String(270 + i)));
  COMPLEMENTS.forEach(([label, domain]) => {
    const item = flagged.find(entry => entry.label === label);
    assert.ok(item, `notion ajoutée non marquée : ${label}`);
    assert.equal(item.domain, domain);
  });
  const legacy = c.items.filter(item => Number(item.id.slice(5)) < 270);
  assert.equal(legacy.filter(item => item.added === true).length, 0);
});
