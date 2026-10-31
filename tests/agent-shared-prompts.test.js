const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const agentSource = fs.readFileSync(path.join(root, 'assets/agent-sti.js'), 'utf8');
const adminSource = fs.readFileSync(path.join(root, 'assets/admin.js'), 'utf8');
const indexSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workerSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
const managerSource = fs.readFileSync(path.join(root, 'supabase/functions/prompt-manager/index.ts'), 'utf8');
const assistantSource = fs.readFileSync(path.join(root, 'supabase/functions/assistant-ia/index.ts'), 'utf8');
const migrationSource = fs.readFileSync(path.join(root, 'supabase/migrations/20261026_agent_prompt_library.sql'), 'utf8');
const supabaseConfig = fs.readFileSync(path.join(root, 'supabase/config.toml'), 'utf8');

function loadAgent() {
  const listeners = {};
  const document = {
    addEventListener(type, handler) { listeners[type] = handler; },
    getElementById() { return null; },
    querySelector() { return null; }
  };
  const sandbox = {
    window: { STI_DATA: { reference: { SCHOOL: { lycee: 'Lycée de test' } } } },
    document,
    localStorage: { getItem() { return null; }, setItem() {} },
    console, Date, Intl, Math, JSON, Array, String, Number, Object, Boolean,
    Promise, URL, Blob, AbortController, setTimeout, clearTimeout
  };
  vm.runInNewContext(agentSource, sandbox, { filename: 'agent-sti.js' });
  return { agent: sandbox.window.STI_AGENT, listeners };
}

const uuid = index => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;

test('le formulaire affiche seulement les prompts partagés du bon outil et permet d’en choisir plusieurs', () => {
  const { agent } = loadAgent();
  agent._test.setSharedPrompts([
    { id: uuid(1), task: 'fiche', title: 'Fiche concise', description: 'Rendre les objectifs observables.', prompt: 'Présente les objectifs sous forme de verbes observables.' },
    { id: uuid(2), task: 'exercices', title: 'Exercices progressifs', description: '', prompt: 'Ordonne les questions par difficulté.' }
  ]);
  agent._test.setSelectedSharedPromptIds('fiche', [uuid(1)]);
  const html = agent._test.formFor('fiche');
  assert.match(html, /Prompts approuvés pour DeepSeek/);
  assert.match(html, /Fiche concise/);
  assert.match(html, /value="00000000-0000-4000-8000-000000000001" checked/);
  assert.doesNotMatch(html, /Exercices progressifs/);
  assert.match(html, /Claude sert uniquement à créer des brouillons génériques/);
});

