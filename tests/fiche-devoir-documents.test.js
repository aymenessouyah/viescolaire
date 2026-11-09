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
  return { seed(value) { records.set(JSON.stringify([value.owner, value.session, value.type]), value); }, open() { const req = {}; setImmediate(() => { req.result = db; if (!initialized) { initialized = true; req.onupgradeneeded(); } req.onsuccess(); }); return req; } };
}
const flush = () => new Promise(resolve => setTimeout(resolve, 20));
function setup() {
  let profile = { prof_id: 'prof-a' }, downloaded = [], locked = false, cahierRenders = 0;
  const createdUrls = [], revokedUrls = [];
  const document = { createElement(tag) { return {tag, setAttribute(name, value) { this[name] = value; }, click() { downloaded.push(this.download); }, remove() {} }; }, body: { appendChild() {} } };
  const records = new Map(); let cloudDown = false;
  const cloud = {
    async listMany(keys) {
      if (cloudDown) throw new Error('Cloud inaccessible');
      const result = Object.fromEntries(keys.map(key => [key, {}]));
      for (const [key, value] of records) {
        const [owner, session, type] = JSON.parse(key);
        if (owner === profile.prof_id && result[session]) result[session][type] = value.slice();
      }
      return result;
    },
    async upload(session, type, file, previous) {
      if (cloudDown) throw new Error('Cloud inaccessible');
      const key = JSON.stringify([profile.prof_id,session,type]), files = records.get(key) || [];
      const next = {name:file.name, blob:file.blob || file, source:'cloud', id:'doc-'+Math.random(), path:profile.prof_id+'/'+Math.random()};
      records.set(key, files.filter(f => f.id !== previous?.id).concat(next)); return next;
    },
    async remove(file) { for (const [key, files] of records) records.set(key, files.filter(f => f.id !== file.id)); },
    async download(file) { return file.blob; }
  };
  const idb = fakeIndexedDB();
  const window = { indexedDB: idb, STI_FICHE_CLOUD: cloud, activeProfessorProfile: () => profile, seanceVerrouillee: () => locked, renderCahier: () => { cahierRenders++; }, confirm: () => true, URL: { createObjectURL: blob => { const url = 'blob:test-' + createdUrls.length; createdUrls.push({url, blob}); return url; }, revokeObjectURL: url => { revokedUrls.push(url); } }, setTimeout };
  vm.runInNewContext(fs.readFileSync('assets/fiche-devoir-documents.js', 'utf8'), { window, document, setTimeout, console, Blob });
  const host = () => ({ isConnected: true, innerHTML: '', events: {}, addEventListener(name, fn) { this.events[name] = fn; } });
  const upload = (h, type, files) => h.events.change({ target: { dataset: { upload: type }, files, value: 'x' } });
  const click = (h, action, type, index) => h.events.click({ target: { closest: () => ({ dataset: { [action]: type, index: String(index) } }) } });
  const file = name => Object.assign(new Blob(['abc']), { name });
  return { api: window.STI_FICHE_DEVOIR_DOCUMENTS, host, upload, click, file, downloaded, setProfile: p => { profile = p; }, setLocked: value => { locked = value; }, getRenders: () => cahierRenders, setCloudDown: value => { cloudDown = value; }, seed: value => idb.seed(value), cloud, createdUrls, revokedUrls };
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

test('le cahier affiche uniquement les énoncés PDF des devoirs, sans retirer les autres fichiers des fiches', async () => {
  const t = setup(), cours = {cls:'3SI1', n:5, tri:1, blk:{k:'cours'}}, examen = {cls:'3SI1', n:12, tri:1, blk:{k:'dc'}};
  const h = t.host(); t.api.mount(h, cours); await flush();
  await t.upload(h, 'ressources', [t.file('cours.pdf')]);
  t.seed({owner:'id:prof-a',session:'3SI1|5',type:'enonce',files:[{name:'ancien-cours.pdf',blob:t.file('ancien-cours.pdf')}]});
  const ex = t.host(); t.api.mount(ex, examen); await flush();
  await t.upload(ex, 'enonce', [t.file('texte.docx'), t.file('sujet.pdf'), t.file('suite.PDF')]);
  await t.upload(ex, 'ressources', [t.file('annexe.pdf')]);
  await t.upload(ex, 'correction', [t.file('corrigé.pdf')]);
  assert.match(ex.innerHTML, /texte.docx/); assert.match(ex.innerHTML, /annexe.pdf/); assert.match(ex.innerHTML, /corrigé.pdf/);
  function notebook() {
    const nodes = ['3SI1|5', '3SI1|12', '4SI2|12'].map(key => ({ dataset: {cahDocs: key}, innerHTML: '' }));
    const events = {}, previews = [];
    return { isConnected:true, nodes, events, previews,
      querySelectorAll(selector) {
        if (selector === '[data-cah-docs]') return nodes;
        if (selector === '[data-cah-preview]') {
          for (const node of nodes) {
            for (const match of node.innerHTML.matchAll(/data-cah-preview data-cah-session="([^"]+)" data-index="(\d+)"/g)) {
              previews.push({dataset:{cahSession:match[1], index:match[2]}, textContent:'', append(...children){this.children=children;}});
            }
          }
          return previews;
        }
        return [];
      },
      addEventListener(name, fn) { events[name] = fn; }, removeEventListener(name) { delete events[name]; }
    };
  }
  const sessions = [cours, examen, {...examen, cls:'4SI2'}], cahier = notebook();
  t.api.mountCahier(cahier, sessions); await flush();
  assert.equal(cahier.nodes[0].innerHTML, ''); assert.equal(cahier.nodes[2].innerHTML, '');
  assert.match(cahier.nodes[1].innerHTML, /sujet.pdf/); assert.match(cahier.nodes[1].innerHTML, /suite.PDF/);
  assert.doesNotMatch(cahier.nodes[1].innerHTML, /texte.docx|annexe.pdf|corrigé.pdf/);
  assert.equal(cahier.previews.length, 2);
  assert.equal(cahier.previews[0].children[0].tag, 'iframe');
  assert.equal(cahier.previews[0].children[0].sandbox, 'allow-scripts');
  assert.equal(t.createdUrls[0].blob.type, 'application/pdf');
  await cahier.events.click({target:{closest:()=>({dataset:{cahSession:'3SI1|12', cahDownload:'enonce', index:'1'}})}});
  assert.deepEqual(t.downloaded, ['sujet.pdf']);
  await cahier.events.click({target:{closest:()=>({dataset:{cahSession:'3SI1|12', cahDownload:'correction', index:'0'}})}});
  await cahier.events.click({target:{closest:()=>({dataset:{cahSession:'3SI1|12', cahDownload:'enonce', index:'0'}})}});
  assert.deepEqual(t.downloaded, ['sujet.pdf']);
  t.setProfile({prof_id:'prof-b'});
  await cahier.events.click({target:{closest:()=>({dataset:{cahSession:'3SI1|12', cahDownload:'enonce', index:'1'}})}});
  assert.deepEqual(t.downloaded, ['sujet.pdf']);
  t.api.unmountCahier(cahier);
  assert.deepEqual(t.revokedUrls, t.createdUrls.slice(0,2).map(item=>item.url));
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

test('les anciens fichiers locaux restent téléchargeables et peuvent être transférés sans écraser le Cloud', async () => {
  const t = setup(), session = {cls:'3SI1', n:5, tri:1, blk:{k:'cours'}};
  t.seed({owner:'id:prof-a', session:'3SI1|5', type:'ressources', files:[{name:'ancien.pdf',blob:t.file('ancien.pdf')},{name:'doublon.pdf',blob:t.file('doublon.pdf')}]});
  const h = t.host(); t.api.mount(h, session); await flush();
  await t.upload(h, 'ressources', [t.file('doublon.pdf')]);
  assert.match(h.innerHTML, /ancien.pdf/); assert.match(h.innerHTML, /local uniquement/);
  await h.events.click({target:{closest:()=>({hasAttribute: name => name === 'data-migrate', dataset:{}})}});
  assert.match(h.innerHTML, /1 fichier\(s\) envoyé\(s\)/); assert.match(h.innerHTML, /1 ignoré/);
  assert.equal((h.innerHTML.match(/aria-label="Télécharger ancien.pdf"/g) || []).length, 2);
  const reload = t.host(); t.api.mount(reload, session); await flush();
  assert.match(reload.innerHTML, /ancien.pdf/); assert.match(reload.innerHTML, /local uniquement/);
});

test('une panne Cloud est signalée et ne fait pas disparaître les fichiers locaux', async () => {
  const t = setup(), h = t.host();
  t.seed({owner:'id:prof-a',session:'3SI1|5',type:'ressources',files:[{name:'ancien.pdf',blob:t.file('ancien.pdf')}]});
  t.setCloudDown(true); t.api.mount(h,{cls:'3SI1',n:5,blk:{k:'cours'}}); await flush();
  assert.match(h.innerHTML, /Cloud inaccessible/); assert.match(h.innerHTML, /ancien.pdf/);
  assert.match(h.innerHTML, /data-upload="ressources" multiple disabled/);
  await t.click(h,'download','ressources',0); assert.deepEqual(t.downloaded,['ancien.pdf']);
});

test('un énoncé PDF local est affiché ; une fermeture pendant le chargement Cloud ne crée pas de lien périmé', async () => {
  const t = setup(), session = {cls:'4SI2', n:9, tri:1, blk:{k:'ds'}};
  t.seed({owner:'id:prof-a',session:'4SI2|9',type:'enonce',files:[{name:'local.PDF',blob:t.file('local.PDF')}]});
  const fiche = t.host(); t.api.mount(fiche, session); await flush();
  await t.upload(fiche, 'enonce', [t.file('cloud.pdf')]);
  let resolveDownload;
  t.cloud.download = () => new Promise(resolve => { resolveDownload = resolve; });
  const node = {dataset:{cahDocs:'4SI2|9'},innerHTML:''}, targets = [];
  const cahier = {isConnected:true, events:{},
    querySelectorAll(selector) {
      if (selector === '[data-cah-docs]') return [node];
      for (const m of node.innerHTML.matchAll(/data-cah-preview data-cah-session="([^"]+)" data-index="(\d+)"/g))
        targets.push({dataset:{cahSession:m[1],index:m[2]},textContent:'',append(...items){this.children=items;}});
      return targets;
    }, addEventListener(name,fn){this.events[name]=fn;}, removeEventListener(name){delete this.events[name];}
  };
  t.api.mountCahier(cahier,[session]); await flush();
  assert.match(node.innerHTML, /local.PDF/); assert.match(node.innerHTML, /local uniquement/);
  assert.match(node.innerHTML, /cloud.pdf/); assert.equal(t.createdUrls.length,1);
  assert.equal(targets[1].children[0].tag,'iframe');
  t.api.unmountCahier(cahier);
  resolveDownload(t.file('cloud.pdf')); await flush();
  assert.equal(t.createdUrls.length,1); assert.deepEqual(t.revokedUrls,[t.createdUrls[0].url]);
});

test('l’ouverture ciblée gère seulement la catégorie choisie et notifie les changements', async () => {
  const t = setup(), session = {cls:'4SI2', n:16, tri:1, blk:{k:'dc'}}, h = t.host();
  let changes = 0;
  t.api.mount(h, session, {onlyType:'correction', onChange:()=>changes++}); await flush();
  assert.match(h.innerHTML, /data-upload="correction"/);
  assert.doesNotMatch(h.innerHTML, /data-upload="enonce"|data-upload="ressources"/);
  await t.upload(h, 'enonce', [t.file('refus.pdf')]);
  assert.equal(changes,0);
  await t.upload(h, 'correction', [t.file('corrige.pdf')]);
  assert.equal(changes,1); assert.match(h.innerHTML,/corrige.pdf/);
  let status = await t.api.statusForSessions([session]);
  assert.equal(status.data['4SI2|16'].correction.length,1);
  assert.equal(status.data['4SI2|16'].enonce.length,0);
  await t.click(h, 'remove','correction',0);
  assert.equal(changes,2);
  status = await t.api.statusForSessions([session]);
  assert.equal(status.data['4SI2|16'].correction.length,0);
});

test('les statuts distinguent les fichiers locaux du Cloud indisponible', async () => {
  const t = setup(), session = {cls:'4SI2',n:16,blk:{k:'dc'}};
  t.seed({owner:'id:prof-a',session:'4SI2|16',type:'enonce',files:[{name:'local.pdf',blob:t.file('local.pdf')}]});
  t.setCloudDown(true);
  const status = await t.api.statusForSessions([session]);
  assert.match(status.cloudError,/inaccessible/);
  assert.equal(status.data['4SI2|16'].enonce[0].source,'local');
  assert.equal(status.data['4SI2|16'].correction.length,0);
});
