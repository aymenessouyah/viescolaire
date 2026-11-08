const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fakeIndexedDB() {
  const records = new Map(); let initialized = false;
  const db = {
    createObjectStore() {}, close() {},
    transaction() {
      let pending = 0;
      const tx = { error: null, objectStore() { return {
        get(key) {
          const req = {}; pending++;
          setImmediate(() => {
            req.result = records.get(JSON.stringify(key)); req.onsuccess?.(); pending--;
            if (!pending) setImmediate(() => tx.oncomplete?.());
          });
          return req;
        },
        put(value) { records.set(JSON.stringify([value.owner, value.session, value.type]), structuredClone(value)); }
      }; }, abort() { setImmediate(() => tx.onabort?.()); } };
      return tx;
    }
  };
  return { open() { const req = {}; setImmediate(() => { req.result = db; if (!initialized) { initialized = true; req.onupgradeneeded(); } req.onsuccess(); }); return req; } };
}
const flush = () => new Promise(resolve => setTimeout(resolve, 20));
function setup() {
  let profile = { prof_id: 'prof-a' }, downloaded = [], locked = false, cahierRenders = 0;
  const document = { createElement() { return { click() { downloaded.push(this.download); }, remove() {} }; }, body: { appendChild() {} } };
  const window = { indexedDB: fakeIndexedDB(), activeProfessorProfile: () => profile, seanceVerrouillee: () => locked, renderCahier: () => { cahierRenders++; }, confirm: () => true, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} }, setTimeout };
  vm.runInNewContext(fs.readFileSync('assets/fiche-devoir-documents.js', 'utf8'), { window, document, setTimeout, console });
  const host = () => ({ isConnected: true, innerHTML: '', events: {}, addEventListener(name, fn) { this.events[name] = fn; } });
  const upload = (h, type, files) => h.events.change({ target: { dataset: { upload: type }, files, value: 'x' } });
  const click = (h, action, type, index) => h.events.click({ target: { closest: () => ({ dataset: { [action]: type, index: String(index) } }) } });
  const file = name => Object.assign(new Blob(['abc']), { name });
  return { api: window.STI_FICHE_DEVOIR_DOCUMENTS, host, upload, click, file, downloaded, setProfile: p => { profile = p; }, setLocked: value => { locked = value; }, getRenders: () => cahierRenders };
}

test('affiche uniquement les évaluations du planning', () => {
  const { api } = setup();
  assert.equal(api.isDevoir({ blk: { k: 'dc' } }), true);
  assert.equal(api.isDevoir({ blk: { k: 'ds' } }), true);
  assert.equal(api.isDevoir({ blk: { k: 'corr' } }), false);
  assert.equal(api.isDevoir({ blk: { k: 'cours' } }), false);
});

test('ajout, téléchargement, remplacement, suppression et isolation par séance et professeur', async () => {
  const t = setup(), session = {cls: '3SI1', n: 12, blk: {k: 'dc'}}, h = t.host();
  t.api.mount(h, session); await flush();
  assert.match(h.innerHTML, /aucun fichier disponible/);
  await t.upload(h, 'enonce', [t.file('sujet.pdf')]);
  await t.upload(h, 'ressources', [t.file('fichier.zip'), t.file('image.png')]);
  await t.upload(h, 'correction', [t.file('corrige.pdf')]);
  assert.match(h.innerHTML, /sujet.pdf/); assert.match(h.innerHTML, /fichier.zip/); assert.match(h.innerHTML, /corrige.pdf/);
  await t.click(h, 'download', 'enonce', 0); assert.deepEqual(t.downloaded, ['sujet.pdf']);
  await t.upload(h, 'enonce', [t.file('nouveau.pdf')]); assert.match(h.innerHTML, /sujet.pdf/); assert.match(h.innerHTML, /nouveau.pdf/);
  await t.click(h, 'remove', 'ressources', 0); assert.doesNotMatch(h.innerHTML, /fichier.zip/); assert.match(h.innerHTML, /image.png/);
  const other = t.host(); t.api.mount(other, {...session, n: 13}); await flush(); assert.doesNotMatch(other.innerHTML, /nouveau.pdf/);
  t.setProfile({prof_id: 'prof-b'}); const otherOwner = t.host(); t.api.mount(otherOwner, session); await flush(); assert.doesNotMatch(otherOwner.innerHTML, /nouveau.pdf/);
  t.setProfile({prof_id: 'prof-a'}); const reload = t.host(); t.api.mount(reload, session, {classMode: true}); await flush();
  assert.match(reload.innerHTML, /nouveau.pdf/); assert.doesNotMatch(reload.innerHTML, /corrige.pdf|Correction/);
});


