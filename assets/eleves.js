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
let elTriCompetence = null, elTriBulletin = null;

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
  elevesDe(cid).push({ id:uidEl(), nom:nom, prenom:pre, groupe:grp, pc:pc,
    nomAr:g("el-nom-ar").trim(), prenomAr:g("el-pre-ar").trim() });
  save(); renderEleves(); toast("Élève ajouté");
}
function addElevesLot(cid){
  const ta = document.getElementById("el-lot");
  const lignes = ((ta || {}).value || "").split(/\n+/).map(l => l.trim()).filter(Boolean);
  let n = 0;
  lignes.forEach(l => {
    const p = l.replace(/،/g, ";").split(/[;,\t]+/).map(x => x.trim());
    if (!p[0]) return;
    if (p.some(x => AR_RE.test(x))){
      /* ligne bilingue issue du scan : « الترابلسي أحمد ; Trabelsi Ahmed ; 1 ; P07 » */
      const ar = p.filter(x => AR_RE.test(x)).join(" ").split(/\s+/).filter(Boolean);
      let grp = 1, pc = "";
      const fr = [];
      p.filter(x => !AR_RE.test(x)).forEach(x => {
        if (/^\d{1,2}$/.test(x)) grp = parseInt(x, 10);
        else if (/^\D?\d{1,3}$/.test(x)) pc = x;
        else fr.push.apply(fr, x.split(/\s+/).filter(Boolean));
      });
      const frM = fr.length ? fr : arLigneVersFr(ar.join(" ")).split(/\s+/).filter(Boolean);
      /* famille composée : بن عمر … / Ben Omar … */
      const partAR = ["بن", "عبد", "بو", "ابو", "دار"];
      const partFR = ["ben", "bin", "abd", "abou", "bou", "el", "al", "dar"];
      let nomAr = ar[0] || "", preAr = ar.slice(1).join(" ");
      if (ar.length >= 3 && partAR.includes(arNorm(ar[0]))){ nomAr = ar[0] + " " + ar[1]; preAr = ar.slice(2).join(" "); }
      let nom = frM[0] || "", pre = frM.slice(1).join(" ");
      if (frM.length >= 3 && partFR.includes(frM[0].toLowerCase())){ nom = frM[0] + " " + frM[1]; pre = frM.slice(2).join(" "); }
      elevesDe(cid).push({ id:uidEl(), nom:nom, prenom:pre, groupe:grp, pc:pc, nomAr:nomAr, prenomAr:preAr });
      n++;
      return;
    }
    elevesDe(cid).push({ id:uidEl(), nom:p[0], prenom:p[1]||"", groupe:parseInt(p[2],10)||1, pc:p[3]||"", nomAr:"", prenomAr:"" });
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
  const ordre = ["", "p", "a", "e", "s", "b", "r"];
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
function trimestreEleve(cid, iso){
  const sessions = window.SESSIONS && window.SESSIONS[cid];
  const plan = window.STI_DATA && window.STI_DATA['repartition' + cid];
  if (window.STI_CAHIER_DEFAULTS && (Array.isArray(plan) || Array.isArray(sessions))){
    const sessionMap = Array.isArray(sessions) ? { [cid]:sessions } : {};
    const planMap = Array.isArray(plan) ? { [cid]:plan } : {};
    return window.STI_CAHIER_DEFAULTS.currentTrimester(sessionMap, iso, planMap);
  }
  return window.triOf ? window.triOf(iso) : 1;
}
function trimestreCourantEleve(cid){ return trimestreEleve(cid, todayISO()); }
function competencesOfficielles(cid){
  const data = window.STI_DATA && window.STI_DATA.competences;
  if (data && Array.isArray(data[cid]) && data[cid].length) return data[cid];
  const seen = new Set();
  return epreuvesDe(cid).flatMap(exam => Array.isArray(exam.tags) ? exam.tags : [])
    .map(tag => String(tag||'').trim()).filter(tag => {
      const key=tag.toLowerCase();
      if(!key||seen.has(key))return false;seen.add(key);return true;
    }).map(tag => ({code:'notion:'+tag,domaine:'Notion évaluée',t:tag,attendu:[]}));
}
function etatCompetenceEleve(cid, eid, tri, code){
  const student = elevesDe(cid).find(item => item.id === eid);
  return student && student.competences && student.competences[String(tri)]
    ? student.competences[String(tri)][code] || '' : '';
}
function setCompetenceEleve(cid, eid, tri, code, status){
  if (!requireStudentAccount()) return;
  tri=Number(tri);
  const student = elevesDe(cid).find(item => item.id === eid);
  if (!student || ![1,2,3].includes(tri) || !competencesOfficielles(cid).some(item => item.code === code)) return;
  const allowed = ['', 'acquis', 'en-cours', 'renforcer'];
  if (!allowed.includes(status)) return;
  if (!student.competences || typeof student.competences !== 'object' || Array.isArray(student.competences)) student.competences = {};
  if (!student.competences[String(tri)] || typeof student.competences[String(tri)] !== 'object' || Array.isArray(student.competences[String(tri)])) student.competences[String(tri)] = {};
  if (status) student.competences[String(tri)][code] = status;
  else delete student.competences[String(tri)][code];
  save(true); toast('Progression enregistrée');
}
function bulletinPourEleve(cid, student, tri){
  const exams = epreuvesDe(cid).filter(exam => exam.date && trimestreEleve(cid, exam.date) === Number(tri))
    .slice().sort((a,b) => String(a.date).localeCompare(String(b.date)));
  const attendance = Object.keys(presencesDe(cid)).sort().filter(date => trimestreEleve(cid,date) === Number(tri))
    .map(date => ({ date:date, status:(presencesDe(cid)[date] || {})[student.id] || '' }));
  const competencyStatus = student.competences && student.competences[String(tri)] || {};
  return window.STI_STUDENT_REPORTS.summarizeBulletin({
    studentId:student.id, exams:exams, gradeRecords:store.notes || {}, attendance:attendance,
    competencies:competencesOfficielles(cid), competencyStatus:competencyStatus
  });
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
  if (window.isProfessorConnected && !window.isProfessorConnected()){
    zone.innerHTML = '<section class="private-empty-state" role="status"><h2>Connexion requise</h2><p>Les classes et données personnelles apparaîtront après connexion.</p></section>';
    return;
  }
  const cid = elClasseCourante();
  const c = cid ? classeDe(cid) : null;
  const vues = [
    ["roster",   "Élèves",            "users"],
    ["presence", "Présences",         "check"],
    ["epreuves", "Épreuves & notes",  "pen"],
    ["faibles",  "Points faibles",    "target"],
    ["competences", "Compétences",    "target"],
    ["bulletins", "Bulletins",        "file"]
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
  if (elVue === "competences") return vueCompetences(cid);
  if (elVue === "bulletins") return vueBulletins(cid);
  return vueRoster(cid);
}
function requireStudentAccount(){
  if (window.isProfessorConnected && window.isProfessorConnected()) return true;
  if (window.openAuth) window.openAuth();
  return false;
}
function studentCsvDialog(){
  let dialog = document.getElementById("student-csv-dialog");
  if (!dialog){
    dialog = document.createElement("dialog");
    dialog.id = "student-csv-dialog";
    dialog.className = "student-csv-dialog";
    dialog.setAttribute("aria-labelledby","student-csv-title");
    document.body.appendChild(dialog);
  }
  return dialog;
}
function afficherApercuCSV(options){
  const dialog = studentCsvDialog();
  const rows = options.rows || [];
  const errors = options.errors || [];
  const preview = rows.slice(0,8).map(row => `<tr>${row.cells.map(cell => `<td>${escapeHtml(String(cell == null ? "" : cell))}</td>`).join("")}</tr>`).join("");
  dialog.innerHTML = `<div class="student-csv-box">
    <div class="student-csv-head"><div><div class="student-csv-kicker">IMPORT CSV — APERÇU</div><h2 id="student-csv-title">${escapeHtml(options.title || "Vérifier les données")}</h2></div><button class="btn btn-xs btn-line" type="button" data-csv-cancel>Fermer</button></div>
    <div class="student-csv-body"><p>${escapeHtml(options.summary || "Vérifiez les lignes avant de les appliquer.")}</p>
      ${errors.length ? `<div class="note rose"><strong>${errors.length} erreur(s) :</strong><ul>${errors.slice(0,8).map(error => `<li>${escapeHtml(error)}</li>`).join("")}</ul>${errors.length>8?`<span class="tiny">et ${errors.length-8} autre(s)…</span>`:""}</div>` : `<div class="note">Aucune erreur détectée. Aucune ligne ou note n’est modifiée avant votre confirmation.</div>`}
      ${preview ? `<div class="tbl-wrap student-csv-preview"><table class="tbl"><thead><tr>${options.headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${preview}</tbody></table>${rows.length>8?`<p class="tiny muted">Aperçu de 8 lignes sur ${rows.length}.</p>`:""}</div>` : ""}
    </div><div class="student-csv-actions"><button class="btn btn-line" type="button" data-csv-cancel>Annuler</button><button class="btn btn-blue" type="button" data-csv-apply ${errors.length || !rows.length?"disabled":""}>${escapeHtml(options.applyLabel || "Appliquer l’import")}</button></div>
  </div>`;
  dialog.querySelectorAll("[data-csv-cancel]").forEach(button => button.addEventListener("click",() => dialog.close()));
  const apply = dialog.querySelector("[data-csv-apply]");
  apply.addEventListener("click",() => {
    try { if (options.onApply() !== false) dialog.close(); }
    catch(error){ toast(error && error.message ? error.message : "L’import n’a pas pu être appliqué."); }
  });
  if (!dialog.open) dialog.showModal();
  (apply.disabled ? dialog.querySelector("[data-csv-cancel]") : apply).focus();
}
function lireFichierCSV(input, callback){
  const file = input && input.files && input.files[0];
  if (!file) return;
  const finish = text => { input.value = ""; callback(String(text || ""),file); };
  if (typeof file.text === "function") file.text().then(finish).catch(() => { input.value=""; toast("Impossible de lire ce fichier CSV"); });
  else {
    const reader = new FileReader();
    reader.onload = () => finish(reader.result);
    reader.onerror = () => { input.value=""; toast("Impossible de lire ce fichier CSV"); };
    reader.readAsText(file,"UTF-8");
  }
}
function telechargerCSV(nom, contenu){
  const url = URL.createObjectURL(new Blob([contenu],{type:"text/csv;charset=utf-8"}));
  const link = document.createElement("a"); link.href=url; link.download=nom; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url),1500);
}
function exporterRosterCSV(cid){
  if (!requireStudentAccount()) return;
  telechargerCSV("eleves-" + cid + "-" + todayISO() + ".csv",window.STI_STUDENT_CSV.exportRoster(triEleves(elevesDe(cid))));
}
function importerRosterCSV(cid,input){
  if (!requireStudentAccount()) return;
  lireFichierCSV(input,(text,file) => {
    const plan = window.STI_STUDENT_CSV.planRosterImport(text,elevesDe(cid),classeDe(cid).groupes || 4);
    const rows = plan.rows.map(row => {
      const current=row.matchId?elevesDe(cid).find(student=>student.id===row.matchId):null;
      const previewStudent=Object.assign({},current||{},row.student);
      const actionLabel=row.action==="delete"?"Suppression":row.action==="add"?"Nouvel élève":"Mise à jour";
      return {
        action:row.action,
        student:row.student,
        cells:[actionLabel,(previewStudent.nom||"") + " " + (previewStudent.prenom||""),previewStudent.groupe||1,previewStudent.pc||""]
      };
    });
    afficherApercuCSV({
      title:"Importer la liste de " + classeDe(cid).nom,
      summary:file.name + " — " + plan.adds + " ajout(s), " + plan.updates + " mise(s) à jour, " + plan.deletes + " suppression(s) explicite(s). Laissez action vide pour ajouter ou mettre à jour; écrivez « supprimer » avec l’ID pour retirer un élève. Les champs vides et les élèves absents du fichier sont conservés; les notes et présences historiques ne sont pas supprimées.",
      applyLabel:plan.deletes?"Confirmer l’import et les suppressions":"Appliquer l’import",
      headers:["Action","Élève","Groupe","N° PC"],rows,errors:plan.errors,
      onApply:() => {
        if (!requireStudentAccount()) return false;
        const current = elevesDe(cid);
        const staleRow=plan.rows.find(row=>["update","delete"].includes(row.action)&&!current.some(student=>student.id===row.matchId));
        if(staleRow){toast("La liste a changé depuis l’aperçu. Réimportez le fichier avant de confirmer.");return false;}
        let deleted=0;
        plan.rows.forEach(row => {
          const index = current.findIndex(student => student.id === row.matchId);
          if(row.action==="delete"){current.splice(index,1);deleted++;}
          else if(row.action === "update") current[index] = Object.assign({},current[index],row.student);
          else if(row.action === "add") current.push(Object.assign({id:uidEl()},row.student));
        });
        save(true); renderEleves();
        toast(plan.adds + " ajout(s), " + plan.updates + " mise(s) à jour, " + deleted + " retrait(s) — historique conservé");
      }
    });
  });
}
function exporterNotesCSV(cid,eid){
  if (!requireStudentAccount()) return;
  const exam = epreuvesDe(cid).find(item => item.id === eid); if (!exam) return;
  telechargerCSV("notes-" + cid + "-" + eid + "-" + todayISO() + ".csv",window.STI_STUDENT_CSV.exportGrades(exam,triEleves(elevesDe(cid)),store.notes[eid] || {}));
}
function importerNotesCSV(cid,eid,input){
  if (!requireStudentAccount()) return;
  const exam = epreuvesDe(cid).find(item => item.id === eid); if (!exam) return;
  lireFichierCSV(input,(text,file) => {
    const plan = window.STI_STUDENT_CSV.planGradeImport(text,exam,elevesDe(cid));
    const rows = plan.rows.map(row => ({
      cells:[row.student.nom + " " + row.student.prenom,row.action === "note" ? row.note + "/" + (exam.bareme||20) : row.action === "absent" ? "Absent(e)" : "Effacer la note"]
    }));
    afficherApercuCSV({
      title:"Importer les notes — " + exam.titre,
      summary:file.name + " — " + rows.length + " modification(s) proposée(s). Les cellules vides ne changent rien; utilisez la colonne « effacer » pour supprimer explicitement une note.",
      headers:["Élève","Modification"],rows,errors:plan.errors,
      onApply:() => {
        if (!requireStudentAccount()) return false;
        store.notes[eid] = store.notes[eid] || {};
        plan.rows.forEach(row => {
          if (row.action === "clear") delete store.notes[eid][row.id];
          else if (row.action === "absent") store.notes[eid][row.id] = {abs:true};
          else store.notes[eid][row.id] = {n:row.note};
        });
        save(true); renderEleves(); toast(plan.rows.length + " ligne(s) de notes importée(s)");
      }
    });
  });
}
function vueRoster(cid){
  const c = classeDe(cid);
  const els = triEleves(elevesDe(cid));
  return `<div class="card">
    <div class="card-h"><h3>${ic("users")} Élèves — ${escapeHtml(c.nom)}</h3>
      <div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end"><span class="badge b-grey">${els.length} inscrit(s)</span>
        <button class="btn btn-xs btn-line" onclick="exporterRosterCSV('${cid}')">Exporter CSV</button>
        <button class="btn btn-xs btn-soft" onclick="document.getElementById('roster-csv-${cid}').click()">Importer CSV</button>
        <input id="roster-csv-${cid}" type="file" accept=".csv,text/csv" style="display:none" onchange="importerRosterCSV('${cid}',this)">
      </div></div>
    <div class="card-b">
      <div class="scan-grid">
        <div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end">
          <div><label class="f">Nom</label><input id="el-nom" placeholder="Ben Ali"></div>
          <div><label class="f">Prénom</label><input id="el-pre"></div>
          <div><label class="f">Nom en arabe</label><input id="el-nom-ar" dir="rtl" placeholder="الترابلسي"></div>
          <div><label class="f">Prénom en arabe</label><input id="el-pre-ar" dir="rtl" placeholder="أحمد"></div>
          <div><label class="f">Groupe</label><input id="el-grp" type="number" min="1" max="${c.groupes||2}" value="1" style="width:80px"></div>
          <div><label class="f">N° PC</label><input id="el-pc" style="width:90px" placeholder="P12"></div>
          <button class="btn btn-blue" onclick="addEleve('${cid}')">${ic("plus")} Ajouter</button>
        </div>
        <div class="scan-box" id="scan-box">
          <div style="font-weight:700;font-size:14px;margin-bottom:2px">📷 Scan d'une feuille de présence</div>
          <p class="tiny muted" style="margin:0 0 8px">Photographiez la liste écrite des élèves : les noms en arabe sont reconnus, conservés en arabe et transcrits en français, puis proposés à la relecture ci-dessous.</p>
          <button class="btn btn-sm" style="background:var(--navy);color:#fff;border-color:var(--navy);width:100%" onclick="scanFeuille('${cid}')" title="La photo est lue par reconnaissance de texte, puis proposée à la relecture">📷 Prendre / choisir la photo</button>
          <button class="btn btn-xs btn-line" style="width:100%;margin-top:6px" onclick="scanTestMoteur()" title="Vérifie que le moteur de lecture classique fonctionne bien sur cet appareil">🧪 Tester le lecteur classique</button>
          <input type="file" id="scan-input" accept="image/*" capture="environment" style="display:none" onchange="scanFichier('${cid}',this)">
          <ol class="scan-ets" id="scan-ets">
            <li id="scan-et-1" class="scan-et"><span class="ic">○</span><span class="t">Photo choisie</span></li>
            <li id="scan-et-2" class="scan-et"><span class="ic">○</span><span class="t">Moteur de lecture chargé</span></li>
            <li id="scan-et-3" class="scan-et"><span class="ic">○</span><span class="t">Démarrage du lecteur</span></li>
            <li id="scan-et-4" class="scan-et"><span class="ic">○</span><span class="t">Langues arabe + français prêtes</span></li>
            <li id="scan-et-5" class="scan-et"><span class="ic">○</span><span class="t">Lecture du texte</span><span class="scan-bw"><i id="scan-pct"></i></span></li>
            <li id="scan-et-6" class="scan-et"><span class="ic">○</span><span class="t">Analyse de la liste</span></li>
          </ol>
          <div id="scan-err" class="hidden" style="margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--rose-bg);border:1px solid var(--rose-line);color:#8f1f33;font-size:13px"></div>
        </div>
      </div>
      <details class="acc" style="margin-bottom:12px"><summary>Ajout rapide en masse (une ligne par élève : Nom ; Prénom ; Groupe ; PC)</summary>
        <div style="padding:10px 0">
          <textarea id="el-lot" rows="4" style="width:100%" placeholder="Trabelsi ; Ahmed ; 1 ; P01&#10;الترابلسي أحمد ; Trabelsi Ahmed&#10;Gharbi ; Salma ; 2 ; P02"></textarea>
          <button class="btn btn-sm btn-blue" style="margin-top:8px" onclick="addElevesLot('${cid}')">Ajouter la liste</button>
        </div></details>
      ${els.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr>
        <th style="width:46px">#</th><th>Nom &amp; prénom</th><th style="width:90px">Groupe</th><th style="width:90px">PC</th>
        <th style="width:110px">Absences</th><th style="width:60px"></th></tr></thead><tbody>
        ${els.map((e,i) => {
          const abs = nbAbsences(cid, e.id);
          return `<tr><td class="n">${i+1}</td><td><strong>${escapeHtml(e.nom)}</strong>${e.prenom ? " " + escapeHtml(e.prenom) : ""}${(e.nomAr || e.prenomAr) ? '<div class="ar-nom" dir="rtl">' + escapeHtml([e.nomAr, e.prenomAr].filter(Boolean).join(" ")) + '</div>' : ""}</td>
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
  const nb = { p:0, a:0, e:0, s:0, b:0, r:0 };
  Object.values(jour).forEach(v => { if (nb[v] !== undefined) nb[v]++; });
  const dates = Object.keys(presencesDe(cid)).sort().reverse().slice(0, 8);
  return `<div class="card">
    <div class="card-h"><h3>${ic("check")} Présences — ${escapeHtml(c.nom)}</h3>
      <div class="row" style="gap:8px">
      <button class="btn btn-xs" style="background:var(--navy);color:#fff;border-color:var(--navy)" onclick="vocOuvrir('${cid}',document.getElementById('pr-date').value)" title="Dictée des états : absent, exclu, sorti, entrée par billet, présent, retard">🎤 Pointer à la voix</button>
      <input type="date" id="pr-date" value="${iso}" onchange="renderEleves(elDate=this.value)">
      <button class="btn btn-xs btn-blue" onclick="setAllPresent('${cid}',document.getElementById('pr-date').value)">Tous présents</button>
      <button class="btn btn-xs btn-line" onclick="clearPresence('${cid}',document.getElementById('pr-date').value)">Vider</button></div></div>
    <div class="card-b">
      ${els.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Élève</th><th style="width:90px">PC</th><th style="width:210px">Statut (cliquer pour changer)</th></tr></thead><tbody>
        ${els.map(e => {
          const st = jour[e.id] || "";
          return `<tr><td><strong>${escapeHtml(e.nom)}</strong> ${escapeHtml(e.prenom||"")} <span class="tiny muted">Gr. ${e.groupe||1}</span></td>
          <td>${e.pc ? escapeHtml(e.pc) : "—"}</td>
          <td><button class="btn btn-xs ${st?"btn-blue":"btn-line"}" style="${st==="p"?"background:var(--green);border-color:var(--green)":st==="a"?"background:var(--rose);border-color:var(--rose);color:#fff":st==="e"?"background:#a51f38;border-color:#a51f38;color:#fff":st==="s"?"background:var(--amber);border-color:var(--amber);color:#fff":st==="b"?"background:var(--blue-2);border-color:var(--blue-2);color:#fff":st==="r"?"background:var(--amber-bg);color:var(--amber);border-color:var(--amber-line)":""}" onclick="cyclePresence('${cid}','${iso}','${e.id}')">${LIB_P[st]||"non marqué"}</button></td></tr>`;
        }).join("")}
      </tbody></table></div>
      <div class="row" style="gap:8px;margin-top:10px">
        <span class="badge b-green">${nb.p} présent(s)</span><span class="badge" style="background:var(--rose-bg);color:#a51f38;border-color:var(--rose-line)">${nb.a} absent(s)</span>${nb.e?'<span class="badge" style="background:#a51f38;color:#fff;border-color:#a51f38">'+nb.e+' exclu(s)</span>':""}${nb.s?'<span class="badge b-amber">'+nb.s+' sorti(s)</span>':""}${nb.b?'<span class="badge b-blue">'+nb.b+' par billet</span>':""}<span class="badge b-amber">${nb.r} retard(s)</span>
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
            <div class="row" style="gap:6px;flex-wrap:wrap">
              ${moyC !== null ? '<span class="badge b-blue">moy. classe ' + moyC.toFixed(2) + ' /' + e.bareme + '</span>' : ""}
              <span class="tiny muted">${vals.length}/${nbEl} notés</span>
              <button class="btn btn-xs ${ouverte?"btn-blue":"btn-soft"}" onclick="renderEleves(elEpreuve='${ouverte?"":e.id}')">${ouverte?"Fermer":"Saisir les notes"}</button>
              <button class="btn btn-xs btn-line" onclick="exporterNotesCSV('${cid}','${e.id}')" title="Exporter le modèle de notes CSV">Exporter CSV</button>
              <button class="btn btn-xs btn-line" onclick="document.getElementById('notes-csv-${e.id}').click()" title="Prévisualiser un fichier de notes avant import">Importer CSV</button>
              <input id="notes-csv-${e.id}" type="file" accept=".csv,text/csv" style="display:none" onchange="importerNotesCSV('${cid}','${e.id}',this)">
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
function vueCompetences(cid){
  const els = triEleves(elevesDe(cid));
  const student = els.find(item => item.id === elEleve) || els[0] || null;
  if (!elTriCompetence || ![1,2,3].includes(Number(elTriCompetence))) elTriCompetence = trimestreCourantEleve(cid);
  const tri = Number(elTriCompetence);
  const definitions = competencesOfficielles(cid);
  const states = student ? (student.competences && student.competences[String(tri)] || {}) : {};
  const counts = { acquis:0, 'en-cours':0, renforcer:0, non:0 };
  definitions.forEach(item => { const state=states[item.code]||''; if(state) counts[state]++; else counts.non++; });
  const classSummary = definitions.map(item => {
    const values = { acquis:0, 'en-cours':0, renforcer:0, non:0 };
    els.forEach(el => { const state=etatCompetenceEleve(cid,el.id,tri,item.code)||''; if(state) values[state]++; else values.non++; });
    return { item, values };
  });
  return `<div class="card">
    <div class="card-h"><h3>${ic("target")} Progression par compétence — ${escapeHtml(classeDe(cid).nom)}</h3><div class="row" style="gap:8px;flex-wrap:wrap">
      <label class="tiny muted" for="competence-term">Trimestre</label><select id="competence-term" style="width:auto" onchange="renderEleves(elTriCompetence=Number(this.value))">${[1,2,3].map(n=>`<option value="${n}" ${tri===n?"selected":""}>T${n}${n===trimestreCourantEleve(cid)?" — en cours":""}</option>`).join("")}</select>
      ${student ? elSelEleve(cid,student) : ""}</div></div>
    <div class="card-b">
      ${!student ? '<p class="tiny muted">Ajoutez d’abord des élèves dans la vue « Élèves ».</p>' : !definitions.length ? '<p class="tiny muted">Ajoutez des notions aux épreuves de cette classe pour les suivre ici par élève.</p>' : `
        <p class="tiny muted">Évaluez chaque compétence pour ${escapeHtml(student.prenom ? student.prenom + " " : "")}${escapeHtml(student.nom)}. Les états sont enregistrés par élève et par trimestre, dans votre espace privé.</p>
        <div class="row" style="gap:7px;flex-wrap:wrap;margin:10px 0 14px"><span class="badge b-green">${counts.acquis} acquis(es)</span><span class="badge b-blue">${counts["en-cours"]} en cours</span><span class="badge b-amber">${counts.renforcer} à renforcer</span><span class="badge b-grey">${counts.non} non évaluée(s)</span></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th style="width:70px">Code</th><th>Compétence</th><th style="width:190px">État</th></tr></thead><tbody>${definitions.map(item=>{
          const state=states[item.code]||'';
          const codeArg=escapeHtml(JSON.stringify(String(item.code)));
          const expected=Array.isArray(item.attendu)?item.attendu:[];
          return `<tr><td><span class="badge b-grey">${escapeHtml(item.code)}</span></td><td><strong>${escapeHtml(item.t||item.code)}</strong><div class="tiny muted">${escapeHtml(item.domaine||'')}</div>${expected.length?`<details style="margin-top:5px"><summary class="tiny">Attendus</summary><ul class="tiny">${expected.map(text=>`<li>${escapeHtml(text)}</li>`).join("")}</ul></details>`:""}</td>
            <td><select aria-label="État de ${escapeHtml(item.t||item.code)}" onchange="setCompetenceEleve('${cid}','${student.id}',${tri},${codeArg},this.value)"><option value="" ${!state?"selected":""}>Non évaluée</option><option value="acquis" ${state==="acquis"?"selected":""}>Acquis</option><option value="en-cours" ${state==="en-cours"?"selected":""}>En cours</option><option value="renforcer" ${state==="renforcer"?"selected":""}>À renforcer</option></select></td></tr>`;
        }).join("")}</tbody></table></div>`}
      ${definitions.length ? `<h4 style="margin:18px 0 7px">Synthèse de la classe — T${tri} (${els.length} élèves)</h4><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Compétence</th><th>Acquis</th><th>En cours</th><th>À renforcer</th><th>Non évaluée</th></tr></thead><tbody>${classSummary.map(row=>`<tr><td><strong>${escapeHtml(row.item.code)}</strong> — ${escapeHtml(row.item.t||row.item.code)}</td><td>${row.values.acquis}</td><td>${row.values["en-cours"]}</td><td>${row.values.renforcer}</td><td>${row.values.non}</td></tr>`).join("")}</tbody></table></div>` : ""}
    </div></div>`;
}
function saveBulletinComment(cid,eid,tri,comment){
  if(!requireStudentAccount())return;
  const student=elevesDe(cid).find(item=>item.id===eid); if(!student) return;
  const value=String(comment||'').trim();
  student.bulletinCommentaires=student.bulletinCommentaires||{};
  if(value)student.bulletinCommentaires[String(tri)]=value;
  else delete student.bulletinCommentaires[String(tri)];
  save(true); toast("Appréciation du bulletin enregistrée");
}
function vueBulletins(cid){
  const els=triEleves(elevesDe(cid));
  const student=els.find(item=>item.id===elEleve)||els[0]||null;
  if(!elTriBulletin||![1,2,3].includes(Number(elTriBulletin)))elTriBulletin=trimestreCourantEleve(cid);
  const tri=Number(elTriBulletin);
  const data=student?bulletinPourEleve(cid,student,tri):null;
  const comment=student&&student.bulletinCommentaires?student.bulletinCommentaires[String(tri)]||'':'';
  const statusLabel={acquis:'Acquis','en-cours':'En cours',renforcer:'À renforcer','':'Non évaluée'};
  return `<div class="card">
    <div class="card-h"><h3>${ic("file")} Bulletins trimestriels — ${escapeHtml(classeDe(cid).nom)}</h3><div class="row" style="gap:8px;flex-wrap:wrap">
      <label class="tiny muted" for="bulletin-term">Trimestre</label><select id="bulletin-term" style="width:auto" onchange="renderEleves(elTriBulletin=Number(this.value))">${[1,2,3].map(n=>`<option value="${n}" ${tri===n?"selected":""}>T${n}${n===trimestreCourantEleve(cid)?" — en cours":""}</option>`).join("")}</select>
      ${student?elSelEleve(cid,student):""}</div></div>
    <div class="card-b">
      ${!student?'<p class="tiny muted">Ajoutez d’abord des élèves dans la vue « Élèves ».</p>':`
      <div class="grid g3" style="margin-bottom:14px">
        <div class="kpi"><div class="lbl">Moyenne du trimestre</div><div class="val" style="color:${coulNote(data.average)}">${data.average===null?"—":data.average.toFixed(2)}<small> /20</small></div><div class="foo">${data.gradeCount} note(s) prise(s) en compte</div></div>
        <div class="kpi k-amber"><div class="lbl">Absences pointées</div><div class="val">${data.presence.absences}</div><div class="foo">${data.presence.pointages} pointage(s) enregistré(s)</div></div>
        <div class="kpi k-teal"><div class="lbl">Compétences acquises</div><div class="val">${data.skillCounts.acquis}/${data.skills.length}</div><div class="foo">${data.skillCounts["en-cours"]} en cours · ${data.skillCounts.renforcer} à renforcer</div></div>
      </div>
      <h4 style="margin:12px 0 7px">Notes du trimestre</h4><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Épreuve</th><th>Date</th><th>Note</th><th>Sur 20</th></tr></thead><tbody>
        ${data.grades.length?data.grades.map(grade=>`<tr><td>${escapeHtml(grade.titre)}</td><td>${grade.date?fmtShort(grade.date):"—"}</td><td>${grade.absent?'<span class="badge b-amber">Absent(e)</span>':grade.note===null?"—":`${grade.note} / ${grade.bareme}`}</td><td>${grade.sur20===null?"—":grade.sur20.toFixed(1)}</td></tr>`).join(""):'<tr><td colspan="4" class="tiny muted">Aucune épreuve datée dans ce trimestre.</td></tr>'}
      </tbody></table></div>
      <div class="row" style="gap:7px;flex-wrap:wrap;margin:10px 0"><span class="badge b-green">${data.presence.presents} présent(s)</span><span class="badge b-rose">${data.presence.absences} absent(s)</span><span class="badge b-amber">${data.presence.retards} retard(s)</span><span class="badge b-grey">${data.presence.exclus} exclu(s) · ${data.presence.sorties} sortie(s) · ${data.presence.billets} billet(s)</span></div>
      <h4 style="margin:14px 0 7px">Compétences</h4><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Code</th><th>Compétence</th><th>État</th></tr></thead><tbody>
        ${data.skills.length?data.skills.map(skill=>`<tr><td>${escapeHtml(skill.code)}</td><td>${escapeHtml(skill.titre)}</td><td><span class="badge ${skill.status==="acquis"?"b-green":skill.status==="renforcer"?"b-amber":skill.status==="en-cours"?"b-blue":"b-grey"}">${statusLabel[skill.status]}</span></td></tr>`).join(""):'<tr><td colspan="3" class="tiny muted">Aucun référentiel de compétences pour cette classe.</td></tr>'}
      </tbody></table></div>
      <div style="margin-top:14px"><label class="f" for="bulletin-comment">Appréciation du professeur (facultative)</label><textarea id="bulletin-comment" maxlength="1200" placeholder="Commentaire pour le bulletin…">${escapeHtml(comment)}</textarea></div>
      <div class="row no-print" style="gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn btn-line" onclick="saveBulletinComment('${cid}','${student.id}',${tri},document.getElementById('bulletin-comment').value)">${ic("check")} Enregistrer l’appréciation</button><button class="btn btn-blue" onclick="imprimerBulletin('${cid}','${student.id}',${tri})">${ic("print")} Imprimer / enregistrer en PDF</button></div>
      <p class="tiny muted no-print" style="margin-top:8px">Le PDF s’ouvre dans la fenêtre d’impression du navigateur. Choisissez « Enregistrer en PDF ». L’appréciation est enregistrée dans les données privées de cette classe.</p>
      `}
    </div></div>`;
}
function htmlBulletin(cid,student,tri,data,comment){
  const c=classeDe(cid),profile=window.activeProfessorProfile?window.activeProfessorProfile():{};
  const school=window.SCHOOL&&window.SCHOOL.lycee||"Établissement scolaire";
  const teacher=profile&&profile.nom||window.authUser&&window.authUser()||"Professeur";
  const trimester=tri===1?"1er trimestre":tri+"e trimestre";
  const statuses={acquis:"Acquis",'en-cours':"En cours",renforcer:"À renforcer",'':"Non évaluée"};
  const marks=data.grades.map(grade=>`<tr><td>${escapeHtml(grade.titre)}</td><td>${grade.date?fmtShort(grade.date):"—"}</td><td>${grade.absent?"Absent(e)":grade.note===null?"—":escapeHtml(grade.note+" / "+grade.bareme)}</td><td>${grade.sur20===null?"—":grade.sur20.toFixed(1)+" / 20"}</td></tr>`).join("")||'<tr><td colspan="4">Aucune note enregistrée pour ce trimestre.</td></tr>';
  const skills=data.skills.map(skill=>`<tr><td>${escapeHtml(skill.code)}</td><td>${escapeHtml(skill.titre)}</td><td>${escapeHtml(skill.domaine)}</td><td>${statuses[skill.status]}</td></tr>`).join("")||'<tr><td colspan="4">Référentiel de compétences non disponible.</td></tr>';
  const signature=window.STI_SIGNATURE&&profile&&profile.signature?window.STI_SIGNATURE.toMarkup(String(profile.signature)):"";
  const name=(student.prenom?student.prenom+" ":"")+student.nom;
  const arabic=[student.prenomAr,student.nomAr].filter(Boolean).join(" ");
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bulletin — ${escapeHtml(name)} — ${escapeHtml(trimester)}</title><style>
    *{box-sizing:border-box}body{font:14px/1.45 Arial,sans-serif;color:#172b42;margin:28px auto;max-width:900px;padding:0 24px}header{border-bottom:3px solid #164f7b;padding-bottom:16px;margin-bottom:18px}h1{font-size:25px;margin:0 0 4px}h2{font-size:17px;margin:22px 0 8px;color:#164f7b}.muted{color:#5b6e7f}.top{display:flex;justify-content:space-between;gap:18px}.meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:18px 0}.meta div,.stat{border:1px solid #d5e0e8;border-radius:9px;padding:10px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stat strong{display:block;font-size:20px;color:#164f7b}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd7df;padding:8px;text-align:left}th{background:#eef4f8}.comment{min-height:74px;border:1px solid #cbd7df;border-radius:8px;padding:10px;white-space:pre-wrap}.signature{margin:20px 0 0;text-align:right;min-height:70px}.signature svg{width:180px;height:70px}.print{margin:0 0 18px;padding:8px 13px;background:#164f7b;color:white;border:0;border-radius:7px;font:inherit;cursor:pointer}.ar{direction:rtl;text-align:right;font-size:17px;margin-top:4px}@media print{body{margin:0 auto;padding:0}.print{display:none}h2{break-after:avoid}table,header,.stats{break-inside:avoid}}
    </style></head><body><button class="print" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
    <header><div class="top"><div><div class="muted">${escapeHtml(school)}</div><h1>Bulletin individuel — ${escapeHtml(trimester)}</h1><div class="muted">Sciences et technologies de l’informatique · Année scolaire 2026–2027</div></div><div style="text-align:right"><strong>${escapeHtml(c.nom)}</strong><div class="muted">Professeur : ${escapeHtml(teacher)}</div></div></div></header>
    <section class="meta"><div><strong>Élève</strong><div>${escapeHtml(name)}</div>${arabic?`<div class="ar">${escapeHtml(arabic)}</div>`:""}</div><div><strong>Groupe / poste</strong><div>Groupe ${escapeHtml(student.groupe||1)}${student.pc?" · PC "+escapeHtml(student.pc):""}</div></div></section>
    <section class="stats"><div class="stat"><span>Moyenne du trimestre</span><strong>${data.average===null?"—":data.average.toFixed(2)+" / 20"}</strong><span class="muted">${data.gradeCount} note(s)</span></div><div class="stat"><span>Absences pointées</span><strong>${data.presence.absences}</strong><span class="muted">${data.presence.pointages} pointage(s) saisi(s)</span></div><div class="stat"><span>Compétences acquises</span><strong>${data.skillCounts.acquis} / ${data.skills.length}</strong><span class="muted">${data.skillCounts["en-cours"]} en cours · ${data.skillCounts.renforcer} à renforcer</span></div></section>
    <h2>Résultats</h2><table><thead><tr><th>Épreuve</th><th>Date</th><th>Note</th><th>Sur 20</th></tr></thead><tbody>${marks}</tbody></table>
    <h2>Compétences</h2><table><thead><tr><th>Code</th><th>Compétence</th><th>Domaine</th><th>État</th></tr></thead><tbody>${skills}</tbody></table>
    <h2>Appréciation du professeur</h2><div class="comment">${escapeHtml(comment||"")||"&nbsp;"}</div>
    <div class="signature"><div>Signature du professeur</div>${signature}</div>
    </body></html>`;
}
function imprimerBulletin(cid,eid,tri){
  if(!requireStudentAccount())return;
  const student=elevesDe(cid).find(item=>item.id===eid); if(!student)return;
  const printWindow=window.open("","_blank");
  if(!printWindow){toast("Autorisez les fenêtres contextuelles pour imprimer le bulletin");return;}
  const commentInput=document.getElementById("bulletin-comment");
  const comment=commentInput?commentInput.value:String(student.bulletinCommentaires&&student.bulletinCommentaires[String(tri)]||"");
  student.bulletinCommentaires=student.bulletinCommentaires||{};
  if(String(comment).trim())student.bulletinCommentaires[String(tri)]=String(comment).trim();
  else delete student.bulletinCommentaires[String(tri)];
  save(true);
  const data=bulletinPourEleve(cid,student,tri);
  printWindow.document.open(); printWindow.document.write(htmlBulletin(cid,student,tri,data,comment)); printWindow.document.close();
  printWindow.focus(); setTimeout(()=>printWindow.print(),350);
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

/* ---------- profil, photo privée et badge du professeur connecté ---------- */
function connectedProfessorProfile(){
  return window.activeProfessorProfile?.()||{};
}
function renderSiteProfessorBadge(){
  if(!window.STI_PROF_BADGE?.renderSiteBadge)return;
  const profile=window.isProfessorConnected?.()?connectedProfessorProfile():null;
  window.STI_PROF_BADGE.renderSiteBadge("site-professor-badge",profile,window.STI_PROF_BADGE.activePhotoUrl());
}
function profileBadgeData(){
  const b=document.getElementById("profil-modal"),old=connectedProfessorProfile();
  const value=id=>b&&b.querySelector(id)?b.querySelector(id).value.trim():"";
  const user=authSession()?.user||{};
  return Object.assign({},old,{
    prof_id:user.id||"",
    nom:value("#pf-nom")||old.nom||"",
    fonction:value("#pf-function")||old.fonction||"Professeur",
    matiere:value("#pf-mat")||old.matiere||(window.STI_PROF_BADGE&&window.STI_PROF_BADGE.subject)||"Sciences et technologies de l’informatique",
    signature:window.STI_SIGNATURE?.value("pf-signature-canvas")||"",
    email:authUser(),
    badge_code:old.badge_code||(window.STI_PROF_BADGE&&window.STI_PROF_BADGE.makeBadgeCode(user.id))||""
  });
}
function renderProfileBadgePreview(){
  const data=profileBadgeData();
  window.STI_PROF_BADGE?.renderInto("pf-badge-preview",data,window.STI_PROF_BADGE.activePhotoUrl()||"");
  const required=document.getElementById("pf-photo-required");
  if(required)required.hidden=!!(data.photo_path||window.STI_PROF_BADGE?.activePhotoUrl());
}
async function profilePhotoChanged(input){
  const status=document.getElementById("pf-photo-status"),file=input&&input.files&&input.files[0];
  if(!window.STI_PROF_BADGE)return;
  try{
    await window.STI_PROF_BADGE.setDraftPhoto(file);
    if(status)status.textContent=file?"Portrait sélectionné : "+file.name:"";
    renderProfileBadgePreview();
  }catch(error){
    if(status)status.textContent=error.message||String(error);
    if(input)input.value="";
  }
}
async function openProfil(){
  if(typeof window.isProfessorConnected!=="function"||!window.isProfessorConnected()){openAuth();return;}
  const syncStatus=window.STI_SYNC?.status?.();
  if(window.STI_PROF_BADGE&&navigator.onLine&&syncStatus?.code!=="account")await window.STI_PROF_BADGE.bootstrap();
  const b = document.getElementById("profil-modal"),profile=connectedProfessorProfile();
  if (!b) return;
  window.STI_PROF_BADGE?.clearDraftPhoto();
  b.querySelector("#pf-nom").value = profile.nom || "";
  b.querySelector("#pf-function").value = profile.fonction || "Professeur";
  b.querySelector("#pf-mat").value = (!profile.matiere||profile.matiere==="STI") ? (window.STI_PROF_BADGE?.subject||"Sciences et technologies de l’informatique") : profile.matiere;
  b.querySelector("#pf-photo").value = "";
  const em = b.querySelector("#pf-email");
  if (em) em.textContent = authUser() || "(non connecté)";
  const status=b.querySelector("#pf-photo-status"),error=b.querySelector("#pf-error");
  if(status)status.textContent=profile.photo_path?"Photo de profil enregistrée." : (window.STI_PROF_BADGE?.lastError()?"Vérifiez la migration Supabase du badge : "+window.STI_PROF_BADGE.lastError():"Une photo est nécessaire pour créer le badge.");
  if(error)error.textContent="";
  b.classList.add("on");
  window.STI_SIGNATURE?.attach(b.querySelector("#pf-signature-canvas"),profile.signature||"");
  renderProfileBadgePreview();
  if(profile.photo_path&&window.STI_PROF_BADGE){
    window.STI_PROF_BADGE.loadProfilePhoto(profile.photo_path).then(()=>{
      renderSiteProfessorBadge();
      if(b.classList.contains("on"))renderProfileBadgePreview();
    }).catch(e=>{if(status)status.textContent="Photo indisponible : "+(e.message||e);});
  }
  setTimeout(() => { const f = b.querySelector("#pf-nom"); if (f) f.focus(); }, 60);
}
function closeProfil(){
  const b = document.getElementById("profil-modal"); if (b) b.classList.remove("on");
  window.STI_PROF_BADGE?.clearDraftPhoto();
  renderSiteProfessorBadge();
}
function undoProfileSignature(){window.STI_SIGNATURE?.undo("pf-signature-canvas");}
function clearProfileSignature(){window.STI_SIGNATURE?.clear("pf-signature-canvas");}
async function saveProfil(){

  if(typeof window.isProfessorConnected!=="function"||!window.isProfessorConnected()){closeProfil();openAuth();return;}
  const b = document.getElementById("profil-modal"),error=b.querySelector("#pf-error"),button=b.querySelector("#pf-save");
  const nom = b.querySelector("#pf-nom").value.trim();
  const mat = b.querySelector("#pf-mat").value.trim() || "Sciences et technologies de l’informatique";
  const fonction = b.querySelector("#pf-function").value.trim() || "Professeur";
  const signature = window.STI_SIGNATURE?.value("pf-signature-canvas")||"";
  const photoFile=b.querySelector("#pf-photo").files[0]||null;
  if(error)error.textContent="";
  if (!nom){ if(error)error.textContent="Indiquez votre nom et votre prénom."; return; }
  if(!window.STI_PROF_BADGE){if(error)error.textContent="Module de badge indisponible. Rechargez la page.";return;}
  if(button)button.disabled=true;
  try{
    const saved=await window.STI_PROF_BADGE.saveProfile({
      ...connectedProfessorProfile(),nom:nom,fonction:fonction,matiere:mat,signature:signature,email:authUser()
    },photoFile);
    store.profil=Object.assign({},connectedProfessorProfile(), {
      prof_id:authSession()?.user?.id||"",
      nom:nom,fonction:fonction,matiere:mat,signature:signature,email:authUser(),
      badge_code:saved.badge_code||window.STI_PROF_BADGE.makeBadgeCode(authSession()?.user?.id),
      photo_path:saved.photo_path
    });
    b.querySelector("#pf-photo").value="";
    closeProfil();save();if(typeof applyProfil==="function")applyProfil();renderAll(true);
    toast("Profil et badge enregistrés — "+nom);
  }catch(e){if(error)error.textContent=e.message||String(e);}
  finally{if(button)button.disabled=false;}
}
async function printProfilBadge(){
  if(!window.isProfessorConnected?.()){openAuth();return;}
  try{await window.STI_PROF_BADGE.printBadge(profileBadgeData());}
  catch(error){const status=document.getElementById("pf-photo-status");if(status)status.textContent=error.message||String(error);}
}
/* adapte l'en-tête au professeur connecté */
function applyProfil(){
  const connected=typeof window.isProfessorConnected==="function"&&window.isProfessorConnected();
  const p=connected?connectedProfessorProfile():null;
  renderSiteProfessorBadge();
  const nom=connected?(p&&p.nom?p.nom:(authUser().split("@")[0]||"Professeur")):"Professeur";
  const mat=connected?(p&&p.matiere?p.matiere:SCHOOL.matiere):"";
  const h = document.getElementById("hero-prof");
  if (h) h.textContent = connected ? "Prof. " + nom : "Professeur";
  const classesChip=document.getElementById("hero-classes");
  if(classesChip){classesChip.textContent=connected?"3SI1 & 4SI2":"";classesChip.hidden=!connected;}
  document.title=connected?"Espace pédagogique STI — Prof. "+nom+" | Lycée Rafèha Ariana — 2026/2027":"Espace pédagogique STI — Professeur | Lycée Rafèha Ariana — 2026/2027";
  const w = document.getElementById("bienvenue-prof");
  if (w) w.textContent = connected
    ? "Bonjour, " + ((nom.trim().split(/\s+/)[0]) || "professeur")
    : "Bonjour professeur, veuillez entrer vos données de connexion.";
  const f = document.getElementById("ft-prof");
  if (f) f.textContent = connected ? "Matière " + mat : "";
  const footerName=document.getElementById("ft-prof-name");
  if(footerName)footerName.textContent=connected?"Prof. "+nom:"Professeur";
}

/* ==================================================================
   SCAN D'UNE FEUILLE DE PRÉSENCE (liste des élèves par photo)
   ------------------------------------------------------------------
   La photo est lue par reconnaissance de texte (Tesseract.js, chargé
   une seule fois à la demande, avec worker et noyau explicites) ;
   le résultat est proposé dans la zone « ajout rapide en masse »
   pour RELECTURE avant import. Sans réseau, la saisie manuelle
   reste disponible.
   ================================================================== */
/* ==================================================================
   SCAN D'UNE FEUILLE DE PRÉSENCE (liste des élèves par photo)
   ------------------------------------------------------------------
   Le moteur de lecture (Tesseract.js v5, licence Apache-2.0) est
   EMBARQUÉ dans le site : assets/tesseract/ → plus aucun serveur
   externe (ni CDN), mêmes origines, et lecture possible hors ligne
   après la première utilisation (cache de l'application).
   Chaque étape s'affiche en direct dans la boîte à droite du
   formulaire ; en cas d'échec, le message s'y affiche et la saisie
   manuelle reste disponible en dessous.
   ================================================================== */
const TESS = {
  src:    "assets/tesseract/tesseract.min.js",
  worker: "assets/tesseract/worker.min.js",
  core:   "assets/tesseract/core",
  lang:   "assets/tesseract/lang"
};
function tessURL(p){ return new URL(p, location.href).href; }
let scanCharge = null;
function chargerTesseract(){
  if (window.Tesseract) return Promise.resolve();
  if (scanCharge) return scanCharge;
  scanCharge = new Promise((ok, ko) => {
    const sc = document.createElement("script");
    const nid = setTimeout(() => { scanCharge = null; ko(new Error("chargement trop long (réseau lent ?)")); }, 25000);
    sc.src = tessURL(TESS.src);
    sc.onload = () => { clearTimeout(nid); ok(); };
    sc.onerror = () => { clearTimeout(nid); scanCharge = null; ko(new Error("moteur de lecture introuvable — rechargez la page")); };
    document.head.appendChild(sc);
  });
  return scanCharge;
}
/* ---- boîte d'étapes (à droite du formulaire d'ajout) ---- */
const SCAN_IC = { "-": "○", act: "◕", ok: "✓", err: "✗" };
function scanEtape(n, etat, txt){
  const li = document.getElementById("scan-et-" + n);
  if (!li) return;
  li.className = "scan-et" + (etat === "-" ? "" : " " + etat);
  const ic = li.querySelector(".ic");
  if (ic) ic.textContent = SCAN_IC[etat] || "○";
  if (txt !== undefined){ const t = li.querySelector(".t"); if (t) t.textContent = txt; }
  if (etat === "ok" || etat === "-"){
    const b = document.getElementById("scan-pct");
    if (b && (n !== 5 || etat === "-")) b.style.width = etat === "ok" ? "100%" : "0%";
  }
}
let scanCur = 0;
function scanBoiteReset(){
  for (let i = 1; i <= 6; i++) scanEtape(i, "-");
  const e = document.getElementById("scan-err");
  if (e){ e.classList.add("hidden"); e.textContent = ""; e.style.background = ""; e.style.borderColor = ""; }
  scanCur = 0;
}
function scanBoiteErreur(e){
  if (scanCur >= 1) scanEtape(scanCur, "err");
  const b = document.getElementById("scan-err");
  if (b){
    b.classList.remove("hidden");
    b.textContent = "⚠ " + (e && e.message ? e.message : e) + " — la saisie manuelle ci-dessous reste disponible.";
  }
}
/* ---- déroulé du scan ---- */
/* prétraitement de la photo : recadrage 1600 px max, niveaux de gris, contraste —
   indispensable sur les photos de téléphone (téra-pixels, ombres) : plus rapide
   et beaucoup plus fiable pour le lecteur */
async function scanPreparerImage(f){
  let src = null;
  if (window.createImageBitmap){
    try { src = await createImageBitmap(f); } catch(e){ src = null; }
  }
  const url = URL.createObjectURL(f);
  try {
    if (!src){
      src = await new Promise((ok, ko) => {
        const im = new Image();
        im.onload = () => ok(im);
        im.onerror = () => ko(new Error("photo illisible (format non pris en charge)"));
        im.src = url;
      });
    }
    const lw = src.width || src.naturalWidth, lh = src.height || src.naturalHeight;
    if (!lw || !lh) throw new Error("photo vide");
    const MAX = 1600;
    const ech = Math.min(1, MAX / Math.max(lw, lh));
    const w = Math.max(1, Math.round(lw * ech)), h = Math.max(1, Math.round(lh * ech));
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const cx = cv.getContext("2d");
    cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h);
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high";
    cx.drawImage(src, 0, 0, w, h);
    const im = cx.getImageData(0, 0, w, h); const px = im.data;
    let mn = 255, mx = 0;
    for (let i = 0; i < px.length; i += 4){
      const g = (0.299 * px[i] + 0.587 * px[i+1] + 0.114 * px[i+2]) | 0;
      px[i] = px[i+1] = px[i+2] = g;
      if (g < mn) mn = g;
      if (g > mx) mx = g;
    }
    const amp = Math.max(30, mx - mn);
    for (let i = 0; i < px.length; i += 4){
      px[i] = px[i+1] = px[i+2] = Math.max(0, Math.min(255, ((px[i] - mn) * 255 / amp) | 0));
    }
    cx.putImageData(im, 0, 0);
    const blob = await new Promise(ok => cv.toBlob(ok, "image/png"));
    return blob || f;
  } finally { URL.revokeObjectURL(url); }
}
/* auto-test : vérifie que le moteur lit réellement sur CET appareil */
async function scanTestMoteur(){
  scanBoiteReset();
  const b = document.getElementById("scan-err");
  const aff = (t, bien) => {
    if (!b) return;
    b.classList.remove("hidden");
    b.style.background = bien ? "var(--green-bg)" : "var(--rose-bg)";
    b.style.borderColor = bien ? "var(--green-line)" : "var(--rose-line)";
    b.textContent = t;
  };
  toast("Test du lecteur en cours…");
  try {
    scanCur = 2; scanEtape(2, "act");
    await chargerTesseract();
    scanEtape(2, "ok");
    const cv = document.createElement("canvas"); cv.width = 340; cv.height = 90;
    const cx = cv.getContext("2d");
    cx.fillStyle = "#fff"; cx.fillRect(0, 0, 340, 90);
    cx.fillStyle = "#000"; cx.font = "34px Arial"; cx.fillText("TEST 123 AB", 14, 58);
    const blob = await new Promise(ok => cv.toBlob(ok, "image/png"));
    scanCur = 3; scanEtape(3, "act");
    const wk = await Tesseract.createWorker("fra", 1, {
      workerPath: tessURL(TESS.worker), corePath: tessURL(TESS.core), langPath: tessURL(TESS.lang)
    });
    scanEtape(3, "ok"); scanEtape(4, "ok");
    scanCur = 5; scanEtape(5, "act", "Lecture du test…");
    const r = await wk.recognize(blob);
    try { await wk.terminate(); } catch(e){}
    const txt = ((r.data && r.data.text) || "").toUpperCase();
    scanCur = 5; scanEtape(5, "ok");
    scanCur = 6; scanEtape(6, "act");
    const bien = txt.includes("123");
    scanCur = 6; scanEtape(6, bien ? "ok" : "err", bien ? "Analyse : test réussi" : "Analyse : lecture imprécise");
    aff(bien
      ? "✅ Lecteur opérationnel sur cet appareil (il a lu « TEST 123 »). Si le scan d'une feuille échoue ensuite, le problème vient de la photo : rapprochez le cadrage, lumière régulière, feuille à plat."
      : "⚠ Le lecteur démarre mais lit imprécisément (« " + txt.trim().slice(0, 40) + " »). Appareil lent : laissez la lecture aller au bout (jusqu'à 1 minute) et utilisez une photo nette et bien éclairée.",
      bien);
  } catch(e){
    scanBoiteErreur(e);
  }
}
function scanFeuille(cid){
  const inp = document.getElementById("scan-input");
  if (!inp){ toast("Entrée de scan introuvable"); return; }
  inp.value = "";
  scanBoiteReset();
  inp.click();
}
async function scanFichier(cid, inp){
  const f = inp.files && inp.files[0];
  if (!f) return;
  scanBoiteReset();
  scanCur = 1; scanEtape(1, "act", "Photo choisie — préparation…");
  let img = f;
  try { img = await scanPreparerImage(f); } catch(e){ img = f; }
  scanEtape(1, "ok", "Photo préparée (lisibilité optimisée)");
  toast("Lecture de la feuille… suivez les étapes dans la boîte à droite (10 à 30 s la première fois)");
  try {
    scanCur = 2; scanEtape(2, "act");
    await chargerTesseract();
    scanEtape(2, "ok");
    const wk = await Tesseract.createWorker("ara+fra", 1, {
      workerPath: tessURL(TESS.worker),
      corePath: tessURL(TESS.core),
      langPath: tessURL(TESS.lang),
      logger: s => {
        if (!s || !s.status) return;
        const p = Math.round((s.progress || 0) * 100);
        if (s.status === "loading tesseract core" || s.status === "initializing tesseract"){
          scanCur = 3; scanEtape(3, "act");
        } else if (s.status === "loading language traineddata"){
          scanCur = 4; scanEtape(4, "act", p < 100 ? "Langues (arabe, français) — " + p + " %" : "Langues arabe + français prêtes");
        } else if (s.status === "initializing api"){
          scanCur = 4; scanEtape(4, "ok");
          scanCur = 5; scanEtape(5, "act", "Lecture du texte — 0 %");
        } else if (s.status === "recognizing text"){
          scanCur = 5; scanEtape(5, "act", "Lecture du texte — " + p + " %");
          const b = document.getElementById("scan-pct");
          if (b) b.style.width = p + "%";
        }
      }
    });
    try { await wk.setParameters({ tessedit_pageseg_mode: "6" }); } catch(e){}
    scanEtape(3, "ok");
    scanEtape(4, "ok");
    scanCur = 5; scanEtape(5, "act", "Lecture du texte — 0 %");
    const r = await wk.recognize(img);
    try { await wk.terminate(); } catch(_e){}
    scanEtape(5, "ok");
    scanCur = 6; scanEtape(6, "act");
    scanVersZone(cid, (r.data && r.data.text) || "");
  } catch(e) {
    scanBoiteErreur(e);
    toast("Scanner indisponible : " + (e && e.message ? e.message : e) + " — si cela persiste : menu Compte → « Forcer la mise à jour »");
    const d = document.getElementById("el-lot");
    if (d) d.focus();
  }
}
/* ---- transcription des noms arabes en français (100 % local, aucun serveur) ---- */
const AR_RE = /[\u0600-\u06FF]/;
function arNorm(w){
  return (w || "").replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي");
}
/* dictionnaire des prénoms et noms de famille tunisiens courants */
const AR2FR_MOTS = {};
[["محمد","Mohamed"],["احمد","Ahmed"],["امين","Amine"],["ايمن","Aymen"],["اياد","Eyad"],
 ["ياسين","Yassine"],["ياسر","Yasser"],["يوسف","Youssef"],["يوسر","Yousr"],["يونس","Younes"],
 ["عمر","Omar"],["عيسي","Aissa"],["علي","Ali"],["عادل","Adel"],["ابراهيم","Ibrahim"],
 ["اسماعيل","Ismail"],["اسامة","Oussama"],["انس","Anas"],["ايوب","Ayoub"],["بلال","Bilal"],
 ["بشير","Bechir"],["بدر","Badr"],["بهاء","Baha"],["طه","Taha"],["طارق","Tarek"],
 ["حسن","Hassene"],["حسين","Hussein"],["حمزة","Hamza"],["حمدي","Hamdi"],["هادي","Hadi"],
 ["هاني","Hani"],["هيثم","Haithem"],["خالد","Khaled"],["رامي","Rami"],["رضا","Reda"],
 ["زكريا","Zakaria"],["زهير","Zouheir"],["زياد","Zied"],["سليم","Slim"],["سليمان","Slimane"],
 ["سيف","Seif"],["سامي","Sami"],["سعد","Saad"],["سفيان","Sofiene"],["صفوان","Safouane"],
 ["صهيب","Souheib"],["ضياء","Dhia"],["غسان","Ghassen"],["فارس","Fares"],["فتحي","Fethi"],
 ["فراس","Firas"],["فوزي","Fawzi"],["فهمي","Fehmi"],["قيس","Kais"],["كريم","Karim"],
 ["كمال","Kamel"],["كرم","Karem"],["محمود","Mahmoud"],["مصطفي","Mustapha"],["مهدي","Mehdi"],
 ["مراد","Mourad"],["ناصر","Naceur"],["نبيل","Nabil"],["نزار","Nizar"],["نادر","Nader"],
 ["وسيم","Wassim"],["وليد","Walid"],["وائل","Wael"],["نور","Nour"],["الدين","Eddine"],
 ["عثمان","Othmane"],["فاروق","Farouk"],["صالح","Salah"],["عمار","Ammar"],["رمضان","Ramadan"],
 ["سلمي","Salma"],["مريم","Mariem"],["فاطمة","Fatma"],["خديجة","Khadija"],["عائشة","Aicha"],
 ["زينب","Zaineb"],["ايمان","Imane"],["ايمنة","Amena"],["اية","Aya"],["ايات","Ayat"],
 ["الهدي","Elhouda"],["ايناس","Ines"],["سارة","Sara"],["رحمة","Rahma"],["ملك","Malak"],
 ["ملاك","Mallak"],["جني","Jana"],["هبه","Hiba"],["لينا","Lina"],["ميرا","Mira"],
 ["ريم","Reem"],["رنا","Rana"],["دانا","Dana"],["شهد","Chahd"],["رغد","Raghad"],
 ["سيرين","Sirine"],["رتاج","Ritaj"],["تاسنيم","Tasnim"],["بيان","Bayan"],["لمي","Lama"],
 ["شيماء","Chaima"],["امل","Amal"],["اسراء","Israa"],["وفا","Wafa"],["وفاء","Wafa"],
 ["فرح","Farah"],["حنان","Hanan"],["ماريا","Maria"],["مروة","Marwa"],["مروي","Marwa"],
 ["نجات","Najet"],["تالة","Tala"],["ترابلسي","Trabelsi"],["جلاصي","Jelassi"],["غريبي","Ghribi"],
 ["ساسي","Sassi"],["عياري","Ayari"],["مسعودي","Messaoudi"],["قروي","Karoui"],["مدني","Medini"],
 ["شابي","Chaabi"],["حمامي","Hamami"],["هلالي","Hellali"],["خماسي","Khammassi"],
 ["بن","Ben"],["عبد","Abd"],["ابو","Abou"],["بو","Bou"]
].forEach(p => { AR2FR_MOTS[arNorm(p[0])] = p[1]; });
const AR2FR_L = { "ا":"a","ب":"b","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"dh",
  "ر":"r","ز":"z","س":"s","ش":"ch","ص":"s","ض":"d","ط":"t","ظ":"dh","ع":"a","غ":"gh",
  "ف":"f","ق":"k","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"ou","ي":"i","ة":"a",
  "ء":"","ئ":"y","ؤ":"w" };
function arMotVersFr(mot){
  const n = arNorm(mot);
  if (!AR_RE.test(n)) return n;                    /* mot déjà en caractères latins */
  if (AR2FR_MOTS[n]) return AR2FR_MOTS[n];
  let m = n;
  if (m.length >= 5 && m.slice(0, 2) === "ال") m = m.slice(2);
  if (AR2FR_MOTS[m]) return AR2FR_MOTS[m];   /* article « ال » retiré */
  const ch = [];
  for (const c of m) ch.push(AR2FR_L[c] !== undefined ? AR2FR_L[c] : "");
  const VOW = new Set(["a", "i", "ou", ""]);
  const runs = [];
  let cur = [];
  ch.forEach(c => {
    if (VOW.has(c)){ if (cur.length){ runs.push(cur); cur = []; } runs.push([c]); }
    else cur.push(c);
  });
  if (cur.length) runs.push(cur);
  const s = runs.map(r => r.length >= 3 ? r[0] + "e" + r.slice(1).join("") : r.join("")).join("");
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
const AR_LET = /[\u0621-\u065F]/;
/* retire les jetons sans vraie lettre arabe : numéros mal reconnus (y, o, 4…), ponctuations */
function arMotsPropres(mots){
  return (mots || []).filter(m => AR_LET.test(m) || (m.length >= 3 && /[A-Za-z]/.test(m)));
}
function arLigneVersFr(ligne){
  const mots = arMotsPropres((ligne || "").replace(/[\u060C\u061B.,"()«»]/g, " ").split(/\s+/).filter(Boolean));
  const out = [];
  for (let i = 0; i < mots.length; i++){
    if (!AR_RE.test(mots[i])){ out.push(mots[i]); continue; }
    if (arNorm(mots[i]) === "عبد" && i + 1 < mots.length){
      const fusion = AR2FR_MOTS[arNorm("عبد" + mots[i + 1])];
      out.push(fusion || "Abd " + arMotVersFr(mots[i + 1]));
      i++;
    } else {
      out.push(arMotVersFr(mots[i]));
    }
  }
  return out.filter(Boolean).join(" ");
}

/* nettoyage OCR → lignes bilingues « الترابلسي أحمد ; Trabelsi Ahmed » (« Nom ; Prénom » si la ligne est déjà en lettres latines) */
function scanParseTexte(txt){
  const lignes = txt.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "")   /* marques de sens invisibles */
    .split(/\r?\n+/).map(l => l.trim()).filter(Boolean);
  const out = [];
  lignes.forEach(l => {
    let x = l.replace(/^\s*[\d\u0660-\u0669]+\s*[).\-–—:]?\s*/, "")  /* numéro d'ordre (latin ou arabe) */
             .replace(/^[•*\-–—]+\s*/, "")                  /* puces */
             .replace(/\([^)]*\)/g, " ")
             .replace(/\s{2,}/g, " ").trim();
    if (!x || x.length < 3) return;
    if (/^(nom|prénom|prenom|liste|classe|élève|eleve|groupe|n°|no)\b/i.test(x) && !/[;]/.test(x)) return;
    if (/^(اللقب|الاسم|اسم|قائم[ةه]|كشف|حضور|التلميذ|الطلبة|القسم|الفوج|السنة|المادة|المعلم|عدد)/.test(x) && !/[;]/.test(x)) return;
    if (/;/.test(x)){ out.push(x); return; }
    const mots = x.split(" ");
    if (AR_RE.test(x)){
      /* ligne arabe : conservée en arabe + transcription française proposée à la relecture */
      const mA = arMotsPropres(mots);
      if (!mA.length) return;
      out.push(mA.join(" ") + " ; " + arLigneVersFr(mA.join(" ")));
      return;
    }
    if (mots.length === 1){ out.push(mots[0] + " ;"); return; }
    /* noms composés : Ben Ammar, Abd + …, El/Al + … → deux mots pour le nom */
    const particules = ["ben", "bin", "abd", "abou", "el", "al", "bou", "dar", "housein", "bali"];
    let coupe = 1;
    if (mots.length >= 3 && particules.includes(mots[0].toLowerCase())) coupe = 2;
    out.push(mots.slice(0, coupe).join(" ") + " ; " + mots.slice(coupe).join(" "));
  });
  return out.join("\n");
}
function scanVersZone(cid, txt){
  const prop = scanParseTexte(txt);
  const det = document.querySelector("#v-eleves details.acc");
  const zone = document.getElementById("el-lot");
  /* IMPORTANT : ne pas re-rendre la vue ici — le re-rendu recrée la zone
     de texte et EFFACERAIT le résultat du scan (bug v1.1.4) */
  if (zone){
    zone.value = prop;
    if (det) det.open = true;
    zone.focus();
  }
  const n = prop.split("\n").filter(Boolean).length;
  scanCur = 6;
  if (n) scanEtape(6, "ok", "Analyse : " + n + " ligne(s) reconnue(s)");
  else scanEtape(6, "err", "Aucune ligne reconnue — rapprochez le cadrage et réessayez");
  toast(n ? n + " ligne(s) lue(s) — relisez puis « Ajouter la liste »"
          : "Aucune ligne lue — prenez la photo de plus près, bien nette");
}

/* ==================================================================
   POINTAGE À LA VOIX (Web Speech API — intégré au navigateur)
   États dictés : absent, exclu, sorti, entrée par billet, présent, retard.
   ================================================================== */
const LIB_P = { p:"✓ présent", a:"✗ absent", e:"⛔ exclu", s:"🚪 sorti", b:"🎫 entrée par billet", r:"⏱ retard" };
const VOC_ETATS = [
  ["entree par billet","b"], ["entre par billet","b"], ["billet","b"],
  ["absent","a"], ["absence","a"],
  ["exclu","e"], ["exclue","e"], ["exclure","e"],
  ["sorti","s"], ["sortie","s"], ["sortir","s"],
  ["present","p"], ["présent","p"],
  ["retard","r"]
];
function vocNorm(t){
  return (t || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}
/* analyse une phrase : trouve l'état dicté et l'élève nommé (s'il y en a un) */
function vocAnalyse(cid, phrase){
  const norm = vocNorm(phrase);
  let et = "";
  for (const [k, v] of VOC_ETATS){
    if (norm.includes(k)){ et = v; break; }
  }
  let el = null;
  const candidat = elevesDe(cid).find(e => {
    const nomN = vocNorm(e.nom), preN = vocNorm(e.prenom || "");
    return (nomN.length >= 3 && norm.includes(nomN)) || (preN.length >= 3 && norm.includes(preN));
  }) || null;
  return { et:et, e:candidat };
}
function setPresence(cid, iso, eid, st){
  const j = presencesDe(cid);
  j[iso] = j[iso] || {};
  j[iso][eid] = st;
  save(true); renderEleves();
}
let voc = { rec:null, on:false, cible:null, cid:null, iso:null };
function vocOuvrir(cid, iso){
  voc.cid = cid; voc.iso = iso; voc.cible = null;
  const b = document.getElementById("voc-modal");
  if (!b) return;
  const liste = document.getElementById("voc-liste");
  const els = triEleves(elevesDe(cid));
  liste.innerHTML = els.map(e => {
    const st = etatPresence(cid, iso, e.id);
    return '<button id="voc-e-' + e.id + '" class="btn btn-xs ' + (st ? "btn-blue" : "btn-line") + '" style="margin:2px" onclick="vocCible(\'' + e.id + '\')">' +
      escapeHtml(e.nom + " " + (e.prenom || "")) + ((e.nomAr || e.prenomAr) ? ' <span class="ar-nom" style="display:inline">' + escapeHtml([e.nomAr, e.prenomAr].filter(Boolean).join(" ")) + '</span>' : "") + (st ? " • " + LIB_P[st] : "") + '</button>';
  }).join("") || '<span class="tiny muted">Aucun élève dans cette classe.</span>';
  document.getElementById("voc-cible").textContent = "— (dictez le nom)";
  document.getElementById("voc-entendu").textContent = "";
  b.classList.add("on");
  vocSuivantNonMarque();
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)){
    document.getElementById("voc-entendu").textContent = "La dictée n'est pas disponible sur ce navigateur (essayez Chrome ou Edge) — utilisez les boutons de statut.";
  } else {
    toast("Touchez un élève puis appuyez sur le micro");
  }
}
function vocCible(eid){
  voc.cible = eid;
  const e = elevesDe(voc.cid).find(x => x.id === eid);
  document.getElementById("voc-cible").textContent = e ? (e.nom + " " + (e.prenom || "")) : "—";
  vocPeindre();
}
function vocSuivantNonMarque(){
  const els = triEleves(elevesDe(voc.cid));
  const suivant = els.find(e => !etatPresence(voc.cid, voc.iso, e.id));
  if (suivant) vocCible(suivant.id);
  vocPeindre();
}
function vocPeindre(){
  triEleves(elevesDe(voc.cid)).forEach(e => {
    const b = document.getElementById("voc-e-" + e.id);
    if (!b) return;
    const st = etatPresence(voc.cid, voc.iso, e.id);
    b.className = "btn btn-xs " + (st ? "btn-blue" : "btn-line") + (e.id === voc.cible ? "" : "");
    b.style.outline = e.id === voc.cible ? "2px solid var(--rose)" : "";
    b.innerHTML = escapeHtml(e.nom + " " + (e.prenom || "")) + ((e.nomAr || e.prenomAr) ? ' <span class="ar-nom" style="display:inline">' + escapeHtml([e.nomAr, e.prenomAr].filter(Boolean).join(" ")) + '</span>' : "") + (st ? " • " + LIB_P[st] : "");
  });
}
function vocToggle(){ voc.on ? vocStop() : vocDemarrer(); }
function vocDemarrer(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR){ toast("Dictée indisponible sur ce navigateur — essayez Chrome ou Edge"); return; }
  const rec = new SR();
  rec.lang = "fr-FR"; rec.continuous = true; rec.interimResults = false;
  rec.onresult = ev => {
    const ph = ev.results[ev.results.length - 1][0].transcript;
    document.getElementById("voc-entendu").textContent = "Entendu : « " + ph + " »";
    vocTraiter(ph);
  };
  rec.onerror = ev => {
    if (ev.error === "not-allowed") document.getElementById("voc-entendu").textContent = "Micro refusé : autorisez le microphone dans le navigateur.";
    voc.on = false; vocPeindreMic();
  };
  rec.onend = () => { if (voc.on){ try { rec.start(); } catch(e){} } };
  try { rec.start(); voc.rec = rec; voc.on = true; vocPeindreMic(); } catch(e){}
}
function vocStop(){
  if (voc.rec){ voc.on = false; try { voc.rec.stop(); } catch(e){} voc.rec = null; vocPeindreMic(); }
}
function vocPeindreMic(){
  const m = document.getElementById("voc-mic");
  if (m) m.style.background = voc.on ? "var(--green)" : "var(--rose)";
}
/* applique une phrase entendue : « Ahmed absent », « exclu Salma », « billet pour Youssef »… */
function vocTraiter(phrase){
  const a = vocAnalyse(voc.cid, phrase);
  const cible = a.e || elevesDe(voc.cid).find(e => e.id === voc.cible) || null;
  if (!cible){ toast("Indiquez l'élève (touchez son nom ou dictez-le)"); return; }
  if (!a.et){ toast("État non reconnu — dites : absent, exclu, sorti, billet, présent ou retard"); return; }
  setPresence(voc.cid, voc.iso, cible.id, a.et);
  toast(cible.nom + " — " + (LIB_P[a.et] || a.et));
  vocPeindre();
  vocSuivantNonMarque();
}

/* ---------- exports ---------- */
window.mesClasses = mesClasses; window.addClasse = addClasse; window.delClasse = delClasse;
window.addEleve = addEleve; window.addElevesLot = addElevesLot; window.delEleve = delEleve;
window.cyclePresence = cyclePresence; window.setAllPresent = setAllPresent; window.clearPresence = clearPresence;
window.nbAbsences = nbAbsences; window.etatPresence = etatPresence;
window.addEpreuve = addEpreuve; window.delEpreuve = delEpreuve;
window.presetsOfficiels = presetsOfficiels; window.enregistrerNotes = enregistrerNotes; window.setNote = setNote;
window.setCompetenceEleve = setCompetenceEleve; window.saveBulletinComment = saveBulletinComment; window.imprimerBulletin = imprimerBulletin;
window.exporterRosterCSV = exporterRosterCSV; window.importerRosterCSV = importerRosterCSV;
window.exporterNotesCSV = exporterNotesCSV; window.importerNotesCSV = importerNotesCSV;
window.statsEleve = statsEleve; window.classementClasse = classementClasse; window.rangDe = rangDe;
window.moyennesParNotion = moyennesParNotion; window.renderEleves = renderEleves;
window.triEleves = triEleves; window.elClasseCourante = elClasseCourante;
/* état de l'onglet, accessible aux gestionnaires inline (testés par la suite de vérification) */
window.elVue = elVue; window.elClasse = elClasse; window.elEpreuve = elEpreuve; window.elEleve = elEleve;
window.__voc = () => voc; window.epreuvesDe = epreuvesDe; window.elevesDe = elevesDe;
window.scanFeuille = scanFeuille; window.scanFichier = scanFichier; window.scanParseTexte = scanParseTexte;
window.scanEtape = scanEtape; window.scanBoiteReset = scanBoiteReset; window.scanBoiteErreur = scanBoiteErreur; window.scanVersZone = scanVersZone;
window.scanPreparerImage = scanPreparerImage; window.scanTestMoteur = scanTestMoteur;
window.arNorm = arNorm; window.arMotVersFr = arMotVersFr; window.arLigneVersFr = arLigneVersFr; window.arMotsPropres = arMotsPropres;
window.__scan = () => ({ cur: scanCur, set: v => { scanCur = v; } });
window.vocOuvrir = vocOuvrir; window.vocToggle = vocToggle; window.vocStop = vocStop;
window.vocTraiter = vocTraiter; window.vocAnalyse = vocAnalyse; window.vocCible = vocCible;
window.setPresence = setPresence; window.vocSuivantNonMarque = vocSuivantNonMarque;
window.openProfil = openProfil; window.closeProfil = closeProfil; window.saveProfil = saveProfil;
window.undoProfileSignature = undoProfileSignature; window.clearProfileSignature = clearProfileSignature;
window.profilePhotoChanged = profilePhotoChanged; window.renderProfileBadgePreview = renderProfileBadgePreview; window.renderSiteProfessorBadge = renderSiteProfessorBadge; window.printProfilBadge = printProfilBadge;
window.applyProfil = applyProfil;
function initializeConnectedProfile(){
  if(typeof window.renderAll==="function")window.renderAll(true);else applyProfil();
  window.STI_THEME?.refresh?.();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initializeConnectedProfile,{once:true});
else initializeConnectedProfile();
