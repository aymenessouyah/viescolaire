const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const edgeSource = fs.readFileSync(path.join(root, 'supabase/functions/assistant-ia/index.ts'), 'utf8');
const qualityModule = import(path.join(root, 'supabase/functions/assistant-ia/quality.mjs'));

const correctionResult = () => ({
  note: 15,
  sur: 20,
  confiance: 'haute',
  questions: [
    { question: 'Q1', points_attribues: 7, points_max: 10, justification: 'Réponse observable.', erreurs: [], elements_corrects: ['Méthode correcte.'] },
    { question: 'Q2', points_attribues: 8, points_max: 10, justification: 'Résultat correct.', erreurs: [], elements_corrects: ['Calcul exact.'] }
  ],
  appreciation: 'Travail sérieux.',
  remediation: [],
  transcription_incertaine: [],
  limites_analyse: []
});

test('Gemini reçoit un schéma structuré complet pour chacun des huit outils', async () => {
  const { GEMINI_RESPONSE_SCHEMAS } = await qualityModule;
  const expectedTasks = ['fiche', 'exercices', 'correction', 'transcription', 'bareme', 'cahier', 'repartition', 'document'];
  assert.deepEqual(Object.keys(GEMINI_RESPONSE_SCHEMAS).sort(), expectedTasks.sort());
  for (const schema of Object.values(GEMINI_RESPONSE_SCHEMAS)) {
    assert.equal(schema.type, 'OBJECT');
    assert.deepEqual(schema.required.sort(), Object.keys(schema.properties).sort());
  }
  assert.ok(GEMINI_RESPONSE_SCHEMAS.repartition.properties.avertissements);
  assert.match(edgeSource, /responseSchema: GEMINI_RESPONSE_SCHEMAS\[task\]/);
  assert.match(edgeSource, /contrôle silencieusement que les champs et types requis[\s\S]*sont présents/);
  assert.doesNotMatch(edgeSource, /api\.anthropic\.com/);
});

test('la validation de correction vérifie les champs et recalcule les totaux des points', async () => {
  const { validateResult, requestConsistencyError } = await qualityModule;
  const result = correctionResult();
  const payload = { input: { note_maximale: 20 } };
  assert.equal(validateResult('correction', result), true);
  assert.equal(requestConsistencyError('correction', result, payload), '');

  const wrongAwardedTotal = { ...result, note: 16 };
  assert.match(requestConsistencyError('correction', wrongAwardedTotal, payload), /somme des points attribués/);

  const overAward = correctionResult();
  overAward.questions[0].points_attribues = 11;
  assert.match(requestConsistencyError('correction', overAward, payload), /dépasse le maximum/);

  const incomplete = correctionResult();
  delete incomplete.limites_analyse;
  assert.equal(validateResult('correction', incomplete), false);
});

test('la validation du barème vérifie le total demandé et la somme des critères', async () => {
  const { validateResult, requestConsistencyError } = await qualityModule;
  const result = {
    titre: 'Barème proposé', type_devoir: 'théorique', total: 20,
    criteres: [
      { question: 'Q1', points: 8, criteres: ['Réponse exacte.'] },
      { question: 'Q2', points: 12, criteres: ['Raisonnement justifié.'] }
    ],
    regles: []
  };
  const payload = { input: { note_maximale: 20, type_devoir: 'théorique' } };
  assert.equal(validateResult('bareme', result), true);
  assert.equal(requestConsistencyError('bareme', result, payload), '');
  assert.match(requestConsistencyError('bareme', { ...result, criteres: [{ ...result.criteres[0], points: 7 }, result.criteres[1]] }, payload), /somme des critères/);
  assert.match(requestConsistencyError('bareme', { ...result, type_devoir: 'pratique' }, payload), /type de devoir/);
});

test('la fiche vérifie 4 à 7 phases et environ 120 minutes quand les durées sont lisibles', async () => {
  const { validateResult, requestConsistencyError } = await qualityModule;
  const phase = (index, duree) => ({
    phase: `Phase ${index}`, duree, activite_enseignant: 'Guide.',
    activite_eleve: 'Réalise.', trace: 'Production.'
  });
  const result = {
    titre: 'Séance', objectifs: ['Réaliser un objectif.'], prerequis: [],
    deroulement: [phase(1, '30 min'), phase(2, '30 min'), phase(3, '30 min'), phase(4, '30 min')],
    notions: [], competences: [], travail_maison: 'Aucun', supports: [],
    evaluation: 'Vérification courte.', remediation: 'Reprise guidée.'
  };
  assert.equal(validateResult('fiche', result), true);
  assert.equal(requestConsistencyError('fiche', result, { input: {} }), '');
  const tooShort = { ...result, deroulement: result.deroulement.map(p => ({ ...p, duree: '20 min' })) };
  assert.match(requestConsistencyError('fiche', tooShort, { input: {} }), /totalisent 80 minutes/);
  const unparseableDuration = { ...result, deroulement: [{ ...result.deroulement[0], duree: 'une phase courte' }, ...result.deroulement.slice(1)] };
  assert.match(requestConsistencyError('fiche', unparseableDuration, { input: {} }), /Exprimez chaque durée/);
  assert.match(requestConsistencyError('fiche', { ...result, deroulement: result.deroulement.slice(0, 3) }, { input: {} }), /4 à 7 phases/);
});