test('plusieurs fichiers par catégorie sont conservés, téléchargeables et remplaçables par nom', async () => {
  const t = setup(), session = {cls: '4SI2', n: 48, blk: {k: 'ds'}}, h = t.host();
  t.api.mount(h, session); await flush();
  for (const type of ['enonce', 'ressources', 'correction']) {
    assert.match(h.innerHTML, new RegExp(`data-upload="${type}" multiple`));
    await t.upload(h, type, [t.file(`${type}-1.pdf`), t.file(`${type}-2.pdf`)]);
    await t.upload(h, type, [t.file(`${type}-3.pdf`)]);
    for (const n of [1, 2, 3]) assert.match(h.innerHTML, new RegExp(`${type}-${n}\\.pdf`));
    await t.click(h, 'download', type, 0);
    await t.click(h, 'download', type, 1);
    await t.click(h, 'download', type, 2);
    await t.upload(h, type, [t.file(`${type}-1.pdf`)]);
    assert.equal((h.innerHTML.match(new RegExp(`aria-label="Télécharger ${type}-1\\.pdf"`, 'g')) || []).length, 1);
  }
  assert.deepEqual(t.downloaded, ['enonce-1.pdf', 'enonce-2.pdf', 'enonce-3.pdf', 'ressources-1.pdf', 'ressources-2.pdf', 'ressources-3.pdf', 'correction-1.pdf', 'correction-2.pdf', 'correction-3.pdf']);
  const reload = t.host(); t.api.mount(reload, session); await flush();
  for (const type of ['enonce', 'ressources', 'correction']) for (const n of [1, 2, 3]) assert.match(reload.innerHTML, new RegExp(`${type}-${n}\\.pdf`));
  await t.click(reload, 'remove', 'correction', 0);
  assert.doesNotMatch(reload.innerHTML, /correction-2\.pdf/);
  assert.match(reload.innerHTML, /correction-1\.pdf/);
  assert.match(reload.innerHTML, /correction-3\.pdf/);
});

test('refuse les fichiers vides ou trop volumineux sans remplacer les fichiers enregistrés', async () => {
  const t = setup(), h = t.host(); t.api.mount(h, {cls:'4SI2', n:12, blk:{k:'dc'}}); await flush();
  await t.upload(h, 'enonce', [t.file('original.pdf')]);
  await t.upload(h, 'enonce', [{name:'vide.pdf', size:0}]);
  assert.match(h.innerHTML, /non vide/); assert.match(h.innerHTML, /original.pdf/);
  await t.upload(h, 'enonce', [{name:'grand.pdf', size:10 * 1024 * 1024 + 1}]);
  assert.match(h.innerHTML, /10 Mo/); assert.match(h.innerHTML, /original.pdf/);
});

