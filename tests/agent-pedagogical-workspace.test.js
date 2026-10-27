const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const librarySource = fs.readFileSync(path.join(root, 'assets/agent-library.js'), 'utf8');
const agentSource = fs.readFileSync(path.join(root, 'assets/agent-sti.js'), 'utf8');
const xlsxSource = fs.readFileSync(path.join(root, 'assets/agent-xlsx.js'), 'utf8');
const edgeSource = fs.readFileSync(path.join(root, 'supabase/functions/assistant-ia/index.ts'), 'utf8');
const quality = import(path.join(root, 'supabase/functions/assistant-ia/quality.mjs'));

// Minimal asynchronous IndexedDB double exercises transactions without external dependencies.
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
function loadLibrary(indexedDB = fakeIndexedDB()) {
  const window = { indexedDB, crypto: { randomUUID: (() => { let n = 0; return () => `doc-${++n}`; })() } };
  const sandbox = { window, console, Date, Math, String, Object, Array, Set, Promise, Blob, URL, setTimeout };
  vm.runInNewContext(librarySource, sandbox, { filename: 'agent-library.js' });
  return window.STI_AGENT_LIBRARY;
}
function loadAgent() {
  const listeners = {};
  const zone = { innerHTML: '' };
  const local = new Map();
  const context = { sessions: { '3SI1': [
    { cls: '3SI1', n: 1, iso: '2026-09-21', tri: 1, blk: { t: 'Introduction', d: 'Web' } },
    { cls: '3SI1', n: 2, iso: '2026-11-02', tri: 1, blk: { t: 'Formulaires', d: 'Web' } },
    { cls: '3SI1', n: 3, iso: '2027-02-02', tri: 2, blk: { t: 'JavaScript', d: 'Web' } },
    { cls: '3SI1', n: 4, iso: '2027-05-02', tri: 3, blk: { t: 'SQL', d: 'BD' } }
  ] }, store: { seances: { '3SI1|1': { done: true, contenu: 'Passé' }, '3SI1|3': { done: true, contenu: 'Déjà assuré' } } } };
  let confirmed = true, saved = 0, tri = null;
  const window = {
    STI_DATA: { reference: { SCHOOL: { lycee: 'Lycée Rafèha' } } },
    STI_AGENT_LIBRARY: loadLibrary(),
    activeProfessorProfile: () => ({ nom: 'Enseignant Test', prof_id: 'teacher-a', lycee: 'Lycée Rafèha' }),
    todayISO: () => '2026-10-27', confirm: () => confirmed,
    save: () => { saved++; }, setRep() {}, setTri: value => { tri = value; }, go() {}, toast() {}
  };
  const document = {
    addEventListener(type, handler) { listeners[type] = handler; },
    getElementById(id) { return id === 'v-agent' ? zone : null; },
    querySelector() { return null; }
  };
  const sandbox = { window, document, localStorage: { getItem: k => local.get(k) || null, setItem: (k, v) => local.set(k, String(v)) }, console, Date, Intl, Math, JSON, Array, String, Number, Object, Boolean, Promise, URL, Blob, AbortController, setTimeout, clearTimeout };
  vm.runInNewContext(agentSource, sandbox, { filename: 'agent-sti.js' });
  const agent = window.STI_AGENT;
  agent.render(context);
  function chooseTool(id) {
    const button = { dataset: { agentTool: id }, hasAttribute() { return false; } };
    listeners.click({ target: { closest: () => button } });
  }
  function changeSelect(field, value) {
    const element = { id: '', dataset: { agentField: field }, tagName: 'SELECT', type: 'select-one', value,
      closest(selector) { return selector === '[data-agent-field]' ? this : null; }, matches() { return false; } };
    listeners.change({ target: element });
  }
  return { agent, window, sandbox, context, zone, listeners, local, chooseTool, changeSelect, setConfirmed: value => { confirmed = value; }, saved: () => saved, tri: () => tri };
}
function loadXlsx() {
  const window = {};
  vm.runInNewContext(xlsxSource, { window, TextEncoder, Uint8Array, Uint32Array, Array, String, Object, Number, Math, Set, Date, Blob, URL, setTimeout }, { filename: 'agent-xlsx.js' });
  return window.STI_AGENT_XLSX;
}
function zipEntries(bytes) {
  const b = Buffer.from(bytes), entries = {};
  let offset = 0;
  while (offset + 30 <= b.length && b.readUInt32LE(offset) === 0x04034b50) {
    const size = b.readUInt32LE(offset + 18), nameSize = b.readUInt16LE(offset + 26), extra = b.readUInt16LE(offset + 28);
    const name = b.subarray(offset + 30, offset + 30 + nameSize).toString('utf8');
    const start = offset + 30 + nameSize + extra;
    entries[name] = b.subarray(start, start + size).toString('utf8');
    offset = start + size;
  }
  return entries;
}
const input = { title: 'Programme STI', category: 'Programme', classe: '3SI1', source: 'Enseignant', publication: '2024', location: 'p. 4', tags: 'HTML', excerpt: 'Contrôler un formulaire.' };

