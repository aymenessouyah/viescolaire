const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const pdfWindow = {};
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'assets/cahier-pdf.js'), 'utf8'),
  { window: pdfWindow, Blob },
  { filename: 'assets/cahier-pdf.js' }
);

test('le générateur PDF imprime la signature à la suite des séances de la journée', async () => {
  const blob = pdfWindow.STI_PDF.cahier({
    titre: 'Cahier de textes',
    sous: 'Classe — période',
    colonnes: ['Date', 'Séance'],
    largeurs: [70, 460],
    rows: [
      { type: 'sem', label: 'Semaine du 28/09/2026' },
      { type: 'row', cells: ['01/10/2026', 'Cours de programmation'], etat: 'ok' },
      { type: 'signature', label: 'Signature - 01/10/2026', value: 'Professeur STI' }
    ]
  });
  const pdf = Buffer.from(await blob.arrayBuffer()).toString('latin1');
  assert.match(pdf, /Professeur STI/);
  assert.match(pdf, /Signature - 01\/10\/2026/);
  assert.match(pdf, /Cours de programmation/);
});
