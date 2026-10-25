/* =========================================================================
   Agent Vie Scolaire AI — assistant pédagogique personnel
   Interface connectée à une Supabase Edge Function. Aucune clé IA dans le
   navigateur. Les résultats sont des propositions : toute écriture dans les
   fiches ou le planning nécessite une action explicite de l'enseignant.
   ========================================================================= */
(function (root) {
'use strict';

const VERSION = '2.0.0-vie-scolaire-ai';
const HISTORY_KEY = 'sti_agent_history_v1';
const MAX_IMAGES = 6;
const MAX_CODE_FILES = 8;
const TASKS = {
  fiche: { label: 'Fiche pédagogique', short: 'Fiche', icon: 'file', desc: 'Préparer une séance complète à partir du planning.' },
  exercices: { label: 'Séries d’exercices', short: 'Exercices', icon: 'layers', desc: 'Créer des exercices théoriques ou pratiques avec corrigés.' },
  correction: { label: 'Correction de copies', short: 'Correction', icon: 'check', desc: 'Analyser texte, photos ou code avec un barème validé.' },
  cahier: { label: 'Cahier de textes', short: 'Cahier', icon: 'book', desc: 'Rédiger une entrée à partir du réalisé déclaré.' },
  repartition: { label: 'Répartition', short: 'Répartition', icon: 'calendar', desc: 'Proposer une progression sans changer les dates.' }
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
function defaultForms() {
  return {
    fiche: { session: '', methode: 'Cours dialogué et TP guidé', objectif: '', consignes: '', notions: [], competences: [], remplacer: false },
    exercices: { type_devoir: 'théorique', sujet: '', nombre: 5, difficulte: 'Progressive', format: 'Série d’exercices', duree: 60, contraintes: '', notions: [], competences: [], remplacement_id: '', document_existant: '' },
    correction: { type_devoir: 'théorique', mode_bareme: 'fourni', identifiant: 'Copie 1', sur: 20, sujet: '', bareme: '', copie: '', consignes: '' },
    cahier: { session: '', realise: '', devoirs: '', observations: '', remplacer: false },
    repartition: { trimestre: 1, consignes: 'Conserver la progression officielle. Renforcer les activités pratiques et prévoir une remédiation après chaque évaluation.' }
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
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (e) { /* Le résultat reste disponible à l'écran. */ }
}
function currentHistory() {
  const owner = activeTeacherKey();
  return owner ? history.filter(item => item.owner_key === owner).slice(0, 8) : [];
}
function saveCurrentHistory(entries) {
  const owner = activeTeacherKey();
  if (!owner) return false;
  const mine = entries.filter(item => item && item.owner_key === owner).slice(0, 8);
  const others = history.filter(item => item.owner_key !== owner);
  history = [...mine, ...others];
  writeHistory();
  return true;
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
function sessionData(s) {
  if (!s) return null;
  const o = record(s);
  const allowed = new Set(asArray(o.notions));
  const notions = asArray(root.STI_DATA?.livresSTI?.[s.cls]?.items).filter(x => allowed.has(x.id)).map(x => ({ notion: x.label, domaine: x.domain, description: x.description }));
  return {
    classe: s.cls,
    numero: s.n,
    date: s.iso,
    trimestre: s.tri,
    titre: titleOf(s),
    reference: s.blk ? { titre: s.blk.t, domaine: s.blk.d, supports: s.blk.o, type: s.blk.k, detail: s.blk.det } : null,
    preparation: o.preparation || '',
    contenu_reellement_declare: o.contenu || '',
    travail_maison: o.devoirs || '',
    observations: o.obs || '',
    statut: o.done === true ? 'assurée' : o.done === false ? 'reportée' : 'non confirmé',
    notions
  };
}
function relatedNotions(topic) {
  const words = String(topic || '').toLocaleLowerCase('fr').split(/[^\p{L}\p{N}_$]+/u).filter(x => x.length > 2);
  const items = asArray(root.STI_DATA?.livresSTI?.[classe]?.items);
  if (!words.length) return [];
  return items.filter(x => {
    const haystack = `${x.label} ${x.description} ${x.domain}`.toLocaleLowerCase('fr');
    return words.some(w => haystack.includes(w));
  }).slice(0, 12).map(x => ({ notion: x.label, domaine: x.domain, description: x.description }));
}
function programmeContext() {
  return asArray(root.STI_DATA?.competences?.[classe]).map(x => ({ code: x.code, titre: x.t, domaine: x.domaine, attendus: x.attendu })).slice(0, 12);
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
function commonContext() {
  return {
    agent: 'Agent Vie Scolaire AI',
    matiere: 'Sciences et technologies de l’informatique (STI)',
    programme: 'Programme tunisien — enseignement secondaire',
    annee_scolaire: '2026-2027',
    classe,
    date_du_jour: today()
  };
}

function statusHtml() {
  if (!status) return '<span class="agent-status neutral"><i></i> Connexion sécurisée à tester</span>';
  if (status.configured) return `<span class="agent-status ok"><i></i> Gemini configuré · ${esc(status.model || 'modèle configuré')}</span>`;
  return '<span class="agent-status warn"><i></i> Fonction déployée · secret Gemini à configurer</span>';
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
function generateButton(label = 'Générer avec mon agent') {
  return `<div class="agent-form-footer"><button class="btn btn-primary agent-generate" type="button" data-agent-generate ${busy ? 'disabled' : ''}>${icon('spark')} ${busy ? 'L’agent travaille…' : esc(label)}</button><span>Une proposition sera affichée avant toute application.</span></div>`;
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
    </div><div class="agent-truth-note">${icon('shield')}<div><strong>${practical ? 'Le code n’est pas réputé exécuté par l’agent.' : 'Correction assistée, jamais note automatique définitive.'}</strong><span>${practical ? 'Sans résultat de test fourni, l’agent distingue l’analyse du code du fonctionnement réel à vérifier. Vous gardez la validation finale.' : 'Vérifiez chaque attribution de points et les passages marqués comme illisibles avant de saisir la note dans votre espace élèves.'}</span></div></div>${transcriptionReview ? '<div class="agent-form-footer"><span>La transcription est prête. Relisez-la et poursuivez depuis l’avertissement ci-dessous.</span></div>' : generateButton(rubricFirst ? 'Proposer d’abord le barème' : handwritingFirst ? 'Transcrire avant correction' : 'Analyser et proposer une correction')}`;
}

function resultHeader(title, subtitle, applyLabel = '') {
  return `<div class="agent-result-top agent-no-print"><div><span>PROPOSITION DE L’AGENT · À VÉRIFIER</span><strong>${esc(title)}</strong>${subtitle ? `<small>${esc(subtitle)}</small>` : ''}</div><div class="agent-result-actions">${applyLabel ? `<button class="btn btn-primary" data-agent-apply>${icon('arrow')} ${esc(applyLabel)}</button>` : ''}<button class="btn btn-ghost" data-agent-download>${icon('download')} Exporter</button><button class="btn btn-ghost" data-agent-print>${icon('print')} Imprimer</button></div></div>`;
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
  return `<details class="agent-flow agent-no-print" id="agent-flow"><summary><span><small>COMPRENDRE LE PARCOURS</small><strong>Comment l’Agent Vie Scolaire AI produit un document</strong></span><span class="agent-flow-toggle">Afficher le schéma</span></summary><div class="agent-flow-content"><img src="assets/agent-vie-scolaire-flux.svg" alt="Schéma du parcours : professeur connecté, formulaire de l’agent, vérification Supabase, génération Gemini, réponse structurée, relecture et validation par l’enseignant, puis remplacement, insertion, impression ou export." loading="lazy" width="1600" height="950"><a href="assets/agent-vie-scolaire-flux.svg" download="schema-agent-vie-scolaire-ai.svg">Télécharger l’image du schéma (SVG)</a></div></details>`;
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
  return base;
}
function buildPayload(meta) {
  const f = forms[tool];
  const base = { context: { ...commonContext(), ...meta }, input: {} };
  if (tool === 'fiche') {
    const notionsSelectionnees = curriculumSelection('notions', f.notions);
    const competencesSelectionnees = curriculumSelection('competences', f.competences);
    const selectedSession = findSession(f.session);
    const seance = sessionData(selectedSession);
    const existingPreparation = selectedSession ? String(record(selectedSession).preparation || '') : '';
    base.input = {
      seance, methode: f.methode, objectif_prioritaire: f.objectif, consignes: f.consignes,
      mode_document: f.remplacer && existingPreparation.trim() ? 'remplacement' : 'nouveau',
      document_a_remplacer: f.remplacer ? existingPreparation : '',
      notions_selectionnees: notionsSelectionnees,
      competences_selectionnees: competencesSelectionnees,
      competences: competencesSelectionnees.length ? competencesSelectionnees : programmeContext()
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
      notions_du_referentiel: notionsSelectionnees.length ? notionsSelectionnees : relatedNotions(f.sujet),
      notions_selectionnees: notionsSelectionnees,
      competences_selectionnees: competencesSelectionnees,
      competences: competencesSelectionnees.length ? competencesSelectionnees : programmeContext()
    };
  } else if (tool === 'cahier') {
    const selectedSession = findSession(f.session);
    const existingRecord = selectedSession ? record(selectedSession) : {};
    const existingEntry = String(existingRecord.contenu || '');
    base.input = {
      seance: sessionData(selectedSession),
      mode_document: f.remplacer && existingEntry.trim() ? 'remplacement' : 'nouveau',
      document_a_remplacer: f.remplacer ? { contenu: existingEntry, travail_maison: existingRecord.devoirs || '', observations: existingRecord.obs || '' } : '',
      realise_precise_par_enseignant: f.realise,
      travail_donne_precise: f.devoirs,
      observations_precisees: f.observations
    };
  } else if (tool === 'repartition') {
    base.input = {
      trimestre: Number(f.trimestre), consignes: f.consignes,
      seances: sessions().filter(s => s.tri === Number(f.trimestre)).map(sessionData),
      calendrier: { vacances: root.VACANCES || [], fin_annee: root.SCHOOL?.finAnnee }
    };
  } else {
    const uncertain = asArray(transcriptionReview?.transcription_incertaine);
    base.input = {
      ...f,
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
    context: { ...commonContext(), classe, type_devoir: f.type_devoir, task: 'transcription' },
    input: {
      type_devoir: f.type_devoir,
      sujet: f.sujet,
      texte_fourni_par_enseignant: f.copie.trim(),
      nombre_de_photos: attachments.length
    }
  };
}
function buildRubricPayload(meta) {
  const f = forms.correction;
  return {
    context: { ...commonContext(), ...meta, task: 'bareme' },
    input: { type_devoir: f.type_devoir, sujet: f.sujet, note_maximale: Number(f.sur) || 20, consignes: f.consignes }
  };
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
async function callAgent(task, payload = {}) {
  if (!root.cloudReady || !root.cloudReady()) throw new Error('La connexion Supabase n’est pas configurée. Ouvrez les réglages Cloud de votre plateforme.');
  const token = await root.authToken();
  if (!token) {
    if (root.openAuth) root.openAuth();
    throw new Error('Connectez-vous à votre espace professeur pour utiliser votre agent.');
  }
  const cfg = root.cloudCfg();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 110000);
  try {
    const response = await fetch(`${cfg.url.replace(/\/$/, '')}/functions/v1/assistant-ia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.key, Authorization: `Bearer ${token}` },
      body: JSON.stringify({ task, ...payload, attachments: (task === 'transcription' || (task === 'correction' && !transcriptionReview)) ? attachments : [] }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Le serveur de l’agent a répondu avec le code ${response.status}.`);
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
  const rubricFirst = tool === 'correction' && forms.correction.mode_bareme === 'proposer' && !forms.correction.bareme.trim();
  const handwritingFirst = tool === 'correction' && shouldTranscribeHandwriting(forms.correction, attachments.length) && !transcriptionReview;
  const task = rubricFirst ? 'bareme' : handwritingFirst ? 'transcription' : tool;
  const meta = makeMeta();
  const payload = rubricFirst ? buildRubricPayload(meta) : handwritingFirst ? buildTranscriptionPayload() : buildPayload(meta);
  const requestOwner = activeTeacherKey();
  const requestToken = generationToken;
  busy = true;
  results[tool] = null;
  draw();
  try {
    const data = await callAgent(task, payload);
    if (requestToken !== generationToken || requestOwner !== activeTeacherKey()) return;
    if (!data.result || typeof data.result !== 'object') throw new Error('La réponse de l’agent ne contient pas de document exploitable.');
    status = { configured: true, model: data.meta?.model || status?.model };
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
    results[tool] = data.result;
    resultMeta[tool] = meta;
    if (task !== 'correction') {
      const teacherHistory = currentHistory();
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
    notice = data.configured ? `Fonction Supabase accessible et configuration détectée pour « ${data.model} ». Lancez une courte génération pour valider aussi l’accès à Gemini.` : 'La fonction Supabase répond, mais le secret GEMINI_API_KEY manque ou le modèle Gemini doit être vérifié. Suivez le guide AGENT_IA.md.';
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
  if (tool === 'correction' && field.dataset.agentField === 'copie' && transcriptionReview) {
    transcriptionAcknowledged = false;
    const checkbox = el('agent-transcription-ack');
    if (checkbox) checkbox.checked = false;
    const proceed = document.querySelector('[data-agent-transcription-proceed]');
    if (proceed && hasUncertainTranscription(transcriptionReview)) proceed.disabled = true;
  }
});
document.addEventListener('change', e => {
  const selection = e.target.closest('[data-agent-selection]');
  if (selection && ['notions', 'competences'].includes(selection.dataset.agentSelection) && forms[tool]) {
    const kind = selection.dataset.agentSelection;
    const selected = new Set(asArray(forms[tool][kind]).map(String));
    if (selection.checked) selected.add(String(selection.value));
    else selected.delete(String(selection.value));
    forms[tool][kind] = [...selected];
    const count = document.querySelector(`[data-agent-selection-count="${kind}"]`);
    if (count) count.textContent = selectedCountLabel(selected.size);
    return;
  }
  if (e.target.matches('[data-agent-class]')) {
    classe = e.target.value === '4SI2' ? '4SI2' : '3SI1';
    forms.fiche.session = ''; forms.fiche.notions = []; forms.fiche.competences = []; forms.fiche.remplacer = false;
    forms.exercices.notions = []; forms.exercices.competences = []; forms.exercices.remplacement_id = '';
    forms.cahier.session = ''; forms.cahier.remplacer = false;
    error = ''; notice = '';
    draw(); return;
  }
  if (e.target.id === 'agent-copy-files') { addImages(e.target.files); return; }
  if (e.target.id === 'agent-code-files') { addCodeFiles(e.target.files); return; }
  if (e.target.id === 'agent-transcription-ack') {
    transcriptionAcknowledged = e.target.checked;
    const proceed = document.querySelector('[data-agent-transcription-proceed]');
    if (proceed) proceed.disabled = hasUncertainTranscription(transcriptionReview) && !transcriptionAcknowledged;
    return;
  }
  const field = e.target.closest('[data-agent-field]');
  if (field && field.tagName === 'SELECT') {
    forms[tool][field.dataset.agentField] = fieldValue(field);
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
  const button = e.target.closest('[data-agent-tool],[data-agent-generate],[data-agent-test],[data-agent-apply],[data-agent-download],[data-agent-print],[data-agent-remove],[data-agent-remove-code],[data-agent-history],[data-agent-clear-history],[data-agent-transcription-proceed],[data-agent-transcription-reset],[data-agent-profile]');
  if (!button) return;
  if (button.dataset.agentTool && !busy) { tool = button.dataset.agentTool; error = ''; notice = ''; draw(); }
  if (button.hasAttribute('data-agent-generate')) generate();
  if (button.hasAttribute('data-agent-transcription-proceed')) continueFromTranscription();
  if (button.hasAttribute('data-agent-transcription-reset')) restartTranscription();
  if (button.hasAttribute('data-agent-test')) testConnection();
  if (button.hasAttribute('data-agent-profile')) root.openProfil?.();
  if (button.hasAttribute('data-agent-apply')) applyResult();
  if (button.hasAttribute('data-agent-download')) downloadResult();
  if (button.hasAttribute('data-agent-print')) printResult();
  if (button.dataset.agentRemove !== undefined) { attachments.splice(Number(button.dataset.agentRemove), 1); draw(); }
  if (button.dataset.agentRemoveCode !== undefined) { codeFiles.splice(Number(button.dataset.agentRemoveCode), 1); draw(); }
  if (button.dataset.agentHistory) {
    const item = currentHistory().find(x => x.id === button.dataset.agentHistory);
    if (item) { tool = item.task; classe = item.classe; results[tool] = item.result; resultMeta[tool] = item.meta; error = ''; notice = ''; draw(); }
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
    draw();
  },
  _test: {
    ficheText, relatedNotions, curriculumCatalog, curriculumSelection, validate,
    shouldTranscribeHandwriting, hasUncertainTranscription, preserveTranscriptionWarnings,
    documentIdentity, documentIdentityHtml, rubricToText,
    currentHistory, activeTeacherKey, saveCurrentHistory,
    renderers: { fiche: renderFiche, exercices: renderExercices, cahier: renderCahier, repartition: renderRepartition, correction: renderCorrection },
    formFor: task => { const previous = tool; tool = task; try { return formHtml(); } finally { tool = previous; } },
    buildPayloadFor: task => { const previous = tool; tool = task; try { return buildPayload(makeMeta()); } finally { tool = previous; } },
    buildPayload: () => buildPayload(makeMeta()), buildTranscriptionPayload
  }
};
})(window);
