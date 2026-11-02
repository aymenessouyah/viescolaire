/* Relevé local d'une épreuve : sujets, barème et copies corrigées avec l'enseignant.
   Aucune note n'est saisie dans le registre des élèves et aucun fichier ne quitte cet appareil.
   Le module ne parle pas à Supabase : il prépare les copies, garde les propositions et
   produit le relevé exportable (CSV / XLSX) que l'enseignant relit. */
(function (root) {
'use strict';

const DB_NAME = 'sti_agent_epreuve_v1';
const STORE = 'epreuves';
const MAX_COPIES = 60;
const MAX_CODE_FILES = 8;
const MAX_FILE_BYTES = 200 * 1024;
const MAX_QUESTIONS = 60;
const MAX_JUSTIFICATION = 800;
const MAX_TEXTE = 20000;
const LANGUAGES = ['html', 'htm', 'css', 'js', 'php', 'sql', 'json', 'txt'];
const RANK = { html: 0, htm: 0, css: 1, js: 2, php: 3, sql: 4, json: 5, txt: 6 };
const SKIP = /(^|\/)(node_modules|\.git|vendor|dist|build|__pycache__|\.vscode|\.idea)(\/|$)/i;
const RELEVE_WARNING = 'Relevé local préparé avec l’Agent Vie Scolaire AI : notes proposées à vérifier, aucune saisie dans le registre des élèves.';

const list = value => Array.isArray(value) ? value : [];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (value, max) => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const sanitize = (value, max) => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max);
const numberOrNull = value => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? number : null;
};
const round = value => Math.round(value * 1000) / 1000;

function newId(prefix) {
  return root.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function slug(value) {
  return String(value || 'epreuve').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 60) || 'epreuve';
}
function languageOf(name) {
  const extension = String(name || '').split('.').pop().toLowerCase();
  return LANGUAGES.includes(extension) ? extension : '';
}

/* --- Copies ------------------------------------------------------------- */

function trimmedQuestion(question, index, review) {
  const max = numberOrNull(question?.points_max);
  const attributed = numberOrNull(question?.points_attribues);
  const kept = review && review.confirmed ? numberOrNull(list(review.points)[index]) : null;
  return {
    question: clean(question?.question ?? question?.numero ?? `Question ${index + 1}`, 200),
    points_max: max,
    points_attribues: attributed,
    points_retenus: kept,
    justification: clean(question?.justification, MAX_JUSTIFICATION),
    erreurs: list(question?.erreurs).map(x => clean(x, 200)).slice(0, 8),
    elements_corrects: list(question?.elements_corrects).map(x => clean(x, 200)).slice(0, 8)
  };
}
function trimmedResult(result = {}, review = null) {
  const questions = list(result?.questions).slice(0, MAX_QUESTIONS).map((question, index) => trimmedQuestion(question, index, review));
  return {
    note: numberOrNull(result?.note),
    sur: numberOrNull(result?.sur),
    confiance: clean(result?.confiance, 60),
    questions,
    appreciation: clean(result?.appreciation, 1500),
    remediation: list(result?.remediation).map(x => clean(typeof x === 'object' ? Object.values(x).join(' — ') : x, 300)).slice(0, 10),
    limites_analyse: list(result?.limites_analyse).map(x => clean(x, 300)).slice(0, 12),
    transcription_incertaine: list(result?.transcription_incertaine).map(x => clean(typeof x === 'object' ? Object.values(x).join(' — ') : x, 300)).slice(0, 12)
  };
}
function trimmedReview(review = null) {
  if (!review) return null;
  return {
    points: list(review.points).map(numberOrNull),
    reasons: list(review.reasons).map(x => clean(x, 400)),
    total: numberOrNull(review.total),
    confirmed: review.confirmed === true
  };
}
/* Une copie est soit en attente (fichiers importés, pas encore corrigée),
   soit proposée (note de l'agent), soit validée (note relue par l'enseignant). */
