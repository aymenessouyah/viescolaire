const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const window = {};
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'assets/password-recovery.js'), 'utf8'),
  { window, URLSearchParams },
  { filename: 'assets/password-recovery.js' }
);
const parseLocation = window.STI_PASSWORD_RECOVERY.parseLocation;

test('détecte un retour Supabase de récupération avec jeton dans le fragment', () => {
  const result = parseLocation({ search: '', hash: '#access_token=reset-token&type=recovery' });
  assert.equal(result.isRecovery, true);
  assert.equal(result.accessToken, 'reset-token');
  assert.equal(result.type, 'recovery');
});

test('reconnaît aussi le jeton de récupération reçu dans la query string', () => {
  const result = parseLocation({ search: '?type=recovery&access_token=query-token', hash: '' });
  assert.equal(result.isRecovery, true);
  assert.equal(result.accessToken, 'query-token');
});

test('affiche le parcours de récupération si Supabase omet type mais renvoie un jeton ou une erreur', () => {
  assert.equal(parseLocation({ search: '?access_token=token', hash: '' }).isRecovery, true);
  const expired = parseLocation({ search: '?error_code=otp_expired', hash: '' });
  assert.equal(expired.isRecovery, true);
  assert.equal(expired.errorCode, 'otp_expired');
});

test('repère un token_hash pour pouvoir le valider et ignore une page normale', () => {
  const recovery = parseLocation({ search: '?type=recovery&token_hash=hash', hash: '' });
  assert.equal(recovery.isRecovery, true);
  assert.equal(recovery.tokenHash, 'hash');
  assert.equal(parseLocation({ search: '', hash: '' }).isRecovery, false);
  assert.equal(parseLocation({ search: '?type=signup&access_token=signup-token', hash: '' }).isRecovery, false);
});

test('la page charge le détecteur avant l’application et contient le formulaire de nouveau mot de passe', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const recoveryScript = html.indexOf('<script src="assets/password-recovery.js"></script>');
  const appScript = html.indexOf('<script src="assets/app.js"></script>');
  assert.ok(recoveryScript >= 0 && appScript > recoveryScript);
  assert.match(html, /id="password-reset-modal"/);
  assert.match(html, /id="password-reset-new"/);
  assert.match(html, /id="password-reset-confirm"/);
});