test('bibliothèque : validation des métadonnées, des limites et échappement HTML', () => {
  const library = loadLibrary();
  assert.throws(() => library.normalize(input, ''), /profil professeur/);
  assert.throws(() => library.normalize({ ...input, title: ' ' }, 'id:a'), /titre/);
  assert.throws(() => library.normalize({ ...input, classe: 'autre' }, 'id:a'), /catégorie et une classe/);
  assert.throws(() => library.normalize({ ...input, excerpt: 'x'.repeat(6001) }, 'id:a'), /6 ?000|6000/);
  assert.throws(() => library.normalize(input, 'id:a', null, { name: 'script.exe', size: 10 }), /format/);
  assert.throws(() => library.normalize(input, 'id:a', null, { name: 'trop.pdf', size: 11 * 1024 * 1024 }), /10 Mo/);
  assert.throws(() => library.normalize(input, 'id:a', null, { name: 'vide.txt', size: 0 }), /Fichier vide/);
  const doc = library.normalize({ ...input, title: '<img src=x onerror=alert(1)>' }, 'id:a');
  const markup = library.picker([doc], [doc.id], '3SI1', 'id:a');
  assert.match(markup, /&lt;img/);
  assert.doesNotMatch(markup, /<img src/);
});

test('bibliothèque : ajout, lecture, modification et suppression isolés par profil', async () => {
  const library = loadLibrary();
  const file = new Blob(['fichier'], { type: 'application/pdf' });
  Object.defineProperty(file, 'name', { value: 'reference.pdf' });
  const added = await library.save('id:a', input, file);
  assert.equal((await library.list('id:a')).length, 1);
  assert.equal((await library.list('id:b')).length, 0);
  await assert.rejects(library.save('id:b', input, null, added.id), /introuvable/);
  await assert.rejects(library.remove('id:b', added.id), /introuvable/);
  const edited = await library.save('id:a', { ...input, title: 'Version revue' }, null, added.id);
  assert.equal(edited.title, 'Version revue');
  assert.equal(edited.fileName, 'reference.pdf');
  assert.equal(edited.file.size, file.size);
  await library.remove('id:a', added.id);
  assert.equal((await library.list('id:a')).length, 0);
});

test('seuls les extraits choisis, de la bonne classe et du bon profil, sont transmis', () => {
  const library = loadLibrary();
  const docs = [
    library.normalize(input, 'id:a'),
    library.normalize({ ...input, title: 'Autre compte' }, 'id:b'),
    library.normalize({ ...input, title: 'Autre classe', classe: '4SI2' }, 'id:a'),
    library.normalize({ ...input, title: 'Sans extrait', excerpt: '' }, 'id:a'),
    library.normalize({ ...input, title: 'Commun', classe: 'Toutes' }, 'id:a')
  ];
  const selected = library.references(docs, docs.map(x => x.id), '3SI1', 'id:a');
  assert.deepEqual(Array.from(selected, x => x.titre), ['Programme STI', 'Commun']);
  assert.equal(selected[0].page_ou_section, 'p. 4');
  assert.doesNotMatch(JSON.stringify(selected), /id:a|fileName|Autre compte|Autre classe/);
  assert.deepEqual(Array.from(library.references(docs, [], '3SI1', 'id:a')), []);
});