function copyRecord(input = {}) {
  const result = input.result && typeof input.result === 'object' ? input.result : null;
  const review = trimmedReview(input.review);
  const pieces = result ? [] : list(input.pieces).slice(0, MAX_CODE_FILES).map(piece => ({
    name: clean(piece?.name, 120),
    language: languageOf(piece?.name) || clean(piece?.language, 12).toLowerCase(),
    content: sanitize(piece?.content, MAX_FILE_BYTES)
  })).filter(piece => piece.name && piece.language && piece.content.trim());
  const fichiers = pieces.length
    ? pieces.map(piece => piece.name)
    : list(input.fichiers).map(name => clean(name, 120)).filter(Boolean).slice(0, MAX_CODE_FILES);
  const statut = review?.confirmed ? 'validee' : result ? 'proposee' : 'en_attente';
  const now = new Date().toISOString();
  const noteProposee = result ? numberOrNull(result.note) : null;
  const type = (input.type_devoir ?? previousType(input)) === 'theorique' ? 'theorique' : 'pratique';
  const texte = clean(input.texte, MAX_TEXTE);
  return {
    id: clean(input.id, 80) || newId('copie'),
    identifiant: clean(input.identifiant, 60) || 'Copie anonyme',
    statut,
    type_devoir: type,
    texte: result ? '' : texte,
    fichiers,
    pieces,
    sur: numberOrNull(input.sur) ?? (result ? numberOrNull(result.sur) : null),
    note_proposee: noteProposee,
    note_retenue: review?.confirmed ? numberOrNull(review.total) : null,
    result: result ? trimmedResult(result, review) : null,
    review,
    created: clean(input.created, 40) || now,
    updated: now
  };
}
function previousType(input) {
  if (input?.type_devoir) return input.type_devoir;
  return list(input?.pieces).length ? 'pratique' : 'theorique';
}
function copyTotal(copy) {
  return numberOrNull(copy?.note_retenue) ?? numberOrNull(copy?.note_proposee);
}
function findCopy(copies, id) {
  return list(copies).find(copy => copy.id === id) || null;
}
/* Une même copie ne peut pas compter deux fois : on remplace par identifiant
   (insensible à la casse) ou par identifiant technique. */
function upsertCopy(epreuve = {}, copy = {}) {
  const previous = list(epreuve.copies);
  const key = String(copy.identifiant || '').trim().toLocaleLowerCase('fr');
  const existing = previous.find(item => item.id === copy.id)
    || (key ? previous.find(item => String(item.identifiant || '').trim().toLocaleLowerCase('fr') === key) : null);
  const merged = existing
    ? { ...existing, ...copy, id: existing.id, created: existing.created || copy.created }
    : copy;
  const copies = previous.filter(item => item.id !== merged.id && String(item.identifiant || '').trim().toLocaleLowerCase('fr') !== key);
  copies.push(merged);
  copies.sort((a, b) => String(a.identifiant || '').localeCompare(String(b.identifiant || ''), 'fr', { numeric: true }));
  if (copies.length > MAX_COPIES) throw new Error(`Un relevé ne peut pas dépasser ${MAX_COPIES} copies.`);
  return { ...epreuve, copies };
}
function removeCopy(epreuve = {}, id = '') {
  return { ...epreuve, copies: list(epreuve.copies).filter(copy => copy.id !== id) };
}
function stats(epreuve = {}) {
  const copies = list(epreuve.copies);
  const notes = copies.map(copyTotal).filter(value => value !== null);
  const moyenne = notes.length ? round(notes.reduce((sum, value) => sum + value, 0) / notes.length) : null;
  return {
    total: copies.length,
    enAttente: copies.filter(copy => copy.statut === 'en_attente').length,
    proposees: copies.filter(copy => copy.statut === 'proposee').length,
    validees: copies.filter(copy => copy.statut === 'validee').length,
    notees: notes.length,
    moyenne,
    min: notes.length ? Math.min(...notes) : null,
    max: notes.length ? Math.max(...notes) : null,
    sur: numberOrNull(epreuve.sur)
  };
}
function statutLabel(statut) {
  if (statut === 'validee') return 'Note validée';
  if (statut === 'proposee') return 'À valider';
  return 'En attente de correction';
}

/* --- Import des dossiers d'élèves -------------------------------------- */

/* Un sous-dossier par élève : « copies/Dupont/index.html » devient
   identifiant « Dupont » ; les fichiers techniques sont classés avant les
   autres pour respecter la limite de huit pièces par correction. */
