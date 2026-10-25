const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('assets/app.js', 'utf8');
const center = fs.readFileSync('assets/fiches.js', 'utf8');
const styles = fs.readFileSync('assets/style.css', 'utf8');
const pdfGenerator = fs.readFileSync('assets/cahier-pdf.js', 'utf8');

test('le cahier à l’écran présente exactement les colonnes Date, Le travail réalisé et Signature', () => {
  assert.match(app, /<thead><tr><th scope="col">Date<\/th><th scope="col">Le travail réalisé<\/th><th scope="col">Signature<\/th><\/tr><\/thead>/);
  assert.match(app, /class="cah-table-wrap"/);
  assert.match(styles, /\.cah-table\{/);
  assert.match(styles, /\.cah-work-cell/);
  assert.match(styles, /\.cah-signature-cell/);
});

test('imprimer et exporter en PDF appellent le même assemblage que le Centre d’impression', () => {
  assert.match(app, /function printCahier\(\)[\s\S]*?printer\.call\(window\.STI_FICHES,\{classe:cahCls,trimestre:cahTri,statut:cahStatus\}\)/);
  assert.match(app, /function cahierPDF\(\)[\s\S]*?exporter\.call\(window\.STI_FICHES,\{classe:cahCls,trimestre:cahTri,statut:cahStatus\}\)/);
  assert.match(center, /<th>Date<\/th><th>Le travail réalisé<\/th><th>Signature<\/th>/);
  assert.match(center, /function exportCahierPDF\(\)|exportCahierPDF: options => printCahier/);
});

test('la signature quotidienne est attachée à la dernière séance et dessinée dans la dernière colonne PDF', () => {
  assert.match(app, /const finJour=dayIndex===g\.items\.length-1\|\|g\.items\[dayIndex\+1\]\.iso!==s\.iso/);
  assert.match(app, /const signatureCell=finJour/);
  assert.match(center, /signatureAtEnd: !session\.contextOnly && lastSessionByDate\.get/);
  assert.match(pdfGenerator, /if \(r\.signature\) drawSignatureCell\(r\.signature, y, h, cols\.length - 1\)/);
});
