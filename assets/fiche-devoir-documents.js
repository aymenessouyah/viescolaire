/* Documents de séance partagés entre fiche et cahier, avec reprise des anciens fichiers locaux. */
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
async function readLocalMany(who, sessions) {
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
async function load(who, keys) {
  const localPromise = readLocalMany(who, keys);
  const cloudPromise = root.STI_FICHE_CLOUD ? root.STI_FICHE_CLOUD.listMany(keys) : Promise.reject(new Error('Module Cloud indisponible.'));
  const [local, cloud] = await Promise.allSettled([localPromise, cloudPromise]);
  const data = {};
  keys.forEach(key => {
    data[key] = {};
    Object.keys(TYPES).forEach(type => {
      const l = local.status === 'fulfilled' ? (local.value[key]?.[type] || []).map(file => Object.assign({}, file, {source:'local'})) : [];
      const c = cloud.status === 'fulfilled' ? (cloud.value[key]?.[type] || []) : [];
      data[key][type] = c.concat(l);
    });
  });
  return {data, cloudError:cloud.status === 'rejected' ? cloud.reason.message : '', localError:local.status === 'rejected' ? local.reason.message : ''};
}
async function download(file) {
  const blob = file.source === 'local' ? file.blob : await root.STI_FICHE_CLOUD.download(file);
  const url = root.URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  root.setTimeout(() => root.URL.revokeObjectURL(url), 2000);
}
function mount(host, session, options = {}) {
  if (!host || !session || !session.cls || !session.n) return;
  const who = owner(), key = session.cls + '|' + session.n;
  let data = {}, cloudError = '', localError = '', error = '', notice = '', working = !!who;
  function stillCurrent() { return host.isConnected && owner() === who; }
  function locked() { return typeof root.seanceVerrouillee === 'function' && !!root.seanceVerrouillee(session); }
  function draw() {
    if (!stillCurrent()) return;
    const localCount = Object.values(data).reduce((n, files) => n + files.filter(f => f.source === 'local').length, 0);
    host.innerHTML = `<section class="devoir-docs no-print" aria-label="Documents de la séance"><h3>${isDevoir(session) ? 'Documents du devoir' : 'Documents de la séance'}</h3><p class="mini-note">Les nouveaux fichiers sont enregistrés dans votre Cloud privé et accessibles sur vos appareils connectés. Connexion Internet requise, 10 Mo par fichier. Les pièces jointes ne sont pas incluses dans les exports du cahier ou les sauvegardes Drive. Ne joignez pas de copies d’élèves.</p>${!who ? '<p role="alert">Connectez votre profil professeur pour gérer les documents.</p>' : ''}${cloudError ? `<p role="alert">Cloud : ${esc(cloudError)} <button type="button" class="btn btn-xs btn-line" data-retry>Réessayer</button></p>` : ''}${localError ? `<p role="alert">Anciens fichiers locaux : ${esc(localError)}</p>` : ''}${error ? `<p role="alert">${esc(error)}</p>` : ''}${notice ? `<p role="status">${esc(notice)}</p>` : ''}${locked() ? '<p class="mini-note">Trimestre verrouillé : les documents sont en lecture seule.</p>' : ''}${localCount ? `<p class="mini-note">${localCount} ancien(s) fichier(s) restent sur cet appareil. Envoyez-les vers le Cloud depuis cet appareil ; les fichiers locaux sont conservés et les noms déjà présents dans le Cloud ne sont pas écrasés.</p><button type="button" class="btn btn-xs btn-line" data-migrate ${working || locked() || cloudError ? 'disabled' : ''}>Envoyer les fichiers locaux de cette séance vers le Cloud</button>` : ''}${Object.entries(TYPES).filter(([type]) => !(options.classMode && type === 'correction') && (isDevoir(session) || type === 'ressources' || (data[type] || []).length)).map(([type, label]) => `<div class="devoir-docs-group"><strong>${label}</strong>${(data[type] || []).length ? (data[type] || []).map((file, i) => `<div class="devoir-docs-file"><span>${esc(file.name)} <small>(${file.source === 'local' ? 'local uniquement' : 'Cloud'})</small></span><button type="button" class="btn btn-xs btn-line" data-download="${type}" data-index="${i}" aria-label="Télécharger ${esc(file.name)}" ${working ? 'disabled' : ''}>Télécharger ${label.toLowerCase()}</button><button type="button" class="btn btn-xs btn-line" data-remove="${type}" data-index="${i}" ${working || locked() || (cloudError && file.source !== 'local') ? 'disabled' : ''} aria-label="Retirer ${esc(file.name)}">Retirer</button></div>`).join('') : `<p class="mini-note">${cloudError ? 'Disponibilité Cloud inconnue.' : label + ' : aucun fichier disponible.'}</p>`}<label class="devoir-docs-add">Joindre des fichiers — ${label.toLowerCase()} <input type="file" data-upload="${type}" multiple ${!who || working || locked() || cloudError ? 'disabled' : ''}></label></div>`).join('')}</section>`;
  }
  async function refresh() {
    const result = await load(who, [key]);
    if (!stillCurrent()) return;
    data = result.data[key]; cloudError = result.cloudError; localError = result.localError; draw();
  }
  function updateViews() {
    if (typeof root.renderCahier === 'function') root.renderCahier();
    root.STI_INTERFACE?.refreshFiche?.();
  }
  host.addEventListener('change', async event => {
    const input = event.target, type = input.dataset.upload;
    if (!type || !who || !stillCurrent() || locked() || working || cloudError) return;
    const files = Array.from(input.files || []); input.value = '';
    if (!files.length) return;
    if (files.some(file => !file.size || file.size > MAX_FILE || !file.name || file.name.length > 255)) { error = 'Chaque fichier doit être non vide, ne pas dépasser 10 Mo et avoir un nom de 255 caractères au maximum.'; draw(); return; }
    working = true; error = ''; notice = ''; draw();
    let completed = 0;
    try {
      const additions = Array.from(new Map(files.map(file => [file.name, file])).values());
      for (const file of additions) {
        if (!stillCurrent() || locked()) throw new Error('Séance indisponible ou trimestre verrouillé.');
        const previous = (data[type] || []).find(item => item.source === 'cloud' && item.name === file.name);
        await root.STI_FICHE_CLOUD.upload(key, type, file, previous || null, () => stillCurrent() && !locked()); completed++;
      }
      notice = `${completed} fichier(s) enregistré(s) dans le Cloud.`;
    } catch (e) { error = `${completed} fichier(s) envoyé(s). ${e.message || 'Envoi impossible.'}`; }
    await refresh(); working = false; draw();
    if (completed) { if (typeof root.renderCahier === 'function') root.renderCahier(); if (!error) root.STI_INTERFACE?.refreshFiche?.(); }
  });
  host.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button || !stillCurrent() || working) return;
    if (button.hasAttribute?.('data-retry')) { working = true; error = ''; draw(); await refresh(); working = false; draw(); return; }
    if (button.hasAttribute?.('data-migrate')) {
      if (locked() || cloudError) return;
      working = true; error = ''; notice = ''; draw(); let sent = 0, skipped = 0;
      try {
        for (const type of Object.keys(TYPES)) for (const file of (data[type] || []).filter(f => f.source === 'local')) {
          if (options.classMode && type === 'correction') { skipped++; continue; }
          if (!stillCurrent() || locked()) throw new Error('Séance indisponible ou trimestre verrouillé.');
          if ((data[type] || []).some(f => f.source === 'cloud' && f.name === file.name)) { skipped++; continue; }
          await root.STI_FICHE_CLOUD.upload(key, type, {name:file.name, size:file.blob.size, blob:file.blob}, null, () => stillCurrent() && !locked()); sent++;
        }
        notice = `${sent} fichier(s) envoyé(s) ; ${skipped} ignoré(s) (déjà présents ou masqués). Les originaux locaux sont conservés.`;
      } catch (e) { error = `${sent} fichier(s) envoyé(s). ${e.message || 'Transfert interrompu.'} Les fichiers locaux sont conservés.`; }
      await refresh(); working = false; draw();
      if (sent && typeof root.renderCahier === 'function') root.renderCahier();
      return;
    }
    const type = button.dataset.download || button.dataset.remove, index = Number(button.dataset.index);
    const file = data[type]?.[index]; if (!file) return;
    if (button.dataset.download) {
      working = true; error = ''; draw();
      try { await download(file); } catch (e) { error = e.message || 'Téléchargement impossible.'; }
      working = false; draw(); return;
    }
    if (locked()) { error = 'Trimestre verrouillé : les documents sont en lecture seule.'; draw(); return; }
    if (!root.confirm('Retirer « ' + file.name + ' » ' + (file.source === 'local' ? 'de cet appareil' : 'du Cloud et de tous les appareils') + ' ?')) return;
    if (!stillCurrent() || locked()) return;
    working = true; error = ''; notice = ''; draw();
    try {
      if (file.source === 'local') await update(who, key, type, files => {
        if (!stillCurrent() || locked()) throw new Error('Séance indisponible ou trimestre verrouillé.');
        return files.filter(item => item.name !== file.name);
      });
      else await root.STI_FICHE_CLOUD.remove(file);
      notice = 'Fichier retiré.';
      await refresh(); working = false; draw(); updateViews();
    } catch (e) { error = e.message || 'Suppression impossible.'; await refresh(); working = false; draw(); }
  });
  draw(); if (who) refresh().finally(() => { working = false; draw(); });
}
function mountCahier(host, sessions) {
  if (!host) return;
  const who = owner();
  if (!who || !sessions.length) return;
  const valid = new Set(sessions.map(s => s.cls + '|' + s.n));
  const nodes = Array.from(host.querySelectorAll('[data-cah-docs]'));
  let records = {};
  function stillCurrent() { return host.isConnected && owner() === who; }
  host.addEventListener('click', async event => {
    const button = event.target.closest('[data-cah-download]');
    if (!button || !stillCurrent() || button.disabled) return;
    const session = button.dataset.cahSession, type = button.dataset.cahDownload;
    if (!valid.has(session)) return;
    const file = records[session]?.[type]?.[Number(button.dataset.index)];
    if (!file) return;
    button.disabled = true;
    try { await download(file); } catch (e) { if (root.toast) root.toast(e.message || 'Téléchargement impossible.'); }
    finally { button.disabled = false; }
  });
  load(who, Array.from(valid)).then(result => {
    if (!stillCurrent()) return;
    records = result.data;
    nodes.forEach(node => {
      const key = node.dataset.cahDocs;
      if (!valid.has(key)) return;
      const files = records[key] || {};
      const entries = Object.entries(TYPES).flatMap(([type, label]) => (files[type] || []).map((file, i) =>
        `<li><span>${esc(label)} : ${esc(file.name)} (${file.source === 'local' ? 'local uniquement' : 'Cloud'})</span> <button type="button" class="btn btn-xs btn-line" data-cah-download="${type}" data-cah-session="${esc(key)}" data-index="${i}" aria-label="Télécharger ${esc(file.name)}">Télécharger</button></li>`));
      if (entries.length) node.innerHTML = `<div class="cah-documents no-print"><strong>Documents joints à la séance</strong><ul>${entries.join('')}</ul></div>`;
    });
    if (result.cloudError || result.localError) {
      const notice = document.createElement('p');
      notice.className = 'tiny no-print'; notice.setAttribute('role', 'alert');
      notice.textContent = 'Documents du cahier : ' + [result.cloudError, result.localError].filter(Boolean).join(' ; ');
      host.prepend(notice);
    }
  });
}
root.STI_FICHE_DEVOIR_DOCUMENTS = { isDevoir, mount, mountCahier };
})(typeof window !== 'undefined' ? window : globalThis);
