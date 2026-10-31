/* Bilan de fin de trimestre par classe.
   Synthèse prête pour le conseil de classe : séances et heures, couverture des
   notions et des annexes, évaluations, assiduité, compétences et élèves à suivre.
   Les calculs sont purs (build) et testables sans navigateur. */
(function (root) {
  'use strict';

  const VERSION = 'bilan-trimestre-v1';
  const TRIS = { 1: '1er trimestre', 2: '2e trimestre', 3: '3e trimestre' };
  const STATUTS = {
    acquis: 'Acquis', 'en-cours': 'En cours', renforcer: 'À renforcer', '': 'Non évaluée'
  };

  const esc = value => String(value == null ? '' : value)
    .replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const r2 = n => Math.round(n * 100) / 100;
  const pct = (n, total) => total ? Math.round(1000 * n / total) / 10 : 0;
  const plain = value => String(value == null ? '' : value)
    .replace(/<[^>]*>/g, ' ').replace(/&[a-zA-Z0-9#]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const fr = n => Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 });

  function liste(source) {
    if (Array.isArray(source)) return source;
    if (source && typeof source === 'object') return Object.values(source);
    return [];
  }

  /* ---------- calculs ---------- */
  function build(ctx) {
    ctx = ctx || {};
    const cls = ctx.cls || '3SI1';
    const term = Number(ctx.term) || 1;
    const store = ctx.store || {};
    const sessions = ((ctx.sessions || {})[cls] || []).slice();
    const livre = (ctx.livres || {})[cls] || {};
    const notionsRef = liste(livre.items);
    const idsNotions = new Set(notionsRef.map(n => n.id));
    const annexes = liste(ctx.annexItems);
    const idsAnnexes = new Set(annexes.map(a => a.id));
    const heuresParSeance = Number(ctx.heuresParSeance) || 2;
    const aujourdhui = ctx.today || '';

    const duTrimestre = sessions.filter(s => s.tri === term).sort((a, b) => String(a.iso).localeCompare(String(b.iso)));
    const periode = duTrimestre.length
      ? { debut: duTrimestre[0].iso, fin: duTrimestre[duTrimestre.length - 1].iso }
      : { debut: '', fin: '' };

    const seances = { prevues: duTrimestre.length, assurees: 0, reportees: 0, aConfirmer: 0, aVenir: 0 };
    const vues = new Set();
    const planifiees = new Set();
    const annexesVues = new Set();
    const annexesPrevues = new Set();
    const fiches = store.seances || {};

    duTrimestre.forEach(s => {
      const fiche = fiches[cls + '|' + s.n] || {};
      if (fiche.done === true) seances.assurees++;
      else if (fiche.done === false) seances.reportees++;
      else if (aujourdhui && s.iso <= aujourdhui) seances.aConfirmer++;
      else seances.aVenir++;
      const fait = fiche.done === true;
      liste(fiche.notions).forEach(id => { if (idsNotions.has(id)) (fait ? vues : planifiees).add(id); });
      liste(fiche.annexes).forEach(id => { if (idsAnnexes.has(id)) (fait ? annexesVues : annexesPrevues).add(id); });
    });
    planifiees.forEach(id => vues.delete(id));
    annexesPrevues.forEach(id => annexesVues.delete(id));

    const domaines = [];
    const parDomaine = new Map();
    notionsRef.forEach(n => {
      const d = n.domain || 'Autres';
      if (!parDomaine.has(d)) { parDomaine.set(d, { domaine: d, total: 0, vues: 0 }); domaines.push(parDomaine.get(d)); }
      const ligne = parDomaine.get(d);
      ligne.total++;
      if (vues.has(n.id)) ligne.vues++;
    });
    domaines.forEach(d => { d.percent = pct(d.vues, d.total); });

    const examens = liste((store.epreuves || {})[cls])
      .filter(e => e && e.date && periode.debut && e.date >= periode.debut && e.date <= periode.fin)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    const elevesRef = liste((store.eleves || {})[cls]);
    const notes = store.notes || {};
    const presences = (store.presences || {})[cls] || {};
    const datesPresence = Object.keys(presences).filter(iso => periode.debut && iso >= periode.debut && iso <= periode.fin);

    const definitions = liste((ctx.competences || {})[cls]);
    const competences = definitions.map(def => ({
      code: def.code, titre: plain(def.t), domaine: plain(def.domaine),
      acquis: 0, 'en-cours': 0, renforcer: 0, non: 0
    }));

    const eleves = elevesRef.map(eleve => {
      const notesEleve = [];
      let absEval = 0;
      examens.forEach(exam => {
        const note = (notes[exam.id] || {})[eleve.id];
        if (!note) return;
        if (note.abs) { absEval++; return; }
        const valeur = Number(note.n);
        if (!isFinite(valeur)) return;
        notesEleve.push(valeur * 20 / (Number(exam.bareme) || 20));
      });
      const moyenne = notesEleve.length ? r2(notesEleve.reduce((a, b) => a + b, 0) / notesEleve.length) : null;

      /* codes d'appel : p présent, a absent, e exclu, s sorti, b entrée par billet, r retard */
      let absences = 0, retards = 0, exclusions = 0, presents = 0, sorties = 0, billets = 0;
      datesPresence.forEach(iso => {
        const code = (presences[iso] || {})[eleve.id] || '';
        if (code === 'a') absences++;
        else if (code === 'r') retards++;
        else if (code === 'e') exclusions++;
        else if (code === 's') sorties++;
        else if (code === 'b') billets++;
        else if (code === 'p') presents++;
      });

      const states = (eleve.competences && eleve.competences[String(term)]) || {};
      let aRenforcer = 0, acquis = 0, enCours = 0;
      competences.forEach(ligne => {
        const etat = states[ligne.code] || '';
        if (etat === 'acquis') { ligne.acquis++; acquis++; }
        else if (etat === 'en-cours') { ligne['en-cours']++; enCours++; }
        else if (etat === 'renforcer') { ligne.renforcer++; aRenforcer++; }
        else ligne.non++;
      });

      const nom = [eleve.nom, eleve.prenom].filter(Boolean).join(' ').trim() || 'Élève sans nom';
      const alerte = (moyenne !== null && moyenne < 10) || absences >= 3 || aRenforcer >= 2;
      const vigilance = !alerte && ((moyenne !== null && moyenne < 12) || absences === 2 || retards >= 2);
      return {
        id: eleve.id, nom, groupe: eleve.groupe || '', pc: eleve.pc || '',
        moyenne, nbNotes: notesEleve.length, absEval, absences, retards, exclusions, sorties, billets,
        acquis, enCours, aRenforcer,
        statut: alerte ? 'alerte' : (vigilance ? 'vigilance' : 'ok')
      };
    });

    const moyennes = eleves.map(e => e.moyenne).filter(m => m !== null);
    const moyenneClasse = moyennes.length ? r2(moyennes.reduce((a, b) => a + b, 0) / moyennes.length) : null;
    const totalAbsences = eleves.reduce((a, e) => a + e.absences, 0);
    const totalRetards = eleves.reduce((a, e) => a + e.retards, 0);
    const totalExclusions = eleves.reduce((a, e) => a + e.exclusions, 0);
    const totalSorties = eleves.reduce((a, e) => a + e.sorties, 0);
    const totalBillets = eleves.reduce((a, e) => a + e.billets, 0);
    const attendus = eleves.length * datesPresence.length;

    const suivre = eleves
      .filter(e => e.statut !== 'ok')
      .sort((a, b) => (a.moyenne === null ? 99 : a.moyenne) - (b.moyenne === null ? 99 : b.moyenne) || b.absences - a.absences);

    const bilan = {
      cls, term, titre: cls + ' · ' + (TRIS[term] || term + 'e trimestre'),
      periode,
      heures: { parSeance: heuresParSeance, prevues: seances.prevues * heuresParSeance, assurees: seances.assurees * heuresParSeance },
      seances,
      notions: {
        total: notionsRef.length, vues: vues.size, planifiees: planifiees.size,
        percent: pct(vues.size, notionsRef.length), domaines
      },
      annexes: {
        total: annexes.length, vues: annexesVues.size,
        percent: pct(annexesVues.size, annexes.length)
      },
      evaluations: {
        nb: examens.length,
        moyenne: moyenneClasse,
        min: moyennes.length ? r2(Math.min(...moyennes)) : null,
        max: moyennes.length ? r2(Math.max(...moyennes)) : null,
        reussite: pct(moyennes.filter(m => m >= 10).length, moyennes.length),
        titres: examens.map(e => ({ titre: e.titre || 'Épreuve', type: e.type || '', date: e.date }))
      },
      assiduite: {
        seancesObservees: datesPresence.length,
        attendus, absences: totalAbsences, retards: totalRetards,
        exclusions: totalExclusions, sorties: totalSorties, billets: totalBillets,
        tauxPresence: attendus ? pct(attendus - totalAbsences, attendus) : null,
        elevesSansAbsence: eleves.filter(e => e.absences === 0).length
      },
      competences: { definitions: competences, eleves: eleves.length },
      eleves, suivre,
      alertes: suivre.filter(e => e.statut === 'alerte').length,
      effectif: eleves.length,
      empty: duTrimestre.length === 0
    };
    bilan.synthese = synthese(bilan);
    return bilan;
  }

  function synthese(b) {
    if (b.empty) return 'Aucune séance planifiée pour ' + b.titre + ' : vérifiez la répartition annuelle.';
    const parties = [];
    parties.push(b.seances.assurees + ' séance(s) assurée(s) sur ' + b.seances.prevues + ' prévues (' +
      b.heures.assurees + ' h sur ' + b.heures.prevues + ' h).');
    parties.push('Couverture des notions : ' + b.notions.vues + ' / ' + b.notions.total +
      ' (' + fr(b.notions.percent) + ' %).');
    if (b.annexes.total) parties.push('Éléments d’annexes abordés : ' + b.annexes.vues + ' / ' + b.annexes.total + '.');
    if (b.evaluations.nb) {
      parties.push(b.evaluations.nb + ' évaluation(s) ; moyenne de classe ' +
        (b.evaluations.moyenne === null ? 'non calculable' : fr(b.evaluations.moyenne) + ' / 20') +
        (b.evaluations.reussite ? ', ' + fr(b.evaluations.reussite) + ' % des élèves à 10 ou plus' : '') + '.');
    } else {
      parties.push('Aucune évaluation notée sur la période.');
    }
    parties.push('Assiduité : ' + b.assiduite.absences + ' absence(s), ' + b.assiduite.retards + ' retard(s)' +
      (b.assiduite.tauxPresence === null ? '' : ', présence ' + fr(b.assiduite.tauxPresence) + ' %') + '.');
    if (b.suivre.length) {
      parties.push(b.suivre.length + ' élève(s) à suivre : ' + b.suivre.slice(0, 4).map(e => e.nom).join(', ') +
        (b.suivre.length > 4 ? '…' : '') + '.');
    } else {
      parties.push('Aucun élève en difficulté signalée par les seuils automatiques.');
    }
    return parties.join(' ');
  }

  /* ---------- interface ---------- */
  let contexte = null;
  let etatClasse = '3SI1';
  let etatTerme = 1;

  function classesDispo(ctx) {
    const cles = Object.keys((ctx && ctx.sessions) || {});
    return cles.length ? cles : ['3SI1', '4SI2'];
  }

  function barre(percent, libelle) {
    const p = Math.max(0, Math.min(100, Number(percent) || 0));
    return '<div class="bl-bar" role="img" aria-label="' + esc(libelle + ' : ' + fr(p) + ' %') + '">' +
      '<span style="width:' + p + '%"></span></div>';
  }

  function rapportHTML(bilan) {
    const b = bilan;
    const kpi = (classe, label, valeur, note) =>
      '<div class="bl-kpi ' + classe + '"><span class="bl-kpi-label">' + esc(label) + '</span>' +
      '<strong>' + esc(valeur) + '</strong>' + (note ? '<span class="bl-kpi-note">' + esc(note) + '</span>' : '') + '</div>';

    const domaines = b.notions.domaines.map(d =>
      '<tr><td>' + esc(d.domaine) + '</td><td>' + d.vues + ' / ' + d.total + '</td>' +
      '<td class="bl-bar-cell">' + barre(d.percent, d.domaine) + '</td><td class="bl-num">' + fr(d.percent) + ' %</td></tr>').join('');

    const competences = b.competences.definitions.map(c =>
      '<tr><td><strong>' + esc(c.code) + '</strong> ' + esc(c.titre) + '</td>' +
      '<td class="bl-num">' + c.acquis + '</td><td class="bl-num">' + c['en-cours'] + '</td>' +
      '<td class="bl-num">' + c.renforcer + '</td><td class="bl-num">' + c.non + '</td></tr>').join('');

    const suivre = b.suivre.length ? b.suivre.map(e =>
      '<tr class="bl-' + e.statut + '"><td>' + esc(e.nom) + (e.groupe ? ' <span class="bl-muted">(groupe ' + esc(e.groupe) + ')</span>' : '') + '</td>' +
      '<td class="bl-num">' + (e.moyenne === null ? '—' : fr(e.moyenne) + ' / 20') + '</td>' +
      '<td class="bl-num">' + e.absences + '</td><td class="bl-num">' + e.retards + '</td>' +
      '<td class="bl-num">' + e.aRenforcer + '</td>' +
      '<td>' + (e.statut === 'alerte' ? 'Alerte' : 'Vigilance') + '</td></tr>').join('')
      : '<tr><td colspan="6" class="bl-muted">Aucun élève au-delà des seuils (moyenne &lt; 10, 3 absences ou 2 compétences à renforcer).</td></tr>';

    return '' +
      '<section class="bl-sheet" aria-label="Bilan de ' + esc(b.titre) + '">' +
      '<header class="bl-head">' +
      '<div><span class="bl-eyebrow">CONSEIL DE CLASSE · SYNTHÈSE</span>' +
      '<h2>Bilan de ' + esc(b.titre) + '</h2>' +
      '<p class="bl-sub">Période du ' + (b.periode.debut ? esc(dateFr(b.periode.debut)) : '—') +
      ' au ' + (b.periode.fin ? esc(dateFr(b.periode.fin)) : '—') + ' · ' + b.effectif + ' élève(s)</p></div>' +
      '<div class="bl-head-actions no-print">' +
      '<button class="btn btn-primary" type="button" onclick="STI_CLASS_REPORT.print()">Imprimer / PDF</button>' +
      '</div></header>' +

      '<div class="bl-kpis">' +
      kpi('', 'Séances assurées', b.seances.assurees + ' / ' + b.seances.prevues, b.heures.assurees + ' h effectuées') +
      kpi('', 'Notions vues', b.notions.vues + ' / ' + b.notions.total, fr(b.notions.percent) + ' % du référentiel') +
      kpi('', 'Moyenne de classe', b.evaluations.moyenne === null ? '—' : fr(b.evaluations.moyenne) + ' / 20', b.evaluations.nb + ' épreuve(s)') +
      kpi('', 'Absences cumulées', String(b.assiduite.absences), b.assiduite.retards + ' retard(s)') +
      kpi('', 'Élèves à suivre', String(b.suivre.length), b.alertes + ' alerte(s)') +
      '</div>' +

      '<p class="bl-synthese"><strong>Synthèse.</strong> ' + esc(b.synthese) + '</p>' +

      '<div class="bl-grid">' +
      '<section class="bl-card"><h3>Séances et heures</h3><table class="bl-table"><tbody>' +
      '<tr><td>Assurées</td><td class="bl-num">' + b.seances.assurees + '</td></tr>' +
      '<tr><td>Reportées</td><td class="bl-num">' + b.seances.reportees + '</td></tr>' +
      '<tr><td>À confirmer (passées, non cochées)</td><td class="bl-num">' + b.seances.aConfirmer + '</td></tr>' +
      '<tr><td>À venir</td><td class="bl-num">' + b.seances.aVenir + '</td></tr>' +
      '<tr class="bl-total"><td>Heures effectuées</td><td class="bl-num">' + b.heures.assurees + ' h / ' + b.heures.prevues + ' h</td></tr>' +
      '</tbody></table></section>' +

      '<section class="bl-card"><h3>Évaluations et assiduité</h3><table class="bl-table"><tbody>' +
      '<tr><td>Épreuves du trimestre</td><td class="bl-num">' + b.evaluations.nb + '</td></tr>' +
      '<tr><td>Moyenne de classe</td><td class="bl-num">' + (b.evaluations.moyenne === null ? '—' : fr(b.evaluations.moyenne) + ' / 20') + '</td></tr>' +
      '<tr><td>Notes extrêmes</td><td class="bl-num">' + (b.evaluations.min === null ? '—' : fr(b.evaluations.min) + ' – ' + fr(b.evaluations.max)) + '</td></tr>' +
      '<tr><td>Élèves à 10 ou plus</td><td class="bl-num">' + fr(b.evaluations.reussite) + ' %</td></tr>' +
      '<tr><td>Séances avec appel</td><td class="bl-num">' + b.assiduite.seancesObservees + '</td></tr>' +
      '<tr><td>Taux de présence</td><td class="bl-num">' + (b.assiduite.tauxPresence === null ? '—' : fr(b.assiduite.tauxPresence) + ' %') + '</td></tr>' +
      '<tr><td>Absences / retards / exclusions</td><td class="bl-num">' + b.assiduite.absences + ' / ' + b.assiduite.retards + ' / ' + b.assiduite.exclusions + '</td></tr>' +
      '<tr><td>Sorties / entrées par billet</td><td class="bl-num">' + b.assiduite.sorties + ' / ' + b.assiduite.billets + '</td></tr>' +
      '</tbody></table></section>' +

      '<section class="bl-card bl-wide"><h3>Couverture des notions (' + b.notions.vues + ' / ' + b.notions.total + ')</h3>' +
      (domaines ? '<table class="bl-table"><thead><tr><th>Domaine</th><th>Vues</th><th>Progression</th><th class="bl-num">%</th></tr></thead><tbody>' + domaines + '</tbody></table>'
        : '<p class="bl-muted">Référentiel indisponible pour cette classe.</p>') +
      '<p class="bl-muted bl-small">Annexes : ' + b.annexes.vues + ' / ' + b.annexes.total + ' élément(s) abordé(s) (' + fr(b.annexes.percent) + ' %).</p>' +
      '</section>' +

      (b.competences.definitions.length ? '<section class="bl-card bl-wide"><h3>Compétences — ' + b.competences.eleves + ' élève(s)</h3>' +
        '<table class="bl-table"><thead><tr><th>Compétence</th><th class="bl-num">Acquis</th><th class="bl-num">En cours</th><th class="bl-num">À renforcer</th><th class="bl-num">Non évaluée</th></tr></thead><tbody>' +
        competences + '</tbody></table></section>' : '') +

      '<section class="bl-card bl-wide"><h3>Élèves à suivre (' + b.suivre.length + ')</h3>' +
      '<table class="bl-table"><thead><tr><th>Élève</th><th class="bl-num">Moyenne</th><th class="bl-num">Abs.</th><th class="bl-num">Ret.</th><th class="bl-num">À renforcer</th><th>Signal</th></tr></thead><tbody>' +
      suivre + '</tbody></table></section>' +
      '</div>' +

      '<footer class="bl-foot">Document de travail préparé le ' + esc(dateFr(new Date().toISOString().slice(0, 10))) +
      '. Les données proviennent des fiches de séance, des notes et des appels saisis dans l’application : à vérifier avant diffusion.</footer>' +
      '</section>';
  }

  function dateFr(iso) {
    if (!iso) return '—';
    const d = new Date(iso + 'T12:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function render(ctx) {
    if (ctx) contexte = ctx;
    const zone = document.getElementById('v-bilan');
    if (!zone) return;
    const c = contexte || {};
    const classes = classesDispo(c);
    if (!classes.includes(etatClasse)) etatClasse = classes[0];
    const bilan = build({
      cls: etatClasse, term: etatTerme, store: c.store, sessions: c.sessions,
      livres: (root.STI_DATA || {}).livresSTI, annexItems: (root.STI_ANNEX_TRACK || {}).items,
      competences: (root.STI_DATA || {}).competences, today: isoAujourdhui(),
      heuresParSeance: heuresDe(etatClasse)
    });

    const choixClasse = classes.map(id =>
      '<button type="button" class="bl-pick' + (id === etatClasse ? ' on' : '') + '" onclick="STI_CLASS_REPORT.select(\'' + id + '\')">' + esc(id) + '</button>').join('');
    const choixTerme = [1, 2, 3].map(n =>
      '<button type="button" class="bl-pick' + (n === etatTerme ? ' on' : '') + '" onclick="STI_CLASS_REPORT.select(null,' + n + ')">' + TRIS[n] + '</button>').join('');

    zone.innerHTML = '<div class="bl-page">' +
      '<div class="bl-title">' +
      '<div><span class="bl-eyebrow">PILOTAGE · CONSEIL DE CLASSE</span>' +
      '<h1 class="bl-h1">Bilan de fin de trimestre</h1>' +
      '<p class="bl-sub">Séances, notions, évaluations, assiduité et compétences réunis en une page imprimable.</p></div>' +
      '</div>' +
      '<div class="bl-controls no-print"><div class="bl-picks" role="group" aria-label="Classe">' + choixClasse + '</div>' +
      '<div class="bl-picks" role="group" aria-label="Trimestre">' + choixTerme + '</div></div>' +
      rapportHTML(bilan) +
      (root.STI_DATA_AUDIT ? root.STI_DATA_AUDIT.panel(c) : '') +
      '</div>';

    if (root.STI_DATA_AUDIT) root.STI_DATA_AUDIT.bind(zone);
  }

  function isoAujourdhui() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function heuresDe(cls) {
    const ref = (root.STI_DATA || {}).reference;
    const cfg = ref && ref.CLASSES ? ref.CLASSES[cls] : null;
    return cfg && Number(cfg.heures) ? Number(cfg.heures) : 2;
  }

  function select(cls, term) {
    if (cls) etatClasse = cls;
    if (term) etatTerme = Number(term);
    render();
  }

  function print() {
    root.print();
  }

  /* Rendu initial si la page a été ouverte directement sur #v-bilan. */
  function boot() {
    if (typeof document === 'undefined') return;
    const demarrer = () => {
      const zone = document.getElementById('v-bilan');
      if (zone && root.store && !zone.dataset.blReady) {
        zone.dataset.blReady = '1';
        render({ store: root.store, sessions: root.SESSIONS || {} });
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
    else demarrer();
  }

  root.STI_CLASS_REPORT = Object.freeze({
    version: VERSION,
    tris: TRIS,
    build,
    synthese,
    render,
    select,
    print,
    dateFr,
    boot
  });

  boot();
})(typeof window !== 'undefined' ? window : globalThis);
