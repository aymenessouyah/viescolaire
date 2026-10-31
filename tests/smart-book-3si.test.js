const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const vm = require('node:vm');

const source = fs.readFileSync('data/livres-sti.js', 'utf8');

function books() {
  const window = {};
  vm.runInNewContext(source, { window }, { filename: 'data/livres-sti.js' });
  return window.STI_DATA.livresSTI;
}

/* Encadrés « Complément » de la version finale : pages 71 (CSS3), 76 (JavaScript) et 80 (SQL). */
const COMPLEMENTS = [
  ['transform: translateX(px)', 'CSS3', 71],
  ['transform: translateY(px)', 'CSS3', 71],
  ['transform: skewX(deg)', 'CSS3', 71],
  ['transform: skewY(deg)', 'CSS3', 71],
  ['linear-gradient(direction, couleur1, couleur2, …)', 'CSS3', 71],
  ['rgb(r, v, b)', 'CSS3', 71],
  ['hsl(h, s%, l%)', 'CSS3', 71],
  ['filter: blur(px)', 'CSS3', 71],
  ['filter: invert(%)', 'CSS3', 71],
  ['parseInt(ch)', 'JavaScript', 76],
  ['parseFloat(ch)', 'JavaScript', 76],
  ['x.valueOf()', 'JavaScript', 76],
  ['confirm(message)', 'JavaScript', 76],
  ['setTimeout(fonction, délai)', 'JavaScript', 76],
  ['clearInterval(id)', 'JavaScript', 76],
  ['removeEventListener(événement, fonction)', 'JavaScript', 76],
  ['objet.getTime(…)', 'JavaScript', 76],
  ['objet.setTime(…)', 'JavaScript', 76],
  ['NOW()', 'SQL / BD', 80]
];

const TABLES = { HTML5: [67, 70], CSS3: [71, 75], JavaScript: [76, 79], 'SQL / BD': [80, 81] };

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

test('les compléments de la version finale sont référencés avec leur nouvelle page', () => {
  const items = books()['3SI1'].items;
  COMPLEMENTS.forEach(([label, domain, page]) => {
    const found = items.filter(item => item.label === label);
    assert.equal(found.length, 1, `notion absente ou en double : ${label}`);
    assert.equal(found[0].domain, domain, `domaine de ${label}`);
    assert.deepEqual(Array.from(found[0].pages), [page], `page de ${label}`);
    assert.equal(found[0].complement, true, `marqueur complément de ${label}`);
    assert.ok(found[0].description && found[0].description.length > 5, `description de ${label}`);
  });
  assert.equal(items.filter(item => item.complement === true).length, 19);
  assert.equal(items.filter(item => item.added === true).length, 0, 'plus aucune notion « ajoutée »');
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

test('chaque notion renvoie vers les pages 67 à 81 de la version finale', () => {
  const L = books()['3SI1'];
  assert.equal(L.book, 'docs/sti-smart-book-3si-2026.pdf');
  assert.equal(L.start, 67);
  assert.equal(L.end, 81);
  L.items.forEach(item => {
    assert.ok(item.pages.length >= 1, `pages de ${item.label}`);
    const [min, max] = TABLES[item.domain];
    item.pages.forEach(page => {
      assert.ok(page >= min && page <= max, `${item.label} : page ${page} hors du tableau ${item.domain} (${min}-${max})`);
    });
  });
  Object.entries(TABLES).forEach(([domain, [min, max]]) => {
    const pages = L.items.filter(item => item.domain === domain).flatMap(item => Array.from(item.pages));
    assert.equal(Math.min(...pages), min, `première page ${domain}`);
    assert.equal(Math.max(...pages), max, `dernière page ${domain}`);
  });
  assert.equal(L.items.filter(item => item.absent === true).length, 0, 'aucune notion absente de la version finale');
});

test('le PDF déposé est bien la version finale de 2026', () => {
  const pdf = fs.readFileSync('docs/sti-smart-book-3si-2026.pdf');
  assert.equal(pdf.subarray(0, 5).toString('latin1'), '%PDF-');
  assert.equal(pdf.length, 2707885, 'taille du fichier déposé');
  assert.equal(crypto.createHash('md5').update(pdf).digest('hex'), 'aaabc102ae0fd5be97cafd047526b5e0');
});

test('le référentiel publie la version et la plage des tableaux', () => {
  const c = books()['3SI1'];
  assert.deepEqual(JSON.parse(JSON.stringify(c.edition)), {
    date: '2026-10-31',
    label: 'Version finale',
    pages: [67, 81],
    tables: { HTML5: [67, 70], CSS3: [71, 75], JavaScript: [76, 79], 'SQL / BD': [80, 81] },
    complements: { total: 19, domains: { CSS3: 9, JavaScript: 9, 'SQL / BD': 1 } },
    added: 0,
    removed: 0
  });
  assert.equal(c.edition.pages[0], books()['3SI1'].start);
  assert.equal(c.edition.pages[1], books()['3SI1'].end);
});
