/* ==================================================================
   MES CLASSES & ÉLÈVES — module multi-professeurs
   Espace pédagogique STI — Prof. Aymen Essouyah — 2026/2027
   ------------------------------------------------------------------
   Chaque professeur dispose de :
     • ses classes (créées librement) et ses élèves ;
     • ses présences (par classe et par date) ;
     • ses épreuves et les notes associées ;
     • l'analyse des points faibles par notion.
   Ces données vivent dans la sauvegarde personnelle (cloud privé :
   chaque professeur ne voit que les siennes — voir supabase/).
   ================================================================== */
'use strict';

/* ---------- classes ---------- */
const CLASSES_DEFAUT = [
  { id:"3SI1", nom:"3SI1", creneaux:"mardi 8 h–12 h • jeudi 13 h–17 h", groupes:2 },
  { id:"4SI2", nom:"4SI2", creneaux:"lundi 8 h–12 h • vendredi 8 h–12 h", groupes:2 }
];
let elVue = "roster", elClasse = null, elDate = "", elEpreuve = null, elEleve = null;

function mesClasses(){
  if (!Array.isArray(store.classes)) store.classes = JSON.parse(JSON.stringify(CLASSES_DEFAUT));
  return store.classes;
}
function classeDe(id){ return mesClasses().find(c => c.id === id) || null; }
function elevesDe(cid){ store.eleves[cid] = store.eleves[cid] || []; return store.eleves[cid]; }
function epreuvesDe(cid){ store.epreuves[cid] = store.epreuves[cid] || []; return store.epreuves[cid]; }
function uidEl(){ return "e" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function elClasseCourante(){
  if (!elClasse || !classeDe(elClasse)) elClasse = (mesClasses()[0] || {}).id || null;
  return elClasse;
}
function addClasse(){
  const nom  = (document.getElementById("mc-nom") || {}).value || "";
  const cre  = (document.getElementById("mc-cre")  || {}).value || "";
  const grp  = parseInt((document.getElementById("mc-grp") || {}).value || "2", 10) || 2;
  const n = nom.trim();
  if (!n){ toast("Indiquez le nom de la classe (ex. 2ème TI)"); return; }
  if (mesClasses().some(c => c.nom.toLowerCase() === n.toLowerCase())){ toast("Cette classe existe déjà"); return; }
  const id = "c" + Date.now().toString(36);
  mesClasses().push({ id:id, nom:n, creneaux:cre.trim(), groupes:grp });
  elClasse = id; save(); renderEleves(); toast("Classe « " + n + " » créée");
}
function epreuveTrouvee(eid){
  for (const cid of Object.keys(store.epreuves || {})) if (store.epreuves[cid].some(e => e.id === eid)) return true;
  return false;
}
function delClasse(cid){
  const c = classeDe(cid); if (!c) return;
  if (!confirm("Supprimer la classe « " + c.nom + " », ses élèves, ses épreuves, ses notes et ses présences ?")) return;
  store.classes = mesClasses().filter(x => x.id !== cid);
  delete store.eleves[cid]; delete store.epreuves[cid]; delete store.presences[cid];
  Object.keys(store.notes).forEach(k => { if (!epreuveTrouvee(k)) delete store.notes[k]; });
  elClasse = null; save(); renderEleves(); toast("Classe supprimée");
}

/* ---------- élèves ---------- */
function addEleve(cid){
  const g = id => (document.getElementById(id) || {}).value || "";
  const nom = g("el-nom").trim(), pre = g("el-pre").trim();
  const grp = parseInt(g("el-grp"), 10) || 1, pc = g("el-pc").trim();
  if (!nom){ toast("Indiquez le nom de l'élève"); return; }
  elevesDe(cid).push({ id:uidEl(), nom:nom, prenom:pre, groupe:grp, pc:pc });
  save(); renderEleves(); toast("Élève ajouté");
}
function addElevesLot(cid){
  const ta = document.getElementById("el-lot");
  const lignes = ((ta || {}).value || "").split(/\n+/).map(l => l.trim()).filter(Boolean);
  let n = 0;
  lignes.forEach(l => {
    const p = l.split(/[;,\t]+/).map(x => x.trim());
    if (!p[0]) return;
    elevesDe(cid).push({ id:uidEl(), nom:p[0], prenom:p[1]||"", groupe:parseInt(p[2],10)||1, pc:p[3]||"" });
    n++;
  });
  save(); renderEleves(); toast(n + " élève(s) ajouté(s)");
}
function delEleve(cid, eid){
  if (!confirm("Retirer cet élève de la classe ?")) return;
  store.eleves[cid] = elevesDe(cid).filter(x => x.id !== eid);
  save(); renderEleves();
}
function triEleves(arr){ return arr.slice().sort((a,b) => (a.groupe-b.groupe) || a.nom.localeCompare(b.nom,"fr")); }

/* ---------- présences ---------- */
function presencesDe(cid){ store.presences[cid] = store.presences[cid] || {}; return store.presences[cid]; }
function etatPresence(cid, iso, eid){ return ((presencesDe(cid)[iso] || {})[eid]) || ""; }
function cyclePresence(cid, iso, eid){
  const j = presencesDe(cid);
  j[iso] = j[iso] || {};
  const ordre = ["", "p", "a", "r"];
  j[iso][eid] = ordre[(ordre.indexOf(j[iso][eid] || "") + 1) % ordre.length];
  save(true); renderEleves();
}
function setAllPresent(cid, iso){
  const j = presencesDe(cid); j[iso] = j[iso] || {};
  elevesDe(cid).forEach(e => { j[iso][e.id] = "p"; });
  save(); renderEleves(); toast("Tous marqués présents");
}
function clearPresence(cid, iso){
  const j = presencesDe(cid); delete j[iso];
  save(); renderEleves();
}
function nbAbsences(cid, eid){
  const j = presencesDe(cid);
  return Object.keys(j).reduce((a, iso) => a + (j[iso][eid] === "a" ? 1 : 0), 0);
}

/* ---------- épreuves et notes ---------- */
function addEpreuve(cid){
  const g = id => (document.getElementById(id) || {}).value || "";
  const titre = g("ep-titre").trim();
  if (!titre){ toast("Indiquez le titre de l'épreuve"); return; }
  const tags = g("ep-tags").split(/[,;]+/).map(x => x.trim()).filter(Boolean);
  epreuvesDe(cid).push({
    id:uidEl(), titre:titre, type:g("ep-type"), date:g("ep-date"),
    bareme:parseFloat(g("ep-bareme")) || 20, tags:tags
  });
  save(); renderEleves(); toast("Épreuve ajoutée");
}
function delEpreuve(cid, eid){
  const e = epreuvesDe(cid).find(x => x.id === eid); if (!e) return;
  if (!confirm("Supprimer l'épreuve « " + e.titre + " » et ses notes ?")) return;
  store.epreuves[cid] = epreuvesDe(cid).filter(x => x.id !== eid);
  delete store.notes[eid];
  if (elEpreuve === eid) elEpreuve = null;
  save(); renderEleves();
}
/* épreuves officielles pré-remplies (classes 3SI1 / 4SI2 uniquement) */
function presetsOfficiels(cid){
  const dc = SESSIONS[cid].filter(s => s.blk && s.blk.k === "dc");
  const ds = JALONS.filter(j => j.type === "bloc" && (!j.classes || j.classes.includes(cid)));
  const existants = epreuvesDe(cid).map(e => e.titre + "|" + e.date);
  let n = 0;
  dc.forEach((s, i) => {
    const titre = "Devoir de contrôle n°" + (i + 1);
    if (!existants.includes(titre + "|" + s.iso)){ epreuvesDe(cid).push({ id:uidEl(), titre:titre, type:"dc", date:s.iso, bareme:20, tags:[] }); n++; }
  });
  ds.forEach((j, i) => {
    const iso = (j.from || "").length === 10 ? j.from : j.date;
    if (!iso) return;
    const titre = "Devoir de synthèse n°" + (i + 1);
    if (!existants.includes(titre + "|" + iso)){ epreuvesDe(cid).push({ id:uidEl(), titre:titre, type:"ds", date:iso, bareme:20, tags:[] }); n++; }
  });
  elVue = "epreuves"; save(); renderEleves();
  toast(n ? n + " épreuve(s) officielle(s) ajoutée(s)" : "Les épreuves officielles figurent déjà dans la liste");
}
function setNote(epid, eid, val, abs){
  store.notes[epid] = store.notes[epid] || {};
  if (abs) store.notes[epid][eid] = { abs:true };
  else {
    const v = parseFloat(String(val).replace(",", "."));
    if (isNaN(v)){ delete store.notes[epid][eid]; return; }
    store.notes[epid][eid] = { n:v };
  }
  save(true);
}
function enregistrerNotes(cid, epid){
  elevesDe(cid).forEach(e => {
    const inp = document.getElementById("note-" + epid + "-" + e.id);
    const abs = document.getElementById("abs-" + epid + "-" + e.id);
    if (!inp) return;
    if (inp.value === "" && !(abs && abs.checked)){
      if (store.notes[epid]) delete store.notes[epid][e.id];
      return;
    }
    setNote(epid, e.id, inp.value, abs && abs.checked);
  });
  save(); toast("Notes enregistrées");
}

/* ---------- statistiques : moyennes, rang, points faibles ---------- */
function notesEleve(cid, eid){
  const out = [];
  epreuvesDe(cid).forEach(e => {
    const n = (store.notes[e.id] || {})[eid];
    if (!n || n.abs) return;
    const v = parseFloat(n.n); if (isNaN(v)) return;
    const sur = e.bareme || 20;
    out.push({ titre:e.titre, date:e.date, val:v, sur:sur, sur20:v / sur * 20, tags:e.tags || [] });
  });
  return out;
}
function statsEleve(cid, eid){
  const notes = notesEleve(cid, eid);
  const moy = notes.length ? notes.reduce((a,x) => a + x.sur20, 0) / notes.length : null;
  const tags = {};
  notes.forEach(x => (x.tags.length ? x.tags : ["(sans notion)"]).forEach(t => { (tags[t] = tags[t] || []).push(x.sur20); }));
  const parTag = Object.keys(tags).map(t => ({ tag:t, moy:tags[t].reduce((a,b) => a+b, 0) / tags[t].length, nb:tags[t].length }))
    .sort((a,b) => a.moy - b.moy);
  return { moy:moy, notes:notes, parTag:parTag, abs:nbAbsences(cid, eid) };
}
function classementClasse(cid){
  return triEleves(elevesDe(cid))
    .map(e => ({ e:e, s:statsEleve(cid, e.id) }))
    .filter(x => x.s.moy !== null)
    .sort((a,b) => b.s.moy - a.s.moy);
}
function rangDe(cid, eid){
  const cl = classementClasse(cid);
  const i = cl.findIndex(x => x.e.id === eid);
  return i < 0 ? null : { rang:i + 1, sur:cl.length };
}
function moyennesParNotion(cid){
  const acc = {};
  epreuvesDe(cid).forEach(e => {
    const cible = acc;
    (e.tags && e.tags.length ? e.tags : ["(sans notion)"]).forEach(t => { cible[t] = cible[t] || []; });
    elevesDe(cid).forEach(el => {
      const n = (store.notes[e.id] || {})[el.id];
      if (!n || n.abs) return;
      const v = parseFloat(n.n); if (isNaN(v)) return;
      const s20 = v / (e.bareme || 20) * 20;
      (e.tags && e.tags.length ? e.tags : ["(sans notion)"]).forEach(t => cible[t].push(s20));
    });
  });
  return Object.keys(acc).map(t => ({ tag:t, moy:acc[t].length ? acc[t].reduce((a,b) => a+b, 0) / acc[t].length : null, nb:acc[t].length }))
    .sort((a,b) => (a.moy || 0) - (b.moy || 0));
}
function coulNote(m){ return m === null ? "#93a6b8" : m < 10 ? "var(--rose)" : m < 13 ? "var(--amber)" : "var(--green)"; }
function barreNotion(t, largeurPct, moy){
  return '<div class="spread" style="gap:8px;margin:4px 0">' +
    '<span class="small" style="min-width:130px">' + escapeHtml(t) + '</span>' +
    '<div style="flex:1;height:10px;background:var(--line-2);border-radius:6px;overflow:hidden"><div style="width:' + Math.max(2, Math.min(100, largeurPct)) + '%;height:100%;background:' + coulNote(moy) + '"></div></div>' +
    '<strong style="min-width:42px;text-align:right;color:' + coulNote(moy) + '">' + (moy === null ? "—" : moy.toFixed(1)) + '</strong></div>';
}

/* ---------- interface ---------- */
function elSel(cid, idBase){
  return `<select id="${idBase}" onchange="${idBase==='sel-classe'?'renderEleves(elClasse=this.value,elEpreuve=null,elEleve=null)':'renderEleves()'}">
    ${mesClasses().map(c => `<option value="${c.id}" ${c.id===cid?"selected":""}>${escapeHtml(c.nom)}</option>`).join("")}
  </select>`;
}
function renderEleves(){
  const zone = document.getElementById("v-eleves");
  if (!zone) return;
  const cid = elClasseCourante();
  const c = cid ? classeDe(cid) : null;
  const vues = [
    ["roster",   "Élèves",            "users"],
    ["presence", "Présences",         "check"],
    ["epreuves", "Épreuves & notes",  "pen"],
    ["faibles",  "Points faibles",    "target"]
  ];
  const nbEl = cid ? elevesDe(cid).length : 0;
  zone.innerHTML = `
  <div class="sec-head">
    <div>
      <h2>${ic("users")} Mes classes &amp; élèves</h2>
      <p class="lead">Votre espace personnel : classes, élèves, numéro de PC, présences, notes par épreuve et <strong>analyse des points faibles</strong> par notion. Ces données sont <strong>privées</strong> — les autres professeurs ne les voient pas — et suivent votre sauvegarde distante comme le reste.</p>
    </div>
    <div class="row no-print" style="gap:6px">
      ${vues.map(v => `<button class="btn btn-xs ${elVue===v[0]?"btn-blue":"btn-line"}" onclick="renderEleves(elVue='${v[0]}')">${ic(v[2])} ${v[1]}</button>`).join("")}
    </div>
  </div>
  ${!c ? `<div class="note warn">${ic("pin")} Créez d'abord une classe ci-dessous.</div>` : `
  <div class="card" style="margin-bottom:14px"><div class="card-b row" style="gap:14px;align-items:center;flex-wrap:wrap">
    <span class="tiny muted">Classe :</span> ${elSel(cid, "sel-classe")}
    <span class="badge ${clsChip(cid)}">${c.nom}</span>
    ${c.creneaux ? '<span class="tiny muted">' + escapeHtml(c.creneaux) + '</span>' : ""}
    <span class="tiny muted">${nbEl} élève(s) • ${epreuvesDe(cid).length} épreuve(s)</span>
    ${["3SI1","4SI2"].includes(cid) ? "" : `<button class="btn btn-xs btn-line" style="margin-left:auto;color:#b02a3a" onclick="delClasse('${cid}')">Supprimer cette classe</button>`}
  </div></div>
  <details class="acc no-print" style="margin-bottom:14px"><summary>Nouvelle classe</summary>
    <div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end;padding:10px 0">
      <div><label class="f">Nom de la classe</label><input id="mc-nom" placeholder="2ème TI"></div>
      <div><label class="f">Créneaux (libre)</label><input id="mc-cre" placeholder="samedi 8 h–10 h"></div>
      <div><label class="f">Groupes</label><input id="mc-grp" type="number" min="1" max="4" value="2" style="width:90px"></div>
      <button class="btn btn-blue" onclick="addClasse()">${ic("plus")} Créer la classe</button>
    </div></details>`}
  <div id="el-zone">${renderVueEleves(cid)}</div>`;
}
function renderVueEleves(cid){
  if (!cid) return `<div class="card"><div class="card-b">
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end">
        <div><label class="f">Nom de la classe</label><input id="mc-nom" placeholder="2ème TI"></div>
        <div><label class="f">Créneaux (libre)</label><input id="mc-cre" placeholder="samedi 8 h–10 h"></div>
        <div><label class="f">Groupes</label><input id="mc-grp" type="number" min="1" max="4" value="2" style="width:90px"></div>
        <button class="btn btn-blue" onclick="addClasse()">${ic("plus")} Créer la classe</button>
      </div></div></div>`;
  if (elVue === "presence") return vuePresence(cid);
  if (elVue === "epreuves") return vueEpreuves(cid);
  if (elVue === "faibles")  return vueFaibles(cid);
  return vueRoster(cid);
}
function vueRoster(cid){
  const c = classeDe(cid);
  const els = triEleves(elevesDe(cid));
  return `<div class="card">
    <div class="card-h"><h3>${ic("users")} Élèves — ${escapeHtml(c.nom)}</h3><span class="badge b-grey">${els.length} inscrit(s)</span></div>
    <div class="card-b">
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px">
        <div><label class="f">Nom</label><input id="el-nom" placeholder="Ben Ali"></div>
        <div><label class="f">Prénom</label><input id="el-pre"></div>
        <div><label class="f">Groupe</label><input id="el-grp" type="number" min="1" max="${c.groupes||2}" value="1" style="width:80px"></div>
        <div><label class="f">N° PC</label><input id="el-pc" style="width:90px" placeholder="P12"></div>
        <button class="btn btn-blue" onclick="addEleve('${cid}')">${ic("plus")} Ajouter</button>
      </div>
      <details class="acc" style="margin-bottom:12px"><summary>Ajout rapide en masse (une ligne par élève : Nom ; Prénom ; Groupe ; PC)</summary>
        <div style="padding:10px 0">
          <textarea id="el-lot" rows="4" style="width:100%" placeholder="Trabelsi Ahmed ; 1 ; P01&#10;Gharbi Salma ; 1 ; P02&#10;Jlassi Youssef ; 2 ; P15"></textarea>
          <button class="btn btn-sm btn-blue" style="margin-top:8px" onclick="addElevesLot('${cid}')">Ajouter la liste</button>
        </div></details>
      ${els.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr>
        <th style="width:46px">#</th><th>Nom &amp; prénom</th><th style="width:90px">Groupe</th><th style="width:90px">PC</th>
        <th style="width:110px">Absences</th><th style="width:60px"></th></tr></thead><tbody>
        ${els.map((e,i) => {
          const abs = nbAbsences(cid, e.id);
          return `<tr><td class="n">${i+1}</td><td><strong>${escapeHtml(e.nom)}</strong>${e.prenom ? " " + escapeHtml(e.prenom) : ""}</td>
          <td><span class="badge b-grey">Gr. ${e.groupe||1}</span></td><td>${e.pc ? '<span class="badge b-grey">🖥 '+escapeHtml(e.pc)+'</span>' : "—"}</td>
          <td>${abs ? '<span class="badge" style="background:var(--rose-bg);color:#a51f38;border-color:var(--rose-line)">' + abs + ' abs.</span>' : '<span class="tiny muted">—</span>'}</td>
          <td><button class="btn btn-xs btn-line" onclick="delEleve('${cid}','${e.id}')">✕</button></td></tr>`;
        }).join("")}
      </tbody></table></div>` : '<p class="tiny muted">Aucun élève pour le moment.</p>'}
    </div></div>`;
}
function vuePresence(cid){
  const c = classeDe(cid);
  const iso = elDate || todayISO();
  const els = triEleves(elevesDe(cid));
  const jour = presencesDe(cid)[iso] || {};
  const nb = { p:0, a:0, r:0 };
  Object.values(jour).forEach(v => { if (nb[v] !== undefined) nb[v]++; });
  const dates = Object.keys(presencesDe(cid)).sort().reverse().slice(0, 8);
  return `<div class="card">
    <div class="card-h"><h3>${ic("check")} Présences — ${escapeHtml(c.nom)}</h3>
      <div class="row" style="gap:8px"><input type="date" id="pr-date" value="${iso}" onchange="renderEleves(elDate=this.value)">
      <button class="btn btn-xs btn-blue" onclick="setAllPresent('${cid}',document.getElementById('pr-date').value)">Tous présents</button>
      <button class="btn btn-xs btn-line" onclick="clearPresence('${cid}',document.getElementById('pr-date').value)">Vider</button></div></div>
    <div class="card-b">
      ${els.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Élève</th><th style="width:90px">PC</th><th style="width:210px">Statut (cliquer pour changer)</th></tr></thead><tbody>
        ${els.map(e => {
          const st = jour[e.id] || "";
          return `<tr><td><strong>${escapeHtml(e.nom)}</strong> ${escapeHtml(e.prenom||"")} <span class="tiny muted">Gr. ${e.groupe||1}</span></td>
          <td>${e.pc ? escapeHtml(e.pc) : "—"}</td>
          <td><button class="btn btn-xs ${st==="p"?"btn-blue":"btn-line"}" style="${st==="p"?"background:var(--green);border-color:var(--green)":""}" onclick="cyclePresence('${cid}','${iso}','${e.id}')">${st==="p"?"✓ présent":st==="a"?"✗ absent":st==="r"?"⏱ retard":"non marqué"}</button></td></tr>`;
        }).join("")}
      </tbody></table></div>
      <div class="row" style="gap:8px;margin-top:10px">
        <span class="badge b-green">${nb.p} présent(s)</span><span class="badge" style="background:var(--rose-bg);color:#a51f38;border-color:var(--rose-line)">${nb.a} absent(s)</span><span class="badge b-amber">${nb.r} retard(s)</span>
      </div>` : '<p class="tiny muted">Ajoutez d\'abord des élèves (vue « Élèves »).</p>'}
      ${dates.length ? `<div class="tiny muted" style="margin-top:12px">Dernières séances pointées : ${dates.map(d => `<button class="btn btn-xs btn-line" style="margin:2px" onclick="renderEleves(elDate='${d}')">${fmtShort(d)}</button>`).join(" ")}</div>` : ""}
    </div></div>`;
}
function vueEpreuves(cid){
  const c = classeDe(cid);
  const eps = epreuvesDe(cid).slice().sort((a,b) => (a.date||"").localeCompare(b.date||""));
  const nbEl = elevesDe(cid).length;
  const btnPreset = ["3SI1","4SI2"].includes(cid)
    ? `<button class="btn btn-xs btn-blue" onclick="presetsOfficiels('${cid}')">${ic("calendar")} Pré-remplir DC / DS officiels</button>` : "";
  return `<div class="card">
    <div class="card-h"><h3>${ic("pen")} Épreuves &amp; notes — ${escapeHtml(c.nom)}</h3>
      <div class="row" style="gap:6px">${btnPreset}</div></div>
    <div class="card-b">
      <details class="acc" style="margin-bottom:12px"><summary>Nouvelle épreuve</summary>
        <div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end;padding:10px 0">
          <div><label class="f">Titre</label><input id="ep-titre" placeholder="TP PHP — insertion"></div>
          <div><label class="f">Type</label><select id="ep-type"><option value="dc">Devoir de contrôle</option><option value="ds">Devoir de synthèse</option><option value="tp" selected>TP / pratique</option><option value="autre">Autre</option></select></div>
          <div><label class="f">Date</label><input id="ep-date" type="date" value="${todayISO()}"></div>
          <div><label class="f">Barème</label><input id="ep-bareme" type="number" value="20" min="1" style="width:80px"></div>
          <div style="min-width:220px;flex:1"><label class="f">Notions (séparées par des virgules — pour l'analyse des points faibles)</label><input id="ep-tags" placeholder="SQL / LDD, requêtes de sélection"></div>
          <button class="btn btn-blue" onclick="addEpreuve('${cid}')">${ic("plus")} Créer</button>
        </div></details>
      ${eps.length ? eps.map(e => {
        const notesE = store.notes[e.id] || {};
        const vals = elevesDe(cid).map(el => notesE[el.id]).filter(n => n && !n.abs).map(n => parseFloat(n.n)).filter(v => !isNaN(v));
        const moyC = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : null;
        const ouverte = elEpreuve === e.id;
        const tyLib = { dc:"Contrôle", ds:"Synthèse", tp:"TP / pratique", autre:"Autre" }[e.type] || e.type;
        return `<div class="card" style="margin:10px 0">
          <div class="spread" style="gap:10px;flex-wrap:wrap">
            <div>
              <strong>${escapeHtml(e.titre)}</strong> <span class="badge b-grey">${tyLib}</span>
              ${e.date ? '<span class="tiny muted">' + fmtShort(e.date) + '</span>' : ""}
              <span class="tiny muted">• barème /${e.bareme}</span>
              ${e.tags && e.tags.length ? e.tags.map(t => '<span class="badge b-grey" style="margin-left:4px">' + escapeHtml(t) + '</span>').join("") : ""}
            </div>
            <div class="row" style="gap:6px">
              ${moyC !== null ? '<span class="badge b-blue">moy. classe ' + moyC.toFixed(2) + ' /' + e.bareme + '</span>' : ""}
              <span class="tiny muted">${vals.length}/${nbEl} notés</span>
              <button class="btn btn-xs ${ouverte?"btn-blue":"btn-soft"}" onclick="renderEleves(elEpreuve='${ouverte?"":e.id}')">${ouverte?"Fermer":"Saisir les notes"}</button>
              <button class="btn btn-xs btn-line" style="color:#b02a3a" onclick="delEpreuve('${cid}','${e.id}')">✕</button>
            </div>
          </div>
          ${ouverte ? `<div class="tbl-wrap" style="margin-top:10px"><table class="tbl"><thead><tr><th>Élève</th><th style="width:130px">Note /${e.bareme}</th><th style="width:90px">Absent</th></tr></thead><tbody>
            ${triEleves(elevesDe(cid)).map(el => {
              const n = notesE[el.id] || {};
              return `<tr><td><strong>${escapeHtml(el.nom)}</strong> ${escapeHtml(el.prenom||"")} <span class="tiny muted">Gr. ${el.groupe||1}</span></td>
              <td><input type="number" step="0.25" min="0" max="${e.bareme}" id="note-${e.id}-${el.id}" value="${n.abs?"":(n.n!==undefined?n.n:"")}" style="width:90px"></td>
              <td><input type="checkbox" id="abs-${e.id}-${el.id}" ${n.abs?"checked":""}></td></tr>`;
            }).join("")}
          </tbody></table></div>
          <button class="btn btn-sm btn-blue" style="margin-top:10px" onclick="enregistrerNotes('${cid}','${e.id}')">${ic("check")} Enregistrer les notes</button>` : ""}
        </div>`;
      }).join("") : '<p class="tiny muted">Aucune épreuve. Créez-en une ci-dessus' + (["3SI1","4SI2"].includes(cid) ? ' ou utilisez « Pré-remplir DC / DS officiels ».' : '.') + '</p>'}
    </div></div>`;
}
function elSelEleve(cid, sel){
  return `<select onchange="renderEleves(elEleve=this.value)">
    ${triEleves(elevesDe(cid)).map(e => `<option value="${e.id}" ${sel && sel.id===e.id?"selected":""}>${escapeHtml(e.nom + " " + (e.prenom||""))}</option>`).join("")}
  </select>`;
}
function vueFaibles(cid){
  const els = triEleves(elevesDe(cid));
  const el = els.find(x => x.id === elEleve) || null;
  const notionsClasse = moyennesParNotion(cid);
  const st = el ? statsEleve(cid, el.id) : null;
  const rg = el ? rangDe(cid, el.id) : null;
  return `<div class="card">
    <div class="card-h"><h3>${ic("target")} Points faibles — ${escapeHtml(classeDe(cid).nom)}</h3>
      ${els.length ? elSelEleve(cid, el) : ""}</div>
    <div class="card-b">
      ${!els.length ? '<p class="tiny muted">Aucun élève dans cette classe.</p>' : (!el ? '<p class="tiny muted">Choisissez un élève dans la liste.</p>' : `
      <div class="grid g4" style="margin-bottom:14px">
        <div class="kpi"><div class="lbl">Moyenne générale</div><div class="val" style="color:${coulNote(st.moy)}">${st.moy===null?"—":st.moy.toFixed(2)}<small> /20</small></div><div class="foo">${st.notes.length} note(s) prise(s) en compte</div></div>
        <div class="kpi k-teal"><div class="lbl">Rang dans la classe</div><div class="val" style="font-size:20px">${rg ? rg.rang + " / " + rg.sur : "—"}</div><div class="foo">classement par moyenne générale</div></div>
        <div class="kpi k-amber"><div class="lbl">Absences</div><div class="val">${st.abs}</div><div class="foo">séances pointées absent</div></div>
        <div class="kpi k-rose"><div class="lbl">Notion la plus fragile</div><div class="val" style="font-size:16px">${st.parTag.length ? escapeHtml(st.parTag[0].tag) : "—"}</div><div class="foo">${st.parTag.length ? "moyenne " + st.parTag[0].moy.toFixed(1) + "/20 sur " + st.parTag[0].nb + " note(s)" : "ajoutez des notions aux épreuves"}</div></div>
      </div>
      ${st.parTag.length ? `<h3 style="font-size:15px;margin-bottom:6px">Maîtrise par notion <span class="tiny muted">(du plus fragile au plus solide)</span></h3>
        <div style="margin-bottom:14px">${st.parTag.map(x => barreNotion(x.tag, x.moy, x.moy)).join("")}</div>
        ${st.parTag.length > 1 && st.parTag[0].moy < 13 ? '<div class="note warn">Priorité de remédiation : <strong>' + escapeHtml(st.parTag.slice(0,2).map(x=>x.tag).join("</strong> et <strong>")) + '</strong>.</div>' : ""}` : '<p class="tiny muted">Ajoutez des <strong>notions</strong> aux épreuves pour voir l\'analyse par thème.</p>'}
      <h3 style="font-size:15px;margin:12px 0 6px">Relevé détaillé</h3>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Épreuve</th><th style="width:90px">Note</th><th style="width:110px">Sur 20</th></tr></thead><tbody>
        ${st && st.notes.length ? st.notes.map(x => `<tr><td>${escapeHtml(x.titre)} ${x.date?'<span class="tiny muted">'+fmtShort(x.date)+'</span>':""}${x.tags.length?'<div class="tiny muted">'+escapeHtml(x.tags.join(" • "))+'</div>':""}</td><td><strong>${x.val}</strong> /${x.sur}</td><td style="color:${coulNote(x.sur20)}"><strong>${x.sur20.toFixed(1)}</strong></td></tr>`).join("") : '<tr><td colspan="3" class="tiny muted">Aucune note pour cet élève.</td></tr>'}
      </tbody></table></div>
      <h3 style="font-size:15px;margin:16px 0 6px">Toute la classe, par notion</h3>
      ${notionsClasse.length ? notionsClasse.map(x => barreNotion(x.tag, x.moy, x.moy)).join("") : '<p class="tiny muted">Pas encore de notes dans cette classe.</p>'}
      `)}
    </div></div>`;
}

/* ---------- profil du professeur connecté ---------- */
function openProfil(){
  const b = document.getElementById("profil-modal");
  if (!b) return;
  b.querySelector("#pf-nom").value = (store.profil && store.profil.nom) || "";
  b.querySelector("#pf-mat").value = (store.profil && store.profil.matiere) || "STI";
  const em = b.querySelector("#pf-email");
  if (em) em.textContent = authUser() || "(non connecté — le profil sera relié au compte à la connexion)";
  b.classList.add("on");
  setTimeout(() => { const f = b.querySelector("#pf-nom"); if (f) f.focus(); }, 60);
}
function closeProfil(){ const b = document.getElementById("profil-modal"); if (b) b.classList.remove("on"); }
function saveProfil(){
  const b = document.getElementById("profil-modal");
  const nom = b.querySelector("#pf-nom").value.trim();
  const mat = b.querySelector("#pf-mat").value.trim() || "STI";
  if (!nom){ toast("Indiquez votre nom"); return; }
  store.profil = { nom:nom, matiere:mat, email:authUser() };
  save(); closeProfil(); if (typeof applyProfil === "function") applyProfil(); renderAll(true);
  toast("Profil enregistré — " + nom);
}
/* adapte l'en-tête au professeur connecté */
function applyProfil(){
  const p = store.profil;
  const nom = p && p.nom ? p.nom : SCHOOL.prof;
  const mat = p && p.matiere ? p.matiere : SCHOOL.matiere;
  const h = document.getElementById("hero-prof");
  if (h) h.textContent = "Prof. " + nom;
  const w = document.getElementById("bienvenue-prof");
  if (w) w.textContent = "Bienvenue, M. " + nom;
  const f = document.getElementById("ft-prof");
  if (f) f.textContent = "Matière " + mat;
}

/* ---------- exports ---------- */
window.mesClasses = mesClasses; window.addClasse = addClasse; window.delClasse = delClasse;
window.addEleve = addEleve; window.addElevesLot = addElevesLot; window.delEleve = delEleve;
window.cyclePresence = cyclePresence; window.setAllPresent = setAllPresent; window.clearPresence = clearPresence;
window.nbAbsences = nbAbsences; window.etatPresence = etatPresence;
window.addEpreuve = addEpreuve; window.delEpreuve = delEpreuve;
window.presetsOfficiels = presetsOfficiels; window.enregistrerNotes = enregistrerNotes; window.setNote = setNote;
window.statsEleve = statsEleve; window.classementClasse = classementClasse; window.rangDe = rangDe;
window.moyennesParNotion = moyennesParNotion; window.renderEleves = renderEleves;
window.triEleves = triEleves; window.elClasseCourante = elClasseCourante;
/* état de l'onglet, accessible aux gestionnaires inline (testés par la suite de vérification) */
window.elVue = elVue; window.elClasse = elClasse; window.elEpreuve = elEpreuve; window.elEleve = elEleve; window.epreuvesDe = epreuvesDe; window.elevesDe = elevesDe;
window.openProfil = openProfil; window.closeProfil = closeProfil; window.saveProfil = saveProfil;
window.applyProfil = applyProfil;
