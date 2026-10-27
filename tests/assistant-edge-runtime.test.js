const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Node 22+ can strip TypeScript; older Node versions still run the pure quality tests.
const supported = Boolean(process.features?.typescript);
let handler, upstreamResult, upstreamBody, upstreamCalls = 0;
const originalFetch = globalThis.fetch, originalDeno = globalThis.Deno;
const env = { SUPABASE_URL: 'https://supabase.invalid', SUPABASE_ANON_KEY: 'anon-test', DEEPSEEK_API_KEY: 'secret-test' };
if (supported) {
  globalThis.Deno = { env: { get: name => env[name] }, serve: fn => { handler = fn; } };
  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith('/auth/v1/user')) return new Response('{}', { status: 200 });
    if (String(url) === 'https://api.deepseek.com/responses') {
      upstreamCalls++; upstreamBody = JSON.parse(options.body);
      return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(upstreamResult) }] }] }), { status: 200 });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };
  require(path.join(__dirname, '../supabase/functions/assistant-ia/index.ts'));
  test.after(() => { globalThis.fetch = originalFetch; if (originalDeno === undefined) delete globalThis.Deno; else globalThis.Deno = originalDeno; });
}
function request(body, authenticated = true) {
  return new Request('https://edge.invalid', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authenticated ? { Authorization: 'Bearer test' } : {}) }, body: JSON.stringify(body) });
}
const correction = {
  note: 6, sur: 10, confiance: 'moyenne',
  questions: [{ question: 'Q1', points_attribues: 6, points_max: 10, justification: 'Analyse statique', erreurs: [], elements_corrects: [] }],
  appreciation: 'À poursuivre', remediation: [], transcription_incertaine: [], limites_analyse: ['Code non exécuté']
};
const codePayload = {
  task: 'correction', context: { classe: '3SI1' },
  input: { type_devoir: 'pratique', sujet: 'Écrire du code', bareme: '10 points', copie: '', note_maximale: 10, fichiers_code: [{ name: 'test.js', language: 'js', content: 'console.log(1)' }] }, attachments: []
};
const phases = [1, 2, 3, 4].map(i => ({ phase: `Phase ${i}`, duree: '15 min', activite_enseignant: 'Guide.', activite_eleve: 'Réalise.', trace: 'Production.' }));
const fiche = { titre: 'Fiche formulaires', objectifs: ['Réaliser un formulaire'], prerequis: [], deroulement: phases, notions: [], competences: [], travail_maison: 'Aucun', supports: [], evaluation: 'Vérification.', remediation: 'Reprendre.' };
const source = { titre: 'Programme', categorie: 'Programme', classe: '3SI1', provenance: 'Document fourni', date_edition: '2024', page_ou_section: 'p. 4', extrait_fourni: 'Contrôler un formulaire.' };
const fichePayload = { task: 'fiche', context: { classe: '3SI1' }, input: { duree_minutes: 60, sources_fournies: [source] } };

test('Edge simulée : refuse une demande sans session et traite un TP composé uniquement de code', { skip: !supported }, async () => {
  let response = await handler(request({ task: 'status' }, false));
  assert.equal(response.status, 401);
  const status = await handler(request({ task: 'status' }));
  assert.equal((await status.json()).protocol, 'sti-pedagogique-2026-10-27');
  upstreamResult = correction;
  response = await handler(request(codePayload));
  assert.equal(response.status, 200, await response.clone().text());
  const sent = JSON.parse(upstreamBody.input[0].content[0].text.replace('Données de travail JSON :\n', ''));
  assert.equal(sent.input.fichiers_code[0].content, 'console.log(1)');
  const body = await response.json();
  assert.equal(body.meta.protocol, 'sti-pedagogique-2026-10-27');
  assert.match(body.result.limites_analyse[0], /non exécuté/);
  const calls = upstreamCalls;
  response = await handler(request({ ...codePayload, input: { ...codePayload.input, fichiers_code: [{ name: 'x.exe', language: 'exe', content: 'binaire' }] } }));
  assert.equal(response.status, 400);
  assert.equal(upstreamCalls, calls, 'Un fichier invalide ne doit pas déclencher l’IA.');
});

test('Edge simulée : transmet les extraits choisis, contrôle la durée et bloque les affirmations de conformité', { skip: !supported }, async () => {
  upstreamResult = fiche;
  let response = await handler(request(fichePayload));
  assert.equal(response.status, 200, await response.clone().text());
  assert.match(upstreamBody.instructions, /Ne déclare jamais une proposition conforme/);
  assert.match(upstreamBody.input[0].content[0].text, /Contrôler un formulaire/);
  upstreamResult = { ...fiche, titre: 'Fiche conforme au programme officiel' };
  response = await handler(request(fichePayload));
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /non vérifiée/);
  const calls = upstreamCalls;
  response = await handler(request({ ...fichePayload, input: { ...fichePayload.input, sources_fournies: [{ ...source, extrait_fourni: 'x'.repeat(6001) }] } }));
  assert.equal(response.status, 400);
  assert.equal(upstreamCalls, calls);
});

test('Edge simulée : une répartition annuelle conserve numéros et dates et reçoit le budget prévu', { skip: !supported }, async () => {
  const session = { numero: 1, date: '2027-01-05', titre: 'JS', domaine: 'Web', type: 'TP', objectif: 'Tester', travail_maison: '' };
  upstreamResult = { titre: 'Répartition annuelle', seances: [session], avertissements: [] };
  const payload = { task: 'repartition', context: { classe: '3SI1' }, input: { periode: 'annuelle', seances: [{ numero: 1, date: '2027-01-05' }] } };
  let response = await handler(request(payload));
  assert.equal(response.status, 200, await response.clone().text());
  assert.equal(upstreamBody.max_output_tokens, 12000);
  upstreamResult = { ...upstreamResult, seances: [{ ...session, date: '2027-01-06' }] };
  response = await handler(request(payload));
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /modifié un numéro ou une date/);
});
