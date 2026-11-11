const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const guide = read('Cours Ai/agent-ia-guide.html');
const worker = read('sw.js');
const app = read('assets/app.js');
const index = read('index.html');

const MP4 = path.join(root, 'Cours Ai/video/agent-ia-darija.mp4');
const POSTER = path.join(root, 'Cours Ai/video/poster-1280.jpg');

test('la vidéo en darija est publiée avec son affiche et lisible par le navigateur', () => {
  assert.ok(fs.existsSync(MP4), 'le MP4 du cours doit être versionné dans Cours Ai/video');
  assert.ok(fs.existsSync(POSTER), 'l’affiche 1280×720 doit accompagner la vidéo');
  const size = fs.statSync(MP4).size;
  assert.ok(size > 1e6 && size < 40e6, `taille inattendue : ${size} octets`);
  // en-tête ISO-BMFF : ftyp dans les 8 premiers octets
  const head = fs.readFileSync(MP4).subarray(4, 8).toString('latin1');
  assert.equal(head, 'ftyp', 'le fichier doit être un MP4 (boîte ftyp)');
  // faststart : la table des pistes (moov) précède les données (mdat), indispensable au
  // démarrage de la lecture avant téléchargement complet.
  const probe = fs.readFileSync(MP4).subarray(0, 2 << 20).toString('latin1');
  const moov = probe.indexOf('moov');
  const mdat = probe.indexOf('mdat');
  assert.ok(moov > -1, 'la boîte moov doit être présente au début du fichier');
  assert.ok(mdat === -1 || moov < mdat, 'le MP4 doit être en faststart (moov avant mdat)');
});

test('la page « Mon cours Ai » intègre la vidéo, ses chapitres et ses sous-titres', () => {
  assert.match(guide, /<section id="video">/);
  assert.match(guide, /<video id="vid-ai"[^>]*controls[^>]*poster="\.\/video\/poster-1280\.jpg"/);
  assert.match(guide, /<source src="\.\/video\/agent-ia-darija\.mp4" type="video\/mp4">/);
  assert.match(guide, /href="\.\/video\/agent-ia-darija\.mp4" download=/, 'téléchargement du MP4');
  // la vidéo doit précéder la première section du cours
  assert.ok(guide.indexOf('id="video"') < guide.indexOf('id="archi"'), 'la vidéo ouvre la page');
  // accessibilité : bouton de sous-titres en aria-pressed
  assert.match(guide, /id="vid-cc"[^>]*aria-pressed="false"/);
  assert.match(guide, /id="vid-ccbox"[^>]*aria-live="polite"/);
  // 9 chapitres cliquables, horodatés mm:ss
  const chapters = guide.match(/<button type="button" data-t="\d+:\d\d">/g) || [];
  assert.equal(chapters.length, 9, 'neuf chapitres horodatés');
  assert.match(guide, /nav[\s\S]*href="#video"/, 'entrée dans la navigation');
  assert.match(guide, /class="menu"[\s\S]*href="#video"/, 'entrée dans le menu du héros');
});

test('le service worker met la vidéo hors ligne sans bloquer l’installation', () => {
  assert.match(worker, /\.\/Cours%20Ai\/video\/agent-ia-darija\.mp4/);
  assert.match(worker, /\.\/Cours%20Ai\/video\/poster-1280\.jpg/);
  // la vidéo est exclue du pré-cache bloquant et servie « cache d’abord »
  assert.match(worker, /const VIDEO=\/\(\^\|\\\/\)video\\\//);
  assert.match(worker, /CORE_ASSETS\.filter\(p=>!VIDEO\.test\(p\)\)/);
  assert.match(worker, /catch\(e\)\{return new Response\('Vidéo pas encore téléchargée/);
  const version = /const APP_VER = "(v\d+\.\d+\.\d+)"/.exec(app)[1];
  assert.ok(worker.includes(`const VERSION='sti-espace-${version}'`));
  assert.ok(index.includes(`var ATTENDU = "${version}"`));
});
