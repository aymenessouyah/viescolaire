const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const verifSource = fs.readFileSync(path.join(root, 'assets/agent-verif.js'), 'utf8');
const epreuveSource = fs.readFileSync(path.join(root, 'assets/agent-epreuve.js'), 'utf8');
const agentSource = fs.readFileSync(path.join(root, 'assets/agent-sti.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workerSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');

function loadVerif() {
  const window = {};
  vm.runInNewContext(verifSource, { window, console, Date, Math, String, Number, Object, Array, Set, Map, Promise, JSON }, { filename: 'agent-verif.js' });
  return window.STI_VERIF;
}
const html = content => ({ name: 'index.html', language: 'html', content });
const css = content => ({ name: 'style.css', language: 'css', content });
const js = content => ({ name: 'app.js', language: 'js', content });
const php = content => ({ name: 'traitement.php', language: 'php', content });
const sql = content => ({ name: 'base.sql', language: 'sql', content });

const MAQUETTE_HTML = '<!DOCTYPE html>\n<html lang="fr">\n<head><title>TP formulaire</title><link rel="stylesheet" href="style.css"></head>\n<body><header><h1>TP</h1></header><main><form method="post" action="traitement.php"><label for="nom">Nom</label><input id="nom" name="nom"><button type="submit">Envoyer</button></form></main></body></html>';
const MAQUETTE_CSS = 'body{color:#222;font-size:16px;margin:0;padding:0}\n@media (max-width:640px){body{font-size:14px}}\nbutton:hover{background:#eee}';
const MAQUETTE_JS = 'const champ = document.getElementById("nom");\nchamp.addEventListener("input", () => { if (champ.value.trim() === "") { champ.classList.add("erreur"); } });\nfor (let i = 0; i < 3; i++) { console.log(i); }';

function grillePour(sur, technos = ['html', 'css', 'js']) {
  const api = loadVerif();
  return api.scaleGrille(api.buildGrille({ technos, points: {} }), sur);
}

test('les contrôles constatent le présent, l’absence et l’incertitude', () => {
  const api = loadVerif();
  const grille = api.buildGrille({ technos: ['html', 'css', 'js'], points: {} });
  const outcomes = api.runGrille([html(MAQUETTE_HTML), css(MAQUETTE_CSS), js(MAQUETTE_JS)], grille);
  const parId = Object.fromEntries(outcomes.map(item => [item.critere.check, item]));
  assert.equal(parId['html.doctype'].statut, 'ok');
  assert.match(parId['html.doctype'].preuve, /index\.html ligne 1/);
  assert.equal(parId['html.form'].statut, 'ok');
  assert.equal(parId['html.input-name'].statut, 'ok');
  assert.equal(parId['html.css-link'].statut, 'ok');
  assert.equal(parId['css.responsive'].statut, 'ok');
  assert.equal(parId['css.hover'].statut, 'ok');
  assert.equal(parId['js.listener'].statut, 'ok');
  assert.equal(parId['js.loop'].statut, 'ok');
  // aucune image : le contrôle « alt » ne peut pas conclure
  assert.equal(parId['html.alt'].statut, 'indetermine');
  // une copie sans CSS/JS conclut « à vérifier », pas « absent »
  const sansCss = api.runGrille([html(MAQUETTE_HTML)], grille);
  assert.equal(sansCss.find(item => item.critere.check === 'css.responsive').statut, 'indetermine');
  assert.match(sansCss.find(item => item.critere.check === 'css.responsive').preuve, /Aucun fichier CSS/);
});

test('les contrôles PHP et SQL repèrent les motifs attendus', () => {
  const api = loadVerif();
  const grille = api.buildGrille({ technos: ['php', 'sql'], points: {} });
  const outcomes = api.runGrille([
    php('<?php\nif (isset($_POST["nom"])) { $nom = $_POST["nom"]; }\n$pdo = new PDO("mysql:host=localhost;dbname=tp", "root", "");\n$requete = $pdo->prepare("INSERT INTO eleves(nom) VALUES(?)");\necho "ok";'),
    sql('CREATE TABLE eleves (id INT PRIMARY KEY, nom VARCHAR(40));\nINSERT INTO eleves(nom) VALUES ("A");\nSELECT nom\n  FROM eleves\n WHERE id > 2 ORDER BY nom;')
  ], grille);
  const parId = Object.fromEntries(outcomes.map(item => [item.critere.check, item]));
  assert.equal(parId['php.tag'].statut, 'ok');
  assert.equal(parId['php.superglobal'].statut, 'ok');
  assert.equal(parId['php.prepared'].statut, 'ok');
  assert.equal(parId['sql.select'].statut, 'ok', 'une requête répartie sur deux lignes est reconnue');
  assert.equal(parId['sql.create'].statut, 'ok');
  assert.equal(parId['sql.join'].statut, 'absent');
  assert.equal(parId['sql.where'].statut, 'ok');
});

test('les lignes de la grille acceptent les formats souples et ignorent le bruit', () => {
  const api = loadVerif();
  assert.deepEqual(Array.from(api.parseLines('Clarté du code | 2', 'manuel'), item => [item.libelle, item.points]), [['Clarté du code', 2]]);
  assert.deepEqual(Array.from(api.parseLines('Respect du cahier des charges', 'manuel'), item => [item.libelle, item.points]), [['Respect du cahier des charges', 1]]);
  assert.deepEqual(Array.from(api.parseLines('Code | lisible | 1,5', 'manuel'), item => [item.libelle, item.points]), [['Code | lisible', 1.5]]);
  assert.deepEqual(Array.from(api.parseLines('# commentaire\n\n  \nSoin | 3', 'manuel'), item => item.libelle), ['Soin']);
  assert.deepEqual(Array.from(api.parseLines('Fonction de connexion | function connexion | 2', 'attendu'), item => [item.libelle, item.attendu, item.points]), [['Fonction de connexion', 'function connexion', 2]]);
  assert.equal(api.parseLines('Sans texte |', 'attendu').length, 0, 'un texte attendu vide est ignoré');
  assert.deepEqual(Array.from(api.parseLines('Connexion | prepare(', 'attendu'), item => [item.attendu, item.points]), [['prepare(', 1]]);
  assert.equal(api.parseLines('Trop de points | 500', 'manuel')[0].points, 100);
  assert.equal(api.parseLines('Négatif | -3', 'manuel')[0].points, 0);
});

test('la grille combine contrôles cochés, critères manuels et textes attendus', () => {
  const api = loadVerif();
  const grille = api.buildGrille({ technos: ['css'], points: { 'css.layout': 3 }, manuel: 'Soin | 2', attendus: 'Connexion | prepare( | 4' });
  assert.ok(grille.criteres.every(item => item.source !== 'auto' || item.techno === 'css'));
  assert.equal(grille.criteres.find(item => item.check === 'css.layout').points, 3, 'les points saisis remplacent la valeur par défaut');
  assert.deepEqual(Array.from(grille.criteres.filter(item => item.source !== 'auto'), item => item.source), ['manuel', 'attendu']);
  assert.equal(grille.total, 3 + 1 + 1 + 2 + 1 + 1 + 2 + 4, 'le total additionne points automatiques, manuels et attendus');
  assert.deepEqual(Array.from(grille.technos), ['css']);
  // aller-retour éditeur → grille → éditeur
  const editor = api.editorFromGrille(grille);
  assert.deepEqual(Array.from(editor.technos), ['css']);
  assert.match(editor.manuel, /Soin \| 2/);
  assert.match(editor.attendus, /Connexion \| prepare\( \| 4/);
  assert.equal(api.buildGrille(editor).total, grille.total);
});

test('la grille enregistrée est nettoyée : doublons, contrôles inconnus et nombre de critères', () => {
  const api = loadVerif();
  const grille = api.normalizeGrille({
    criteres: [
      { id: 'a', source: 'auto', check: 'html.doctype', libelle: 'D', points: 1 },
      { id: 'a', source: 'auto', check: 'html.title', libelle: 'Doublon', points: 1 },
      { id: 'b', source: 'auto', check: 'controle.inconnu', libelle: 'Inconnu', points: 5 },
      { id: 'c', source: 'attendu', libelle: 'Recherche', attendu: '  ', points: 2 },
      { id: 'd', source: 'manuel', libelle: '', points: -4 }
    ]
  });
  assert.deepEqual(Array.from(grille.criteres, item => item.libelle), ['D', 'Critère 5']);
  assert.equal(grille.criteres[1].points, 0);
  assert.deepEqual(Array.from(grille.technos), ['html']);
  const many = api.normalizeGrille({ criteres: Array.from({ length: 120 }, (value, index) => ({ id: `m${index}`, source: 'manuel', libelle: `C${index}`, points: 1 })) });
  assert.equal(many.criteres.length, api.MAX_CRITERES);
});

test('l’ajustement au barème atteint exactement la note maximale', () => {
  const api = loadVerif();
  const grille = api.buildGrille({ technos: ['html', 'css', 'js', 'php', 'sql'], points: {}, manuel: 'Soin | 3', attendus: 'Preuve | prepare( | 5' });
  for (const sur of [20, 10, 40]) {
    const scaled = api.scaleGrille(grille, sur);
    assert.equal(scaled.total, sur, `total attendu ${sur}`);
    assert.ok(scaled.criteres.every(item => item.points >= 0 && Math.round(item.points * 2) === item.points * 2), 'les demi-points restent la plus petite unité');
  }
  assert.equal(api.scaleGrille({ criteres: [] }, 20).criteres.length, 0);
});

test('le résultat local porte constats, limites et note sans jamais noter seul', () => {
  const api = loadVerif();
  const grille = grillePour(20);
  const result = api.localResult({ files: [html(MAQUETTE_HTML), css(MAQUETTE_CSS), js(MAQUETTE_JS)], grille, identifiant: 'Dupont', sur: 20 });
  assert.equal(result.mode, 'local');
  assert.equal(result.sur, 20);
  assert.ok(result.note > 0 && result.note <= 20);
  assert.equal(result.questions.length, grille.criteres.length);
  assert.equal(result.questions.reduce((sum, q) => sum + q.points_max, 0), 20);
  assert.equal(result.questions.reduce((sum, q) => sum + q.points_attribues, 0), result.note);
  assert.ok(result.questions.every(q => typeof q.justification === 'string' && q.justification.length > 0));
  assert.ok(result.questions.every(q => ['ok', 'absent', 'indetermine', 'manuel'].includes(q.statut)));
  assert.match(result.appreciation, /sans IA/);
  assert.ok(result.limites_analyse.some(item => /n’a pas été exécuté/.test(item)));
  assert.ok(result.limites_analyse.some(item => /après votre validation/.test(item)));
  assert.match(result.titre, /Dupont/);
});

test('le résultat local refuse une grille vide, incomplète ou un barème invalide', () => {
  const api = loadVerif();
  assert.throws(() => api.localResult({ files: [html(MAQUETTE_HTML)], grille: { criteres: [] }, sur: 20 }), /grille de correction est vide/);
  const grille = grillePour(20);
  assert.throws(() => api.localResult({ files: [html(MAQUETTE_HTML)], grille, sur: 10 }), /totalise 20 points .* sur 10/);
  assert.throws(() => api.localResult({ files: [html(MAQUETTE_HTML)], grille, sur: 0 }), /note maximale/);
});

test('la recherche d’un texte attendu ignore casse, accents et espaces', () => {
  const api = loadVerif();
  const grille = api.buildGrille({ technos: [], points: {}, attendus: 'Connexion préparée | REQUETE PREPAREE | 2\nFonction | maFonction ( | 1' });
  const outcomes = api.runGrille([php('// préparation\nfunction maFonction() {\n  $r = $pdo->prepare("SELECT 1");\n}\n// requête préparée utilisée')], grille);
  assert.equal(outcomes[0].statut, 'ok', 'la casse et les accents ne bloquent pas la recherche');
  assert.match(outcomes[0].preuve, /traitement\.php/);
  assert.equal(api.runGrille([php('rien')], grille).map(item => item.statut).join(','), 'absent,absent');
});

test('la vérification locale ne fait aucun appel réseau et n’exige ni clé ni fonction Supabase', () => {
  assert.doesNotMatch(verifSource, /fetch\s*\(|XMLHttpRequest|supabase|DEEPSEEK|Authorization/i);
  assert.doesNotMatch(agentSource.slice(agentSource.indexOf('function localCorrection'), agentSource.indexOf('function epreuvePanelHtml')), /fetch\s*\(|callAgent|verifyDeepSeekDeployment/);
  assert.match(indexHtml, /assets\/agent-verif\.js[\s\S]*assets\/agent-epreuve\.js[\s\S]*assets\/agent-sti\.js/);
  assert.match(workerSource, /\.\/assets\/agent-verif\.js/);
  const worker = workerSource.match(/const VERSION='sti-espace-(v[\w.-]+)';/)[1];
  const expected = indexHtml.match(/var ATTENDU = "(v[\w.-]+)";/)[1];
  const application = appSource.match(/APP_VER = "(v[\w.-]+)";/)[1];
  assert.equal(worker, expected);
  assert.equal(worker, application);
  assert.ok(Number(worker.match(/v1\.(\d+)/)[1]) >= 35, 'la vérification locale arrive en v1.35 ou plus');
});

/* --- Intégration à l'atelier d'épreuve ---------------------------------- */

// Double minimal d'IndexedDB : le relevé doit fonctionner sans navigateur.
function fakeIndexedDB() {
  const records = new Map();
  let created = false;
  const db = {
    createObjectStore() { return { createIndex() {} }; },
    close() {},
    transaction() {
      const tx = {
        pending: 0, aborted: false, completed: false, error: null,
        abort() { this.aborted = true; },
        request(fn) {
          const req = {};
          this.pending++;
          setImmediate(() => {
            try { req.result = fn(); req.onsuccess?.(); }
            catch (error) { this.error = error; this.abort(); }
            this.pending--;
            setImmediate(() => { if (!this.aborted && !this.completed && this.pending === 0) { this.completed = true; this.oncomplete?.(); } });
          });
          return req;
        },
        objectStore() {
          return {
            get: id => tx.request(() => records.get(id)),
            put: item => tx.request(() => { records.set(item.id, item); }),
            delete: id => tx.request(() => { records.delete(id); }),
            index: () => ({ getAll: owner => tx.request(() => [...records.values()].filter(item => item.owner === owner)) })
          };
        }
      };
      return tx;
    }
  };
  return { open() { const request = {}; setImmediate(() => { request.result = db; if (!created) { created = true; request.onupgradeneeded?.(); } request.onsuccess?.(); }); return request; } };
}
function loadAgent() {
  const listeners = {};
  const zone = { innerHTML: '' };
  let fetchCalls = 0;
  const window = {
    STI_DATA: { reference: { SCHOOL: { lycee: 'Lycée Rafèha' } } },
    STI_AGENT_LIBRARY: null,
    indexedDB: fakeIndexedDB(),
    activeProfessorProfile: () => ({ nom: 'Enseignant Test', prof_id: 'teacher-a', lycee: 'Lycée Rafèha' }),
    todayISO: () => '2026-11-02',
    confirm: () => true,
    fetch: () => { fetchCalls++; throw new Error('appel réseau interdit'); },
    toast() {}
  };
  const document = { addEventListener(type, handler) { listeners[type] = handler; }, getElementById() { return zone; }, querySelector() { return null; } };
  const sandbox = {
    window, document, localStorage: { getItem: () => null, setItem() {} },
    console, Date, Intl, Math, JSON, Array, String, Number, Object, Boolean, Promise, URL, Blob, AbortController, setTimeout, clearTimeout
  };
  vm.runInNewContext(verifSource, sandbox, { filename: 'agent-verif.js' });
  vm.runInNewContext(epreuveSource, sandbox, { filename: 'agent-epreuve.js' });
  vm.runInNewContext(agentSource, sandbox, { filename: 'agent-sti.js' });
  return { agent: window.STI_AGENT, window, zone, listeners, fetchCalls: () => fetchCalls };
}

test('l’atelier expose la grille locale et le bouton « sans IA »', () => {
  const { agent } = loadAgent();
  agent.render({ view: 'v-agent', sessions: { '3SI1': [] }, store: { seances: {} } });
  const markup = agent._test.epreuvePanelHtml({ identifiant: 'Dupont' });
  assert.match(markup, /Grille de correction locale · sans IA/);
  assert.match(markup, /data-verif-techno="html"/);
  assert.match(markup, /data-verif-points="html\.doctype"/);
  assert.match(markup, /data-verif-manuel/);
  assert.match(markup, /data-verif-attendu/);
  assert.match(markup, /Corriger cette copie sans IA/);
  assert.match(markup, /Ajuster au barème/);
  assert.match(markup, /Enregistrer la grille dans l’épreuve/);
});

test('la correction locale produit une proposition validable sans aucun appel réseau', () => {
  const { agent, fetchCalls } = loadAgent();
  agent.render({ view: 'v-agent', sessions: { '3SI1': [] }, store: { seances: {} } });
  agent._test.setVerif({ technos: ['html', 'css', 'js'], points: {}, manuel: 'Soin du rendu | 2', attendus: '' });
  agent._test.applyCopyToForm({
    identifiant: 'Dupont', sur: 20, type_devoir: 'pratique',
    pieces: [
      { name: 'index.html', language: 'html', content: MAQUETTE_HTML },
      { name: 'style.css', language: 'css', content: MAQUETTE_CSS },
      { name: 'app.js', language: 'js', content: MAQUETTE_JS }
    ]
  });
  agent._test.scaleVerifGrid();
  agent._test.localCorrection();
  const state = agent._test.epreuveState();
  assert.equal(state.epreuveId, '');
  const review = agent._test.getGradeReview();
  assert.ok(review, 'une relecture est préparée');
  assert.equal(review.confirmed, false, 'la note n’est jamais validée automatiquement');
  const markup = agent._test.renderers.correction(agent._test.currentGrille() && { questions: [], sur: 20 }, { identifiant: 'Dupont', classe: '3SI1', sur: 20, mode: 'local' });
  assert.match(markup, /VÉRIFICATION LOCALE · SANS IA/);
  assert.equal(fetchCalls(), 0, 'aucune requête réseau ne doit être lancée');
});

test('la copie corrigée localement est enregistrée dans le relevé avec son mode', async () => {
  const { agent, window } = loadAgent();
  const api = window.STI_AGENT_EPREUVE;
  agent.render({ view: 'v-agent', sessions: { '3SI1': [] }, store: { seances: {} } });
  agent._test.setVerif({ technos: ['html'], points: {}, manuel: 'Soin | 2', attendus: '' });
  agent._test.applyCopyToForm({ identifiant: 'Martin', sur: 20, type_devoir: 'pratique', pieces: [{ name: 'index.html', language: 'html', content: MAQUETTE_HTML }] });
  agent._test.scaleVerifGrid();
  agent._test.localCorrection();
  await agent._test.saveCurrentCopy();
  const saved = (await api.list('id:teacher-a'))[0];
  assert.ok(saved, 'le relevé doit être créé');
  assert.equal(saved.copies.length, 1);
  assert.equal(saved.copies[0].mode, 'local');
  assert.equal(saved.copies[0].statut, 'proposee');
  assert.ok(saved.copies[0].note_proposee > 0);
  assert.equal(api.releveRows(saved).some(row => row[0] === 'Martin'), true);
});
