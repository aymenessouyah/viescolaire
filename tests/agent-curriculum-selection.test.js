const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const agentSource = fs.readFileSync(path.join(root, 'assets/agent-sti.js'), 'utf8');
const edgeSource = fs.readFileSync(path.join(root, 'supabase/functions/assistant-ia/index.ts'), 'utf8');

function loadAgent(stiData) {
  const zone = { innerHTML: '' };
  const listeners = {};
  const document = {
    addEventListener(type, handler) { listeners[type] = handler; },
    getElementById(id) { return id === 'v-agent' ? zone : null; },
    querySelector() { return { textContent: '' }; }
  };
  const sandbox = {
    window: { STI_DATA: stiData, todayISO: () => '2026-10-25' },
    document,
    localStorage: { getItem() { return null; }, setItem() {} },
    console, Date, Intl, Math, JSON, Array, String, Number, Object, Boolean,
    Promise, URL, Blob, AbortController, setTimeout, clearTimeout
  };
  vm.runInNewContext(agentSource, sandbox, { filename: 'agent-sti.js' });
  return { agent: sandbox.window.STI_AGENT, listeners, zone };
}

const catalogue = {
  livresSTI: {
    '3SI1': { items: [
      { id: 'html-structure', label: 'Structure HTML', domain: 'HTML5', description: 'Balises sémantiques', detail: '', kind: 'Notion' },
      { id: 'js-events', label: 'Événements JavaScript', domain: 'JavaScript', description: 'Événements clavier et souris', detail: '', kind: 'Notion' }
    ] }
  },
  competences: {
    '3SI1': [{ code: 'D', t: 'Créer un site interactif', domaine: 'Web', attendu: ['Structurer une page', 'Contrôler un formulaire'] }]
  }
};

test('les sélections transmises ne contiennent que les notions et compétences du référentiel choisies', () => {
  const { agent } = loadAgent(catalogue);
  const notions = JSON.parse(JSON.stringify(Array.from(agent._test.curriculumSelection('notions', ['js-events', 'unknown']))));
  assert.deepEqual(notions, [{
    id: 'js-events', notion: 'Événements JavaScript', domaine: 'JavaScript',
    description: 'Événements clavier et souris', detail: '', type: 'Notion'
  }]);
  const competences = JSON.parse(JSON.stringify(Array.from(agent._test.curriculumSelection('competences', ['D|Créer un site interactif']))));
  assert.deepEqual(competences, [{
    code: 'D', competence: 'Créer un site interactif', domaine: 'Web',
    attendus: ['Structurer une page', 'Contrôler un formulaire']
  }]);
});

test('les notions déjà associées à la séance sont présélectionnées dans la fiche', () => {
  const { agent, zone } = loadAgent(catalogue);
  const session = { cls: '3SI1', n: 1, iso: '2026-10-26', tri: 1, blk: { t: 'HTML sémantique', d: 'HTML5' } };
  agent.render({ sessions: { '3SI1': [session] }, store: { seances: { '3SI1|1': { notions: ['html-structure'] } } } });
  assert.match(zone.innerHTML, /data-agent-selection="notions" value="html-structure" checked/);
  assert.match(zone.innerHTML, /data-agent-selection="competences" value="D\|Créer un site interactif"/);
  assert.doesNotMatch(zone.innerHTML, /data-agent-selection="competences" value="D\|Créer un site interactif" checked/);
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayload()));
  assert.equal(payload.input.notions_selectionnees[0].id, 'html-structure');
  assert.deepEqual(payload.input.competences_selectionnees, []);
});

test('décocher une notion présélectionnée la retire réellement du contexte de la fiche', () => {
  const { agent, listeners } = loadAgent(catalogue);
  const session = { cls: '3SI1', n: 1, iso: '2026-10-26', tri: 1, blk: { t: 'HTML sémantique', d: 'HTML5' } };
  agent.render({ sessions: { '3SI1': [session] }, store: { seances: { '3SI1|1': { notions: ['html-structure'] } } } });
  const checkbox = { dataset: { agentSelection: 'notions' }, value: 'html-structure', checked: false, closest() { return this; } };
  listeners.change({ target: checkbox });
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayload()));
  assert.deepEqual(Array.from(payload.input.notions_selectionnees), []);
  assert.equal(Object.hasOwn(payload.input.seance, 'notions'), false);
});

