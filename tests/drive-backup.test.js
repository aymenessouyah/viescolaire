const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('assets/drive-backup.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

test('un accès Google Drive visible est présent dans la barre supérieure', () => {
  assert.match(indexHtml, /id="btn-drive-backup-top"[^>]*onclick="window\.STI_DRIVE_BACKUP \? window\.STI_DRIVE_BACKUP\.openSettings\(\)/);
  assert.match(indexHtml, /id="btn-drive-backup-top"[\s\S]*?<span>Exporter vers Drive<\/span>/);
});

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

test('le statut Drive est aussi affiché dans la modale du profil', () => {
  const nodes = Object.fromEntries(['sti-drive-status', 'pf-drive-status'].map(id => [id, {
    textContent: '', dataset: {}, classList: { remove() {}, add() {} }
  }]));
  const window = {
    STI_SUPABASE: { googleDriveClientId: '' },
    STI_SYNC: { backupSnapshot: () => null },
    isProfessorConnected: () => false,
    addEventListener() {},
    setInterval() {}
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    getElementById(id) { return nodes[id] || null; }
  };
  vm.runInNewContext(source, { window, document }, { filename: 'assets/drive-backup.js' });
  window.STI_DRIVE_BACKUP.workspaceReady();
  assert.equal(nodes['pf-drive-status'].textContent, 'Disponible après connexion professeur');
  assert.equal(nodes['pf-drive-status'].dataset.state, 'idle');
});

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
