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
const CLS = '4SI2';
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
function base() { return (root.STI_DATA && root.STI_DATA.fiches4SI2) || {}; }
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
  const e = edits[CLS + '|' + n];
  if (e) Object.assign(f, e);
  if (!f.modules) f.modules = 'SQL · HTML5 · CSS · JavaScript · PHP';
  return f;
}
function isEdited(n) { return !!edits[CLS + '|' + n]; }

/* --------------------------------------------- nouvelle répartition 4SI2
   Bloc inséré en tête de l'onglet « Répartition annuelle » du site :
   les 50 séances datées, par trimestre, avec les évaluations et un accès
   direct à la fiche pédagogique de chaque séance. */
let repTri = 0;
function plan() { return (root.STI_DATA && root.STI_DATA.repartition4SI2) || []; }
function repHTML() {
  const p = plan();
  if (!p.length) return '';
  const rows = p.filter(x => !repTri || x.tri === repTri);
  return `
  <div class="card" id="rep-4si2" style="margin-bottom:16px">
    <div class="card-h">
      <h3>${ic('list')} Nouvelle répartition 4SI2 — 2026 / 2027 <span class="badge b-teal">50 séances · 100 h</span></h3>
      <div class="row no-print" style="gap:6px;flex-wrap:wrap">
        <select onchange="STI_FICHES.repTri(Number(this.value))">
          <option value="0">Toute l'année</option>
          <option value="1"${repTri===1?' selected':''}>1<sup>er</sup> trimestre</option>
          <option value="2"${repTri===2?' selected':''}>2<sup>e</sup> trimestre</option>
          <option value="3"${repTri===3?' selected':''}>3<sup>e</sup> trimestre</option>
        </select>
        <button class="btn btn-xs btn-line" onclick="STI_FICHES.printRepartition(${repTri})">${ic('print')} Imprimer</button>
        <button class="btn btn-xs btn-soft" onclick="go('v-fiches')">Voir les fiches</button>
      </div>
    </div>
    <div class="card-b">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th style="width:44px">N°</th><th style="width:100px">Date</th><th>Contenu de la séance</th>
          <th style="width:150px" class="hide-sm">Domaines</th><th style="width:96px">Type</th></tr></thead>
        <tbody>${rows.map(x => `<tr${x.k==='cours'?'':' class="is-eval"'} style="cursor:pointer" onclick="STI_FICHES.open(${x.n})">
          <td class="n">${x.n}</td>
          <td style="white-space:nowrap">${fmtShort(x.iso)}<div class="tiny muted">${JOURS[D(x.iso).getDay()]}</div></td>
          <td><div class="tt">${esc(x.t)}</div><div class="det">${esc(x.det)}</div></td>
          <td class="hide-sm"><span class="badge b-grey">${esc(x.d)}</span></td>
          <td><span class="badge ${x.k==='cours'?'b-blue':x.k==='corr'?'b-grey':'b-navy'}">${
            {cours:'cours', dc:'DC', ds:'DS', corr:'correction'}[x.k] || x.k}</span></td></tr>`).join('')}
        </tbody></table></div>
      <div class="tiny muted" style="margin-top:8px">Cliquez sur une ligne pour ouvrir la fiche pédagogique préremplie de la séance.</div>
    </div>
  </div>`;
}
function renderRepBlock() {
  const host = document.getElementById('v-rep');
  if (!host || document.getElementById('rep-4si2') || !plan().length) return;
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
      <h2>Fiches pédagogiques — 4<sup>e</sup> année SI (4SI2)</h2>
      <p class="lead">Les 50 fiches du modèle « Séance 8-9 », préremplies automatiquement à partir de la
      répartition et du Smart Book. Chaque champ est modifiable : vos corrections sont enregistrées dans
      votre espace et reprises à l'impression.</p>
    </div>
    <div class="row no-print" style="gap:8px">
      <button class="btn btn-xs btn-line" onclick="STI_FICHES.printMenu()">${ic('print')} Impression</button>
      <button class="btn btn-xs btn-blue" onclick="STI_FICHES.open(1)">${ic('book')} Ouvrir la fiche n°1</button>
    </div>
  </div>

  <div class="chips-row" style="margin-bottom:16px">
    ${card('Fiches', '50', '3 trimestres')}
    ${card('Séances', '100 h', '2 h × 2 par semaine')}
    ${card('Évaluations', '9', '6 DC · 3 DS')}
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
                <a class="btn btn-xs btn-line" href="docs/fiches-4si-2026/S${(Math.floor((f.n-1)/2)*2)+1}-${(Math.floor((f.n-1)/2)*2)+2}.pdf" target="_blank" rel="noopener" title="PDF du modèle officiel (deux séances par fichier)">PDF</a>
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
      <td class="first" style="width:20%"><div class="f-lab">CLASSE</div><div class="f-val">4ème SI</div></td>
      <td style="width:19%"><div class="f-lab">DURÉE TOTALE</div><div class="f-val">${f.duree} min</div></td>
      <td style="width:43%"><div class="f-lab">MODULES</div>
        <div class="f-val" ${E ? 'contenteditable="true" data-f="modules"' : ''}>SQL · HTML5 · CSS · JavaScript · PHP</div></td>
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
    <div class="f-foot">Lycée Rafèha · 4ème SI · Séance ${f.n} · Enseignant : Aymen Essouyah</div>
  </div>`;
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
  if (root.STI_ANNEX_TRACK) {
    const record = root.store && root.store.seances ? root.store.seances[CLS + '|' + n] || {} : {};
    root.STI_ANNEX_TRACK.mountModal(CLS, n, record, 'fm-body');
  }
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
  edits[CLS + '|' + ctxN] = {
    titre: f.titre, modules: f.modules, methode: f.methode, maison: f.maison,
    objectifs: f.objectifs, prerequis: f.prerequis, criteres: f.criteres,
    etapes: f.etapes, version: 1, modifie: new Date().toISOString()
  };
  persist();
  /* report facultatif vers le cahier de textes de l'application */
  try {
    if (root.store && typeof root.save === 'function') {
      const k = CLS + '|' + ctxN;
      const prep = [f.titre,
        'Objectifs : ' + f.objectifs.map(o => o.titre + ' (' + o.items.join(' ; ') + ')').join(' — '),
        'Prérequis : ' + f.prerequis.join(' ; '),
        'Déroulement : ' + f.etapes.map(e => e.etape + ' ' + e.duree + ' min').join(' · ')
      ].join('\n');
      const annexSelection = root.STI_ANNEX_TRACK ? root.STI_ANNEX_TRACK.selection(CLS, ctxN) : null;
      const sessionData = Object.assign({}, root.store.seances[k] || {}, { preparation: prep, devoirs: f.maison });
      if (annexSelection !== null) {
        sessionData.annexes = annexSelection;
        sessionData.annexesVersion = root.STI_ANNEX_TRACK.version;
      }
      root.store.seances[k] = sessionData;
      root.save(true);
    }
  } catch (e) {}
  close();
  if (root.toast) root.toast('Fiche n°' + ctxN + ' enregistrée');
}
function reset() {
  if (!ctxN) return;
  delete edits[CLS + '|' + ctxN];
  persist();
  open(ctxN);
  if (root.toast) root.toast('Fiche n°' + ctxN + ' restaurée');
}
function openClassic() {
  if (typeof classic === 'function' && ctxN) { close(); classic(CLS, ctxN); }
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
    <h1>Répartition ${tri ? 'trimestrielle' : 'annuelle'} — 4<sup>e</sup> année SI (4SI2) — matière STI</h1>
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
          <div><strong>Toutes les séances</strong><div class="tiny muted">Les 50 fiches, une page par séance (50 pages).</div></div>
          <button class="btn btn-xs btn-blue" onclick="STI_FICHES.printAll()">Imprimer les 50 fiches</button>
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
          <div><strong>Répartition annuelle</strong><div class="tiny muted">Les 50 séances de l'année sur un seul document.</div></div>
          <button class="btn btn-xs btn-blue" onclick="STI_FICHES.printRepartition(0)">Imprimer l'année</button>
        </div>

        <div class="note tiny" style="margin-top:10px">Les PDF déjà générés (modèle officiel, deux séances par fichier,
          et le recueil des 50 fiches) sont dans <code>docs/fiches-4si-2026/</code> — bouton « PDF » dans la liste.</div>
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
    b.innerHTML = (root.ic ? root.ic('book') : '') + 'Fiches pédagogiques<span class="cnt">50</span>';
    b.onclick = () => show();
    bar.appendChild(b);
  }
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
        <strong style="color:#12324d">Fiche pédagogique au modèle officiel (4<sup>e</sup> année SI)</strong>
        <div class="tiny muted" style="margin-top:3px">Les 50 fiches du modèle « Séance 8-9 » : objectifs, méthode active, prérequis,
        critères de réussite, déroulement sur 120 min et travail à la maison. Contenu prérempli, modifiable et imprimable.</div>
      </div>
      <div class="row" style="gap:6px;flex-wrap:wrap">
        <select id="fic-anchor-n" style="min-width:290px">${opts}</select>
        <button class="btn btn-xs btn-blue" onclick="STI_FICHES.open(Number(document.getElementById('fic-anchor-n').value))">Ouvrir la fiche</button>
        <button class="btn btn-xs btn-line" onclick="STI_FICHES.printMenu()">Impression</button>
        <button class="btn btn-xs btn-line" onclick="STI_FICHES.show()">Les 50 fiches</button>
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
  if (!root.STI_DATA || !root.STI_DATA.fiches4SI2) return;
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
      if (cls === CLS && n) { open(n); return; }
      return classic.apply(this, arguments);
    };
    root.__ficheHooked = true;
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
  syncTab();
}

root.STI_FICHES = {
  install, render, show, filter: (k, v) => { filtre[k] = v; render(); },
  open, close, save, reset, openClassic, printMenu, printFiche, printAll, printRepartition,
  repTri: v => { repTri = v; const b = document.getElementById('rep-4si2'); if (b) b.outerHTML = repHTML(); },
  current: () => ctxN, edits: () => edits
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
else install();
})(typeof window !== 'undefined' ? window : globalThis);