function groupFolderFiles(fileList) {
  const groups = new Map();
  list(Array.from(fileList || [])).forEach(file => {
    const relative = String(file?.webkitRelativePath || file?.relativePath || '');
    if (!relative || SKIP.test(relative)) return;
    const parts = relative.split('/').filter(Boolean);
    const name = String(file?.name || parts[parts.length - 1] || '');
    if (!languageOf(name)) return;
    const folder = parts.length > 1 ? parts[parts.length - 2] : '';
    const key = parts.slice(0, -1).join('/') || 'Racine';
    if (!groups.has(key)) groups.set(key, { label: folder || 'Copie sans dossier', files: [] });
    groups.get(key).files.push(file);
  });
  const used = new Map();
  return [...groups.values()].map(group => {
    const files = [...group.files].sort((a, b) => {
      const rankA = RANK[languageOf(a.name)] ?? 9, rankB = RANK[languageOf(b.name)] ?? 9;
      return rankA - rankB || String(a.name).localeCompare(String(b.name), 'fr', { numeric: true });
    });
    const base = clean(group.label, 60) || 'Copie anonyme';
    const seen = (used.get(base.toLocaleLowerCase('fr')) || 0) + 1;
    used.set(base.toLocaleLowerCase('fr'), seen);
    return {
      identifiant: seen === 1 ? base : `${base} (${seen})`,
      fichiers: files.map(file => clean(file.name, 120)),
      total: files.length,
      files
    };
  }).sort((a, b) => a.identifiant.localeCompare(b.identifiant, 'fr', { numeric: true }));
}
async function readCodeFiles(files, max = MAX_CODE_FILES) {
  const all = list(files);
  const selected = all.slice(0, max);
  const ignored = all.slice(max).map(file => clean(file?.name, 120));
  const pieces = [];
  for (const file of selected) {
    const name = clean(file?.name, 120);
    const language = languageOf(name);
    if (!language) { ignored.push(name); continue; }
    if (Number(file?.size) > MAX_FILE_BYTES) { ignored.push(name); continue; }
    let content = '';
    try {
      content = typeof file?.text === 'function' ? await file.text() : String(file?.content ?? '');
    } catch (_) { ignored.push(name); continue; }
    if (!content.trim() || content.includes('\u0000')) { ignored.push(name); continue; }
    pieces.push({ name, language, content: content.slice(0, MAX_FILE_BYTES) });
  }
  return { pieces, ignored };
}

/* --- Relevé exportable -------------------------------------------------- */

