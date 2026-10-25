const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const agentSource = fs.readFileSync(path.join(root, 'assets/agent-sti.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workerSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const flowImage = fs.readFileSync(path.join(root, 'assets/agent-vie-scolaire-flux.svg'), 'utf8');

function loadAgent(options = {}) {
  const listeners = {};
  const zone = { innerHTML: '' };
  const local = new Map();
  if (options.history) local.set('sti_agent_history_v1', JSON.stringify(options.history));
  const document = {
    addEventListener(type, handler) { listeners[type] = handler; },
    getElementById(id) { return id === 'v-agent' ? zone : null; },
    querySelector() { return null; }
  };
  const window = {
    STI_DATA: options.data || { reference: { SCHOOL: { lycee: 'Lycée de démonstration' } } },
    activeProfessorProfile: () => options.profile === undefined ? { nom: 'Ada Lovelace' } : options.profile,
    todayISO: () => '2026-10-25',
    confirm: () => true
  };
  const sandbox = {
    window,
    document,
    localStorage: {
      getItem(key) { return local.has(key) ? local.get(key) : null; },
      setItem(key, value) { local.set(key, String(value)); }
    },
    console, Date, Intl, Math, JSON, Array, String, Number, Object, Boolean,
    Promise, URL, Blob, AbortController, setTimeout, clearTimeout
  };
  vm.runInNewContext(agentSource, sandbox, { filename: 'agent-sti.js' });
  return { agent: window.STI_AGENT, listeners, zone, local, setProfile(profile) { options.profile = profile; } };
}

test('tous les documents de l’agent portent le lycée, le nom complet de l’enseignant et la classe', () => {
  const { agent } = loadAgent({ profile: { nom: 'Ada Lovelace', lycee: 'Lycée de Carthage' } });
  const meta = { classe: '4SI2', date: '2026-11-02', numero: 4, titre: 'Séance de test', trimestre: 1, identifiant: 'Copie 7', type_devoir: 'théorique' };
  const samples = {
    fiche: { titre: 'Fiche', objectifs: [], prerequis: [], deroulement: [], notions: [], competences: [], supports: [] },
    exercices: { titre: 'Exercices', exercices: [] },
    cahier: { titre: 'Séance de test', contenu: 'Contenu réellement déclaré' },
    repartition: { titre: 'Répartition', seances: [] },
    correction: { note: 12, sur: 20, questions: [] }
  };
  for (const [kind, result] of Object.entries(samples)) {
    const markup = agent._test.renderers[kind](result, meta);
    assert.match(markup, /Lycée de Carthage/);
    assert.match(markup, /Ada Lovelace/);
    assert.match(markup, /4SI2/);
    assert.match(markup, /Lycée[\s\S]*Enseignant[\s\S]*Classe/);
  }
});

test('l’identité destinée à l’en-tête est ajoutée côté navigateur, sans être transmise dans la demande Gemini', () => {
  const { agent } = loadAgent({ profile: { nom: 'Ada Lovelace', lycee: 'Lycée de Carthage' } });
  const identity = agent._test.documentIdentity({ classe: '3SI1' });
  assert.deepEqual(JSON.parse(JSON.stringify(identity)), {
    school: 'Lycée de Carthage', teacher: 'Ada Lovelace', classe: '3SI1'
  });
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayload()));
  const serialized = JSON.stringify(payload);
  assert.doesNotMatch(serialized, /Ada Lovelace|Lycée de Carthage/);
  assert.match(serialized, /3SI1/);
  const editableRubric = agent._test.rubricToText({ type_devoir: 'théorique', total: 20, criteres: [] });
  assert.doesNotMatch(editableRubric, /Ada Lovelace|Lycée de Carthage/);
});

test('une fiche déjà présente peut être révisée en transmettant son ancien contenu comme référence', () => {
  const { agent, listeners, zone } = loadAgent({
    profile: { nom: 'Ada Lovelace' },
    data: { reference: { SCHOOL: { lycee: 'Lycée de démonstration' } }, livresSTI: { '3SI1': { items: [] } }, competences: { '3SI1': [] } }
  });
  const session = { cls: '3SI1', n: 1, iso: '2026-10-26', tri: 1, blk: { t: 'Séance test', d: 'Programmation' } };
  agent.render({ sessions: { '3SI1': [session] }, store: { seances: { '3SI1|1': { preparation: 'Ancienne fiche à remplacer' } } } });
  assert.match(zone.innerHTML, /Préparer une nouvelle version de la fiche existante/);
  const checkbox = {
    type: 'checkbox', checked: true, dataset: { agentField: 'remplacer' },
    closest(selector) { return selector === '[data-agent-field]' ? this : null; }
  };
  listeners.input({ target: checkbox });
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayloadFor('fiche')));
  assert.equal(payload.input.mode_document, 'remplacement');
  assert.equal(payload.input.document_a_remplacer, 'Ancienne fiche à remplacer');
});

test('une entrée existante du cahier est transmise en mode remplacement sans altérer le statut de la séance', () => {
  const { agent, listeners, zone } = loadAgent({ profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada' } });
  const session = { cls: '3SI1', n: 2, iso: '2026-10-20', tri: 1, blk: { t: 'Événements JavaScript', d: 'Programmation' } };
  agent.render({ sessions: { '3SI1': [session] }, store: { seances: { '3SI1|2': { contenu: 'Ancienne entrée du cahier', devoirs: 'Finir exercice 2', obs: 'Revoir les événements', done: true } } } });
  const toolButton = { dataset: { agentTool: 'cahier' }, hasAttribute() { return false; } };
  listeners.click({ target: { closest() { return toolButton; } } });
  assert.match(zone.innerHTML, /Préparer une nouvelle version de l’entrée existante/);
  const checkbox = { type: 'checkbox', checked: true, dataset: { agentField: 'remplacer' }, closest(selector) { return selector === '[data-agent-field]' ? this : null; } };
  listeners.input({ target: checkbox });
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayloadFor('cahier')));
  assert.equal(payload.input.mode_document, 'remplacement');
  assert.deepEqual(payload.input.document_a_remplacer, {
    contenu: 'Ancienne entrée du cahier', travail_maison: 'Finir exercice 2', observations: 'Revoir les événements'
  });
  assert.equal(payload.input.seance.statut, 'assurée');
  assert.match(agentSource, /Les autres séances et les statuts assurée\/reportée resteront inchangés/);
});

