const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const moduleSource = fs.readFileSync(path.join(root, 'assets/agent-epreuve.js'), 'utf8');
const agentSource = fs.readFileSync(path.join(root, 'assets/agent-sti.js'), 'utf8');
const edgeSource = fs.readFileSync(path.join(root, 'supabase/functions/assistant-ia/index.ts'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workerSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');

// Double minimal et asynchrone d'IndexedDB, sans dépendance externe.
function fakeIndexedDB() {
  const records = new Map();
  let created = false;
  const db = {
    createObjectStore() { return { createIndex() {} }; },
    close() {},
    transaction() {
      const tx = {
        pending: 0, aborted: false, completed: false, error: null,
        abort() { if (!this.aborted) { this.aborted = true; setImmediate(() => this.onabort?.()); } },
        request(fn) {
          const req = {};
          this.pending++;
          setImmediate(() => {
            if (!this.aborted) {
              try { req.result = fn(); req.onsuccess?.(); }
              catch (error) { this.error = error; this.abort(); }
            }
            this.pending--;
            setImmediate(() => {
              if (!this.aborted && !this.completed && this.pending === 0) { this.completed = true; this.oncomplete?.(); }
            });
          });
          return req;
        },
        objectStore() {
          return {
            get: id => tx.request(() => records.has(id) ? structuredClone(records.get(id)) : undefined),
            put: item => tx.request(() => { records.set(item.id, structuredClone(item)); }),
            delete: id => tx.request(() => { records.delete(id); }),
            index: () => ({ getAll: owner => tx.request(() => [...records.values()].filter(item => item.owner === owner).map(item => structuredClone(item))) })
          };
        }
      };
      return tx;
    }
  };
  return { open() { const request = {}; setImmediate(() => { request.result = db; if (!created) { created = true; request.onupgradeneeded?.(); } request.onsuccess?.(); }); return request; } };
}
function loadModule(indexedDB = fakeIndexedDB()) {
  const downloads = [];
  const window = {
    indexedDB,
    crypto: { randomUUID: (() => { let n = 0; return () => `id-${++n}`; })() },
    STI_AGENT_XLSX: { buildWorkbook: rows => { downloads.push({ type: 'xlsx', rows }); return new Uint8Array([80, 75]); } }
  };
  const document = {
    createElement: () => ({ click() {}, remove() {}, set href(value) { this._href = value; }, get href() { return this._href; }, set download(value) { this._name = value; }, get download() { return this._name; } }),
    body: { append() {} }
  };
  const sandbox = {
    window, document, console, Blob, URL: { createObjectURL: blob => { downloads.push({ type: 'blob', blob }); return 'blob:test'; }, revokeObjectURL() {} },
    Date, Math, String, Number, Object, Array, Set, Map, Promise, setTimeout
  };
  vm.runInNewContext(moduleSource, sandbox, { filename: 'agent-epreuve.js' });
  return { api: window.STI_AGENT_EPREUVE, downloads };
}
function file(name, relativePath, content = 'x', size = 10) {
  const object = { name, size, text: async () => content };
  if (relativePath) object.webkitRelativePath = relativePath;
  return object;
}
function result(questions = [{ question: 'Q1', points_max: 4, points_attribues: 3, justification: 'Fonctionnel' }], note = 3) {
  return {
    note, sur: 20, confiance: 'moyenne', questions,
    appreciation: 'Travail correct', remediation: ['Revoir les sélecteurs'], limites_analyse: ['Code non exécuté']
  };
}
const review = (points, total, confirmed = true) => ({ points, reasons: points.map(() => 'Ajustement'), total, confirmed });

test('import d’un dossier : un sous-dossier par élève, fichiers techniques d’abord', () => {
  const { api } = loadModule();
  const groups = api.groupFolderFiles([
    file('style.css', 'copies/Dupont/style.css'),
    file('index.html', 'copies/Dupont/index.html'),
    file('sujet.pdf', 'copies/Dupont/sujet.pdf'),
    file('app.js', 'copies/Martin/app.js'),
    file('index.html', 'copies/Martin/index.html'),
    file('bundle.js', 'copies/Martin/node_modules/lib/bundle.js'),
    file('readme.md', 'copies/Martin/readme.md')
  ]);
  assert.deepEqual(Array.from(groups, group => group.identifiant), ['Dupont', 'Martin']);
  assert.deepEqual(Array.from(groups[0].fichiers), ['index.html', 'style.css']);
  assert.deepEqual(Array.from(groups[1].fichiers), ['index.html', 'app.js']);
  assert.equal(groups[0].total, 2);
  assert.equal(api.groupFolderFiles([]).length, 0);
});

test('import d’un dossier : libellés identiques et racine sans sous-dossier restent exploitables', () => {
  const { api } = loadModule();
  const groups = api.groupFolderFiles([
    file('index.html', 'rendus/dupont/index.html'),
    file('index.html', 'autre/dupont/index.html'),
    file('main.js', 'main.js')
  ]);
  assert.deepEqual(Array.from(groups, group => group.identifiant).sort(), ['Copie sans dossier', 'dupont', 'dupont (2)'].sort());
});

test('lecture des fichiers : huit pièces maximum, binaires et fichiers trop lourds écartés', async () => {
  const { api } = loadModule();
  const files = [
    file('a.html', 'x/a.html', '<p>ok</p>'),
    file('b.css', 'x/b.css', 'p{}'),
    file('c.js', 'x/c.js', 'console.log(1)'),
    file('bin.js', 'x/bin.js', 'x\u0000y'),
    file('lourd.js', 'x/lourd.js', 'x', api.MAX_FILE_BYTES + 1),
    file('d.php', 'x/d.php', '<?php echo 1;'),
    file('e.sql', 'x/e.sql', 'SELECT 1;'),
    file('f.json', 'x/f.json', '{}'),
    file('g.txt', 'x/g.txt', 'note'),
    file('h.txt', 'x/h.txt', 'note')
  ];
  const { pieces, ignored } = await api.readCodeFiles(files, api.MAX_CODE_FILES);
  assert.equal(pieces.length, 6, 'les fichiers binaires ou trop lourds ne sont pas transmis');
  assert.deepEqual(Array.from(pieces, piece => piece.language), ['html', 'css', 'js', 'php', 'sql', 'json']);
  assert.ok(ignored.includes('bin.js'));
  assert.ok(ignored.includes('lourd.js'));
  assert.ok(ignored.includes('g.txt'), 'au-delà de huit pièces, les fichiers sont signalés');
  assert.ok(ignored.includes('h.txt'));
  assert.equal((await api.readCodeFiles([])).pieces.length, 0);
});

test('une copie passe de « en attente » à « proposée » puis « validée »', () => {
  const { api } = loadModule();
  let epreuve = { sur: 20, copies: [] };
  epreuve = api.upsertCopy(epreuve, api.copyRecord({ identifiant: 'Dupont', pieces: [{ name: 'index.html', language: 'html', content: '<p>x</p>' }], sur: 20 }));
  assert.equal(epreuve.copies[0].statut, 'en_attente');
  assert.equal(epreuve.copies[0].pieces.length, 1);
  assert.equal(api.copyTotal(epreuve.copies[0]), null);

  epreuve = api.upsertCopy(epreuve, api.copyRecord({ identifiant: 'dupont', result: result(), sur: 20 }));
  assert.equal(epreuve.copies.length, 1, 'le même élève ne doit pas compter deux fois');
  assert.equal(epreuve.copies[0].statut, 'proposee');
  assert.equal(epreuve.copies[0].note_proposee, 3);
  assert.equal(epreuve.copies[0].pieces.length, 0, 'les fichiers ne sont pas conservés après correction');
  assert.equal(api.copyTotal(epreuve.copies[0]), 3);

  epreuve = api.upsertCopy(epreuve, api.copyRecord({ identifiant: 'Dupont', result: result(), review: review(['3.5'], 3.5), sur: 20 }));
  assert.equal(epreuve.copies[0].statut, 'validee');
  assert.equal(epreuve.copies[0].note_retenue, 3.5);
  assert.equal(epreuve.copies[0].review.reasons[0], 'Ajustement');
  assert.equal(api.copyTotal(epreuve.copies[0]), 3.5);
  assert.equal(epreuve.copies[0].result.questions[0].points_retenus, 3.5);
});

test('le texte d’une copie théorique est conservé seulement avant correction', () => {
  const { api } = loadModule();
  const pending = api.copyRecord({ identifiant: 'Copie 1', texte: 'Réponse de l’élève', type_devoir: 'theorique' });
  assert.equal(pending.texte, 'Réponse de l’élève');
  assert.equal(pending.type_devoir, 'theorique');
  assert.equal(pending.statut, 'en_attente');
  const corrected = api.copyRecord({ identifiant: 'Copie 1', texte: 'Réponse de l’élève', type_devoir: 'theorique', result: result() });
  assert.equal(corrected.texte, '');
  assert.equal(corrected.type_devoir, 'theorique');
});

test('le relevé calcule moyenne et statuts, et retire une copie sans effet de bord', () => {
  const { api } = loadModule();
  let epreuve = { sur: 20, copies: [] };
  epreuve = api.upsertCopy(epreuve, api.copyRecord({ identifiant: 'A', result: result(undefined, 12), sur: 20 }));
  epreuve = api.upsertCopy(epreuve, api.copyRecord({ identifiant: 'B', result: result(undefined, 11), review: review(['14'], 14), sur: 20 }));
  epreuve = api.upsertCopy(epreuve, api.copyRecord({ identifiant: 'C', pieces: [{ name: 'index.html', language: 'html', content: '<p>x</p>' }], sur: 20 }));
  const summary = api.stats(epreuve);
  assert.equal(summary.total, 3);
  assert.equal(summary.enAttente, 1);
  assert.equal(summary.proposees, 1);
  assert.equal(summary.validees, 1);
  assert.equal(summary.moyenne, 13);
  assert.equal(summary.max, 14);
  const reduced = api.removeCopy(epreuve, epreuve.copies[0].id);
  assert.equal(reduced.copies.length, 2);
  assert.equal(epreuve.copies.length, 3, 'le relevé d’origine reste inchangé');
});

test('le relevé exporté rappelle l’absence de saisie et échappe les séparateurs CSV', () => {
  const { api } = loadModule();
  let epreuve = api.upsertCopy({ sur: 20, copies: [] }, api.copyRecord({
    identifiant: 'Dupont; "groupe 1"', result: result(), review: review(['4'], 4, true), sur: 20
  }));
  epreuve = { ...epreuve, nom: 'Épreuve pratique HTML', classe: '3SI1', sujet: 'Créer un formulaire' };
  const rows = api.releveRows(epreuve);
  assert.equal(rows[0][0], 'Épreuve');
  assert.ok(rows.some(row => row[0] === 'Statut' && /aucune saisie/i.test(row[1])));
  assert.ok(rows.some(row => row[0] === 'Dupont; "groupe 1"'));
  const text = api.csv(epreuve);
  assert.match(text, /"Dupont; ""groupe 1"""/);
  assert.match(text, /4,5|4/);
  assert.ok(text.split('\r\n').some(line => /Moyenne provisoire/.test(line)));
});

test('l’export Excel réutilise le classeur existant et les refus de validation sont explicites', async () => {
  const { api, downloads } = loadModule();
  let epreuve = api.upsertCopy({ sur: 20, copies: [] }, api.copyRecord({ identifiant: 'Dupont', result: result(), sur: 20 }));
  epreuve = { ...epreuve, nom: 'Épreuve pratique', classe: '3SI1' };
  api.downloadXlsx(epreuve);
  const excel = downloads.find(item => item.type === 'xlsx');
  assert.ok(excel, 'le classeur XLSX doit être construit');
  assert.ok(excel.rows.some(row => row[0] === 'Dupont'));
  assert.throws(() => api.normalizeEpreuve('', { nom: 'x', sur: 20 }), /profil professeur/);
  assert.throws(() => api.normalizeEpreuve('id:a', { nom: ' ', sur: 20 }), /nom de l’épreuve/);
  assert.throws(() => api.normalizeEpreuve('id:a', { nom: 'Épreuve', sur: 0 }), /note maximale/);
  const saved = await api.save('id:a', { nom: 'Épreuve 4SI2', classe: '4SI2', sur: 20, sujet: 'TP', bareme: 'Q1 : 4 pts', copies: epreuve.copies }, '');
  assert.equal(saved.classe, '4SI2');
  assert.equal((await api.list('id:a')).length, 1);
  assert.equal((await api.list('id:b')).length, 0);
  const updated = await api.save('id:a', { nom: 'Épreuve renommée', sur: 20, copies: saved.copies }, saved.id);
  assert.equal(updated.nom, 'Épreuve renommée');
  assert.equal(updated.sujet, 'TP', 'le sujet enregistré est conservé lors d’un simple renommage');
  await assert.rejects(api.save('id:b', { nom: 'x', sur: 20 }, saved.id), /introuvable/);
  await api.remove('id:a', saved.id);
  assert.equal((await api.list('id:a')).length, 0);
});

function loadAgent(withModule = true) {
  const listeners = {};
  const zone = { innerHTML: '' };
  const local = new Map();
  const context = { view: 'v-agent', sessions: { '3SI1': [] }, store: { seances: {} } };
  const window = {
    STI_DATA: { reference: { SCHOOL: { lycee: 'Lycée Rafèha' } } },
    activeProfessorProfile: () => ({ nom: 'Enseignant Test', prof_id: 'teacher-a', lycee: 'Lycée Rafèha' }),
    todayISO: () => '2026-11-02',
    confirm: () => true,
    toast() {}
  };
  if (withModule) window.STI_AGENT_EPREUVE = loadModule().api;
  const document = {
    addEventListener(type, handler) { listeners[type] = handler; },
    getElementById() { return zone; },
    querySelector() { return null; }
  };
  const sandbox = {
    window, document, localStorage: { getItem: k => local.get(k) || null, setItem: (k, v) => local.set(k, String(v)) },
    console, Date, Intl, Math, JSON, Array, String, Number, Object, Boolean, Promise, URL, Blob, AbortController, setTimeout, clearTimeout
  };
  vm.runInNewContext(agentSource, sandbox, { filename: 'agent-sti.js' });
  return { agent: window.STI_AGENT, window, zone, listeners };
}

test('l’atelier d’épreuve est intégré au formulaire de correction, sans nouvelle tâche serveur', () => {
  const { agent, zone } = loadAgent();
  agent.render({ view: 'v-agent', sessions: { '3SI1': [] }, store: { seances: {} } });
  const select = { dataset: { agentTool: 'correction' }, hasAttribute: () => false };
  // Change d'outil : le panneau apparaît dans la configuration de la correction.
  const correctionForm = agent._test.formFor('correction');
  assert.match(correctionForm, /ATELIER D’ÉPREUVE/);
  assert.match(correctionForm, /webkitdirectory/);
  assert.match(correctionForm, /agent-epreuve-save/);
  assert.doesNotMatch(correctionForm, /<script/i);
  void select; void zone;
  // Aucune tâche nouvelle côté serveur : la correction reste la tâche déployée.
  assert.doesNotMatch(edgeSource, /epreuve/i);
  const payload = agent._test.buildPayloadFor('correction');
  assert.equal('identifiant' in payload.input, false, 'l’identifiant anonyme reste dans le navigateur');
  assert.match(edgeSource, /const TASKS = new Set|TASKS = new Set/);
});

test('le panneau affiche les copies, leurs statuts et la moyenne provisoire', () => {
  const { agent } = loadAgent();
  const api = loadModule().api;
  let draft = api.upsertCopy({ sur: 20, copies: [] },
    api.copyRecord({ identifiant: 'Dupont <b>', result: result(undefined, 12), sur: 20 }));
  draft = api.upsertCopy(draft, api.copyRecord({ identifiant: 'Martin', result: result(undefined, 11), review: review(['14'], 14), sur: 20 }));
  const epreuve = api.normalizeEpreuve('id:a', { nom: 'Épreuve pratique', classe: '3SI1', sur: 20, copies: draft.copies });
  agent._test.setEpreuves([epreuve], epreuve.id);
  const markup = agent._test.epreuvePanelHtml({ identifiant: 'Dupont <b>' });
  assert.match(markup, /Dupont &lt;b&gt;/);
  assert.doesNotMatch(markup, /<b>/);
  assert.match(markup, /À valider/);
  assert.match(markup, /Note validée/);
  assert.match(markup, /Moyenne provisoire/);
  assert.match(markup, /Enregistrer cette correction dans le relevé/);
  assert.match(markup, /Relevé Excel/);
});

test('rouvrir une copie du relevé restaure la proposition et sa revalidation', () => {
  const { agent } = loadAgent();
  const api = loadModule().api;
  const draft = api.upsertCopy({ sur: 20, copies: [] },
    api.copyRecord({ identifiant: 'Dupont', result: result(), review: review(['2.5'], 2.5), sur: 20 }));
  const epreuve = api.normalizeEpreuve('id:a', { nom: 'Épreuve', classe: '3SI1', sur: 20, copies: draft.copies });
  agent._test.setEpreuves([epreuve], epreuve.id);
  agent._test.applyCopyToForm(epreuve.copies[0]);
  const state = agent._test.epreuveState();
  assert.equal(state.epreuveId, epreuve.id);
  const payload = agent._test.buildPayloadFor('correction');
  assert.equal('identifiant' in payload.input, false, 'l’identifiant reste local');
  assert.equal(payload.input.fichiers_code.length, 0);
  assert.match(agent._test.renderers.correction(agent._test.currentEpreuve().copies[0].result, { identifiant: 'Dupont', classe: '3SI1', sur: 20 }), /Note validée par l’enseignant : 2\.5 \/ 20/);
});

test('le module est publié avec la version de l’application et mis en cache', () => {
  assert.match(indexHtml, /assets\/agent-epreuve\.js[\s\S]*assets\/agent-sti\.js/);
  assert.match(workerSource, /\.\/assets\/agent-epreuve\.js/);
  assert.match(workerSource, /v1\.34\.12/);
  assert.match(indexHtml, /v1\.34\.12/);
  assert.match(appSource, /APP_VER = "v1\.34\.12"/);
});

test('parcours complet : dossier importé → file → copie rouverte → note validée → relevé', async () => {
  const { agent, window } = loadAgent();
  const api = window.STI_AGENT_EPREUVE;
  const teacher = 'id:teacher-a';
  agent.render({ view: 'v-agent', sessions: { '3SI1': [] }, store: { seances: {} } });
  agent._test.setEpreuves([], '');
  agent._test.selectEpreuve('');
  // Sujet, barème et note maximale saisis une seule fois pour l'épreuve.
  const correction = agent._test.formFor('correction');
  assert.match(correction, /ATELIER D’ÉPREUVE/);

  agent._test.importEpreuveFolder([
    file('index.html', 'rendus/Dupont/index.html', '<form></form>'),
    file('style.css', 'rendus/Dupont/style.css', 'form{}'),
    file('index.html', 'rendus/Martin/index.html', '<div></div>')
  ]);
  assert.equal(agent._test.epreuveState().dossierGroups.length, 2);

  await agent._test.queueDossierCopies();
  const saved = (await api.list(teacher))[0];
  assert.ok(saved, 'le relevé doit être créé');
  assert.equal(saved.copies.length, 2);
  assert.ok(saved.copies.every(copy => copy.statut === 'en_attente' && copy.pieces.length >= 1));

  // L'enseignant ouvre la copie de Dupont : les fichiers conservés sont chargés.
  const dupont = saved.copies.find(copy => copy.identifiant === 'Dupont');
  await agent._test.openEpreuveCopy(dupont.id);
  const payload = agent._test.buildPayloadFor('correction');
  assert.equal(payload.input.fichiers_code.length, 2);
  assert.equal(payload.input.fichiers_code[0].name, 'index.html');
  assert.equal('identifiant' in payload.input, false);

  // Réponse simulée de l'agent, relue puis validée par l'enseignant.
  const graded = { note: 12, sur: 20, questions: [{ question: 'Formulaire', points_max: 8, points_attribues: 6, justification: 'Champs présents' }], appreciation: 'Correct', remediation: [], limites_analyse: ['Code non exécuté'] };
  agent._test.setResult('correction', graded, { classe: '3SI1', identifiant: 'Dupont', type_devoir: 'pratique', sur: 20 });
  agent._test.setGradeReview({ points: ['7'], reasons: ['Barème revu'], total: 7, confirmed: true });
  await agent._test.saveCurrentCopy();

  const after = (await api.list(teacher))[0];
  const validated = after.copies.find(copy => copy.identifiant === 'Dupont');
  assert.equal(validated.statut, 'validee');
  assert.equal(validated.note_retenue, 7);
  assert.equal(validated.pieces.length, 0, 'les fichiers sont oubliés après correction');
  assert.equal(after.copies.filter(copy => copy.identifiant === 'Dupont').length, 1);
  assert.equal(after.copies.find(copy => copy.identifiant === 'Martin').statut, 'en_attente');

  // Le relevé exporté contient la note validée et l'avertissement de non-saisie.
  const rows = api.releveRows(after);
  assert.ok(rows.some(row => row[0] === 'Dupont' && row[4] === 7));
  assert.ok(rows.some(row => row[0] === 'Rappel' && /registre des élèves/.test(row[1])));
  // Une copie rouverte garde sa note validée et reste distincte des autres.
  await agent._test.openEpreuveCopy(validated.id);
  assert.equal(agent._test.getGradeReview().confirmed, true);
  assert.equal(agent._test.getGradeReview().total, 7);
  assert.equal(agent._test.buildPayloadFor('correction').input.type_devoir, 'pratique');
});
