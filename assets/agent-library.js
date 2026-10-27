/* Bibliothèque locale de l'enseignant. Les fichiers ne quittent pas cet appareil. */
(function (root) {
'use strict';
const DB_NAME = 'sti_agent_library_v1';
const STORE = 'documents';
const MAX_FILE = 10 * 1024 * 1024;
const MAX_EXCERPT = 6000;
const MAX_SELECTED = 3;
const CATEGORIES = ['Programme', 'Cours', 'Annexe', 'Sujet', 'Corrigé', 'Fiche', 'Répartition', 'Autre'];
const CLASSES = ['Toutes', '3SI1', '4SI2'];
const ALLOWED = /\.(pdf|docx|txt|md|html?|png|jpe?g|webp)$/i;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (value, max) => String(value ?? '').replace(/\u0000/g, '').trim().slice(0, max);

function normalize(input, owner, previous = null, file = null, removeFile = false) {
  if (!owner) throw new Error('Un profil professeur est nécessaire pour accéder à la bibliothèque.');
  const title = clean(input.title, 160);
  const category = clean(input.category, 30);
  const classe = clean(input.classe, 20);
  if (!title) throw new Error('Indiquez le titre du document.');
  if (!CATEGORIES.includes(category) || !CLASSES.includes(classe)) throw new Error('Choisissez une catégorie et une classe valides.');
  if (file && (!ALLOWED.test(file.name || '') || !file.size || file.size > MAX_FILE)) {
    throw new Error('Fichier vide, format non pris en charge ou supérieur à 10 Mo.');
  }
  const excerpt = String(input.excerpt || '').replace(/\u0000/g, '').trim();
  if (excerpt.length > MAX_EXCERPT) throw new Error(`L’extrait dépasse ${MAX_EXCERPT} caractères.`);
  const created = previous?.created || new Date().toISOString();
  const savedFile = file || (!removeFile ? previous?.file : null) || null;
  return {
    id: previous?.id || root.crypto?.randomUUID?.() || `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    owner, title, category, classe,
    source: clean(input.source, 300), publication: clean(input.publication, 80),
    location: clean(input.location, 160), tags: clean(input.tags, 240), excerpt,
    file: savedFile, fileName: file ? clean(file.name, 200) : (savedFile ? previous.fileName : ''),
    created, updated: new Date().toISOString()
  };
}
function openDb() {
  return new Promise((resolve, reject) => {
    if (!root.indexedDB) return reject(new Error('Le stockage IndexedDB est indisponible dans ce navigateur.'));
    const request = root.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('owner', 'owner', { unique: false });
    };
    request.onerror = () => reject(request.error || new Error('Ouverture de la bibliothèque impossible.'));
    request.onblocked = () => reject(new Error('Fermez les autres onglets utilisant la bibliothèque puis réessayez.'));
    request.onsuccess = () => resolve(request.result);
  });
}
async function list(owner) {
  if (!owner) return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).index('owner').getAll(owner);
    let items = [];
    request.onsuccess = () => { items = request.result || []; };
    tx.oncomplete = () => { db.close(); resolve(items.sort((a, b) => String(b.updated).localeCompare(String(a.updated)))); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Lecture de la bibliothèque impossible.')); };
  });
}
async function save(owner, input, file, existingId, removeFile) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    let saved, failure;
    function put(previous) {
      try {
        if (existingId && (!previous || previous.owner !== owner)) throw new Error('Document introuvable dans votre bibliothèque.');
        saved = normalize(input, owner, previous, file, removeFile);
        store.put(saved);
      } catch (error) { failure = error; tx.abort(); }
    }
    if (existingId) {
      const request = store.get(existingId);
      request.onsuccess = () => put(request.result);
    } else put(null);
    tx.oncomplete = () => { db.close(); resolve(saved); };
    tx.onerror = tx.onabort = () => { db.close(); reject(failure || tx.error || new Error('Enregistrement impossible.')); };
  });
}
async function remove(owner, id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    let failure;
    const request = store.get(id);
    request.onsuccess = () => {
      if (!request.result || request.result.owner !== owner) { failure = new Error('Document introuvable dans votre bibliothèque.'); tx.abort(); return; }
      store.delete(id);
    };
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = tx.onabort = () => { db.close(); reject(failure || tx.error || new Error('Suppression impossible.')); };
  });
}
function references(docs, ids, classe, owner) {
  const selected = new Set(Array.isArray(ids) ? ids.map(String) : []);
  return (Array.isArray(docs) ? docs : [])
    .filter(doc => doc.owner === owner && selected.has(String(doc.id)) && (doc.classe === 'Toutes' || doc.classe === classe) && String(doc.excerpt || '').trim())
    .slice(0, MAX_SELECTED)
    .map(doc => ({ titre: doc.title, categorie: doc.category, classe: doc.classe, provenance: doc.source, date_edition: doc.publication, page_ou_section: doc.location, extrait_fourni: doc.excerpt }));
}
function picker(docs, ids, classe, owner) {
  const selected = new Set(Array.isArray(ids) ? ids : []);
  const available = (docs || []).filter(doc => doc.owner === owner && (doc.classe === 'Toutes' || doc.classe === classe) && String(doc.excerpt || '').trim());
  return `<details class="agent-curriculum-picker full agent-sources-picker"><summary><strong>Extraits de votre bibliothèque</strong><span>${selected.size} sélectionné(s) · maximum ${MAX_SELECTED}</span></summary><p class="agent-curriculum-help">Seuls les extraits cochés et leur provenance seront transmis à l’IA, jamais les fichiers. Vérifiez la source, l’édition et le passage : aucune conformité n’est vérifiée automatiquement.</p>${available.length ? `<div class="agent-curriculum-options">${available.map(doc => `<label class="agent-curriculum-option"><input type="checkbox" data-agent-source value="${esc(doc.id)}" ${selected.has(doc.id) ? 'checked' : ''}><span><strong>${esc(doc.title)}</strong><small>${esc(doc.category)} · ${esc(doc.classe)}${doc.location ? ` · ${esc(doc.location)}` : ''}</small></span></label>`).join('')}</div>` : '<p class="agent-curriculum-empty">Ajoutez un extrait dans la Bibliothèque pour pouvoir le sélectionner ici.</p>'}</details>`;
}
function download(doc) {
  if (!doc?.file) return;
  const url = URL.createObjectURL(doc.file);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.fileName || 'document';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function mount(host, options) {
  if (!host) return;
  const owner = options.owner;
  const docs = options.docs || [];
  let editing = null;
  let draft = null;
  let message = '';
  let problem = options.error || '';
  let working = false;
  function draw() {
    if (!host.isConnected && host.isConnected !== undefined) return;
    const e = draft || editing || {};
    host.innerHTML = `<div class="agent-library-intro"><div><span>VOTRE ESPACE DOCUMENTAIRE</span><h3>Bibliothèque pédagogique</h3><p>Classez vos programmes, cours, annexes, sujets et corrigés ; choisissez ensuite les extraits utiles à une génération.</p></div><div class="agent-library-count"><strong>${docs.length}</strong><small>document(s)</small></div></div>
      <div class="agent-library-warning"><strong>Sources à vérifier</strong> · Les fichiers restent dans ce navigateur, ne sont ni synchronisés ni inclus dans les sauvegardes Cloud/Drive. Ils ne sont pas chiffrés : une personne ayant accès à l’appareil peut les lire. Évitez les copies d’élèves et conservez vos originaux ailleurs. Les PDF et Word ne sont pas lus automatiquement.</div>
      ${!owner ? '<div class="agent-message error">Connectez un profil professeur pour utiliser cette bibliothèque.</div>' : ''}
      ${problem ? `<div class="agent-message error" role="alert">${esc(problem)}</div>` : ''}${message ? `<div class="agent-message success" role="status">${esc(message)}</div>` : ''}
      <details class="agent-library-form" ${editing || draft ? 'open' : ''}><summary>${editing ? 'Modifier le document' : '+ Ajouter un document'}</summary><form data-library-form>
        <div class="agent-form-grid">
          <label class="agent-field full"><span>Titre *</span><input name="title" maxlength="160" required value="${esc(e.title || '')}" placeholder="Ex. : Aide pédagogique STI — édition 2024"></label>
          <label class="agent-field"><span>Catégorie *</span><select name="category">${CATEGORIES.map(c => `<option ${e.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
          <label class="agent-field"><span>Classe *</span><select name="classe">${CLASSES.map(c => `<option ${e.classe === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
          <label class="agent-field"><span>Provenance / auteur</span><input name="source" maxlength="300" value="${esc(e.source || '')}" placeholder="Ex. : document fourni par l’enseignant"></label>
          <label class="agent-field"><span>Édition / date</span><input name="publication" maxlength="80" value="${esc(e.publication || '')}" placeholder="Ex. : septembre 2024"></label>
          <label class="agent-field"><span>Page ou section de l’extrait</span><input name="location" maxlength="160" value="${esc(e.location || '')}" placeholder="Ex. : p. 4, compétence C2"></label>
          <label class="agent-field"><span>Mots-clés</span><input name="tags" maxlength="240" value="${esc(e.tags || '')}" placeholder="Ex. : HTML, formulaires"></label>
          <label class="agent-field full"><span>Extrait à utiliser dans les demandes <em>facultatif</em></span><textarea name="excerpt" maxlength="${MAX_EXCERPT}" rows="5" placeholder="Copiez ici un passage que vous avez vérifié dans le document original.">${esc(e.excerpt || '')}</textarea><small>Jusqu’à ${MAX_EXCERPT} caractères ; cet extrait ne sera envoyé que si vous le sélectionnez explicitement.</small></label>
          <label class="agent-field full agent-upload"><span>${e.fileName ? `Fichier actuel : ${esc(e.fileName)} · remplacer par un fichier` : 'Fichier local facultatif'}</span><input name="file" type="file" accept=".pdf,.docx,.txt,.md,.html,.htm,.png,.jpg,.jpeg,.webp"><small>PDF, DOCX, TXT, Markdown, HTML ou image · 10 Mo maximum. Le contenu n’est pas extrait automatiquement.</small></label>
          ${e.file ? '<label class="agent-library-remove-file full"><input type="checkbox" name="removeFile"> Supprimer le fichier associé (sans supprimer la fiche)</label>' : ''}
        </div><div class="agent-form-footer"><button class="btn btn-primary" type="submit" ${!owner || working ? 'disabled' : ''}>${working ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Ajouter à la bibliothèque'}</button>${editing ? '<button class="btn btn-ghost" type="button" data-library-cancel>Annuler</button>' : ''}</div>
      </form></details>
      <div class="agent-library-list-head"><div><span>COLLECTION LOCALE</span><h3>Vos documents</h3></div><label><span class="agent-sr-only">Rechercher dans la bibliothèque</span><input type="search" data-library-search placeholder="Rechercher un titre, une classe…"></label></div>
      <div class="agent-library-list">${docs.length ? docs.map(doc => `<article class="agent-library-card" data-library-card data-search="${esc([doc.title, doc.category, doc.classe, doc.source, doc.tags, doc.location].join(' ').toLocaleLowerCase('fr'))}"><div class="agent-library-card-icon">${esc((doc.category || 'D').slice(0, 1))}</div><div class="agent-library-card-body"><div class="agent-library-card-title"><strong>${esc(doc.title)}</strong><span>${esc(doc.category)}</span></div><p>${esc(doc.classe)}${doc.source ? ` · ${esc(doc.source)}` : ''}${doc.publication ? ` · ${esc(doc.publication)}` : ''}${doc.location ? ` · ${esc(doc.location)}` : ''}</p><small>${doc.fileName ? `Fichier : ${esc(doc.fileName)}` : 'Sans fichier'} · ${doc.excerpt ? 'Extrait disponible' : 'Aucun extrait'}</small>${doc.tags ? `<small>Mots-clés : ${esc(doc.tags)}</small>` : ''}</div><div class="agent-library-actions">${doc.file ? `<button type="button" data-library-download="${esc(doc.id)}">Télécharger</button>` : ''}<button type="button" data-library-edit="${esc(doc.id)}">Modifier</button><button type="button" data-library-delete="${esc(doc.id)}">Supprimer</button></div></article>`).join('') : '<div class="agent-library-empty">Votre bibliothèque est vide. Ajoutez un premier document pour le retrouver ici.</div>'}</div><p class="agent-library-no-match" hidden>Aucun document ne correspond à la recherche.</p>`;
    const form = host.querySelector('[data-library-form]');
    form?.addEventListener('submit', async event => {
      event.preventDefault();
      if (working) return;
      const data = new FormData(form);
      const file = data.get('file');
      const input = Object.fromEntries([...data.entries()].filter(([key]) => key !== 'file'));
      working = true; problem = ''; message = '';
      const submit = form.querySelector('button[type="submit"]');
      if (submit) { submit.disabled = true; submit.textContent = 'Enregistrement…'; }
      try {
        await save(owner, input, file && file.name ? file : null, editing?.id, Boolean(data.get('removeFile')));
        const next = await list(owner);
        docs.splice(0, docs.length, ...next);
        editing = null; draft = null; message = 'Document enregistré sur cet appareil.';
        options.onChanged?.(next);
      } catch (error) { draft = { ...(editing || {}), ...input }; problem = `${error.message || 'Enregistrement impossible.'} Si nécessaire, sélectionnez de nouveau le fichier.`; }
      finally { working = false; draw(); }
    });
    host.querySelector('[data-library-cancel]')?.addEventListener('click', () => { editing = null; draft = null; problem = ''; draw(); });
    host.querySelectorAll('[data-library-edit]').forEach(button => button.addEventListener('click', () => { editing = docs.find(doc => doc.id === button.dataset.libraryEdit) || null; draft = null; problem = ''; message = ''; draw(); host.querySelector('[name="title"]')?.focus(); }));
    host.querySelectorAll('[data-library-download]').forEach(button => button.addEventListener('click', () => download(docs.find(doc => doc.id === button.dataset.libraryDownload))));
    host.querySelectorAll('[data-library-delete]').forEach(button => button.addEventListener('click', async () => {
      const doc = docs.find(item => item.id === button.dataset.libraryDelete);
      if (!doc || !root.confirm(`Supprimer « ${doc.title} » de la bibliothèque de cet appareil ? Le fichier original externe restera inchangé.`)) return;
      try { await remove(owner, doc.id); const next = await list(owner); docs.splice(0, docs.length, ...next); editing = null; problem = ''; message = 'Document supprimé de cet appareil.'; options.onChanged?.(next); }
      catch (error) { problem = error.message || 'Suppression impossible.'; }
      draw();
    }));
    host.querySelector('[data-library-search]')?.addEventListener('input', event => {
      const query = event.target.value.trim().toLocaleLowerCase('fr');
      let visible = 0;
      host.querySelectorAll('[data-library-card]').forEach(card => { card.hidden = !card.dataset.search.includes(query); if (!card.hidden) visible++; });
      host.querySelector('.agent-library-no-match').hidden = !docs.length || visible > 0;
    });
  }
  draw();
}
root.STI_AGENT_LIBRARY = { MAX_FILE, MAX_EXCERPT, MAX_SELECTED, normalize, list, save, remove, references, picker, mount };
})(typeof window !== 'undefined' ? window : globalThis);
