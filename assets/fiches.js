/* =====================================================================
   Fiches pédagogiques 4SI2 — module d'intégration à l'espace pédagogique
   ---------------------------------------------------------------------
   - onglet « Fiches pédagogiques » : liste des 50 séances, filtres, recherche
   - boîte de fiche pédagogique au format du modèle (S8-9 version 3),
     entièrement préremplie et modifiable par l'enseignant
   - menu d'impression : une séance, toutes les séances, répartition
     trimestrielle, répartition annuelle
   - connexion au cahier de textes de l'application (contenu réel, devoirs)
   Les modifications de l'enseignant sont conservées dans le navigateur
   (clé sti_fiches_edits_v1) et suivent la sauvegarde locale et le Cloud.
   ===================================================================== */
(function (root) {
'use strict';

const KEY = 'sti_fiches_edits_v1';
const CLS = '4SI2';                 // classe du cahier de textes (préparations)
/* deux jeux de fiches : 4SI2 (50 séances) et 3SI1 (54 séances) */
const FICHES_CLS = {
  '4SI2': { cle: 'fiches4SI2', label: '4ème SI', nom: '4<sup>e</sup> année SI (4SI2)',
            modules: 'SQL · HTML5 · CSS · JavaScript · PHP', nb: 50, heures: '100 h',
            docs: 'docs/fiches-4si-2026', evaluations: '9', synchro: true },
  '3SI1': { cle: 'fiches3SI1', label: '3ème SI', nom: '3<sup>e</sup> année SI (3SI1)',
            modules: 'HTML5 · CSS3 · JavaScript · SQL / BD', nb: 54, heures: '108 h',
            docs: 'docs/fiches-3si-2026', evaluations: '9', synchro: true }
};
let ficCls = '4SI2';
function CF() { return FICHES_CLS[ficCls]; }
const JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const NAT = { 'cours':'Cours / TP', 'devoir de contrôle':'Devoir de contrôle',
              'devoir de synthèse':'Devoir de synthèse', 'correction':'Correction',
              'sujet de bac':'Sujet de bac' };

let edits = {};
let filtre = { tri: 0, nature: '', q: '' };
let ctxN = null;
let classic = null;          // référence à l'ancienne modale (cahier de textes)

/* ------------------------------------------------------------ utilitaires */
function base(c) { return (root.STI_DATA && root.STI_DATA[FICHES_CLS[c || ficCls].cle]) || {}; }
function list() { return Object.values(base()).sort((a, b) => a.n - b.n); }
function D(iso) { return new Date(iso + 'T00:00:00'); }
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function fmtLong(iso) { const d = D(iso); return JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
function fmtShort(iso) { const d = D(iso); return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear(); }

function load() {
  try { edits = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { edits = {}; }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(edits)); } catch (e) {}
}
function fiche(n) {
  const b = base()[String(n)];
  if (!b) return null;
  const f = clone(b);
  const e = edits[ficCls + '|' + n];
  if (e) Object.assign(f, e);
  if (!f.modules) f.modules = CF().modules;
  return f;
}
function isEdited(n) { return !!edits[ficCls + '|' + n]; }

/* ---------------------------------------------------------------------
   Préparation du cahier de textes, construite À PARTIR DU FICHIER DE FICHES
   (data/fiches.js) : mêmes objectifs, mêmes étapes, mêmes durées, mêmes
   critères que la fiche imprimée. Texte multiligne, affiché tel quel par
   l'application (les retours à la ligne sont conservés).
   --------------------------------------------------------------------- */
function plat(t) { return String(t || '').replace(/\s*\|\s*/g, ' ; ').replace(/\s+/g, ' ').trim(); }

function prepText(f) {
  const L = [];
  L.push('Séance ' + f.n + ' — ' + plat(f.titre));
  L.push(fmtLong(f.date) + ' · 2 h par groupe (' + f.duree + ' min) · ' + plat(f.domaines) +
         (f.pages ? ' · Smart Book ' + plat(f.pages) : '') +
         (f.nature !== 'cours' ? ' · ' + (NAT[f.nature] || f.nature) : ''));
  L.push('');
  L.push('OBJECTIFS');
  f.objectifs.forEach((o, i) => L.push((i + 1) + ') ' + plat(o.titre) + ' — ' + o.items.map(plat).join(' ; ')));
  L.push('');
  L.push('MÉTHODE ACTIVE (de découverte)');
  L.push(plat(f.methode));
  L.push('');
  L.push('PRÉREQUIS');
  f.prerequis.forEach(p => L.push('• ' + plat(p)));
  L.push('');
  L.push('DÉROULEMENT (' + f.duree + ' min)');
  f.etapes.forEach((e, i) => {
    const dur = plat(e.duree);
    L.push((i + 1) + '. ' + plat(e.etape) + ' — ' + (/min/.test(dur) ? dur : dur + ' min'));
    L.push('   Professeur : ' + plat(e.prof));
    L.push('   Élèves : ' + plat(e.eleves));
    L.push('   Moyens : ' + plat(e.moyens));
  });
  L.push('');
  L.push('CRITÈRES DE RÉUSSITE');
  f.criteres.forEach(c => L.push('• ' + plat(c)));
  L.push('');
  L.push('TRAVAIL À LA MAISON');
  L.push(plat(f.maison));
  return L.join('\n');
}

/* Report automatique dans le cahier de textes : on remplit ce qui est vide,
   on rafraîchit ce que la fiche avait elle-même rempli, et on ne touche
   jamais à une préparation saisie ou modifiée par le professeur. */
function syncPreparations() {
  const st = root.store;
  if (!st || !st.seances) return 0;
  const sess = (root.SESSIONS && root.SESSIONS[CLS]) || [];
  let changed = 0;
  list().forEach(f => {
    const k = CLS + '|' + f.n;
    const cur = st.seances[k] || {};
    const prep = prepText(f);
    const o = Object.assign({}, cur);
    if (!cur.preparation) { o.preparation = prep; o.prepFromFiche = true; }
    else if (cur.prepFromFiche === true && cur.preparation !== prep) o.preparation = prep;
    if (!cur.devoirs && f.maison) o.devoirs = plat(f.maison);
    const s = sess.find(x => x.n === f.n);
    const ref = s && s.blk ? s.blk.t : '';
    if (!cur.title || cur.titleFromFiche === true || cur.title === ref) {
      if (o.title !== f.titre) { o.title = f.titre; o.titleFromFiche = true; }
    }
    if (JSON.stringify(o) !== JSON.stringify(cur)) { st.seances[k] = o; changed++; }
  });
  if (changed && typeof root.save === 'function') root.save(true);
  return changed;
}

/* ------------------------------- préparation de séance, prise DANS LA FICHE
   Le texte de préparation du cahier de textes n'est plus saisi à la main :
   il est construit à partir du fichier de fiches (data/fiches.js et
   data/fiches3SI1.js) — objectifs, méthode active, prérequis, déroulement
   détaillé sur 120 min avec les activités professeur / élèves et les moyens,
   critères de réussite, trace et travail à la maison.                       */
function prepText(f, classe) {
  const c = classe || ficCls;
  const rep = (root.STI_DATA && root.STI_DATA[(FICHES_CLS[c] || CF()).cle === 'fiches3SI1'
                ? 'repartition3SI1' : 'repartition4SI2']) || [];
  const p = rep.find ? rep.find(x => x.num === f.n) : null;
  const date = p ? fmtLong(p.iso) : fmtLong(f.date);
  const L = [];
  L.push('Séance ' + f.n + ' — ' + f.titre);
  L.push(date + ' · 2 h par groupe (120 min) · ' + f.domaines +
         (f.pages && f.pages !== '—' ? ' · Smart Book ' + f.pages : ''));
  L.push('');
  L.push('OBJECTIFS');
  (f.objectifs || []).forEach(o => L.push('— ' + o.titre + ' : ' + (o.items || []).join(' ; ')));
  L.push('');
  L.push('MÉTHODE ACTIVE (DE DÉCOUVERTE)');
  L.push(f.methode || '');
  L.push('');
  L.push('PRÉREQUIS');
  (f.prerequis || []).forEach(x => L.push('• ' + x));
  L.push('');
  L.push('DÉROULEMENT — 120 min');
  (f.etapes || []).forEach(function (e, i) {
    L.push((i + 1) + '. ' + e.etape + ' — ' + e.duree + ' min');
    L.push('     Professeur : ' + String(e.prof || '').replace(/\s*\|\s*/g, ' ; '));
    L.push('     Élèves : ' + String(e.eleves || '').replace(/\s*\|\s*/g, ' ; '));
    L.push('     Moyens : ' + e.moyens);
  });
  L.push('');
  L.push('CRITÈRES DE RÉUSSITE');
  (f.criteres || []).forEach(x => L.push('• ' + x));
  if (f.trace) { L.push(''); L.push('TRACE À RETENIR'); L.push(f.trace); }
  L.push('');
  L.push('TRAVAIL À LA MAISON');
  L.push(f.maison || '');
  if (f.erreurs && f.erreurs.length) {
    L.push('');
    L.push('ERREURS À ÉVITER');
    f.erreurs.forEach(x => L.push('• ' + x));
  }
  return L.join('\n');
}

/* Remplit le cahier de textes avec les préparations des fiches.
   Règle absolue : on ne remplace JAMAIS une préparation déjà écrite. */
function fillPreparations(silent) {
  if (!root.store || !root.store.seances) return 0;
  let changed = 0;
  Object.keys(FICHES_CLS).forEach(function (c) {
    const set = base(c);
    const parDate = {};
    Object.keys(set).forEach(k => { parDate[set[k].date] = set[k]; });
    const sess = (root.SESSIONS && root.SESSIONS[c]) || [];
    sess.forEach(function (s) {
      const f = parDate[s.iso] || set[String(s.n)];
      if (!f) return;
      const kk = c + '|' + s.n;
      const o = root.store.seances[kk] || {};
      if (o.preparation && String(o.preparation).trim()) return;   // préservée
      root.store.seances[kk] = Object.assign({}, o, {
        preparation: prepText(f, c),
        devoirs: (o.devoirs && String(o.devoirs).trim()) ? o.devoirs : plat(f.maison),
        title: f.titre,
        prepFromFiche: true, titleFromFiche: true, ficheCls: c
      });
      changed++;
    });
  });
  if (changed && !silent && typeof root.save === 'function') { try { root.save(true); } catch (e) {} }
  return changed;
}

/* --------------------------------------------- nouvelle répartition 4SI2
   Bloc inséré en tête de l'onglet « Répartition annuelle » du site :
   les 50 séances datées, par trimestre, avec les évaluations et un accès
   direct à la fiche pédagogique de chaque séance. */
let repTri = 0;
let repCls = '4SI2';
const CLS_REP = {
  '4SI2': { cle: 'repartition4SI2', nom: '4e année SI (4SI2)', h: '100 h', fiches: true },
  '3SI1': { cle: 'repartition3SI1', nom: '3e année SI (3SI1)', h: '108 h', fiches: true }
};
function plan() { return (root.STI_DATA && root.STI_DATA[CLS_REP[repCls].cle]) || []; }
/* État de l'application : la classe et le trimestre sont choisis par les boutons
   de l'en-tête de l'onglet et par les entrées « Répartition — 1er/2e/3e trimestre »
   de la barre latérale. Le bloc ne propose donc plus aucun sélecteur : il affiche
   le trimestre courant, seul. */
/* app.js est encapsulé : son état (classe et trimestre) n'est visible qu'à travers
   setRep() et setTri(). On mémorise donc ces choix au passage, avec les valeurs
   de départ de l'application (3SI1 et 1er trimestre). */
let appCls = '3SI1', appTri = 1;
function suitApp() {
  if (CLS_REP[appCls]) repCls = appCls;
  if ([1, 2, 3].indexOf(appTri) >= 0) repTri = appTri;
}
function repHTML() {
  suitApp();
  const CL = repCls;              // classe courante, utilisée dans les onclick
  const p = plan();
  if (!p.length) return '';
  const cfg = CLS_REP[repCls];
  const rows = p.filter(x => !repTri || x.tri === repTri);
  const nb = rows.length * 2;
  const libelle = repTri ? (repTri + (repTri === 1 ? '<sup>er</sup>' : '<sup>e</sup>') + ' trimestre') : 'année 2026 / 2027';
  return `
  <div class="card" id="rep-4si2" style="margin-bottom:16px">
    <div class="card-h">
      <h3>${ic('list')} Répartition ${repCls} — ${libelle}
        <span class="badge b-teal">${rows.length} séances · ${nb} h par groupe</span></h3>
      <div class="row no-print" style="gap:6px;flex-wrap:wrap">
        <button class="btn btn-xs btn-line" onclick="STI_FICHES.printRepartition(${repTri})">${ic('print')} Imprimer ce trimestre</button>
        <button class="btn btn-xs btn-soft" onclick="STI_FICHES.cls('${repCls}'); STI_FICHES.show()">Voir les fiches</button>
      </div>
    </div>
    <div class="card-b">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th style="width:44px">N°</th><th style="width:100px">Date</th><th>Contenu de la séance</th>
          <th style="width:150px" class="hide-sm">Domaines</th><th style="width:96px">Type</th></tr></thead>
        <tbody>${rows.map(x => `<tr${x.k==='cours'?'':' class="is-eval"'}${cfg.fiches?' style="cursor:pointer" onclick="STI_FICHES.openCls(&#39;'+CL+'&#39;,'+x.num+')"':''}>
          <td class="n">${x.num}</td>
          <td style="white-space:nowrap">${fmtShort(x.iso)}<div class="tiny muted">${JOURS[D(x.iso).getDay()]}</div></td>
          <td><div class="tt">${esc(x.t)}</div><div class="det">${esc(x.det)}</div></td>
          <td class="hide-sm"><span class="badge b-grey">${esc(x.d)}</span></td>
          <td><span class="badge ${x.k==='cours'?'b-blue':x.k==='corr'?'b-grey':'b-navy'}">${
            {cours:'cours', dc:'DC', ds:'DS', corr:'correction'}[x.k] || x.k}</span></td></tr>`).join('')}
        </tbody></table></div>
      <div class="tiny muted" style="margin-top:8px">Cliquez sur une ligne pour ouvrir la fiche pédagogique préremplie de la séance.
        ${repCls === '3SI1' ? 'Répartition de la classe de 3e année SI : mardi 8 h-12 h et jeudi 13 h-17 h, du 15/09/2026 au 20/05/2027 ; devoir de contrôle n°1 le mardi 3 novembre 2026.' : ''}</div>
    </div>
  </div>`;
}
function renderRepBlock() {
  const host = document.getElementById('v-rep');
  if (!host || !plan().length) return;
  const cur = document.getElementById('rep-4si2');
  if (cur) cur.remove();                 // le trimestre ou la classe a changé
  host.insertAdjacentHTML('afterbegin', repHTML());
}

/* ------------------------------------------------------------ vue liste */
function card(k, v, s) {
  return '<div class="info-chip"><div class="info-chip-value">' + v + '</div>' +
         '<div class="info-chip-label">' + k + (s ? ' — ' + s : '') + '</div></div>';
}

function render() {
  try { renderRepBlock(); } catch (e) {}
  const host = document.getElementById('v-fiches');
  if (!host) return;
  if (!active()) return;
  const all = list();
  if (!all.length) { host.innerHTML = '<div class="note warn">Données des fiches non chargées : vérifiez <code>data/fiches.js</code>.</div>'; return; }
  const shown = all.filter(f => (!filtre.tri || f.tri === filtre.tri) &&
    (!filtre.nature || f.nature === filtre.nature) &&
    (!filtre.q || (f.titre + ' ' + f.domaines + ' ' + f.date).toLowerCase().includes(filtre.q.toLowerCase())));
  const nbEdit = all.filter(f => isEdited(f.n)).length;

  host.innerHTML = `
  <div class="sec-head">
    <div>
      <h2>Fiches pédagogiques — ${CF().nom}</h2>
      <p class="lead">Les ${CF().nb} fiches du modèle « Séance 8-9 », préremplies automatiquement à partir de la
      répartition et du Smart Book. Chaque champ est modifiable : vos corrections sont enregistrées dans
      votre espace et reprises à l'impression.</p>
    </div>
    <div class="row no-print" style="gap:8px">
      <div class="seg-wrap" role="group" aria-label="Choisir la classe">
        ${Object.keys(FICHES_CLS).map(c => `<button class="seg-btn ${c===ficCls?'active':''}" onclick="STI_FICHES.cls('${c}')">${c}</button>`).join('')}
      </div>
      <button class="btn btn-xs btn-line" onclick="STI_FICHES.printMenu()">${ic('print')} Centre d'impression</button>
      <button class="btn btn-xs btn-blue" onclick="STI_FICHES.form(${list().length ? list()[0].n : 1})">${ic('book')} Ouvrir le formulaire de la fiche n°1</button>
    </div>
  </div>

  <div class="chips-row" style="margin-bottom:16px">
    ${card('Fiches', CF().nb, '3 trimestres')}
    ${card('Séances', CF().heures, '2 h × 2 par semaine')}
    ${card('Évaluations', CF().evaluations, '6 DC · 3 DS')}
    ${card('Modifiées', nbEdit, 'enregistrées dans ce navigateur')}
    ${card('Affichées', shown.length, 'selon les filtres')}
  </div>

  <div class="card">
    <div class="card-h">
      <h3>${ic('list')} Liste des fiches</h3>
      <div class="row no-print" style="gap:6px;flex-wrap:wrap">
        <input type="search" id="fic-q" placeholder="Rechercher un titre, un domaine…" value="${esc(filtre.q)}"
               oninput="STI_FICHES.filter('q',this.value)" style="min-width:200px">
        <select id="fic-tri" onchange="STI_FICHES.filter('tri',Number(this.value))">
          <option value="0">Tous les trimestres</option>
          <option value="1"${filtre.tri===1?' selected':''}>1<sup>er</sup> trimestre</option>
          <option value="2"${filtre.tri===2?' selected':''}>2<sup>e</sup> trimestre</option>
          <option value="3"${filtre.tri===3?' selected':''}>3<sup>e</sup> trimestre</option>
        </select>
        <select id="fic-nat" onchange="STI_FICHES.filter('nature',this.value)">
          <option value="">Toutes les natures</option>
          ${Object.keys(NAT).map(k => `<option value="${k}"${filtre.nature===k?' selected':''}>${NAT[k]}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="card-b">
      <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th style="width:48px">N°</th><th style="width:104px">Date</th>
            <th>Fiche</th><th style="width:150px" class="hide-sm">Domaines</th>
            <th style="width:120px">Nature</th><th style="width:210px" class="no-print">Actions</th></tr></thead>
          <tbody>${shown.map(f => `
            <tr${f.nature !== 'cours' ? ' class="is-eval"' : ''}>
              <td class="n">${f.n}</td>
              <td style="white-space:nowrap">${fmtShort(f.date)}<div class="tiny muted">${JOURS[D(f.date).getDay()]}</div></td>
              <td><div class="tt">${esc(f.titre)}${isEdited(f.n) ? ' <span class="badge b-amber">modifiée</span>' : ''}</div>
                  <div class="det">${esc(f.axes.join(' · '))}</div></td>
              <td class="hide-sm"><span class="badge b-grey">${esc(f.domaines)}</span></td>
              <td><span class="badge ${f.nature==='cours'?'b-blue':f.nature==='correction'?'b-grey':'b-navy'}">${NAT[f.nature]||f.nature}</span></td>
              <td class="no-print fic-actions">
                <button class="btn btn-xs btn-blue" title="Ouvre le formulaire de la fiche, prérempli et rectifiable"
                        onclick="STI_FICHES.form(${f.n})">Ouvrir</button>
                <button class="btn btn-xs btn-line" onclick="STI_FICHES.printFiche(${f.n})">Imprimer</button>
                <a class="btn btn-xs btn-line" href="${CF().docs}/S${f.n}.pdf"
                   target="_blank" rel="noopener" title="PDF de la fiche au format du modèle — même document que le bouton Imprimer"
                   onclick="return STI_FICHES.pdf(this.href, event)">PDF</a>
              </td>
            </tr>`).join('') || '<tr><td colspan="6" class="muted">Aucune fiche ne correspond aux filtres.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------ rendu d'une fiche */
function etapesRows(f, editable) {
  const coul = ['var(--c-4si2,#2f7d4f)'];
  return f.etapes.map((e, i) => `
    <tr>
      <td class="f-etape">
        <span class="f-num">${i + 1}</span>
        <span class="f-nom" ${editable ? 'contenteditable="true" data-f="etape:' + i + ':etape"' : ''}>${esc(e.etape)}</span>
        <span class="f-duree" ${editable ? 'contenteditable="true" data-f="etape:' + i + ':duree"' : ''}>${esc(e.duree)} min</span>
      </td>
      <td class="f-act" ${editable ? 'contenteditable="true" data-f="etape:' + i + ':prof"' : ''}>${esc(e.prof).replace(/\s\|\s/g,'<br>')}</td>
      <td class="f-act" ${editable ? 'contenteditable="true" data-f="etape:' + i + ':eleves"' : ''}>${esc(e.eleves).replace(/\s\|\s/g,'<br>')}</td>
      <td class="f-moy" ${editable ? 'contenteditable="true" data-f="etape:' + i + ':moyens"' : ''}>${esc(e.moyens)}</td>
    </tr>`).join('');
}

function ficheHTML(f, editable) {
  const E = editable;
  const obj = f.objectifs.map((o, ci) => `
    <td>
      <div class="f-olab" ${E ? 'contenteditable="true" data-f="obj:' + ci + ':titre"' : ''}>${esc(o.titre)}</div>
      <div class="f-oitems" ${E ? 'contenteditable="true" data-f="obj:' + ci + ':items"' : ''}>${o.items.map(esc).join(' · ')}</div>
    </td>`).join('');
  return `
  <div class="fpage" id="fiche-page">
    <table class="f-hdr"><tr>
      <td style="width:66%"><div class="f-t1">Fiche pédagogique</div>
        <div class="f-t2" ${E ? 'contenteditable="true" data-f="titre"' : ''}>Séance ${f.n} · ${esc(f.titre)}</div></td>
      <td style="width:34%"><div class="f-r1">Lycée Rafèha</div>
        <div class="f-r2">Enseignant : Aymen Essouyah</div></td></tr></table>
    <div class="f-rule"></div>
    <table class="f-info"><tr>
      <td class="first" style="width:20%"><div class="f-lab">CLASSE</div><div class="f-val">${CF().label}</div></td>
      <td style="width:19%"><div class="f-lab">DURÉE TOTALE</div><div class="f-val">${f.duree} min</div></td>
      <td style="width:43%"><div class="f-lab">MODULES</div>
        <div class="f-val" ${E ? 'contenteditable="true" data-f="modules"' : ''}>${esc(f.modules || CF().modules)}</div></td>
      <td style="width:18%"><div class="f-lab">SÉANCE</div><div class="f-val">${f.n}</div></td></tr></table>
    <table class="f-time"><tr>${f.etapes.map((e, i) =>
      `<td style="width:${[16.2, 19.5, 49.3, 15][i]}%;background:${['#E4661F','#EFA868','#38968E','#1F3A5F'][i]}">${esc(e.etape)} · ${esc(e.duree)} min</td>`).join('')}</tr></table>
    <div class="f-h4">Objectifs</div>
    <table class="f-obj"><tr>${obj}</tr></table>
    <div class="f-thin"></div>
    <table class="f-band"><tr>
      <td class="f-c1 f-b1" style="width:33%"><div class="f-blab" style="color:#E4661F">MÉTHODE ACTIVE (DE DÉCOUVERTE)</div>
        <div class="f-btxt f-it" ${E ? 'contenteditable="true" data-f="methode"' : ''}>${esc(f.methode)}</div></td>
      <td class="f-c2 f-b1" style="width:30%"><div class="f-blab" style="color:#E4661F">PRÉREQUIS</div>
        ${f.prerequis.map((p, i) => `<div class="f-btxt" ${E ? 'contenteditable="true" data-f="prereq:' + i + '"' : ''}>• ${esc(p)}</div>`).join('')}</td>
      <td class="f-c3 f-b2" style="width:37%"><div class="f-blab" style="color:#38968E">CRITÈRES DE RÉUSSITE</div>
        ${f.criteres.map((p, i) => `<div class="f-btxt" ${E ? 'contenteditable="true" data-f="crit:' + i + '"' : ''}>• ${esc(p)}</div>`).join('')}</td></tr></table>
    <div class="f-h4">Déroulement</div>
    <table class="f-dev">
      <tr class="f-th"><th style="width:15.5%">ÉTAPE</th><th style="width:44.5%">ACTIVITÉS PROFESSEUR</th>
        <th style="width:24.5%">ACTIVITÉS ÉLÈVES</th><th style="width:15.5%">MOYENS DIDACTIQUES</th></tr>
      ${etapesRows(f, E)}
    </table>
    <div class="f-h4">Travail à la maison</div>
    <table class="f-band"><tr><td class="f-c1 f-b1" style="width:100%">
      <div class="f-btxt" ${E ? 'contenteditable="true" data-f="maison"' : ''}>${esc(f.maison)}</div></td></tr></table>
    <div class="f-foot">Lycée Rafèha · ${CF().label} · Séance ${f.n} · Enseignant : Aymen Essouyah</div>
  </div>`;
}

/* ------------------------------------- boîte « formulaire » (grande fenêtre)
   Le bouton « Modifier la fiche et les coches » de l'onglet Fiche pédagogique
   ouvre la page du formulaire (assets/fiche-formulaire.html) dans une grande
   boîte, remplie avec la fiche de la séance choisie. Chaque champ reste
   modifiable ; « Enregistrer la fiche » reporte les valeurs dans la fiche,
   dans la préparation du cahier de textes et dans l'impression.              */
let formN = null;
let formHTMLPromise = null;

/* Le service worker renvoie index.html pour toute navigation : on ne peut donc
   pas charger le formulaire par le src d'une iframe. On récupère le fichier par
   fetch() puis on l'injecte dans l'iframe par srcdoc. */
const FORM_BUILD = 'v1.6.5';          /* version de assets/fiche-formulaire.html attendue */
function formHTML() {
  if (!formHTMLPromise) {
    formHTMLPromise = fetch('assets/fiche-formulaire.html?v=' + FORM_BUILD, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.text(); })
      .catch(function () { formHTMLPromise = null; throw new Error('formulaire indisponible'); });
  }
  return formHTMLPromise;
}

function padArr(a, n) { const o = (a || []).slice(0, n); while (o.length < n) o.push(''); return o; }
function splitLines(t) {
  return String(t == null ? '' : t).split(/\s*\|\s*|\s*\n\s*/).map(x => x.trim()).filter(Boolean);
}
function uniq(a) { const o = []; (a || []).forEach(x => { if (x && o.indexOf(x) < 0) o.push(x); }); return o; }
function phrases(t, n) { return padArr(String(t || '').split(/(?<=\.)\s+/).map(x => x.trim()).filter(Boolean), n); }

function ensureFormBox() {
  if (document.getElementById('fiche-form-modal')) return;
  const d = document.createElement('div');
  d.id = 'fiche-form-modal';
  d.style.cssText = 'position:fixed;inset:0;z-index:9998;display:none;align-items:center;justify-content:center;' +
                    'background:rgba(12,20,28,.55);padding:12px;box-sizing:border-box';
  d.innerHTML = `
    <div style="width:min(1560px,98vw);height:94vh;background:#fff;border-radius:14px;overflow:hidden;
                display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.45)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 14px;
                  border-bottom:1px solid #e5ded7;background:#fdf4ec">
        <div style="min-width:220px">
          <strong id="ffm-title" style="color:#12324d;font-size:15px">Fiche pédagogique</strong>
          <div id="ffm-sub" class="tiny muted"></div>
          <div id="ffm-av" class="tiny" style="margin-top:3px;color:#6b6b6b"></div>
          <div id="ffm-cov" class="tiny" style="margin-top:2px;color:#6b6b6b"></div>
          <div id="ffm-ver" class="tiny" style="margin-top:2px;color:#9a9187">formulaire …</div>
        </div>
        <div class="row no-print" style="gap:6px;flex-wrap:wrap">
          <button class="btn btn-xs btn-line" title="Imprime la fiche au format du document (PDF), pas le formulaire"
                  onclick="STI_FICHES.formPrint()">${ic('print')} Imprimer le document</button>
          <button class="btn btn-xs btn-line" title="Revient à la fiche d'origine (annule vos modifications)"
                  onclick="STI_FICHES.formReset()">Rétablir la fiche d'origine</button>
          <button class="btn btn-xs btn-blue" onclick="STI_FICHES.formSave()">Enregistrer la fiche</button>
          <button class="btn btn-xs btn-line" title="Ouvre la fenêtre de séance d'origine : déroulement réel, observations, notions du Smart Book"
                  onclick="STI_FICHES.classicModal()">${ic('file')} Fiche de séance</button>
          <button class="btn btn-xs btn-line" onclick="STI_FICHES.formClose()">Fermer</button>
        </div>
      </div>
      <iframe id="ffm-frame" title="Formulaire de fiche pédagogique"
              style="flex:1 1 auto;width:100%;border:0;background:#fff"></iframe>
    </div>`;
  document.body.appendChild(d);
  d.addEventListener('click', function (e) { if (e.target === d) formClose(); });
  const fr = d.querySelector('#ffm-frame');
  fr.addEventListener('load', function () { if (formN) fillForm(formN); });
}

function fillForm(n) {
  const fr = document.getElementById('ffm-frame');
  const w = fr && fr.contentWindow;
  const f = fiche(n);
  if (!w || !f || !w.document) return;
  formN = n;
  w.OBJ = (f.objectifs || []).map(function (o) { return [o.titre, padArr(o.items || [], 4)]; });
  w.MPC = [
    ['Méthode active (de découverte)', phrases(f.methode, 4)],
    ['Prérequis', padArr(f.prerequis || [], 4)],
    ['Critères de réussite', padArr(f.criteres || [], 4)]
  ];
  w.STEPS = (f.etapes || []).map(function (e, i) {
    return { d: String(e.duree), e: e.etape, c: ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'][i % 4],
             p: padArr(splitLines(e.prof), 4), s: padArr(splitLines(e.eleves), 3) };
  });
  w.MOY = padArr(uniq((f.etapes || []).map(function (e) { return e.moyens; })), 3);
  try { w.build(); } catch (e) {}
  const set = function (id, v) { const el = w.document.getElementById(id); if (el) el.value = v; };
  set('etab', 'Lycée Rafèha');
  set('ens', 'Aymen Essouyah');
  set('classe', CF().label);
  set('seance', String(f.n));
  set('duree', (f.duree || 120) + ' min');
  set('projet', f.projet || (ficCls === '3SI1' ? 'Site du club' : 'Fleurs Rafèha'));
  set('modules', f.modules || CF().modules);
  w.resetAll = function () { fillForm(n); };          // « Rétablir » = valeurs de la fiche
  /* les boutons de la page (imprimer / rétablir) font doublon avec la barre de la
     boîte : on les masque pour ne pas imprimer le formulaire par erreur */
  const bar = w.document.querySelector('.bar');
  if (bar) bar.style.display = 'none';
  /* la boîte est plus large que la page du formulaire : on l'étire pour que les
     champs soient lisibles en entier, et chaque champ affiche son texte au survol */
  if (!w.__wide) {
    const st = w.document.createElement('style');
    st.textContent = '.wrap{max-width:none!important;padding:14px 18px 30px!important}' +
                     'input[type=text]{text-overflow:ellipsis}';
    w.document.head.appendChild(st);
    w.__wide = true;
  }
  Array.prototype.forEach.call(w.document.querySelectorAll('input[type=text]'), function (i) {
    i.title = i.value || '';
    if (!i.__tip) { i.__tip = 1; i.addEventListener('input', function () { i.title = i.value; }); }
  });
  /* témoin de version : signale une copie ancienne restée en cache */
  (function () {
    const v = document.getElementById('ffm-ver');
    if (!v) return;
    const w2 = document.getElementById('ffm-frame');
    let b = '';
    try { b = (w2.contentDocument.documentElement.getAttribute('data-form-build') || '').trim(); } catch (e) {}
    if (!b) {
      v.innerHTML = '<b style="color:#b00020">formulaire hors ligne ou obsolète (version illisible)</b> — actualisez la page (Ctrl+F5).';
    } else if (b !== FORM_BUILD) {
      v.innerHTML = '<b style="color:#b00020">copie ancienne : ' + esc(b) + ' (attendu ' + FORM_BUILD + ')</b> — actualisez la page (Ctrl+F5).';
    } else {
      v.textContent = 'formulaire ' + b + ' ✓';
    }
  })();
  try {
    if (w.SUIVI && w.SUIVI.init) w.SUIVI.init(seanceEtat(n));
    if (w.LIVRE) {
      const st = (root.store && root.store.seances && root.store.seances[ficCls + '|' + n]) || {};
      if (w.AV && w.AV.jeu) w.LIVRE.build(notionsLivre(), w.AV.jeu().domaines || w.AV.jeu());
      else w.LIVRE.build(notionsLivre());
      /* une fiche cumule les notions des séances précédentes (avancement) */
      const prev = [];
      Object.keys(root.store && root.store.seances || {}).forEach(function (k) {
        const parts = k.split('|');
        if (parts[0] !== ficCls || Number(parts[1]) >= n) return;
        ((root.store.seances[k] || {}).notions || []).forEach(function (id) { if (prev.indexOf(id) < 0) prev.push(id); });
      });
      const union = prev.slice();
      (st.notions || []).forEach(function (id) { if (union.indexOf(id) < 0) union.push(id); });
      w.LIVRE.select(union);
    }
    if (w.AV && w.AV.init) w.AV.init();
  } catch (e) {}
  peindreCouverture();
  const t = document.getElementById('ffm-title');
  const sub = document.getElementById('ffm-sub');
  if (t) t.textContent = 'Fiche pédagogique — séance ' + f.n + (isEdited(f.n) ? ' (modifiée)' : '');
  if (sub) sub.innerHTML = esc(CF().label + ' · ' + fmtLong(f.date) + ' · ' + f.titre);
}

function openForm(n, classe) {
  if (classe) ficCls = FICHES_CLS[classe] ? classe : ficCls;
  if (!fiche(n)) { if (root.toast) root.toast('Fiche indisponible pour cette séance'); return; }
  ensureFormBox();
  formN = n;
  const m = document.getElementById('fiche-form-modal');
  m.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  const fr = document.getElementById('ffm-frame');
  formHTML().then(function (h) {
    if (fr.getAttribute('srcdoc') !== h) fr.srcdoc = h;   // le « load » remplit la fiche
    else fillForm(n);
  }).catch(function () {
    if (root.toast) root.toast('Formulaire introuvable : vérifiez assets/fiche-formulaire.html');
  });
}

function formClose() {
  const m = document.getElementById('fiche-form-modal');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
  render();
}
/* Impression depuis la boîte formulaire : on n'imprime pas la page de saisie mais
   le DOCUMENT au format du modèle (paysage 11 x 8,5 in, une page), construit avec
   les valeurs présentes à l'écran (y compris celles non encore enregistrées). */
function formPrint() {
  const d = readForm();
  const f = d ? applyForm(d) : (formN ? fiche(formN) : null);
  if (!f) return;
  printDoc(ficheHTML(f, false), true);
}
/* « Rétablir » rend la fiche d'origine : on supprime la modification enregistrée
   (sinon le formulaire relisait la fiche déjà modifiée, ce qui donnait l'impression
   que le bouton ne faisait rien). */
function formReset() {
  if (!formN) return;
  const k = ficCls + '|' + formN;
  const was = !!(edits && edits[k]);
  if (was && root.confirm && !root.confirm('Rétablir la fiche d\'origine et perdre vos modifications ?')) return;
  delete edits[k];
  persist();
  try {
    const b = base()[String(formN)];
    if (b && CF().synchro && root.store && root.store.seances) {
      const st = root.store.seances[k] || (root.store.seances[k] = {});
      st.preparation = prepText(b, ficCls);
      st.title = b.titre;
      if (typeof root.save === 'function') root.save(true);
    }
  } catch (e) {}
  fillForm(formN);
  render();
  if (root.toast) root.toast(was ? 'Fiche d\'origine rétablie' : 'Valeurs de la fiche rechargées');
}

function readForm() {
  const fr = document.getElementById('ffm-frame');
  const w = fr && fr.contentWindow;
  const f = fiche(formN);
  if (!w || !f || !w.document) return null;
  const V = function (el) { return el && el.value != null ? String(el.value).trim() : ''; };
  const doc = w.document;
  const box = function (sel, labelFallback) {
    return Array.prototype.map.call(doc.querySelectorAll(sel), function (b) {
      const lab = b.querySelector('label');
      return { titre: (lab ? lab.textContent : labelFallback || '').trim(),
               items: Array.prototype.map.call(b.querySelectorAll('input'), V).filter(Boolean) };
    });
  };
  const obj = box('#obj .box');
  const mpc = box('#mpc .box');
  const steps = Array.prototype.map.call(doc.querySelectorAll('#steps .step'), function (el) {
    const ins = el.querySelectorAll('input');
    const p = Array.prototype.map.call(el.children[1].querySelectorAll('input'), V).filter(Boolean);
    const e = Array.prototype.map.call(el.children[2].querySelectorAll('input'), V).filter(Boolean);
    return { etape: V(ins[0]) || 'Étape', duree: V(ins[1]) || '0', prof: p, eleves: e };
  });
  const moy = Array.prototype.map.call(doc.querySelectorAll('#moy input'), V).filter(Boolean);
  const h = function (id) { const el = doc.getElementById(id); return el ? String(el.value).trim() : ''; };
  return { obj: obj, mpc: mpc, steps: steps, moy: moy,
           classe: h('classe'), seance: h('seance'), duree: h('duree'), projet: h('projet'), modules: h('modules') };
}

/* enregistre la fiche : champs du formulaire → fiche → préparation → impression */
function commit(f) {
  edits[ficCls + '|' + f.n] = {
    titre: f.titre, modules: f.modules, methode: f.methode, maison: f.maison,
    objectifs: f.objectifs, prerequis: f.prerequis, criteres: f.criteres,
    etapes: f.etapes, duree: f.duree, projet: f.projet,
    version: 2, modifie: new Date().toISOString()
  };
  persist();
  try {
    if (CF().synchro && root.store && root.store.seances && typeof root.save === 'function') {
      const k = ficCls + '|' + f.n;
      root.store.seances[k] = Object.assign({}, root.store.seances[k] || {},
        { preparation: prepText(f, ficCls), devoirs: plat(f.maison) || (root.store.seances[k] || {}).devoirs,
          title: f.titre });
      root.save(true);
    }
  } catch (e) {}
}

/* reporte les valeurs du formulaire dans l'objet fiche (sans enregistrer) */
function applyForm(d) {
  if (!d || !formN) return null;
  const f = fiche(formN);
  const nObj = Math.max(3, d.obj.length);
  f.objectifs = [];
  for (let i = 0; i < nObj; i++) {
    const o = d.obj[i] || { titre: '', items: [] };
    f.objectifs.push({ titre: o.titre || (f.objectifs[i] ? f.objectifs[i].titre : 'Objectifs'), items: o.items });
  }
  if (d.mpc[1]) f.prerequis = d.mpc[1].items;
  if (d.mpc[2]) f.criteres = d.mpc[2].items;
  if (d.mpc[0] && d.mpc[0].items.length) f.methode = d.mpc[0].items.join(' ');
  f.etapes = d.steps.map(function (s, i) {
    const old = (f.etapes && f.etapes[i]) || {};
    return { etape: s.etape, duree: Number(String(s.duree).replace(/[^0-9]/g, '')) || old.duree || 0,
             prof: s.prof.join(' | '), eleves: s.eleves.join(' | '),
             moyens: d.moy[i] || old.moyens || '' };
  });
  f.modules = d.modules || f.modules;
  f.duree = Number(String(d.duree).replace(/[^0-9]/g, '')) || f.duree;
  f.projet = d.projet;
  return f;
}

function formSave() {
  const d = readForm();
  if (!d) return;
  const f = applyForm(d);
  if (!f) return;
  commit(f);
  syncNotions(f.n);
  formClose();
  if (root.toast) root.toast('Fiche n°' + f.n + ' enregistrée (formulaire)');
}

/* ------------------------------------------------------------ boîte d'édition */
function ensureBox() {
  if (document.getElementById('fiche-modal')) return;
  const d = document.createElement('div');
  d.className = 'modal fiche-modal';
  d.id = 'fiche-modal';
  d.innerHTML = `
    <div class="box">
      <div class="box-h no-print">
        <h3 id="fm-title" style="font-size:15px">Fiche pédagogique</h3>
        <div class="row" style="gap:6px">
          <button class="btn btn-xs btn-line" onclick="STI_FICHES.printFiche(STI_FICHES.current())">Imprimer</button>
          <button class="btn btn-xs btn-line" onclick="STI_FICHES.reset()" title="Revenir au contenu prévu par la répartition">Réinitialiser</button>
          <button class="btn btn-xs btn-line" onclick="STI_FICHES.close()">Fermer</button>
        </div>
      </div>
      <div class="box-b" id="fm-body"></div>
      <div class="box-f no-print">
        <span class="tiny muted" id="fm-hint">Tous les champs sont modifiables : cliquez dans le texte pour le corriger.</span>
        <span class="row" style="gap:6px">
          <button class="btn btn-line" onclick="STI_FICHES.form( STI_FICHES.current() )">Modifier dans le formulaire</button>
          <button class="btn btn-line" onclick="STI_FICHES.openClassic()">Cahier de textes (déroulement réel)</button>
          <button class="btn btn-blue" onclick="STI_FICHES.save()">Enregistrer la fiche</button>
        </span>
      </div>
    </div>`;
  document.body.appendChild(d);
  d.addEventListener('click', e => { if (e.target.id === 'fiche-modal') close(); });
}

function open(n) {
  const f = fiche(n);
  if (!f) { if (root.toast) root.toast('Fiche indisponible pour cette séance'); return; }
  ensureBox();
  ctxN = n;
  document.getElementById('fm-title').innerHTML = 'Aperçu du document — séance ' + n + ' · ' + esc(fmtShort(f.date));
  document.getElementById('fm-body').innerHTML = ficheHTML(f, true);
  document.getElementById('fm-hint').innerHTML = isEdited(n)
    ? '<span class="badge b-amber">fiche modifiée</span> vos corrections sont conservées dans votre espace.'
    : 'Tous les champs sont modifiables : cliquez dans le texte pour le corriger.';
  document.getElementById('fiche-modal').classList.add('on');
  document.body.style.overflow = 'hidden';
  fitZoom();
}

/* la page fait 11 pouces de large : on la met à l'échelle de la boîte */
function fitZoom() {
  const body = document.getElementById('fm-body');
  const page = document.getElementById('fiche-page');
  if (!body || !page) return;
  page.style.zoom = 1;
  const dispoW = body.clientWidth - 28;
  const dispoH = Math.max(320, Math.min(window.innerHeight * 0.70, 820));
  page.style.zoom = Math.min(1, Math.max(0.5, Math.min(dispoW / (11 * 96), dispoH / (8.5 * 96))));
}
if (typeof window !== 'undefined') window.addEventListener('resize', function () {
  if (document.getElementById('fiche-modal') && document.getElementById('fiche-modal').classList.contains('on')) fitZoom();
});
function close() {
  const m = document.getElementById('fiche-modal');
  if (m) m.classList.remove('on');
  document.body.style.overflow = '';
  render();
}

function collect() {
  const f = fiche(ctxN);
  document.querySelectorAll('#fm-body [data-f]').forEach(el => {
    const p = el.getAttribute('data-f').split(':');
    const txt = el.innerText.replace(/\s*\n\s*/g, ' | ').trim();
    if (p[0] === 'obj') {
      const i = Number(p[1]);
      if (p[2] === 'titre') f.objectifs[i].titre = txt;
      else f.objectifs[i].items = txt.split('·').map(s => s.trim()).filter(Boolean);
    } else if (p[0] === 'etape') {
      f.etapes[Number(p[1])][p[2]] = txt;
    } else if (p[0] === 'prereq') {
      f.prerequis[Number(p[1])] = txt.replace(/^•\s*/, '');
    } else if (p[0] === 'crit') {
      f.criteres[Number(p[1])] = txt.replace(/^•\s*/, '');
    } else {
      f[p[0]] = txt;
    }
  });
  return f;
}

function save() {
  if (!ctxN) return;
  const f = collect();
  edits[ficCls + '|' + ctxN] = {
    titre: f.titre, modules: f.modules, methode: f.methode, maison: f.maison,
    objectifs: f.objectifs, prerequis: f.prerequis, criteres: f.criteres,
    etapes: f.etapes, version: 1, modifie: new Date().toISOString()
  };
  persist();
  /* report facultatif vers le cahier de textes de l'application */
  try {
    if (CF().synchro && root.store && typeof root.save === 'function') {
      const k = ficCls + '|' + ctxN;
      const prep = prepText(f);
      root.store.seances[k] = Object.assign({}, root.store.seances[k] || {},
        { preparation: prep, devoirs: plat(f.maison), title: f.titre,
          prepFromFiche: false, titleFromFiche: false });
      root.save(true);
    }
  } catch (e) {}
  close();
  if (root.toast) root.toast('Fiche n°' + ctxN + ' enregistrée');
}
function reset() {
  if (!ctxN) return;
  delete edits[ficCls + '|' + ctxN];
  persist();
  open(ctxN);
  if (root.toast) root.toast('Fiche n°' + ctxN + ' restaurée');
}
function openClassic() {
  if (typeof classic === 'function' && ctxN) { close(); classic(CLS, ctxN); }
}

/* ------------------------------------------------ couverture moyenne des deux livres
   Reprend le KPI de l'application : moyenne des pourcentages de couverture des deux
   livres (notions uniques du Smart Book abordées lors des séances assurées).      */
function coverage() {
  const T = root.STI_TRACK;
  if (!T || typeof T.summary !== 'function') return null;
  try {
    const a = T.summary('3SI1'), b = T.summary('4SI2');
    return { a: a.percent, b: b.percent, ca: a.covered, cb: b.covered,
             tot: (a.total || 0) + (b.total || 0), covered: (a.covered || 0) + (b.covered || 0),
             mean: Math.round((a.percent + b.percent) / 2 * 10) / 10 };
  } catch (e) { return null; }
}

/* état de la case « séance assurée » de la séance affichée */
/* notions du Smart Book : mêmes données que le suivi de l'application */
function notionsLivre() {
  const L = root.STI_DATA && root.STI_DATA.livresSTI;
  const c = L && L[ficCls];
  return (c && c.items) || [];
}

/* enregistre la sélection du formulaire dans la séance (sans passer par le rendu) */
function syncNotions(n) {
  const fr = document.getElementById('ffm-frame');
  const w = fr && fr.contentWindow;
  if (!w || !w.LIVRE || !n || !root.store || !root.store.seances) return;
  const k = ficCls + '|' + n;
  const o = root.store.seances[k] || (root.store.seances[k] = {});
  o.notions = w.LIVRE.selection();
  o.notionsVersion = 'smart-books-2026-v1';
  try { if (typeof root.save === 'function') root.save(true); } catch (e) {}
}

function seanceEtat(n) {
  const o = (root.store && root.store.seances && root.store.seances[ficCls + '|' + n]) || {};
  return { assuree: o.done === true, reportee: o.done === false };
}

/* Appelé par le formulaire quand on coche « Séance assurée » / « Séance reportée ».
   Enregistre l'état, relance le rendu (donc le recalcul de la couverture moyenne)
   et renvoie false si l'opération est refusée.                                   */
function markSeance(n, estAssuree, val) {
  if (!n || !root.store || !root.store.seances) return false;
  const iso = new Date().toISOString().slice(0, 10);
  const s = (root.SESSIONS && root.SESSIONS[ficCls] || []).find(function (x) { return x.n === n; });
  if (estAssuree && val && s && s.iso > iso) {
    if (root.toast) root.toast('Une séance future ne peut pas être déclarée assurée.');
    return false;
  }
  const k = ficCls + '|' + n;
  if (estAssuree && val) syncNotions(n);        /* les notions cochées entrent dans la couverture */
  const avant = coverage();
  const o = root.store.seances[k] || (root.store.seances[k] = {});
  o.done = val ? (estAssuree ? true : false) : undefined;
  if (estAssuree && val) {                      /* une séance assurée n'est pas « reportée » */
    o.notions = o.notions || [];
    o.notionsVersion = o.notionsVersion || 'smart-books-2026-v1';
  }
  try { if (typeof root.save === 'function') root.save(true); } catch (e) {}
  const apres = coverage();
  lastCoverage = { avant: avant, apres: apres, quand: new Date() };
  if (root.toast) {
    if (apres && avant) {
      const d = Math.round((apres.mean - avant.mean) * 10) / 10;
      root.toast((estAssuree && val ? 'Séance assurée. ' : 'Séance non assurée. ') +
        'Couverture moyenne : ' + avant.mean + ' % → ' + apres.mean + ' %' + (d ? ' (' + (d > 0 ? '+' : '') + d + ')' : ''));
    } else {
      root.toast(estAssuree && val ? 'Séance assurée' : 'Séance non confirmée');
    }
  }
  peindreCouverture();
  return true;
}

let lastCoverage = null;
function derniereCouverture() {
  if (!lastCoverage || !lastCoverage.apres) {
    const c = coverage();
    return c ? 'Couverture moyenne actuelle : ' + c.mean + ' % (3SI1 ' + c.a + ' % · 4SI2 ' + c.b + ' %).' : '';
  }
  const a = lastCoverage.avant, b = lastCoverage.apres;
  return 'Couverture moyenne recalculée : ' + (a ? a.mean + ' % → ' : '') + b.mean + ' % — ' +
    'notions uniques couvertes : ' + b.covered + ' / ' + b.tot + ' (3SI1 ' + b.a + ' % · 4SI2 ' + b.b + ' %).';
}

/* bandeau de couverture dans l'en-tête de la boîte */
function peindreCouverture() {
  const el = document.getElementById('ffm-cov');
  if (!el) return;
  const c = coverage();
  if (!c) { el.textContent = ''; return; }
  el.innerHTML = '<span class="muted">Couverture moyenne</span> <b>' + c.mean + ' %</b>' +
    ' <span class="muted">· 3SI1 ' + c.a + ' % · 4SI2 ' + c.b + ' % · ' + c.covered + '/' + c.tot + ' notions uniques</span>';
}

/* avancement du référentiel (calculé dans le formulaire, affiché ici) */
function avUpdate(pct, fait, total, classe) {
  const el = document.getElementById('ffm-av');
  if (!el) return;
  const c = Math.round((pct || 0) * 2.55);
  el.innerHTML = '<span style="display:inline-block;width:64px;height:6px;border-radius:4px;' +
    'background:#e9e2db;vertical-align:middle;overflow:hidden">' +
    '<span style="display:block;height:100%;width:' + c + '%;background:linear-gradient(90deg,#e4661f,#38968e)"></span>' +
    '</span> Avancement ' + (pct || 0) + ' % <span class="muted">(' + (fait || 0) + '/' + (total || 0) +
    ' notions' + (classe ? ' · ' + classe : '') + ')</span>';
}

/* --------------------------------------------------- ouverture d'un PDF
   Le service worker renvoyait index.html pour toute navigation (y compris vers un
   PDF) : le bouton « PDF » ouvrait donc l'application. On corrige le service
   worker, et on ouvre ici le fichier via un blob (les URL blob: ne passent jamais
   par le service worker), avec repli sur le lien direct puis sur un téléchargement. */
function openPdf(href, ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  const name = String(href).split('/').pop();
  const direct = function () { window.open(href, '_blank', 'noopener'); };
  if (!root.fetch || typeof URL === 'undefined' || !URL.createObjectURL) { direct(); return false; }
  fetch(href, { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('http ' + r.status);
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (ct.indexOf('pdf') < 0) throw new Error('contenu inattendu: ' + ct);   // SW a renvoyé du HTML
    return r.blob();
  }).then(function (bl) {
    const url = URL.createObjectURL(new Blob([bl], { type: 'application/pdf' }));
    const w = window.open(url, '_blank');
    if (!w) {                                   // fenêtre bloquée : téléchargement
      const a = document.createElement('a');
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      if (root.toast) root.toast('PDF téléchargé : ' + name);
    }
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
  }).catch(function () {
    if (root.toast) root.toast('PDF indisponible (' + name + ') — ouverture directe');
    direct();
  });
  return false;
}

/* ---------------------------------------- impression de la fiche sélectionnée
   Le bouton « Imprimer la fiche » de l'onglet Fiche pédagogique imprimait la
   page de l'application (barre latérale comprise). Il imprime désormais le
   document au format du modèle, comme les PDF du dossier docs/.              */
function printSelected() {
  const it = document.querySelector('#v-fiche .fiche-item.active');
  let cls = null, n = null;
  if (it && it.dataset && it.dataset.key) {
    const k = String(it.dataset.key).split('|');
    if (k.length === 2 && FICHES_CLS[k[0]]) { cls = k[0]; n = Number(k[1]); }
  }
  if (!n) {
    const st = document.querySelector('#ref-paper .stamp-line2');
    const m = st && /S[EÉ]ANCE\s+(\d+)/i.exec(st.textContent || '');
    if (m) n = Number(m[1]);
    const ct = document.querySelector('#v-fiche .class-tab.active');
    if (ct && FICHES_CLS[ct.textContent.trim()]) cls = ct.textContent.trim();
  }
  if (!cls) cls = ficCls;
  if (n && FICHES_CLS[cls] && base(cls)[String(n)]) { ficCls = cls; printFiche(n); return; }
  if (typeof root.print === 'function') root.print();
}

/* ------------------------------------------------------------ impression */
function printDoc(html, landscape, extraStyle, title) {
  const old = document.getElementById('print-frame');
  if (old) old.remove();
  const fr = document.createElement('iframe');
  fr.id = 'print-frame';
  /* Une vraie surface de page évite les impressions blanches dans les navigateurs
     qui ignorent les iframes d'impression de taille nulle. Elle reste sous l'app. */
  fr.style.cssText = 'position:fixed;left:-10000px;top:0;width:' + (landscape ? '297mm' : '210mm') + ';height:' + (landscape ? '210mm' : '297mm') + ';border:0;pointer-events:none';
  const titleMarkup = title ? '<title>' + esc(title) + '</title>' : '';
  const doc = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">${titleMarkup}
    <link rel="stylesheet" href="assets/fiches.css">
    <style>@page{size:${landscape ? '11in 8.5in' : 'A4 portrait'};margin:${landscape ? '0' : '12mm 10mm'};}
    html,body{margin:0;padding:0;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#333}
    .fpage,.rp{box-shadow:none;border-radius:0;margin:0;transform:none !important}
    [contenteditable]{outline:0}
    .fpage{width:${landscape ? '11in' : 'auto'};height:${landscape ? '8.5in' : 'auto'};padding:${landscape ? '0.45in 0.5in 0.35in' : '0'};
      box-sizing:border-box;page-break-after:always}
    .fpage:last-child{page-break-after:auto}
    .rp{width:100%;border-collapse:collapse;font-size:8pt}
    .rp th{background:#12324d;color:#fff;text-align:left;padding:3pt 4pt;font-size:7.5pt}
    .rp td{border-bottom:.4pt solid #d9e2ea;padding:2.6pt 4pt;vertical-align:top}
    .rp tr.eval td{background:#fdf6e8}
    .rp h1{font-size:13pt;margin:0 0 2pt;color:#12324d}
    .rp .sub{font-size:8pt;color:#5c7186;margin-bottom:6pt}
    .rp tr{page-break-inside:avoid}
    ${extraStyle || ''}
    </style></head><body>${html}</body></html>`;
  fr.onload = function () {
    const launchPrint = function () {
      try {
        if (!fr.contentWindow) throw new Error('Fenêtre d’impression absente');
        fr.contentWindow.focus();
        fr.contentWindow.print();
      } catch (e) {
        if (root.toast) root.toast('Impression bloquée par le navigateur');
      }
    };
    const fontsReady = fr.contentDocument && fr.contentDocument.fonts
      ? Promise.resolve(fr.contentDocument.fonts.ready).catch(function () {}) : Promise.resolve();
    fontsReady.then(function () { setTimeout(launchPrint, 120); });
    if (fr.contentWindow) {
      fr.contentWindow.addEventListener('afterprint', function () {
        setTimeout(function () { if (fr.isConnected) fr.remove(); }, 100);
      }, { once: true });
    }
    /* Nettoyage de secours si le navigateur ne déclenche pas afterprint. */
    setTimeout(function () { if (fr.isConnected) fr.remove(); }, 600000);
  };
  document.body.appendChild(fr);
  fr.srcdoc = doc;
}
function printFiche(n) {
  const f = fiche(n);
  if (!f) return;
  printDoc(ficheHTML(f, false), true);
}
function printAll() {
  const html = list().map(f => ficheHTML(fiche(f.n), false)).join('');
  printDoc(html, true);
}
function printRepartition(tri) {
  const all = list().filter(f => !tri || f.tri === tri);
  const titre = tri ? ['', '1er trimestre', '2e trimestre', '3e trimestre'][tri] : 'année scolaire 2026-2027';
  const rows = all.map(f => `<tr class="${f.nature === 'cours' ? '' : 'eval'}">
      <td>${f.n}</td><td style="white-space:nowrap">${fmtShort(f.date)}</td>
      <td>${esc(f.titre)}</td><td>${esc(f.domaines)}</td><td>${NAT[f.nature] || f.nature}</td></tr>`).join('');
  const html = `<div class="rp">
    <h1>Répartition ${tri ? 'trimestrielle' : 'annuelle'} — ${CF().nom} — matière STI</h1>
    <div class="sub">${titre} · ${all.length} séances × 2 h · Lycée Rafèha Ariana · Aymen Essouyah</div>
    <table class="rp"><thead><tr><th style="width:6%">N°</th><th style="width:14%">Date</th>
      <th>Contenu de la séance</th><th style="width:20%">Domaines</th><th style="width:16%">Nature</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  printDoc(html, false);
}

function cahierPlanForClass(className) {
  const saved = root.STI_DATA && root.STI_DATA['repartition' + className];
  if (Array.isArray(saved) && saved.length) return saved;
  const sessions = root.SESSIONS && root.SESSIONS[className] || [];
  return sessions.map(function (session) {
    return {
      num: session.n, iso: session.iso, tri: session.tri,
      t: session.blk && session.blk.t || 'Séance à planifier',
      k: session.blk && session.blk.k || '',
      d: session.blk && session.blk.d || '',
      det: session.blk && session.blk.det || ''
    };
  });
}
function cahierPlanMap() {
  return { '3SI1': cahierPlanForClass('3SI1'), '4SI2': cahierPlanForClass('4SI2') };
}
function cahierPrintSessions() {
  const source = root.SESSIONS || {};
  if (root.STI_CAHIER_PRINT_DATA && root.STI_CAHIER_PRINT_DATA.withPlans) {
    return root.STI_CAHIER_PRINT_DATA.withPlans(source, cahierPlanMap());
  }
  return source;
}
function cahierPrintState(s) {
  const record = root.store && root.store.seances ? root.store.seances[s.cls + '|' + s.n] || {} : {};
  if (root.STI_CAHIER_PRINT_DATA) return root.STI_CAHIER_PRINT_DATA.state(s, record, todayISO());
  const today = todayISO();
  if (record.done === true && s.iso <= today) return 'done';
  if (record.done === false) return 'reported';
  if (s.iso < today) return 'pending';
  if (s.iso === today) return 'today';
  return 'future';
}
function selectCahierPrintSessions(classe, trimestre, statut) {
  const source = cahierPrintSessions();
  if (root.STI_CAHIER_PRINT_DATA) return root.STI_CAHIER_PRINT_DATA.select(
    source, root.store && root.store.seances || {},
    { classe: classe, trimestre: trimestre, statut: statut }, todayISO());
  const classes = classe === 'both' ? ['3SI1', '4SI2'] : (['3SI1', '4SI2'].includes(classe) ? [classe] : []);
  const tri = Number(trimestre) || 0;
  const status = ['all', 'pending', 'done', 'reported', 'future'].includes(statut) ? statut : 'all';
  return classes.flatMap(c => source[c] || []).filter(s => {
    const currentState = cahierPrintState(s);
    return (!tri || Number(s.tri) === tri) && (status === 'all' || currentState === status);
  }).sort((a, b) => a.iso.localeCompare(b.iso) || Number(a.tri) - Number(b.tri) || a.cls.localeCompare(b.cls) || a.n - b.n);
}
function cahierSelectedClasses(classe) {
  return classe === 'both' ? ['3SI1', '4SI2'] : (['3SI1', '4SI2'].includes(classe) ? [classe] : []);
}
function cahierQuarterLabel(tri) {
  return tri === 1 ? '1er trimestre' : tri + 'e trimestre';
}
function cahierTypeLabel(kind) {
  return ({ cours: 'Cours', dc: 'Devoir de contrôle', ds: 'Devoir de synthèse', corr: 'Correction' })[kind] || kind || 'Séance';
}
function cahierPlainLabel(value) {
  return String(value == null ? '' : value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
function cahierClassLabel(className) {
  const ref = root.DATA && root.DATA.reference || {};
  const label = ref.CLASSES && ref.CLASSES[className] && ref.CLASSES[className].long;
  return cahierPlainLabel(label || className);
}
function cahierPlanRows(className, tri) {
  return cahierPlanForClass(className).filter(function (entry) {
    return Number(entry.tri) === Number(tri);
  }).sort(function (a, b) {
    return String(a.iso || '').localeCompare(String(b.iso || '')) || Number(a.num || 0) - Number(b.num || 0);
  });
}
function cahierPlanDomain(entry) {
  return cahierPlainLabel(entry && entry.d || '').replace(/\s*[—–-]\s*p\..*$/i, '').trim();
}
function cahierTableRows(entries, includeDomain) {
  if (!entries.length) return '<tr><td colspan="4" class="cp-no-data">Aucune séance programmée.</td></tr>';
  return entries.map(function (entry, index) {
    const number = Number(entry.num) || index + 1;
    const date = entry.iso ? fmtShort(entry.iso) : '—';
    const title = entry.t || entry.title || 'Séance à planifier';
    const detail = cahierPlanDomain(entry);
    const kind = includeDomain === false ? ({ cours: 'Cours', dc: 'DC', ds: 'DS', corr: 'Corr.' })[entry.k] || entry.k || 'Séance' : cahierTypeLabel(entry.k);
    return `<tr><td class="cp-no">${number}</td><td class="cp-date">${esc(date)}</td><td class="cp-topic"><strong>${esc(title)}</strong>${includeDomain !== false && detail && detail.toLowerCase() !== 'évaluation' ? `<small>${esc(detail)}</small>` : ''}</td><td class="cp-kind">${esc(kind)}</td></tr>`;
  }).join('');
}
function cahierAnnualPage(classes) {
  const reference = root.DATA && root.DATA.reference || {};
  const year = (root.SCHOOL || reference.SCHOOL || {}).annee || '2026 - 2027';
  const totals = classes.map(function (className) {
    const entries = cahierPlanForClass(className);
    return `<span><b>${esc(className)}</b> : ${entries.length} séances · ${entries.length * 2} h par groupe</span>`;
  }).join('');
  const tables = classes.map(function (className) {
    const entries = cahierPlanForClass(className).slice().sort(function (a, b) {
      return String(a.iso || '').localeCompare(String(b.iso || '')) || Number(a.num || 0) - Number(b.num || 0);
    });
    return `<section class="cp-annual-class cp-${className.toLowerCase()}"><header><h2>${esc(className)}</h2><span>${entries.length} séances prévues</span></header>
      <table class="cp-plan-table cp-annual-table"><thead><tr><th>N°</th><th>Date</th><th>Contenu de la séance</th><th>Nature</th></tr></thead><tbody>${cahierTableRows(entries, false)}</tbody></table>
    </section>`;
  }).join('');
  return `<section class="cp-page cp-annual-page"><header class="cp-page-heading"><span class="cp-page-index">PAGE 3 · PROGRAMMATION</span><h1>Répartition annuelle</h1><p>Année scolaire ${esc(year)} · déroulement prévisionnel des séances par classe.</p></header>
    <div class="cp-annual-totals">${totals}</div><div class="cp-annual-grid ${classes.length === 1 ? 'cp-single-class' : ''}">${tables}</div>
    <p class="cp-page-note">Le détail du 1er trimestre pour chaque classe figure à la page suivante. Les répartitions des trimestres suivants sont insérées à leur place chronologique dans le cahier.</p>
  </section>`;
}
function cahierQuarterPage(tri, classes) {
  const heading = cahierQuarterLabel(tri);
  const note = tri === 2
    ? 'Insérée immédiatement après la dernière séance du 1er trimestre.'
    : (tri === 3 ? 'Insérée après la dernière séance du 2e trimestre.' : 'Répartition du trimestre.');
  const tables = classes.map(function (className) {
    const entries = cahierPlanRows(className, tri);
    const hours = entries.length * 2;
    return `<section class="cp-quarter-class cp-${className.toLowerCase()}"><header><div><h2>${esc(className)}</h2><p>${esc(cahierClassLabel(className))}</p></div><span>${entries.length} séances · ${hours} h/groupe</span></header>
      <table class="cp-plan-table cp-term-table"><thead><tr><th>N°</th><th>Date</th><th>Contenu / domaine</th><th>Nature</th></tr></thead><tbody>${cahierTableRows(entries)}</tbody></table>
    </section>`;
  }).join('');
  const index = tri === 1 ? 'PAGE 4 · PROGRAMMATION TRIMESTRIELLE' : 'PROGRAMMATION TRIMESTRIELLE';
  return `<section class="cp-page cp-quarter-page cp-quarter-${tri}"><header class="cp-page-heading"><span class="cp-page-index">${index}</span><h1>Répartition trimestrielle</h1><h2>${heading}</h2><p>${esc(note)}</p></header><div class="cp-quarter-grid ${classes.length === 1 ? 'cp-single-class' : ''}">${tables}</div></section>`;
}
function cahierTimetablePage() {
  const reference = root.DATA && root.DATA.reference || {};
  const school = root.SCHOOL || reference.SCHOOL || {};
  const schedule = root.store && root.store.times || reference.HORAIRES_DEFAUT || {};
  const days = [1, 2, 3, 4, 5];
  const dayNames = reference.JOURS || ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const slotsFor = function (className, day) {
    const slots = schedule[className] && schedule[className][day] || [];
    if (!slots.length) return '<span class="cp-no-slot">—</span>';
    return slots.map(function (slot) {
      return `<div class="cp-time-slot"><b>${esc(slot.g || 'Groupe')}</b><span>${esc(slot.s || '')}–${esc(slot.e || '')}</span></div>`;
    }).join('');
  };
  const rows = days.map(function (day) {
    return `<tr><th>${esc(dayNames[day] || 'Jour')}</th><td>${slotsFor('3SI1', day)}</td><td>${slotsFor('4SI2', day)}</td></tr>`;
  }).join('');
  return `<section class="cp-page cp-timetable-page"><header class="cp-page-heading"><span class="cp-page-index">PAGE 2 · ORGANISATION HEBDOMADAIRE</span><h1>Emploi du temps du professeur</h1><p>${esc(school.prof || 'Aymen Essouyah')} · horaires enregistrés dans votre espace.</p></header>
    <table class="cp-timetable"><thead><tr><th>Jour</th><th>3SI1</th><th>4SI2</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="cp-timetable-legend"><span class="cp-class-chip cp-3si1">3SI1</span> Deux groupes par classe, selon les créneaux enregistrés. Les modifications d’horaires sont reprises dans cette page.</div>
  </section>`;
}
function cahierCoverPage(classes, selectedCount, contextCount, trimestre, statut) {
  const reference = root.DATA && root.DATA.reference || {};
  const school = root.SCHOOL || reference.SCHOOL || {};
  const year = school.annee || '2026 - 2027';
  const classesHtml = classes.map(function (className) {
    return `<div class="cp-cover-class"><b>${esc(className)}</b><span>${esc(cahierClassLabel(className))}</span></div>`;
  }).join('');
  const period = Number(trimestre) ? cahierQuarterLabel(Number(trimestre)) : 'Tous les trimestres';
  const statusLabels = { all: 'Tous les états', pending: 'À confirmer', done: 'Assurées', reported: 'Reportées', future: 'À venir' };
  return `<section class="cp-page cp-cover-page"><div class="cp-cover-mark">LYCÉE RAFÈHA</div><div class="cp-cover-rule"></div>
    <div class="cp-cover-content"><p class="cp-cover-kicker">ESPACE PÉDAGOGIQUE · STI</p><h1>Cahier de textes</h1><p class="cp-cover-subtitle">Sciences et technologies de l’informatique</p>
      <div class="cp-cover-school">${esc(school.lycee || 'Lycée Rafèha')}</div>
      <div class="cp-cover-classes"><span class="cp-cover-label">CLASSE${classes.length > 1 ? 'S' : ''} CONCERNÉE${classes.length > 1 ? 'S' : ''}</span>${classesHtml}</div>
      <div class="cp-cover-meta"><div><span>ENSEIGNANT</span><b>${esc(school.prof || 'Aymen Essouyah')}</b></div><div><span>ANNÉE SCOLAIRE</span><b>${esc(year)}</b></div></div>
    </div><footer class="cp-cover-footer"><span>${selectedCount} séance${selectedCount === 1 ? '' : 's'} sélectionnée${selectedCount === 1 ? '' : 's'}</span><span>${esc(period)} · ${esc(statusLabels[statut] || 'Tous les états')}</span>${contextCount ? `<small>${contextCount} repère${contextCount === 1 ? '' : 's'} de transition inclus hors filtre pour positionner la répartition suivante.</small>` : ''}</footer>
  </section>`;
}
function cahierPrintStateLabel(currentState) {
  return ({ done: 'Séance assurée', reported: 'Séance reportée', pending: 'À confirmer', today: 'Aujourd’hui — à confirmer', future: 'À venir' })[currentState] || 'À confirmer';
}
function cahierWeekStart(iso) {
  const parts = String(iso || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(function (part) { return !Number.isInteger(part); })) return String(iso || '');
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  if (!Number.isFinite(date.getTime())) return String(iso || '');
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}
function cahierSessionHtml(session, signatureMarkup, signatureAtEnd) {
  const records = root.store && root.store.seances ? root.store.seances : {};
  const record = records[session.cls + '|' + session.n] || {};
  const currentState = cahierPrintState(session);
  const title = record.title || (session.blk && session.blk.t) || 'Séance à planifier';
  const date = session.iso ? fmtLong(session.iso) : 'Date non renseignée';
  const sessionNumber = Number(session.n) || '';
  if (session.contextOnly) {
    return `<tr class="cp-context-session cp-${session.cls.toLowerCase()}"><td colspan="3"><span>REPÈRE DE TRANSITION · FIN DU ${esc(cahierQuarterLabel(Number(session.tri) || 1).toUpperCase())}</span><strong>${esc(session.cls)} · ${esc(title)}</strong><small>${esc(date)} · ${esc(cahierPrintStateLabel(currentState))} — repère inclus pour positionner la répartition suivante.</small></td></tr>`;
  }
  const text = function (value) {
    const content = String(value == null ? '' : value).trim();
    return content ? esc(content).replace(/\r\n?/g, '\n').replace(/\n/g, '<br>') : '<span class="cp-empty">Non renseigné.</span>';
  };
  const preparation = record.preparation || (session.blk && session.blk.det) || '';
  const report = record.report && typeof record.report === 'object'
    ? `<div class="cp-work-line cp-work-report"><b>Reportée :</b> ${esc(record.report.motif || '')}${record.report.vers ? ' · remplacée le ' + esc(fmtShort(record.report.vers)) : ''}</div>`
    : '';
  const signatureCell = signatureAtEnd
    ? (signatureMarkup
      ? `<div class="cp-signature-box">${signatureMarkup}<small>Signature du professeur</small></div>`
      : '<div class="cp-signature-empty"><span></span><small>Signature à apposer</small></div>')
    : '<span class="cp-signature-follow" aria-label="Signature à la fin de la journée">—</span>';
  return `<tr class="cp-session-row cp-${session.cls.toLowerCase()} cp-row-${currentState}">
    <td class="cp-date-cell"><time datetime="${esc(session.iso || '')}">${esc(date)}</time>
      <div class="cp-date-meta"><b>${esc(session.cls)}</b><span>Séance n°${sessionNumber}</span></div>
      <small class="cp-date-groups">Groupes : 1 et 2</small>
      <span class="cp-row-state cp-state-${currentState}">${esc(cahierPrintStateLabel(currentState))}</span>
      ${session.blk && session.blk.d ? `<small class="cp-date-time">${esc(session.blk.d)}</small>` : ''}
    </td>
    <td class="cp-work-cell"><strong class="cp-work-title">${esc(title)}</strong>
      <div class="cp-work-lines"><div class="cp-work-line"><b>Prévu / préparation :</b> ${text(preparation)}</div>
        <div class="cp-work-line"><b>Réalisé :</b> ${text(record.contenu)}</div>
        <div class="cp-work-line"><b>À faire :</b> ${text(record.devoirs)}</div>
        <div class="cp-work-line"><b>Observations :</b> ${text(record.obs)}</div>${report}
      </div>
    </td>
    <td class="cp-signature-cell">${signatureCell}</td>
  </tr>`;
}
function cahierTimelineTable(entries, signatureMarkup) {
  let currentWeek = null;
  const rows = entries.map(function (entry) {
    const session = entry.session;
    const week = cahierWeekStart(session.iso);
    let weekRow = '';
    if (week !== currentWeek) {
      currentWeek = week;
      weekRow = `<tr class="cp-week-row"><td colspan="3">Semaine du ${esc(week ? fmtLong(week) : 'date non renseignée')}</td></tr>`;
    }
    return weekRow + cahierSessionHtml(session, signatureMarkup, entry.signatureAtEnd);
  }).join('');
  return `<section class="cp-timeline"><table class="cp-cahier-table" aria-label="Cahier de textes à trois colonnes"><thead><tr><th>Date</th><th>Le travail réalisé</th><th>Signature</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}
function cahierPrintCss() {
  return `
    @page{size:A4 portrait;margin:0}
    html,body{margin:0!important;padding:0!important;color:#203029!important;background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .cp-page{box-sizing:border-box;width:210mm;min-height:297mm;padding:13mm 12mm;break-before:page;page-break-before:always;background:#fff;position:relative}
    .cp-page:first-child{break-before:auto;page-break-before:auto}
    .cp-cover-page{display:flex;flex-direction:column;justify-content:space-between;padding:20mm 18mm 15mm;background:linear-gradient(150deg,#f6f5ee 0%,#fff 54%,#eaf2ed 100%);border-top:7mm solid #174c39}
    .cp-cover-mark{font-size:10pt;letter-spacing:2.2pt;color:#184d3b;font-weight:800;text-align:center}
    .cp-cover-rule{width:38mm;height:1.2mm;margin:10mm auto 0;background:#c89d49}
    .cp-cover-content{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8mm 0}
    .cp-cover-kicker,.cp-page-index{font-size:8pt;letter-spacing:1.5pt;color:#7a846f;font-weight:800}
    .cp-cover-content h1{font-family:Georgia,serif;font-size:35pt;line-height:1.08;color:#143b2d;margin:5mm 0 2mm}
    .cp-cover-subtitle{font-size:12pt;color:#607066;margin:0}
    .cp-cover-school{margin-top:10mm;font-family:Georgia,serif;font-size:19pt;color:#1e6048;font-weight:700}
    .cp-cover-classes{width:100%;max-width:140mm;margin-top:15mm;text-align:left}
    .cp-cover-label{display:block;margin-bottom:3mm;color:#7d826f;font-size:8pt;letter-spacing:1pt;font-weight:800}
    .cp-cover-class{display:flex;align-items:baseline;gap:5mm;padding:3mm 0;border-bottom:.4mm solid #d7ded5}
    .cp-cover-class b{min-width:20mm;color:#174c39;font-size:14pt}.cp-cover-class span{font-size:10pt;color:#566257}
    .cp-cover-meta{display:flex;justify-content:center;gap:20mm;margin-top:13mm;text-align:left}
    .cp-cover-meta div{display:flex;flex-direction:column;gap:2mm}.cp-cover-meta span{font-size:7pt;letter-spacing:1pt;color:#7a846f;font-weight:800}.cp-cover-meta b{font-size:11pt;color:#263b2e}
    .cp-cover-footer{display:flex;justify-content:space-between;gap:4mm;flex-wrap:wrap;border-top:.5mm solid #d8ded6;padding-top:4mm;color:#657166;font-size:8pt}
    .cp-cover-footer small{flex-basis:100%;font-size:7pt;color:#8b7660}
    .cp-page-heading{margin:0 0 7mm;padding-bottom:5mm;border-bottom:1.2mm solid #1d674a}
    .cp-page-heading h1{font-family:Georgia,serif;font-size:24pt;line-height:1.12;color:#173e31;margin:2mm 0 1.5mm}
    .cp-page-heading h2{font-size:15pt;color:#1d674a;margin:0 0 1mm}
    .cp-page-heading p{font-size:9pt;color:#65736a;margin:0}
    .cp-timetable{width:100%;border-collapse:collapse;margin:9mm 0 0;font-size:10pt}
    .cp-timetable th{padding:4mm;background:#174c39;color:#fff;text-align:left}
    .cp-timetable td{width:36%;vertical-align:top;padding:5mm;border-bottom:.4mm solid #d8e1d9}
    .cp-timetable tbody th{width:18%;background:#edf3ed;color:#244c38;border-bottom:.4mm solid #d8e1d9;text-transform:capitalize}
    .cp-time-slot{display:flex;justify-content:space-between;gap:3mm;padding:2mm 0;border-bottom:.3mm dashed #d7ded7;color:#314337}
    .cp-time-slot:last-child{border-bottom:0}.cp-time-slot b{font-size:8.5pt}.cp-time-slot span{font-variant-numeric:tabular-nums;white-space:nowrap;font-size:9pt}
    .cp-no-slot{color:#a0a69e}.cp-timetable-legend{margin-top:12mm;padding:5mm;border:1px solid #d9e2d9;border-radius:3mm;color:#667267;font-size:8pt;line-height:1.5}
    .cp-class-chip{display:inline-block;border:1px solid #bfd0c1;border-radius:20px;padding:1mm 2.5mm;color:#225941;font-size:7pt;font-weight:800;white-space:nowrap}
    .cp-class-chip.cp-3si1{color:#17649e;border-color:#b9d5e7}.cp-class-chip.cp-4si2{color:#1d674a;border-color:#b8d9c5}
    .cp-annual-totals{display:flex;gap:4mm;flex-wrap:wrap;margin:-1mm 0 5mm;color:#536457;font-size:8pt}
    .cp-annual-totals span{padding:2mm 3mm;background:#f0f4ef;border-radius:2mm}
    .cp-annual-grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm;align-items:start}
    .cp-annual-grid.cp-single-class{grid-template-columns:1fr}
    .cp-annual-class{min-width:0}.cp-annual-class>header{display:flex;justify-content:space-between;align-items:baseline;gap:2mm;margin:0 0 1.5mm}
    .cp-annual-class>header h2{font-size:10pt;margin:0;color:#1d674a}.cp-annual-class.cp-3si1>header h2{color:#17649e}
    .cp-annual-class>header span{font-size:5.8pt;color:#6d796f;white-space:nowrap}
    .cp-annual-table{font-size:5pt}
    .cp-plan-table{width:100%;border-collapse:collapse;table-layout:fixed;color:#26342b}
    .cp-plan-table thead th{padding:2.2mm 1.5mm;background:#174c39;color:white;text-align:left;font-size:7pt;line-height:1.2}
    .cp-plan-table tbody td{padding:1.8mm 1.5mm;border-bottom:.3mm solid #dce4dc;vertical-align:top;line-height:1.3;overflow-wrap:anywhere}
    .cp-annual-table thead th{padding:.8mm .6mm;font-size:4.9pt;line-height:1.05}
    .cp-annual-table tbody td{padding:.45mm .6mm;line-height:1.05}
    .cp-annual-table th:nth-child(1){width:8%}.cp-annual-table th:nth-child(2){width:20%}.cp-annual-table th:nth-child(3){width:54%}.cp-annual-table th:nth-child(4){width:18%}
    .cp-annual-table .cp-topic strong{font-size:5pt;font-weight:600}
    .cp-annual-table .cp-date{font-size:4.8pt;white-space:nowrap}
    .cp-annual-table .cp-kind{font-size:4.6pt}.cp-annual-table tbody tr:nth-child(even),.cp-term-table tbody tr:nth-child(even){background:#f7f9f6}
    .cp-annual-table small{color:#718074;font-size:6.6pt}
    .cp-page-note{margin:5mm 0 0;padding:3mm;border-left:1mm solid #c89d49;background:#faf7ee;color:#666b5d;font-size:7.5pt;line-height:1.45}
    .cp-quarter-page .cp-page-heading{margin-bottom:5mm}
    .cp-quarter-grid{display:grid;grid-template-columns:1fr 1fr;gap:6mm;align-items:start}
    .cp-quarter-grid.cp-single-class{grid-template-columns:1fr}
    .cp-quarter-class{min-width:0}.cp-quarter-class header{display:flex;justify-content:space-between;gap:2mm;align-items:flex-start;margin:0 0 2mm}
    .cp-quarter-class header h2{margin:0;color:#1d674a;font-size:13pt}.cp-quarter-class.cp-3si1 header h2{color:#17649e}
    .cp-quarter-class header p{margin:1mm 0 0;color:#7b847a;font-size:6.5pt;line-height:1.25}
    .cp-quarter-class header>span{padding-top:1mm;white-space:nowrap;color:#67756a;font-size:6.5pt}
    .cp-term-table{font-size:6.3pt}.cp-term-table thead th{padding:1.5mm 1mm;font-size:6pt}.cp-term-table tbody td{padding:1.25mm 1mm;line-height:1.2}
    .cp-term-table th:nth-child(1){width:8%}.cp-term-table th:nth-child(2){width:20%}.cp-term-table th:nth-child(3){width:53%}.cp-term-table th:nth-child(4){width:19%}
    .cp-term-table .cp-no{text-align:center;color:#68766c;font-weight:700}.cp-term-table .cp-date{white-space:nowrap;color:#45584a;font-variant-numeric:tabular-nums}
    .cp-term-table .cp-topic strong{font-size:6.2pt;font-weight:700}.cp-term-table .cp-topic small{display:block;margin-top:.5mm;color:#738177;font-size:5.7pt;line-height:1.15}
    .cp-term-table .cp-kind{color:#68766c;font-size:5.6pt}.cp-no-data{color:#778177;font-style:italic}
    .cp-session{margin:0 0 5mm;padding:4mm 4.5mm;border:1px solid #d6e0d7;border-left:1.2mm solid #1d674a;border-radius:2mm;break-inside:avoid-page;page-break-inside:avoid}
    .cp-session.cp-3si1{border-left-color:#17649e}
    .cp-session-head{display:flex;justify-content:space-between;gap:5mm;align-items:flex-start;border-bottom:.3mm solid #e2e8e2;padding-bottom:2.5mm;margin-bottom:2.5mm}
    .cp-kicker{font-size:7pt;letter-spacing:.7pt;color:#778479;font-weight:800}.cp-session h2{font-family:Georgia,serif;font-size:13pt;line-height:1.25;margin:1mm 0;color:#21382b}.cp-session-head p{margin:0;color:#68756b;font-size:8pt}
    .cp-state{font-size:7pt;white-space:nowrap;padding:1mm 2mm;border:1px solid #b7c7ba;border-radius:20px;color:#526058}
    .cp-state-done{background:#e8f4eb;color:#216342;border-color:#badac2}.cp-state-reported{background:#fff0ed;color:#a9433b;border-color:#edc9c2}.cp-state-pending{background:#fff6df;color:#8a6318;border-color:#ead69e}
    .cp-fields{display:grid;grid-template-columns:1fr 1fr;gap:3mm 6mm}.cp-fields section{min-width:0}.cp-fields h3{font-size:7pt;text-transform:uppercase;letter-spacing:.5pt;color:#52665a;margin:0 0 1mm}.cp-fields p{font-size:8.3pt;line-height:1.4;margin:0;white-space:normal;overflow-wrap:anywhere}.cp-empty{color:#889189;font-style:italic}
    .cp-context-session td{padding:2.5mm 2mm;background:#f8faf7;border-bottom:.3mm dashed #b9c9bb;border-left:1mm solid #1d674a;color:#66756a}
    .cp-context-session.cp-3si1 td{border-left-color:#17649e}
    .cp-context-session span,.cp-context-session strong,.cp-context-session small{display:block}.cp-context-session span{font-size:6pt;color:#7c6b47;font-weight:800;letter-spacing:.5pt}.cp-context-session strong{margin:.7mm 0;color:#2c4032;font-size:7pt}.cp-context-session small{font-size:6pt}
    .cp-timeline{box-sizing:border-box;width:210mm;padding:8mm 12mm;color:#203029}
    .cp-cahier-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8pt;line-height:1.35;color:#26342b}
    .cp-cahier-table thead{display:table-header-group}
    .cp-cahier-table th{padding:2.5mm 2mm;background:#174c39;color:#fff;text-align:left;font-size:7pt;letter-spacing:.35pt;text-transform:uppercase}
    .cp-cahier-table th:first-child{width:20%}.cp-cahier-table th:nth-child(2){width:55%}.cp-cahier-table th:last-child{width:25%;text-align:center}
    .cp-cahier-table td{padding:2.5mm 2mm;vertical-align:top;border-bottom:.35mm solid #dce4dc;overflow-wrap:anywhere}
    .cp-week-row td{padding:2mm;background:#edf3ed;color:#24523d;font-size:7pt;font-weight:800;letter-spacing:.35pt;text-transform:uppercase;border:0}
    .cp-date-cell time{display:block;color:#173e31;font-weight:800}
    .cp-date-meta{display:flex;gap:2mm;flex-wrap:wrap;margin:1.5mm 0;color:#5b6c60;font-size:7pt}
    .cp-date-meta b{color:#17649e}.cp-date-groups{display:block;margin:0 0 1.5mm;color:#40574a;font-size:6.5pt;font-weight:700}.cp-date-time{display:block;margin-top:1.5mm;color:#778177;font-size:6.5pt}
    .cp-row-state{display:inline-block;padding:.6mm 1.6mm;border:1px solid #d3ded4;border-radius:10mm;font-size:6pt;color:#536459}
    .cp-state-done{background:#e8f4eb;color:#216342;border-color:#badac2}.cp-state-reported{background:#fff0ed;color:#a9433b;border-color:#edc9c2}.cp-state-pending{background:#fff6df;color:#8a6318;border-color:#ead69e}
    .cp-work-title{display:block;margin-bottom:1.4mm;color:#173e31;font-size:8.5pt}
    .cp-work-lines{display:grid;gap:.8mm}.cp-work-line{white-space:pre-wrap;color:#35483a}.cp-work-line b{color:#23382b}.cp-work-report{color:#a9433b}
    .cp-signature-cell{text-align:center;vertical-align:middle!important;border-left:.25mm solid #e1e7df}
    .cp-signature-box,.cp-signature-empty{min-height:18mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5mm}
    .cp-signature-box .teacher-signature-ink{display:block;width:40mm;height:11mm;max-width:100%;overflow:visible}
    .cp-signature-box small,.cp-signature-empty small{font-size:6pt;color:#788477}
    .cp-signature-empty span{display:block;width:90%;height:8mm;border-bottom:.3mm solid #89958a}
    .cp-signature-follow{display:inline-flex;width:5mm;height:5mm;align-items:center;justify-content:center;border:.3mm dashed #cbd5cc;border-radius:50%;color:#9aa49a;font-size:7pt}
    .cp-session-row.cp-row-done td:first-child{border-left:1mm solid #1d674a}.cp-session-row.cp-row-reported td:first-child{border-left:1mm solid #b4433c}
    @media print{.cp-session,.cp-context-session,.cp-cahier-table tr{break-inside:avoid-page;page-break-inside:avoid}}
  `;
}
function updateCahierPrintSummary() {
  const modal = document.getElementById('prm-modal');
  if (!modal) return;
  const classe = modal.querySelector('#prm-cahier-cls').value;
  const trimestre = Number(modal.querySelector('#prm-cahier-tri').value) || 0;
  const statut = modal.querySelector('#prm-cahier-status').value;
  const sessions = selectCahierPrintSessions(classe, trimestre, statut);
  const selectedClasses = cahierSelectedClasses(classe);
  const source = cahierPrintSessions();
  const timeline = root.STI_CAHIER_PRINT_DATA
    ? root.STI_CAHIER_PRINT_DATA.chronology(sessions, source, { classe: classe, trimestre: trimestre, statut: statut })
    : sessions;
  const contextCount = timeline.filter(session => session.contextOnly).length;
  const summary = modal.querySelector('#prm-cahier-summary');
  const button = modal.querySelector('#prm-cahier-print');
  if (summary) summary.innerHTML = `<strong>${sessions.length} séance${sessions.length > 1 ? 's' : ''}${contextCount ? ` + ${contextCount} repère${contextCount > 1 ? 's' : ''}` : ''}</strong><span>${classe === 'both' ? '3SI1 + 4SI2' : classe} · ${trimestre ? cahierQuarterLabel(trimestre) : 'tous les trimestres'} · ${esc(({ all: 'tous les états', pending: 'à confirmer', done: 'assurées', reported: 'reportées', future: 'à venir' })[statut] || 'tous les états')}${selectedClasses.length ? ' · répartitions incluses' : ''}</span>`;
  if (button) button.disabled = sessions.length === 0;
}
function printCahier(options) {
  const settings = options && typeof options === 'object' ? options : {};
  const modal = document.getElementById('prm-modal');
  const hasFilters = ['classe', 'trimestre', 'statut'].some(function (key) {
    return Object.prototype.hasOwnProperty.call(settings, key);
  });
  if (!modal && !hasFilters) return;

  const selectedClass = ['both', '3SI1', '4SI2'].includes(settings.classe)
    ? settings.classe
    : (modal ? modal.querySelector('#prm-cahier-cls').value : 'both');
  const requestedTerm = Number(settings.trimestre);
  const trimestre = hasFilters && [0, 1, 2, 3].includes(requestedTerm)
    ? requestedTerm
    : (modal ? Number(modal.querySelector('#prm-cahier-tri').value) || 0 : 0);
  const validStatuses = ['all', 'pending', 'done', 'reported', 'future'];
  const statut = validStatuses.includes(settings.statut)
    ? settings.statut
    : (modal ? modal.querySelector('#prm-cahier-status').value : 'all');
  const sessions = selectCahierPrintSessions(selectedClass, trimestre, statut);
  if (!sessions.length) { if (root.toast) root.toast('Aucune séance ne correspond à ces filtres.'); return; }

  const classes = cahierSelectedClasses(selectedClass);
  const source = cahierPrintSessions();
  const filters = { classe: selectedClass, trimestre: trimestre, statut: statut };
  const timeline = root.STI_CAHIER_PRINT_DATA
    ? root.STI_CAHIER_PRINT_DATA.chronology(sessions, source, filters)
    : sessions;
  const contextCount = timeline.filter(session => session.contextOnly).length;
  const parts = [
    cahierCoverPage(classes, sessions.length, contextCount, trimestre, statut),
    cahierTimetablePage(),
    cahierAnnualPage(classes),
    cahierQuarterPage(1, classes)
  ];
  const profile = typeof root.activeProfessorProfile === 'function' ? root.activeProfessorProfile() : null;
  const signatureMarkup = root.STI_SIGNATURE && typeof root.STI_SIGNATURE.toMarkup === 'function'
    ? root.STI_SIGNATURE.toMarkup(String(profile && profile.signature || '').trim()) : '';
  const lastSessionByDate = new Map();
  timeline.forEach(function (session, index) {
    if (!session.contextOnly) lastSessionByDate.set(String(session.iso || ''), index);
  });

  let currentQuarter = 1, batch = [];
  const flushTimeline = function () {
    if (!batch.length) return;
    parts.push(cahierTimelineTable(batch, signatureMarkup));
    batch = [];
  };
  timeline.forEach(function (session, index) {
    const sessionQuarter = Math.max(1, Number(session.tri) || 1);
    while (currentQuarter < sessionQuarter) {
      flushTimeline();
      currentQuarter++;
      if (currentQuarter > 1 && currentQuarter <= 3) parts.push(cahierQuarterPage(currentQuarter, classes));
    }
    batch.push({
      session: session,
      signatureAtEnd: !session.contextOnly && lastSessionByDate.get(String(session.iso || '')) === index
    });
  });
  flushTimeline();

  /* Même document pour l’impression du Centre et le PDF lancé depuis le cahier. */
  if (modal && modal.classList.contains('on')) closePrintMenu();
  const classeLabel = selectedClass === 'both' ? '3SI1 et 4SI2' : selectedClass;
  const periodLabel = trimestre ? cahierQuarterLabel(trimestre) : 'toute l’année';
  const documentTitle = 'Cahier de textes - ' + classeLabel + ' - ' + periodLabel;
  printDoc(parts.join(''), false, cahierPrintCss(), documentTitle);
  if (settings.output === 'pdf' && root.toast) {
    root.toast('Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF ».');
  }
}
let printMenuReturnFocus = null;
function closePrintMenu() {
  const d = document.getElementById('prm-modal');
  if (d) d.classList.remove('on');
  if (printMenuReturnFocus && typeof printMenuReturnFocus.focus === 'function') printMenuReturnFocus.focus();
}
function ensurePrintMenu(preset) {
  let d = document.getElementById('prm-modal');
  if (!d) {
    d = document.createElement('div');
    d.className = 'modal';
    d.id = 'prm-modal';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-modal', 'true');
    d.setAttribute('aria-label', "Centre d'impression");
    d.tabIndex = -1;
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target.id === 'prm-modal') closePrintMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && d.classList.contains('on')) closePrintMenu(); });
  }
  const opts = list().map(f => `<option value="${f.n}">${f.n} — ${fmtShort(f.date)} — ${esc(f.titre)}</option>`).join('');
  const cahier = preset && preset.cahier ? preset.cahier : {};
  const cahierClass = ['both', '3SI1', '4SI2'].includes(cahier.classe) ? cahier.classe : 'both';
  const cahierTri = [0, 1, 2, 3].includes(Number(cahier.trimestre)) ? Number(cahier.trimestre) : 0;
  const cahierStatus = ['all', 'pending', 'done', 'reported', 'future'].includes(cahier.statut) ? cahier.statut : 'all';
  d.innerHTML = `
    <div class="box" style="max-width:620px">
      <div class="box-h"><h3 style="font-size:15px">Centre d'impression</h3>
        <button class="btn btn-xs btn-line" onclick="STI_FICHES.closePrintMenu()">Fermer</button></div>
      <div class="box-b">
        <div class="note tiny" style="margin-bottom:12px">Choisissez une fiche, une répartition ou le cahier de textes. Pour le cahier, affinez l'impression par classe, trimestre et état des séances.</div>

        <div class="prm-row prm-cahier-row">
          <div class="prm-cahier-intro"><strong>Cahier de textes assemblé</strong><div class="tiny muted">Couverture, emploi du temps du professeur, répartitions et séances datées. Le tableau des séances reprend les colonnes Date, Le travail réalisé et Signature; la signature apparaît à la dernière séance de chaque journée. Les répartitions suivantes sont insérées après la dernière séance du trimestre précédent.</div></div>
          <div class="prm-cahier-filters">
            <label>Classe<select id="prm-cahier-cls" aria-label="Classe du cahier de textes"><option value="both" ${cahierClass === 'both' ? 'selected' : ''}>Les deux classes</option><option value="3SI1" ${cahierClass === '3SI1' ? 'selected' : ''}>3SI1</option><option value="4SI2" ${cahierClass === '4SI2' ? 'selected' : ''}>4SI2</option></select></label>
            <label>Trimestre<select id="prm-cahier-tri" aria-label="Trimestre du cahier de textes"><option value="0" ${cahierTri === 0 ? 'selected' : ''}>Tous</option><option value="1" ${cahierTri === 1 ? 'selected' : ''}>1er trimestre</option><option value="2" ${cahierTri === 2 ? 'selected' : ''}>2e trimestre</option><option value="3" ${cahierTri === 3 ? 'selected' : ''}>3e trimestre</option></select></label>
            <label>État<select id="prm-cahier-status" aria-label="État des séances à imprimer"><option value="all" ${cahierStatus === 'all' ? 'selected' : ''}>Tous</option><option value="pending" ${cahierStatus === 'pending' ? 'selected' : ''}>À confirmer</option><option value="done" ${cahierStatus === 'done' ? 'selected' : ''}>Assurées</option><option value="reported" ${cahierStatus === 'reported' ? 'selected' : ''}>Reportées</option><option value="future" ${cahierStatus === 'future' ? 'selected' : ''}>À venir</option></select></label>
          </div>
          <div class="prm-cahier-actions"><div id="prm-cahier-summary" aria-live="polite"></div><button type="button" class="btn btn-xs btn-blue" id="prm-cahier-print" onclick="STI_FICHES.printCahier()" aria-label="Imprimer le cahier de textes avec les filtres sélectionnés">${ic('print')} Imprimer le cahier</button></div>
        </div>

        <div class="prm-row">
          <div><strong>Une séance</strong><div class="tiny muted">La fiche pédagogique complète de la séance choisie.</div></div>
          <div class="row" style="gap:6px">
            <select id="prm-n" style="min-width:250px">${opts}</select>
            <button class="btn btn-xs btn-blue" onclick="STI_FICHES.printFiche(Number(document.getElementById('prm-n').value))">Imprimer</button>
          </div>
        </div>

        <div class="prm-row">
          <div><strong>Toutes les séances</strong><div class="tiny muted">Les ${CF().nb} fiches de la classe ${ficCls}, une page par séance (${CF().nb} pages).</div></div>
          <button class="btn btn-xs btn-blue" onclick="STI_FICHES.printAll()">Imprimer les ${CF().nb} fiches</button>
        </div>

        <div class="prm-row">
          <div><strong>Répartition trimestrielle</strong><div class="tiny muted">La liste datée des séances et des évaluations du trimestre.</div></div>
          <div class="row" style="gap:6px">
            <select id="prm-tri">
              <option value="1">1<sup>er</sup> trimestre</option>
              <option value="2">2<sup>e</sup> trimestre</option>
              <option value="3">3<sup>e</sup> trimestre</option>
            </select>
            <button class="btn btn-xs btn-blue" onclick="STI_FICHES.printRepartition(Number(document.getElementById('prm-tri').value))">Imprimer</button>
          </div>
        </div>

        <div class="prm-row">
          <div><strong>Répartition annuelle</strong><div class="tiny muted">Les ${CF().nb} séances de l'année sur un seul document.</div></div>
          <button class="btn btn-xs btn-blue" onclick="STI_FICHES.printRepartition(0)">Imprimer l'année</button>
        </div>

        <div class="note tiny" style="margin-top:10px">Les PDF déjà générés (modèle officiel, deux séances par fichier,
          et le recueil des ${CF().nb} fiches) sont dans <code>${CF().docs}/</code> — bouton « PDF » dans la liste.</div>
      </div>
    </div>`;
  ['#prm-cahier-cls', '#prm-cahier-tri', '#prm-cahier-status'].forEach(function (selector) {
    const control = d.querySelector(selector);
    if (control) control.addEventListener('change', updateCahierPrintSummary);
  });
  updateCahierPrintSummary();
}
function printMenu(preset) {
  printMenuReturnFocus = document.activeElement;
  ensurePrintMenu(preset);
  const d = document.getElementById('prm-modal');
  d.classList.add('on');
  const focusTarget = d.querySelector('#prm-cahier-cls') || d.querySelector('button');
  if (focusTarget) focusTarget.focus();
}


/* ------------------------------------------------------------ intégration */
const TAB_ID = 'v-fiches';
function active() { const v = document.getElementById(TAB_ID); return !!(v && v.classList.contains('on')); }

/* l'application construit sa barre d'onglets à chaque rendu : on rajoute le nôtre après */
function syncTab() {
  const bar = document.getElementById('tabs');
  if (!bar || !base() || !Object.keys(base()).length) return;
  let b = document.getElementById('tab-fiches');
  if (!b) {
    b = document.createElement('button');
    b.id = 'tab-fiches';
    b.className = 'tab';
    b.innerHTML = (root.ic ? root.ic('book') : '') + 'Fiches pédagogiques<span class="cnt">' + list().length + '</span>';
    b.onclick = () => show();
    bar.appendChild(b);
  }
  const cnt = b.querySelector('.cnt');
  if (cnt) cnt.textContent = list().length;
  b.classList.toggle('on', active());
}

/* panneau d'accès ajouté en tête de l'onglet « Fiche pédagogique » existant */
function anchorFiche() {
  const host = document.getElementById('v-fiche');
  if (!host || !host.innerHTML || document.getElementById('fic-anchor')) return;
  const opts = list().map(f => `<option value="${f.n}">Séance ${f.n} — ${fmtShort(f.date)} — ${f.titre}</option>`).join('');
  const today = new Date().toISOString().slice(0, 10);
  const near = list().find(f => f.date >= today) || list()[0];
  host.insertAdjacentHTML('afterbegin', `<div class="card" id="fic-anchor" style="margin-bottom:16px;border-left:4px solid #E4661F">
    <div class="card-b" style="display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap">
      <div style="min-width:260px">
        <strong style="color:#12324d">Fiche pédagogique au modèle officiel — ${CF().nom}</strong>
        <div class="tiny muted" style="margin-top:3px">Les ${CF().nb} fiches du modèle « Séance 8-9 » : objectifs, méthode active, prérequis,
        critères de réussite, déroulement sur 120 min et travail à la maison. Contenu prérempli, modifiable et imprimable.</div>
      </div>
      <div class="row" style="gap:6px;flex-wrap:wrap">
        <select id="fic-anchor-n" style="min-width:290px">${opts}</select>
        <button class="btn btn-xs btn-blue" onclick="STI_FICHES.form(Number(document.getElementById('fic-anchor-n').value))">Ouvrir le formulaire</button>
        <button class="btn btn-xs btn-soft" onclick="STI_FICHES.form(Number(document.getElementById('fic-anchor-n').value))">Modifier (formulaire)</button>
        <button class="btn btn-xs btn-line" onclick="STI_FICHES.printMenu()">Centre d'impression</button>
        <button class="btn btn-xs btn-line" onclick="STI_FICHES.show()">Les ${CF().nb} fiches</button>
      </div>
    </div></div>`);
  const sel = document.getElementById('fic-anchor-n');
  if (sel && near) sel.value = String(near.n);
}

function show() {
  if (typeof root.go === 'function') root.go(TAB_ID);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function install() {
  load();
  if (!root.STI_DATA || (!root.STI_DATA.fiches4SI2 && !root.STI_DATA.fiches3SI1)) return;
  /* vue */
  if (!document.getElementById(TAB_ID)) {
    const main = document.querySelector('main.wrap');
    if (main) { const s = document.createElement('section'); s.id = TAB_ID; s.className = 'view ref-ui'; main.appendChild(s); }
  }
  /* Le bouton global ouvre le centre d'impression (fiches, répartitions et cahier). */
  const acts = document.querySelector('.head-actions');
  let printButton = document.getElementById('btn-print-menu');
  if (!printButton && acts) {
    printButton = document.createElement('button');
    printButton.className = 'btn btn-ghost'; printButton.id = 'btn-print-menu';
    printButton.innerHTML = '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect height="8" width="12" x="6" y="14"/></svg> Centre d\'impression';
    acts.insertBefore(printButton, acts.firstChild);
  }
  if (printButton) {
    printButton.type = 'button';
    printButton.title = 'Choisir le document et les filtres à imprimer';
    printButton.setAttribute('aria-haspopup', 'dialog');
    printButton.onclick = function () { printMenu(); };
  }
  /* la boîte « Fiche » de la répartition ouvre la fiche au modèle officiel (4SI2) */
  if (typeof root.openModal === 'function' && !root.__ficheHooked) {
    classic = root.openModal;
    root.openModal = function (cls, n) {
      if (FICHES_CLS[cls] && n) { openForm(n, cls); return; }
      return classic.apply(this, arguments);
    };
    root.__ficheHooked = true;
  }
  /* le trimestre et la classe choisis dans l'application rafraîchissent le bloc */
  if (!root.__ficheRepHooked) {
    const st0 = root.setRep, st1 = root.setTri;
    if (typeof st0 === 'function') {
      root.setRep = function (c) {
        if (CLS_REP[c]) appCls = c;
        const r = st0.apply(this, arguments);
        try { renderRepBlock(); } catch (e) {}
        return r;
      };
    }
    if (typeof st1 === 'function') {
      root.setTri = function (t) {
        if ([1, 2, 3].indexOf(Number(t)) >= 0) appTri = Number(t);
        const r = st1.apply(this, arguments);
        try { renderRepBlock(); } catch (e) {}
        return r;
      };
    }
    root.__ficheRepHooked = true;
  }
  /* le bouton « Imprimer la fiche » de l'onglet imprime le document du modèle */
  if (!root.__fichePrintHooked) {
    document.addEventListener('click', function (e) {
      const t = e.target && e.target.closest ? e.target.closest('[data-ref="print-fiche"]') : null;
      if (!t) return;
      e.preventDefault(); e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      printSelected();
    }, true);
    root.__fichePrintHooked = true;
  }
  /* greffes sur la navigation et sur le rendu global */
  if (!root.__ficheNavHooked) {
    const go0 = root.go, r0 = root.renderAll;
    root.go = function (id) {
      const r = go0.apply(this, arguments);
      syncTab();
      if (id === TAB_ID) { try { render(); } catch (e) {} }
      try { renderRepBlock(); anchorFiche(); } catch (e) {}
      return r;
    };
    root.renderAll = function () {
      const r = r0.apply(this, arguments);
      try { syncTab(); anchorFiche(); render(); renderRepBlock(); } catch (e) {}
      return r;
    };
    root.__ficheNavHooked = true;
  }
  /* la barre d'onglets est reconstruite par l'application : on la surveille */
  const bar = document.getElementById('tabs');
  if (bar && root.MutationObserver && !root.__ficheObserver) {
    let busy = false;
    new root.MutationObserver(function () {
      if (busy) return;
      busy = true;
      requestAnimationFrame(function () { busy = false; syncTab(); });
    }).observe(bar, { childList: true });
    root.__ficheObserver = true;
  }
  try { syncPreparations(); } catch (e) {}
  try { fillPreparations(); } catch (e) {}
  syncTab();
}

root.STI_FICHES = {
  install, render, show, filter: (k, v) => { filtre[k] = v; render(); },
  open, close, save, reset, openClassic, printMenu, closePrintMenu, printFiche, printAll, printRepartition, printCahier, exportCahierPDF: options => printCahier(Object.assign({}, options || {}, { output: 'pdf' })), selectCahierPrintSessions,
  cls: c => { ficCls = FICHES_CLS[c] ? c : '4SI2'; filtre.tri = 0; if (active()) render(); try { syncTab(); } catch (e) {} },
  openCls: (c, n) => { if (FICHES_CLS[c]) ficCls = c; open(n); },
  clsCourante: () => ficCls,
  form: n => openForm(n), formSave, formClose, formPrint, formReset, printSelected, pdf: openPdf, avUpdate,
  markSeance, coverage, derniereCouverture, classicModal: () => { if (classic) classic.apply(root, [ficCls, formN]); },
  repTri: v => { repTri = v; const b = document.getElementById('rep-4si2'); if (b) b.outerHTML = repHTML(); },
  repCls: c => { repCls = CLS_REP[c] ? c : '4SI2'; repTri = 0;
                 const b = document.getElementById('rep-4si2'); if (b) b.outerHTML = repHTML(); },
  current: () => ctxN, edits: () => edits,
  prepText: n => prepText(fiche(n)), prepTextCls: (c, n) => prepText(base(c)[String(n)], c),
  syncPreparations, fillPreparations: () => fillPreparations()
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
else install();
})(typeof window !== 'undefined' ? window : globalThis);
