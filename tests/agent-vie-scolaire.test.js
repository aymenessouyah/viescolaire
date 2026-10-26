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
    confirm: () => options.confirm === undefined ? true : options.confirm
  };
  const sandbox = {
    window,
    document,
    localStorage: {
      getItem(key) { return local.has(key) ? local.get(key) : null; },
      setItem(key, value) { if (options.failWrites) throw new Error('Storage quota exceeded'); local.set(key, String(value)); }
    },
    console, Date, Intl, Math, JSON, Array, String, Number, Object, Boolean,
    Promise, URL, Blob, AbortController, setTimeout, clearTimeout
  };
  vm.runInNewContext(agentSource, sandbox, { filename: 'agent-sti.js' });
  return { agent: window.STI_AGENT, listeners, zone, local, setProfile(profile) { options.profile = profile; }, setConfirm(value) { options.confirm = value; } };
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

test('l’identité destinée à l’en-tête est ajoutée côté navigateur, sans être transmise dans la demande DeepSeek', () => {
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

test('le contexte de la fiche est réduit aux données de séance utiles et le profil reste absent de l’aperçu envoyé', () => {
  const data = {
    reference: { SCHOOL: { lycee: 'Lycée de démonstration' } },
    livresSTI: { '3SI1': { items: [{ id: 'html-form', label: 'Formulaires HTML', domain: 'HTML5', description: 'Contrôle de saisie' }] } },
    competences: { '3SI1': [{ code: 'D', t: 'Créer un site interactif', domaine: 'Web', sous: 'HTML5, JavaScript et formulaires', attendu: ['Contrôler un formulaire'] }] }
  };
  const { agent } = loadAgent({ profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada', lycee: 'Lycée de Carthage' }, data });
  const session = { cls: '3SI1', n: 5, iso: '2026-10-26', tri: 1, blk: { t: 'Formulaire HTML', d: 'HTML5', det: 'Contrôle de saisie' } };
  agent.render({ sessions: { '3SI1': [session] }, store: { seances: { '3SI1|5': {
    preparation: 'Fiche précédente confidentielle', contenu: 'Compte rendu déjà réalisé', devoirs: 'Exercice 2', obs: 'Observation de suivi', done: false, notions: ['html-form']
  } } } });
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayloadFor('fiche')));
  assert.deepEqual(Object.keys(payload.input.seance), ['classe', 'numero', 'date', 'trimestre', 'titre', 'reference']);
  assert.equal(payload.input.notions_selectionnees[0].id, 'html-form');
  assert.equal(Object.hasOwn(payload.input.seance, 'notions'), false);
  assert.equal(payload.input.document_a_remplacer, '');
  assert.doesNotMatch(JSON.stringify(payload), /Fiche précédente confidentielle|Compte rendu déjà réalisé|Exercice 2|Observation de suivi|Ada Lovelace|Lycée de Carthage/);
  const preview = agent._test.contextReviewHtml();
  assert.match(preview, /Afficher les champs exacts de la demande/);
  assert.match(preview, /Le nom du professeur et le lycée de son profil ne sont pas ajoutés/);
  assert.doesNotMatch(preview, /Ada Lovelace|Lycée de Carthage|Fiche précédente confidentielle/);
  const noImageNotice = agent._test.contextDisclosureText({ attachments: [] });
  const imageNotice = agent._test.contextDisclosureText({ attachments: [{ name: 'copie.jpg' }] });
  assert.match(noImageNotice, /Aucune image n’est jointe/);
  assert.match(imageNotice, /1 image\(s\) seront transmises séparément/);
  assert.doesNotMatch(imageNotice, /copie\.jpg/);
});

test('les compétences automatiques sont limitées aux correspondances lexicales du sujet', () => {
  const { agent } = loadAgent({ data: {
    competences: { '3SI1': [
      { code: 'D', t: 'Créer un site interactif', domaine: 'Web', sous: 'HTML5, JavaScript et formulaires', attendu: ['Contrôler un formulaire'] },
      { code: 'B', t: 'Exploiter un système d’exploitation', domaine: 'Systèmes', sous: 'Installation et sécurité', attendu: ['Configurer un système'] }
    ] }
  } });
  const related = Array.from(agent._test.relatedCompetences('JavaScript et formulaire HTML5'));
  assert.equal(related.length, 1);
  assert.equal(related[0].code, 'D');
  assert.deepEqual(Array.from(agent._test.relatedCompetences('poésie et géométrie')), []);
});

test('l’aperçu signale les suggestions lexicales sans masquer les sélections manuelles', () => {
  const { agent } = loadAgent();
  const ficheWarnings = Array.from(agent._test.contextWarnings({
    task: 'fiche', payload: { context: {}, input: {
      objectif_prioritaire: 'Valider un formulaire HTML', notions_selectionnees: [{ notion: 'Formulaires HTML' }],
      competences: [{ competence: 'Créer un site interactif' }]
    } }, attachments: []
  }));
  assert.match(ficheWarnings.join(' '), /1 compétence\(s\) sont suggérées automatiquement/);
  assert.doesNotMatch(ficheWarnings.join(' '), /Aucune notion ou compétence n’a été ciblée/);
  const exerciseWarnings = Array.from(agent._test.contextWarnings({
    task: 'exercices', payload: { context: {}, input: {
      notions_du_referentiel: [{ notion: 'Formulaires HTML' }], competences: [{ competence: 'Créer un site interactif' }]
    } }, attachments: []
  }));
  assert.match(exerciseWarnings.join(' '), /1 notion\(s\) du référentiel sont suggérées par correspondance lexicale/);
  assert.match(exerciseWarnings.join(' '), /1 compétence\(s\) sont suggérées automatiquement/);
});

test('l’aperçu signale les classes ou statuts contradictoires et les données nominatives possibles', () => {
  const { agent } = loadAgent();
  const warnings = Array.from(agent._test.contextWarnings({
    task: 'repartition',
    payload: { context: { classe: '3SI1' }, input: { seances: [
      { classe: '4SI2', numero: 8, statut: 'assurée', contenu_reellement_declare: '' },
      { classe: '3SI1', numero: 9, statut: 'reportée', contenu_reellement_declare: 'Un cours a pourtant été déclaré.' }
    ] } },
    attachments: []
  }));
  assert.equal(warnings.length, 3);
  assert.match(warnings.join(' '), /ne correspond pas/);
  assert.match(warnings.join(' '), /sans compte rendu réel/);
  assert.match(warnings.join(' '), /marquée « reportée »/);
  assert.equal(agent._test.containsPossiblePersonalIdentifier({ copie: 'Courriel : eleve@example.tn, CIN : 12345678' }), true);
  assert.equal(agent._test.containsPossiblePersonalIdentifier({ sujet: 'Créer une page HTML valide.' }), false);
});

test('l’identifiant local de copie et les métadonnées de profil ne sont pas envoyés dans la demande de correction', () => {
  const { agent } = loadAgent({ profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada', lycee: 'Lycée de Carthage' } });
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayloadFor('correction')));
  assert.equal(Object.hasOwn(payload.input, 'identifiant'), false);
  assert.doesNotMatch(JSON.stringify(payload), /Ada Lovelace|teacher-ada|Lycée de Carthage|Copie 1/);
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

test('le document libre expose titre, type, texte source et consignes dans le formulaire et le payload, sans envoyer d’identifiant local', () => {
  const { agent, listeners, zone } = loadAgent({ profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada' } });
  agent.render({ sessions: { '3SI1': [] }, store: { seances: {} } });
  const toolButton = { dataset: { agentTool: 'document' }, hasAttribute() { return false; } };
  listeners.click({ target: { closest() { return toolButton; } } });
  assert.match(zone.innerHTML, /Autres documents/);
  assert.match(zone.innerHTML, /agent-document-file/);
  assert.match(zone.innerHTML, /TXT, Markdown ou HTML/);
  assert.match(zone.innerHTML, /PDF ou Word, copiez le texte/);

  const input = (name, value, type = 'text') => ({
    type, value, dataset: { agentField: name },
    closest(selector) { return selector === '[data-agent-field]' ? this : null; }
  });
  for (const [name, value, type] of [
    ['titre', 'Note aux parents', 'text'],
    ['type_document', 'Note aux parents', 'select-one'],
    ['document_existant', 'La réunion aura lieu le 12 mai.', 'textarea'],
    ['consignes', 'Clarifier la date et corriger la langue.', 'textarea']
  ]) listeners.input({ target: input(name, value, type) });

  const payload = JSON.parse(JSON.stringify(agent._test.buildPayload()));
  assert.deepEqual(payload.input, {
    titre: 'Note aux parents', type_document: 'Note aux parents', mode_document: 'remplacement',
    document_a_remplacer: 'La réunion aura lieu le 12 mai.', consignes: 'Clarifier la date et corriger la langue.'
  });
  assert.equal(Object.hasOwn(payload.context, 'document_replacement_id'), false);
  assert.equal(agent._test.validate(), '');
});

test('l’import lit uniquement les fichiers texte admis et ne tente pas d’extraire un PDF', async () => {
  const { agent, listeners, zone } = loadAgent({ profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada' } });
  agent.render({ sessions: { '3SI1': [] }, store: { seances: {} } });
  const toolButton = { dataset: { agentTool: 'document' }, hasAttribute() { return false; } };
  listeners.click({ target: { closest() { return toolButton; } } });

  await agent._test.readDocumentFile([{ name: 'note.html', size: 32, text: async () => '<p>Réunion le 12 mai.</p>' }]);
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayload()));
  assert.equal(payload.input.document_a_remplacer, '<p>Réunion le 12 mai.</p>');
  assert.equal(payload.input.titre, 'note');
  assert.match(zone.innerHTML, /note\.html/);
  assert.match(zone.innerHTML, /fichier reste inchangé/);

  await agent._test.readDocumentFile([{ name: 'note.pdf', size: 32, text: async () => 'texte qui ne doit pas être extrait' }]);
  assert.match(zone.innerHTML, /Importez uniquement un fichier TXT, Markdown ou HTML/);
  const unchanged = JSON.parse(JSON.stringify(agent._test.buildPayload()));
  assert.equal(unchanged.input.document_a_remplacer, '<p>Réunion le 12 mai.</p>');
});

test('les versions d’un document libre sont gardées localement et la version antérieure reste restaurable', () => {
  const { agent, local } = loadAgent({ profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada' } });
  agent.render({ sessions: { '3SI1': [] }, store: { seances: {} } });
  const owner = agent._test.activeTeacherKey();
  const meta = { classe: '3SI1', titre: 'Note', type_document: 'Note aux parents', document_source_content: 'Réunion le 12 mai.', document_saved: false };
  const firstResult = { titre: 'Note aux parents', type_document: 'Note aux parents', contenu: 'La réunion aura lieu le 12 mai.', changements: ['Correction de la langue.'], points_a_verifier: [] };
  const first = agent._test.newDocumentHistoryEntry(owner, meta, firstResult, 'Réunion le 12 mai.');
  assert.equal(first.versions.length, 2);
  assert.equal(first.versions[0].result.contenu, 'Réunion le 12 mai.');
  assert.equal(first.versions[first.current_version].result.contenu, firstResult.contenu);
  assert.equal(agent._test.saveCurrentHistory([first]), true);

  const secondResult = { ...firstResult, contenu: 'La réunion est fixée au 12 mai.' };
  const second = agent._test.appendDocumentHistoryVersion(first, { ...first.meta, document_source_content: firstResult.contenu }, secondResult, firstResult.contenu);
  assert.equal(second.versions.length, 3);
  assert.equal(second.current_version, 2);
  assert.equal(agent._test.saveCurrentHistory([second]), true);
  const rendered = agent._test.renderers.document(second.result, second.meta);
  assert.match(rendered, /data-agent-restore-document/);
  assert.match(rendered, /La réunion aura lieu le 12 mai\./);
  assert.match(rendered, /La réunion est fixée au 12 mai\./);

  const restored = agent._test.restoreDocumentHistoryVersion(second);
  assert.equal(restored.result.contenu, firstResult.contenu);
  assert.equal(restored.versions.length, 4);
  assert.equal(restored.current_version, 3);
  assert.equal(restored.versions[2].result.contenu, secondResult.contenu);
  assert.equal(Object.hasOwn(restored.meta, 'document_target_content'), false);
  assert.equal(agent._test.saveCurrentHistory([restored]), true);
  const stored = JSON.parse(local.get('sti_agent_history_v1'));
  assert.equal(stored[0].versions.length, 4);
  assert.equal(stored[0].result.contenu, firstResult.contenu);
});

test('l’enregistrement et la restauration d’un document exigent la confirmation du professeur', async () => {
  const { agent, setConfirm } = loadAgent({ profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada' }, confirm: false });
  agent.render({ sessions: { '3SI1': [] }, store: { seances: {} } });
  const result = { titre: 'Note', type_document: 'Document libre', contenu: 'Texte corrigé.', changements: [], points_a_verifier: [] };
  const meta = {
    classe: '3SI1', titre: 'Note', type_document: 'Document libre', document_replacement_id: '',
    document_history_id: '', document_source_content: 'Texte source.', document_target_content: '', document_saved: false
  };
  agent._test.setResult('document', result, meta);
  await agent._test.applyResult();
  assert.equal(agent._test.currentHistory().length, 0, 'Annuler ne doit rien sauvegarder.');

  setConfirm(true);
  await agent._test.applyResult();
  const saved = agent._test.currentHistory()[0];
  assert.equal(saved.result.contenu, 'Texte corrigé.');
  assert.equal(saved.versions[0].result.contenu, 'Texte source.');
  assert.equal(saved.meta.document_saved, true);

  setConfirm(false);
  await agent._test.restoreDocumentVersion();
  assert.equal(agent._test.currentHistory()[0].result.contenu, 'Texte corrigé.', 'Annuler la restauration conserve la version active.');
  setConfirm(true);
  await agent._test.restoreDocumentVersion();
  const restored = agent._test.currentHistory()[0];
  assert.equal(restored.result.contenu, 'Texte source.');
  assert.equal(restored.versions[1].result.contenu, 'Texte corrigé.');
});

test('un échec de stockage local ne confirme pas à tort la sauvegarde d’une version', () => {
  const { agent } = loadAgent({ profile: { nom: 'Ada Lovelace', prof_id: 'teacher-ada' }, failWrites: true });
  agent.render({ sessions: { '3SI1': [] }, store: { seances: {} } });
  const entry = agent._test.newDocumentHistoryEntry(
    agent._test.activeTeacherKey(),
    { classe: '3SI1', titre: 'Note', type_document: 'Document libre' },
    { titre: 'Note', type_document: 'Document libre', contenu: 'Texte révisé', changements: [], points_a_verifier: [] },
    'Texte source'
  );
  assert.equal(agent._test.saveCurrentHistory([entry]), false);
  assert.equal(agent._test.currentHistory().length, 0);
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
