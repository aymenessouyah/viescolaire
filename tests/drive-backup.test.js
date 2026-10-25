const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('assets/drive-backup.js', 'utf8');

function policy() {
  const window = {
    STI_SUPABASE: { googleDriveClientId: '' },
    STI_SYNC: { ready: Promise.resolve(), backupSnapshot: () => null },
    addEventListener() {},
    setInterval() {}
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    getElementById() { return null; }
  };
  vm.runInNewContext(source, { window, document }, { filename: 'assets/drive-backup.js' });
  return window.STI_DRIVE_BACKUP.policy;
}

test('la politique Google Drive ne demande que drive.file', () => {
  assert.equal(policy().scope, 'https://www.googleapis.com/auth/drive.file');
});

test('une sauvegarde est due si aucune copie précédente n’existe', () => {
  assert.equal(policy().isDue(null, Date.UTC(2026, 9, 25)), true);
});

test('la cadence recommandée est de sept jours révolus depuis la dernière copie', () => {
  const p = policy();
  const last = Date.UTC(2026, 9, 18, 12);
  assert.equal(p.isDue(new Date(last).toISOString(), last + 7 * 24 * 60 * 60 * 1000 - 1), false);
  assert.equal(p.isDue(new Date(last).toISOString(), last + p.weekMs), true);
});

test('une date Drive illisible déclenche une copie de rattrapage au lieu de bloquer', () => {
  assert.equal(policy().isDue('date-invalide', Date.UTC(2026, 9, 25)), true);
});
