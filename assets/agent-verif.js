/* Vérification locale d'une copie pratique : contrôles objectifs et reproductibles
   sur les fichiers rendus, sans IA, sans clé et sans réseau. Les résultats restent
   des constats (« présent », « absent », « à vérifier ») : la note n'est jamais
   décidée seule, l'enseignant garde la validation finale. */
(function (root) {
'use strict';

const MAX_CRITERES = 80;
const MAX_LIBELLE = 160;
const MAX_ATTENDU = 200;
const MAX_POINTS = 100;
const TECHNOS = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'js', label: 'JavaScript' },
  { id: 'php', label: 'PHP' },
  { id: 'sql', label: 'SQL' }
];
const LANG_OF_TECHNO = { html: ['html', 'htm'], css: ['css'], js: ['js', 'json'], php: ['php'], sql: ['sql'] };

const clean = (value, max) => String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
const round = value => Math.round(value * 2) / 2;
const clampPoints = value => {
  const number = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(number) || number < 0) return 0;
  return round(Math.min(number, MAX_POINTS));
};

/* --- Accès aux fichiers -------------------------------------------------- */

function byLanguage(files) {
  const groups = {};
  list(Array.from(files || [])).forEach(file => {
    const language = String(file?.language || '').toLocaleLowerCase('en');
    if (!language) return;
    (groups[language] = groups[language] || []).push({ name: clean(file?.name, 120), content: String(file?.content ?? '') });
  });
  return groups;
}
function list(value) { return Array.isArray(value) ? value : []; }
function textsFor(ctx, techno) {
  const languages = LANG_OF_TECHNO[techno] || [];
  return languages.flatMap(language => ctx.groups[language] || []);
}
function scan(files, expression) {
  for (const file of files) {
    const lines = file.content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
      if (expression.test(lines[index])) {
        return { file: file.name, line: index + 1, excerpt: lines[index].trim().slice(0, 120) };
      }
    }
  }
  return null;
}
function scanAll(files, expression) {
  for (const file of files) {
    const match = expression.exec(file.content);
    if (!match) continue;
    const start = Math.max(0, match.index);
    const line = file.content.slice(0, start).split(/\r?\n/).length;
    return { file: file.name, line, excerpt: file.content.slice(start, start + 120).split(/\r?\n/)[0].trim() };
  }
  return null;
}
function evidence(match) {
  return match ? `${match.file}${match.line ? ` ligne ${match.line}` : ''} : ${match.excerpt || ''}`.trim() : '';
}
/* Présent / absent / à vérifier : un contrôle « conditionnel » ne peut pas
   conclure quand l'élément concerné n'existe pas dans la copie. */
function present(ctx, techno, expression, condition, across = false) {
  const files = textsFor(ctx, techno);
  if (!files.length) return { statut: 'indetermine', preuve: `Aucun fichier ${techno.toUpperCase()} fourni pour cette copie.` };
  const finder = across ? scanAll : scan;
  if (condition && !finder(files, condition)) return { statut: 'indetermine', preuve: 'Élément concerné absent de la copie : à vérifier sur le rendu.' };
  const match = finder(files, expression);
  return match
    ? { statut: 'ok', preuve: evidence(match) }
    : { statut: 'absent', preuve: 'Motif attendu non trouvé dans les fichiers rendus.' };
}