test('les exercices vérifient le nombre demandé et les points annoncés lorsqu’ils sont numériques', async () => {
  const { validateResult, requestConsistencyError } = await qualityModule;
  const exercise = (title, points) => ({
    titre: title, points, enonce: 'Consigne complète.',
    questions: [{ enonce: 'Question autonome.', bareme: 'Tous les points.' }],
    correction: 'Corrigé complet.'
  });
  const result = {
    titre: 'Série', format: 'Exercices', duree: '45 min', bareme_total: '20 points',
    introduction: 'Répondez aux questions.', notions: [],
    exercices: [exercise('Exercice 1', '8 points'), exercise('Exercice 2', '12 points')],
    competences: []
  };
  const payload = { input: { nombre: 2 } };
  assert.equal(validateResult('exercices', result), true);
  assert.equal(requestConsistencyError('exercices', result, payload), '');
  assert.match(requestConsistencyError('exercices', { ...result, exercices: [exercise('E1', '10 points')] }, payload), /au lieu de 2/);
  assert.match(requestConsistencyError('exercices', { ...result, exercices: [exercise('E1', '10 points'), exercise('E2', '12 points')] }, payload), /barème total annoncé/);
  assert.match(requestConsistencyError('exercices', { ...result, exercices: [exercise('E1', '-1 point'), exercise('E2', '21 points')] }, payload), /points négatifs/);
});

test('la répartition conserve chaque numéro/date et la transcription ne dépasse pas les pages transmises', async () => {
  const { validateResult, requestConsistencyError } = await qualityModule;
  const session = { numero: 1, date: '2026-10-27', titre: 'Séance', domaine: 'Programmation', type: 'cours', objectif: 'Comprendre.', travail_maison: '' };
  const repartition = { titre: 'Répartition', avertissements: [], seances: [session] };
  assert.equal(validateResult('repartition', repartition), true);
  assert.equal(requestConsistencyError('repartition', repartition, { input: { seances: [session] } }), '');
  assert.match(requestConsistencyError('repartition', { ...repartition, seances: [{ ...session, date: '2026-10-28' }] }, { input: { seances: [session] } }), /modifié un numéro ou une date/);
  assert.equal(validateResult('repartition', { ...repartition, seances: [{ ...session, date: '2026-02-31' }] }), false);

  const transcription = { transcription: 'Réponse transcrite.', transcription_incertaine: [], confiance_globale: 'haute', pages_lues: 2 };
  assert.equal(validateResult('transcription', transcription), true);
  assert.match(requestConsistencyError('transcription', transcription, { input: { nombre_de_photos: 1 } }), /dépasse le nombre de photos/);
  assert.match(requestConsistencyError('transcription', { ...transcription, note: 12 }, { input: { nombre_de_photos: 2 } }), /sans évaluation/);
});

test('le cahier et le document doivent respecter leurs champs structurés obligatoires', async () => {
  const { validateResult, requestConsistencyError } = await qualityModule;
  assert.equal(validateResult('cahier', {
    titre: 'Séance', contenu: 'Travail réalisé.', notions: [], travail_maison: 'Non renseigné',
    observations: 'Non renseigné', points_a_reprendre: ''
  }), true);
  assert.equal(validateResult('cahier', { contenu: 'Travail réalisé.' }), false);
  const document = { titre: 'Note', type_document: 'Note pédagogique', contenu: 'Texte complet.', changements: [], points_a_verifier: [] };
  assert.equal(validateResult('document', document), true);
  assert.equal(validateResult('document', { titre: 'Note', type_document: 'Note', contenu: 'Texte', changements: [] }), false);
  assert.equal(requestConsistencyError('document', document, { input: { titre: 'Note', type_document: 'Note pédagogique', document_a_remplacer: 'Texte source.' } }, 20), '');
  assert.match(requestConsistencyError('document', document, { input: { titre: 'Note', type_document: 'Note pédagogique', document_a_remplacer: 'source trop longue' } }, 8), /dépasse la limite de 8 caractères/);
});
