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

test('le PDF dessine les traits du canevas de signature en fin de journée', async () => {
  const blob = pdfWindow.STI_PDF.cahier({
    titre: 'Cahier de textes',
    colonnes: ['Date', 'Séance'],
    largeurs: [70, 460],
    rows: [
      { type: 'row', cells: ['01/10/2026', 'Cours de programmation'] },
      { type: 'signature', label: 'Signature - 01/10/2026', strokes: [[[0.1, 0.72], [0.38, 0.2], [0.67, 0.58], [0.9, 0.22]]] }
    ]
  });
  const pdf = Buffer.from(await blob.arrayBuffer()).toString('latin1');
  assert.match(pdf, /0\.09 0\.22 0\.18 RG 1\.3 w [\d.]+ [\d.]+ m [\d.]+ [\d.]+ l/);
  assert.match(pdf, /Signature - 01\/10\/2026/);
});

test('le nouveau tableau PDF utilise trois colonnes et place la signature manuscrite dans la dernière', async () => {
  const blob = pdfWindow.STI_PDF.cahier({
    titre: 'Cahier de textes',
    colonnes: ['Date', 'Le travail réalisé', 'Signature'],
    largeurs: [82, 290, 143],
    rows: [{
      type: 'row',
      cells: ['01/10/2026 · 3SI1 · séance 2 · assurée', 'Séance n°2 — Variables et types', ''],
      signature: { strokes: [[[0.1, 0.72], [0.38, 0.2], [0.67, 0.58], [0.9, 0.22]]] }
    }]
  });
  const pdf = Buffer.from(await blob.arrayBuffer()).toString('latin1');
  assert.match(pdf, /SIGNATURE/);
  assert.match(pdf, /Variables et types/);
  assert.match(pdf, /0\.09 0\.22 0\.18 RG 1\.2 w [\d.]+ [\d.]+ m [\d.]+ [\d.]+ l/);
  assert.match(pdf, /0\.68 0\.68 0\.68 RG 0\.65 w/);
});
