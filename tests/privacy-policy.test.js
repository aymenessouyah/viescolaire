const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const policy = fs.readFileSync('politique-confidentialite.html', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const worker = fs.readFileSync('sw.js', 'utf8');
const app = fs.readFileSync('assets/app.js', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

test('la politique publique est lisible, en français et reliée depuis la page d’accueil', () => {
  assert.match(policy, /<html lang="fr">/);
  assert.match(policy, /<h1>Politique de confidentialité<\/h1>/);
  assert.match(policy, /aymenessouyah\.github\.io\/viescolaire\/politique-confidentialite\.html/);
  assert.match(index, /href="politique-confidentialite\.html">Politique de confidentialité<\/a>/);
});

test('la politique décrit les traitements locaux, Supabase, Google Drive et IA', () => {
  assert.match(policy, /stockage du navigateur/);
  assert.match(policy, /Supabase/);
  assert.match(policy, /drive\.file/);
  assert.match(policy, /API Google Gemini configurée pour l’Agent Vie Scolaire AI/);
  assert.match(policy, /nom complet du professeur et le nom du lycée sont ajoutés localement/);
  assert.match(policy, /ne sont pas envoyés à Gemini pour cet en-tête/);
  assert.match(policy, /profil du professeur et de l’établissement n’est pas ajouté automatiquement/);
  assert.match(policy, /aperçu des champs transmis, la liste des images jointes/);
  assert.match(policy, /cette détection n’est pas exhaustive/);
  assert.match(policy, /un compte ne voit que son propre historique/);
  assert.match(policy, /anciennes entrées sans identité de compte sont masquées/);
  assert.match(policy, /Conditions d’utilisation de l’API Gemini/);
  assert.match(policy, /aymenessouyah@gmail\.com/);
});

test('la politique expose les choix et limites essentiels de sauvegarde et de correction', () => {
  assert.match(policy, /accord explicite du professeur/);
  assert.match(policy, /ne les supprime pas automatiquement/);
  assert.match(policy, /aucune note n’est enregistrée automatiquement/);
  assert.match(policy, /myaccount\.google\.com\/permissions/);
});

test('la politique est incluse au cache hors ligne et les versions d’interface concordent', () => {
  assert.match(worker, /"\.\/politique-confidentialite\.html"/);
  const expected = 'v1.21.0-agent-context-preview';
  assert.ok(index.includes(expected));
  assert.ok(app.includes(expected));
  assert.ok(worker.includes('sti-espace-' + expected));
  assert.match(readme, /viescolaire\/politique-confidentialite\.html/);
});

test('la page de confidentialité ne charge pas de script tiers', () => {
  assert.doesNotMatch(policy, /<script\b/i);
});
