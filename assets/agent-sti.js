/* =========================================================================
   Agent Vie Scolaire AI — assistant pédagogique personnel
   Interface connectée à une Supabase Edge Function. Aucune clé IA dans le
   navigateur. Les résultats sont des propositions : toute écriture dans les
   fiches ou le planning nécessite une action explicite de l'enseignant.
   ========================================================================= */
(function (root) {
'use strict';

const VERSION = '2.6.0-deepseek';
const HISTORY_KEY = 'sti_agent_history_v1';
const MAX_IMAGES = 6;
const MAX_CODE_FILES = 8;
const MAX_DOCUMENT_CHARS = 80000;
const MAX_SHARED_PROMPTS = 5;
const TASKS = {
  fiche: { label: 'Fiche pédagogique', short: 'Fiche', icon: 'file', desc: 'Préparer une séance complète à partir du planning.' },
  exercices: { label: 'Séries d’exercices', short: 'Exercices', icon: 'layers', desc: 'Créer des exercices théoriques ou pratiques avec corrigés.' },
  correction: { label: 'Correction de copies', short: 'Correction', icon: 'check', desc: 'Analyser texte, photos ou code avec un barème validé.' },
  cahier: { label: 'Cahier de textes', short: 'Cahier', icon: 'book', desc: 'Rédiger une entrée à partir du réalisé déclaré.' },
  repartition: { label: 'Répartition', short: 'Répartition', icon: 'calendar', desc: 'Proposer une progression sans changer les dates.' },
  document: { label: 'Autres documents', short: 'Document libre', icon: 'file', desc: 'Comparer une révision avec un texte source et conserver les versions.' }
};
const ICONS = {
  spark: '<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  check: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m22 4-10 10-3-3"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5"/>'
};

let ctx = null;
let tool = 'fiche';
let classe = '3SI1';
let busy = false;
let error = '';
let notice = '';
let status = null;
let attachments = [];
let codeFiles = [];
let transcriptionReview = null;
let transcriptionAcknowledged = false;
let results = {};
let resultMeta = {};
let history = readHistory();
let workspaceOwnerKey = '';
let generationToken = 0;
let sharedPrompts = [];
let sharedPromptState = 'idle';
let sharedPromptError = '';
let sharedPromptPromise = null;
let sharedPromptUser = '';
const selectedSharedPromptIds = {};
function defaultForms() {
  return {
    fiche: { session: '', methode: 'Cours dialogué et TP guidé', objectif: '', consignes: '', notions: [], competences: [], remplacer: false },
    exercices: { type_devoir: 'théorique', sujet: '', nombre: 5, difficulte: 'Progressive', format: 'Série d’exercices', duree: 60, contraintes: '', notions: [], competences: [], remplacement_id: '', document_existant: '' },
    correction: { type_devoir: 'théorique', mode_bareme: 'fourni', identifiant: 'Copie 1', sur: 20, sujet: '', bareme: '', copie: '', consignes: '' },
    cahier: { session: '', realise: '', devoirs: '', observations: '', remplacer: false },
    repartition: { trimestre: 1, consignes: 'Conserver la progression officielle. Renforcer les activités pratiques et prévoir une remédiation après chaque évaluation.' },
    document: { titre: '', type_document: 'Document libre', document_existant: '', consignes: '', remplacement_id: '', fichier_nom: '' }
  };
}
const forms = defaultForms();

const el = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = value => esc(value || '—').replace(/\n/g, '<br>');
const icon = (name, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;
const asArray = value => Array.isArray(value) ? value : [];
function shouldTranscribeHandwriting(form, imageCount) {
  return form?.type_devoir === 'théorique' && Number(imageCount) > 0;
}
function hasUncertainTranscription(review) {
  const confidence = String(review?.confiance_globale || '').trim().toLocaleLowerCase('fr');
  return asArray(review?.transcription_incertaine).length > 0 || Boolean(confidence && confidence !== 'haute');
}
function preserveTranscriptionWarnings(result, review, acknowledged) {
  if (!result || !review || !hasUncertainTranscription(review)) return result;
  const reviewWarnings = asArray(review.transcription_incertaine);
  const fallback = reviewWarnings.length ? [] : [`Confiance de lecture ${review.confiance_globale || 'incertaine'} lors de la transcription préliminaire.`];
  const all = [...reviewWarnings, ...asArray(result.transcription_incertaine), ...fallback];
  const seen = new Set();
  result.transcription_incertaine = all.filter(item => {
    const key = typeof item === 'string' ? item : JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const limits = asArray(result.limites_analyse);
  if (acknowledged) limits.push('La correction a été poursuivie après confirmation de l’enseignant malgré l’avertissement de lecture.');
  result.limites_analyse = limits;
  return result;
}
const keyOf = s => `${s.cls}|${s.n}`;
const sessions = () => ctx?.sessions?.[classe] || [];
const record = s => ctx?.store?.seances?.[keyOf(s)] || {};
const titleOf = s => record(s).title || s.blk?.t || 'Séance à planifier';
const dateLong = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const today = () => root.todayISO ? root.todayISO() : new Date().toISOString().slice(0, 10);

function readHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(value) ? value.filter(x => x && TASKS[x.task] && x.result) : [];
  } catch (e) { return []; }
}
function writeHistory() {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); return true; }
  catch (e) { return false; }
}
function currentHistory() {
  const owner = activeTeacherKey();
  return owner ? history.filter(item => item.owner_key === owner).slice(0, 8) : [];
}
function saveCurrentHistory(entries) {
  const owner = activeTeacherKey();
  if (!owner) return false;
  const previous = history;
  const mine = entries.filter(item => item && item.owner_key === owner).slice(0, 8);
  const others = history.filter(item => item.owner_key !== owner);
  history = [...mine, ...others];
  if (!writeHistory()) { history = previous; return false; }
  return true;
}
function documentVersions(entry) {
  if (Array.isArray(entry?.versions) && entry.versions.length) return entry.versions;
  return entry?.result && typeof entry.result.contenu === 'string'
    ? [{ label: 'Version actuelle', created: entry.created, result: entry.result }]
    : [];
}
function currentDocumentVersionIndex(entry, versions = documentVersions(entry)) {
  const index = Number(entry?.current_version);
  return Number.isInteger(index) && index >= 0 && index < versions.length ? index : versions.length - 1;
}
function currentDocumentVersion(entry) {
  const versions = documentVersions(entry);
  return versions[currentDocumentVersionIndex(entry, versions)] || null;
}
function newDocumentHistoryEntry(owner, meta, result, sourceContent) {
  const created = new Date().toISOString();
  const original = {
    titre: String(meta.titre || result.titre || 'Document libre'),
    type_document: String(meta.type_document || result.type_document || 'Document libre'),
    contenu: String(sourceContent || ''),
    changements: [],
    points_a_verifier: []
  };
  const id = root.crypto?.randomUUID?.() || `agent-doc-${Date.now()}`;
  const savedMeta = { ...meta, document_replacement_id: '', document_history_id: id, document_source_content: original.contenu, document_saved: true };
  delete savedMeta.document_target_content;
  return {
    id, owner_key: owner, task: 'document', classe: meta.classe,
    title: String(result.titre || meta.titre || 'Document libre').slice(0, 140),
    created, result, meta: savedMeta,
    versions: [
      { label: 'Document source', created, result: original },
      { label: 'Version révisée 1', created, result }
    ],
    current_version: 1
  };
}
function appendDocumentHistoryVersion(entry, meta, result, sourceContent) {
  const versions = documentVersions(entry);
  const created = new Date().toISOString();
  const snapshot = { label: `Version révisée ${versions.length}`, created, result };
  const savedMeta = { ...meta, document_replacement_id: '', document_history_id: entry.id, document_source_content: String(sourceContent || ''), document_saved: true };
  delete savedMeta.document_target_content;
  return {
    ...entry,
    title: String(result.titre || entry.title || 'Document libre').slice(0, 140),
    created, result, meta: savedMeta,
    versions: [...versions, snapshot],
    current_version: versions.length
  };
}
function restoreDocumentHistoryVersion(entry) {
  const versions = documentVersions(entry);
  const index = currentDocumentVersionIndex(entry, versions);
  const current = versions[index];
  if (index <= 0 || !current) return null;
  const previous = versions[index - 1];
  const created = new Date().toISOString();
  const restored = { label: `Restauration de ${previous.label || 'la version précédente'}`, created, result: previous.result };
  const meta = {
    ...(entry.meta || {}), document_replacement_id: '', document_history_id: entry.id,
    document_source_content: String(current?.result?.contenu || ''), document_saved: true
  };
  return {
    ...entry, title: String(previous.result?.titre || entry.title || 'Document libre').slice(0, 140),
    created, result: previous.result, meta,
    versions: [...versions, restored], current_version: versions.length
  };
}
function findSession(key, cls = classe) {
  return (ctx?.sessions?.[cls] || []).find(s => keyOf(s) === key) || null;
}
function defaultSession(mode) {
  const list = sessions();
  if (!list.length) return '';
  let candidate;
  if (mode === 'cahier') {
    const past = list.filter(s => s.iso <= today());
    candidate = past.reverse().find(s => record(s).contenu) || past[0];
  } else {
    candidate = list.find(s => s.iso >= today()) || list[list.length - 1];
  }
  return candidate ? keyOf(candidate) : '';
}
function storedNotionsForSession(sessionKey) {
  const session = findSession(sessionKey);
  if (!session) return [];
  const allowed = new Set(curriculumCatalog('notions').map(item => item.id));
  const saved = asArray(record(session).notions).map(item => String(item && typeof item === 'object' ? item.id || '' : item || ''));
  return [...new Set(saved)].filter(id => allowed.has(id));
}
function ensureSessions() {
  if (!findSession(forms.fiche.session)) {
    forms.fiche.session = defaultSession('fiche');
    forms.fiche.notions = storedNotionsForSession(forms.fiche.session);
  }
  if (!findSession(forms.cahier.session)) forms.cahier.session = defaultSession('cahier');
}
function sessionData(s, purpose = 'full') {
  if (!s) return null;
  const o = record(s);
  const savedNotions = new Set(asArray(o.notions).map(item => String(item && typeof item === 'object' ? item.id || '' : item || '')));
  const notions = asArray(root.STI_DATA?.livresSTI?.[s.cls]?.items).filter(x => savedNotions.has(String(x.id))).map(x => ({ notion: x.label, domaine: x.domain, description: x.description }));
  const core = {
    classe: s.cls,
    numero: s.n,
    date: s.iso,
    trimestre: s.tri,
    titre: titleOf(s),
    reference: s.blk ? { titre: s.blk.t, domaine: s.blk.d, supports: s.blk.o, type: s.blk.k, detail: s.blk.det } : null
  };
  const progress = {
    contenu_reellement_declare: o.contenu || '',
    travail_maison: o.devoirs || '',
    observations: o.obs || '',
    statut: o.done === true ? 'assurée' : o.done === false ? 'reportée' : 'non confirmé',
    notions
  };
  if (purpose === 'fiche') return core;
  if (purpose === 'cahier') return { ...core, ...progress };
  if (purpose === 'repartition') return { ...core, preparation: o.preparation || '', ...progress };
  return { ...core, preparation: o.preparation || '', ...progress };
}
const CONTEXT_STOP_WORDS = new Set(['afin', 'ainsi', 'avec', 'avoir', 'ceci', 'cela', 'cette', 'dans', 'depuis', 'des', 'donc', 'elle', 'elles', 'entre', 'etre', 'faire', 'leur', 'leurs', 'mais', 'moins', 'nous', 'pour', 'plus', 'quand', 'sans', 'selon', 'serait', 'sont', 'sous', 'tous', 'tout', 'une', 'vous', 'votre', 'vos', 'classe', 'cours', 'document', 'eleve', 'eleves', 'exercice', 'exercices', 'fiche', 'seance', 'sti']);
function contextTerms(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr')
    .split(/[^\p{L}\p{N}_$]+/u).filter(word => word.length > 2 && !CONTEXT_STOP_WORDS.has(word));
}
function contextTermMatches(left, right) {
  return left === right || (left.length >= 4 && right.startsWith(left)) || (right.length >= 4 && left.startsWith(right));
}
function relatedNotions(topic) {
  const terms = [...new Set(contextTerms(topic))];
  const items = asArray(root.STI_DATA?.livresSTI?.[classe]?.items);
  if (!terms.length) return [];
  return items.map((item, index) => {
    const search = new Set(contextTerms(`${item.label || ''} ${item.description || ''} ${item.domain || ''} ${item.detail || ''} ${item.kind || ''}`));
    const score = terms.filter(term => [...search].some(candidate => contextTermMatches(term, candidate))).length;
    return { item, index, score };
  }).filter(candidate => candidate.score > 0).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 5)
    .map(({ item }) => ({ notion: item.label, domaine: item.domain, description: item.description }));
}
function relatedCompetences(topic, limit = 4) {
  const terms = [...new Set(contextTerms(topic))];
  const items = asArray(root.STI_DATA?.competences?.[classe]);
  if (!terms.length) return [];
  return items.map((item, index) => {
    const search = new Set(contextTerms([item.code, item.t, item.domaine, item.sous, item.atelier, ...asArray(item.attendu)].filter(Boolean).join(' ')));
    const score = terms.filter(term => [...search].some(candidate => contextTermMatches(term, candidate))).length;
    const payload = { code: String(item.code || ''), competence: String(item.t || 'Compétence'), domaine: String(item.domaine || ''), attendus: asArray(item.attendu).map(String) };
    return { payload, index, score };
  }).filter(candidate => candidate.score > 0).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, Math.max(0, limit)).map(candidate => candidate.payload);
}
function sessionTopic(session) {
  if (!session) return '';
  return [titleOf(session), session.blk?.d, session.blk?.t, session.blk?.o, session.blk?.det].filter(Boolean).join(' ');
}
function curriculumCatalog(kind) {
  if (kind === 'notions') {
    return asArray(root.STI_DATA?.livresSTI?.[classe]?.items).filter(item => item && item.id).map(item => {
      const label = String(item.label || item.id);
      return {
        id: String(item.id),
        label,
        description: [item.domain, item.description].filter(Boolean).join(' · '),
        payload: { id: String(item.id), notion: label, domaine: String(item.domain || ''), description: String(item.description || ''), detail: String(item.detail || ''), type: String(item.kind || '') }
      };
    });
  }
  if (kind === 'competences') {
    return asArray(root.STI_DATA?.competences?.[classe]).filter(item => item && (item.code || item.t)).map(item => {
      const code = String(item.code || ''), title = String(item.t || 'Compétence');
      const attendu = asArray(item.attendu).map(String);
      return {
        id: `${code}|${title}`,
        label: `${code ? `${code} — ` : ''}${title}`,
        description: [item.domaine, attendu.slice(0, 2).join(' · ')].filter(Boolean).join(' — '),
        payload: { code, competence: title, domaine: String(item.domaine || ''), attendus: attendu }
      };
    });
  }
  return [];
}
function curriculumSelection(kind, selectedIds) {
  const selected = new Set(asArray(selectedIds).map(String));
  return curriculumCatalog(kind).filter(item => selected.has(item.id)).map(item => item.payload);
}
function selectedCountLabel(count) {
  return count ? `${count} sélectionnée${count > 1 ? 's' : ''}` : 'Aucune sélection';
}
function curriculumPicker(kind, title, selectedIds, help) {
  const items = curriculumCatalog(kind), selected = new Set(asArray(selectedIds).map(String));
  const searchLabel = kind === 'notions' ? 'Rechercher une notion' : 'Rechercher une compétence';
  return `<details class="agent-curriculum-picker full">
    <summary><strong>${esc(title)}</strong><span data-agent-selection-count="${kind}">${esc(selectedCountLabel(selected.size))}</span></summary>
    <p class="agent-curriculum-help">${esc(help)}</p>
    <label class="agent-curriculum-search"><span>${searchLabel}</span><input type="search" data-agent-catalog-filter="${kind}" aria-label="${searchLabel}" placeholder="${searchLabel}…" autocomplete="off"></label>
    <div class="agent-curriculum-options" data-agent-catalog-options="${kind}">${items.map(item => `<label class="agent-curriculum-option" data-agent-option="${kind}"><input type="checkbox" data-agent-selection="${kind}" value="${esc(item.id)}" ${selected.has(item.id) ? 'checked' : ''}><span><strong>${esc(item.label)}</strong><small>${esc(item.description)}</small></span></label>`).join('') || '<p class="agent-curriculum-empty">Aucune entrée du référentiel disponible pour cette classe.</p>'}</div>
    <p class="agent-curriculum-no-match" data-agent-no-match="${kind}" hidden>Aucune entrée ne correspond à cette recherche.</p>
  </details>`;
}
function activeTeacherProfile() {
  try {
    if (typeof root.activeProfessorProfile === 'function') return root.activeProfessorProfile() || null;
  } catch (_) { return null; }
  return ctx?.store?.profil && typeof ctx.store.profil === 'object' ? ctx.store.profil : null;
}
function activeTeacherKey() {
  const profile = activeTeacherProfile();
  if (!profile) return '';
  const id = String(profile.prof_id || '').trim();
  if (id) return `id:${id}`;
  const email = String(profile.email || '').trim().toLocaleLowerCase('en');
  return email ? `email:${email}` : '';
}
function resetTeacherWorkspace() {
  generationToken++;
  tool = 'fiche';
  classe = '3SI1';
  busy = false;
  error = '';
  notice = '';
  attachments = [];
  codeFiles = [];
  transcriptionReview = null;
  transcriptionAcknowledged = false;
  results = {};
  resultMeta = {};
  Object.keys(selectedSharedPromptIds).forEach(task => delete selectedSharedPromptIds[task]);
  Object.assign(forms, defaultForms());
}
function documentIdentity(meta = {}) {
  const profile = activeTeacherProfile();
  const referenceSchool = root.STI_DATA?.reference?.SCHOOL || root.SCHOOL || {};
  const school = String(profile?.lycee || referenceSchool.lycee || 'Lycée à renseigner').trim();
  const teacher = String(profile?.nom || [profile?.prenom, profile?.nom_famille].filter(Boolean).join(' ') || 'Nom et prénom à compléter').trim();
  return { school, teacher, classe: String(meta.classe || classe || '—').trim() };
}
function documentIdentityHtml(meta) {
  const identity = documentIdentity(meta);
  return `<div class="agent-doc-identity" aria-label="Identification du document"><div><span>Lycée</span><strong>${esc(identity.school)}</strong></div><div><span>Enseignant</span><strong>${esc(identity.teacher)}</strong></div><div><span>Classe</span><strong>${esc(identity.classe)}</strong></div></div>`;
}
function commonContext(task = tool) {
  const context = { agent: 'Agent Vie Scolaire AI' };
  if (task === 'document') return context;
  const schoolYear = String(root.STI_DATA?.reference?.SCHOOL?.annee || root.SCHOOL?.annee || '2026 - 2027').replace(/\s+/g, '');
  return {
    ...context,
    matiere: 'Sciences et technologies de l’informatique (STI)',
    programme: 'Programme tunisien — enseignement secondaire',
    annee_scolaire: schoolYear,
    classe,
    date_du_jour: today()
  };
}