test('les pièces de toute séance sont partagées avec le cahier et isolées par classe et professeur', async () => {
  const t = setup(), cours = {cls:'3SI1', n:5, tri:1, blk:{k:'cours'}}, examen = {cls:'3SI1', n:12, tri:1, blk:{k:'dc'}};
  const h = t.host(); t.api.mount(h, cours); await flush();
  assert.match(h.innerHTML, /Documents de la séance/);
  assert.match(h.innerHTML, /data-upload="ressources" multiple/);
  assert.doesNotMatch(h.innerHTML, /data-upload="enonce"/);
  await t.upload(h, 'ressources', [t.file('cours.pdf'), t.file('exercice.zip')]);
  assert.equal(t.getRenders(), 1);
  const ex = t.host(); t.api.mount(ex, examen); await flush();
  await t.upload(ex, 'enonce', [t.file('sujet.pdf')]);
  await t.upload(ex, 'correction', [t.file('corrigé.pdf')]);
  assert.equal(t.getRenders(), 3);
  function notebook() {
    const nodes = ['3SI1|5', '3SI1|12', '4SI2|5'].map(key => ({ dataset: {cahDocs: key}, innerHTML: '' }));
    return { isConnected:true, nodes, events:{}, querySelectorAll() { return nodes; }, addEventListener(name, fn) { this.events[name] = fn; } };
  }
  const sessions = [cours, examen, {...cours, cls:'4SI2'}], cahier = notebook();
  t.api.mountCahier(cahier, sessions); await flush();
  assert.match(cahier.nodes[0].innerHTML, /cours.pdf/); assert.match(cahier.nodes[0].innerHTML, /exercice.zip/);
  assert.doesNotMatch(cahier.nodes[0].innerHTML, /sujet.pdf/);
  assert.match(cahier.nodes[1].innerHTML, /sujet.pdf/); assert.match(cahier.nodes[1].innerHTML, /corrigé.pdf/);
  assert.equal(cahier.nodes[2].innerHTML, '');
  cahier.events.click({ target: { closest: () => ({dataset:{cahSession:'3SI1|5', cahDownload:'ressources', index:'0'}}) } });
  cahier.events.click({ target: { closest: () => ({dataset:{cahSession:'3SI1|12', cahDownload:'correction', index:'0'}}) } });
  assert.deepEqual(t.downloaded, ['cours.pdf', 'corrigé.pdf']);
  await t.click(h, 'remove', 'ressources', 0); assert.equal(t.getRenders(), 4);
  const after = notebook(); t.api.mountCahier(after, sessions); await flush();
  assert.doesNotMatch(after.nodes[0].innerHTML, /cours.pdf/); assert.match(after.nodes[0].innerHTML, /exercice.zip/);
  t.setProfile({prof_id:'prof-b'});
  cahier.events.click({ target: { closest: () => ({dataset:{cahSession:'3SI1|5', cahDownload:'ressources', index:'0'}}) } });
  assert.deepEqual(t.downloaded, ['cours.pdf', 'corrigé.pdf']);
  const other = notebook(); t.api.mountCahier(other, sessions); await flush();
  assert.ok(other.nodes.every(node => node.innerHTML === ''));
});

test('un trimestre verrouillé laisse les documents accessibles en lecture seule', async () => {
  const t = setup(), h = t.host(), session = {cls:'3SI1', n:5, tri:1, blk:{k:'cours'}};
  t.api.mount(h, session); await flush(); await t.upload(h, 'ressources', [t.file('cours.pdf')]);
  t.setLocked(true);
  await t.upload(h, 'ressources', [t.file('interdit.pdf')]);
  await t.click(h, 'remove', 'ressources', 0);
  assert.match(h.innerHTML, /lecture seule/); assert.match(h.innerHTML, /cours.pdf/);
  await t.click(h, 'download', 'ressources', 0); assert.deepEqual(t.downloaded, ['cours.pdf']);
  t.setLocked(false);
  const reload = t.host(); t.api.mount(reload, session); await flush();
  assert.match(reload.innerHTML, /cours.pdf/); assert.doesNotMatch(reload.innerHTML, /interdit.pdf/);
});

test('les fiches et le cahier utilisent la même séance et les mêmes documents', () => {
  const ui = fs.readFileSync('assets/interface-reference.js','utf8');
  const app = fs.readFileSync('assets/app.js','utf8');
  const form = fs.readFileSync('assets/fiches.js','utf8');
  assert.match(ui, /<div id="ref-devoir-documents"><\/div>/);
  assert.match(ui, /STI_FICHE_DEVOIR_DOCUMENTS.mount\(el\('ref-devoir-documents'\),s/);
  assert.match(form, /STI_FICHE_DEVOIR_DOCUMENTS.mount\(document.getElementById\('ffm-documents'\), session/);
  assert.match(app, /data-cah-docs=/);
  assert.match(app, /STI_FICHE_DEVOIR_DOCUMENTS.mountCahier\(box.querySelector\('#cah-semaines'\),list\)/);
});
