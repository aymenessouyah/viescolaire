/* Pièces jointes locales des séances, partagées par la fiche et le cahier de textes. */
(function (root) {
'use strict';
const DB = 'sti_fiche_devoir_documents_v1', STORE = 'documents', MAX_FILE = 10 * 1024 * 1024;
const TYPES = { enonce: 'Énoncé', ressources: 'Ressources', correction: 'Correction' };
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function isDevoir(session) { return ['dc', 'ds'].includes(session?.blk?.k); }
function owner() {
  const p = typeof root.activeProfessorProfile === 'function' ? root.activeProfessorProfile() : null;
  if (!p) return '';
  return p.prof_id ? 'id:' + p.prof_id : p.email ? 'email:' + String(p.email).trim().toLowerCase() : '';
}
function openDb() {
  return new Promise((resolve, reject) => {
    if (!root.indexedDB) return reject(new Error('Stockage local indisponible.'));
    const req = root.indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: ['owner', 'session', 'type'] });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Ouverture du stockage impossible.'));
    req.onblocked = () => reject(new Error('Stockage bloqué : fermez les autres onglets et réessayez.'));
  });
}
async function readMany(who, sessions) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly'), store = tx.objectStore(STORE), result = {};
    sessions.forEach(session => {
      result[session] = {};
      Object.keys(TYPES).forEach(type => {
        const req = store.get([who, session, type]);
        req.onsuccess = () => { result[session][type] = req.result?.files || []; };
      });
    });
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Lecture impossible.')); };
  });
}
async function read(who, session) { return (await readMany(who, [session]))[session]; }
async function update(who, session, type, transform) {
  if (!who || !session || !TYPES[type]) throw new Error('Séance ou compte invalide.');
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite'), store = tx.objectStore(STORE), req = store.get([who, session, type]);
    let failure;
    req.onsuccess = () => {
      try { store.put({owner: who, session, type, files: transform(req.result?.files || [])}); }
      catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = tx.onabort = () => { db.close(); reject(failure || tx.error || new Error('Enregistrement impossible.')); };
  });
}
function download(file) {
  const url = root.URL.createObjectURL(file.blob), a = document.createElement('a');
  a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  root.setTimeout(() => root.URL.revokeObjectURL(url), 2000);
}
function mount(host, session, options = {}) {
  if (!host || !session || !session.cls || !session.n) return;
  const who = owner(), key = session.cls + '|' + session.n;
  let data = {}, error = '', working = !!who;
  function stillCurrent() { return host.isConnected && owner() === who; }
  function locked() { return typeof root.seanceVerrouillee === 'function' && !!root.seanceVerrouillee(session); }
  function draw() {
    if (!stillCurrent()) return;
    host.innerHTML = `<section class="devoir-docs no-print" aria-label="Documents de la séance"><h3>${isDevoir(session) ? 'Documents du devoir' : 'Documents de la séance'}</h3><p class="mini-note">Fichiers locaux à cet appareil, non chiffrés, non synchronisés et non inclus dans les sauvegardes Cloud ou Drive ni dans les exports du cahier. Conservez vos originaux ailleurs. Ne joignez pas de copies d’élèves. Dans chaque catégorie, un fichier portant le même nom remplace le précédent.</p>${!who ? '<p role="alert">Connectez votre profil professeur pour gérer les documents.</p>' : ''}${error ? `<p role="alert">${esc(error)}</p>` : ''}${locked() ? '<p class="mini-note">Trimestre verrouillé : les documents sont en lecture seule.</p>' : ''}${Object.entries(TYPES).filter(([type]) => !(options.classMode && type === 'correction') && (isDevoir(session) || type === 'ressources' || (data[type] || []).length)).map(([type, label]) => `<div class="devoir-docs-group"><strong>${label}</strong>${(data[type] || []).length ? (data[type] || []).map((file, i) => `<div class="devoir-docs-file"><span>${esc(file.name)}</span><button type="button" class="btn btn-xs btn-line" data-download="${type}" data-index="${i}" aria-label="Télécharger ${esc(file.name)}" ${working ? 'disabled' : ''}>Télécharger ${label.toLowerCase()}</button><button type="button" class="btn btn-xs btn-line" data-remove="${type}" data-index="${i}" ${working || locked() ? 'disabled' : ''} aria-label="Retirer ${esc(file.name)}">Retirer</button></div>`).join('') : `<p class="mini-note">${label} : aucun fichier disponible.</p>`}<label class="devoir-docs-add">Joindre des fichiers — ${label.toLowerCase()} <input type="file" data-upload="${type}" multiple ${!who || working || locked() ? 'disabled' : ''}></label></div>`).join('')}</section>`;
  }
  async function refresh() {
    try { data = await read(who, key); } catch (e) { error = e.message || 'Lecture impossible.'; }
    draw();
  }
  host.addEventListener('change', async event => {
    const input = event.target, type = input.dataset.upload;
    if (!type || !who || !stillCurrent() || locked() || working) return;
    const files = Array.from(input.files || []); input.value = '';
    if (!files.length) return;
    if (files.some(file => !file.size || file.size > MAX_FILE)) { error = 'Chaque fichier doit être non vide et ne pas dépasser 10 Mo.'; draw(); return; }
    working = true; error = ''; draw();
    try {
      await update(who, key, type, previous => {
        if (!stillCurrent() || locked()) throw new Error('Séance indisponible ou trimestre verrouillé.');
        const additions = Array.from(new Map(files.map(file => [file.name, {name: file.name, blob: file}])).values());
        const names = new Set(additions.map(file => file.name));
        return previous.filter(file => !names.has(file.name)).concat(additions);
      });
      if (typeof root.renderCahier === 'function') root.renderCahier();
      root.STI_INTERFACE?.refreshFiche?.();
      await refresh();
    } catch (e) { error = e.message || 'Enregistrement impossible.'; }
    working = false; draw();
  });
  host.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button || !stillCurrent() || working) return;
    const type = button.dataset.download || button.dataset.remove, index = Number(button.dataset.index);
    const file = data[type]?.[index]; if (!file) return;
    if (button.dataset.download) { download(file); return; }
    if (locked()) { error = 'Trimestre verrouillé : les documents sont en lecture seule.'; draw(); return; }
    if (!root.confirm('Retirer « ' + file.name + ' » de cette fiche ?')) return;
    if (!stillCurrent() || locked()) return;
    working = true; error = ''; draw();
    try { await update(who, key, type, files => {
      if (!stillCurrent() || locked()) throw new Error('Séance indisponible ou trimestre verrouillé.');
      return files.filter((_, i) => i !== index);
    });
    if (typeof root.renderCahier === 'function') root.renderCahier();
    root.STI_INTERFACE?.refreshFiche?.();
    await refresh(); }
    catch (e) { error = e.message || 'Suppression impossible.'; }
    working = false; draw();
  });
  draw(); if (who) refresh().finally(() => { working = false; draw(); });
}
/* Les deux écrans lisent les mêmes fichiers, sans copier ni envoyer les blobs au Cloud. */
function mountCahier(host, sessions) {
  if (!host) return;
  const who = owner();
  if (!who || !sessions.length) return;
  const valid = new Set(sessions.map(s => s.cls + '|' + s.n));
  const nodes = Array.from(host.querySelectorAll('[data-cah-docs]'));
  let records = {};
  function stillCurrent() { return host.isConnected && owner() === who; }
  host.addEventListener('click', event => {
    const button = event.target.closest('[data-cah-download]');
    if (!button || !stillCurrent()) return;
    const session = button.dataset.cahSession, type = button.dataset.cahDownload;
    if (!valid.has(session)) return;
    const file = records[session]?.[type]?.[Number(button.dataset.index)];
    if (file) download(file);
  });
  readMany(who, Array.from(valid)).then(result => {
    if (!stillCurrent()) return;
    records = result;
    nodes.forEach(node => {
      const key = node.dataset.cahDocs;
      if (!valid.has(key)) return;
      const files = records[key] || {};
      const entries = Object.entries(TYPES).flatMap(([type, label]) => (files[type] || []).map((file, i) =>
        `<li><span>${esc(label)} : ${esc(file.name)}</span> <button type="button" class="btn btn-xs btn-line" data-cah-download="${type}" data-cah-session="${esc(key)}" data-index="${i}" aria-label="Télécharger ${esc(file.name)}">Télécharger</button></li>`));
      if (entries.length) node.innerHTML = `<div class="cah-documents no-print"><strong>Documents joints à la séance</strong><div class="tiny muted">Fichiers locaux à cet appareil, non inclus dans les sauvegardes ni les exports du cahier.</div><ul>${entries.join('')}</ul></div>`;
    });
  }).catch(error => {
    if (!stillCurrent()) return;
    const notice = document.createElement('p');
    notice.className = 'tiny no-print'; notice.setAttribute('role', 'alert');
    notice.textContent = 'Impossible de charger les documents locaux du cahier : ' + (error.message || 'erreur de stockage.');
    host.prepend(notice);
  });
}
root.STI_FICHE_DEVOIR_DOCUMENTS = { isDevoir, mount, mountCahier };
})(typeof window !== 'undefined' ? window : globalThis);
