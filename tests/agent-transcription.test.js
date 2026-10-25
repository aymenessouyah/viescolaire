const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const agentSource = fs.readFileSync(path.join(root, 'assets/agent-sti.js'), 'utf8');
const edgeSource = fs.readFileSync(path.join(root, 'supabase/functions/assistant-ia/index.ts'), 'utf8');

function loadAgentHelpers() {
  const sandbox = {
    window: {},
    document: { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; } },
    localStorage: { getItem() { return null; }, setItem() {} },
    console,
    Date,
    Intl,
    Math,
    JSON,
    Array,
    String,
    Number,
    Object,
    Boolean,
    Promise,
    URL,
    Blob,
    AbortController,
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(agentSource, sandbox, { filename: 'agent-sti.js' });
  return sandbox.window.STI_AGENT._test;
}

test('les copies théoriques avec photos passent d’abord par la transcription, pas les travaux pratiques', () => {
  const helpers = loadAgentHelpers();
  assert.equal(helpers.shouldTranscribeHandwriting({ type_devoir: 'théorique' }, 1), true);
  assert.equal(helpers.shouldTranscribeHandwriting({ type_devoir: 'pratique' }, 1), false);
  assert.equal(helpers.shouldTranscribeHandwriting({ type_devoir: 'théorique' }, 0), false);
  const payload = helpers.buildTranscriptionPayload();
  assert.equal(payload.context.task, 'transcription');
  assert.equal(payload.input.type_devoir, 'théorique');
  assert.equal('note_maximale' in payload.input, false);
  assert.equal('identifiant' in payload.context, false);
});

test('la revue de transcription distingue les passages signalés des lectures sans alerte', () => {
  const helpers = loadAgentHelpers();
  assert.equal(helpers.hasUncertainTranscription({ transcription_incertaine: [], confiance_globale: 'haute' }), false);
  assert.equal(helpers.hasUncertainTranscription({ transcription_incertaine: ['Q2 : mot illisible'], confiance_globale: 'haute' }), true);
  assert.equal(helpers.hasUncertainTranscription({ transcription_incertaine: [], confiance_globale: 'moyenne' }), true);
  assert.equal(helpers.hasUncertainTranscription(null), false);
});

test('les incertitudes de la prélecture restent visibles dans la correction finale', () => {
  const helpers = loadAgentHelpers();
  const result = { transcription_incertaine: [], limites_analyse: [] };
  helpers.preserveTranscriptionWarnings(result, { transcription_incertaine: ['Q2 : mot illisible'], confiance_globale: 'faible' }, true);
  assert.equal(Array.from(result.transcription_incertaine).join(','), 'Q2 : mot illisible');
  assert.match(result.limites_analyse[0], /après confirmation de l’enseignant/);
  const fallback = helpers.preserveTranscriptionWarnings({}, { transcription_incertaine: [], confiance_globale: 'moyenne' }, true);
  assert.match(fallback.transcription_incertaine[0], /Confiance de lecture moyenne/);
});

test('le flux de revue propose une transcription éditable et une confirmation explicite en cas de doute', () => {
  assert.match(agentSource, /Transcrire avant correction/);
  assert.match(agentSource, /data-agent-transcription-ack/);
  assert.match(agentSource, /Continuer malgré les incertitudes/);
  assert.match(agentSource, /transcription_preverifiee: Boolean\(transcriptionReview\)/);
  assert.match(agentSource, /attachments: \(task === 'transcription' \|\| \(task === 'correction' && !transcriptionReview\)\) \? attachments : \[\]/);
});

test('la fonction IA valide une transcription sans note et exige au moins une image', () => {
  assert.match(edgeSource, /"transcription"/);
  assert.match(edgeSource, /TÂCHE : transcrire fidèlement une copie manuscrite/);
  assert.match(edgeSource, /typeof result\.transcription === "string"[\s\S]*Array\.isArray\(result\.transcription_incertaine\)/);
  assert.match(edgeSource, /La prélecture doit fournir une transcription sans évaluation/);
  assert.match(edgeSource, /task === "transcription" && cleanText\(payload\?\.input\?\.type_devoir, 30\) !== "théorique"/);
  assert.match(edgeSource, /task === "transcription" && attachments\.length === 0/);
});