test('une série de l’historique de la même classe peut servir de source à un remplacement explicite', () => {
  const previous = { titre: 'Série précédente', exercices: [{ enonce: 'Question ancienne', correction: 'Réponse ancienne' }] };
  const { agent, listeners } = loadAgent({
    profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada' },
    history: [{ id: 'exercise-1', owner_key: 'id:teacher-ada', task: 'exercices', classe: '3SI1', created: '2026-10-20T12:00:00.000Z', title: 'Série précédente', result: previous, meta: { classe: '3SI1' } }]
  });
  const toolButton = { dataset: { agentTool: 'exercices' }, hasAttribute() { return false; } };
  listeners.click({ target: { closest() { return toolButton; } } });
  const form = agent._test.formFor('exercices');
  assert.match(form, /Série de l’historique à remplacer/);
  assert.match(form, /exercise-1/);
  const choice = {
    tagName: 'SELECT', value: 'exercise-1', dataset: { agentField: 'remplacement_id' },
    matches() { return false; },
    closest(selector) { return selector === '[data-agent-field]' ? this : null; }
  };
  listeners.change({ target: choice });
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayload()));
  assert.equal(payload.input.mode_document, 'remplacement');
  assert.equal(payload.input.document_a_remplacer.titre, 'Série précédente');
  assert.equal(payload.input.document_a_remplacer.resultat.exercices[0].enonce, 'Question ancienne');
  assert.match(agentSource, /Remplacer la série sélectionnée/);
  assert.match(agentSource, /historique local de cet appareil/);
});

test('l’historique de l’agent ne montre que les documents du professeur connecté', () => {
  const entry = (id, owner_key, title) => ({ id, owner_key, task: 'exercices', classe: '3SI1', created: '2026-10-20T12:00:00.000Z', title, result: { titre: title, exercices: [] }, meta: { classe: '3SI1' } });
  const { agent, listeners, zone, local, setProfile } = loadAgent({
    profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada' },
    history: [entry('ada', 'id:teacher-ada', 'Série privée Ada'), entry('samir', 'id:teacher-samir', 'Série privée Samir'), { ...entry('legacy', '', 'Ancienne série sans compte'), owner_key: undefined }]
  });
  const context = { sessions: { '3SI1': [] }, store: { seances: {} } };
  agent.render(context);
  assert.deepEqual(Array.from(agent._test.currentHistory(), item => item.id), ['ada']);
  assert.match(zone.innerHTML, /Série privée Ada/);
  assert.doesNotMatch(zone.innerHTML, /Série privée Samir|Ancienne série sans compte/);

  const historyButton = { dataset: { agentHistory: 'ada' }, hasAttribute() { return false; } };
  listeners.click({ target: { closest() { return historyButton; } } });
  assert.match(zone.innerHTML, /Série privée Ada/);
  setProfile({ nom: 'Samir', prof_id: 'teacher-samir' });
  agent.render(context);
  assert.deepEqual(Array.from(agent._test.currentHistory(), item => item.id), ['samir']);
  assert.doesNotMatch(zone.innerHTML, /Série privée Ada|Ancienne série sans compte/);
  assert.match(zone.innerHTML, /Série privée Samir/);

  const newSamir = entry('new-samir', 'id:teacher-samir', 'Nouvelle série de Samir');
  agent._test.saveCurrentHistory([newSamir, ...agent._test.currentHistory()]);
  const persisted = JSON.parse(local.get('sti_agent_history_v1'));
  assert.ok(persisted.some(item => item.id === 'ada'));
  assert.ok(persisted.some(item => item.id === 'legacy'));
  assert.ok(persisted.some(item => item.id === 'new-samir'));
  assert.ok(persisted.some(item => item.id === 'samir'));
});

test('l’agent s’ouvre dans une grande boîte et le schéma du parcours est livré comme image hors ligne', () => {
  assert.match(indexSource, /<dialog id="agent-dialog" class="agent-dialog"/);
  assert.match(indexSource, /<section id="v-agent" class="view ref-ui"><\/section>/);
  assert.match(agentSource, /agent-vie-scolaire-flux\.svg/);
  assert.match(workerSource, /\.\/assets\/agent-vie-scolaire-flux\.svg/);
  assert.match(flowImage, /<svg[\s\S]*<title id="title">Parcours de l’Agent Vie Scolaire AI<\/title>/);
  assert.match(flowImage, /Lycée · Enseignant/);
  assert.match(flowImage, /Bearer token/);
  assert.match(appSource, /dialog\.showModal\(\)/);
  assert.match(appSource, /t:"Agent Vie Scolaire AI"/);
});

test('le formulaire et les documents utilisent la nouvelle identité de l’agent', () => {
  assert.match(agentSource, /<h1>Agent Vie Scolaire <em>AI<\/em><\/h1>/);
  assert.match(indexSource, /Agent Vie Scolaire AI/);
  assert.doesNotMatch(agentSource, /Agent STI/i);
});
