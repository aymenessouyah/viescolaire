const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const svg = fs.readFileSync(path.join(root, 'assets/carte-visite-site.svg'), 'utf8');
const png = fs.readFileSync(path.join(root, 'assets/carte-visite-site.png'));
const pdf = fs.readFileSync(path.join(root, 'assets/carte-visite-site.pdf'));

test('la carte de visite est une page accessible depuis la navigation', () => {
  assert.match(app, /id:"v-carte"\s*,\s*t:"Carte de visite"/);
  assert.match(html, /<section id="v-carte" class="view ref-ui">/);
  assert.match(html, /Carte de visite du site/);
});

test('la page propose l’impression et le téléchargement des versions PDF, PNG et SVG', () => {
  assert.match(html, /onclick="printSiteBusinessCard\(\)"/);
  assert.match(html, /assets\/carte-visite-site\.pdf" download=/);
  assert.match(html, /assets\/carte-visite-site\.png" download=/);
  assert.match(html, /assets\/carte-visite-site\.svg" download=/);
  assert.match(app, /function printSiteBusinessCard\(\)/);
  assert.match(app, /function shareSiteCard\(\)/);
});

test('les fichiers PDF, PNG et SVG restent disponibles hors ligne dans le cache de l’application', () => {
  assert.match(sw, /\.\/assets\/carte-visite-site\.png/);
  assert.match(sw, /\.\/assets\/carte-visite-site\.svg/);
  assert.match(sw, /\.\/assets\/carte-visite-site\.pdf/);
  assert.equal(pdf.subarray(0, 5).toString('ascii'), '%PDF-');
});

test('la carte inclut les coordonnées validées et un QR vers le site', () => {
  assert.match(svg, /Espace pédagogique/);
  assert.match(svg, /Sciences et technologies de l’informatique/);
  assert.match(svg, /Aymen Essouyah/);
  assert.match(svg, /aymenessouyah@gmail\.com/);
  assert.match(svg, /aymenessouyah\.github\.io\/viescolaire/);
  assert.match(svg, /data-url="https:\/\/aymenessouyah\.github\.io\/viescolaire\/"/);
  assert.match(svg, /SCANNER POUR VISITER LE SITE/);
  assert.match(svg, /data:image\/png;base64,/);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1004);
  assert.equal(png.readUInt32BE(20), 650);
});
