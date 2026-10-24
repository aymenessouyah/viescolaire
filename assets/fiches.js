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
      <button class="btn btn-xs btn-line" onclick="STI_FICHES.printMenu()">${ic('print')} Impression</button>
      <button class="btn btn-xs btn-blue" onclick="STI_FICHES.open(${list().length ? list()[0].n : 1})">${ic('book')} Ouvrir la fiche n°1</button>
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
                <button class="btn btn-xs btn-blue" onclick="STI_FICHES.open(${f.n})">Ouvrir</button>
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
function formHTML() {
  if (!formHTMLPromise) {
    formHTMLPromise = fetch('assets/fiche-formulaire.html', { cache: 'no-cache' })
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
        </div>
        <div class="row no-print" style="gap:6px;flex-wrap:wrap">
          <button class="btn btn-xs btn-line" title="Imprime la fiche au format du document (PDF), pas le formulaire"
                  onclick="STI_FICHES.formPrint()">${ic('print')} Imprimer le document</button>
          <button class="btn btn-xs btn-line" onclick="STI_FICHES.formReset()">Rétablir la fiche</button>
          <button class="btn btn-xs btn-blue" onclick="STI_FICHES.formSave()">Enregistrer la fiche</button>
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
function formReset() { if (formN) fillForm(formN); if (root.toast) root.toast('Valeurs de la fiche rétablies'); }

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
  document.getElementById('fm-title').innerHTML = 'Fiche pédagogique — séance ' + n + ' · ' + esc(fmtShort(f.date));
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
function printDoc(html, landscape) {
  const old = document.getElementById('print-frame');
  if (old) old.remove();
  const fr = document.createElement('iframe');
  fr.id = 'print-frame';
  fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(fr);
  const doc = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
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
    </style></head><body>${html}</body></html>`;
  fr.srcdoc = doc;
  fr.onload = function () {
    setTimeout(function () {
      try { fr.contentWindow.focus(); fr.contentWindow.print(); }
      catch (e) { if (root.toast) root.toast('Impression bloquée par le navigateur'); }
    }, 250);
  };
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

function ensurePrintMenu() {
  if (document.getElementById('prm-modal')) return;
  const d = document.createElement('div');
  d.className = 'modal';
  d.id = 'prm-modal';
  const opts = list().map(f => `<option value="${f.n}">${f.n} — ${fmtShort(f.date)} — ${esc(f.titre)}</option>`).join('');
  d.innerHTML = `
    <div class="box" style="max-width:620px">
      <div class="box-h"><h3 style="font-size:15px">Impression</h3>
        <button class="btn btn-xs btn-line" onclick="document.getElementById('prm-modal').classList.remove('on')">Fermer</button></div>
      <div class="box-b">
        <div class="note tiny" style="margin-bottom:12px">Choisissez ce que vous voulez imprimer. Les fiches sortent sur une page paysage
          (une page par séance) ; les répartitions sur une page portrait.</div>

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
  document.body.appendChild(d);
  d.addEventListener('click', e => { if (e.target.id === 'prm-modal') d.classList.remove('on'); });
}
function printMenu() {
  ensurePrintMenu();
  document.getElementById('prm-modal').classList.add('on');
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
        <button class="btn btn-xs btn-blue" onclick="STI_FICHES.open(Number(document.getElementById('fic-anchor-n').value))">Ouvrir la fiche</button>
        <button class="btn btn-xs btn-soft" onclick="STI_FICHES.form(Number(document.getElementById('fic-anchor-n').value))">Modifier (formulaire)</button>
        <button class="btn btn-xs btn-line" onclick="STI_FICHES.printMenu()">Impression</button>
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
  /* bouton « Impression » dans l'en-tête */
  const acts = document.querySelector('.head-actions');
  if (acts && !document.getElementById('btn-print-menu')) {
    const b = document.createElement('button');
    b.className = 'btn btn-ghost'; b.id = 'btn-print-menu';
    b.innerHTML = '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect height="8" width="12" x="6" y="14"/></svg> Impression';
    b.onclick = printMenu;
    acts.insertBefore(b, acts.firstChild);
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
  open, close, save, reset, openClassic, printMenu, printFiche, printAll, printRepartition,
  cls: c => { ficCls = FICHES_CLS[c] ? c : '4SI2'; filtre.tri = 0; if (active()) render(); try { syncTab(); } catch (e) {} },
  openCls: (c, n) => { if (FICHES_CLS[c]) ficCls = c; open(n); },
  clsCourante: () => ficCls,
  form: n => openForm(n), formSave, formClose, formPrint, formReset, printSelected, pdf: openPdf,
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
