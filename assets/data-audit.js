/* Contrôle d'intégrité des données et sauvegarde complète en JSON.
   - audit()   : repère les fiches orphelines, les identifiants inconnus, les
                 doublons et les saisies rattachées à des objets supprimés.
   - exportBundle() : prépare un JSON daté et versionné de tout le store.
   - readBundle()   : relit et valide un export (format actuel ou ancien).
   - restore()      : applique les données validées au store de l'application.
   Les trois premières fonctions sont pures et testables sans navigateur. */
(function (root) {
  'use strict';

  const VERSION = 'controle-donnees-v1';
  const FORMAT = 'espace-pedagogique-sti';
  const CLES = ['times', 'seances', 'saved', 'profil', 'classes', 'eleves', 'epreuves', 'notes', 'presences'];
  const NIVEAUX = { alerte: 'À corriger', attention: 'À vérifier', info: 'Information' };

  const esc = value => String(value == null ? '' : value)
    .replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const plain = value => String(value == null ? '' : value)
    .replace(/<[^>]*>/g, ' ').replace(/&[a-zA-Z0-9#]+;/g, ' ').replace(/\s+/g, ' ').trim();

  function liste(source) {
    if (Array.isArray(source)) return source;
    if (source && typeof source === 'object') return Object.values(source);
    return [];
  }

  /* ---------- audit ---------- */
  function audit(ctx) {
    ctx = ctx || {};
    const store = ctx.store || {};
    const sessions = ctx.sessions || {};
    const livres = ctx.livres || {};
    const annexes = liste(ctx.annexItems);
    const idsAnnexes = new Set(annexes.map(a => a.id));
    const problemes = [];
    const ajouter = (niveau, code, message, listeExemples) => {
      const exemples = (listeExemples || []).filter(Boolean);
      problemes.push({ niveau, code, message, nombre: exemples.length, exemples: exemples.slice(0, 6) });
    };

    const fiches = store.seances || {};
    const classes = Object.keys(sessions);
    const sessionsParCle = new Map();
    classes.forEach(cls => (sessions[cls] || []).forEach(s => sessionsParCle.set(cls + '|' + s.n, s)));

    /* 1. fiches rattachées à une séance qui n'existe plus */
    const fantomes = Object.keys(fiches).filter(cle => !sessionsParCle.has(cle));
    ajouter('attention', 'fiche-fantome',
      'Fiche de séance rattachée à une séance inexistante (numéro supprimé ou classe modifiée).', fantomes);

    /* 2. identifiants de notions inconnus, par classe */
    const idsNotions = new Map(classes.map(cls => [cls, new Set(liste(((livres || {})[cls] || {}).items).map(n => n.id))]));
    const notionsInconnues = [];
    const annexesInconnues = [];
    Object.keys(fiches).forEach(cle => {
      const fiche = fiches[cle] || {};
      const cls = cle.split('|')[0];
      const connues = idsNotions.get(cls) || new Set();
      liste(fiche.notions).forEach(id => {
        if (!connues.has(id)) notionsInconnues.push(cle + ' → ' + id);
      });
      liste(fiche.annexes).forEach(id => {
        if (!idsAnnexes.has(id)) annexesInconnues.push(cle + ' → ' + id);
      });
    });
    ajouter('attention', 'notion-inconnue',
      'Notions cochées qui ne figurent plus dans le référentiel de la classe.', notionsInconnues);
    ajouter('attention', 'annexe-inconnue',
      'Éléments d’annexes cochés qui ne figurent plus dans les cinq annexes.', annexesInconnues);

    /* 3. référentiel : doublons et fiches incomplètes */
    const doublonsRef = [];
    const incompletes = [];
    classes.forEach(cls => {
      const vus = new Set();
      liste(((livres || {})[cls] || {}).items).forEach(item => {
        if (!item || !item.id) { incompletes.push(cls + ' → notion sans identifiant'); return; }
        if (!String(item.label == null ? '' : item.label).trim()) incompletes.push(cls + ' → ' + item.id + ' sans intitulé');
        if (vus.has(item.id)) doublonsRef.push(cls + ' → ' + item.id);
        vus.add(item.id);
      });
    });
    ajouter('alerte', 'referentiel-doublon', 'Identifiants de notions présents deux fois dans le référentiel.', doublonsRef);
    ajouter('attention', 'referentiel-incomplet', 'Notions sans identifiant ou sans intitulé.', incompletes);

    /* 4. épreuves : doublons titre + date */
    const epreuvesDoublons = [];
    classes.forEach(cls => {
      const vus = new Set();
      liste((store.epreuves || {})[cls]).forEach(exam => {
        if (!exam) return;
        const cle = plain(exam.titre) + '|' + (exam.date || '');
        if (vus.has(cle)) epreuvesDoublons.push(cls + ' → ' + plain(exam.titre) + ' (' + (exam.date || 'sans date') + ')');
        vus.add(cle);
      });
    });
    ajouter('attention', 'epreuve-doublon', 'Deux épreuves portent le même titre à la même date.', epreuvesDoublons);

    /* 5. notes rattachées à une épreuve supprimée ou à un élève inconnu */
    const idsEpreuves = new Set();
    classes.forEach(cls => liste((store.epreuves || {})[cls]).forEach(exam => exam && idsEpreuves.add(exam.id)));
    const notesOrphelines = [];
    const notesEleves = [];
    Object.keys(store.notes || {}).forEach(epid => {
      if (!idsEpreuves.has(epid)) notesOrphelines.push(epid);
      const elevesCls = new Set();
      classes.forEach(cls => liste((store.eleves || {})[cls]).forEach(e => e && elevesCls.add(e.id)));
      Object.keys(store.notes[epid] || {}).forEach(eid => { if (!elevesCls.has(eid)) notesEleves.push(epid + ' → ' + eid); });
    });
    ajouter('attention', 'note-orpheline', 'Notes conservées pour une épreuve qui n’existe plus.', notesOrphelines);
    ajouter('attention', 'note-eleve-inconnu', 'Notes rattachées à un élève retiré de la classe.', notesEleves);

    /* 6. appels saisis un jour sans séance pour la classe */
    const appelsHorsSeance = [];
    classes.forEach(cls => {
      const dates = new Set((sessions[cls] || []).map(s => s.iso));
      Object.keys((store.presences || {})[cls] || {}).forEach(iso => {
        if (!dates.has(iso)) appelsHorsSeance.push(cls + ' → ' + iso);
      });
    });
    ajouter('info', 'appel-hors-seance', 'Appels enregistrés un jour sans séance planifiée pour la classe.', appelsHorsSeance);

    /* 7. élèves en double dans une même classe */
    const elevesDoublons = [];
    classes.forEach(cls => {
      const vus = new Set();
      liste((store.eleves || {})[cls]).forEach(e => {
        if (!e || !e.id) return;
        if (vus.has(e.id)) elevesDoublons.push(cls + ' → ' + e.id);
        vus.add(e.id);
      });
    });
    ajouter('alerte', 'eleve-doublon', 'Un même identifiant d’élève apparaît deux fois dans la classe.', elevesDoublons);

    /* 8. classes déclarées absentes du calendrier de référence */
    const classesInconnues = [];
    liste(store.classes).forEach(c => {
      if (c && c.id && !sessions[c.id]) classesInconnues.push(c.id);
    });
    ajouter('info', 'classe-inconnue', 'Classe ajoutée à la main, sans séances générées dans le calendrier.', classesInconnues);

    return {
      ok: problemes.every(p => p.nombre === 0),
      problemes,
      total: problemes.reduce((a, p) => a + p.nombre, 0),
      alertes: problemes.filter(p => p.niveau === 'alerte').reduce((a, p) => a + p.nombre, 0),
      stats: {
        fiches: Object.keys(fiches).length,
        notions: classes.reduce((a, cls) => a + liste(((livres || {})[cls] || {}).items).length, 0),
        annexes: annexes.length,
        eleves: classes.reduce((a, cls) => a + liste((store.eleves || {})[cls]).length, 0),
        epreuves: classes.reduce((a, cls) => a + liste((store.epreuves || {})[cls]).length, 0),
        notes: Object.keys(store.notes || {}).reduce((a, epid) => a + Object.keys(store.notes[epid] || {}).length, 0),
        appels: classes.reduce((a, cls) => a + Object.keys((store.presences || {})[cls] || {}).length, 0)
      }
    };
  }

  /* ---------- export ---------- */
  function exportBundle(ctx) {
    ctx = ctx || {};
    const controle = audit(ctx);
    return {
      format: FORMAT,
      formatVersion: 1,
      application: root.APP_VER || root.MAJ_ATTENDUE || '',
      exportedAt: new Date().toISOString(),
      ecole: ctx.school || root.SCHOOL || null,
      controle: { ok: controle.ok, problemes: controle.total, detail: controle.problemes.filter(p => p.nombre) },
      store: JSON.parse(JSON.stringify(ctx.store || {}))
    };
  }

  function exportJSON(ctx, nomFichier) {
    const paquet = exportBundle(ctx);
    const texte = JSON.stringify(paquet, null, 2);
    const nom = nomFichier || 'espace-sti-complet-' + paquet.exportedAt.slice(0, 10) + '.json';
    if (root.document) {
      const lien = root.document.createElement('a');
      lien.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(texte);
      lien.download = nom;
      root.document.body.appendChild(lien); lien.click(); lien.remove();
    }
    return { texte, nom, paquet };
  }

  /* ---------- lecture / validation ---------- */
  function readBundle(texte) {
    const erreurs = [];
    const avertissements = [];
    let paquet = null;
    try { paquet = JSON.parse(String(texte || '')); }
    catch (e) { return { ok: false, erreurs: ['Fichier JSON illisible : ' + e.message], avertissements, store: null }; }

    if (!paquet || typeof paquet !== 'object' || Array.isArray(paquet)) {
      return { ok: false, erreurs: ['Le fichier ne contient pas un objet JSON.'], avertissements, store: null };
    }
    const store = paquet.store || paquet.donnees || null;
    if (!store || typeof store !== 'object' || Array.isArray(store)) {
      return { ok: false, erreurs: ['Aucune donnée reconnaissable : la clé « store » ou « donnees » est absente.'], avertissements, store: null };
    }
    if (paquet.format && paquet.format !== FORMAT) {
      erreurs.push('Format « ' + paquet.format + ' » inconnu : attendu « ' + FORMAT + ' ».');
    }
    if (!paquet.format) avertissements.push('Export ancien (sans en-tête de format) : les données restent lisibles.');

    CLES.forEach(cle => { if (store[cle] === undefined) avertissements.push('Section « ' + cle + ' » absente : elle sera conservée telle quelle.'); });
    if (!store.seances || typeof store.seances !== 'object') avertissements.push('Aucune fiche de séance dans ce fichier.');
    if (!store.eleves || typeof store.eleves !== 'object') avertissements.push('Aucun élève dans ce fichier.');

    return {
      ok: erreurs.length === 0,
      erreurs, avertissements,
      store,
      application: paquet.application || '',
      exportedAt: paquet.exportedAt || '',
      controle: paquet.controle || null
    };
  }

  function restore(cible, source) {
    if (!cible || !source || typeof source !== 'object') return cible;
    CLES.forEach(cle => {
      if (source[cle] === undefined) return;
      if (cle === 'saved') { if (typeof source.saved === 'string') cible.saved = source.saved; return; }
      cible[cle] = JSON.parse(JSON.stringify(source[cle]));
    });
    return cible;
  }

  /* ---------- interface ---------- */
  let contexte = null;
  let dernierAudit = null;
  let importEnAttente = null;

  function niveauBadge(niveau) {
    return '<span class="da-badge da-' + niveau + '">' + esc(NIVEAUX[niveau] || niveau) + '</span>';
  }

  function panel(ctx) {
    if (ctx) contexte = ctx;
    const c = contexte || {};
    const resultat = audit(c);
    dernierAudit = resultat;
    const s = resultat.stats;

    const lignes = resultat.problemes.filter(p => p.nombre).map(p =>
      '<li class="da-issue da-' + p.niveau + '">' + niveauBadge(p.niveau) +
      '<div><strong>' + p.nombre + ' · ' + esc(p.message) + '</strong>' +
      (p.exemples.length ? '<div class="da-examples">' + p.exemples.map(esc).join(' · ') + (p.nombre > p.exemples.length ? ' …' : '') + '</div>' : '') +
      '</div></li>').join('');

    return '<section class="da-panel no-print" id="da-panel" aria-labelledby="da-title">' +
      '<header class="da-head"><div><h2 id="da-title">Contrôle des données et sauvegarde complète</h2>' +
      '<p class="bl-sub">Vérification des liens entre fiches, référentiel, élèves et évaluations, puis export ou restauration de tout l’espace en un fichier JSON.</p></div>' +
      '<span class="da-status ' + (resultat.ok ? 'ok' : (resultat.alertes ? 'ko' : 'warn')) + '">' +
      (resultat.ok ? 'Aucun problème détecté' : resultat.total + ' point(s) à examiner') + '</span></header>' +

      (lignes ? '<ul class="da-issues">' + lignes + '</ul>'
        : '<p class="da-clean">Fiches, notions, annexes, épreuves, notes et appels sont cohérents.</p>') +

      '<div class="da-body">' +
      '<table class="bl-table da-stats"><caption>Contenu actuel</caption><tbody>' +
      '<tr><td>Fiches de séance</td><td class="bl-num">' + s.fiches + '</td></tr>' +
      '<tr><td>Notions au référentiel</td><td class="bl-num">' + s.notions + '</td></tr>' +
      '<tr><td>Éléments d’annexes</td><td class="bl-num">' + s.annexes + '</td></tr>' +
      '<tr><td>Élèves</td><td class="bl-num">' + s.eleves + '</td></tr>' +
      '<tr><td>Épreuves</td><td class="bl-num">' + s.epreuves + '</td></tr>' +
      '<tr><td>Notes saisies</td><td class="bl-num">' + s.notes + '</td></tr>' +
      '<tr><td>Appels enregistrés</td><td class="bl-num">' + s.appels + '</td></tr>' +
      '</tbody></table>' +
      '<div class="da-actions">' +
      '<button class="btn btn-line" type="button" onclick="STI_DATA_AUDIT.rerender()">Revérifier</button>' +
      '<button class="btn btn-primary" type="button" onclick="STI_DATA_AUDIT.exportNow()">Exporter le JSON complet</button>' +
      '<label class="btn btn-line da-import-label">Importer un JSON…' +
      '<input type="file" accept="application/json,.json" id="da-import" onchange="STI_DATA_AUDIT.importFile(this)">' +
      '</label>' +
      '</div>' +
      '<div id="da-import-zone" class="da-import-zone" aria-live="polite"></div>' +
      '<p class="bl-muted bl-small">L’export contient tout l’espace (fiches, horaires, profil, classes, élèves, épreuves, notes, appels) et un rapport de contrôle. L’import remplace ces sections après confirmation ; téléchargez d’abord un export si vous hésitez.</p>' +
      '</div></section>';
  }

  function renderImportZone() {
    const zone = root.document && root.document.getElementById('da-import-zone');
    if (!zone) return;
    if (!importEnAttente) { zone.innerHTML = ''; return; }
    const l = importEnAttente;
    if (!l.ok) {
      zone.innerHTML = '<div class="da-import ko"><strong>Import refusé.</strong><ul>' +
        l.erreurs.map(e => '<li>' + esc(e) + '</li>').join('') + '</ul></div>';
      return;
    }
    const store = l.store;
    const nbFiches = liste(store.seances).length;
    zone.innerHTML = '<div class="da-import ok"><strong>Fichier valide</strong>' +
      '<p>' + (l.exportedAt ? 'Exporté le ' + esc(l.exportedAt.slice(0, 10)) + '. ' : '') +
      nbFiches + ' fiche(s), ' + Object.keys(store.eleves || {}).length + ' classe(s) d’élèves, ' +
      Object.keys(store.notes || {}).length + ' épreuve(s) notée(s).</p>' +
      (l.avertissements.length ? '<ul class="da-warn">' + l.avertissements.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul>' : '') +
      '<div class="da-actions"><button class="btn btn-primary" type="button" onclick="STI_DATA_AUDIT.applyImport()">Remplacer mes données</button>' +
      '<button class="btn btn-line" type="button" onclick="STI_DATA_AUDIT.cancelImport()">Annuler</button></div></div>';
  }

  function importFile(input) {
    const fichier = input && input.files && input.files[0];
    if (!fichier) return;
    const lecteur = new root.FileReader();
    lecteur.onload = () => {
      importEnAttente = readBundle(lecteur.result);
      renderImportZone();
      if (input.value !== undefined) input.value = '';
    };
    lecteur.onerror = () => {
      importEnAttente = { ok: false, erreurs: ['Lecture du fichier impossible.'], avertissements: [] };
      renderImportZone();
    };
    lecteur.readAsText(fichier);
  }

  function applyImport() {
    if (!importEnAttente || !importEnAttente.ok) return false;
    const c = contexte || {};
    const cible = c.store || root.store;
    restore(cible, importEnAttente.store);
    if (typeof root.save === 'function') root.save(true);
    if (typeof root.renderAll === 'function') root.renderAll(true);
    importEnAttente = null;
    if (typeof root.toast === 'function') root.toast('Données restaurées depuis le fichier JSON');
    render();
    return true;
  }

  function cancelImport() {
    importEnAttente = null;
    renderImportZone();
    return false;
  }

  function rerender() { render(); }

  function exportNow() {
    const c = contexte || {};
    const resultat = exportJSON(c);
    if (typeof root.toast === 'function') root.toast('Export complet téléchargé (' + resultat.nom + ')');
    return resultat.paquet;
  }

  function render() { if (root.STI_CLASS_REPORT) root.STI_CLASS_REPORT.render(); }

  function bind(zone) {
    if (!zone) return;
    renderImportZone();
  }

  root.STI_DATA_AUDIT = Object.freeze({
    version: VERSION,
    format: FORMAT,
    cles: CLES,
    audit,
    exportBundle,
    exportJSON,
    readBundle,
    restore,
    panel,
    bind,
    render,
    rerender,
    exportNow,
    importFile,
    applyImport,
    cancelImport,
    dernier: () => dernierAudit,
    enAttente: () => importEnAttente
  });
})(typeof window !== 'undefined' ? window : globalThis);
