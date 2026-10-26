const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const apiModule = import(path.join(root, 'supabase/functions/assistant-ia/deepseek-api.mjs'));

test('construit une seule requête Responses DeepSeek avec JSON Schema et images dans le message utilisateur', async () => {
  const { buildDeepSeekRequestBody } = await apiModule;
  const body = buildDeepSeekRequestBody({
    task: 'correction',
    model: 'deepseek-flash',
    instructions: 'Consigne système de test.',
    userText: 'Données JSON de test.',
    attachments: [
      { data: 'data:image/jpeg;base64,QUJD' },
      { data: 'data:image/png;base64,REVG' },
      { data: 'data:text/plain;base64,SElK' }
    ],
    maxOutputTokens: 5000,
    temperature: 0.1
  });

  assert.equal(body.model, 'deepseek-flash');
  assert.equal(body.instructions, 'Consigne système de test.');
  assert.equal(body.reasoning.effort, 'none');
  assert.equal(body.max_output_tokens, 5000);
  assert.equal(body.temperature, 0.1);
  assert.equal(body.stream, false);
  assert.equal(body.input.length, 1);
  assert.equal(body.input[0].role, 'user');
  assert.deepEqual(body.input[0].content.map(part => part.type), ['input_text', 'input_image', 'input_image']);
  assert.equal(body.input[0].content[1].image_url, 'data:image/jpeg;base64,QUJD');
  assert.equal(body.input[0].content[1].detail, 'original');
  assert.equal(body.text.format.type, 'json_schema');
  assert.equal(body.text.format.name, 'agent_correction_result');
  assert.equal(body.text.format.schema.type, 'object');
  assert.equal(body.text.format.schema.additionalProperties, false);
  assert.deepEqual([...body.text.format.schema.required].sort(), Object.keys(body.text.format.schema.properties).sort());
});

test('extrait uniquement les blocs output_text, sans exposer les éléments de raisonnement', async () => {
  const { extractDeepSeekContent } = await apiModule;
  const response = {
    output: [
      { type: 'reasoning', content: [{ type: 'reasoning_text', text: 'Ne pas exposer ce bloc.' }] },
      { type: 'message', content: [
        { type: 'reasoning_text', text: 'Ni celui-ci.' },
        { type: 'output_text', text: '{"note":' },
        { type: 'output_text', text: '12}' }
      ] }
    ]
  };
  assert.equal(extractDeepSeekContent(response), '{"note":12}');
  assert.equal(extractDeepSeekContent({ output: [] }), '');
});

test('refuse de construire un schéma pour une tâche inconnue', async () => {
  const { buildDeepSeekRequestBody } = await apiModule;
  assert.throws(() => buildDeepSeekRequestBody({ task: 'unknown' }), /Tâche DeepSeek inconnue/);
});
