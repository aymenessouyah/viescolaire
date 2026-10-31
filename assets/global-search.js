/* Recherche globale (Ctrl/⌘ + K).
   Un seul index : onglets, séances, notions du livre (3SI1/4SI2), éléments des
   cinq annexes, compétences du programme, documents déposés et élèves.
   Le module est volontairement autonome : il ne lit que window.SESSIONS,
   window.STI_DATA, window.STI_ANNEX_TRACK et le store passé par app.js. */
(function (root) {
  'use strict';

  const VERSION = 'recherche-globale-v1';
  const LIMITE = 12;

  /* ---------- normalisation ---------- */
  /* Seules les balises de mise en forme sont retirées : les noms techniques
     des annexes (« <div> », « <table> »…) restent lisibles et cherchables. */
  const MISE_EN_FORME = /<\/?(sup|sub|b|strong|i|em|span|small|br|code|u|mark)\b[^>]*>/gi;
  function decodeEntities(value) {
    return String(value == null ? '' : value)
      .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"').replace(/&#39;/g, "'")
      .replace(/&nbsp;/gi, ' ').replace(/&bull;/gi, '•')
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&amp;/gi, '&');
  }
  function plain(value) {
    const brut = decodeEntities(value).replace(/\s+/g, ' ').trim();
    const nettoye = decodeEntities(String(value == null ? '' : value).replace(MISE_EN_FORME, ' '))
      .replace(/\s+/g, ' ')
      .trim();
    /* une notion qui EST une balise (« <sup> ») garde son intitulé complet */
    return nettoye || brut;
  }
  function normalize(value) {
    return plain(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[\u2019\u2018]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  }

  /* ---------- contexte ---------- */
  let contexte = null;
  function setContext(ctx) { if (ctx && typeof ctx === 'object') contexte = ctx; return contexte; }
  function context() {
    if (contexte) return contexte;
    return { store: root.store || {}, sessions: root.SESSIONS || {}, tabs: root.TABS || [] };
  }

  function liste(source) {
    if (Array.isArray(source)) return source;
    if (source && typeof source === 'object') return Object.values(source);
    return [];
  }

  /* ---------- index ---------- */
  function buildIndex(ctx) {
    ctx = ctx || context();
    const store = ctx.store || {};
    const sessions = ctx.sessions || {};
    const tabs = Array.isArray(ctx.tabs) ? ctx.tabs : [];
    const data = ctx.data || root.STI_DATA || {};
    const annexes = ctx.annexItems || ((root.STI_ANNEX_TRACK && root.STI_ANNEX_TRACK.items) || []);
    const entrees = [];

    const push = (type, label, sub, hint, action) => {
      const texte = plain(label);
      if (!texte) return;
      const sousTitre = plain(sub);
      entrees.push({
        id: type + ':' + entrees.length,
        type,
        label: texte,
        sub: sousTitre,
        hint: plain(hint),
        action,
        hay: normalize([texte, sousTitre, hint].join(' ')),
        labelN: normalize(texte)
      });
    };

    tabs.forEach(tab => push('Onglet', tab.t, 'Aller à la page', tab.id, { kind: 'view', view: tab.id }));

    Object.keys(sessions).forEach(cls => {
      (sessions[cls] || []).forEach(s => {
        const bloc = s.blk || {};
        const titre = bloc.t ? 'Séance ' + s.n + ' · ' + plain(bloc.t) : 'Séance ' + s.n + ' à planifier';
        push('Séance', titre, cls + ' · ' + s.iso + ' · T' + s.tri, [bloc.d, bloc.det, bloc.o, 'S' + s.n].join(' '),
          { kind: 'session', cls, n: s.n });
      });
    });

    const livres = data.livresSTI || {};
    Object.keys(livres).forEach(cls => {
      liste((livres[cls] || {}).items).forEach(item => {
        push('Notion', item.label, cls + ' · ' + (item.domain || '—') + ' · p.' + ((item.pages || []).join(', ') || '—'),
          [item.description, item.detail, item.kind, item.id].join(' '), { kind: 'notion', cls, id: item.id });
      });
    });

    liste(annexes).forEach(item => {
      push('Annexe', item.labelText || item.label,
        (item.annexTitle || 'Annexe') + (item.sectionLabel || item.sectionTitle ? ' · ' + (item.sectionLabel || item.sectionTitle) : ''),
        [item.descriptionText, item.exampleText, item.search, item.id].join(' '),
        { kind: 'annexe', id: item.id });
    });

    const competences = data.competences || {};
    Object.keys(competences).forEach(cls => {
      liste(competences[cls]).forEach(item => {
        if (!item) return;
        push('Compétence', item.t, cls + ' · compétence ' + (item.code || '?') + (item.domaine ? ' · ' + item.domaine : ''),
          [item.code, item.sous, (item.memo || []).join(' ')].join(' '), { kind: 'view', view: 'v-prog' });
      });
    });

    liste(data.docs).forEach(doc => {
      push('Document', doc.t, doc.g, [doc.f, doc.s, doc.d].join(' '), { kind: 'document', file: doc.f });
    });

    Object.keys(store.eleves || {}).forEach(cls => {
      liste(store.eleves[cls]).forEach(eleve => {
        if (!eleve) return;
        const nom = [eleve.nom, eleve.prenom].filter(Boolean).join(' ').trim() || 'Élève sans nom';
        push('Élève', nom, cls + (eleve.groupe ? ' · groupe ' + eleve.groupe : '') + (eleve.pc ? ' · ' + eleve.pc : ''),
          eleve.id, { kind: 'student', cls, id: eleve.id });
      });
    });

    return entrees;
  }

  /* ---------- classement ---------- */
  function score(entree, requete, jetons) {
    if (!jetons.length) return 0;
    for (const jeton of jetons) {
      if (!(entree.labelN.includes(jeton) || entree.hay.includes(jeton))) return 0;
    }
    let points = 10;
    if (entree.labelN === requete) points += 60;
    else if (entree.labelN.startsWith(requete)) points += 40;
    else if (entree.labelN.includes(requete)) points += 25;
    else if (entree.hay.includes(requete)) points += 8;
    points += Math.max(0, 6 - Math.round(entree.labelN.length / 12));
    return points;
  }

  function search(index, texte, limite) {
    const requete = normalize(texte);
    if (!requete) return [];
    const jetons = requete.split(' ').filter(Boolean);
    return (index || [])
      .map(entree => [entree, score(entree, requete, jetons)])
      .filter(paire => paire[1] > 0)
      .sort((a, b) => b[1] - a[1] || a[0].label.localeCompare(b[0].label, 'fr'))
      .slice(0, limite || LIMITE)
      .map(paire => paire[0]);
  }

  /* ---------- interface ---------- */
  let actif = 0;
  let resultats = [];

  function elements() {
    return {
      palette: document.getElementById('gs-palette'),
      input: document.getElementById('gs-input'),
      liste: document.getElementById('gs-results'),
      note: document.getElementById('gs-count')
    };
  }

  function dessiner() {
    const el = elements();
    if (!el.liste) return;
    if (!resultats.length) {
      const requete = (el.input && el.input.value || '').trim();
      el.liste.innerHTML = '<p class="gs-empty">' + (requete
        ? 'Aucun résultat pour « ' + escapeHtml(requete) + ' ».'
        : 'Tapez un mot : séance, notion, annexe, compétence, élève, document.') + '</p>';
      if (el.note) el.note.textContent = '';
      return;
    }
    el.liste.innerHTML = resultats.map((entree, i) =>
      '<button type="button" class="gs-item' + (i === actif ? ' on' : '') + '" aria-current="' + (i === actif) + '"' +
      ' data-index="' + i + '" onclick="STI_SEARCH.activateIndex(' + i + ')">' +
      '<span class="gs-type">' + escapeHtml(entree.type) + '</span>' +
      '<span class="gs-label">' + escapeHtml(entree.label) + '</span>' +
      '<span class="gs-sub">' + escapeHtml(entree.sub) + '</span>' +
      '</button>').join('');
    if (el.note) el.note.textContent = resultats.length + ' résultat' + (resultats.length > 1 ? 's' : '');
    const courant = el.liste.querySelector('.gs-item.on');
    if (courant && courant.scrollIntoView) courant.scrollIntoView({ block: 'nearest' });
  }

  function chercher() {
    const el = elements();
    resultats = search(buildIndex(), el.input ? el.input.value : '');
    actif = 0;
    dessiner();
  }

  function open(texte) {
    const el = elements();
    if (!el.palette) return false;
    el.palette.hidden = false;
    el.palette.classList.add('on');
    document.body.classList.add('gs-locked');
    if (el.input) {
      el.input.value = texte || '';
      el.input.focus();
      el.input.select && el.input.select();
    }
    chercher();
    return true;
  }

  function close() {
    const el = elements();
    if (!el.palette) return false;
    el.palette.classList.remove('on');
    el.palette.hidden = true;
    document.body.classList.remove('gs-locked');
    return true;
  }

  function toggle() {
    const el = elements();
    if (el.palette && !el.palette.hidden) return close();
    return open();
  }

  function deplacer(pas) {
    if (!resultats.length) return;
    actif = (actif + pas + resultats.length) % resultats.length;
    dessiner();
  }

  function ouvrirAction(action) {
    if (!action) return false;
    if (action.kind === 'notion' && root.STI_TRACK && typeof root.STI_TRACK.focusNotion === 'function') {
      return root.STI_TRACK.focusNotion(action.cls, action.id);
    }
    if (action.kind === 'annexe') {
      const onglet = root.STI_ANNEX_TRACK;
      if (typeof root.go === 'function') root.go('v-ref');
      if (onglet && typeof onglet.focus === 'function') return onglet.focus(action.id);
      return true;
    }
    if (action.kind === 'document') {
      if (typeof root.openDocument === 'function') return root.openDocument(action.file);
      if (action.file) { root.open(action.file, '_blank', 'noopener'); return true; }
      return false;
    }
    if (action.view && typeof root.go === 'function') return root.go(action.view), true;
    return false;
  }

  function activateIndex(i) {
    const entree = resultats[i];
    if (!entree) return false;
    close();
    return ouvrirAction(entree.action);
  }

  function activate(entree) {
    if (!entree) return false;
    close();
    return ouvrirAction(entree.action);
  }

  function bind() {
    const el = elements();
    if (!el.palette || typeof el.palette.addEventListener !== 'function' || el.palette.dataset.gsBound === 'true') return;
    el.palette.dataset.gsBound = 'true';
    el.palette.addEventListener('click', e => { if (e.target === el.palette) close(); });
    if (el.input && typeof el.input.addEventListener === 'function') {
      el.input.addEventListener('input', chercher);
      el.input.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); deplacer(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); deplacer(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); activateIndex(actif); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
      });
    }
    document.addEventListener('keydown', e => {
      const touche = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && !e.altKey && touche === 'k') {
        e.preventDefault();
        toggle();
      } else if (touche === 'escape' && el.palette && !el.palette.hidden) {
        close();
      }
    });
  }

  function init() {
    if (typeof document === 'undefined') return;
    const demarrer = () => { bind(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
    else demarrer();
  }

  root.STI_SEARCH = Object.freeze({
    version: VERSION,
    limite: LIMITE,
    plain,
    normalize,
    buildIndex,
    search,
    setContext,
    context,
    open,
    close,
    toggle,
    deplacer,
    activate,
    activateIndex,
    init
  });

  init();
})(typeof window !== 'undefined' ? window : globalThis);