test('l’aperçu de la demande inclut les extraits choisis, jamais les fichiers ou profils', () => {
  const { agent, window } = loadAgent();
  const doc = window.STI_AGENT_LIBRARY.normalize(input, 'id:teacher-a');
  doc.file = new Blob(['contenu privé']); doc.fileName = 'secret.pdf';
  agent._test.setLibraryDocs([doc]);
  agent._test.setSelectedSources('fiche', [doc.id]);
  const request = agent._test.buildRequestSpec();
  assert.equal(request.payload.input.sources_fournies[0].extrait_fourni, input.excerpt);
  assert.equal(request.meta.sources[0].page_ou_section, 'p. 4');
  assert.doesNotMatch(JSON.stringify(request.payload), /secret\.pdf|teacher-a|Enseignant Test/);
  assert.match(agent._test.documentIdentityHtml(request.meta), /Programme STI.*p\. 4/);
  assert.match(agent._test.documentIdentityHtml(request.meta), /n’a pas été vérifiée automatiquement/);
});

test('l’archivage volontaire garde le corrigé du sujet sans créer d’extrait et exclut les copies corrigées', async () => {
  const { agent, window, sandbox, zone, setConfirmed } = loadAgent();
  sandbox.File = class extends Blob {
    constructor(parts, name, options) { super(parts, options); this.name = name; }
  };
  const printable = { innerHTML: '<h1>Sujet</h1><div class="agent-correction">Corrigé secret</div>', querySelectorAll: () => [] };
  sandbox.document.getElementById = id => id === 'v-agent' ? zone : id === 'agent-result' ? { cloneNode: () => printable } : null;
  agent._test.setResult('exercices', { titre: 'Sujet de STI', exercices: [] }, { classe: '3SI1' });
  setConfirmed(false); await agent._test.archiveResult();
  assert.equal((await window.STI_AGENT_LIBRARY.list('id:teacher-a')).length, 0);
  setConfirmed(true); await agent._test.archiveResult();
  const saved = await window.STI_AGENT_LIBRARY.list('id:teacher-a');
  assert.equal(saved.length, 1);
  assert.equal(saved[0].category, 'Sujet');
  assert.equal(saved[0].excerpt, '');
  assert.match(await saved[0].file.text(), /Corrigé secret/);
  assert.equal((await window.STI_AGENT_LIBRARY.list('id:teacher-b')).length, 0);
  agent._test.setResult('correction', { note: 10, sur: 20, questions: [] }, { classe: '3SI1' });
  await agent._test.archiveResult();
  assert.equal((await window.STI_AGENT_LIBRARY.list('id:teacher-a')).length, 1);
});

test('répartition annuelle : seules les séances futures, non assurées, non verrouillées et aux dates exactes sont appliquées', async () => {
  const { agent, context, zone, chooseTool, changeSelect, saved, tri } = loadAgent();
  context.store.verrous = { '3SI1|3': { par: 'Enseignant' } };
  chooseTool('repartition'); changeSelect('trimestre', '0');
  const request = agent._test.buildRequestSpec();
  assert.equal(request.payload.input.periode, 'annuelle');
  assert.deepEqual(Array.from(request.payload.input.seances, s => s.numero), [1, 2, 3, 4]);
  assert.deepEqual(Array.from(request.payload.input.seances, s => s.trimestre), [1, 1, 2, 3]);
  agent._test.setResult('repartition', { titre: 'Année', seances: [
    { numero: 1, date: '2026-09-21', titre: 'Ne pas modifier' },
    { numero: 2, date: '2026-11-02', titre: 'Nouvelle préparation', objectif: 'Formulaire' },
    { numero: 3, date: '2027-02-02', titre: 'Ne pas modifier' },
    { numero: 4, date: '2027-05-02', titre: 'Trimestre verrouillé, à ignorer' }
  ] }, request.meta);
  await agent._test.applyResult();
  assert.equal(context.store.seances['3SI1|1'].contenu, 'Passé');
  assert.equal(context.store.seances['3SI1|2'].title, 'Nouvelle préparation');
  assert.equal(context.store.seances['3SI1|3'].contenu, 'Déjà assuré');
  assert.equal(context.store.seances['3SI1|4'], undefined);
  assert.equal(saved(), 1); assert.equal(tri(), 1);
  delete context.store.verrous['3SI1|3'];
  agent._test.setResult('repartition', { titre: 'Année', seances: [{ numero: 4, date: '2027-05-03', titre: 'Date incorrecte' }] }, request.meta);
  await agent._test.applyResult();
  assert.equal(context.store.seances['3SI1|4'], undefined);
  assert.equal(saved(), 1);
  context.store.verrous['3SI1|3'] = { par: 'Enseignant' };
  agent._test.setResult('fiche', { titre: 'Fiche', objectifs: [] }, { classe: '3SI1', session: '3SI1|4' });
  await agent._test.applyResult();
  assert.match(zone.innerHTML, /trimestre est verrouillé/);
});


