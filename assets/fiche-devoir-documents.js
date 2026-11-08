/* Pièces jointes locales d'une séance d'évaluation. Les originaux restent nécessaires. */
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
async function read(who, session) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly'), store = tx.objectStore(STORE), result = {};
    Object.keys(TYPES).forEach(type => { const req = store.get([who, session, type]); req.onsuccess = () => { result[type] = req.result?.files || []; }; });
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Lecture impossible.')); };
  });
}
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
  if (!host || !isDevoir(session)) return;
  const who = owner(), key = session.cls + '|' + session.n;
  let data = {}, error = '', working = false;
  function stillCurrent() { return host.isConnected && owner() === who; }
  function draw() {
    if (!stillCurrent()) return;
    host.innerHTML = `<section class="devoir-docs no-print" aria-label="Documents du devoir"><h3>Documents du devoir</h3><p class="mini-note">Fichiers locaux à cet appareil, non chiffrés, non synchronisés et non inclus dans les sauvegardes Cloud ou Drive. Conservez vos originaux ailleurs. Ne joignez pas de copies d’élèves.</p>${!who ? '<p role="alert">Connectez votre profil professeur pour gérer les documents.</p>' : ''}${error ? `<p role="alert">${esc(error)}</p>` : ''}${Object.entries(TYPES).filter(([type]) => !(options.classMode && type === 'correction')).map(([type, label]) => `<div class="devoir-docs-group"><strong>${label}</strong>${(data[type] || []).length ? (data[type] || []).map((file, i) => `<div class="devoir-docs-file"><span>${esc(file.name)}</span><button type="button" class="btn btn-xs btn-line" data-download="${type}" data-index="${i}" ${working ? 'disabled' : ''}>Télécharger ${label.toLowerCase()}</button><button type="button" class="btn btn-xs btn-line" data-remove="${type}" data-index="${i}" ${working ? 'disabled' : ''} aria-label="Retirer ${esc(file.name)}">Retirer</button></div>`).join('') : `<p class="mini-note">${label} : aucun fichier disponible.</p>`}<label class="devoir-docs-add">Ajouter ${label.toLowerCase()} <input type="file" data-upload="${type}" ${type === 'ressources' ? 'multiple' : ''} ${!who || working ? 'disabled' : ''}></label></div>`).join('')}</section>`;
  }
  async function refresh() {
    try { data = await read(who, key); } catch (e) { error = e.message || 'Lecture impossible.'; }
    draw();
  }
  host.addEventListener('change', async event => {
    const input = event.target, type = input.dataset.upload;
    if (!type || !who || !stillCurrent()) return;
    const files = Array.from(input.files || []); input.value = '';
    if (!files.length) return;
    if (files.some(file => !file.size || file.size > MAX_FILE)) { error = 'Chaque fichier doit être non vide et ne pas dépasser 10 Mo.'; draw(); return; }
    working = true; error = ''; draw();
    try {
      await update(who, key, type, previous => {
        const additions = files.map(file => ({name: file.name, blob: file}));
        if (type !== 'ressources') return additions.slice(0, 1);
        const names = new Set(additions.map(file => file.name));
        return previous.filter(file => !names.has(file.name)).concat(additions);
      });
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
    if (!root.confirm('Retirer « ' + file.name + ' » de cette fiche ?')) return;
    working = true; error = ''; draw();
    try { await update(who, key, type, files => files.filter((_, i) => i !== index)); await refresh(); }
    catch (e) { error = e.message || 'Suppression impossible.'; }
    working = false; draw();
  });
  draw(); if (who) refresh();
}
root.STI_FICHE_DEVOIR_DOCUMENTS = { isDevoir, mount };
})(typeof window !== 'undefined' ? window : globalThis);