function statusHtml() {
  if (!status) return '<span class="agent-status neutral"><i></i> Fournisseur distant à vérifier</span>';
  const provider = String(status.provider || '').trim();
  if (provider && provider !== 'DeepSeek') return `<span class="agent-status warn"><i></i> Fonction distante : ${esc(provider)} · portage DeepSeek non déployé</span>`;
  if (!provider) return '<span class="agent-status warn"><i></i> Fournisseur distant non confirmé · tester la connexion</span>';
  if (status.configured) return `<span class="agent-status ok"><i></i> DeepSeek configuré · ${esc(status.model || 'modèle configuré')}</span>`;
  return '<span class="agent-status warn"><i></i> Fonction DeepSeek déployée · secret à configurer</span>';
}
async function verifyDeepSeekDeployment() {
  const remoteStatus = await callAgent('status');
  status = remoteStatus;
  if (remoteStatus?.provider !== 'DeepSeek') {
    const provider = String(remoteStatus?.provider || 'inconnu').trim();
    throw new Error(`La fonction Supabase distante signale « ${provider} ». Le portage DeepSeek n’est pas déployé; aucune génération n’a été envoyée.`);
  }
  if (!remoteStatus.configured) {
    throw new Error('La fonction Supabase utilise DeepSeek, mais DEEPSEEK_API_KEY n’est pas configurée.');
  }
  return remoteStatus;
}
function contextCard() {
  if (!['fiche', 'cahier'].includes(tool)) {
    if (tool === 'repartition') {
      const count = sessions().filter(s => s.tri === Number(forms.repartition.trimestre)).length;
      return `<div class="agent-context-card"><span>Contexte automatique</span><strong>${classe} · T${forms.repartition.trimestre}</strong><p>${count} séances, leurs dates, les références officielles et votre avancement seront transmis.</p></div>`;
    }
    if (tool === 'exercices') {
      return `<div class="agent-context-card"><span>Référentiel disponible</span><strong>Programme ${classe}</strong><p>L’agent peut mobiliser les compétences et les notions du Smart Book liées à votre sujet.</p></div>`;
    }
    if (tool === 'document') {
      return `<div class="agent-context-card"><span>Source protégée</span><strong>Texte révisé, fichier inchangé</strong><p>La comparaison et les versions restent dans l’historique local de votre compte. Exportez le résultat pour remplacer vous-même le fichier source.</p></div>`;
    }
    return `<div class="agent-context-card"><span>Confidentialité</span><strong>Copie anonymisée</strong><p>Utilisez un identifiant de copie plutôt que le nom complet de l’élève. Aucune note n’est enregistrée automatiquement.</p></div>`;
  }
  const s = findSession(forms[tool].session);
  if (!s) return '';
  return `<div class="agent-context-card"><span>Séance sélectionnée</span><strong>${esc(s.cls)} · S${s.n}</strong><p>${esc(titleOf(s))}</p><small>${esc(dateLong(s.iso))} · ${esc(s.blk?.d || 'STI')}</small></div>`;
}
function sessionOptions() {
  const selected = forms[tool]?.session || '';
  return sessions().map(s => `<option value="${keyOf(s)}" ${selected === keyOf(s) ? 'selected' : ''}>${esc(`S${s.n} · ${dateLong(s.iso)} · ${titleOf(s)}`)}</option>`).join('');
}
function assignmentTypeOptions(value) {
  return ['théorique', 'pratique'].map(x => `<option value="${x}" ${value === x ? 'selected' : ''}>${x === 'pratique' ? 'Pratique' : 'Théorique'}</option>`).join('');
}
function loadSharedPromptLibrary(force = false) {
  const user = typeof root.authUser === 'function' ? String(root.authUser() || '').trim().toLocaleLowerCase('en') : '';
  if (typeof root.cloudReady !== 'function' || !root.cloudReady() || !user) {
    sharedPromptState = 'error';
    sharedPromptError = 'Connectez-vous à Supabase pour consulter la bibliothèque partagée.';
    return Promise.resolve([]);
  }
  if (sharedPromptUser !== user) {
    sharedPrompts = [];
    sharedPromptState = 'idle';
    sharedPromptError = '';
    sharedPromptUser = user;
    Object.keys(selectedSharedPromptIds).forEach(task => delete selectedSharedPromptIds[task]);
  }
  if (sharedPromptPromise) return sharedPromptPromise;
  if (!force && ['loaded', 'error'].includes(sharedPromptState)) return Promise.resolve(sharedPrompts);
  sharedPromptState = 'loading';
  sharedPromptError = '';
  sharedPromptPromise = (async () => {
    try {
      const token = await root.authToken();
      if (!token) throw new Error('Session professeur absente ou expirée. Reconnectez-vous.');
      const cfg = root.cloudCfg();
      const response = await fetch(`${cfg.url.replace(/\/$/, '')}/functions/v1/prompt-manager`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: cfg.key, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'list' })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      sharedPrompts = asArray(data.prompts).filter(item => item && item.id && TASKS[item.task] && item.title && item.prompt).map(item => ({
        id: String(item.id), task: String(item.task), title: String(item.title).slice(0, 120),
        description: String(item.description || '').slice(0, 300), prompt: String(item.prompt).slice(0, 4000)
      }));
      Object.keys(selectedSharedPromptIds).forEach(task => {
        const availableIds = new Set(sharedPrompts.filter(item => item.task === task).map(item => item.id));
        selectedSharedPromptIds[task] = asArray(selectedSharedPromptIds[task]).filter(id => availableIds.has(String(id)));
      });
      sharedPromptState = 'loaded';
      return sharedPrompts;
    } catch (e) {
      sharedPrompts = [];
      sharedPromptState = 'error';
      sharedPromptError = String(e?.message || e || 'Bibliothèque partagée indisponible.');
      return [];
    } finally {
      sharedPromptPromise = null;
    }
  })();
  return sharedPromptPromise;
}
function reloadSharedPromptLibrary() {
  sharedPromptState = 'idle';
  sharedPromptError = '';
  sharedPrompts = [];
  loadSharedPromptLibrary(true).then(() => { if (ctx?.view === 'v-agent') draw(); });
}
function selectedPromptsForTask(task) {
  const ids = new Set(asArray(selectedSharedPromptIds[task]).map(String));
  return sharedPrompts.filter(item => item.task === task && ids.has(item.id)).slice(0, MAX_SHARED_PROMPTS);
}
function sharedPromptPickerHtml() {
  if (!TASKS[tool] || sharedPromptState === 'idle') return '';
  const available = sharedPrompts.filter(item => item.task === tool);
  let content = '';
  if (sharedPromptState === 'loading') {
    content = '<p class="agent-shared-prompts-empty" role="status">Chargement de la bibliothèque partagée…</p>';
  } else if (sharedPromptState === 'error') {
    content = `<div class="agent-shared-prompts-empty" role="status">La bibliothèque n’est pas disponible : ${esc(sharedPromptError)} <button type="button" class="btn btn-ghost" data-agent-prompts-reload>Réessayer</button><small>Vous pouvez continuer à utiliser DeepSeek sans prompt partagé.</small></div>`;
  } else if (!available.length) {
    content = '<p class="agent-shared-prompts-empty">Aucun prompt approuvé pour cet outil. Les consignes intégrées restent actives.</p>';
  } else {
    const selected = new Set(asArray(selectedSharedPromptIds[tool]).map(String));
    content = `<div class="agent-shared-prompts-list">${available.map(item => `<article class="agent-shared-prompt-option"><label><input type="checkbox" data-agent-prompt-selection value="${esc(item.id)}" ${selected.has(item.id) ? 'checked' : ''}><span><strong>${esc(item.title)}</strong><small>${esc(item.description || 'Prompt approuvé et partagé')}</small></span></label><details><summary>Voir le prompt</summary><pre>${esc(item.prompt)}</pre></details></article>`).join('')}</div>`;
  }
  const count = selectedPromptsForTask(tool).length;
  const correctionNote = tool === 'correction' ? '<small>Pour les copies manuscrites ou un barème proposé, ces prompts seront appliqués uniquement à l’analyse finale, pas à la prélecture ni à la proposition de barème.</small>' : '';
  return `<section class="agent-shared-prompts agent-no-print" aria-label="Prompts approuvés pour DeepSeek"><div class="agent-shared-prompts-heading"><div><strong>Prompts approuvés pour DeepSeek</strong><span>Bibliothèque partagée · <span data-agent-prompt-count="${esc(tool)}">${count}</span> sélectionné(s), ${MAX_SHARED_PROMPTS} maximum</span></div><span class="agent-shared-prompts-lock">Validés avant partage</span></div><p>Les prompts cochés seront ajoutés comme consignes complémentaires à DeepSeek. Claude sert uniquement à créer des brouillons génériques en amont : il ne reçoit pas vos demandes, copies, images ni données d’élèves.</p>${correctionNote}${content}</section>`;
}
function generateButton(label = 'Générer avec mon agent') {
  return `${sharedPromptPickerHtml()}${contextReviewHtml()}<div class="agent-form-footer"><button class="btn btn-primary agent-generate" type="button" data-agent-generate ${busy ? 'disabled' : ''}>${icon('spark')} ${busy ? 'L’agent travaille…' : esc(label)}</button><span>Une proposition sera affichée avant toute application.</span></div>`;
}
function formHtml() {
  const f = forms[tool];
  if (tool === 'fiche') {
    const selectedSession = findSession(f.session);
    const existingPreparation = selectedSession ? String(record(selectedSession).preparation || '').trim() : '';
    return `
    <div class="agent-form-grid">
      <label class="agent-field full"><span>Séance du planning</span><select data-agent-field="session">${sessionOptions()}</select></label>
      ${existingPreparation ? `<label class="agent-replace-option full"><input type="checkbox" data-agent-field="remplacer" ${f.remplacer ? 'checked' : ''}><span><strong>Préparer une nouvelle version de la fiche existante</strong><small>Une fiche est déjà enregistrée pour cette séance. Le contenu actuel sera fourni comme référence, puis vous pourrez confirmer son remplacement.</small></span></label>` : ''}
      ${curriculumPicker('notions', 'Notions du référentiel', f.notions, 'Les notions déjà renseignées pour cette séance sont présélectionnées. Vous pouvez en choisir plusieurs ou laisser la sélection vide.')}
      ${curriculumPicker('competences', 'Compétences ciblées', f.competences, 'Choisissez les compétences de Sciences et technologies de l’informatique à travailler dans cette fiche.')}
      <label class="agent-field"><span>Méthode pédagogique</span><select data-agent-field="methode">${['Cours dialogué et TP guidé', 'TP principalement pratique', 'Apprentissage par projet', 'Révision et remédiation', 'Correction d’évaluation'].map(x => `<option ${f.methode === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <label class="agent-field"><span>Objectif prioritaire <em>facultatif</em></span><input data-agent-field="objectif" value="${esc(f.objectif)}" placeholder="Ex. : savoir contrôler un formulaire"></label>
      <label class="agent-field full"><span>Vos consignes <em>facultatif</em></span><textarea data-agent-field="consignes" rows="4" placeholder="Matériel disponible, difficultés des groupes, activité à privilégier…">${esc(f.consignes)}</textarea></label>
    </div>${generateButton('Générer la fiche pédagogique')}`;
  }
  if (tool === 'exercices') {
    const exerciseHistory = currentHistory().filter(item => item.task === 'exercices' && item.result && item.classe === classe);
    return `
    <div class="agent-form-grid">
      <label class="agent-field full"><span>Notion ou thème</span><input data-agent-field="sujet" value="${esc(f.sujet)}" required placeholder="Ex. : JavaScript — événements et contrôle de saisie"></label>
      <label class="agent-field full"><span>Série de l’historique à remplacer <em>facultatif</em></span><select data-agent-field="remplacement_id"><option value="">Créer une nouvelle série</option>${exerciseHistory.map(item => `<option value="${esc(item.id)}" ${f.remplacement_id === item.id ? 'selected' : ''}>${esc(item.title)} · ${esc(item.classe)} · ${esc(new Date(item.created).toLocaleDateString('fr-FR'))}</option>`).join('')}</select><small>Choisissez une série récente de l’historique local pour produire une nouvelle version. Le remplacement ne sera fait qu’après votre confirmation.</small></label>
      <label class="agent-field full"><span>Contenu existant à réviser <em>facultatif, si la série ne figure pas dans l’historique</em></span><textarea data-agent-field="document_existant" rows="4" placeholder="Collez ici la série actuelle pour que l’agent prépare une version de remplacement…">${esc(f.document_existant)}</textarea><small>Le contenu sera utilisé comme référence; l’original ne sera jamais modifié sans votre action.</small></label>
      ${curriculumPicker('notions', 'Notions du référentiel', f.notions, 'Sélection facultative. Sans sélection, l’agent proposera des notions correspondant au thème saisi.')}
      ${curriculumPicker('competences', 'Compétences ciblées', f.competences, 'Sélection facultative des compétences que les exercices doivent évaluer.')}
      <label class="agent-field"><span>Type de devoir</span><select data-agent-field="type_devoir">${assignmentTypeOptions(f.type_devoir)}</select></label>
      <label class="agent-field"><span>Type de document</span><select data-agent-field="format">${['Série d’exercices', 'Travail pratique', 'Devoir de contrôle', 'Révision orientée bac'].map(x => `<option ${f.format === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <label class="agent-field"><span>Difficulté</span><select data-agent-field="difficulte">${['Progressive', 'Facile', 'Moyenne', 'Difficile', 'Niveau baccalauréat'].map(x => `<option ${f.difficulte === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <label class="agent-field"><span>Nombre d’exercices</span><input type="number" min="1" max="10" data-agent-field="nombre" value="${esc(f.nombre)}"></label>
      <label class="agent-field"><span>Durée estimée (minutes)</span><input type="number" min="15" max="300" step="15" data-agent-field="duree" value="${esc(f.duree)}"></label>
      <label class="agent-field full"><span>Contraintes <em>facultatif</em></span><textarea data-agent-field="contraintes" rows="3" placeholder="Ex. : utiliser un formulaire HTML, interdire les attributs d’événement inline, prévoir un exercice de remédiation…">${esc(f.contraintes)}</textarea></label>
    </div>${generateButton(f.remplacement_id ? 'Générer la version de remplacement' : 'Générer les exercices et le corrigé')}`;
  }
  if (tool === 'cahier') {
    const s = findSession(f.session);
    const existingEntry = s ? String(record(s).contenu || '').trim() : '';
    return `<div class="agent-truth-note">${icon('shield')}<div><strong>Le cahier décrit le réellement effectué.</strong><span>L’agent reformule vos informations ; il ne doit pas déduire qu’un cours a été assuré à partir de sa seule date.</span></div></div>
    <div class="agent-form-grid">
      <label class="agent-field full"><span>Séance concernée</span><select data-agent-field="session">${sessionOptions()}</select></label>
      ${existingEntry ? `<label class="agent-replace-option full"><input type="checkbox" data-agent-field="remplacer" ${f.remplacer ? 'checked' : ''}><span><strong>Préparer une nouvelle version de l’entrée existante</strong><small>Une entrée de cahier est déjà enregistrée pour cette séance. Le texte actuel servira de référence; le remplacement demandera votre confirmation.</small></span></label>` : ''}
      <label class="agent-field full"><span>Ce qui a réellement été fait ${record(s).contenu ? '· contenu existant déjà disponible' : ''}</span><textarea data-agent-field="realise" rows="5" placeholder="Ex. : rappel de 10 min, démonstration de getElementById, TP2 commencé, exercices 1 et 2 terminés…">${esc(f.realise)}</textarea></label>
      <label class="agent-field"><span>Travail donné <em>facultatif</em></span><input data-agent-field="devoirs" value="${esc(f.devoirs)}" placeholder="Ex. : terminer l’exercice 3"></label>
      <label class="agent-field"><span>Observations <em>facultatif</em></span><input data-agent-field="observations" value="${esc(f.observations)}" placeholder="Ex. : reprendre les événements"></label>
    </div>${generateButton('Rédiger l’entrée du cahier')}`;
  }
  if (tool === 'repartition') return `
    <div class="agent-form-grid">
      <label class="agent-field"><span>Trimestre</span><select data-agent-field="trimestre">${[1, 2, 3].map(x => `<option value="${x}" ${Number(f.trimestre) === x ? 'selected' : ''}>${x}${x === 1 ? 'er' : 'e'} trimestre</option>`).join('')}</select></label>
      <label class="agent-field"><span>Classe et calendrier</span><input value="${classe} · dates et numéros conservés" disabled></label>
      <label class="agent-field full"><span>Objectifs de la réorganisation</span><textarea data-agent-field="consignes" rows="5">${esc(f.consignes)}</textarea></label>
    </div><div class="agent-truth-note">${icon('calendar')}<div><strong>Dates, vacances et évaluations restent repérables.</strong><span>L’application n’écrase ni le contenu réalisé ni les séances assurées. L’application de la proposition ne concerne que les séances à venir.</span></div></div>${generateButton('Proposer la répartition')}`;
  if (tool === 'document') {
    const savedDocuments = currentHistory().filter(item => item.task === 'document' && item.result && item.classe === classe);
    return `<div class="agent-truth-note">${icon('shield')}<div><strong>Le fichier original ne sera jamais modifié par l’agent.</strong><span>Collez votre texte ou importez un fichier TXT, Markdown ou HTML. Pour un PDF ou Word, copiez le texte. La comparaison, l’export et l’historique restent sous votre contrôle.</span></div></div>
    <div class="agent-form-grid">
      <label class="agent-field"><span>Titre du document</span><input data-agent-field="titre" value="${esc(f.titre)}" maxlength="140" required placeholder="Ex. : Note aux parents · sortie pédagogique"></label>
      <label class="agent-field"><span>Type de document</span><input data-agent-field="type_document" value="${esc(f.type_document)}" maxlength="80" required placeholder="Ex. : note, compte rendu, courrier administratif…"></label>
      <label class="agent-field full"><span>Document enregistré à réviser <em>facultatif</em></span><select data-agent-field="remplacement_id"><option value="">Réviser un nouveau texte collé ou importé</option>${savedDocuments.map(item => `<option value="${esc(item.id)}" ${f.remplacement_id === item.id ? 'selected' : ''}>${esc(item.title)} · ${esc(item.classe)} · ${esc(new Date(item.created).toLocaleDateString('fr-FR'))}</option>`).join('')}</select><small>Une version précédente de cet historique sera gardée et pourra être restaurée. La source externe ne sera pas modifiée.</small></label>
      <label class="agent-field full agent-upload"><span>Importer un fichier texte <em>facultatif</em></span><input id="agent-document-file" type="file" accept=".txt,.md,.markdown,.html,.htm,text/plain,text/markdown,text/html"><small>TXT, Markdown ou HTML · ${MAX_DOCUMENT_CHARS.toLocaleString('fr-FR')} caractères maximum · aucun fichier binaire ni donnée non textuelle.</small></label>
      ${f.fichier_nom ? `<div class="agent-attachments full"><span>${esc(f.fichier_nom)}</span></div>` : ''}
      <label class="agent-field full"><span>Texte source à réviser</span><textarea data-agent-field="document_existant" rows="12" maxlength="${MAX_DOCUMENT_CHARS}" required placeholder="Collez ici le contenu complet du document à réviser…">${esc(f.document_existant)}</textarea><small><span id="agent-document-count">${f.document_existant.length.toLocaleString('fr-FR')} / ${MAX_DOCUMENT_CHARS.toLocaleString('fr-FR')} caractères</span> · Le texte source est transmis à DeepSeek seulement quand vous lancez la révision.</small></label>
      <label class="agent-field full"><span>Modifications souhaitées <em>facultatif</em></span><textarea data-agent-field="consignes" rows="4" placeholder="Ex. : clarifier les dates, corriger la langue et conserver toutes les consignes administratives…">${esc(f.consignes)}</textarea></label>
    </div>${generateButton(f.remplacement_id ? 'Comparer et proposer le remplacement' : 'Comparer et réviser le document')}`;
  }
  const practical = f.type_devoir === 'pratique';
  const proposeRubric = f.mode_bareme === 'proposer';
  const rubricFirst = proposeRubric && !f.bareme.trim();
  const handwritingFirst = shouldTranscribeHandwriting(f, attachments.length) && !transcriptionReview;
  return `
    <div class="agent-form-grid">
      <label class="agent-field"><span>Type de devoir</span><select data-agent-field="type_devoir">${assignmentTypeOptions(f.type_devoir)}</select></label>
      <label class="agent-field"><span>Mode de barème</span><select data-agent-field="mode_bareme"><option value="fourni" ${f.mode_bareme === 'fourni' ? 'selected' : ''}>Je fournis le barème</option><option value="proposer" ${proposeRubric ? 'selected' : ''}>L’agent propose le barème</option></select></label>
      <label class="agent-field"><span>Identifiant anonyme de la copie</span><input data-agent-field="identifiant" value="${esc(f.identifiant)}" maxlength="60"></label>
      <label class="agent-field"><span>Note maximale</span><input type="number" min="1" max="1000" data-agent-field="sur" value="${esc(f.sur)}"></label>
      <label class="agent-field full"><span>${practical ? 'Sujet, consignes techniques et corrigé de référence' : 'Sujet et corrigé de référence'}</span><textarea data-agent-field="sujet" rows="6" placeholder="${practical ? 'Décrivez le travail attendu, les fichiers à produire, les technologies imposées et les critères de fonctionnement…' : 'Collez les questions et, si possible, les réponses attendues…'}">${esc(f.sujet)}</textarea></label>
      <label class="agent-field full"><span>${proposeRubric ? 'Barème proposé · à relire et modifier avant la correction' : 'Barème détaillé'}</span><textarea data-agent-field="bareme" rows="4" placeholder="${proposeRubric ? 'Laissez vide pour que l’agent propose d’abord un barème. Vous pourrez ensuite le modifier ici.' : 'Ex. : Exercice 1 : 6 pts (Q1 : 2 pts, Q2 : 4 pts) ; exercice 2 : 8 pts…'}">${esc(f.bareme)}</textarea>${proposeRubric ? '<small>Première étape : proposition du barème. Deuxième étape : correction avec le texte que vous aurez validé.</small>' : ''}</label>
      ${practical ? `<label class="agent-field full agent-upload"><span>Fichiers de code de l’élève · ${codeFiles.length}/${MAX_CODE_FILES}</span><input id="agent-code-files" type="file" accept=".html,.htm,.css,.js,.php,.sql,.txt,.json" multiple><small>HTML, CSS, JS, PHP, SQL, TXT ou JSON · 8 fichiers, 200 Ko chacun. Leur contenu est lu localement puis transmis avec la demande.</small></label>${codeFiles.length ? `<div class="agent-attachments full">${codeFiles.map((file, i) => `<span>${esc(file.name)}<button type="button" data-agent-remove-code="${i}" aria-label="Retirer ${esc(file.name)}">×</button></span>`).join('')}</div>` : ''}` : ''}
      <label class="agent-field full"><span>${practical ? 'Code ou réponses de l’élève en texte' : 'Réponses de l’élève en texte'} <em>formats combinables avec les fichiers et images</em></span><textarea data-agent-field="copie" rows="6" placeholder="${practical ? 'Collez ici le code de l’élève ou les résultats de ses tests…' : 'Collez ici la transcription de la copie, ou laissez vide si vous ajoutez des photos…'}">${esc(f.copie)}</textarea></label>
      <label class="agent-field full agent-upload"><span>${practical ? 'Captures du code, du rendu ou des tests' : 'Photos de la copie'} · ${attachments.length}/${MAX_IMAGES}</span><input id="agent-copy-files" type="file" accept="image/jpeg,image/png,image/webp" multiple><small>JPEG, PNG ou WebP. Les images sont réduites dans le navigateur avant l’envoi. 6 images maximum par analyse.</small></label>
      ${attachments.length ? `<div class="agent-attachments full">${attachments.map((a, i) => `<span>${esc(a.name)}<button type="button" data-agent-remove="${i}" aria-label="Retirer ${esc(a.name)}">×</button></span>`).join('')}</div>` : ''}
      <label class="agent-field full"><span>Règles d’appréciation <em>facultatif</em></span><input data-agent-field="consignes" value="${esc(f.consignes)}" placeholder="Ex. : valoriser la démarche, ne pas pénaliser deux fois la même erreur"></label>
    </div><div class="agent-truth-note">${icon('shield')}<div><strong>${practical ? 'Le code n’est pas réputé exécuté par l’agent.' : 'Correction assistée, jamais note automatique définitive.'}</strong><span>${practical ? 'Sans résultat de test fourni, l’agent distingue l’analyse du code du fonctionnement réel à vérifier. Vous gardez la validation finale.' : 'Vérifiez chaque attribution de points et les passages marqués comme illisibles avant de saisir la note dans votre espace élèves.'}</span></div></div>${transcriptionReview ? contextReviewHtml() + '<div class="agent-form-footer"><span>La transcription est prête. Relisez-la et poursuivez depuis l’avertissement ci-dessous.</span></div>' : generateButton(rubricFirst ? 'Proposer d’abord le barème' : handwritingFirst ? 'Transcrire avant correction' : 'Analyser et proposer une correction')}`;
}

function resultHeader(title, subtitle, applyLabel = '', restoreLabel = '', statusLabel = 'PROPOSITION DE L’AGENT · À VÉRIFIER') {
  return `<div class="agent-result-top agent-no-print"><div><span>${esc(statusLabel)}</span><strong>${esc(title)}</strong>${subtitle ? `<small>${esc(subtitle)}</small>` : ''}</div><div class="agent-result-actions">${applyLabel ? `<button type="button" class="btn btn-primary" data-agent-apply>${icon('arrow')} ${esc(applyLabel)}</button>` : ''}${restoreLabel ? `<button type="button" class="btn btn-ghost" data-agent-restore-document>${icon('arrow')} ${esc(restoreLabel)}</button>` : ''}<button type="button" class="btn btn-ghost" data-agent-download>${icon('download')} Exporter</button><button type="button" class="btn btn-ghost" data-agent-print>${icon('print')} Imprimer</button></div></div>`;
}
function chipList(items) {
  return `<div class="agent-tags">${asArray(items).map(x => `<span>${esc(x)}</span>`).join('') || '<span>Non renseigné</span>'}</div>`;
}
function bulletList(items) {
  return `<ul>${asArray(items).map(x => `<li>${nl(typeof x === 'object' ? Object.values(x).join(' — ') : x)}</li>`).join('') || '<li>Non renseigné</li>'}</ul>`;
}
function renderFiche(r, meta) {
  const phases = asArray(r.deroulement);
  const session = findSession(meta.session, meta.classe);
  const hasExisting = Boolean(session && String(record(session).preparation || '').trim());
  return `${resultHeader(r.titre || 'Fiche pédagogique', `${meta.classe} · ${dateLong(meta.date)}`, hasExisting ? 'Remplacer la fiche existante' : 'Utiliser dans la fiche')}<div id="agent-result" class="agent-document">
    ${documentIdentityHtml(meta)}
    <div class="agent-doc-heading"><span>FICHE PÉDAGOGIQUE · ${esc(meta.classe)}</span><h2>${esc(r.titre || 'Séance STI')}</h2><p>${esc(dateLong(meta.date))}</p></div>
    <div class="agent-doc-grid"><section><h3>Objectifs</h3>${bulletList(r.objectifs)}</section><section><h3>Prérequis</h3>${bulletList(r.prerequis)}</section></div>
    <section><h3>Déroulement proposé</h3><div class="agent-phases">${phases.map((p, i) => `<div><span>${String(i + 1).padStart(2, '0')}</span><div><strong>${esc(p.phase || `Phase ${i + 1}`)} <em>${esc(p.duree || '')}</em></strong><p><b>Enseignant :</b> ${nl(p.activite_enseignant || p.enseignant)}</p><p><b>Élèves :</b> ${nl(p.activite_eleve || p.eleves)}</p>${p.trace ? `<p><b>Trace / évaluation :</b> ${nl(p.trace)}</p>` : ''}</div></div>`).join('') || '<p>Déroulement non renseigné.</p>'}</div></section>
    <section><h3>Notions mobilisées</h3>${chipList(r.notions)}</section>
    ${asArray(r.competences).length ? `<section><h3>Compétences ciblées</h3>${chipList(r.competences)}</section>` : ''}
    <div class="agent-doc-grid"><section><h3>Travail à la maison</h3><p>${nl(r.travail_maison)}</p></section><section><h3>Supports</h3>${bulletList(r.supports)}</section></div>
    <div class="agent-doc-grid"><section><h3>Évaluation des acquis</h3><p>${nl(r.evaluation)}</p></section><section><h3>Remédiation</h3><p>${nl(r.remediation)}</p></section></div>
  </div>`;
}
function renderExercices(r, meta) {
  const exos = asArray(r.exercices);
  const replacementTarget = currentHistory().find(item => item.id === meta.remplacement_id && item.task === 'exercices' && item.classe === meta.classe);
  const replaceLabel = replacementTarget ? 'Remplacer la série sélectionnée' : '';
  return `${resultHeader(r.titre || 'Série d’exercices', `${meta.classe} · ${asArray(exos).length} exercice(s)`, replaceLabel)}<div id="agent-result" class="agent-document">
    ${documentIdentityHtml(meta)}
    <div class="agent-doc-heading"><span>${esc(r.format || 'SÉRIE D’EXERCICES')} · ${esc(meta.classe)} · ${esc((meta.type_devoir || 'théorique').toUpperCase())}</span><h2>${esc(r.titre || 'Exercices STI')}</h2><p>${esc(r.duree || forms.exercices.duree + ' min')}${r.bareme_total ? ` · Barème : ${esc(r.bareme_total)}` : ''}</p></div>
    ${r.introduction ? `<p class="agent-intro">${nl(r.introduction)}</p>` : ''}
    ${asArray(r.notions).length ? `<section><h3>Notions ciblées</h3>${chipList(r.notions)}</section>` : ''}
    ${exos.map((ex, i) => `<section class="agent-exercise"><h3>Exercice ${i + 1}${ex.titre ? ` — ${esc(ex.titre)}` : ''}${ex.points ? `<span>${esc(ex.points)}</span>` : ''}</h3><p>${nl(ex.enonce)}</p>${asArray(ex.questions).length ? `<ol>${asArray(ex.questions).map(q => `<li>${nl(typeof q === 'object' ? q.enonce || q.question : q)}${typeof q === 'object' && q.bareme ? `<em class="agent-points">${esc(q.bareme)}</em>` : ''}</li>`).join('')}</ol>` : ''}<details class="agent-correction"><summary>Voir le corrigé</summary><div>${nl(ex.correction)}${asArray(ex.corrige).length ? `<ol>${asArray(ex.corrige).map(q => `<li>${nl(typeof q === 'object' ? [q.reponse, q.explication].filter(Boolean).join(' — ') : q)}</li>`).join('')}</ol>` : ''}</div></details></section>`).join('') || '<p>Aucun exercice structuré dans la réponse.</p>'}
    ${asArray(r.competences).length ? `<section><h3>Compétences travaillées</h3>${chipList(r.competences)}</section>` : ''}
  </div>`;
}
function renderCahier(r, meta) {
  const session = findSession(meta.session, meta.classe);
  const hasExisting = Boolean(session && String(record(session).contenu || '').trim());
  return `${resultHeader(`Cahier de textes · S${meta.numero}`, `${meta.classe} · ${dateLong(meta.date)}`, hasExisting ? 'Remplacer l’entrée du cahier' : 'Insérer dans le cahier')}<div id="agent-result" class="agent-document">
    ${documentIdentityHtml(meta)}
    <div class="agent-doc-heading"><span>CAHIER DE TEXTES · ${esc(meta.classe)} · SÉANCE ${esc(meta.numero)}</span><h2>${esc(r.titre || meta.titre)}</h2><p>${esc(dateLong(meta.date))}</p></div>
    <section><h3>Contenu réellement effectué · formulation à valider</h3><p>${nl(r.contenu)}</p></section>
    <section><h3>Notions abordées</h3>${chipList(r.notions)}</section>
    <div class="agent-doc-grid"><section><h3>Travail à la maison</h3><p>${nl(r.travail_maison)}</p></section><section><h3>Observations</h3><p>${nl(r.observations)}</p></section></div>
    ${r.points_a_reprendre ? `<section><h3>Points à reprendre</h3><p>${nl(r.points_a_reprendre)}</p></section>` : ''}
  </div>`;
}
function renderRepartition(r, meta) {
  const rows = asArray(r.seances);
  return `${resultHeader(r.titre || `Répartition ${meta.classe} · T${meta.trimestre}`, `${rows.length} séance(s) proposée(s) · dates inchangées`, 'Appliquer aux séances à venir')}<div id="agent-result" class="agent-document">
    ${documentIdentityHtml(meta)}
    <div class="agent-doc-heading"><span>RÉPARTITION PÉDAGOGIQUE · ${esc(meta.classe)} · TRIMESTRE ${esc(meta.trimestre)}</span><h2>${esc(r.titre || 'Progression proposée')}</h2></div>
    ${asArray(r.avertissements).length ? `<div class="agent-uncertainties"><strong>Points de vigilance</strong>${bulletList(r.avertissements)}</div>` : ''}
    <div class="agent-table-wrap"><table class="agent-table"><thead><tr><th>N° / date</th><th>Séance proposée</th><th>Objectif et travail</th></tr></thead><tbody>${rows.map(s => `<tr><td><strong>S${esc(s.numero ?? s.n)}</strong><br>${esc(s.date || '')}</td><td><strong>${esc(s.titre)}</strong><br><small>${esc(s.domaine || '')}${s.type ? ` · ${esc(s.type)}` : ''}</small></td><td>${nl(s.objectif)}${s.travail_maison ? `<p><b>Devoir :</b> ${nl(s.travail_maison)}</p>` : ''}</td></tr>`).join('')}</tbody></table></div>
  </div>`;
}
function renderTranscriptionReview() {
  if (!transcriptionReview) return '';
  const uncertain = asArray(transcriptionReview.transcription_incertaine);
  const needsAck = hasUncertainTranscription(transcriptionReview);
  const confidence = String(transcriptionReview.confiance_globale || 'à vérifier');
  const uncertaintyMessage = uncertain.length
    ? `<strong>${uncertain.length} passage(s) signalé(s) comme incertain(s)</strong>${bulletList(uncertain)}`
    : `<strong>La lecture est évaluée comme ${esc(confidence)}.</strong><p>Relisez la transcription avant de poursuivre.</p>`;
  return `<section class="agent-transcription-review agent-no-print" aria-labelledby="agent-transcription-title">
    <div class="agent-transcription-heading"><span>${icon('file')}</span><div><small>LECTURE DES PHOTOS</small><h3 id="agent-transcription-title">Transcription à relire · confiance ${esc(confidence)}</h3></div></div>
    ${needsAck ? `<div class="agent-uncertainties" role="alert">${uncertaintyMessage}</div>` : '<div class="agent-message success"><strong>Aucun passage incertain signalé.</strong><p>Relisez tout de même le texte avant de lancer la correction.</p></div>'}
    <p class="agent-transcription-help">La transcription est préremplie dans le champ « Réponses de l’élève » ci-dessus. Vous pouvez la corriger avant de continuer.</p>
    ${needsAck ? `<label class="agent-transcription-ack"><input id="agent-transcription-ack" data-agent-transcription-ack type="checkbox" ${transcriptionAcknowledged ? 'checked' : ''}><span>J’ai relu la transcription et je souhaite poursuivre malgré les passages incertains.</span></label>` : ''}
    <div class="agent-transcription-actions"><button class="btn btn-primary" type="button" data-agent-transcription-proceed ${needsAck && !transcriptionAcknowledged ? 'disabled' : ''}>${needsAck ? 'Continuer malgré les incertitudes' : 'Valider la transcription et corriger'}</button><button class="btn btn-ghost" type="button" data-agent-transcription-reset>Relire les photos</button></div>
  </section>`;
}
function renderDocument(r, meta) {
  const title = String(r.titre || meta.titre || 'Document révisé');
  const source = String(meta.document_source_content || '');
  const savedEntry = meta.document_history_id
    ? currentHistory().find(item => item.id === meta.document_history_id && item.task === 'document' && item.classe === meta.classe)
    : null;
  const versions = savedEntry ? documentVersions(savedEntry) : [];
  const currentIndex = savedEntry ? currentDocumentVersionIndex(savedEntry, versions) : -1;
  const current = currentIndex >= 0 ? versions[currentIndex] : null;
  const canRestore = Boolean(meta.document_saved && current && currentIndex > 0);
  const applyLabel = meta.document_saved
    ? ''
    : (meta.document_replacement_id ? 'Confirmer le remplacement local' : 'Enregistrer dans l’historique');
  return `${resultHeader(title, `${meta.type_document || r.type_document || 'Document libre'} · ${meta.classe} · comparaison avant/après`, applyLabel, canRestore ? 'Restaurer la version précédente' : '', meta.document_saved ? 'VERSION ENREGISTRÉE · HISTORIQUE LOCAL' : 'PROPOSITION DE L’AGENT · À VÉRIFIER')}
    <div class="agent-document-comparison agent-no-print" aria-label="Comparaison du document source et de la proposition">
      <section class="agent-comparison-panel"><div class="agent-comparison-heading"><span>AVANT</span><strong>${meta.document_saved ? 'Version remplacée' : 'Document source'}</strong></div><pre>${esc(source || 'Texte source indisponible.')}</pre></section>
      <section class="agent-comparison-panel proposed"><div class="agent-comparison-heading"><span>APRÈS</span><strong>Révision proposée</strong></div><pre>${esc(r.contenu || '')}</pre></section>
    </div>
    <div id="agent-result" class="agent-document">
      ${documentIdentityHtml(meta)}
      <div class="agent-doc-heading"><span>${esc(String(r.type_document || meta.type_document || 'DOCUMENT LIBRE').toUpperCase())} · ${esc(meta.classe)}</span><h2>${esc(title)}</h2><p>${meta.document_saved ? 'Version enregistrée dans l’historique local' : 'Proposition à vérifier avant enregistrement'}</p></div>
      <section class="agent-document-content"><h3>Texte révisé</h3><pre>${esc(r.contenu || '')}</pre></section>
      ${asArray(r.changements).length ? `<section><h3>Principales modifications</h3>${bulletList(r.changements)}</section>` : ''}
      ${asArray(r.points_a_verifier).length ? `<div class="agent-uncertainties"><strong>Points à vérifier avant utilisation</strong>${bulletList(r.points_a_verifier)}</div>` : ''}
    </div>`;
}
function renderCorrection(r, meta) {
  const questions = asArray(r.questions);
  const uncertain = asArray(r.transcription_incertaine);
  const limitations = asArray(r.limites_analyse);
  return `${resultHeader(`Correction · ${meta.identifiant}`, `${meta.classe} · ${meta.type_devoir || 'théorique'} · note proposée à contrôler`)}<div id="agent-result" class="agent-document">
    ${documentIdentityHtml(meta)}
    <div class="agent-doc-heading"><span>CORRECTION ${esc((meta.type_devoir || 'théorique').toUpperCase())} · ${esc(meta.classe)} · ${esc(meta.identifiant)}</span><h2>Proposition d’évaluation</h2></div>
    <div class="agent-grade"><div><strong>${esc(r.note ?? '—')}</strong><span>/ ${esc(r.sur ?? meta.sur)}</span></div><p><b>Confiance de lecture :</b> ${esc(r.confiance || 'à vérifier')}<br>Cette note n’est pas enregistrée automatiquement.</p></div>
    ${uncertain.length ? `<div class="agent-uncertainties"><strong>Passages à relire sur la copie</strong>${bulletList(uncertain)}</div>` : ''}
    ${limitations.length ? `<div class="agent-uncertainties"><strong>Limites de l’analyse${meta.type_devoir === 'pratique' ? ' pratique' : ''}</strong>${bulletList(limitations)}</div>` : ''}
    <section><h3>Détail question par question</h3><div class="agent-table-wrap"><table class="agent-table"><thead><tr><th>Question</th><th>Points</th><th>Justification</th></tr></thead><tbody>${questions.map(q => `<tr><td><strong>${esc(q.question || q.numero)}</strong></td><td><strong>${esc(q.points_attribues ?? '—')} / ${esc(q.points_max ?? '—')}</strong></td><td>${nl(q.justification)}${asArray(q.erreurs).length ? `<p><b>Erreurs :</b> ${esc(asArray(q.erreurs).join(' ; '))}</p>` : ''}${asArray(q.elements_corrects).length ? `<p><b>Réussites :</b> ${esc(asArray(q.elements_corrects).join(' ; '))}</p>` : ''}</td></tr>`).join('')}</tbody></table></div></section>
    <section><h3>Appréciation proposée</h3><p>${nl(r.appreciation)}</p></section><section><h3>Remédiation conseillée</h3>${bulletList(r.remediation)}</section>
  </div>`;
}
function renderResult() {
  const r = results[tool];
  if (!r) return '';
  const meta = resultMeta[tool] || { classe };
  try {
    if (tool === 'fiche') return renderFiche(r, meta);
    if (tool === 'exercices') return renderExercices(r, meta);
    if (tool === 'cahier') return renderCahier(r, meta);
    if (tool === 'repartition') return renderRepartition(r, meta);
    if (tool === 'document') return renderDocument(r, meta);
    return renderCorrection(r, meta);
  } catch (e) {
    return `${resultHeader('Résultat de l’agent', 'Affichage brut')}<div id="agent-result" class="agent-document">${documentIdentityHtml(meta)}<pre class="agent-raw">${esc(JSON.stringify(r, null, 2))}</pre></div>`;
  }
}
function historyHtml() {
  const entries = currentHistory();
  if (!entries.length) return '';
  return `<section class="agent-history agent-no-print"><div class="agent-history-head"><div><span>VOS DOCUMENTS</span><h2>Générations récentes</h2></div><button class="btn btn-ghost" data-agent-clear-history>${icon('trash', 15)} Effacer mon historique</button></div><div class="agent-history-list">${entries.map(h => `<button data-agent-history="${esc(h.id)}"><span>${icon(TASKS[h.task].icon)}</span><div><strong>${esc(h.title)}</strong><small>${esc(TASKS[h.task].short)} · ${esc(h.classe)} · ${esc(new Date(h.created).toLocaleDateString('fr-FR'))}</small></div>${icon('arrow', 15)}</button>`).join('')}</div><p>Historique local à ce navigateur, associé au professeur connecté. Les corrections de copies ne sont pas ajoutées.</p></section>`;
}
function flowHtml() {
  return `<details class="agent-flow agent-no-print" id="agent-flow"><summary><span><small>COMPRENDRE LE PARCOURS</small><strong>Comment l’Agent Vie Scolaire AI produit un document</strong></span><span class="agent-flow-toggle">Afficher le schéma</span></summary><div class="agent-flow-content"><img src="assets/agent-vie-scolaire-flux.svg" alt="Schéma du parcours : professeur connecté, formulaire de l’agent, vérification Supabase, génération DeepSeek, réponse structurée, relecture et validation par l’enseignant, puis remplacement, insertion, impression ou export." loading="lazy" width="1600" height="950"><a href="assets/agent-vie-scolaire-flux.svg" download="schema-agent-vie-scolaire-ai.svg">Télécharger l’image du schéma (SVG)</a></div></details>`;
}
function draw() {
  const zone = el('v-agent');
  if (!zone || !ctx) return;
  ensureSessions();
  const identity = documentIdentity({ classe });
  const needsProfile = !identity.teacher || identity.teacher === 'Nom et prénom à compléter';
  zone.innerHTML = `<div class="agent-shell">
    <header class="agent-hero agent-no-print"><div class="agent-hero-copy"><span class="agent-eyebrow">${icon('spark', 16)} VOTRE STUDIO PÉDAGOGIQUE PERSONNEL</span><h1>Agent Vie Scolaire <em>AI</em></h1><p>Préparez, adaptez et vérifiez vos documents pédagogiques. Rien n’est appliqué sans votre décision.</p><div class="agent-identity-strip" aria-label="Informations du professeur"><span><small>LYCÉE</small><strong>${esc(identity.school)}</strong></span><span><small>ENSEIGNANT</small><strong>${esc(identity.teacher)}</strong></span>${needsProfile ? '<button type="button" class="agent-profile-link" data-agent-profile>Compléter mon profil</button>' : '<span class="agent-doc-promise">Lycée · Enseignant · Classe sur chaque document</span>'}</div><div class="agent-hero-status">${statusHtml()}<span>Version ${VERSION}</span></div></div><div class="agent-hero-actions"><label>Classe de travail<select data-agent-class aria-label="Classe de travail"><option ${classe === '3SI1' ? 'selected' : ''}>3SI1</option><option ${classe === '4SI2' ? 'selected' : ''}>4SI2</option></select></label><button class="btn btn-ghost" data-agent-test>${icon('shield')} Tester la connexion</button><a class="agent-flow-link" href="#agent-flow">Voir le schéma du parcours ↓</a></div></header>
    <div class="agent-workspace">
      <aside class="agent-sidebar agent-no-print"><span class="agent-menu-label">CHOISIR UN OUTIL</span>${Object.entries(TASKS).map(([id, t]) => `<button class="agent-tool ${tool === id ? 'active' : ''}" data-agent-tool="${id}" aria-pressed="${tool === id}"><span>${icon(t.icon)}</span><div><strong>${t.label}</strong><small>${t.desc}</small></div></button>`).join('')}${contextCard()}<div class="agent-security">${icon('shield', 16)}<p>La clé IA reste dans Supabase. Les élèves et les notes ne sont jamais envoyés en bloc.</p></div></aside>
      <main class="agent-main"><section class="agent-request agent-no-print"><div class="agent-request-title"><span>${icon(TASKS[tool].icon, 21)}</span><div><small>CONFIGURER VOTRE DOCUMENT</small><h2>${TASKS[tool].label}</h2><p>${esc(TASKS[tool].desc)}</p></div></div>${formHtml()}</section>
      ${busy ? `<div class="agent-loading" role="status"><span></span><div><strong>L’agent analyse votre demande…</strong><p>La génération peut prendre une à deux minutes pour une répartition ou une copie avec photos.</p></div></div>` : ''}
      ${error ? `<div class="agent-message error agent-no-print" role="alert"><strong>La demande n’a pas abouti</strong><p>${nl(error)}</p></div>` : ''}
      ${notice ? `<div class="agent-message success agent-no-print"><p>${nl(notice)}</p></div>` : ''}
      ${transcriptionReview ? renderTranscriptionReview() : ''}
      ${renderResult() || (!busy && !error && !transcriptionReview ? `<div class="agent-empty agent-no-print">${icon('spark', 30)}<h3>Votre document apparaîtra ici</h3><p>Renseignez la demande puis laissez l’agent travailler. Vous pourrez relire, remplacer, exporter ou appliquer le résultat.</p></div>` : '')}</main>
    </div>${historyHtml()}${flowHtml()}</div>`;
}

function validate() {
  const f = forms[tool];
  const identity = documentIdentity({ classe });
  if (!activeTeacherKey()) return 'Connectez-vous à votre compte professeur pour produire un document dans votre espace personnel.';
  if (!identity.teacher || identity.teacher === 'Nom et prénom à compléter') return 'Complétez d’abord votre nom et prénom dans « Mon profil » pour identifier les documents produits.';
  if (!identity.school || identity.school === 'Lycée à renseigner') return 'Le nom du lycée doit être renseigné avant de produire un document.';
  if (['fiche', 'cahier'].includes(tool) && !findSession(f.session)) return 'Sélectionnez une séance du planning.';
  if (tool === 'cahier') {
    const s = findSession(f.session);
    if (!f.realise.trim() && !String(record(s).contenu || '').trim()) return 'Décrivez ce qui a réellement été fait, ou renseignez d’abord le contenu de la fiche. L’agent ne doit pas inventer le déroulement d’une séance.';
  }
  if (tool === 'exercices' && !f.sujet.trim()) return 'Indiquez la notion ou le thème des exercices.';
  if (tool === 'document') {
    if (!f.titre.trim()) return 'Donnez un titre au document à réviser.';
    if (!f.type_document.trim()) return 'Indiquez le type de document à réviser.';
    if (f.type_document.length > 80) return 'Le type du document ne peut pas dépasser 80 caractères.';
    if (!f.document_existant.trim()) return 'Collez ou importez le texte source du document.';
    if (f.document_existant.length > MAX_DOCUMENT_CHARS) return `Le document dépasse la limite de ${MAX_DOCUMENT_CHARS.toLocaleString('fr-FR')} caractères.`;
    if (f.remplacement_id && !currentHistory().some(item => item.id === f.remplacement_id && item.task === 'document' && item.classe === classe)) return 'Le document sélectionné n’est plus présent dans votre historique local.';
  }
  if (tool === 'correction') {
    if (!f.sujet.trim()) return 'Ajoutez le sujet et, si possible, le corrigé de référence.';
    const rubricFirst = f.mode_bareme === 'proposer' && !f.bareme.trim();
    if (!rubricFirst && !f.bareme.trim()) return 'Ajoutez le barème détaillé ou choisissez « L’agent propose le barème ».';
    if (!rubricFirst && !f.copie.trim() && !attachments.length && !(f.type_devoir === 'pratique' && codeFiles.length)) return 'Ajoutez les réponses de l’élève : texte, fichier de code ou image selon le type de devoir.';
  }
  if (tool === 'repartition' && !sessions().some(s => s.tri === Number(f.trimestre))) return 'Aucune séance n’est disponible pour ce trimestre.';
  return '';
}
function makeMeta() {
  const base = { classe, task: tool };
  if (['fiche', 'cahier'].includes(tool)) {
    const s = findSession(forms[tool].session);
    return s ? { ...base, session: keyOf(s), numero: s.n, date: s.iso, titre: titleOf(s) } : { ...base, session: '', numero: '', date: today(), titre: '' };
  }
  if (tool === 'repartition') return { ...base, trimestre: Number(forms.repartition.trimestre) };
  if (tool === 'correction') return { ...base, type_devoir: forms.correction.type_devoir, mode_bareme: forms.correction.mode_bareme, identifiant: forms.correction.identifiant.trim() || 'Copie anonyme', sur: Number(forms.correction.sur) || 20 };
  if (tool === 'exercices') return { ...base, type_devoir: forms.exercices.type_devoir, remplacement_id: forms.exercices.remplacement_id || '' };
  if (tool === 'document') return { ...base, titre: forms.document.titre.trim(), type_document: forms.document.type_document, document_replacement_id: forms.document.remplacement_id || '' };
  return base;
}
function buildPayload() {
  const f = forms[tool];
  const base = { context: { ...commonContext(tool), task: tool }, input: {} };
  if (tool === 'fiche') {
    const notionsSelectionnees = curriculumSelection('notions', f.notions);
    const competencesSelectionnees = curriculumSelection('competences', f.competences);
    const selectedSession = findSession(f.session);
    const seance = sessionData(selectedSession, 'fiche');
    const existingPreparation = selectedSession ? String(record(selectedSession).preparation || '') : '';
    const competencesSuggerees = competencesSelectionnees.length
      ? []
      : relatedCompetences([sessionTopic(selectedSession), f.objectif, f.consignes, ...notionsSelectionnees.map(item => `${item.notion} ${item.description}`)].join(' '));
    base.input = {
      seance, methode: f.methode, objectif_prioritaire: f.objectif, consignes: f.consignes,
      mode_document: f.remplacer && existingPreparation.trim() ? 'remplacement' : 'nouveau',
      document_a_remplacer: f.remplacer ? existingPreparation : '',
      notions_selectionnees: notionsSelectionnees,
      competences_selectionnees: competencesSelectionnees,
      competences: competencesSuggerees
    };
  } else if (tool === 'exercices') {
    const notionsSelectionnees = curriculumSelection('notions', f.notions);
    const competencesSelectionnees = curriculumSelection('competences', f.competences);
    const parametresExercices = { ...f };
    delete parametresExercices.notions;
    delete parametresExercices.competences;
    delete parametresExercices.remplacement_id;
    delete parametresExercices.document_existant;
    const replacementEntry = currentHistory().find(item => item.id === f.remplacement_id && item.task === 'exercices' && item.classe === classe);
    const replacementDocument = replacementEntry
      ? { titre: replacementEntry.title, resultat: replacementEntry.result }
      : String(f.document_existant || '').trim();
    base.input = {
      ...parametresExercices,
      mode_document: replacementDocument ? 'remplacement' : 'nouveau',
      document_a_remplacer: replacementDocument,
      notions_du_referentiel: notionsSelectionnees.length ? [] : relatedNotions(f.sujet),
      notions_selectionnees: notionsSelectionnees,
      competences_selectionnees: competencesSelectionnees,
      competences: competencesSelectionnees.length ? [] : relatedCompetences(`${f.sujet} ${f.contraintes}`)
    };
  } else if (tool === 'cahier') {
    const selectedSession = findSession(f.session);
    const existingRecord = selectedSession ? record(selectedSession) : {};
    const existingEntry = String(existingRecord.contenu || '');
    base.input = {
      seance: sessionData(selectedSession, 'cahier'),
      mode_document: f.remplacer && existingEntry.trim() ? 'remplacement' : 'nouveau',
      document_a_remplacer: f.remplacer ? { contenu: existingEntry, travail_maison: existingRecord.devoirs || '', observations: existingRecord.obs || '' } : '',
      realise_precise_par_enseignant: f.realise,
      travail_donne_precise: f.devoirs,
      observations_precisees: f.observations
    };
  } else if (tool === 'repartition') {
    base.input = {
      trimestre: Number(f.trimestre), consignes: f.consignes,
      seances: sessions().filter(s => s.tri === Number(f.trimestre)).map(s => sessionData(s, 'repartition')),
      calendrier: { vacances: root.VACANCES || [], fin_annee: root.SCHOOL?.finAnnee }
    };
  } else if (tool === 'document') {
    base.input = {
      titre: f.titre.trim(),
      type_document: f.type_document,
      mode_document: 'remplacement',
      document_a_remplacer: f.document_existant,
      consignes: f.consignes.trim()
    };
  } else {
    const uncertain = asArray(transcriptionReview?.transcription_incertaine);
    const { identifiant: _identifiantLocal, ...correctionInput } = f;
    base.input = {
      ...correctionInput,
      fichiers_code: f.type_devoir === 'pratique' ? codeFiles : [],
      note_maximale: Number(f.sur) || 20,
      transcription_incertaine: uncertain,
      transcription_preverifiee: Boolean(transcriptionReview),
      poursuite_malgre_incertitudes_confirmee: Boolean(transcriptionAcknowledged),
      regles: ['Attribuer les points uniquement à partir du sujet, du barème validé et des éléments fournis. Signaler toute illisibilité et ne jamais prétendre avoir exécuté le code.', transcriptionReview ? 'La copie photo a été transcrite puis relue par l’enseignant. Ne devine pas les segments marqués [illisible]; garde les limites de lecture visibles dans la correction.' : ''].filter(Boolean).join(' ')
    };
  }
  return base;
}
function buildTranscriptionPayload() {
  const f = forms.correction;
  return {
    context: { ...commonContext('transcription'), task: 'transcription' },
    input: {
      type_devoir: f.type_devoir,
      sujet: f.sujet,
      texte_fourni_par_enseignant: f.copie.trim(),
      nombre_de_photos: attachments.length
    }
  };
}
function buildRubricPayload() {
  const f = forms.correction;
  return {
    context: { ...commonContext('bareme'), task: 'bareme' },
    input: { type_devoir: f.type_devoir, sujet: f.sujet, note_maximale: Number(f.sur) || 20, consignes: f.consignes }
  };
}
function buildRequestSpec() {
  const rubricFirst = tool === 'correction' && forms.correction.mode_bareme === 'proposer' && !forms.correction.bareme.trim();
  const handwritingFirst = tool === 'correction' && shouldTranscribeHandwriting(forms.correction, attachments.length) && !transcriptionReview;
  const task = rubricFirst ? 'bareme' : handwritingFirst ? 'transcription' : tool;
  const meta = makeMeta();
  const payload = rubricFirst ? buildRubricPayload() : handwritingFirst ? buildTranscriptionPayload() : buildPayload();
  const requestAttachments = task === 'transcription' || (task === 'correction' && !transcriptionReview) ? attachments.map(item => ({ ...item })) : [];
  const prompts = task === tool ? selectedPromptsForTask(tool) : [];
  payload.prompt_ids = prompts.map(item => item.id);
  return { task, meta, payload, attachments: requestAttachments, prompts };
}
function requestTaskLabel(task) {
  if (task === 'transcription') return 'Transcription préalable';
  if (task === 'bareme') return 'Proposition de barème';
  return TASKS[task]?.label || 'Demande pédagogique';
}
function collectText(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectText);
  return [];
}
function containsPossiblePersonalIdentifier(value) {
  const text = collectText(value).join('\n');
  return [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /(?:\+216[\s().-]*)?[2459](?:[\s().-]*\d){7}\b/,
    /\b(?:CIN|matricule)\s*[:#-]?\s*\d{6,12}\b/iu,
    /\b(?:nom(?:\s+complet)?|pr[eé]nom|t[eé]l[eé]phone|courriel|e[- ]?mail|adresse\s+personnelle)\s*[:=]\s*[\p{L}\p{N}]/iu
  ].some(pattern => pattern.test(text));
}
function addContextWarning(warnings, message) {
  if (message && !warnings.includes(message)) warnings.push(message);
}
function contextWarnings(request) {
  const warnings = [];
  const task = request?.task || '';
  const input = request?.payload?.input || {};
  const sessionsInPayload = Array.isArray(input.seances) ? input.seances : input.seance ? [input.seance] : [];
  const classMismatches = [], reportedWithContent = [], assuredWithoutContent = [];
  for (const session of sessionsInPayload) {
    if (request.payload?.context?.classe && session?.classe && String(request.payload.context.classe) !== String(session.classe)) classMismatches.push(String(session.classe));
    const declaredContent = [
      session?.contenu_reellement_declare,
      input.realise_precise_par_enseignant,
      typeof input.document_a_remplacer === 'string' ? input.document_a_remplacer : input.document_a_remplacer?.contenu
    ].map(value => String(value || '').trim()).filter(Boolean).join('\n');
    if (session?.statut === 'reportée' && declaredContent) reportedWithContent.push(`S${session.numero || '?'}`);
    if (task === 'repartition' && session?.statut === 'assurée' && !String(session?.contenu_reellement_declare || '').trim()) assuredWithoutContent.push(`S${session.numero || '?'}`);
  }
  if (classMismatches.length) addContextWarning(warnings, `La classe du contexte (${request.payload.context.classe}) ne correspond pas à celle des séances ${[...new Set(classMismatches)].join(', ')}. Vérifiez la classe de travail.`);
  if (reportedWithContent.length) addContextWarning(warnings, `${reportedWithContent.join(', ')} ${reportedWithContent.length > 1 ? 'sont marquées' : 'est marquée'} « reportée », mais un contenu réalisé est fourni. Vérifiez ces informations avant l’envoi.`);
  if (assuredWithoutContent.length) addContextWarning(warnings, `${assuredWithoutContent.join(', ')} ${assuredWithoutContent.length > 1 ? 'sont marquées' : 'est marquée'} « assurée » sans compte rendu réel. L’agent ne peut pas reconstituer ce qui s’y est passé.`);
  if (task === 'fiche') {
    if (!String(input.objectif_prioritaire || '').trim()) addContextWarning(warnings, 'Aucun objectif prioritaire n’est saisi. Vérifiez que le titre de la séance et les informations choisies suffisent à cadrer la fiche.');
    const hasManualNotions = asArray(input.notions_selectionnees).length > 0;
    const hasManualCompetences = asArray(input.competences_selectionnees).length > 0;
    const suggestedCompetences = asArray(input.competences);
    if (!hasManualCompetences && suggestedCompetences.length) addContextWarning(warnings, `${suggestedCompetences.length} compétence(s) sont suggérées automatiquement à partir de la séance : vérifiez leur pertinence dans l’aperçu.`);
    else if (!hasManualNotions && !hasManualCompetences && !suggestedCompetences.length) addContextWarning(warnings, 'Aucune notion ou compétence n’a été ciblée. Ajoutez-en une si le titre de la séance ne suffit pas.');
  }
  if (task === 'exercices') {
    const hasManualNotions = asArray(input.notions_selectionnees).length > 0;
    const suggestedNotions = asArray(input.notions_du_referentiel);
    const hasManualCompetences = asArray(input.competences_selectionnees).length > 0;
    const suggestedCompetences = asArray(input.competences);
    if (!hasManualNotions && suggestedNotions.length) addContextWarning(warnings, `${suggestedNotions.length} notion(s) du référentiel sont suggérées par correspondance lexicale : vérifiez leur pertinence dans l’aperçu.`);
    else if (!hasManualNotions && !suggestedNotions.length) addContextWarning(warnings, 'Aucune notion du référentiel n’a été rapprochée du sujet. Vérifiez le thème ou choisissez une notion manuellement.');
    if (!hasManualCompetences && suggestedCompetences.length) addContextWarning(warnings, `${suggestedCompetences.length} compétence(s) sont suggérées automatiquement : vérifiez qu’elles correspondent bien au sujet.`);
    else if (!hasManualCompetences && !suggestedCompetences.length) addContextWarning(warnings, 'Aucune compétence n’a été sélectionnée ou rapprochée du sujet. Vous pouvez en choisir une si nécessaire.');
  }
  if (task === 'cahier' && !String(input.travail_donne_precise || input.document_a_remplacer?.travail_maison || '').trim()) {
    addContextWarning(warnings, 'Aucun travail maison n’est renseigné. L’agent ne doit pas en inventer et indiquera « Non renseigné ».');
  }
  if (task === 'correction') {
    addContextWarning(warnings, 'Confidentialité : utilisez un identifiant anonyme et vérifiez que le texte ou les fichiers ne révèlent pas l’identité de l’élève.');
  }
  if (asArray(request?.attachments).length) {
    addContextWarning(warnings, 'Vérifiez chaque photo/capture : les noms, visages ou identifiants visibles ne sont pas masqués automatiquement.');
  }
  if (containsPossiblePersonalIdentifier(input)) {
    addContextWarning(warnings, 'Un courriel, téléphone, CIN ou champ nominatif possible a été repéré dans les données. Vérifiez et anonymisez le texte avant l’envoi.');
  }
  if (task === 'document' && String(input.document_a_remplacer || '').length > 40000) {
    addContextWarning(warnings, 'Le texte source est long. Vérifiez qu’il contient uniquement les passages utiles à la révision.');
  }
  return warnings;
}
function requestAttachmentHtml(request) {
  const images = asArray(request.attachments);
  if (!images.length) return '<p class="agent-context-attachments-empty">Aucune image jointe pour cette étape.</p>';
  return `<div class="agent-context-attachments"><strong>${images.length} image(s) transmises séparément à DeepSeek</strong><ul>${images.map(image => `<li>${esc(image.name || 'Image')} · ${esc(image.mime || 'image')}</li>`).join('')}</ul><small>Le contenu de l’image est envoyé; son nom de fichier n’est pas inclus dans le texte donné au modèle.</small></div>`;
}
function contextWarningsHtml(warnings) {
  if (!warnings.length) return '<p class="agent-context-ok">Aucun manque ou conflit simple repéré. Vérifiez tout de même les données ci-dessous.</p>';
  return `<ul class="agent-context-warnings" role="note">${warnings.map(warning => `<li>${esc(warning)}</li>`).join('')}</ul>`;
}
function contextDisclosureText(request) {
  const images = asArray(request.attachments).length
    ? `${request.attachments.length} image(s) seront transmises séparément à cette étape; leurs données binaires ne figurent pas dans l’aperçu JSON.`
    : 'Aucune image n’est jointe à cette étape.';
  const prompts = asArray(request.prompts).length
    ? `${request.prompts.length} prompt(s) approuvé(s) seront récupérés depuis la bibliothèque puis ajoutés aux consignes DeepSeek.`
    : 'Aucun prompt partagé n’est ajouté à cette demande.';
  return `Le nom du professeur et le lycée de son profil ne sont pas ajoutés automatiquement. S’ils figurent dans les champs ou images transmis, ils partiront avec ce contenu. ${images} ${prompts} Claude sert uniquement à rédiger des brouillons génériques en amont; il ne reçoit ni cette demande, ni copie, image ou donnée d’élève.`;
}
function requestPreview(request) {
  return {
    task: request.task,
    prompt_ids: asArray(request.payload.prompt_ids),
    prompts_approved: asArray(request.prompts).map(item => ({ id: item.id, title: item.title, prompt: item.prompt })),
    context: request.payload.context,
    input: request.payload.input
  };
}
function contextReviewHtml() {
  const request = buildRequestSpec();
  const warnings = contextWarnings(request);
  const preview = requestPreview(request);
  return `<section class="agent-context-review agent-no-print" data-agent-context-review aria-label="Aperçu des données transmises">
    <div class="agent-context-review-heading"><div><span>AVANT L’ENVOI</span><strong>Données de la demande</strong></div><small data-agent-context-task>${esc(requestTaskLabel(request.task))}</small></div>
    <div data-agent-context-warnings aria-live="polite">${contextWarningsHtml(warnings)}</div>
    <p class="agent-context-disclosure" data-agent-context-disclosure>${esc(contextDisclosureText(request))}</p>
    <details class="agent-context-review-details"><summary>Afficher les champs exacts de la demande</summary><pre data-agent-context-json>${esc(JSON.stringify(preview, null, 2))}</pre><div data-agent-context-attachments>${requestAttachmentHtml(request)}</div></details>
  </section>`;
}
function refreshContextReview() {
  const zone = el('v-agent');
  const review = zone?.querySelector?.('[data-agent-context-review]');
  if (!review) return;
  try {
    const request = buildRequestSpec();
    const preview = requestPreview(request);
    const warnings = review.querySelector('[data-agent-context-warnings]');
    const taskLabel = review.querySelector('[data-agent-context-task]');
    const disclosure = review.querySelector('[data-agent-context-disclosure]');
    const json = review.querySelector('[data-agent-context-json]');
    const attachmentList = review.querySelector('[data-agent-context-attachments]');
    if (warnings) warnings.innerHTML = contextWarningsHtml(contextWarnings(request));
    if (taskLabel) taskLabel.textContent = requestTaskLabel(request.task);
    if (disclosure) disclosure.textContent = contextDisclosureText(request);
    if (json) json.textContent = JSON.stringify(preview, null, 2);
    if (attachmentList) attachmentList.innerHTML = requestAttachmentHtml(request);
  } catch (_) { /* keep the form usable if an optional preview cannot be refreshed */ }
}
function rubricToText(r) {
  const lines = [`Barème proposé — ${r.type_devoir || forms.correction.type_devoir} — total : ${r.total ?? forms.correction.sur} points`];
  asArray(r.criteres).forEach(c => {
    lines.push('', `${c.question || 'Critère'} : ${c.points ?? '—'} pts`);
    asArray(c.criteres).forEach(x => lines.push(`• ${x}`));
  });
  if (asArray(r.regles).length) lines.push('', 'Règles :', ...asArray(r.regles).map(x => `• ${x}`));
  return lines.join('\n');
}
async function callAgent(task, payload = {}, requestAttachments = []) {
  if (!root.cloudReady || !root.cloudReady()) throw new Error('La connexion Supabase n’est pas configurée. Ouvrez les réglages Cloud de votre plateforme.');
  const token = await root.authToken();
  if (!token) {
    if (root.openAuth) root.openAuth();
    throw new Error('Connectez-vous à votre espace professeur pour utiliser votre agent.');
  }
  const cfg = root.cloudCfg();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(`${cfg.url.replace(/\/$/, '')}/functions/v1/assistant-ia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.key, Authorization: `Bearer ${token}` },
      body: JSON.stringify({ task, ...payload, attachments: requestAttachments }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const requestId = response.headers.get('sb-request-id') || response.headers.get('x-request-id');
      const fallback = `Le serveur de l’agent a répondu avec le code ${response.status}${requestId ? ` (référence ${requestId})` : ''}.`;
      throw new Error(data.error || fallback);
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Le délai d’attente est dépassé. Vérifiez la fonction Supabase et réessayez avec une demande plus courte.');
    throw e;
  } finally { clearTimeout(timer); }
}
function resultTitle(task, r, meta) {
  return String(r.titre || (task === 'correction' ? `Correction ${meta.identifiant}` : TASKS[task].label)).slice(0, 140);
}
function confirmReplacement(title, message, acceptLabel = 'Remplacer le document') {
  const dialog = el('agent-replace-confirm');
  if (!dialog || typeof dialog.showModal !== 'function') return Promise.resolve(root.confirm ? root.confirm(message) : true);
  const heading = el('agent-replace-title'), description = el('agent-replace-description'), accept = el('agent-replace-accept');
  if (heading) heading.textContent = title;
  if (description) description.textContent = message;
  if (accept) accept.textContent = acceptLabel;
  dialog.returnValue = '';
  return new Promise(resolve => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
    dialog.showModal();
  });
}
async function generate() {
  if (busy) return;
  error = validate();
  notice = '';
  if (error) { draw(); return; }
  const request = buildRequestSpec();
  const { task, meta, payload } = request;
  const rubricFirst = task === 'bareme';
  const documentTarget = tool === 'document' && meta.document_replacement_id
    ? currentHistory().find(item => item.id === meta.document_replacement_id && item.task === 'document' && item.classe === meta.classe)
    : null;
  const documentTargetContent = documentTarget ? String(currentDocumentVersion(documentTarget)?.result?.contenu || '') : '';
  const requestOwner = activeTeacherKey();
  const requestToken = generationToken;
  busy = true;
  results[tool] = null;
  draw();
  try {
    await verifyDeepSeekDeployment();
    const data = await callAgent(task, payload, request.attachments);
    if (requestToken !== generationToken || requestOwner !== activeTeacherKey()) return;
    if (data.meta?.provider !== 'DeepSeek') {
      const provider = String(data.meta?.provider || 'inconnu').trim();
      status = { configured: false, provider, model: data.meta?.model };
      throw new Error(`La réponse ne confirme pas DeepSeek côté serveur (fournisseur : ${provider}); aucun résultat n’a été appliqué. Vérifiez le déploiement de la fonction.`);
    }
    if (task === 'document' && meta.document_replacement_id) {
      const latestTarget = currentHistory().find(item => item.id === meta.document_replacement_id && item.task === 'document' && item.classe === meta.classe);
      if (!latestTarget || String(currentDocumentVersion(latestTarget)?.result?.contenu || '') !== documentTargetContent) throw new Error('Ce document a changé dans votre historique pendant la révision. Rouvrez sa dernière version avant de recommencer.');
    }
    if (!data.result || typeof data.result !== 'object') throw new Error('La réponse de l’agent ne contient pas de document exploitable.');
    status = { configured: true, provider: data.meta.provider, model: data.meta?.model || status?.model };
    if (rubricFirst) {
      forms.correction.bareme = rubricToText(data.result);
      notice = 'Le barème proposé est maintenant dans le champ modifiable. Relisez-le, ajustez les points si nécessaire, puis lancez la correction avec ce barème.';
      return;
    }
    if (task === 'transcription') {
      forms.correction.copie = String(data.result.transcription || '');
      transcriptionReview = {
        transcription_incertaine: asArray(data.result.transcription_incertaine),
        confiance_globale: String(data.result.confiance_globale || 'à vérifier'),
        pages_lues: Number(data.result.pages_lues) || 0,
        imageCount: attachments.length
      };
      transcriptionAcknowledged = false;
      results.correction = null;
      notice = '';
      return;
    }
    if (task === 'correction' && transcriptionReview) preserveTranscriptionWarnings(data.result, transcriptionReview, transcriptionAcknowledged);
    const teacherHistory = currentHistory();
    const localMeta = task === 'document' ? {
      ...meta,
      document_history_id: meta.document_replacement_id || '',
      document_source_content: String(payload.input.document_a_remplacer || ''),
      document_target_content: documentTargetContent,
      document_saved: false
    } : meta;
    results[tool] = data.result;
    resultMeta[tool] = localMeta;
    if (task === 'document') {
      notice = meta.document_replacement_id
        ? 'Comparez la source et la proposition. Le remplacement dans votre historique restera réversible et demandera votre confirmation.'
        : 'Comparez la source et la proposition. L’original restera intact; la nouvelle version sera enregistrée localement après confirmation.';
    } else if (task !== 'correction') {
      const replacementPending = task === 'exercices' && meta.remplacement_id && teacherHistory.some(item => item.id === meta.remplacement_id && item.task === 'exercices' && item.classe === meta.classe);
      if (replacementPending) {
        notice = 'La version de remplacement est prête. Vérifiez-la, puis utilisez « Remplacer la série sélectionnée » pour confirmer.';
      } else {
        const ownerKey = activeTeacherKey();
        const newEntry = { id: root.crypto?.randomUUID?.() || `agent-${Date.now()}`, owner_key: ownerKey, created: new Date().toISOString(), task, classe: meta.classe, title: resultTitle(task, data.result, meta), result: data.result, meta };
        saveCurrentHistory([newEntry, ...teacherHistory]);
      }
    } else {
      attachments = [];
      codeFiles = [];
      transcriptionReview = null;
      transcriptionAcknowledged = false;
    }
  } catch (e) {
    if (requestToken === generationToken && requestOwner === activeTeacherKey()) error = e.message || String(e);
  } finally {
    if (requestToken === generationToken && requestOwner === activeTeacherKey()) {
      busy = false;
      draw();
    }
  }
}
function continueFromTranscription() {
  if (!transcriptionReview || busy) return;
  if (hasUncertainTranscription(transcriptionReview) && !el('agent-transcription-ack')?.checked) {
    error = 'Relisez les passages signalés et confirmez explicitement si vous souhaitez poursuivre malgré l’incertitude.';
    draw();
    return;
  }
  transcriptionAcknowledged = true;
  error = '';
  notice = '';
  generate();
}
function restartTranscription() {
  if (busy || !transcriptionReview) return;
  transcriptionReview = null;
  transcriptionAcknowledged = false;
  results.correction = null;
  error = '';
  notice = '';
  draw();
}
async function testConnection() {
  if (busy) return;
  const requestOwner = activeTeacherKey();
  const requestToken = generationToken;
  busy = true; error = ''; notice = '';
  draw();
  try {
    const data = await callAgent('status');
    if (requestToken !== generationToken || requestOwner !== activeTeacherKey()) return;
    status = data;
    if (data.provider !== 'DeepSeek') {
      const provider = String(data.provider || 'inconnu').trim();
      notice = `La fonction distante signale « ${provider} » : le portage DeepSeek n’est pas encore déployé. Ce test n’a lancé aucune génération.`;
    } else if (data.configured) {
      notice = `Fonction Supabase accessible et DeepSeek configuré avec « ${data.model} ».`;
    } else {
      notice = 'La fonction Supabase répond, mais DEEPSEEK_API_KEY manque ou le modèle DeepSeek doit être vérifié. Suivez le guide AGENT_IA.md.';
    }
  } catch (e) {
    if (requestToken === generationToken && requestOwner === activeTeacherKey()) error = e.message || String(e);
  } finally {
    if (requestToken === generationToken && requestOwner === activeTeacherKey()) { busy = false; draw(); }
  }
}
function ficheText(r) {
  const lines = ['OBJECTIFS', ...asArray(r.objectifs).map(x => `• ${x}`), '', 'PRÉREQUIS', ...asArray(r.prerequis).map(x => `• ${x}`), '', 'DÉROULEMENT PROPOSÉ'];
  asArray(r.deroulement).forEach((p, i) => {
    lines.push(`${i + 1}. ${p.phase || 'Phase'}${p.duree ? ` (${p.duree})` : ''}`);
    if (p.activite_enseignant || p.enseignant) lines.push(`Enseignant : ${p.activite_enseignant || p.enseignant}`);
    if (p.activite_eleve || p.eleves) lines.push(`Élèves : ${p.activite_eleve || p.eleves}`);
    if (p.trace) lines.push(`Trace / évaluation : ${p.trace}`);
  });
  if (asArray(r.notions).length) lines.push('', `NOTIONS : ${asArray(r.notions).join(' ; ')}`);
  if (asArray(r.competences).length) lines.push('', `COMPÉTENCES CIBLÉES : ${asArray(r.competences).join(' ; ')}`);
  if (r.evaluation) lines.push('', `ÉVALUATION : ${r.evaluation}`);
  if (r.remediation) lines.push('', `REMÉDIATION : ${r.remediation}`);
  return lines.join('\n');
}
async function applyResult() {
  const requestOwner = activeTeacherKey();
  const requestToken = generationToken;
  const r = results[tool];
  const meta = resultMeta[tool];
  if (!r || !meta || !requestOwner) return;
  if (['fiche', 'cahier'].includes(tool)) {
    const s = findSession(meta.session, meta.classe);
    if (!s) { error = 'La séance liée à ce résultat est introuvable.'; draw(); return; }
    const existing = record(s);
    const hasExisting = tool === 'fiche'
      ? Boolean(String(existing.preparation || '').trim())
      : Boolean(String(existing.contenu || '').trim());
    if (hasExisting) {
      const documentName = tool === 'fiche' ? 'la fiche pédagogique' : 'l’entrée du cahier de textes';
      const accepted = await confirmReplacement(
        tool === 'fiche' ? 'Remplacer la fiche existante ?' : 'Remplacer l’entrée du cahier ?',
        `Cette action remplacera ${documentName} de ${meta.classe}, séance ${s.n}. Les autres séances et les statuts assurée/reportée resteront inchangés. Vous pourrez encore vérifier le brouillon avant de l’enregistrer.`,
        tool === 'fiche' ? 'Remplacer la fiche' : 'Remplacer l’entrée'
      );
      if (!accepted || requestToken !== generationToken || requestOwner !== activeTeacherKey()) return;
    }
    root.openModal(meta.classe, s.n);
    if (tool === 'fiche') {
      el('m-titre').value = r.titre || meta.titre;
      el('m-preparation').value = ficheText(r);
      el('m-devoirs').value = r.travail_maison || '';
      root.toast(hasExisting ? 'Nouvelle fiche chargée dans le formulaire. Vérifiez puis cliquez sur Enregistrer.' : 'Préparation insérée. Vérifiez puis cliquez sur Enregistrer.');
    } else {
      el('m-contenu').value = r.contenu || '';
      el('m-devoirs').value = r.travail_maison || '';
      el('m-obs').value = [r.observations, r.points_a_reprendre ? `À reprendre : ${r.points_a_reprendre}` : ''].filter(Boolean).join(' | ');
      root.toast(hasExisting ? 'Nouvelle entrée chargée dans le formulaire. Vérifiez puis enregistrez.' : 'Brouillon inséré sans confirmer la séance. Vérifiez puis enregistrez.');
    }
    return;
  }
  if (tool === 'document') {
    const sourceContent = String(meta.document_source_content || '');
    if (!sourceContent.trim() || !String(r.contenu || '').trim()) { error = 'La source ou la proposition est vide; aucune version n’a été enregistrée.'; draw(); return; }
    const targetId = meta.document_history_id || meta.document_replacement_id || '';
    let target = targetId ? currentHistory().find(item => item.id === targetId && item.task === 'document' && item.classe === meta.classe) : null;
    if (targetId && !target) { error = 'Le document n’est plus présent dans votre historique local. Rouvrez sa dernière version avant de continuer.'; draw(); return; }
    if (target && meta.document_target_content !== undefined && String(currentDocumentVersion(target)?.result?.contenu || '') !== String(meta.document_target_content)) {
      error = 'Ce document a changé dans votre historique pendant la révision. Rouvrez sa dernière version avant de recommencer.'; draw(); return;
    }
    const accepted = await confirmReplacement(
      target ? 'Confirmer le remplacement local ?' : 'Enregistrer ce document révisé ?',
      target
        ? `La proposition remplacera « ${target.title} » uniquement dans l’historique local de cet appareil. La version précédente sera conservée et restaurable. Le fichier externe restera inchangé.`
        : `La proposition sera ajoutée à votre historique local avec le texte source conservé comme version précédente. Aucun fichier externe ne sera modifié; exportez le résultat pour le remplacer vous-même.`,
      target ? 'Enregistrer la nouvelle version' : 'Enregistrer dans l’historique'
    );
    if (!accepted || requestToken !== generationToken || requestOwner !== activeTeacherKey()) return;
    const latestTarget = targetId ? currentHistory().find(item => item.id === targetId && item.task === 'document' && item.classe === meta.classe) : null;
    if (targetId && (!latestTarget || (meta.document_target_content !== undefined && String(currentDocumentVersion(latestTarget)?.result?.contenu || '') !== String(meta.document_target_content)))) {
      error = 'Le document a été modifié avant la confirmation. Rouvrez sa dernière version pour éviter d’écraser vos changements.'; draw(); return;
    }
    const updated = latestTarget
      ? appendDocumentHistoryVersion(latestTarget, meta, r, sourceContent)
      : newDocumentHistoryEntry(requestOwner, meta, r, sourceContent);
    const saved = saveCurrentHistory(latestTarget
      ? currentHistory().map(item => item.id === latestTarget.id ? updated : item)
      : [updated, ...currentHistory()]);
    if (!saved) { error = 'Impossible d’enregistrer dans l’historique local de ce compte.'; draw(); return; }
    results.document = updated.result;
    resultMeta.document = updated.meta;
    forms.document.titre = String(updated.result.titre || updated.title || meta.titre || '');
    forms.document.type_document = String(updated.result.type_document || meta.type_document || 'Document libre');
    forms.document.document_existant = String(updated.result.contenu || '');
    forms.document.remplacement_id = updated.id;
    forms.document.fichier_nom = '';
    notice = latestTarget ? 'La version révisée a été enregistrée. La version précédente reste dans l’historique et peut être restaurée.' : 'Le document révisé et le texte source ont été enregistrés dans votre historique local. Le fichier original n’a pas été touché.';
    error = '';
    draw();
    return;
  }
  if (tool === 'exercices' && meta.remplacement_id) {
    const target = currentHistory().find(item => item.id === meta.remplacement_id && item.task === 'exercices' && item.classe === meta.classe);
    if (!target) { error = 'La série choisie n’est plus présente dans votre historique local pour cette classe. Sélectionnez-en une autre.'; draw(); return; }
    const accepted = await confirmReplacement(
      'Remplacer la série d’exercices ?',
      `La nouvelle version remplacera « ${target.title} » dans l’historique local de cet appareil. Vous pourrez ensuite la télécharger ou l’imprimer; aucun fichier externe ne sera modifié.`,
      'Remplacer la série'
    );
    if (!accepted || requestToken !== generationToken || requestOwner !== activeTeacherKey()) return;
    const updatedMeta = { ...meta, remplacement_id: '' };
    const updated = { ...target, created: new Date().toISOString(), title: resultTitle(tool, r, meta), result: r, meta: updatedMeta };
    saveCurrentHistory(currentHistory().map(item => item.id === target.id ? updated : item));
    resultMeta[tool] = updatedMeta;
    forms.exercices.remplacement_id = '';
    notice = 'La série a été remplacée dans l’historique local. Vous pouvez maintenant l’exporter ou l’imprimer.';
    error = '';
    draw();
    return;
  }
  if (tool === 'repartition') {
    const candidates = asArray(r.seances).map(x => ({ proposal: x, session: (ctx.sessions[meta.classe] || []).find(s => s.n === Number(x.numero ?? x.n) && s.tri === meta.trimestre) })).filter(x => x.session && x.session.iso >= today() && record(x.session).done !== true);
    if (!candidates.length) { error = 'Aucune séance future modifiable dans cette proposition.'; draw(); return; }
    if (!confirm(`Appliquer les titres et préparations proposés à ${candidates.length} séance(s) à venir de ${meta.classe} ? Les dates, le réalisé et les statuts seront conservés.`)) return;
    candidates.forEach(({ proposal, session }) => {
      const key = keyOf(session);
      const previous = ctx.store.seances[key] || {};
      ctx.store.seances[key] = { ...previous, title: String(proposal.titre || titleOf(session)), preparation: String(proposal.objectif || previous.preparation || '') };
    });
    root.save(true);
    root.setRep(meta.classe);
    root.setTri(meta.trimestre);
    root.go('v-rep');
    root.toast(`${candidates.length} séance(s) à venir mise(s) à jour.`);
  }
}
async function restoreDocumentVersion() {
  const meta = resultMeta.document;
  const requestOwner = activeTeacherKey();
  const requestToken = generationToken;
  const targetId = meta?.document_history_id || '';
  if (!meta?.document_saved || !requestOwner || !targetId) return;
  const target = currentHistory().find(item => item.id === targetId && item.owner_key === requestOwner && item.task === 'document' && item.classe === meta.classe);
  if (!target) { error = 'Ce document n’est plus présent dans votre historique local.'; draw(); return; }
  const versions = documentVersions(target);
  const index = currentDocumentVersionIndex(target, versions);
  const current = versions[index];
  if (index <= 0 || !current) { error = 'Aucune version précédente à restaurer.'; draw(); return; }
  const currentContent = String(current?.result?.contenu || '');
  const previous = versions[index - 1];
  const accepted = await confirmReplacement(
    'Restaurer la version précédente ?',
    `Restaurer « ${previous.label || 'la version précédente'} » de « ${target.title} » dans l’historique local ? La version actuelle sera conservée et restera restaurable. Le fichier externe ne sera pas modifié.`,
    'Restaurer cette version'
  );
  if (!accepted || requestToken !== generationToken || requestOwner !== activeTeacherKey()) return;
  const latest = currentHistory().find(item => item.id === targetId && item.owner_key === requestOwner && item.task === 'document' && item.classe === meta.classe);
  const latestIndex = latest ? currentDocumentVersionIndex(latest) : -1;
  if (!latest || latestIndex !== index || String(currentDocumentVersion(latest)?.result?.contenu || '') !== currentContent) {
    error = 'Le document a changé avant la confirmation. Rouvrez sa dernière version pour éviter de restaurer un état obsolète.'; draw(); return;
  }
  const restored = restoreDocumentHistoryVersion(latest);
  if (!restored) { error = 'Impossible de restaurer la version précédente.'; draw(); return; }
  if (!saveCurrentHistory(currentHistory().map(item => item.id === targetId ? restored : item))) {
    error = 'Impossible d’enregistrer la restauration dans l’historique local.'; draw(); return;
  }
  results.document = restored.result;
  resultMeta.document = restored.meta;
  forms.document.titre = String(restored.result?.titre || restored.title || '');
  forms.document.type_document = String(restored.result?.type_document || restored.meta?.type_document || 'Document libre');
  forms.document.document_existant = String(restored.result?.contenu || '');
  forms.document.remplacement_id = restored.id;
  forms.document.fichier_nom = '';
  notice = 'La version précédente est restaurée dans l’historique local. La version remplacée est toujours conservée et peut être rétablie.';
  error = '';
  draw();
}
function downloadResult() {
  const content = el('agent-result');
  if (!content) return;
  const printable = content.cloneNode(true);
  printable.querySelectorAll('details').forEach(details => { details.open = true; });
  const meta = resultMeta[tool] || { classe };
  const title = resultTitle(tool, results[tool], meta);
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title><style>body{max-width:960px;margin:40px auto;padding:0 24px;color:#18251f;font:15px/1.6 system-ui,sans-serif}h1,h2,h3{line-height:1.25}section{margin:22px 0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccd5cf;padding:10px;text-align:left;vertical-align:top}th{background:#f0f4f1}.agent-doc-heading{border-bottom:3px solid #173f35;padding-bottom:16px}.agent-doc-heading>span{font-size:12px;letter-spacing:.1em}.agent-doc-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.agent-phases>div{display:flex;gap:15px;border-top:1px solid #ddd;padding:14px 0}.agent-phases>div>span{font-weight:800;color:#276fa7}.agent-tags span{display:inline-block;background:#eef3ef;padding:4px 8px;margin:3px;border-radius:6px}.agent-exercise{border-top:1px solid #ccd5cf}.agent-exercise h3 span{float:right}.agent-points{float:right}.agent-grade{display:flex;gap:30px;align-items:center;background:#f0f4f1;padding:18px}.agent-grade strong{font-size:44px}.agent-correction{background:#f6f7f4;padding:12px}.agent-uncertainties{border:1px solid #cc8a32;padding:14px;background:#fff8e9}@media(max-width:650px){.agent-doc-grid{grid-template-columns:1fr}}@media print{body{margin:0;max-width:none}.agent-correction{display:block}.agent-correction>div{display:block}}</style></head><body>${printable.innerHTML}</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tool}-${meta.classe || classe}-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function printResult() {
  const content = el('agent-result');
  if (!content) return;
  const details = Array.from(content.querySelectorAll('details'));
  const previous = details.map(x => x.open);
  details.forEach(x => { x.open = true; });
  document.body.classList.add('agent-printing');
  const done = () => {
    document.body.classList.remove('agent-printing');
    details.forEach((x, i) => { x.open = previous[i]; });
  };
  window.addEventListener('afterprint', done, { once: true });
  window.print();
  setTimeout(done, 1000);
}
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
}
async function compressImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name} : format non pris en charge.`);
  if (file.size > 12 * 1024 * 1024) throw new Error(`${file.name} : image supérieure à 12 Mo.`);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url; });
    let scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    let quality = 0.82;
    let blob;
    for (let attempt = 0; attempt < 3; attempt++) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const brush = canvas.getContext('2d');
      brush.fillStyle = '#fff'; brush.fillRect(0, 0, canvas.width, canvas.height);
      brush.drawImage(img, 0, 0, canvas.width, canvas.height);
      blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= 1300000) break;
      scale *= 0.8; quality = 0.7;
    }
    if (!blob) throw new Error(`${file.name} : impossible de préparer l’image.`);
    return { name: file.name.replace(/[^\p{L}\p{N}._ -]/gu, '_'), mime: 'image/jpeg', data: await blobToDataUrl(blob) };
  } finally { URL.revokeObjectURL(url); }
}
async function addCodeFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length || busy) return;
  if (codeFiles.length + files.length > MAX_CODE_FILES) { error = `Vous pouvez ajouter au maximum ${MAX_CODE_FILES} fichiers de code par correction.`; draw(); return; }
  busy = true; error = ''; notice = '';
  draw();
  try {
    const prepared = [];
    for (const file of files) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (!['html', 'htm', 'css', 'js', 'php', 'sql', 'txt', 'json'].includes(extension)) throw new Error(`${file.name} : ce type de fichier n’est pas accepté.`);
      if (file.size > 200 * 1024) throw new Error(`${file.name} : fichier supérieur à 200 Ko.`);
      const content = await file.text();
      if (content.includes('\u0000')) throw new Error(`${file.name} : le fichier semble binaire et ne peut pas être analysé comme du code.`);
      prepared.push({ name: file.name.replace(/[^\p{L}\p{N}._ -]/gu, '_'), language: extension, content });
    }
    codeFiles.push(...prepared);
    notice = `${prepared.length} fichier(s) de code ajouté(s) à la correction.`;
  } catch (e) { error = e.message || 'Impossible de lire ce fichier de code.'; }
  finally { busy = false; draw(); }
}
async function readDocumentFile(fileList) {
  const file = Array.from(fileList || [])[0];
  if (!file) return;
  const requestOwner = activeTeacherKey();
  const requestToken = generationToken;
  const extension = String(file.name || '').split('.').pop().toLocaleLowerCase('en');
  if (!['txt', 'md', 'markdown', 'html', 'htm'].includes(extension)) { error = 'Importez uniquement un fichier TXT, Markdown ou HTML. Pour un PDF ou Word, copiez son texte dans le champ source.'; draw(); return; }
  if (file.size > MAX_DOCUMENT_CHARS * 4) { error = `Le fichier dépasse ${MAX_DOCUMENT_CHARS.toLocaleString('fr-FR')} caractères maximum.`; draw(); return; }
  try {
    const text = await file.text();
    if (requestToken !== generationToken || requestOwner !== activeTeacherKey()) return;
    if (text.includes('\u0000')) throw new Error('Ce fichier semble binaire; seul le texte brut est accepté.');
    if (text.length > MAX_DOCUMENT_CHARS) throw new Error(`Le document dépasse ${MAX_DOCUMENT_CHARS.toLocaleString('fr-FR')} caractères.`);
    forms.document.document_existant = text;
    forms.document.fichier_nom = String(file.name || '').slice(0, 180);
    forms.document.remplacement_id = '';
    if (!forms.document.titre.trim()) forms.document.titre = String(file.name || 'Document importé').replace(/\.[^.]+$/, '').slice(0, 140);
    results.document = null;
    resultMeta.document = null;
    error = '';
    notice = `Texte importé depuis « ${forms.document.fichier_nom} ». Le fichier reste inchangé.`;
  } catch (e) {
    if (requestToken === generationToken && requestOwner === activeTeacherKey()) error = e.message || 'Impossible de lire ce fichier texte.';
  } finally {
    if (requestToken === generationToken && requestOwner === activeTeacherKey()) draw();
  }
}
async function addImages(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length || busy) return;
  if (attachments.length + files.length > MAX_IMAGES) { error = `Vous pouvez analyser au maximum ${MAX_IMAGES} images à la fois.`; draw(); return; }
  busy = true; error = ''; notice = '';
  draw();
  try {
    for (const file of files) attachments.push(await compressImage(file));
    if (transcriptionReview) {
      transcriptionReview = null;
      transcriptionAcknowledged = false;
      results.correction = null;
    }
    notice = `${files.length} image(s) préparée(s). Vous pouvez lancer l’analyse.`;
  } catch (e) { error = e.message || 'Impossible de lire cette image.'; }
  finally { busy = false; draw(); }
}

function fieldValue(target) {
  if (target.type === 'checkbox') return target.checked;
  if (target.type === 'number') return Number(target.value);
  return target.value;
}
document.addEventListener('input', e => {
  const catalogFilter = e.target.closest('[data-agent-catalog-filter]');
  if (catalogFilter) {
    const kind = catalogFilter.dataset.agentCatalogFilter;
    const query = catalogFilter.value.trim().toLocaleLowerCase('fr');
    const zone = el('v-agent');
    if (zone) {
      const options = zone.querySelectorAll(`[data-agent-option="${kind}"]`);
      let visible = 0;
      options.forEach(option => {
        option.hidden = !option.textContent.toLocaleLowerCase('fr').includes(query);
        if (!option.hidden) visible++;
      });
      const noMatch = zone.querySelector(`[data-agent-no-match="${kind}"]`);
      if (noMatch) noMatch.hidden = options.length === 0 || visible > 0;
    }
    return;
  }
  const field = e.target.closest('[data-agent-field]');
  if (!field || !forms[tool] || !(field.dataset.agentField in forms[tool])) return;
  forms[tool][field.dataset.agentField] = fieldValue(field);
  if (tool === 'document') {
    results.document = null;
    resultMeta.document = null;
    notice = '';
    if (field.dataset.agentField === 'document_existant') {
      const counter = el('agent-document-count');
      if (counter) counter.textContent = `${forms.document.document_existant.length.toLocaleString('fr-FR')} / ${MAX_DOCUMENT_CHARS.toLocaleString('fr-FR')} caractères`;
    }
  }
  if (tool === 'correction' && field.dataset.agentField === 'copie' && transcriptionReview) {
    transcriptionAcknowledged = false;
    const checkbox = el('agent-transcription-ack');
    if (checkbox) checkbox.checked = false;
    const proceed = document.querySelector('[data-agent-transcription-proceed]');
    if (proceed && hasUncertainTranscription(transcriptionReview)) proceed.disabled = true;
  }
  refreshContextReview();
});
document.addEventListener('change', e => {
  if (e.target.id === 'agent-document-file') { readDocumentFile(e.target.files); return; }
  const promptSelection = e.target.closest('[data-agent-prompt-selection]');
  if (promptSelection?.dataset?.agentPromptSelection !== undefined && TASKS[tool]) {
    const selected = new Set(asArray(selectedSharedPromptIds[tool]).map(String));
    if (promptSelection.checked && selected.size >= MAX_SHARED_PROMPTS && !selected.has(String(promptSelection.value))) {
      promptSelection.checked = false;
      root.toast?.(`Vous pouvez sélectionner au maximum ${MAX_SHARED_PROMPTS} prompts.`);
      return;
    }
    if (promptSelection.checked) selected.add(String(promptSelection.value));
    else selected.delete(String(promptSelection.value));
    selectedSharedPromptIds[tool] = [...selected];
    const count = document.querySelector(`[data-agent-prompt-count="${tool}"]`);
    if (count) count.textContent = String(selected.size);
    refreshContextReview();
    return;
  }
  const selection = e.target.closest('[data-agent-selection]');
  if (selection && ['notions', 'competences'].includes(selection.dataset.agentSelection) && forms[tool]) {
    const kind = selection.dataset.agentSelection;
    const selected = new Set(asArray(forms[tool][kind]).map(String));
    if (selection.checked) selected.add(String(selection.value));
    else selected.delete(String(selection.value));
    forms[tool][kind] = [...selected];
    const count = document.querySelector(`[data-agent-selection-count="${kind}"]`);
    if (count) count.textContent = selectedCountLabel(selected.size);
    refreshContextReview();
    return;
  }
  if (e.target.matches('[data-agent-class]')) {
    classe = e.target.value === '4SI2' ? '4SI2' : '3SI1';
    forms.fiche.session = ''; forms.fiche.notions = []; forms.fiche.competences = []; forms.fiche.remplacer = false;
    forms.exercices.notions = []; forms.exercices.competences = []; forms.exercices.remplacement_id = '';
    forms.cahier.session = ''; forms.cahier.remplacer = false;
    forms.document.remplacement_id = '';
    results.document = null; resultMeta.document = null;
    error = ''; notice = '';
    draw(); return;
  }
  if (e.target.id === 'agent-copy-files') { addImages(e.target.files); return; }
  if (e.target.id === 'agent-code-files') { addCodeFiles(e.target.files); return; }
  if (e.target.id === 'agent-transcription-ack') {
    transcriptionAcknowledged = e.target.checked;
    const proceed = document.querySelector('[data-agent-transcription-proceed]');
    if (proceed) proceed.disabled = hasUncertainTranscription(transcriptionReview) && !transcriptionAcknowledged;
    refreshContextReview();
    return;
  }
  const field = e.target.closest('[data-agent-field]');
  if (field && field.tagName === 'SELECT') {
    forms[tool][field.dataset.agentField] = fieldValue(field);
    if (tool === 'document') {
      results.document = null; resultMeta.document = null;
      if (field.dataset.agentField === 'remplacement_id' && forms.document.remplacement_id) {
        const target = currentHistory().find(item => item.id === forms.document.remplacement_id && item.task === 'document' && item.classe === classe);
        const version = target && currentDocumentVersion(target);
        if (version?.result) {
          forms.document.titre = String(version.result.titre || target.title || '');
          forms.document.type_document = String(version.result.type_document || target.meta?.type_document || 'Document libre');
          forms.document.document_existant = String(version.result.contenu || '');
          forms.document.fichier_nom = '';
        } else {
          forms.document.remplacement_id = '';
          error = 'La version choisie n’est plus disponible dans votre historique.';
        }
      }
    }
    if (tool === 'fiche' && field.dataset.agentField === 'session') { forms.fiche.notions = storedNotionsForSession(forms.fiche.session); forms.fiche.remplacer = false; }
    if (tool === 'cahier' && field.dataset.agentField === 'session') forms.cahier.remplacer = false;
    if (tool === 'correction' && ['type_devoir', 'mode_bareme'].includes(field.dataset.agentField)) results.correction = null;
    if (tool === 'correction' && field.dataset.agentField === 'type_devoir') {
      transcriptionReview = null;
      transcriptionAcknowledged = false;
    }
    error = ''; draw();
  }
});
document.addEventListener('click', e => {
  const button = e.target.closest('[data-agent-tool],[data-agent-generate],[data-agent-test],[data-agent-apply],[data-agent-restore-document],[data-agent-download],[data-agent-print],[data-agent-remove],[data-agent-remove-code],[data-agent-history],[data-agent-clear-history],[data-agent-transcription-proceed],[data-agent-transcription-reset],[data-agent-profile],[data-agent-prompts-reload]');
  if (!button) return;
  if (button.dataset.agentTool && !busy) { tool = button.dataset.agentTool; error = ''; notice = ''; draw(); }
  if (button.hasAttribute('data-agent-generate')) generate();
  if (button.hasAttribute('data-agent-transcription-proceed')) continueFromTranscription();
  if (button.hasAttribute('data-agent-transcription-reset')) restartTranscription();
  if (button.hasAttribute('data-agent-test')) testConnection();
  if (button.hasAttribute('data-agent-prompts-reload')) reloadSharedPromptLibrary();
  if (button.hasAttribute('data-agent-profile')) root.openProfil?.();
  if (button.hasAttribute('data-agent-apply')) applyResult();
  if (button.hasAttribute('data-agent-restore-document')) restoreDocumentVersion();
  if (button.hasAttribute('data-agent-download')) downloadResult();
  if (button.hasAttribute('data-agent-print')) printResult();
  if (button.dataset.agentRemove !== undefined) { attachments.splice(Number(button.dataset.agentRemove), 1); draw(); }
  if (button.dataset.agentRemoveCode !== undefined) { codeFiles.splice(Number(button.dataset.agentRemoveCode), 1); draw(); }
  if (button.dataset.agentHistory) {
    const item = currentHistory().find(x => x.id === button.dataset.agentHistory);
    if (item) {
      tool = item.task; classe = item.classe;
      if (item.task === 'document') {
        const version = currentDocumentVersion(item);
        results.document = version?.result || item.result;
        resultMeta.document = { ...(item.meta || {}), document_history_id: item.id, document_saved: true };
        forms.document.titre = String(results.document?.titre || item.title || '');
        forms.document.type_document = String(results.document?.type_document || item.meta?.type_document || 'Document libre');
        forms.document.document_existant = String(results.document?.contenu || '');
        forms.document.remplacement_id = item.id;
        forms.document.fichier_nom = '';
      } else { results[tool] = item.result; resultMeta[tool] = item.meta; }
      error = ''; notice = ''; draw();
    }
  }
  if (button.hasAttribute('data-agent-clear-history') && confirm('Effacer vos documents récents enregistrés localement sur cet appareil ?')) { saveCurrentHistory([]); draw(); }
});

root.STI_AGENT = {
  version: VERSION,
  render(context) {
    ctx = context;
    const owner = activeTeacherKey();
    if (owner !== workspaceOwnerKey) {
      workspaceOwnerKey = owner;
      resetTeacherWorkspace();
    }
    const signedInEmail = typeof root.authUser === 'function' ? String(root.authUser() || '').trim().toLocaleLowerCase('en') : '';
    if (ctx?.view === 'v-agent' && !signedInEmail) {
      sharedPrompts = [];
      sharedPromptUser = '';
      sharedPromptState = 'error';
      sharedPromptError = 'Connectez-vous à Supabase pour consulter la bibliothèque partagée.';
      Object.keys(selectedSharedPromptIds).forEach(task => delete selectedSharedPromptIds[task]);
    } else if (ctx?.view === 'v-agent' && (sharedPromptState === 'idle' || signedInEmail !== sharedPromptUser)) {
      loadSharedPromptLibrary().then(() => { if (ctx?.view === 'v-agent') draw(); });
    }
    draw();
  },
  reloadPrompts: reloadSharedPromptLibrary,
  _test: {
    ficheText, relatedNotions, relatedCompetences, sessionData, curriculumCatalog, curriculumSelection, validate,
    shouldTranscribeHandwriting, hasUncertainTranscription, preserveTranscriptionWarnings,
    documentIdentity, documentIdentityHtml, rubricToText, buildRequestSpec, contextWarnings, containsPossiblePersonalIdentifier, contextDisclosureText, contextReviewHtml,
    currentHistory, activeTeacherKey, saveCurrentHistory,
    setSharedPrompts: prompts => { sharedPrompts = Array.isArray(prompts) ? prompts : []; sharedPromptState = 'loaded'; },
    setSelectedSharedPromptIds: (task, ids) => { selectedSharedPromptIds[task] = Array.isArray(ids) ? ids : []; },
    selectedPromptsForTask, sharedPromptPickerHtml, requestPreview,
    documentVersions, currentDocumentVersion, currentDocumentVersionIndex, newDocumentHistoryEntry, appendDocumentHistoryVersion, restoreDocumentHistoryVersion,
    applyResult, restoreDocumentVersion, readDocumentFile,
    setResult: (task, result, meta) => { results[task] = result; resultMeta[task] = meta; tool = task; },
    renderers: { fiche: renderFiche, exercices: renderExercices, cahier: renderCahier, repartition: renderRepartition, document: renderDocument, correction: renderCorrection },
    formFor: task => { const previous = tool; tool = task; try { return formHtml(); } finally { tool = previous; } },
    buildPayloadFor: task => { const previous = tool; tool = task; try { return buildPayload(); } finally { tool = previous; } },
    buildPayload: () => buildPayload(), buildTranscriptionPayload
  }
};
})(window);
