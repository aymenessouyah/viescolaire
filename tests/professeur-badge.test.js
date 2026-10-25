const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const siteBadge = { hidden: true, innerHTML: '' };
const badgeWindow = {
  document: { getElementById(id) { return id === 'site-professor-badge' ? siteBadge : null; } },
  authSession: () => ({ user: { id: 'a03b5ce1-7123-44aa-88bb-ccddee998877', email: 'aicha@example.tn' } }),
  isProfessorConnected: () => true
};
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'assets/professeur-badge.js'), 'utf8'),
  { window: badgeWindow, document: badgeWindow.document },
  { filename: 'assets/professeur-badge.js' }
);
const badge = badgeWindow.STI_PROF_BADGE;

test('le code de badge est stable et dérivé de façon courte de l’identifiant professeur', () => {
  assert.equal(badge.makeBadgeCode('a03b5ce1-7123-44aa-88bb-ccddee998877'), 'STI-A03B5CE1');
  assert.equal(badge.makeBadgeCode(''), 'STI-À COMPLÉTER');
});

test('la modale Mon profil et mon badge professeur donne accès à la sauvegarde Drive', () => {
  const start = indexHtml.indexOf('<div class="modal" id="profil-modal"');
  const end = indexHtml.indexOf('<!-- ===================== MODALE CONNEXION', start);
  assert.ok(start >= 0 && end > start, 'la modale du profil doit exister');
  const profileModal = indexHtml.slice(start, end);
  assert.match(profileModal, /id="pf-drive-title">Sauvegardes personnelles Google Drive/);
  assert.match(profileModal, /id="pf-drive-status"/);
  assert.match(profileModal, /id="pf-drive-settings"[^>]*STI_DRIVE_BACKUP[^>]*openSettings/);
  assert.match(profileModal, /Après votre accord/);
});

test('le badge imprimable affiche identité, courriel, discipline et portrait sans donnée médicale', () => {
  const html = badge.renderMarkup({
    nom: 'Aïcha <Ben Salem>',
    fonction: 'Professeure',
    matiere: 'Sciences et technologies de l’informatique',
    email: 'aicha@example.tn',
    badge_code: 'STI-A03B5CE1'
  }, 'blob:portrait-test');
  assert.match(html, /Aïcha &lt;Ben Salem&gt;/);
  assert.match(html, /aicha@example\.tn/);
  assert.match(html, /STI-A03B5CE1/);
  assert.match(html, /Sciences et technologies de l’informatique/);
  assert.match(html, /blob:portrait-test/);
  assert.doesNotMatch(html, /Blood|groupe sanguin|AB\+/i);
});

test('le mini-badge penché du site reste visible et reprend le portrait du professeur connecté', () => {
  badge.renderSiteBadge('site-professor-badge', {
    prof_id: 'a03b5ce1-7123-44aa-88bb-ccddee998877',
    nom: 'Aïcha <Ben Salem>',
    fonction: 'Professeure',
    matiere: 'Sciences et technologies de l’informatique',
    badge_code: 'STI-A03B5CE1'
  }, 'blob:portrait-test');
  assert.equal(siteBadge.hidden, false);
  assert.match(siteBadge.innerHTML, /blob:portrait-test/);
  assert.match(siteBadge.innerHTML, /Aïcha &lt;Ben Salem&gt;/);
  assert.match(siteBadge.innerHTML, /STI-A03B5CE1/);
  assert.match(siteBadge.innerHTML, /openProfil\(\)/);
});

test('le mini-badge est masqué hors connexion pour ne pas exposer le profil', () => {
  badgeWindow.isProfessorConnected = () => false;
  badge.renderSiteBadge('site-professor-badge', { nom: 'Autre professeur' }, 'blob:autre-photo');
  assert.equal(siteBadge.hidden, true);
  assert.equal(siteBadge.innerHTML, '');
});