test('le client bloque une fonction distante ancienne avant toute génération', async () => {
  const { agent, window, sandbox } = loadAgent();
  window.cloudReady = () => true;
  window.authToken = async () => 'token';
  window.cloudCfg = () => ({ url: 'https://edge.invalid', key: 'anon' });
  let protocol;
  const calls = [];
  sandbox.fetch = async (_url, options) => {
    calls.push(JSON.parse(options.body).task);
    return { ok: true, json: async () => ({ provider: 'DeepSeek', configured: true, model: 'test', protocol }) };
  };
  await assert.rejects(agent._test.verifyDeepSeekDeployment(), /version attendue/);
  assert.deepEqual(calls, ['status']);
  protocol = 'sti-pedagogique-2026-10-27';
  assert.equal((await agent._test.verifyDeepSeekDeployment()).protocol, protocol);
  assert.deepEqual(calls, ['status', 'status']);
});

test('le devoir de synthèse est proposé et transmis au générateur', () => {
  const { agent, zone, chooseTool, changeSelect } = loadAgent();
  chooseTool('exercices');
  assert.match(zone.innerHTML, /Devoir de synthèse/);
  changeSelect('format', 'Devoir de synthèse');
  assert.equal(agent._test.buildRequestSpec().payload.input.format, 'Devoir de synthèse');
});

test('la durée de fiche est réglable et contrôlée sur le serveur', async () => {
  const { requestConsistencyError } = await quality;
  const phase = n => ({ phase: `P${n}`, duree: '15 min', activite_enseignant: 'Guide', activite_eleve: 'Réalise', trace: 'Production' });
  const fiche = { deroulement: [1, 2, 3, 4].map(phase) };
  assert.equal(requestConsistencyError('fiche', fiche, { input: { duree_minutes: 60 } }), '');
  assert.match(requestConsistencyError('fiche', fiche, { input: { duree_minutes: 120 } }), /au lieu d’environ 120/);
  assert.match(requestConsistencyError('fiche', fiche, { input: { duree_minutes: 5 } }), /15 et 300/);
  const { agent } = loadAgent();
  assert.match(agent._test.formFor('fiche'), /Durée de la séance \(minutes\)/);
  assert.equal(agent._test.buildPayloadFor('fiche').input.duree_minutes, 120);
});

test('l’ajustement et la validation finale de la note exigent un barème cohérent, une justification et une confirmation', () => {
  const { agent, local, setConfirmed, saved } = loadAgent();
  const result = { note: 12, sur: 20, questions: [
    { question: 'Q1', points_attribues: 5, points_max: 8, justification: 'Partiel' },
    { question: 'Q2', points_attribues: 7, points_max: 12, justification: 'Partiel' }
  ] };
  agent._test.setResult('correction', result, { classe: '3SI1', identifiant: 'Copie 1', sur: 20 });
  const review = agent._test.getGradeReview();
  review.points[0] = '9';
  assert.match(agent._test.calculateGradeReview(result, review).error, /compris entre 0 et son maximum/);
  review.points[0] = '6';
  assert.match(agent._test.calculateGradeReview(result, review).error, /Justifiez/);
  review.reasons[0] = 'Démarche reconnue après relecture';
  assert.equal(agent._test.calculateGradeReview(result, review).total, 13);
  setConfirmed(false); agent._test.validateGrade();
  assert.equal(agent._test.getGradeReview().confirmed, false);
  setConfirmed(true); agent._test.validateGrade();
  assert.equal(agent._test.getGradeReview().confirmed, true);
  assert.equal(agent._test.getGradeReview().total, 13);
  assert.equal(result.note, 12, 'La proposition de l’agent reste inchangée.');
  assert.equal(saved(), 0, 'Aucune note n’est saisie dans le registre.');
  assert.equal(local.size, 0, 'La correction ne va pas dans l’historique local.');
  assert.match(agent._test.renderers.correction(result, { classe: '3SI1', identifiant: 'Copie 1', sur: 20 }), /Note validée par l’enseignant : 13 \/ 20/);
});