const CHECKS = [
  /* HTML */
  { id: 'html.doctype', techno: 'html', libelle: 'HTML · déclaration <!DOCTYPE html>', points: 1, run: ctx => present(ctx, 'html', /<!doctype\s+html/i) },
  { id: 'html.lang', techno: 'html', libelle: 'HTML · langue déclarée sur <html lang>', points: 1, run: ctx => present(ctx, 'html', /<html[^>]*\slang\s*=/i) },
  { id: 'html.title', techno: 'html', libelle: 'HTML · titre de page renseigné', points: 1, run: ctx => present(ctx, 'html', /<title>\s*[^<\s][^<]*<\/title>/i) },
  { id: 'html.form', techno: 'html', libelle: 'HTML · formulaire avec méthode d’envoi', points: 2, run: ctx => present(ctx, 'html', /<form[^>]*\smethod\s*=/i, /<form[\s>]/i) },
  { id: 'html.input-name', techno: 'html', libelle: 'HTML · champs nommés (attribut name)', points: 2, run: ctx => present(ctx, 'html', /<(input|select|textarea)[^>]*\sname\s*=/i, /<(input|select|textarea)[\s>]/i) },
  { id: 'html.label', techno: 'html', libelle: 'HTML · étiquettes <label> associées aux champs', points: 1, run: ctx => present(ctx, 'html', /<label[^>]*(\sfor\s*=|\s*>)/i, /<(input|select|textarea)[\s>]/i) },
  { id: 'html.css-link', techno: 'html', libelle: 'HTML · feuille de style liée (rel="stylesheet")', points: 1, run: ctx => present(ctx, 'html', /<link[^>]*rel\s*=\s*["']?stylesheet/i) },
  { id: 'html.structure', techno: 'html', libelle: 'HTML · structure sémantique (header, nav, main, section, footer)', points: 1, run: ctx => present(ctx, 'html', /<(header|nav|main|section|article|footer)[\s>]/i) },
  { id: 'html.alt', techno: 'html', libelle: 'HTML · attribut alt sur les images', points: 1, run: ctx => present(ctx, 'html', /<img[^>]*\salt\s*=/i, /<img[\s>]/i) },
  { id: 'html.list-table', techno: 'html', libelle: 'HTML · liste ou tableau structuré', points: 1, run: ctx => present(ctx, 'html', /<(ul|ol|table|dl)[\s>]/i) },

  /* CSS */
  { id: 'css.rule', techno: 'css', libelle: 'CSS · au moins une règle avec sélecteur', points: 1, run: ctx => present(ctx, 'css', /[.#a-z][\w\-\s.#:>+~,[\]]*\s*\{/i) },
  { id: 'css.colors', techno: 'css', libelle: 'CSS · couleurs ou typographie personnalisées', points: 1, run: ctx => present(ctx, 'css', /(^|[\s;{])(color|background(-color)?|font-size|font-family)\s*:/i) },
  { id: 'css.box', techno: 'css', libelle: 'CSS · marges ou espacements (margin / padding)', points: 1, run: ctx => present(ctx, 'css', /(^|[\s;{])(margin|padding)(-[a-z]+)?\s*:/i) },
  { id: 'css.layout', techno: 'css', libelle: 'CSS · mise en page flex ou grid', points: 2, run: ctx => present(ctx, 'css', /display\s*:\s*(flex|grid)/i) },
  { id: 'css.responsive', techno: 'css', libelle: 'CSS · adaptation à l’écran (@media)', points: 2, run: ctx => present(ctx, 'css', /@media[^{]*\((max|min)-width/i) },
  { id: 'css.hover', techno: 'css', libelle: 'CSS · état survolé (:hover) ou focus', points: 1, run: ctx => present(ctx, 'css', /:(hover|focus(-visible|-within)?)\b/i) },

  /* JavaScript */
  { id: 'js.function', techno: 'js', libelle: 'JS · déclaration de fonction ou fonction fléchée', points: 2, run: ctx => present(ctx, 'js', /(function\s+[\w$]+\s*\(|\([^)]*\)\s*=>|\w+\s*=>)/) },
  { id: 'js.dom', techno: 'js', libelle: 'JS · sélection d’un élément du DOM', points: 2, run: ctx => present(ctx, 'js', /(getElementById|querySelector(All)?|getElementsBy\w+)\s*\(/) },
  { id: 'js.listener', techno: 'js', libelle: 'JS · écouteur d’événement (addEventListener)', points: 2, run: ctx => present(ctx, 'js', /addEventListener\s*\(/) },
  { id: 'js.condition', techno: 'js', libelle: 'JS · condition (if / ternaire)', points: 1, run: ctx => present(ctx, 'js', /(\bif\s*\(|\?[^:]+\s*:)/) },
  { id: 'js.loop', techno: 'js', libelle: 'JS · boucle ou itération', points: 1, run: ctx => present(ctx, 'js', /(\b(for|while)\s*\(|\.(forEach|map|filter|reduce)\s*\()/) },
  { id: 'js.variables', techno: 'js', libelle: 'JS · variables déclarées (const / let)', points: 1, run: ctx => present(ctx, 'js', /\b(const|let)\s+[\w$]+/) },

  /* PHP */
  { id: 'php.tag', techno: 'php', libelle: 'PHP · balise ouvrante <?php', points: 1, run: ctx => present(ctx, 'php', /<\?php/i) },
  { id: 'php.superglobal', techno: 'php', libelle: 'PHP · données de formulaire récupérées ($_POST / $_GET)', points: 2, run: ctx => present(ctx, 'php', /\$_(POST|GET|REQUEST)\s*\[/i) },
  { id: 'php.isset', techno: 'php', libelle: 'PHP · vérification de présence (isset / empty)', points: 2, run: ctx => present(ctx, 'php', /\b(isset|empty|array_key_exists)\s*\(/i) },
  { id: 'php.connection', techno: 'php', libelle: 'PHP · connexion à la base (PDO ou mysqli)', points: 2, run: ctx => present(ctx, 'php', /(new\s+PDO\s*\(|mysqli_connect\s*\(|mysqli\s*\(|pg_connect\s*\()/i) },
  { id: 'php.prepared', techno: 'php', libelle: 'PHP · requête préparée (protection contre l’injection)', points: 3, run: ctx => present(ctx, 'php', /(->prepare\s*\(|mysqli_prepare\s*\()/i) },
  { id: 'php.output', techno: 'php', libelle: 'PHP · affichage d’un résultat (echo / print)', points: 1, run: ctx => present(ctx, 'php', /\b(echo|print|printf)\b/i) },

  /* SQL */
  { id: 'sql.select', techno: 'sql', libelle: 'SQL · requête SELECT … FROM', points: 2, run: ctx => present(ctx, 'sql', /\bselect\b[\s\S]{0,200}?\bfrom\b/i, null, true) },
  { id: 'sql.where', techno: 'sql', libelle: 'SQL · filtrage avec WHERE', points: 2, run: ctx => present(ctx, 'sql', /\bwhere\b/i) },
  { id: 'sql.join', techno: 'sql', libelle: 'SQL · jointure entre tables (JOIN)', points: 2, run: ctx => present(ctx, 'sql', /\b(join)\b/i) },
  { id: 'sql.write', techno: 'sql', libelle: 'SQL · écriture des données (INSERT / UPDATE / DELETE)', points: 2, run: ctx => present(ctx, 'sql', /\b(insert\s+into|update\s+\w+\s+set|delete\s+from)\b/i) },
  { id: 'sql.create', techno: 'sql', libelle: 'SQL · création de table avec clé primaire', points: 2, run: ctx => present(ctx, 'sql', /primary\s+key/i, /create\s+table/i, true) },
  { id: 'sql.order', techno: 'sql', libelle: 'SQL · tri ou regroupement (ORDER BY / GROUP BY)', points: 1, run: ctx => present(ctx, 'sql', /\b(order|group)\s+by\b/i) }
];
const CHECK_INDEX = new Map(CHECKS.map(check => [check.id, check]));

/* --- Grille : contrôles automatiques + critères manuels + textes attendus -- */

function defaultPoints() {
  const points = {};
  CHECKS.forEach(check => { points[check.id] = check.points; });
  return points;
}
/* Une ligne « Libellé | points » pour un critère manuel ;
   « Libellé | texte attendu | points » pour une recherche dans la copie. */
function parseLines(text, kind) {
  return String(text ?? '').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#')).map(line => {
    const parts = line.split('|').map(part => part.trim());
    if (kind === 'attendu') {
      if (parts.length < 2 || !parts[1]) return null;
      return { libelle: clean(parts[0], MAX_LIBELLE), attendu: clean(parts[1], MAX_ATTENDU), points: clampPoints(parts.length > 2 ? parts[2] : 1) };
    }
    const last = parts[parts.length - 1];
    const hasPoints = parts.length > 1 && /^-?\d+([.,]\d+)?$/.test(last);
    return { libelle: clean(hasPoints ? parts.slice(0, -1).join(' | ') : line, MAX_LIBELLE), points: clampPoints(hasPoints ? last : 1) };
  }).filter(Boolean);
}
/* Construit la grille enregistrée à partir de l'éditeur : les critères
   automatiques cochés, puis les critères manuels, puis les textes attendus. */
function buildGrille(editor = {}) {
  const technos = list(editor.technos).filter(id => TECHNOS.some(techno => techno.id === id));
  const points = editor.points || {};
  const criteres = [];
  CHECKS.forEach(check => {
    if (!technos.includes(check.techno)) return;
    criteres.push({
      id: check.id, source: 'auto', techno: check.techno, check: check.id,
      libelle: check.libelle, points: clampPoints(points[check.id] ?? check.points)
    });
  });
  parseLines(editor.manuel, 'manuel').forEach((item, index) => criteres.push({ id: `manuel:${index}`, source: 'manuel', libelle: item.libelle, points: item.points }));
  parseLines(editor.attendus, 'attendu').forEach((item, index) => criteres.push({ id: `attendu:${index}`, source: 'attendu', libelle: item.libelle, attendu: item.attendu, points: item.points }));
  return normalizeGrille({ technos, criteres });
}
function normalizeGrille(grille = {}) {
  const seen = new Set();
  const criteres = list(grille.criteres).map((item, index) => {
    const source = ['auto', 'manuel', 'attendu'].includes(item?.source) ? item.source : 'manuel';
    const libelle = clean(item?.libelle, MAX_LIBELLE) || `Critère ${index + 1}`;
    const id = clean(item?.id, 60) || `${source}:${index}`;
    if (seen.has(id)) return null;
    seen.add(id);
    const critere = { id, source, libelle, points: clampPoints(item?.points) };
    if (source === 'auto' && CHECK_INDEX.has(item?.check)) {
      critere.check = item.check;
      critere.techno = CHECK_INDEX.get(item.check).techno;
    } else if (source === 'auto') {
      return null;
    }
    if (source === 'attendu') {
      const attendu = clean(item?.attendu, MAX_ATTENDU);
      if (!attendu) return null;
      critere.attendu = attendu;
    }
    return critere;
  }).filter(Boolean).slice(0, MAX_CRITERES);
  const technos = [...new Set(criteres.filter(item => item.source === 'auto').map(item => item.techno))];
  return { technos, criteres, total: totalPoints(criteres) };
}
function totalPoints(criteres) {
  return round(list(criteres).reduce((sum, item) => sum + clampPoints(item?.points), 0));
}
/* Reconstruit l'éditeur depuis une grille enregistrée. */
function editorFromGrille(grille = {}) {
  const points = defaultPoints();
  const technos = new Set();
  const manual = [], attendus = [];
  list(grille.criteres).forEach(critere => {
    if (critere?.source === 'auto' && CHECK_INDEX.has(critere.check)) {
      technos.add(CHECK_INDEX.get(critere.check).techno);
      points[critere.check] = clampPoints(critere.points);
    } else if (critere?.source === 'attendu') {
      attendus.push(`${critere.libelle} | ${critere.attendu} | ${clampPoints(critere.points)}`);
    } else if (critere?.source === 'manuel') {
      manual.push(`${critere.libelle} | ${clampPoints(critere.points)}`);
    }
  });
  return {
    technos: technos.size ? [...technos] : TECHNOS.map(techno => techno.id),
    points, manuel: manual.join('\n'), attendus: attendus.join('\n')
  };
}
/* Ajuste explicitement une grille au barème : le total devient la note
   maximale, avec des demi-points et un reliquat placé sur le premier critère. */
function scaleGrille(grille = {}, sur = 20) {
  const criteres = list(grille.criteres).map(item => ({ ...item }));
  const maximum = Number(String(sur ?? '').replace(',', '.'));
  const total = totalPoints(criteres);
  if (!Number.isFinite(maximum) || maximum <= 0 || !criteres.length) return normalizeGrille({ ...grille, criteres });
  if (total === maximum) return normalizeGrille({ ...grille, criteres });
  const factor = maximum / total;
  criteres.forEach(item => { item.points = round(Math.max(0, item.points * factor)); });
  let delta = round(maximum - totalPoints(criteres));
  if (delta !== 0) {
    const target = [...criteres].sort((a, b) => b.points - a.points)[0];
    target.points = round(Math.max(0, target.points + delta));
    delta = round(maximum - totalPoints(criteres));
    if (delta !== 0) criteres[0].points = round(Math.max(0, criteres[0].points + delta));
  }
  return normalizeGrille({ ...grille, criteres });
}

/* --- Exécution sur une copie -------------------------------------------- */

function searchInFiles(files, attendu) {
  const needle = normalize(attendu).replace(/\s+/g, ' ').trim();
  if (!needle) return null;
  for (const file of files) {
    const haystack = normalize(file.content).replace(/\s+/g, ' ');
    const index = haystack.indexOf(needle);
    if (index === -1) continue;
    const excerpt = haystack.slice(index, index + 100).trim();
    return { file: file.name, line: 0, excerpt: lineOfOriginal(file.content, needle) || excerpt };
  }
  return null;
}
function lineOfOriginal(content, normalizedNeedle) {
  const lines = content.split(/\r?\n/);
  const firstWord = normalizedNeedle.split(' ')[0].slice(0, 24);
  for (let index = 0; index < lines.length; index++) {
    if (normalize(lines[index]).includes(firstWord)) return lines[index].trim().slice(0, 120);
  }
  return '';
}
function runGrille(files, grille = {}) {
  const pieces = list(Array.from(files || []));
  const ctx = { groups: byLanguage(pieces), all: pieces.map(file => String(file?.content || '')).join('\n') };
  return list(grille.criteres).map(critere => {
    const max = clampPoints(critere.points);
    if (critere.source === 'auto' && CHECK_INDEX.has(critere.check)) {
      const outcome = CHECK_INDEX.get(critere.check).run(ctx);
      return { critere, points_max: max, statut: outcome.statut, preuve: clean(outcome.preuve, 300), points: outcome.statut === 'ok' ? max : 0 };
    }
    if (critere.source === 'attendu') {
      const found = searchInFiles(pieces, critere.attendu);
      return found
        ? { critere, points_max: max, statut: 'ok', preuve: `${found.file} : ${found.excerpt}`, points: max }
        : { critere, points_max: max, statut: 'absent', preuve: `Texte attendu « ${critere.attendu} » non trouvé.`, points: 0 };
    }
    return { critere, points_max: max, statut: 'manuel', preuve: 'Critère manuel : attribuez les points après lecture du rendu.', points: 0 };
  });
}
const STATUT_LABEL = { ok: 'Constaté', absent: 'Non constaté', indetermine: 'À vérifier', manuel: 'À évaluer' };
function localResult({ files = [], grille = {}, identifiant = 'Copie anonyme', sur = 20 } = {}) {
  const criteres = list(grille.criteres);
  if (!criteres.length) throw new Error('La grille de correction est vide : ajoutez des critères avant de lancer la vérification locale.');
  const maximum = Number(String(sur ?? '').replace(',', '.'));
  const total = totalPoints(criteres);
  if (!Number.isFinite(maximum) || maximum <= 0) throw new Error('La note maximale de l’épreuve est invalide.');
  if (total !== maximum) throw new Error(`La grille totalise ${total} points alors que l’épreuve est notée sur ${maximum}. Ajustez la grille au barème avant la vérification locale.`);
  const outcomes = runGrille(files, grille);
  const note = round(outcomes.reduce((sum, item) => sum + item.points, 0));
  const ok = outcomes.filter(item => item.statut === 'ok').length;
  const aVerifier = outcomes.filter(item => item.statut === 'indetermine').length;
  const manuels = outcomes.filter(item => item.statut === 'manuel').length;
  const questions = outcomes.map(item => ({
    question: item.critere.libelle,
    points_max: item.points_max,
    points_attribues: item.points,
    statut: item.statut,
    justification: `${STATUT_LABEL[item.statut]} — ${item.preuve}`,
    erreurs: item.statut === 'absent' ? [item.preuve] : [],
    elements_corrects: item.statut === 'ok' ? [item.preuve] : []
  }));
  return {
    titre: `Vérification locale · ${clean(identifiant, 60) || 'Copie anonyme'}`,
    mode: 'local',
    note, sur: maximum,
    confiance: `vérification locale · ${outcomes.length} critère(s)`,
    questions,
    appreciation: `Vérification locale, sans IA : ${ok} critère(s) constaté(s) sur ${outcomes.length}. ${manuels ? `${manuels} critère(s) manuel(s) à évaluer par l’enseignant. ` : ''}${aVerifier ? `${aVerifier} critère(s) à vérifier sur le rendu.` : ''}`.trim(),
    remediation: [],
    limites_analyse: [
      'Analyse statique des fichiers rendus : le programme n’a pas été exécuté et le résultat n’a pas été observé dans un navigateur.',
      'Les contrôles constatent la présence d’un motif ; ils ne jugent ni la qualité, ni la pertinence, ni la conformité au sujet.',
      'Les critères « à vérifier » et « à évaluer » attendent votre décision ; la note n’est retenue qu’après votre validation.'
    ]
  };
}

root.STI_VERIF = {
  TECHNOS, CHECKS, STATUT_LABEL, MAX_CRITERES,
  defaultPoints, parseLines, buildGrille, normalizeGrille, editorFromGrille, totalPoints, scaleGrille,
  runGrille, localResult, normalize, _test: { byLanguage, scan, searchInFiles, clampPoints }
};
})(typeof window !== 'undefined' ? window : globalThis);
