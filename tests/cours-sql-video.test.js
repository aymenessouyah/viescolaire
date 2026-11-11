const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const page = read('Cours SQL/groupby-having.html');
const data = read('tools/sql-video-data.js');
const app = read('assets/app.js');
const worker = read('sw.js');
const index = read('index.html');

const MP4 = path.join(root, 'Cours SQL/video/groupby-having.mp4');
const POSTER = path.join(root, 'Cours SQL/video/poster-1280.jpg');

test('la page « Mon cours SQL » est liée à la plateforme et sans numéro de vidéo', () => {
  assert.match(page, /<html lang="fr">/);
  assert.match(page, /<span class="brand">STI V2\.0 By A'e<\/span>/);
  assert.match(page, /<h1>Pour mieux comprendre GROUP BY et HAVING<\/h1>/);
  // la consigne : ni « Vidéo 8 » ni « vidéo 8 »
  assert.doesNotMatch(page, /[Vv]id[ée]o\s*8/);
  // entrée dans la plateforme, à côté du cours Ai
  assert.match(app, /Cours%20Ai\/agent-ia-guide\.html/);
  assert.match(app, /Cours%20SQL\/groupby-having\.html/);
  assert.match(app, /Mon cours SQL/);
  assert.match(worker, /\.\/Cours%20SQL\/groupby-having\.html/);
});

test('les montants sont en dinars, jamais en euros', () => {
  const all = page + data;
  assert.doesNotMatch(all, /€|euros?/i);
  assert.match(page, /12 122,02/);
  assert.match(page, /DT/);
});

test('la vidéo et son affiche sont publiées', () => {
  assert.ok(fs.existsSync(MP4), 'le MP4 doit être versionné');
  assert.ok(fs.existsSync(POSTER), 'l’affiche 1280×720 doit accompagner la vidéo');
  const head = fs.readFileSync(MP4).subarray(4, 8).toString('latin1');
  assert.equal(head, 'ftyp', 'fichier MP4 (boîte ftyp)');
  assert.match(page, /<video id="vid-sql"[^>]*poster="\.\/video\/poster-1280\.jpg"/);
  assert.match(page, /<source src="\.\/video\/groupby-having\.mp4" type="video\/mp4">/);
});

test('chapitres, sous-titres et transcription sont cohérents avec le montage', () => {
  const ctx = {};
  vm.runInNewContext(data, ctx);
  const d = ctx.SQL_VIDEO_DATA;
  assert.ok(d, 'SQL_VIDEO_DATA doit être exposé');
  assert.ok(d.chapters.length >= 8, 'au moins huit chapitres');
  assert.ok(d.cues.length >= 30, 'les sous-titres couvrent les 34 phrases');
  assert.ok(d.script.length >= 10, 'transcription par section');

  // bornes croissantes et sans chevauchement
  for (let i = 1; i < d.cues.length; i++) {
    assert.ok(d.cues[i][0] >= d.cues[i - 1][0], 'cues ordonnés');
    assert.ok(d.cues[i][1] > d.cues[i][0], 'cue de durée positive');
  }
  for (const c of d.chapters) {
    assert.ok(c[0] <= d.cues[d.cues.length - 1][1] + 1, 'chapitre dans la durée du film');
  }
  // les deux langues sont présentes (français + darija)
  const arabic = d.cues.filter(c => /[\u0600-\u06ff]/.test(c[2])).length;
  const french = d.cues.length - arabic;
  assert.ok(arabic >= 5 && french >= 15, `mélange attendu : ${french} fr / ${arabic} ar`);
  // aucun « Vidéo 8 » dans le texte affiché
  assert.doesNotMatch(JSON.stringify(d), /[Vv]id[ée]o\s*8/);
  // et plus de « تنجّم / تنجّمش », que la voix rendait « tnaguamch »
  assert.doesNotMatch(JSON.stringify(d), /تنجم/);
});