test('les affirmations de conformité non vérifiées sont filtrées sans rejeter un avertissement', async () => {
  const { containsUnsupportedComplianceClaim, requestConsistencyError } = await quality;
  const { agent } = loadAgent();
  for (const phrase of ['Cette fiche est conforme au programme officiel.', 'Le devoir respecte le programme officiel tunisien.', 'Conformité au programme officiel garantie.']) {
    assert.equal(containsUnsupportedComplianceClaim({ titre: phrase }), true, phrase);
    assert.equal(agent._test.containsUnsupportedComplianceClaim({ titre: phrase }), true, phrase);
    assert.match(requestConsistencyError('exercices', { titre: phrase }, {}), /conformité officielle non vérifiée/);
  }
  for (const phrase of ['La conformité au programme officiel est à vérifier.', 'Cette fiche n’est pas conforme au programme officiel.', 'Vérifiez si la fiche est conforme au programme officiel.']) {
    assert.equal(containsUnsupportedComplianceClaim({ titre: phrase }), false, phrase);
    assert.equal(agent._test.containsUnsupportedComplianceClaim({ titre: phrase }), false, phrase);
  }
});

test('une copie pratique composée uniquement de code est acceptée sans prétendre l’exécuter', async () => {
  const { validCodeFiles, hasCorrectionEvidence } = await quality;
  const code = { name: 'main.js', language: 'js', content: 'console.log(1);' };
  assert.equal(hasCorrectionEvidence({ type_devoir: 'pratique', copie: '', fichiers_code: [code] }, []), true);
  assert.equal(hasCorrectionEvidence({ type_devoir: 'théorique', copie: '', fichiers_code: [code] }, []), false);
  assert.equal(hasCorrectionEvidence({ type_devoir: 'pratique', fichiers_code: [{ ...code, content: '' }] }, []), false);
  assert.equal(validCodeFiles([{ ...code, language: 'exe' }]).length, 0);
  assert.equal(validCodeFiles(Array(10).fill(code)).length, 8);
  assert.match(edgeSource, /hasCorrectionEvidence\(payload\?\.input, attachments\)/);
  assert.match(edgeSource, /ne déclare\s+jamais qu'un programme fonctionne/);
});

test('XLSX : véritable conteneur Open XML, texte non interprété comme formule, provenance et note validée', () => {
  const xlsx = loadXlsx();
  const result = { note: 12, sur: 20, questions: [{ question: '=1+1', points_attribues: 12, points_max: 20, justification: '<à vérifier>' }], limites_analyse: ['Non exécuté'] };
  const review = { confirmed: true, total: 13, points: [13], reasons: ['Après relecture'] };
  const meta = { classe: '3SI1', identifiant: 'Copie 1', sources: [{ titre: 'Source', page_ou_section: 'p. 2' }] };
  const rows = xlsx.rowsFor('correction', result, meta, review);
  const entries = zipEntries(xlsx.buildWorkbook(rows));
  assert.ok(entries['[Content_Types].xml']);
  assert.ok(entries['xl/workbook.xml']);
  const sheet = entries['xl/worksheets/sheet1.xml'];
  assert.match(sheet, /Source — p\. 2/);
  assert.match(sheet, /Note validée par l’enseignant/);
  assert.match(sheet, /<t xml:space="preserve">=1\+1<\/t>/);
  assert.match(sheet, /&lt;à vérifier&gt;/);
  assert.doesNotMatch(sheet, /<f(?:\s|>)/);
  assert.throws(() => xlsx.buildWorkbook([['x'.repeat(32768)]]), /32 767/);
});

test('l’export annuel retrouve les trimestres et la sortie élève retire les sections de corrigé', () => {
  const xlsx = loadXlsx();
  const rows = xlsx.rowsFor('repartition', { titre: 'Année', seances: [{ numero: 2, date: '2027-02-02', titre: 'JavaScript' }] }, { classe: '3SI1', trimestre: 0, seances: [{ numero: 2, date: '2027-02-02', trimestre: 2 }] });
  const session = Array.from(rows).find(row => row[0] === 2);
  assert.equal(session[2], 2);
  assert.match(agentSource, /studentOnly && tool === 'exercices'.*querySelectorAll\('\.agent-correction'\)/);
  assert.match(agentSource, /data-agent-print-student/);
});
