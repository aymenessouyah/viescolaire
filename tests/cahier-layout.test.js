const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('assets/app.js', 'utf8');
const styles = fs.readFileSync('assets/style.css', 'utf8');
const pdf = fs.readFileSync('assets/cahier-pdf.js', 'utf8');

test('le cahier à l’écran présente exactement les colonnes Date, Le travail réalisé et Signature', () => {
  assert.match(app, /<thead><tr><th scope="col">Date<\/th><th scope="col">Le travail réalisé<\/th><th scope="col">Signature<\/th><\/tr><\/thead>/);
  assert.match(app, /class="cah-table-wrap"/);
  assert.match(styles, /\.cah-table\{/);
  assert.match(styles, /\.cah-work-cell/);
  assert.match(styles, /\.cah-signature-cell/);
});

test('l’impression et le PDF utilisent les mêmes trois colonnes', () => {
  assert.match(app, /<th>Date<\/th><th>Le travail réalisé<\/th><th>Signature<\/th>/);
  assert.match(app, /colonnes: \["Date","Le travail réalisé","Signature"\]/);
  assert.match(app, /largeurs: \[82,290,143\]/);
});

test('la signature reste placée à la fin de chaque journée, dans la troisième colonne', () => {
  assert.match(app, /const finJour=dayIndex===g\.items\.length-1\|\|g\.items\[dayIndex\+1\]\.iso!==s\.iso/);
  assert.match(app, /const signatureCell=finJour/);
  assert.match(app, /signature:dayIndex===day\.items\.length-1\?/);
  assert.match(pdf, /if \(r\.signature\) drawSignatureCell\(r\.signature, y, h, cols\.length - 1\)/);
});