test('les prompts sélectionnés sont transmis par identifiants, vérifiés par le serveur et visibles dans l’aperçu', () => {
  const { agent } = loadAgent();
  const prompts = [
    { id: uuid(1), task: 'fiche', title: 'Objectifs observables', description: '', prompt: 'Utilise des objectifs mesurables et adaptés au niveau.' },
    { id: uuid(2), task: 'fiche', title: 'Évaluation courte', description: '', prompt: 'Prévois une vérification formative rapide.' }
  ];
  agent._test.setSharedPrompts(prompts);
  agent._test.setSelectedSharedPromptIds('fiche', prompts.map(item => item.id));
  const request = agent._test.buildRequestSpec();
  assert.deepEqual(JSON.parse(JSON.stringify(request.payload.prompt_ids)), prompts.map(item => item.id));
  assert.equal(request.prompts.length, 2);
  assert.doesNotMatch(JSON.stringify(request.payload.input), /Utilise des objectifs mesurables/);
  const preview = JSON.parse(JSON.stringify(agent._test.requestPreview(request)));
  assert.deepEqual(preview.prompts_approved.map(item => item.title), ['Objectifs observables', 'Évaluation courte']);
  assert.equal(preview.prompts_approved[0].prompt, prompts[0].prompt);
  assert.match(assistantSource, /approvedSharedPrompts\(request, task, payload\?\.prompt_ids\)/);
  assert.match(assistantSource, /sharedPromptInstructions\(selectedPrompts\.prompts\)/);
  assert.match(assistantSource, /\.set\("published", "eq\.true"\)/);
  assert.match(assistantSource, /rowsById\.size !== ids\.length/);
  assert.match(assistantSource, /ids\.map\(id => rowsById\.get\(id\.toLowerCase\(\)\)/);
});

test('le client et le serveur plafonnent la sélection à cinq prompts', () => {
  const { agent } = loadAgent();
  const prompts = Array.from({ length: 6 }, (_, index) => ({
    id: uuid(index + 1), task: 'fiche', title: `Prompt ${index + 1}`, description: '', prompt: `Texte ${index + 1}`
  }));
  agent._test.setSharedPrompts(prompts);
  agent._test.setSelectedSharedPromptIds('fiche', prompts.map(item => item.id));
  const request = agent._test.buildRequestSpec();
  assert.equal(request.payload.prompt_ids.length, 5);
  assert.match(assistantSource, /MAX_SHARED_PROMPTS = 5/);
  assert.match(assistantSource, /Sélectionnez au maximum \$\{MAX_SHARED_PROMPTS\} prompts approuvés/);
});

test('Claude reçoit uniquement une description générique fixe et jamais les données de demande', () => {
  assert.match(managerSource, /Deliberately build this request from a fixed allowlisted task only/);
  assert.match(managerSource, /const genericRequest = \[/);
  assert.match(managerSource, /taskInfo\.genericGoal/);
  assert.match(managerSource, /messages: \[\{ role: "user", content: genericRequest \}\]/);
  assert.match(managerSource, /ANTHROPIC_API_KEY/);
  assert.match(managerSource, /ANTHROPIC_MODEL/);
  assert.match(managerSource, /"https:\/\/api\.anthropic\.com\/v1\/messages"/);
  assert.doesNotMatch(managerSource, /body\?\.input|body\?\.attachments|body\?\.copy|body\?\.image|payload\.input|payload\.attachments/);
  assert.doesNotMatch(adminSource + agentSource + indexSource, /ANTHROPIC_API_KEY\s*[:=]\s*["'][^"']+/);
  assert.match(indexSource, /aucune demande pédagogique, copie, image, donnée d’élève ou document n’est envoyé à Claude/i);
});

test('les brouillons Claude restent privés jusqu’au clic d’approbation et la bibliothèque est gérée côté serveur', () => {
  assert.match(indexSource, /adminPromptsGenerer\(\)/);
  assert.match(indexSource, /prompts approuvés et partagés/i);
  assert.match(adminSource, /adminPromptAppel\("draft", \{ task \}\)/);
  assert.match(adminSource, /adminPromptAppel\("publish"/);
  assert.match(adminSource, /adminPromptAppel\("unpublish"/);
  assert.match(managerSource, /if \(action === "draft"\)/);
  assert.match(managerSource, /if \(action === "publish"\)/);
  assert.match(managerSource, /if \(action === "unpublish"\)/);
  assert.match(managerSource, /const admins = adminEmails\(\)/);
  assert.match(managerSource, /created_by: user\.id/);
});

test('la migration réserve l’écriture à service_role et limite la lecture aux prompts publiés', () => {
  assert.match(migrationSource, /create table if not exists public\.agent_prompt_library/);
  assert.match(migrationSource, /alter table public\.agent_prompt_library enable row level security/);
  assert.match(migrationSource, /to authenticated\s+using \(published = true\)/);
  assert.match(migrationSource, /revoke all on public\.agent_prompt_library from public, anon, authenticated/);
  assert.match(migrationSource, /grant select on public\.agent_prompt_library to authenticated/);
  assert.match(migrationSource, /grant all on public\.agent_prompt_library to service_role/);
});

test('la vérification verify_jwt=false reste limitée à assistant-ia et le cache statique est renouvelé', () => {
  assert.match(supabaseConfig, /\[functions\.assistant-ia\][\s\S]*?verify_jwt\s*=\s*false/);
  assert.doesNotMatch(supabaseConfig, /\[functions\.prompt-manager\]/);
  assert.match(appSource, /v1\.27\.0-smart-book-3si/);
  assert.match(indexSource, /var ATTENDU = "v1\.27\.0-smart-book-3si"/);
  assert.match(workerSource, /sti-espace-v1\.27\.0-smart-book-3si/);
});