test('les formulaires de fiche et d’exercices proposent des sélections multiples recherchables', () => {
  assert.equal((agentSource.match(/curriculumPicker\('notions', 'Notions du référentiel'/g) || []).length, 2);
  assert.equal((agentSource.match(/curriculumPicker\('competences', 'Compétences ciblées'/g) || []).length, 2);
  assert.match(agentSource, /type="search" data-agent-catalog-filter=/);
  assert.match(agentSource, /type="checkbox" data-agent-selection=/);
  assert.match(agentSource, /storedNotionsForSession\(forms\.fiche\.session\)/);
  assert.match(agentSource, /notions déjà renseignées pour cette séance sont présélectionnées/);
});

test('les coches faites dans le formulaire d’exercices arrivent dans la demande envoyée à l’agent', () => {
  const { agent, listeners, zone } = loadAgent(catalogue);
  agent.render({ sessions: { '3SI1': [] }, store: { seances: {} } });
  const exerciseTool = { dataset: { agentTool: 'exercices' }, hasAttribute() { return false; } };
  listeners.click({ target: { closest() { return exerciseTool; } } });
  assert.match(zone.innerHTML, /Notions du référentiel/);
  assert.match(zone.innerHTML, /Compétences ciblées/);

  for (const [kind, value] of [['notions', 'js-events'], ['competences', 'D|Créer un site interactif']]) {
    const checkbox = { dataset: { agentSelection: kind }, value, checked: true, closest() { return this; } };
    listeners.change({ target: checkbox });
  }
  const payload = JSON.parse(JSON.stringify(agent._test.buildPayload()));
  assert.equal(payload.input.notions_selectionnees[0].notion, 'Événements JavaScript');
  assert.deepEqual(Array.from(payload.input.notions_du_referentiel), []);
  assert.equal(payload.input.competences_selectionnees[0].competence, 'Créer un site interactif');
  assert.deepEqual(Array.from(payload.input.competences), []);
  assert.equal('notions' in payload.input, false);
});

test('les choix sélectionnés sont transmis à l’agent et prioritaires dans ses consignes', () => {
  assert.match(agentSource, /notions_selectionnees: notionsSelectionnees/);
  assert.match(agentSource, /competences_selectionnees: competencesSelectionnees/);
  assert.match(agentSource, /notions_du_referentiel: notionsSelectionnees\.length \? \[\] : relatedNotions\(f\.sujet\)/);
  assert.match(edgeSource, /Si input\.notions_selectionnees contient des entrées/);
  assert.match(edgeSource, /Si input\.competences_selectionnees contient des entrées/);
  assert.match(edgeSource, /"competences": \["compétence travaillée"\]/);
  assert.match(edgeSource, /"notions": \["notion ciblée"\]/);
});

test('les compétences et notions ciblées peuvent être relues dans les documents générés', () => {
  assert.match(agentSource, /<h3>Compétences ciblées<\/h3>\$\{chipList\(r\.competences\)\}/);
  assert.match(agentSource, /<h3>Notions ciblées<\/h3>\$\{chipList\(r\.notions\)\}/);
  const { agent } = loadAgent(catalogue);
  assert.match(agent._test.ficheText({ competences: ['Créer un site interactif'] }), /COMPÉTENCES CIBLÉES : Créer un site interactif/);
  assert.match(agentSource, /Sciences et technologies de l’informatique/);
  assert.doesNotMatch(agentSource, /Sciences et techniques de l’informatique/);
  assert.match(edgeSource, /Sciences et technologies de l’informatique/);
  assert.doesNotMatch(edgeSource, /Sciences et techniques de l’informatique/);
});