function releveRows(epreuve = {}) {
  const copies = list(epreuve.copies);
  const summary = stats(epreuve);
  const rows = [
    ['Épreuve', clean(epreuve.nom, 140) || 'Épreuve'],
    ['Classe', clean(epreuve.classe, 20)],
    ['Type de devoir', epreuve.type_devoir === 'theorique' ? 'Théorique' : 'Pratique'],
    ['Barème', summary.sur === null ? '' : `/${summary.sur}`],
    ['Statut', RELEVE_WARNING]
  ];
  if (epreuve.sujet) rows.push(['Sujet de référence', clean(epreuve.sujet, 4000)]);
  rows.push([]);
  rows.push(['Copie', 'Fichiers transmis', 'Statut', 'Note proposée', 'Note retenue', 'Total retenu', 'Appréciation', 'Détail par question']);
  copies.forEach(copy => {
    const total = copyTotal(copy);
    const detail = list(copy.result?.questions).map(question => {
      const kept = question.points_retenus;
      const points = kept !== null && kept !== undefined ? kept : question.points_attribues;
      return `${question.question} : ${points ?? '—'}/${question.points_max ?? '—'}`;
    }).join(' ; ');
    rows.push([
      copy.identifiant,
      list(copy.fichiers).join(', '),
      statutLabel(copy.statut),
      copy.note_proposee ?? '',
      copy.note_retenue ?? '',
      total ?? '',
      copy.result?.appreciation || '',
      detail
    ]);
  });
  rows.push([]);
  rows.push(['Copies', summary.total], ['Notes disponibles', summary.notees], ['Validées par l’enseignant', summary.validees]);
  if (summary.moyenne !== null) rows.push(['Moyenne provisoire', summary.moyenne], ['Minimum', summary.min], ['Maximum', summary.max]);
  rows.push(['Rappel', 'Aucune note n’est saisie dans le registre des élèves : reportez-les vous-même après relecture.']);
  return rows;
}
function csvCell(value) {
  const text = typeof value === 'number' && Number.isFinite(value) ? String(value).replace('.', ',') : String(value ?? '');
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function csv(epreuve = {}) {
  return releveRows(epreuve).map(row => list(row).map(csvCell).join(';')).join('\r\n');
}
function fileName(epreuve, extension) {
  return `releve-${slug(epreuve?.nom)}-${slug(epreuve?.classe)}-${new Date().toISOString().slice(0, 10)}.${extension}`;
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = name;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function downloadCsv(epreuve = {}) {
  const rows = releveRows(epreuve);
  if (!rows.length) throw new Error('Le relevé est vide.');
  download(new Blob(['\ufeff' + csv(epreuve)], { type: 'text/csv;charset=utf-8' }), fileName(epreuve, 'csv'));
}
function downloadXlsx(epreuve = {}) {
  if (!root.STI_AGENT_XLSX?.buildWorkbook) return downloadCsv(epreuve);
  const file = root.STI_AGENT_XLSX.buildWorkbook(releveRows(epreuve));
  download(new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName(epreuve, 'xlsx'));
}

/* --- Validation et stockage local -------------------------------------- */

function normalizeEpreuve(owner, input = {}, previous = null) {
  if (!owner) throw new Error('Un profil professeur est nécessaire pour enregistrer un relevé.');
  const nom = clean(input.nom ?? previous?.nom, 140);
  if (!nom) throw new Error('Indiquez le nom de l’épreuve.');
  const sur = numberOrNull(input.sur ?? previous?.sur);
  if (sur === null || sur <= 0 || sur > 1000) throw new Error('La note maximale de l’épreuve doit être comprise entre 0 et 1 000.');
  const copies = list(input.copies ?? previous?.copies).filter(copy => copy && copy.id && copy.identifiant).slice(0, MAX_COPIES);
  const now = new Date().toISOString();
  return {
    id: clean(previous?.id || input.id, 80) || newId('epreuve'),
    owner,
    nom,
    classe: clean(input.classe ?? previous?.classe, 20),
    type_devoir: (input.type_devoir ?? previous?.type_devoir) === 'theorique' ? 'theorique' : 'pratique',
    sujet: clean(input.sujet ?? previous?.sujet, 8000),
    bareme: clean(input.bareme ?? previous?.bareme, 8000),
    sur,
    copies,
    created: clean(previous?.created, 40) || now,
    updated: now
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
    request.onerror = () => reject(request.error || new Error('Ouverture du relevé impossible.'));
    request.onblocked = () => reject(new Error('Fermez les autres onglets utilisant le relevé puis réessayez.'));
    request.onsuccess = () => resolve(request.result);
  });
}
async function listEpreuves(owner) {
  if (!owner) return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).index('owner').getAll(owner);
    let items = [];
    request.onsuccess = () => { items = request.result || []; };
    tx.oncomplete = () => { db.close(); resolve(items.sort((a, b) => String(b.updated).localeCompare(String(a.updated)))); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Lecture du relevé impossible.')); };
  });
}
async function getEpreuve(owner, id) {
  if (!owner || !id) return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(id);
    let item = null;
    request.onsuccess = () => { item = request.result || null; };
    tx.oncomplete = () => { db.close(); resolve(item && item.owner === owner ? item : null); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Lecture du relevé impossible.')); };
  });
}
async function saveEpreuve(owner, input = {}, id = '') {
  const previous = id ? await getEpreuve(owner, id) : null;
  if (id && !previous) throw new Error('Ce relevé est introuvable sur cet appareil.');
  const epreuve = normalizeEpreuve(owner, input, previous);
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(epreuve);
    tx.oncomplete = () => { db.close(); resolve(epreuve); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Enregistrement du relevé impossible.')); };
  });
}
async function removeEpreuve(owner, id) {
  const previous = await getEpreuve(owner, id);
  if (!previous) throw new Error('Ce relevé est introuvable sur cet appareil.');
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => { db.close(); resolve(true); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Suppression du relevé impossible.')); };
  });
}

root.STI_AGENT_EPREUVE = {
  MAX_COPIES, MAX_CODE_FILES, MAX_FILE_BYTES, MAX_TEXTE, RELEVE_WARNING,
  esc, clean, copyRecord, copyTotal, findCopy, upsertCopy, removeCopy, stats, statutLabel,
  groupFolderFiles, readCodeFiles, releveRows, csv, downloadCsv, downloadXlsx,
  normalizeEpreuve, list: listEpreuves, get: getEpreuve, save: saveEpreuve, remove: removeEpreuve,
  _test: { languageOf, slug, numberOrNull, trimmedResult, trimmedReview, fileName }
};
})(typeof window !== 'undefined' ? window : globalThis);
