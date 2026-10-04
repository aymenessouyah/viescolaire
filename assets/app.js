/* =========================================================================
   ESPACE PÉDAGOGIQUE STI — application (Prof. A. Essouyah, Lycée Rafèha Ariana)
   Les données sont chargées depuis les fichiers du dossier data/ :
     reference.js   établissement, classes, emploi du temps, calendrier tunisien
     repartition.js répartition du 1er trimestre (3SI1 et 4SI2)
     programme.js   compétences et savoirs associés (aide pédagogique)
     competences.js pont compétences ↔ annexes ↔ séances
     memo.js        mémo consolidé (annexes adaptées à l'aide pédagogique)
     annexes.js     annexes intégrales HTML5 / CSS3 / JS / PHP / SQL
     docs.js        documents PDF de référence
   ========================================================================= */
(function () {
'use strict';

const DATA = window.STI_DATA || {};
if (!DATA.reference) {
  document.addEventListener("DOMContentLoaded", function(){
    document.body.insertAdjacentHTML("afterbegin",
      '<div style="padding:14px 18px;background:#fdeef1;color:#a51f38;font:600 14px system-ui">'+
      'Données non chargées : vérifiez que le dossier <code>data/</code> est bien présent à côté de <code>index.html</code>.</div>');
  });
  return;
}
const { SCHOOL, CLASSES, HORAIRES_DEFAUT, VACANCES, FERIES, A_CONFIRMER, SUSPENSIONS, JALONS, DS1, MOIS, MOIS_S, JOURS, JOURS_S } = DATA.reference;
const PLAN = DATA.repartition;
const PROGRAMME = DATA.programme;
const COMPETENCES = DATA.competences;
const MEMO = DATA.memo;
const ANNEXES = DATA.annexes;
const DOCS = DATA.docs;

/* ---------- utilitaires dates (chaînes ISO, sans décalage horaire) ---------- */
function D(iso){ return new Date(iso + "T00:00:00"); }
function ISO(dt){ const m = String(dt.getMonth()+1).padStart(2,"0"), j = String(dt.getDate()).padStart(2,"0"); return dt.getFullYear()+"-"+m+"-"+j; }
function addDays(iso, n){ const dt = D(iso); dt.setDate(dt.getDate()+n); return ISO(dt); }
function between(iso, from, to){ return iso >= from && iso <= to; }
function inRange(iso, r){ return between(iso, r.from, r.to); }
function fmtLong(iso){ const dt = D(iso); return JOURS[dt.getDay()] + " " + dt.getDate() + " " + MOIS[dt.getMonth()] + " " + dt.getFullYear(); }
function fmtShort(iso){ const dt = D(iso); return String(dt.getDate()).padStart(2,"0") + "/" + String(dt.getMonth()+1).padStart(2,"0") + "/" + dt.getFullYear(); }
function fmtJM(iso){ const dt = D(iso); return dt.getDate() + " " + MOIS_S[dt.getMonth()]; }
function jour(iso){ return JOURS[D(iso).getDay()]; }
function jourS(iso){ return JOURS_S[D(iso).getDay()]; }
function weekLabel(iso){
  const dt = D(iso); const dow = (dt.getDay()+6)%7;           // 0 = lundi
  const mon = addDays(iso, -dow), sun = addDays(mon, 6);
  return "Semaine du " + fmtJM(mon) + " au " + fmtJM(sun);
}
function diffDays(a, b){ return Math.round((D(b) - D(a)) / 86400000); }
function numSemaine(iso){
  const dt = D(iso); const dow = (dt.getDay()+6)%7; const mon = addDays(iso, -dow);
  return Math.max(1, Math.round((D(mon) - D(SCHOOL.rentreeEleves)) / (7*86400000)) + 1);
}
function daysList(from, to){ const out=[]; let c=from; while(c<=to){ out.push(c); c=addDays(c,1);} return out; }

/* ---------- jours non travaillés ---------- */
function vacationOf(iso){ return VACANCES.find(v => inRange(iso, v)) || null; }
function ferieOf(iso){ return FERIES.find(f => f.date === iso) || null; }
function suspensionOf(iso, cls){ return SUSPENSIONS.find(s => inRange(iso, s) && (!s.classes || !cls || s.classes.includes(cls))) || null; }
function isOff(iso, cls){ return !!(vacationOf(iso) || ferieOf(iso) || suspensionOf(iso, cls)); }

function jalonsOf(iso){
  return JALONS.filter(j => {
    if (j.date) return j.date === iso;
    return inRange(iso, j);
  });
}
function jalonsForClass(iso, cls){
  return jalonsOf(iso).filter(j => !j.classes || j.classes.includes(cls));
}

/* ---------- génération des séances réelles ---------- */
function generateSessions(cls){
  const cfg = CLASSES[cls];
  const plan = PLAN[cls] || [];
  const queue = [];
  plan.forEach((blk, bi) => { blk._i = bi + 1; for (let i=0;i<blk.n;i++) queue.push({ blk, bi:blk._i, pos:i }); });

  const sessions = [];
  let cur = SCHOOL.rentreeEleves, n = 0;
  while (cur <= cfg.fin) {
    const dow = D(cur).getDay();
    if (cfg.days.includes(dow) && !isOff(cur, cls)) {
      const item = queue[n] || null;
      n++;
      sessions.push({
        cls: cls, n: n, iso: cur,
        week: weekLabel(cur), sem: numSemaine(cur),
        tri: triOf(cur),
        blk: item ? item.blk : null,
        last: item ? (item.pos === item.blk.n - 1) : false
      });
    }
    cur = addDays(cur, 1);
  }
  return sessions;
}
function triOf(iso){
  if (iso <= "2026-12-31") return 1;
  if (iso <= "2027-03-14") return 2;
  return 3;
}
const SESSIONS = { "3SI1": generateSessions("3SI1"), "4SI2": generateSessions("4SI2") };
function sessionsOf(cls, tri){ return SESSIONS[cls].filter(s => !tri || s.tri === tri); }
function titleOf(s, store){
  const ov = (store && store.seances[s.cls+"|"+s.n] || {}).title;
  if (ov) return ov;
  return s.blk ? s.blk.t : "Séance à planifier";
}
function evalDates(cls, kind){
  return SESSIONS[cls].filter(s => s.blk && s.blk.k === kind).map(s => s.iso);
}
/* ==================================================================
   ÉTAT LOCAL, ICÔNES ET RENDU (interface)
   ================================================================== */
const KEY = "sti_espace_aymen_2026_2027";  /* version 2 du schéma */
let store = load();

function load(){
  const base = { times: JSON.parse(JSON.stringify(HORAIRES_DEFAUT)), seances:{}, saved:null };
  try{
    const raw = localStorage.getItem(KEY);
    if (raw){
      const p = JSON.parse(raw);
      // migration : ancienne structure d'horaires (une seule plage par classe) ou classe renommée
      const ok = p.times && p.times["3SI1"] && p.times["4SI2"] && p.times["3SI1"][2] && p.times["4SI2"][1];
      if (!ok) delete p.times;
      return Object.assign(base, p);
    }
  }catch(e){}
  return base;
}
function save(silent){
  store.saved = new Date().toISOString();
  try{ localStorage.setItem(KEY, JSON.stringify(store)); }catch(e){}
  if(!silent) toast("Modifications enregistrées dans ce navigateur");
  if (typeof cloudAutoPush === "function") cloudAutoPush();
  renderAll(true);
}
function seanceState(s){
  const o = store.seances[s.cls+"|"+s.n] || {};
  if (o.done === true) return "faite";
  if (o.done === false) return "reportee";
  return s.iso <= todayISO() ? "passee" : "avenir";
}
function todayISO(){ return ISO(new Date()); }

const ICONS = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  pen:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  check:'<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14l-3-3"/>',
  alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  pin:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  code:'<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  cpu:'<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
  web:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 2-2 2 2 0 0 1 2-2h3a2 2 0 0 0 2-2 9 9 0 0 0-10-12z"/><circle cx="7.5" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="11" r="1"/>',
  js:'<path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 17c0 1-1 2-2.5 1.6"/><path d="M14 10h3v7"/>',
  server:'<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01"/>',
  print:'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  down:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  chev:'<path d="m6 9 6 6 6-6"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  flag:'<path d="M4 15s1.5-1 4-1 5 2 8 2 4-1 4-1V4s-1.5 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  cloud:'<path d="M18 10h-1.3A6 6 0 1 0 6 15.7"/><path d="M17 18H7a4 4 0 0 1 0-8"/><path d="M12 12v6M9.5 15.5 12 18l2.5-2.5"/>',
  install:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4"/>',
  out:'<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="M15 12H8"/><path d="m12 9 3 3-3 3"/><path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2"/>'
};
function ic(n, cls){ return '<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[n]||"")+'</svg>'; }

const TABS = [
  { id:"v-dash",   t:"Tableau de bord", ico:"home" },
  { id:"v-edt",    t:"Emploi du temps", ico:"clock" },
  { id:"v-cal",    t:"Calendrier tunisien", ico:"calendar" },
  { id:"v-rep",    t:"Répartition 1<sup>er</sup> trim.", ico:"list" },
  { id:"v-prog",   t:"Programme &amp; compétences", ico:"target" },
  { id:"v-cahier", t:"Cahier de textes", ico:"pen" },
  { id:"v-ref",    t:"Annexes &amp; mémo", ico:"book" }
];
let currentTab = "v-dash";
let repCls = "3SI1", repTri = 1;

/* ---------------- rendu global ---------------- */
function renderAll(silent){
  document.getElementById("tabs").innerHTML = TABS.map(t =>
    '<button class="tab '+(currentTab===t.id?"on":"")+'" onclick="go(\''+t.id+'\')">'+ic(t.ico)+t.t+
    (t.id==="v-rep" ? '<span class="cnt">'+ (SESSIONS["3SI1"].filter(s=>s.tri===1).length + SESSIONS["4SI2"].filter(s=>s.tri===1).length) +'</span>' : '') +
    '</button>').join("");
  document.getElementById("tb-today").innerHTML = "Nous sommes le <strong>"+fmtLong(todayISO())+"</strong>";
  document.getElementById("ft-year").textContent = "Mise à jour : " + (typeof store.saved === "string" ? fmtShort(store.saved.slice(0,10)) + " " + store.saved.slice(11,16) : "session en cours");
  renderDash();
  renderEDT();
  renderCal();
  renderRep();
  renderProg();
  renderCahier();
  renderRef();
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("on", v.id===currentTab));
}
function go(id){
  currentTab = id;
  /* lien profond (raccourcis du manifeste, partage d'adresse) */
  if (id && history.replaceState && location.hash.slice(1) !== id) history.replaceState(null, "", "#" + id);
  renderAll(true); window.scrollTo({top:0,behavior:"smooth"});
}
function toast(msg){
  const t = document.getElementById("toast");
  document.getElementById("toast-txt").textContent = msg;
  t.classList.add("on");
  clearTimeout(window.__tt);
  window.__tt = setTimeout(()=>t.classList.remove("on"), 2600);
}

/* ---------------- 1. TABLEAU DE BORD ---------------- */
function nextSessions(cls, k){
  const t = todayISO();
  return SESSIONS[cls].filter(s => s.iso >= t).slice(0, k||4);
}
function kpiDone(cls, tri){
  const list = sessionsOf(cls, tri), t = todayISO();
  const done = list.filter(s => { const st = seanceState(s); return st==="faite" || st==="passee"; }).length;
  return { done:done, total:list.length, pct: Math.round(done/list.length*100) };
}
/* invitation à activer la sauvegarde distante — affichée seulement si nécessaire */
function cloudInvite(){
  if (cloudReady()) return "";
  return `<div class="note warn" style="margin-bottom:14px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap">
    <span>${ic("cloud")} <strong>Sauvegarde locale seulement.</strong> Vos fiches de séance ne vivent que dans le navigateur de cet appareil.
    Activez la sauvegarde distante pour les retrouver sur votre téléphone, votre tablette et le poste du lycée.</span>
    <span class="row no-print" style="gap:8px">
      <button class="btn btn-xs btn-blue" onclick="openCloudSettings()">${ic("cloud")} Activer la sauvegarde distante</button>
      <button class="btn btn-xs btn-line" onclick="go('v-ref')">${ic("book")} En savoir plus</button>
    </span></div>`;
}
function renderDash(){
  const t = todayISO();
  const todaySessions = [];
  ["3SI1","4SI2"].forEach(c => SESSIONS[c].filter(s => s.iso === t).forEach(s => todaySessions.push(s)));

  const dc3 = evalDates("3SI1","dc"), dc4 = evalDates("4SI2","dc");
  const nextJ = JALONS.filter(j => (j.date ? j.date >= t : j.to >= t)).slice(0,7);
  const nextVac = VACANCES.find(v => v.to >= t);

  const heroToday = todaySessions.length
    ? todaySessions.map(s => '<div class="row" style="gap:8px;margin-top:6px"><span class="badge b-teal" style="background:#fff;color:#0a7a70">'+s.cls+'</span><strong>'+titleOf(s,store)+'</strong><span class="muted">— séance n°'+s.n+' ('+(CLASSES[s.cls].heures)+' h)</span></div>').join("")
    : '<p class="tiny" style="margin-top:6px;opacity:.85">Aucune séance aujourd’hui. Prochaines séances : <strong>'+
        (nextSessions("3SI1",1)[0] ? fmtLong(nextSessions("3SI1",1)[0].iso) + ' (3SI1)' : "—") + '</strong> et <strong>' +
        (nextSessions("4SI2",1)[0] ? fmtLong(nextSessions("4SI2",1)[0].iso) + ' (4SI2)' : "—") + '</strong>.</p>';

  const dash = document.getElementById("v-dash");
  dash.innerHTML = `
  ${cloudInvite()}
  <div class="card" style="background:linear-gradient(120deg,#0b2545,#14456f 60%,#0e6f8f);color:#fff;border:none;margin-bottom:16px">
    <div class="card-b">
      <div class="spread">
        <div style="min-width:260px">
          <div class="badge b-navy" style="background:rgba(255,255,255,.16);color:#dff1ff;border-color:rgba(255,255,255,.25)">Année scolaire ${SCHOOL.annee}</div>
          <h2 style="font-size:22px;margin-top:10px">Bienvenue, M. ${SCHOOL.prof}</h2>
          <p class="small" style="color:#c9def0;margin-top:4px">${SCHOOL.matiere} — ${SCHOOL.lycee}</p>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.18)">
            <div class="tiny" style="text-transform:uppercase;letter-spacing:.06em;color:#9dc4e0;font-weight:800">${todaySessions.length ? "Séance(s) du jour" : "Aujourd’hui"}</div>
            ${heroToday}
          </div>
        </div>
        <div class="grid g2" style="flex:1;min-width:280px;max-width:620px">
          ${["3SI1","4SI2"].map(c => {
            const nx = nextSessions(c,1)[0];
            const cfg = CLASSES[c];
            return `<div style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:13px 15px">
              <div class="row" style="justify-content:space-between"><strong style="font-size:15px">${cfg.short}</strong><span class="badge" style="background:rgba(255,255,255,.2);color:#fff">${cfg.dayTxt}</span></div>
              <div class="tiny" style="color:#c9def0;margin-top:4px">${cfg.heures*cfg.groupes} h par jour • 2 groupes de ${cfg.heures} h</div>
              <div class="sep" style="background:rgba(255,255,255,.18)"></div>
              <div class="tiny" style="color:#9dc4e0;font-weight:800;text-transform:uppercase;letter-spacing:.05em">Prochaine séance</div>
              <div style="font-weight:700;margin-top:2px">${nx ? fmtLong(nx.iso) : "—"}</div>
              <div class="tiny" style="color:#c9def0">${nx ? "Séance n°"+nx.n+" • "+escapeHtml(titleOf(nx,store)) : ""}</div>
              <div class="tiny" style="color:#9dc4e0;margin-top:3px">${nx ? slotsTxt(c, nx.iso) : ""}</div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>
  </div>

  <div class="grid g4" style="margin-bottom:16px">
    <div class="kpi">
      <div class="lbl">${ic("list")} 1<sup>er</sup> trimestre — 3SI1</div>
      <div class="val">${sessionsOf("3SI1",1).length} <small>séances</small></div>
      <div class="foo">46 h par groupe &bull; 92 h au total &bull; mardi 8h-12h &amp; jeudi 13h-17h</div>
    </div>
    <div class="kpi k-teal">
      <div class="lbl">${ic("list")} 1<sup>er</sup> trimestre — 4SI2</div>
      <div class="val">${sessionsOf("4SI2",1).length} <small>séances</small></div>
      <div class="foo">44 h par groupe &bull; 88 h au total &bull; lundi &amp; vendredi 8h-12h</div>
    </div>
    <div class="kpi k-amber">
      <div class="lbl">${ic("sun")} Prochaines vacances</div>
      <div class="val" style="font-size:19px">${nextVac ? fmtJM(nextVac.from) : "—"}</div>
      <div class="foo">${nextVac ? nextVac.label + " • dans " + diffDays(t, nextVac.from) + " jour(s)" : "Année terminée"}</div>
    </div>
    <div class="kpi k-rose">
      <div class="lbl">${ic("flag")} Prochain jalon officiel</div>
      <div class="val" style="font-size:19px">${nextJ[0] ? (nextJ[0].date ? fmtJM(nextJ[0].date) : fmtJM(nextJ[0].from)) : "—"}</div>
      <div class="foo">${nextJ[0] ? nextJ[0].label : ""}</div>
    </div>
  </div>

  <div class="grid g2" style="align-items:start">
    <div class="stack">
      <div class="card">
        <div class="card-h"><h3>${ic("check")} Avancement du programme — 1<sup>er</sup> trimestre</h3><span class="badge b-grey">Mis à jour le ${fmtShort(t)}</span></div>
        <div class="card-b">
          ${["3SI1","4SI2"].map(c => {
            const k = kpiDone(c,1);
            return `<div style="margin-bottom:16px">
              <div class="spread" style="margin-bottom:6px">
                <strong>${CLASSES[c].short} <span class="muted tiny">— ${CLASSES[c].dayTxt}</span></strong>
                <span class="badge ${k.pct>=100?"b-green":"b-blue"}">${k.done} / ${k.total} séances • ${k.pct}%</span>
              </div>
              <div class="bar"><i class="done" style="width:${k.pct}%"></i><i class="left" style="width:${100-k.pct}%"></i></div>
              <div class="legend">
                <span><i class="sq" style="background:#12a06a"></i> réalisées / échues</span>
                <span><i class="sq" style="background:#dbe6f2"></i> restantes</span>
                <span class="muted">DC1 : ${dcOf(c,"dc1")} • DC2 : ${dcOf(c,"dc2")} • DS1 : ${fmtShort(DS1[c].main)}</span>
              </div>
            </div>`;
          }).join("")}
          <div class="note">${ic("pin")} Les séances sont calculées automatiquement à partir des créneaux réels (3SI1 : mardi &amp; jeudi — 4SI2 : lundi &amp; vendredi, 2 h/séance) et du calendrier scolaire tunisien 2026-2027 : jours fériés, vacances et semaines bloquées sont automatiquement exclus.</div>
        </div>
      </div>

      <div class="card">
        <div class="card-h"><h3>${ic("calendar")} Prochaines séances</h3>
          <button class="btn btn-xs btn-soft no-print" onclick="go('v-rep')">Voir la répartition</button></div>
        <div class="card-b tight">
          <div class="grid g2">
            ${["3SI1","4SI2"].map(c => `
              <div>
                <div class="badge ${c==="3SI1"?"b-blue":"b-teal"}" style="margin-bottom:8px">${CLASSES[c].short}</div>
                ${nextSessions(c,4).map(s => `
                  <div class="li">
                    <div class="ico">${ic(s.blk && s.blk.k!=="cours" ? (s.blk.k==="dc"?"flag":"check") : "clock")}</div>
                    <div>
                      <div><strong>${jourS(s.iso)} ${fmtShort(s.iso)}</strong> <span class="muted tiny">• séance n°${s.n}</span>
                        ${s.iso===t?'<span class="badge b-teal">aujourd’hui</span>':''}
                      </div>
                      <div class="tiny muted">${slotsTxt(c, s.iso)}</div>
                      <div class="tiny muted">${escapeHtml(titleOf(s,store))}</div>
                    </div>
                  </div>`).join("")}
              </div>`).join("")}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-h"><h3>${ic("file")} Documents de référence et de travail</h3>
          <button class="btn btn-xs btn-soft no-print" onclick="go('v-ref')">Tout voir (${DOCS.length})</button></div>
        <div class="card-b tight">
          ${[...new Set(DOCS.map(d => d.g))].map(g => {
            const liste = DOCS.filter(d => d.g === g);
            const first = liste[0];
            return `<div class="li">
              <div class="ico">${ic("file")}</div>
              <div>
                <div class="tt"><a href="${encodeURI(first.f)}" target="_blank">${g}</a></div>
                <div class="tiny muted">${liste.length} fichier(s) &bull; ${liste.slice(0, 3).map(d => d.t.replace(/<[^>]+>/g, "").replace(/^(Fiche (des séances|de la séance) [0-9-]+ — |Répartition trimestrielle \(\d\) (prévisionnelle )?— |Annexe [A-Za-z0-9]+ — élaborée par A\. Essouyah|Aide pédagogique STI [^—]+)/, "").trim() || d.t).filter(Boolean).slice(0, 3).join(", ")}${liste.length > 3 ? "…" : ""}</div>
              </div>
            </div>`;
          }).join("")}
          <div class="note" style="margin-top:10px">Trois ensembles : l'aide pédagogique et les répartitions officielles (1<sup>er</sup>, 2<sup>e</sup> et 3<sup>e</sup> trimestres), vos 5 annexes de cours, et vos 13 fiches de séances 2026-2027. Tous les fichiers se trouvent dans ce même projet.</div>
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-h"><h3>${ic("flag")} Calendrier officiel — prochains jalons</h3>
          <button class="btn btn-xs btn-soft no-print" onclick="go('v-cal')">Tout le calendrier</button></div>
        <div class="card-b">
          <div class="tl">
            ${nextJ.map(j => {
              const dt = j.date || j.from;
              const cls = j.type==="vac"?"t-vac":j.type==="hol"?"t-hol":j.type==="eval"||j.type==="bloc"?"t-eval":j.type==="end"?"t-end":"";
              return `<div class="tl-item ${cls}">
                <div class="d">${j.date ? fmtLong(j.date) : "du " + fmtLong(j.from) + " au " + fmtLong(j.to)}</div>
                <div class="t">${j.label}</div>
                <div class="s">${j.s || ""}</div></div>`;
            }).join("")}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-h"><h3>${ic("alert")} Points d'attention de l'année</h3></div>
        <div class="card-b">
          <div class="li"><div class="ico">${ic("alert")}</div><div><strong>Jeudi 15 octobre 2026 — Fête de l'Évacuation.</strong> Jour férié : la séance hebdomadaire de <strong>3SI1</strong> du jeudi n'est pas assurée. La répartition officielle prévoyait une seule séance cette semaine-là (séance n°9).</div></div>
          <div class="li"><div class="ico">${ic("alert")}</div><div><strong>Vendredi 1<sup>er</sup> janvier 2027 — Jour de l'An</strong> et <strong>vendredi 9 avril 2027 — Fête des Martyrs</strong> : les séances de <strong>4SI2</strong> du vendredi sont reportées.</div></div>
          <div class="li"><div class="ico">${ic("check")}</div><div><strong>Semaine bloquée du 7 au 12 décembre 2026</strong> : devoirs de synthèse n°1 — 3SI1 le ${fmtShort(DS1["3SI1"].main)}, 4SI2 le ${fmtShort(DS1["4SI2"].main)}. Les corrections sont assurées après les vacances d'hiver (28 et 31 décembre 2026 pour 3SI1 ; 28 décembre pour 4SI2).</div></div>
          <div class="li"><div class="ico">${ic("clock")}</div><div><strong>Aïd el-Fitr, Aïd el-Idha et Ras El Am El Hijri</strong> : dates fixées par l'observation lunaire ; elles seront intégrées dès leur annonce officielle.</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-h"><h3>${ic("target")} Couverture des compétences officielles</h3></div>
        <div class="card-b tight">
          ${["3SI1","4SI2"].map(c => `
            <div style="margin-bottom:10px">
              <div class="badge ${c==="3SI1"?"b-blue":"b-teal"}" style="margin-bottom:6px">${CLASSES[c].short}</div>
              ${PROGRAMME[c].domaines.map(dm => `
                <div class="tiny" style="font-weight:800;color:var(--ink-2);margin:6px 0 4px">${dm.nom}</div>
                ${dm.comps.map(cp => `
                  <div class="spread" style="gap:8px;padding:5px 0;border-bottom:1px dashed var(--line-2)">
                    <span class="tiny" style="flex:1">${cp.t}</span>
                    <span class="badge ${cp.tri.includes(1)?"b-green":"b-grey"}">${triLabel(cp.tri)}</span>
                  </div>`).join("")}
              `).join("")}
            </div>`).join("")}
          <div class="note tiny">Les badges indiquent les trimestres de traitement prévus ; le 1<sup>er</sup> trimestre correspond à la répartition officielle des documents fournis.</div>
        </div>
      </div>
    </div>
  </div>`;
  const dstack = dash.querySelectorAll(".stack");
  if (dstack[1] && typeof cloudCard === "function") dstack[1].insertAdjacentHTML("beforeend", cloudCard());
  dash.querySelectorAll(".li .ico svg").forEach(s => { s.setAttribute("width","12"); s.setAttribute("height","12"); });
}
function triLabel(tri){
  if (tri.includes("T1") && tri.length === 1) return "1<sup>er</sup> trimestre";
  return tri.map(x => x.replace("T","")).join(" – ") + "<sup>e</sup> trimestre";
}
function dcOf(cls, kind){
  const list = SESSIONS[cls].filter(s => s.blk && s.blk.k==="dc");
  const idx = kind==="dc1" ? 0 : 1;
  return list[idx] ? fmtShort(list[idx].iso) : "—";
}

/* ---------------- 2. EMPLOI DU TEMPS ---------------- */
function renderEDT(){
  const t = todayISO();
  const CLS = ["3SI1","4SI2"];

  /* --- grille hebdomadaire : pour chaque jour, les créneaux des 2 groupes --- */
  const rows = [1,2,3,4,5].map(j => {
    const cells = CLS.map(c => {
      const cfg = CLASSES[c];
      if (!cfg.days.includes(j)) return '<td class="muted tiny" style="text-align:center">—</td>';
      const sl = slotsOfDay(c, j);
      const couleur = c === "3SI1" ? "var(--blue)" : "var(--teal)";
      return `<td>
        <div style="border:1px solid var(--line);border-left:4px solid ${couleur};border-radius:10px;padding:9px 11px">
          <div class="spread" style="gap:6px">
            <strong>${cfg.short}</strong>
            <span class="badge b-grey">${blockRange(c, j)}</span>
          </div>
          ${sl.map((b,i) => `<div class="row" style="gap:6px;margin-top:5px">
              <span class="badge ${i===0?"b-blue":"b-teal"}" style="min-width:74px;justify-content:center">${b.g}</span>
              <span class="tiny">${hh(b.s)} – ${hh(b.e)} <span class="muted">(${heuresEntre(b.s,b.e).toString().replace(".",",")} h)</span></span>
            </div>`).join("")}
          <div class="tiny muted" style="margin-top:6px">${escapeHtml(shortTitle(nextOf(j, c)))}</div>
        </div></td>`;
    }).join("");
    return `<tr><td style="font-weight:800;white-space:nowrap">${JOURS[j].charAt(0).toUpperCase()+JOURS[j].slice(1)}</td>${cells}</tr>`;
  }).join("");

  /* --- éditeur d'horaires --- */
  const editeur = CLS.map(c => `
    <div style="margin-bottom:14px">
      <div class="spread" style="margin-bottom:6px">
        <strong>${CLASSES[c].short}</strong>
        <span class="badge b-grey">${weeklyHours(c).toString().replace(".",",")} h / semaine (2 groupes)</span>
      </div>
      ${CLASSES[c].days.map(d => `
        <div class="tile" style="margin-bottom:8px">
          <div class="ic">${ic("clock")}</div>
          <div style="flex:1">
            <div class="tiny" style="font-weight:800;color:var(--ink-2);text-transform:uppercase">${JOURS[d]}</div>
            ${slotsOfDay(c, d).map((b,i) => `
              <div class="spread" style="gap:8px;margin-top:6px">
                <span class="tiny" style="min-width:66px"><strong>${b.g}</strong></span>
                <div class="row" style="gap:6px">
                  <input type="time" style="width:112px" value="${b.s}" onchange="setSlot('${c}',${d},${i},'s',this.value)">
                  <span class="muted">→</span>
                  <input type="time" style="width:112px" value="${b.e}" onchange="setSlot('${c}',${d},${i},'e',this.value)">
                </div>
              </div>`).join("")}
          </div>
        </div>`).join("")}
    </div>`).join("");

  /* --- séances de la semaine en cours --- */
  const semaine = CLS.map(c => {
    const wk = SESSIONS[c].filter(s => weekLabel(s.iso) === weekLabel(t));
    return `<div class="tiny" style="font-weight:800;margin:6px 0 4px;color:var(--ink-2)">${CLASSES[c].short}</div>` +
      (wk.length ? wk.map(s => `<div class="li"><div class="ico">${ic("clock")}</div><div>
          <div><strong>${jour(s.iso)} ${fmtShort(s.iso)}</strong> <span class="muted tiny">• ${slotsTxt(c, s.iso)}</span></div>
          <div class="tiny muted">${escapeHtml(titleOf(s,store))}</div></div></div>`).join("")
        : '<div class="tiny muted" style="padding:6px 0">Aucune séance cette semaine (vacances ou semaine bloquée).</div>');
  }).join("");

  document.getElementById("v-edt").innerHTML = `
  <div class="sec-head">
    <div>
      <h2>${ic("clock")} Emploi du temps hebdomadaire — année 2026/2027</h2>
      <p class="lead">Chaque classe est dédoublée en <strong>2 groupes</strong> et chaque journée de cours comporte <strong>2 créneaux de 2 h</strong> (Groupe 1 puis Groupe 2) : <strong>4SI2</strong> le lundi et le vendredi de 8 h à 12 h, <strong>3SI1</strong> le mardi de 8 h à 12 h et le jeudi de 13 h à 17 h. Les horaires sont modifiables et enregistrés dans le navigateur.</p>
    </div>
  </div>

  <div class="grid g4" style="margin-bottom:16px">
    ${CLS.map(c => `
      <div class="kpi ${c==="4SI2"?"k-teal":""}">
        <div class="lbl">${ic("clock")} ${CLASSES[c].short} — charge hebdomadaire</div>
        <div class="val">${weeklyHours(c).toString().replace(".",",")} <small>h / semaine</small></div>
        <div class="foo">2 séances de 2 h par jour • ${CLASSES[c].groupes} groupes</div>
      </div>`).join("")}
    <div class="kpi k-amber">
      <div class="lbl">${ic("grid")} Charge totale de l'enseignant</div>
      <div class="val">${(weeklyHours("3SI1")+weeklyHours("4SI2")).toString().replace(".",",")} <small>h / semaine</small></div>
      <div class="foo">4 journées de 4 h : lundi, mardi, jeudi, vendredi</div>
    </div>
    <div class="kpi k-rose">
      <div class="lbl">${ic("list")} Séances programmées (1<sup>er</sup> trim.)</div>
      <div class="val">${sessionsOf("3SI1",1).length + sessionsOf("4SI2",1).length}<small> séances</small></div>
      <div class="foo">${sessionsOf("3SI1",1).length} (3SI1) + ${sessionsOf("4SI2",1).length} (4SI2), par groupe</div>
    </div>
  </div>

  <div class="grid g2" style="align-items:start;margin-bottom:16px">
    <div class="card">
      <div class="card-h"><h3>${ic("grid")} Grille hebdomadaire — horaires et groupes</h3><span class="badge b-grey">Lundi → Vendredi</span></div>
      <div class="card-b">
        <div class="tbl-wrap" style="max-height:none">
          <table class="tbl">
            <thead><tr><th style="width:90px">Jour</th><th>3SI1</th><th>4SI2</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="note tiny" style="margin-top:10px">${ic("pin")} Les deux groupes d'une même classe suivent le même programme : la séance du jour est assurée une première fois avec le Groupe 1, puis reprise avec le Groupe 2. Le contenu pédagogique et les évaluations sont donc communs aux deux groupes.</div>
      </div>
    </div>
    <div class="stack">
      <div class="card">
        <div class="card-h"><h3>${ic("edit")} Horaires des créneaux (modifiables)</h3></div>
        <div class="card-b">${editeur}
          <div class="note tiny">Modifiez une heure puis validez : la grille, le tableau de bord et les fiches de séance sont recalculés immédiatement. La structure retenue (4SI2 : lundi &amp; vendredi 8 h–12 h — 3SI1 : mardi 8 h–12 h, jeudi 13 h–17 h) correspond à l'emploi du temps transmis.</div>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${ic("sun")} Séances de la semaine</h3><span class="badge b-grey">${weekLabel(t)}</span></div>
        <div class="card-b tight">${semaine}</div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${ic("list")} Récapitulatif annuel des séances</h3><span class="badge b-grey">par groupe</span></div>
        <div class="card-b tight">
          <table class="tbl" style="font-size:12.5px">
            <thead><tr><th>Classe</th><th>1<sup>er</sup> trim.</th><th>2<sup>e</sup> trim.</th><th>3<sup>e</sup> trim.</th><th>Total</th></tr></thead>
            <tbody>
              ${CLS.map(c => `
                <tr>
                  <td><strong>${CLASSES[c].short}</strong><div class="tiny muted">${CLASSES[c].dayTxt}</div></td>
                  <td>${sessionsOf(c,1).length} s.<div class="tiny muted">${sessionsOf(c,1).length*CLASSES[c].heures*CLASSES[c].groupes} h</div></td>
                  <td>${sessionsOf(c,2).length} s.<div class="tiny muted">${sessionsOf(c,2).length*CLASSES[c].heures*CLASSES[c].groupes} h</div></td>
                  <td>${sessionsOf(c,3).length} s.<div class="tiny muted">${sessionsOf(c,3).length*CLASSES[c].heures*CLASSES[c].groupes} h</div></td>
                  <td><strong>${SESSIONS[c].length}</strong> s.<div class="tiny muted">${SESSIONS[c].length*CLASSES[c].heures*CLASSES[c].groupes} h</div></td>
                </tr>`).join("")}
            </tbody>
          </table>
          <div class="note tiny" style="margin-top:10px">Les heures indiquées correspondent au temps d'enseignement face aux <strong>deux groupes</strong> (une séance = 2 h par groupe, soit 4 h d'enseignement). Le total annuel tient compte automatiquement des jours fériés, des vacances et des semaines bloquées. Pour 4SI2, la période d'enseignement s'achève à la mi-mai 2027 (épreuves du Baccalauréat en juin) ; pour 3SI1, elle s'achève avec la semaine bloquée de fin mai 2027, le mois de juin étant consacré aux épreuves nationales, aux corrections et aux conseils de classe.</div>
        </div>
      </div>
    </div>
  </div>`;
}
function setTime(cls, key, val){ store.times[cls][key] = val; save(true); toast("Créneau de "+cls+" mis à jour"); }
/* ---------- horaires : helpers ---------- */
function hh(t){ return String(t).replace(":", "h"); }
function slotsOf(cls, iso){ return (store.times[cls] || {})[D(iso).getDay()] || []; }
function slotsOfDay(cls, dow){ return (store.times[cls] || {})[dow] || []; }
function blocTxt(cls){
  return (CLASSES[cls].days || []).map(d => JOURS[d].slice(0,3) + ". " + slotRange(cls, d)).join(" &amp; ");
}
function slotRange(cls, dow){
  const sl = slotsOfDay(cls, dow);
  return sl.length ? hh(sl[0].s) + "–" + hh(sl[sl.length-1].e) : "—";
}
function blockRange(cls, dow){ const s = slotsOfDay(cls, dow); return s.length ? hh(s[0].s) + " – " + hh(s[s.length-1].e) : "—"; }
function slotsTxt(cls, iso){
  return slotsOf(cls, iso).map(b => b.g.replace("Groupe", "Gr.") + " " + hh(b.s) + "-" + hh(b.e)).join(" • ");
}
function setSlot(cls, dow, idx, key, val){
  const s = store.times[cls][dow][idx];
  s[key] = val;
  save(true);
  toast(CLASSES[cls].short + " — " + JOURS[dow] + " " + s.g + " : " + hh(s.s) + " – " + hh(s.e));
}
function weeklyHours(cls){
  let h = 0;
  (CLASSES[cls].days || []).forEach(d => slotsOfDay(cls, d).forEach(b => { h += heuresEntre(b.s, b.e); }));
  return h;
}
function heuresEntre(s, e){
  const p = t => parseInt(t.slice(0,2),10)*60 + parseInt(t.slice(3),10);
  return Math.max(0, Math.round((p(e)-p(s))/60 * 10) / 10);
}
function shortTitle(s){ if(!s) return "—"; const o = store.seances[s.cls+"|"+s.n] || {}; const t = o.title || (s.blk ? s.blk.t : "À planifier"); return "Séance n°"+s.n+" : " + (t.length>70 ? t.slice(0,68)+"…" : t); }
function nextOf(dow, cls){ const t = todayISO(); return SESSIONS[cls].find(s => D(s.iso).getDay() === dow && s.iso >= t) || SESSIONS[cls].find(s => D(s.iso).getDay() === dow) || null; }
function nextOccurrence(dow){
  let iso = todayISO();
  for (let i=0;i<14;i++){ if (D(iso).getDay() === dow) return iso; iso = addDays(iso,1); }
  return iso;
}
function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

/* ---------------- 3. CALENDRIER TUNISIEN ---------------- */
let calY = 2026, calM = 8, calCls = "both";
function renderCal(){
  const t = todayISO();
  const first = new Date(calY, calM, 1);
  const startDow = (first.getDay()+6)%7;
  const daysInMonth = new Date(calY, calM+1, 0).getDate();
  const cells = [];
  for (let i=0;i<startDow;i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(ISO(new Date(calY, calM, d)));

  const cellHtml = cells.map(iso => {
    if (!iso) return '<div class="cell out"></div>';
    const vac = vacationOf(iso), fer = ferieOf(iso), sus = suspensionOf(iso);
    const cls = ["vac","hol","today"].filter(x => (x==="vac"&&vac)||(x==="hol"&&fer)||(x==="today"&&iso===t)).join(" ");
    const list = ["3SI1","4SI2"].filter(c => calCls==="both" || calCls===c)
      .map(c => SESSIONS[c].find(s => s.iso === iso)).filter(Boolean);
    const jal = jalonsOf(iso).filter(j => j.type!=="hol");
    return `<div class="cell ${cls}">
      <div class="dn"><span>${D(iso).getDate()}</span>${vac?'<span class="tiny muted">vac.</span>':''}</div>
      ${fer?`<div class="ev ev-h">🎌 ${fer.label.split("(")[0].trim()}</div>`:""}
      ${sus?`<div class="ev ev-e">📕 ${sus.classes?sus.classes.join("/")+" — ":""}suspension</div>`:""}
      ${list.map(s => `<div class="ev ev-s ${s.cls==="4SI2"?"b4":""}" title="${escapeHtml(titleOf(s,store))}">${s.cls} • S${s.n}</div>`).join("")}
      ${jal.filter(j=>j.type!=="info"&&j.type!=="start").slice(0,1).map(j => `<div class="ev ev-e">${j.label.replace(/<[^>]+>/g,"").slice(0,38)}</div>`).join("")}
    </div>`;
  }).join("");

  const vacsRows = VACANCES.map(v => {
    const n = diffDays(v.from, v.to) + 1;
    return `<tr><td><strong>${v.label}</strong></td><td>${fmtLong(v.from)}</td><td>${fmtLong(v.to)}</td><td>${n} jours</td><td>${fmtLong(addDays(v.to,1))}</td></tr>`;
  }).join("");
  const ferRows = FERIES.concat([{date:"2027-07-25", label:"Fête de la République (hors année scolaire)"}]).map(f => {
    const dow = D(f.date).getDay();
    const impact = ["3SI1","4SI2"].filter(c => CLASSES[c].days.includes(dow) && !vacationOf(f.date));
    return `<tr><td>${fmtLong(f.date)}</td><td>${f.label}</td><td>${impact.length?impact.map(i=>'<span class="badge b-rose">'+i+'</span>').join(" "):'<span class="badge b-grey">sans effet</span>'}</td></tr>`;
  }).join("");
  const jalRows = JALONS.map(j => {
    const cls = j.type==="vac"?"b-amber":j.type==="hol"?"b-rose":j.type==="eval"?"b-blue":j.type==="bloc"?"b-navy":j.type==="end"?"b-navy":"b-grey";
    return `<tr><td style="white-space:nowrap">${j.date ? fmtShort(j.date) : fmtShort(j.from)+" → "+fmtShort(j.to)}</td>
      <td><strong>${j.label}</strong>${j.s?'<div class="tiny muted">'+j.s+'</div>':''}</td>
      <td><span class="badge ${cls}">${({vac:"vacances",hol:"férié",eval:"évaluation",bloc:"semaine bloquée",admin:"administration",info:"info",start:"rentrée",end:"clôture"})[j.type]}</span></td></tr>`;
  }).join("");

  document.getElementById("v-cal").innerHTML = `
  <div class="sec-head">
    <div>
      <h2>${ic("calendar")} Calendrier scolaire tunisien — 2026 / 2027</h2>
      <p class="lead">Calendrier officiel du ministère de l'Éducation (année scolaire 2026-2027) croisé avec les créneaux des deux classes. Les séances tombant un jour férié, pendant les vacances ou durant une semaine bloquée sont automatiquement retirées du planning.</p>
    </div>
    <div class="row no-print">
      <div class="search">${ic("search")}<input type="text" placeholder="Filtrer un événement…" oninput="filterCal(this.value)"></div>
      <select style="width:auto" onchange="calCls=this.value;renderCal()">
        <option value="both" ${calCls==="both"?"selected":""}>Les deux classes</option>
        <option value="3SI1" ${calCls==="3SI1"?"selected":""}>3SI1 seulement</option>
        <option value="4SI2" ${calCls==="4SI2"?"selected":""}>4SI2 seulement</option>
      </select>
    </div>
  </div>

  <div class="grid g2" style="align-items:start;margin-bottom:16px">
    <div class="card">
      <div class="card-h">
        <h3>${ic("calendar")} ${MOIS[calM].charAt(0).toUpperCase()+MOIS[calM].slice(1)} ${calY}</h3>
        <div class="row no-print">
          <button class="btn btn-xs btn-line" onclick="calShift(-1)">◀</button>
          <button class="btn btn-xs btn-line" onclick="calToday()">Aujourd’hui</button>
          <button class="btn btn-xs btn-line" onclick="calShift(1)">▶</button>
        </div>
      </div>
      <div class="card-b">
        <div class="cal-head">${["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j=>'<div>'+j+'</div>').join("")}</div>
        <div class="cal">${cellHtml}</div>
        <div class="legend" style="margin-top:12px">
          <span><i class="sq" style="background:#dcecfb"></i> séance 3SI1</span>
          <span><i class="sq" style="background:#d7f3ee"></i> séance 4SI2</span>
          <span><i class="sq" style="background:#efe6ff"></i> évaluation / suspension</span>
          <span><i class="sq" style="background:#fbeccd"></i> vacances</span>
          <span><i class="sq" style="background:#fbdde3"></i> jour férié</span>
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-h"><h3>${ic("sun")} Vacances scolaires</h3><span class="badge b-amber">${VACANCES.length} périodes</span></div>
        <div class="card-b tight">
          <table class="tbl" style="font-size:12.5px">
            <thead><tr><th>Période</th><th>Du</th><th>Au</th><th>Durée</th><th>Reprise</th></tr></thead>
            <tbody>${vacsRows}</tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${ic("flag")} Jours fériés et jours de fête nationale</h3></div>
        <div class="card-b tight">
          <table class="tbl" style="font-size:12.5px">
            <thead><tr><th>Date</th><th>Fête</th><th>Impact sur les séances</th></tr></thead>
            <tbody>${ferRows}</tbody>
          </table>
          <div class="note warn tiny" style="margin-top:10px">${ic("alert")} <strong>Dates à confirmer</strong> (fixées par l'observation lunaire ou par publication du ministère) :
            ${A_CONFIRMER.map(a => '<div style="margin-top:5px">• <strong>'+a.label+'</strong> — '+a.periode+' <span class="muted">('+a.note+')</span></div>').join("")}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-h"><h3>${ic("list")} Jalons officiels de l'année (surveillance continue, saisie des notes, conseils de classe)</h3>
      <span class="badge b-blue">Calendrier 2026-2027 publié par le ministère de l'Éducation</span></div>
    <div class="card-b tight">
      <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th style="width:190px">Période</th><th>Événement</th><th style="width:150px">Nature</th></tr></thead>
          <tbody id="cal-jalons">${jalRows}</tbody>
        </table>
      </div>
      <div class="note tiny" style="margin-top:10px">${ic("pin")} Le régime de la surveillance continue prévoit, pour le <strong>1<sup>er</sup> trimestre</strong>, des devoirs de contrôle jusqu'au 21 novembre 2026 et des devoirs de synthèse du 23 novembre au 12 décembre 2026 ; pour la <strong>4<sup>ème</sup> année secondaire</strong>, les devoirs du 3<sup>e</sup> trimestre se déroulent du 5 au 12 mai 2027 (épreuves du Baccalauréat en juin).</div>
    </div>
  </div>`;
}
function calShift(n){ const dt = new Date(calY, calM+n, 1); calY = dt.getFullYear(); calM = dt.getMonth(); renderCal(); }
function calToday(){ const t = D(todayISO()); calY = t.getFullYear(); calM = t.getMonth(); renderCal(); }
function filterCal(v){
  const q = v.toLowerCase();
  document.querySelectorAll("#cal-jalons tr").forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? "" : "none";
  });
}

/* ---------------- 4. RÉPARTITION ---------------- */
function setRep(cls){ repCls = cls; renderRep(); }
function setTri(t){ repTri = t; renderRep(); }
function renderRep(){
  const cls = repCls, cfg = CLASSES[cls];
  const list = sessionsOf(cls, repTri);
  const t = todayISO();
  const done = list.filter(s => { const st = seanceState(s); return st==="faite"||st==="passee"; }).length;
  const pct = Math.round(done/list.length*100) || 0;
  const dcList = evalDates(cls,"dc");

  const triStart = { 1:"2026-09-15", 2:"2027-01-01", 3:"2027-03-15" }[repTri];
  const triEnd   = { 1:"2026-12-31", 2:"2027-03-14", 3:SCHOOL.finAnnee }[repTri];

  const rows = list.map(s => {
    const st = seanceState(s);
    const k = s.blk ? s.blk.k : "cours";
    const o = store.seances[cls+"|"+s.n] || {};
    const titre = titleOf(s, store);
    const det = o.contenu || (s.blk ? s.blk.det : "Contenu à définir par l'enseignant (séance générée automatiquement).");
    const inEval = jalonsForClass(s.iso, cls).some(j => j.type==="eval" || j.type==="bloc");
    const badges = [
      st==="faite" ? '<span class="badge b-green">✓ réalisée</span>' : "",
      st==="passee" && !o.done ? '<span class="badge b-amber">échue — à confirmer</span>' : "",
      st==="avenir" ? '<span class="badge b-grey">à venir</span>' : "",
      st==="reportee" ? '<span class="badge b-rose">reportée</span>' : "",
      s.iso===t ? '<span class="badge b-blue">aujourd’hui</span>' : "",
      inEval ? '<span class="badge b-navy">période d’évaluation</span>' : "",
      k==="dc" ? '<span class="badge b-navy">devoir de contrôle</span>' : "",
      k==="corr" ? '<span class="badge b-navy">correction</span>' : ""
    ].filter(Boolean).join(" ");
    return `<tr class="${st==="avenir"?"":(st==="faite"||st==="passee")?"is-past ":""}${s.iso===t?"is-today":""}${k!=="cours"?" is-eval":""}">
      <td class="n">${s.n}</td>
      <td style="white-space:nowrap">${jourS(s.iso)} <strong>${fmtShort(s.iso)}</strong>
        <div class="tiny muted">${s.iso < triStart || s.iso > triEnd ? "hors période" : "sem. "+s.sem}</div>
        <div class="tiny" style="margin-top:3px">${slotsOf(cls, s.iso).map(b => '<span class="badge b-grey" style="margin:1px 0">'+b.g.replace("Groupe","Gr.")+' '+hh(b.s)+'-'+hh(b.e)+'</span>').join(" ")}</div></td>
      <td><div class="tt">${escapeHtml(titre)}</div><div class="det">${det}</div>${o.devoirs?'<div class="tiny" style="margin-top:4px">📚 <strong>Travail donné :</strong> '+escapeHtml(o.devoirs)+'</div>':''}${o.obs?'<div class="tiny muted">📝 '+escapeHtml(o.obs)+'</div>':''}</td>
      <td class="hide-sm"><span class="badge b-grey">${s.blk ? s.blk.d : "—"}</span><div class="tiny muted" style="margin-top:4px">${s.blk ? s.blk.o : ""}</div></td>
      <td style="white-space:nowrap">${badges}
        <div class="row no-print" style="margin-top:6px">
          <button class="btn btn-xs btn-soft" onclick="openModal('${cls}',${s.n})">${ic("edit")} Fiche</button>
          <button class="btn btn-xs btn-line" onclick="toggleDone('${cls}',${s.n})">${st==="faite"?"Annuler":"Marquer faite"}</button>
        </div></td>
    </tr>`;
  }).join("");

  document.getElementById("v-rep").innerHTML = `
  <div class="sec-head">
    <div>
      <h2>${ic("list")} Répartition trimestrielle — contenu officiel replacé sur le calendrier 2026/2027</h2>
      <p class="lead">Le contenu provient des documents de répartition fournis (1<sup>er</sup> trimestre). Les <strong>dates réelles</strong> sont calculées séance par séance selon les créneaux de chaque classe (chaque séance est assurée avec le Groupe 1 puis reprise avec le Groupe 2) et selon le calendrier tunisien : jours fériés, vacances et semaines bloquées sont automatiquement exclus. Cliquez sur « Fiche » pour consigner le contenu réellement traité, les devoirs donnés et vos observations.</p>
    </div>
    <div class="row no-print">
      <div class="row" style="gap:6px">
        ${["3SI1","4SI2"].map(c => `<button class="btn btn-xs ${repCls===c?"btn-blue":"btn-line"}" onclick="setRep('${c}')">${CLASSES[c].short}</button>`).join("")}
      </div>
      <div class="row" style="gap:6px">
        ${[1,2,3].map(x => `<button class="btn btn-xs ${repTri===x?"btn-blue":"btn-line"}" onclick="setTri(${x})">${x}<sup>${x===1?"er":"e"}</sup> trim.</button>`).join("")}
      </div>
    </div>
  </div>

  <div class="grid g4" style="margin-bottom:16px">
    <div class="kpi"><div class="lbl">${ic("grid")} Classe</div><div class="val" style="font-size:20px">${cfg.short}</div><div class="foo">${blocTxt(cls)} • 2 groupes de ${cfg.heures} h</div></div>
    <div class="kpi k-teal"><div class="lbl">${ic("list")} Séances du trimestre</div><div class="val">${list.length}</div><div class="foo">${list.length*cfg.heures} h par groupe &bull; ${list.length*cfg.heures*cfg.groupes} h d'enseignement</div></div>
    <div class="kpi k-amber"><div class="lbl">${ic("check")} Avancement</div><div class="val">${pct}<small> %</small></div><div class="foo">${done} séance(s) réalisée(s) / échue(s)</div></div>
    <div class="kpi k-rose"><div class="lbl">${ic("flag")} Épreuves</div>
      <div class="val" style="font-size:17px">${repTri===1 ? "DC1 "+ (dcList[0]?fmtJM(dcList[0]):"—") + " • DC2 " + (dcList[1]?fmtJM(dcList[1]):"—") : "—"}</div>
      <div class="foo">${repTri===1 ? "DS1 : " + fmtShort(DS1[cls].main) + " (semaine bloquée)" : "Voir le calendrier officiel"}</div></div>
  </div>

  <div class="card">
    <div class="card-h">
      <h3>${ic("list")} ${cfg.long} — ${repTri === 1 ? "1<sup>er</sup>" : repTri + "<sup>e</sup>"} trimestre</h3>
      <div class="row">
        <span class="badge b-grey">du ${fmtShort(triStart)} au ${fmtShort(triEnd)}</span>
        <button class="btn btn-xs btn-line no-print" onclick="window.print()">${ic("print")} Imprimer</button>
      </div>
    </div>
    <div class="card-b">
      ${repTri===1 ? `<div class="note" style="margin-bottom:12px">${ic("pin")} <strong>Contenu conforme aux documents « Répartition Trimestrielle (1) prévisionnelle »</strong> (3<sup>ème</sup> et 4<sup>ème</sup> année SI — matière STI). Les dates ont été recalculées pour l'année 2026-2027 : la rentrée des élèves a lieu le mardi 15 septembre 2026, les vacances de mi-trimestre du 26 octobre au 1<sup>er</sup> novembre 2026 et la semaine bloquée des devoirs de synthèse du 7 au 12 décembre 2026.</div>` :
        `<div class="note warn" style="margin-bottom:12px">${ic("alert")} Le document de répartition fourni ne couvre que le 1<sup>er</sup> trimestre. Pour le ${repTri}<sup>e</sup> trimestre, les dates réelles des séances sont calculées à partir du calendrier officiel ; utilisez le bouton « Fiche » pour saisir le contenu de chaque séance (enregistré automatiquement). Les jalons d'évaluation officiels sont rappelés dans l'onglet « Calendrier tunisien ».</div>`}
      <div class="tbl-wrap">
        <table class="tbl">
          <thead><tr><th style="width:52px">N°</th><th style="width:120px">Date</th><th>Contenu de la séance</th><th style="width:170px" class="hide-sm">Domaine</th><th style="width:220px">État</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5" class="muted">Aucune séance sur cette période.</td></tr>'}</tbody>
        </table>
      </div>
      ${repTri===1 ? `<div class="note tiny" style="margin-top:12px">${ic("pin")} <strong>Fidélité aux documents :</strong> la numérotation des séances est recalculée automatiquement à partir des créneaux réels et du calendrier tunisien. Elle correspond au document officiel (3SI1 : 23 séances — 4SI2 : 22 séances), à deux détails près : le document de la 4<sup>ème</sup> année passe de la séance 13 à la séance 15 (coquille de frappe, corrigée ici en 14-15) et le rang de la dernière séance de 4SI2 diffère d'une unité pour la même raison. Par ailleurs, le jeudi 15 octobre 2026 étant férié (Fête de l'Évacuation), la 3SI1 ne dispose que de la séance du mardi 13 octobre lors de la semaine du 12 au 17 octobre, ce que prévoyait déjà la répartition officielle.</div>` : ""}
      <div class="row" style="justify-content:space-between;margin-top:10px">
        <div class="tiny muted">${list.length} séances • ${list.length*cfg.heures} heures • ${repTri===1?(cfg.short==="3SI1"?"Progression du document : séances 1 à 23":"Progression du document : séances 1 à 22 avec corrections du DS1 après les vacances d'hiver"):"Contenu à planifier"}</div>
        <button class="btn btn-xs btn-line no-print" onclick="resetCls('${cls}')">Réinitialiser les fiches de ${cfg.short}</button>
      </div>
    </div>
  </div>

  ${repTri===1 ? `<div class="card" style="margin-top:16px">
    <div class="card-h"><h3>${ic("flag")} Semaine bloquée — devoir de synthèse n°1 (7 → 12 décembre 2026)</h3></div>
    <div class="card-b">
      <div class="grid g2">
        ${["3SI1","4SI2"].map(c => `<div class="tile">
          <div class="ic">${ic("flag")}</div>
          <div>
            <strong>${CLASSES[c].short}</strong>
            <div class="small">Épreuve principale : <strong>${fmtLong(DS1[c].main)}</strong> (${slotsTxt(c, DS1[c].main)})</div>
            <div class="tiny muted">Créneaux de la semaine : ${DS1[c].dates.map(dt=>jourS(dt)+" "+fmtShort(dt)).join(" • ")}</div>
            <div class="tiny" style="margin-top:4px">Correction et remise des copies : ${c==="3SI1" ? "mardi 29 et jeudi 31 décembre 2026 (séances n°22 et n°23)" : "lundi 28 décembre 2026 (la séance du vendredi 1<sup>er</sup> janvier 2027 est un jour férié)"}.</div>
          </div></div>`).join("")}
      </div>
    </div></div>` : ""}`;
}
function toggleDone(cls, n){
  const key = cls+"|"+n, o = store.seances[key] || {};
  const s = SESSIONS[cls].find(x => x.n===n);
  const st = seanceState(s);
  o.done = (st === "faite") ? false : true;
  store.seances[key] = o;
  save(true); toast("État de la séance n°"+n+" ("+cls+") mis à jour");
}
function resetCls(cls){
  if(!confirm("Effacer toutes les fiches (contenus, devoirs, observations) de la classe "+cls+" ?")) return;
  Object.keys(store.seances).forEach(k => { if (k.startsWith(cls+"|")) delete store.seances[k]; });
  save(true); toast("Fiches de "+cls+" réinitialisées");
}


/* ---------------- 5. PROGRAMME, COMPÉTENCES, ANNEXES ET SÉANCES ---------------- */
function compSavoirs(cls, code){
  const P = PROGRAMME[cls];
  for (const dm of P.domaines) {
    const cp = dm.comps.find(x => x.code === code);
    if (cp) return cp;
  }
  return null;
}
function blocsTxt(cls, nums){
  if (!nums || !nums.length) return "";
  const list = SESSIONS[cls].filter(s => s.blk && nums.includes(s.blk._i || -1));
  return list.map(s => fmtShort(s.iso)).join(" • ");
}
function blocsSeances(cls, nums){
  if (!nums || !nums.length) return [];
  return SESSIONS[cls].filter(s => s.blk && nums.includes(s.blk._i || -1));
}
function renderProg(){
  const zone = document.getElementById("v-prog");
  zone.innerHTML = `
  <div class="sec-head">
    <div>
      <h2>${ic("target")} Programme, compétences et supports</h2>
      <p class="lead">Chaque compétence officielle de l'<strong>aide pédagogique STI</strong> est reliée à trois éléments : les <strong>savoirs associés</strong> du programme, les <strong>éléments correspondants de vos annexes</strong> (HTML5, CSS3, JavaScript, PHP, SQL) et les <strong>séances du 1<sup>er</sup> trimestre</strong> qui la traitent, avec leurs dates réelles. Deux accès directs : l'<a href="docs/Aide-pedagogique-STI-3-4-2024.pdf" target="_blank">aide pédagogique</a> et le dossier des <a href="docs/Annexe-HTML5.pdf" target="_blank">annexes</a> (ou l'onglet « Annexes &amp; mémo »).</p>
    </div>
    <div class="row no-print">
      <a class="btn btn-xs btn-line" href="docs/Aide-pedagogique-STI-3-4-2024.pdf" target="_blank">${ic("file")} Aide pédagogique</a>
      <a class="btn btn-xs btn-line" href="docs/Annexe-HTML5.pdf" target="_blank">${ic("file")} Annexe HTML5</a>
      <a class="btn btn-xs btn-line" href="docs/Annexe-CSS3.pdf" target="_blank">${ic("file")} Annexes CSS3 / JS / PHP / SQL</a>
      <button class="btn btn-xs btn-soft" onclick="go('v-ref')">${ic("book")} Ouvrir le mémo</button>
    </div>
  </div>
  ${["3SI1","4SI2"].map(cls => {
    const P = PROGRAMME[cls];
    return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-h">
        <h3>${ic("target")} ${P.titre}</h3>
        <div class="row">
          <span class="badge ${cls==="3SI1"?"b-blue":"b-teal"}">${CLASSES[cls].dayTxt}</span>
          <span class="badge b-grey">${COMPETENCES[cls].length} compétences</span>
        </div>
      </div>
      <div class="card-b">
        <p class="tiny muted" style="margin-bottom:12px">${P.sous}</p>
        ${COMPETENCES[cls].map(cp => {
          const sav = compSavoirs(cls, cp.code);
          const seances = blocsSeances(cls, cp.blocs);
          const evals = blocsSeances(cls, cp.eval);
          const t1 = cp.blocs.length > 0;
          return `
          <details class="acc" ${t1 ? "open" : ""} style="margin-bottom:10px">
            <summary>
              <span class="badge ${t1 ? "b-green" : "b-grey"}">${cp.code}</span>
              <span>${cp.t}</span>
              <span class="badge b-grey" style="margin-left:6px">${cp.domaine}</span>
              ${t1 ? '<span class="badge b-blue" style="margin-left:6px">1<sup>er</sup> trimestre</span>' : '<span class="badge b-amber" style="margin-left:6px">'+(cp.periode||"")+'</span>'}
              <span class="arrow">${ic("chev")}</span>
            </summary>
            <div class="acc-b">
              <p class="small" style="color:var(--ink-2);margin-bottom:10px">${cp.sous}</p>

              <div class="row" style="gap:8px;margin-bottom:10px">
                <span class="badge b-navy">${ic("list")} Savoirs associés (aide pédagogique)</span>
                <span class="badge b-grey">${cp.aide}</span>
              </div>
              ${sav ? `<ul style="margin-bottom:12px">${sav.items.map(x => '<li class="small" style="margin-bottom:3px">'+x+'</li>').join("")}</ul>` : ""}
              ${sav && sav.piste ? `<div class="note tiny" style="margin-bottom:12px">${ic("pin")} ${sav.piste}</div>` : ""}

              <div class="row" style="gap:8px;margin-bottom:8px">
                <span class="badge b-navy">${ic("book")} Contenu des annexes à mobiliser</span>
              </div>
              <div class="row" style="gap:6px;margin-bottom:10px">
                ${cp.memo.map(id => {
                  const m = MEMO.find(x => x.id === id);
                  return m ? '<button class="btn btn-xs btn-soft" onclick="go(\'v-ref\');openMemo(\''+id+'\')">'+ic(m.ico)+m.t.split("—")[0].trim()+'</button>' : "";
                }).join("")}
                ${cp.annexes.map(a => '<a class="btn btn-xs btn-line" href="'+a+'" target="_blank">'+ic("file")+a.split("/").pop().replace("Annexe-","Annexe ").replace(".pdf","")+'</a>').join("")}
              </div>

              ${seances.length ? `
                <div class="row" style="gap:8px;margin-bottom:8px">
                  <span class="badge b-navy">${ic("clock")} Séances du 1<sup>er</sup> trimestre</span>
                  <span class="badge b-grey">${seances.length} séances &bull; ${seances.length*CLASSES[cls].heures} h par groupe</span>
                </div>
                <div class="tbl-wrap" style="max-height:none;margin-bottom:10px">
                  <table class="tbl"><thead><tr><th style="width:60px">N°</th><th style="width:120px">Date</th><th>Contenu de la séance</th><th style="width:120px">Domaine</th></tr></thead>
                  <tbody>${seances.map(s => `<tr>
                    <td class="n">${s.n}</td>
                    <td style="white-space:nowrap">${jourS(s.iso)} ${fmtShort(s.iso)}</td>
                    <td><div class="tt">${escapeHtml(titleOf(s, store))}</div></td>
                    <td><span class="badge b-grey">${s.blk.d}</span></td></tr>`).join("")}
                  </tbody></table>
                </div>
                ${evals.length ? '<div class="tiny muted" style="margin-bottom:10px">Évaluation rattachée : '+evals.map(s => jourS(s.iso)+" "+fmtShort(s.iso)+" ("+s.blk.t+")").join(" • ")+'</div>' : ""}
              ` : '<div class="note warn tiny" style="margin-bottom:10px">'+ic("alert")+' Cette compétence n\'est pas traitée au 1<sup>er</sup> trimestre : '+(cp.periode||"planification ultérieure")+'. Les supports et le mémo restent disponibles dès maintenant.</div>'}

              <div class="grid g2" style="gap:12px">
                <div class="tile"><div class="ic">${ic("pen")}</div><div>
                  <strong class="small">Activité de classe proposée</strong>
                  <div class="tiny muted" style="margin-top:3px">${cp.atelier}</div></div></div>
                <div class="tile"><div class="ic">${ic("check")}</div><div>
                  <strong class="small">Ce que l'élève doit savoir faire</strong>
                  <ul style="margin:4px 0 0">${cp.attendu.map(x => '<li class="tiny" style="margin-bottom:2px">'+x+'</li>').join("")}</ul></div></div>
              </div>
            </div>
          </details>`;
        }).join("")}
      </div>
    </div>`;
  }).join("")}

  <div class="card">
    <div class="card-h"><h3>${ic("pin")} Directives générales de l'aide pédagogique</h3></div>
    <div class="card-b">
      <div class="grid g3">
        <div class="tile"><div class="ic">${ic("check")}</div><div><strong>Convention d'écriture</strong><div class="tiny muted">Clé primaire soulignée, clé étrangère suivie du symbole # ; cardinalités 1:1, 1:n et n:m.</div></div></div>
        <div class="tile"><div class="ic">${ic("db")}</div><div><strong>Bases de données</strong><div class="tiny muted">Exemples simplifiés (4 tables au maximum) touchant le vécu de l'apprenant ; SGBDR MySQL ; standard SQL.</div></div></div>
        <div class="tile"><div class="ic">${ic("js")}</div><div><strong>JavaScript</strong><div class="tiny muted">Le script est stocké dans un fichier externe ; le contrôle des champs se fait en JavaScript, sans attribut pattern.</div></div></div>
        <div class="tile"><div class="ic">${ic("web")}</div><div><strong>Web</strong><div class="tiny muted">HTML5 : traiter les attributs de chaque élément (voir annexe) ; validation systématique des documents HTML5 et CSS3.</div></div></div>
        <div class="tile"><div class="ic">${ic("cpu")}</div><div><strong>3SI1 — objets connectés</strong><div class="tiny muted">Micro-Python ou Arduino, carte ESP32 : configuration réseau, échange de données et téléversement du programme.</div></div></div>
        <div class="tile"><div class="ic">${ic("server")}</div><div><strong>4SI2 — PHP</strong><div class="tiny muted">Exploiter en PHP des requêtes SQL générées en mode assisté ; manipulation de la date et de l'heure.</div></div></div>
      </div>
    </div>
  </div>`;
}


/* ---------------- 6. CAHIER DE TEXTES ---------------- */
let cahCls = "both", cahTri = 1;
function renderCahier(){
  const t = todayISO();
  const list = [];
  ["3SI1","4SI2"].forEach(c => {
    if (cahCls!=="both" && cahCls!==c) return;
    sessionsOf(c, cahTri).forEach(s => list.push(s));
  });
  list.sort((a,b) => b.iso.localeCompare(a.iso));
  const done = list.filter(s => { const st = seanceState(s); return st==="faite"||st==="passee"; }).length;

  document.getElementById("v-cahier").innerHTML = `
  <div class="sec-head">
    <div>
      <h2>${ic("pen")} Cahier de textes numérique</h2>
      <p class="lead">Relevé chronologique des séances réellement assurées : contenu traité, travail donné à la maison, observations. Chaque ligne est rattachée à une séance datée de la répartition.</p>
    </div>
    <div class="row no-print">
      <select style="width:auto" onchange="cahCls=this.value;renderCahier()">
        <option value="both" ${cahCls==="both"?"selected":""}>Les deux classes</option>
        <option value="3SI1" ${cahCls==="3SI1"?"selected":""}>3SI1</option>
        <option value="4SI2" ${cahCls==="4SI2"?"selected":""}>4SI2</option>
      </select>
      <select style="width:auto" onchange="cahTri=+this.value;renderCahier()">
        <option value="1" ${cahTri===1?"selected":""}>1<sup>er</sup> trimestre</option>
        <option value="2" ${cahTri===2?"selected":""}>2<sup>e</sup> trimestre</option>
        <option value="3" ${cahTri===3?"selected":""}>3<sup>e</sup> trimestre</option>
      </select>
      <button class="btn btn-xs btn-line" onclick="window.print()">${ic("print")} Imprimer</button>
    </div>
  </div>

  <div class="grid g3" style="margin-bottom:16px">
    <div class="kpi"><div class="lbl">${ic("list")} Séances de la période</div><div class="val">${list.length}</div><div class="foo">${cahCls==="both"?"3SI1 + 4SI2":cahCls} • ${cahTri}<sup>${cahTri===1?"er":"e"}</sup> trimestre</div></div>
    <div class="kpi k-teal"><div class="lbl">${ic("check")} Séances assurées</div><div class="val">${done}</div><div class="foo">${list.length?Math.round(done/list.length*100):0}% du trimestre</div></div>
    <div class="kpi k-amber"><div class="lbl">${ic("pen")} Fiches renseignées</div><div class="val">${Object.keys(store.seances).length}</div><div class="foo">contenus, devoirs et observations enregistrés</div></div>
  </div>

  <div class="card">
    <div class="card-h"><h3>${ic("clock")} Relevé chronologique</h3><span class="badge b-grey">${list.length} entrées</span></div>
    <div class="card-b">
      <div class="tl">
        ${list.map(s => {
          const o = store.seances[s.cls+"|"+s.n] || {};
          const st = seanceState(s);
          const flag = s.blk && s.blk.k!=="cours";
          return `<div class="tl-item ${flag?"t-eval":""}">
            <div class="spread">
              <div>
                <div class="d">${fmtLong(s.iso)} • <span class="badge ${s.cls==="3SI1"?"b-blue":"b-teal"}">${s.cls}</span>
                  ${st==="faite"?'<span class="badge b-green">assurée</span>':st==="passee"?'<span class="badge b-amber">à confirmer</span>':st==="reportee"?'<span class="badge b-rose">reportée</span>':'<span class="badge b-grey">à venir</span>'}
                </div>
                <div class="t">Séance n°${s.n} — ${escapeHtml(titleOf(s,store))}</div>
                <div class="s">${o.contenu ? escapeHtml(o.contenu) : (s.blk ? s.blk.det : "—")}</div>
                <div class="tiny muted" style="margin-top:3px">${slotsTxt(s.cls, s.iso)}</div>
                ${o.devoirs ? '<div class="tiny" style="margin-top:4px;color:var(--amber)">📚 Travail donné : '+escapeHtml(o.devoirs)+'</div>':""}
                ${o.obs ? '<div class="tiny muted">📝 '+escapeHtml(o.obs)+'</div>':""}
              </div>
              <button class="btn btn-xs btn-soft no-print" onclick="openModal('${s.cls}',${s.n})">${ic("edit")} Modifier</button>
            </div>
          </div>`;
        }).join("") || '<p class="muted tiny">Aucune séance pour ce filtre.</p>'}
      </div>
    </div>
  </div>`;
}


/* ---------------- 7. ANNEXES, MÉMO CONSOLIDÉ ET SYNCHRONISATION ---------------- */
function escCode(x){ return String(x).replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function openMemo(id){
  const el = document.getElementById("memo-" + id);
  if (!el) return;
  el.open = true;
  document.querySelectorAll("#memo-zone .acc").forEach(a => { if (a !== el) a.open = false; });
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function filterRef(v){
  const q = v.toLowerCase().trim();
  /* mémo consolidé */
  document.querySelectorAll("#memo-zone .acc").forEach(acc => {
    let shown = 0;
    acc.querySelectorAll(".memo-line").forEach(l => {
      const ok = !q || l.textContent.toLowerCase().includes(q);
      l.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    acc.style.display = shown ? "" : "none";
    if (q) acc.open = shown > 0;
  });
  /* annexes intégrales */
  document.querySelectorAll("#ann-zone .acc").forEach(acc => {
    let shown = 0;
    acc.querySelectorAll(".memo-tbl tbody tr").forEach(r => {
      const ok = !q || r.textContent.toLowerCase().includes(q);
      r.style.display = ok ? "" : "none";
      if (ok) shown++;
    });
    acc.querySelectorAll(".sec-bloc").forEach(b => {
      const tb = b.querySelector(".memo-tbl tbody");
      b.style.display = (!q || [...tb.querySelectorAll("tr")].some(r => r.style.display !== "none")) ? "" : "none";
    });
    acc.style.display = shown ? "" : "none";
    if (q) acc.open = shown > 0;
  });
  const n = [...document.querySelectorAll("#memo-zone .memo-line")].filter(l => l.style.display !== "none").length
          + [...document.querySelectorAll("#ann-zone .memo-tbl tbody tr")].filter(r => r.style.display !== "none").length;
  const info = document.getElementById("ref-search-info");
  if (info) info.textContent = q ? (n + " résultat(s) pour « " + v + " »") : "Recherche sur le mémo et les 5 annexes";
}

/* ---------- compte unique (Supabase Auth) : accès protégé par mot de passe ---------- */
const SESSION_KEY = "sti_cloud_session";
function authSession(){ try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch(e){ return null; } }
function authSave(sess){ try { localStorage.setItem(SESSION_KEY, JSON.stringify(sess)); } catch(e){} }
function authClear(){ try { localStorage.removeItem(SESSION_KEY); } catch(e){} }
function authUser(){ const s = authSession(); return (s && s.user && s.user.email) ? s.user.email : ""; }
function authValid(){ const s = authSession(); return !!s && Date.now() < ((s.expires_at || 0) * 1000) - 30000; }
function authApply(d){
  const old = authSession() || {};
  const sess = {
    access_token: d.access_token,
    refresh_token: d.refresh_token || old.refresh_token || "",
    expires_at: Math.floor(Date.now()/1000) + (d.expires_in || 3600),
    user: d.user || old.user || null
  };
  authSave(sess); return sess.access_token;
}
/* jeton valide ; renouvellement automatique quand il arrive à expiration */
async function authToken(){
  const s = authSession();
  if (!s) return null;
  if (authValid()) return s.access_token;
  if (!s.refresh_token || !cloudReady()) { authClear(); return null; }
  try {
    const c = cloudCfg();
    const r = await fetch(c.url.replace(/\/$/, "") + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST", headers: { "apikey": c.key, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return authApply(await r.json());
  } catch (e) { authClear(); return null; }
}
function authNeeded(){ return cloudReady() && cloudCfg().auth; }
function openAuth(){
  const b = document.getElementById("auth-modal");
  if (!b) return;
  b.querySelector("#auth-email").value = authUser();
  b.querySelector("#auth-err").textContent = "";
  b.classList.add("on");
  setTimeout(() => { const f = b.querySelector(authUser() ? "#auth-pass" : "#auth-email"); if (f) f.focus(); }, 60);
}
function closeAuth(){ const b = document.getElementById("auth-modal"); if (b) b.classList.remove("on"); }
async function doLogin(){
  const b = document.getElementById("auth-modal");
  const email = b.querySelector("#auth-email").value.trim();
  const pass  = b.querySelector("#auth-pass").value;
  const err   = b.querySelector("#auth-err");
  err.textContent = "";
  if (!cloudReady()){ err.textContent = "Commencez par renseigner l'URL et la clé du projet (bouton Configuration)."; return; }
  if (!email || !pass){ err.textContent = "Renseignez l'adresse électronique et le mot de passe."; return; }
  try {
    const c = cloudCfg();
    const r = await fetch(c.url.replace(/\/$/, "") + "/auth/v1/token?grant_type=password", {
      method: "POST", headers: { "apikey": c.key, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: pass })
    });
    if (!r.ok) throw new Error((r.status === 400 || r.status === 401) ? "Adresse ou mot de passe incorrect." : "HTTP " + r.status);
    authApply(await r.json());
    b.querySelector("#auth-pass").value = "";
    closeAuth();
    toast("Connexion réussie — " + email);
    await afterLogin();
  } catch (e) {
    err.textContent = "Échec de la connexion : " + (e.message || e);
  }
}
async function doLogout(){
  const c = cloudCfg(), s = authSession();
  if (s && c.url) {
    try {
      await fetch(c.url.replace(/\/$/, "") + "/auth/v1/logout", {
        method: "POST", headers: { "apikey": c.key, "Authorization": "Bearer " + s.access_token }
      });
    } catch (e) {}
  }
  authClear();
  window.__afterLogin = null;
  toast("Déconnecté — les données restent sur cet appareil");
  renderAll(true); renderCloudBar();
}
/* après une connexion réussie : synchronisation dans le bon sens */
async function afterLogin(){
  const a = window.__afterLogin; window.__afterLogin = null;
  if (a === "push") { await cloudPush(true); }
  else if (cloudHasLocalData()) { await cloudPush(true); }
  else { await cloudPull(true); }
  renderAll(true); renderCloudBar();
}

/* ---------- synchronisation distante (Supabase) ---------- */
const CLOUD_KEY = "sti_cloud_cfg";
function cloudCfg(){
  let cfg = {};
  try { cfg = JSON.parse(localStorage.getItem(CLOUD_KEY) || "{}"); } catch(e){ cfg = {}; }
  const w = window.STI_SUPABASE || {};
  return {
    url: cfg.url || w.url || "",
    key: cfg.key || w.anonKey || "",
    table: cfg.table || w.table || "espace_pedagogique",
    device: cfg.device || w.device || (SCHOOL.prof + " — appareil principal"),
    auto: cfg.auto !== undefined ? cfg.auto : true,  /* sauvegarde distante par défaut dès qu'un projet est configuré */
    auth: cfg.auth !== undefined ? cfg.auth : (w.auth !== undefined ? w.auth : false)   /* accès protégé par mot de passe */
  };
}
function cloudReady(){ const c = cloudCfg(); return !!(c.url && c.key); }
async function cloudHeaders(){
  const c = cloudCfg();
  const tok = c.auth ? await authToken() : null;
  return { "apikey": c.key, "Authorization": "Bearer " + (tok || c.key), "Content-Type": "application/json", "Prefer": "return=minimal" };
}
function cloudTime(){
  const s = store.cloud && store.cloud.at;
  if (!s) return "jamais";
  return fmtShort(s.slice(0,10)) + " à " + s.slice(11,16);
}
function cloudBadge(){
  if (!cloudReady()) return '<span class="badge b-amber">Sauvegarde locale seulement</span>';
  if (authNeeded() && !authSession()) return '<span class="badge b-amber">Déconnecté — connexion requise pour le cloud</span>';
  return store.cloud && store.cloud.ok ? '<span class="badge b-green">Synchronisé le ' + cloudTime() + '</span>' : '<span class="badge b-rose">Configuration à vérifier</span>';
}
function cloudWho(){
  const u = authUser();
  if (authNeeded()) return u ? "connecté : " + escapeHtml(u) : "non connecté";
  return "accès sans mot de passe";
}
function payLoad(){
  return {
    prof: SCHOOL.prof, lycee: SCHOOL.lycee, annee: SCHOOL.annee, device: cloudCfg().device,
    payload: { times: store.times, seances: store.seances, saved: store.saved }
  };
}
async function cloudPush(silent){
  if (!cloudReady()){ if (!silent) openCloudSettings(); return; }
  if (authNeeded() && !(await authToken())) {
    if (!silent){ window.__afterLogin = "push"; openAuth(); }
    return;
  }
  const c = cloudCfg();
  store.cloud = store.cloud || {};
  try {
    const r = await fetch(c.url.replace(/\/$/, "") + "/rest/v1/" + c.table, {
      method: "POST", headers: await cloudHeaders(), body: JSON.stringify([payLoad()])
    });
    if (!r.ok) throw new Error("HTTP " + r.status + " " + (await r.text()).slice(0, 160));
    store.cloud = { ok:true, at:new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){}
    if (!silent) toast("Données envoyées à la base distante");
    renderCloudBar();
  } catch (e) {
    store.cloud = { ok:false, at:new Date().toISOString(), err:String(e.message || e) };
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(err){}
    if (!silent) alert("Échec de l'envoi :\n" + (e.message || e) + "\n\nVérifiez l'URL du projet, la clé publique et la table SQL (voir README).");
    renderCloudBar();
  }
}
async function cloudPull(silent){
  if (!cloudReady()){ openCloudSettings(); return; }
  if (authNeeded() && !(await authToken())) {
    window.__afterLogin = "pull"; openAuth(); return;
  }
  const c = cloudCfg();
  try {
    const r = await fetch(c.url.replace(/\/$/, "") + "/rest/v1/" + c.table + "?select=*&order=created_at.desc&limit=1", { headers: await cloudHeaders() });
    if (!r.ok) throw new Error("HTTP " + r.status + " " + (await r.text()).slice(0, 160));
    const rows = await r.json();
    if (!rows.length){ if (!silent) alert("Aucune sauvegarde trouvée dans la base distante."); return; }
    const snap = rows[0];
    const local = (store.seances ? Object.keys(store.seances).length : 0);
    const remote = snap.payload && snap.payload.seances ? Object.keys(snap.payload.seances).length : 0;
    const quand = snap.created_at ? snap.created_at.slice(0,16).replace("T"," ") : "date inconnue";
    if (!silent && !confirm("Sauvegarde distante du " + quand + "\n" + remote + " fiche(s) enregistrée(s) — cette session en contient " + local + ".\n\nRemplacer les données de cet appareil par la version distante ?")) return;
    store.times = snap.payload.times || store.times;
    store.seances = snap.payload.seances || {};
    if (typeof snap.payload.saved === "string") store.saved = snap.payload.saved;
    store.cloud = { ok:true, at:new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){}
    toast("Données restaurées depuis la base distante");
    renderAll(true);
  } catch (e) {
    alert("Échec de la restauration :\n" + (e.message || e) + "\n\nVérifiez l'URL, la clé, la table et les règles d'accès (voir README).");
  }
}
function cloudHasLocalData(){
  return !!(store.saved ||
    (store.seances && Object.keys(store.seances).length) ||
    (store.times && Object.keys(store.times).length));
}
/* Premier démarrage sur cet appareil (téléphone, tablette, poste du lycée) :
   si rien n'est encore enregistré localement, on propose d'abord la version
   du cloud, pour que la sauvegarde distante soit la source de vérité. */
async function cloudFirstRunRestore(){
  if (!cloudReady() || cloudHasLocalData()) return false;
  if (authNeeded() && !(await authToken())) {
    /* nouvel appareil : demande de connexion une fois par session de navigation */
    if (!sessionStorage.getItem("sti_auth_asked")) {
      sessionStorage.setItem("sti_auth_asked", "1");
      window.__afterLogin = "pull";
      openAuth();
    }
    return false;
  }
  window.__cloudFirstRun = true;
  await cloudPull(true);
  return true;
}
function cloudAutoPush(){ if (cloudCfg().auto && cloudReady()) cloudPush(true); }
function openCloudSettings(){
  const c = cloudCfg();
  const b = document.getElementById("cloud-modal");
  b.querySelector("#cfg-url").value = c.url;
  b.querySelector("#cfg-key").value = c.key;
  b.querySelector("#cfg-table").value = c.table;
  b.querySelector("#cfg-device").value = (c.device && !c.device.includes("@")) ? c.device : "Poste principal — Prof. Aymen";
  b.querySelector("#cfg-auto").checked = !!c.auto;
  const ca = b.querySelector("#cfg-auth"); if (ca) ca.checked = !!c.auth;
  b.classList.add("on");
}
function saveCloudSettings(){
  const b = document.getElementById("cloud-modal");
  const cfg = {
    url: b.querySelector("#cfg-url").value.trim().replace(/\/$/, ""),
    key: b.querySelector("#cfg-key").value.trim(),
    table: b.querySelector("#cfg-table").value.trim() || "espace_pedagogique",
    device: b.querySelector("#cfg-device").value.trim() || SCHOOL.prof,
    auto: b.querySelector("#cfg-auto").checked,
    auth: b.querySelector("#cfg-auth") ? b.querySelector("#cfg-auth").checked : false
  };
  localStorage.setItem(CLOUD_KEY, JSON.stringify(cfg));
  b.classList.remove("on");
  toast(cfg.url && cfg.key ? "Configuration enregistrée — test de la connexion…" : "Sauvegarde locale uniquement");
  renderCloudBar();
  if (cfg.url && cfg.key) {
    if (authNeeded() && !authSession()) {
      /* accès protégé : on demande la connexion tout de suite, sans attendre */
      window.__afterLogin = cloudHasLocalData() ? "push" : "pull";
      openAuth();
    }
    else if (cloudHasLocalData()) cloudPush(true);
    else cloudPull();
  }
}

function renderRef(){
  const zone = document.getElementById("v-ref");
  const memoLines = MEMO.reduce((a, s) => a + s.sections.reduce((b, x) => b + x.rows.length, 0), 0);
  const annLines = ANNEXES.reduce((a, x) => a + x.sections.reduce((b, y) => b + y.rows.length, 0), 0);
  zone.innerHTML = `
  <div class="sec-head">
    <div>
      <h2>${ic("book")} Annexes de cours, mémo consolidé et documents</h2>
      <p class="lead">Trois niveaux de lecture : le <strong>mémo consolidé</strong> (contenu des annexes réorganisé selon les compétences de l'aide pédagogique), les <strong>annexes intégrales</strong> telles qu'elles ont été élaborées, et les <strong>documents PDF</strong> (aide pédagogique, répartitions, annexes).</p>
    </div>
    <div class="search no-print">
      ${ic("search")}<input type="text" placeholder="Rechercher : position, datalist, substring, CHECK, mktime…" oninput="filterRef(this.value)">
    </div>
  </div>
  <div class="row" style="justify-content:space-between;margin-bottom:14px">
    <span class="tiny muted" id="ref-search-info">Recherche sur le mémo et les 5 annexes</span>
    <span class="row" id="cloud-bar" style="gap:6px"></span>
  </div>

  <div class="grid g4" style="margin-bottom:16px">
    <div class="kpi"><div class="lbl">${ic("list")} Mémo consolidé</div><div class="val">${memoLines}</div><div class="foo">éléments classés par compétence</div></div>
    <div class="kpi k-teal"><div class="lbl">${ic("book")} Annexes intégrales</div><div class="val">${ANNEXES.length}</div><div class="foo">${annLines} éléments référencés</div></div>
    <div class="kpi k-amber"><div class="lbl">${ic("target")} Compétences couvertes</div><div class="val">${COMPETENCES["3SI1"].length + COMPETENCES["4SI2"].length}</div><div class="foo">3SI1 : ${COMPETENCES["3SI1"].length} &bull; 4SI2 : ${COMPETENCES["4SI2"].length}</div></div>
    <div class="kpi k-rose"><div class="lbl">${ic("file")} Documents</div><div class="val">${DOCS.length}</div><div class="foo">aide pédagogique, répartitions, annexes, fiches</div></div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div class="card-h"><h3>${ic("target")} Mémo consolidé — annexes adaptées à l'aide pédagogique</h3>
      <span class="badge b-green">${MEMO.length} familles &bull; ${memoLines} éléments</span></div>
    <div class="card-b">
      <div class="note tiny" style="margin-bottom:12px">${ic("pin")} Ce mémo reprend le contenu de vos 5 annexes en le réorganisant selon les compétences officielles. Chaque ligne indique sa <strong>source</strong> dans l'annexe, et chaque compétence renvoie aux <strong>séances du 1<sup>er</sup> trimestre</strong> correspondantes (onglet « Programme &amp; compétences »).</div>
      <div id="memo-zone">
        ${MEMO.map(m => `
          <details class="acc" id="memo-${m.id}" style="margin-bottom:10px">
            <summary>${ic(m.ico)} ${m.t}<span class="arrow">${ic("chev")}</span></summary>
            <div class="acc-b">
              <div class="note tiny" style="margin-bottom:10px">${ic("pin")} ${m.aide}</div>
              ${m.sections.map(sc => `
                <div class="sec-bloc" style="margin-bottom:12px">
                  <div class="row" style="gap:8px;margin-bottom:6px">
                    <span class="badge b-navy">${sc.t}</span>
                    <span class="badge b-grey">${sc.src}</span>
                  </div>
                  <div class="tbl-wrap" style="max-height:none">
                    <table class="tbl memo-tbl">
                      <thead><tr><th style="width:200px">Élément</th><th>Description</th><th style="width:34%">Exemple / repère</th><th style="width:150px">Source</th></tr></thead>
                      <tbody>
                        ${sc.rows.map(r => `<tr class="memo-line">
                          <td class="mono" style="font-weight:700;color:#0f5f9e">${r[0]}</td>
                          <td class="small">${r[1] || ""}</td>
                          <td>${r[2] ? '<pre class="ex">' + escCode(r[2]) + "</pre>" : '<span class="tiny muted">—</span>'}</td>
                          <td><span class="badge b-grey">${r[3] || sc.src}</span></td>
                        </tr>`).join("")}
                      </tbody>
                    </table>
                  </div>
                </div>`).join("")}
            </div>
          </details>`).join("")}
      </div>
    </div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div class="card-h"><h3>${ic("book")} Annexes intégrales — versions élaborées par A. Essouyah</h3>
      <span class="badge b-grey">HTML5 &bull; CSS3 &bull; JS &bull; PHP &bull; SQL</span></div>
    <div class="card-b">
      <div id="ann-zone">
        ${ANNEXES.map(a => `
          <details class="acc" style="margin-bottom:10px">
            <summary>${ic(a.ico)} ${a.t} — ${a.res}
              <span class="badge b-blue" style="margin-left:8px">${a.pages}</span>
              <span class="arrow">${ic("chev")}</span></summary>
            <div class="acc-b">
              ${a.sections.map(sc => `
                <div class="sec-bloc" style="margin-top:6px">
                  <div class="row" style="gap:8px;margin-bottom:6px">
                    <span class="badge b-navy">${sc.t}</span>
                    <span class="tiny muted">${sc.rows.length} élément(s)</span>
                  </div>
                  <div class="tbl-wrap" style="max-height:none;margin-bottom:10px">
                    <table class="tbl memo-tbl">
                      <thead><tr><th style="width:200px">Élément</th><th>Description</th><th style="width:38%">Exemple</th></tr></thead>
                      <tbody>
                        ${sc.rows.map(r => `<tr>
                          <td class="mono" style="font-weight:700;color:#0f5f9e">${r[0]}</td>
                          <td class="small">${r[1] || ""}</td>
                          <td>${r[2] ? '<pre class="ex">' + escCode(r[2]) + "</pre>" : '<span class="tiny muted">—</span>'}</td>
                        </tr>`).join("")}
                      </tbody>
                    </table>
                  </div>
                </div>`).join("")}
              <div class="note tiny">${ic("file")} Source : <a href="${a.pdf}" target="_blank">${a.pdf.split("/").pop()}</a> — ${a.pages}. Travail élaboré par A. Essouyah.</div>
            </div>
          </details>`).join("")}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-h"><h3>${ic("file")} Documents de référence et de travail</h3><span class="badge b-grey">${DOCS.length} fichiers</span></div>
    <div class="card-b">
      ${[...new Set(DOCS.map(d => d.g))].map(g => `
        <div class="row" style="gap:8px;margin:6px 0 10px">
          <span class="badge b-navy">${ic("file")} ${g}</span>
          <span class="tiny muted">${DOCS.filter(d => d.g === g).length} fichier(s)</span>
        </div>
        <div class="grid g2" style="margin-bottom:16px">
          ${DOCS.filter(d => d.g === g).map(d => `<div class="tile">
            <div class="ic">${ic("file")}</div>
            <div>
              <div class="tt"><a href="${encodeURI(d.f)}" target="_blank">${d.t}</a></div>
              <div class="tiny muted">${d.s}</div>
              <div class="tiny" style="color:var(--ink-2);margin-top:3px">${d.d}</div>
            </div></div>`).join("")}
        </div>`).join("")}
      <div class="note tiny" style="margin-top:4px">${ic("pin")} Les répartitions du 1<sup>er</sup> trimestre et les 5 annexes sont rangées dans <code>docs/</code> (noms de fichiers sans espaces, mis en cache pour la consultation hors ligne) ; les répartitions des 2<sup>e</sup> et 3<sup>e</sup> trimestres ainsi que les fiches de séances sont lues directement dans le dossier <code>documents/</code> du dépôt. Les fichiers Word se téléchargent et s'ouvrent avec Word ou LibreOffice.</div>
    </div>
  </div>`;
  renderCloudBar();
}


/* ---------------- MODALE ---------------- */
let mCtx = null;
function openModal(cls, n){
  if (cls === 0 || cls === undefined){                       // raccourci « séance du jour »
    const t = todayISO();
    const s = ["3SI1","4SI2"].map(c => SESSIONS[c].find(x => x.iso===t)).find(Boolean);
    if (!s){ toast("Aucune séance prévue aujourd’hui"); return; }
    cls = s.cls; n = s.n;
  }
  const s = SESSIONS[cls].find(x => x.n === n);
  if (!s) return;
  mCtx = { cls:cls, n:n };
  const o = store.seances[cls+"|"+n] || {};
  document.getElementById("m-title").innerHTML = "Séance n°"+n+" — "+CLASSES[cls].short+" • "+fmtLong(s.iso);
  document.getElementById("m-body").innerHTML = `
    <div class="row" style="gap:8px;margin-bottom:12px">
      <span class="badge b-blue">${jour(s.iso)} ${blockRange(cls, D(s.iso).getDay())}</span>
      <span class="badge b-teal">${slotsTxt(cls, s.iso)}</span>
      <span class="badge b-grey">${s.blk ? s.blk.d : "—"}</span>
      <span class="badge b-grey">${s.blk ? s.blk.o : ""}</span>
    </div>
    <div style="margin-bottom:12px"><label class="f">Titre / contenu prévu de la séance (modifiable)</label>
      <input type="text" id="m-titre" value="${escapeHtml(o.title || (s.blk ? s.blk.t : "Séance à planifier"))}"></div>
    <div style="margin-bottom:12px"><label class="f">Déroulement réellement effectué en classe</label>
      <textarea id="m-contenu" placeholder="Ex. : activités menées, notions abordées, exercices traités…">${escapeHtml(o.contenu || "")}</textarea></div>
    <div style="margin-bottom:12px"><label class="f">Travail donné à la maison</label>
      <input type="text" id="m-devoirs" value="${escapeHtml(o.devoirs || "")}" placeholder="Ex. : Série d'exercices n°2, exercices 4 et 5 pour la séance suivante"></div>
    <div style="margin-bottom:12px"><label class="f">Observations / bilan</label>
      <input type="text" id="m-obs" value="${escapeHtml(o.obs || "")}" placeholder="Ex. : notions à reprendre, séance écourtée, groupe très réceptif…"></div>
    <div class="row" style="gap:8px">
      <label class="badge b-green" style="cursor:pointer"><input type="checkbox" id="m-done" ${o.done?"checked":""}> Séance assurée</label>
      <label class="badge b-rose" style="cursor:pointer"><input type="checkbox" id="m-rep" ${o.done===false?"checked":""}> Séance reportée</label>
    </div>
    <div class="note tiny" style="margin-top:12px">Rappel du contenu prévu par la répartition officielle : ${s.blk ? s.blk.t + " — " + s.blk.det : "séance à planifier (le document de répartition fourni ne couvre que le 1<sup>er</sup> trimestre)."}</div>`;
  document.getElementById("modal").classList.add("on");
}
function closeModal(){ document.getElementById("modal").classList.remove("on"); document.body.style.overflow=""; }
function saveModal(){
  if (!mCtx) return;
  const k = mCtx.cls+"|"+mCtx.n;
  const doneBox = document.getElementById("m-done").checked;
  const repBox = document.getElementById("m-rep").checked;
  store.seances[k] = {
    title: document.getElementById("m-titre").value.trim(),
    contenu: document.getElementById("m-contenu").value.trim(),
    devoirs: document.getElementById("m-devoirs").value.trim(),
    obs: document.getElementById("m-obs").value.trim(),
    done: doneBox ? true : (repBox ? false : undefined)
  };
  closeModal(); save(true); toast("Fiche de la séance n°"+mCtx.n+" enregistrée");
}
document.getElementById("modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ---------------- EXPORT / IMPORT ---------------- */
function exportJSON(){
  const data = JSON.stringify({ school:SCHOOL, exporte:new Date().toISOString(), donnees:store }, null, 2);
  const a = document.createElement("a");
  a.href = "data:application/json;charset=utf-8," + encodeURIComponent(data);
  a.download = "espace-sti-aymen-essouyah-2026-2027.json";
  document.body.appendChild(a); a.click(); a.remove();
  toast("Sauvegarde JSON exportée");
}

/* ---------------- DÉMARRAGE ---------------- */
/* ---------------- SYNCHRONISATION DISTANTE, PWA ET DÉMARRAGE ---------------- */
function cloudCard(){
  const c = cloudCfg();
  return `
  <div class="card" id="cloud-card">
    <div class="card-h">
      <h3>${ic("cloud")} Sauvegarde distante</h3>
      <span id="cloud-bar2">${cloudBadge()}</span>
    </div>
    <div class="card-b">
      <p class="tiny muted" style="margin-bottom:10px">
        Vos fiches de séance, horaires et cahier de textes sont enregistrés dans ce navigateur puis envoyés à votre base
        <strong>Supabase</strong> (PostgreSQL + API REST). Vous pouvez ainsi retrouver les mêmes données sur le téléphone,
        la tablette et le poste du lycée.
      </p>
      <div class="space-y" style="display:grid;gap:8px">
        <div class="spread"><span class="tiny muted">Projet</span><span class="tiny">${c.url ? c.url.replace(/^https?:\/\//,"").split(".")[0] + " • table " + c.table : "non configuré"}</span></div>
        <div class="spread"><span class="tiny muted">Appareil</span><span class="tiny">${escapeHtml(c.device)}</span></div>
        <div class="spread"><span class="tiny muted">Dernier envoi</span><span class="tiny">${cloudTime()}</span></div>
        <div class="spread"><span class="tiny muted">Fiches enregistrées</span><span class="tiny">${Object.keys(store.seances || {}).length}</span></div>
        <div class="spread"><span class="tiny muted">Envoi automatique</span><span class="tiny">${c.auto ? "activé" : "désactivé"}</span></div>
        <div class="spread"><span class="tiny muted">Connexion</span><span class="tiny">${cloudWho()}</span></div>
      </div>
      <div class="row no-print" style="margin-top:12px;gap:8px">
        <button class="btn btn-xs btn-blue" onclick="cloudPush(false)">${ic("cloud")} Envoyer maintenant</button>
        <button class="btn btn-xs btn-soft" onclick="cloudPull()">${ic("down")} Restaurer</button>
        ${authNeeded() ? (authSession()
            ? '<button class="btn btn-xs btn-line" onclick="doLogout()">' + ic("out") + ' Se déconnecter</button>'
            : '<button class="btn btn-xs btn-blue" onclick="openAuth()">' + ic("lock") + ' Se connecter</button>') : ""}
        <button class="btn btn-xs btn-line" onclick="openCloudSettings()">${ic("edit")} Configuration</button>
        <button class="btn btn-xs btn-line" onclick="exportJSON()">${ic("file")} Export JSON</button>
      </div>
      <div class="note tiny" style="margin-top:10px">${ic("pin")}
        ${authNeeded() && !authSession() ? 'Accès protégé par mot de passe : connectez-vous pour envoyer et restaurer les données du cloud. ' : ""}
        ${cloudReady()
          ? 'Base distante configurée. En cas d\'échec, vérifiez la table <code>' + c.table + '</code>, la clé publique et les règles RLS décrites dans le <code>README.md</code>.'
          : 'Aucune base distante configurée : les données restent dans ce navigateur (et dans l\'export JSON). Cliquez sur <strong>Configuration</strong> et renseignez l\'URL du projet Supabase et la clé publique — la table SQL est fournie dans <code>supabase/schema.sql</code>.'}
      </div>
    </div>
  </div>`;
}
function renderCloudBar(){
  const t = (cloudReady() ? "" : "") + cloudBadge() +
    ' <span class="tiny muted">' + (cloudReady() ? "projet : " + cloudCfg().url.replace(/^https?:\/\//,"").split(".")[0] : "aucun projet configuré") + " • dernier envoi : " + cloudTime() + "</span>";
  const a = document.getElementById("cloud-bar"); if (a) a.innerHTML = t;
  const b = document.getElementById("cloud-bar2"); if (b) b.innerHTML = cloudBadge();
}

/* ---------- installation en mode application (PWA) ---------- */
let installEvt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  installEvt = e;
  const btn = document.getElementById("btn-install");
  if (btn) btn.style.display = "";
});
function installApp(){
  if (installEvt){
    installEvt.prompt();
    installEvt = null;
    document.getElementById("btn-install").style.display = "none";
    return;
  }
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  alert(
    "Installer l'application sur l'appareil\n\n" +
    (standalone ? "L'application est déjà installée et ouverte en mode autonome.\n\n" : "") +
    "• Android (Chrome) : menu ⋮ → « Ajouter à l'écran d'accueil » ou « Installer l'application ».\n" +
    "• iPhone / iPad (Safari) : bouton Partager → « Sur l'écran d'accueil ».\n" +
    "• Ordinateur (Chrome / Edge) : icône d'installation dans la barre d'adresse, à droite de l'URL.\n\n" +
    "Une fois installée, l'application s'ouvre depuis l'icône, démarre plus vite, fonctionne sans connexion et affiche vos documents hors ligne."
  );
}
function registerSW(){
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol !== "http:" && location.protocol !== "https:") return; /* évite l'échec en ouverture locale */
  navigator.serviceWorker.register("sw.js").then(reg => {
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener("statechange", () => {
        if (nw.state === "installed" && navigator.serviceWorker.controller) {
          const b = document.getElementById("update-bar");
          if (b) b.classList.remove("hidden");
        }
      });
    });
  }).catch(() => {});
}
function applyUpdate(){ if (window.__newSW) window.__newSW.postMessage({ type: "SKIP_WAITING" }); location.reload(); }
window.addEventListener("online", () => {
  const e = document.getElementById("net-state"); if (e){ e.textContent = "En ligne"; e.className = "badge b-green"; }
  /* reprise automatique : un envoi qui avait échoué (hors ligne) est retenté */
  if (cloudReady() && store.cloud && store.cloud.ok === false) cloudPush(true);
});
window.addEventListener("offline", () => { const e = document.getElementById("net-state"); if (e){ e.textContent = "Hors ligne — données locales"; e.className = "badge b-amber"; } });

(function init(){
  const t = D(todayISO());
  if (t.getFullYear() === 2026) { calY = 2026; calM = t.getMonth(); }
  const hash = (location.hash || "").replace("#", "");
  if (hash && /^v-/.test(hash) && document.getElementById(hash)) currentTab = hash;
  renderAll(true);
  renderCloudBar();
  cloudFirstRunRestore();
  registerSW();
  const e = document.getElementById("net-state");
  if (e){ const on = navigator.onLine; e.textContent = on ? "En ligne" : "Hors ligne — données locales"; e.className = "badge " + (on ? "b-green" : "b-amber"); }
  document.querySelectorAll("[data-tip]").forEach(el => el.setAttribute("title", el.getAttribute("data-tip")));
})();


/* ---- exposition des fonctions utilisées par les gestionnaires HTML (onclick / oninput) ---- */
window.D = D;
window.ISO = ISO;
window.addDays = addDays;
window.between = between;
window.inRange = inRange;
window.fmtLong = fmtLong;
window.fmtShort = fmtShort;
window.fmtJM = fmtJM;
window.jour = jour;
window.jourS = jourS;
window.weekLabel = weekLabel;
window.diffDays = diffDays;
window.numSemaine = numSemaine;
window.daysList = daysList;
window.vacationOf = vacationOf;
window.ferieOf = ferieOf;
window.suspensionOf = suspensionOf;
window.isOff = isOff;
window.jalonsOf = jalonsOf;
window.jalonsForClass = jalonsForClass;
window.generateSessions = generateSessions;
window.triOf = triOf;
window.sessionsOf = sessionsOf;
window.titleOf = titleOf;
window.evalDates = evalDates;
window.load = load;
window.save = save;
window.seanceState = seanceState;
window.todayISO = todayISO;
window.ic = ic;
window.renderAll = renderAll;
window.go = go;
window.toast = toast;
window.nextSessions = nextSessions;
window.kpiDone = kpiDone;
window.renderDash = renderDash;
window.triLabel = triLabel;
window.dcOf = dcOf;
window.renderEDT = renderEDT;
window.setTime = setTime;
window.hh = hh;
window.slotsOf = slotsOf;
window.slotsOfDay = slotsOfDay;
window.blocTxt = blocTxt;
window.slotRange = slotRange;
window.blockRange = blockRange;
window.slotsTxt = slotsTxt;
window.setSlot = setSlot;
window.weeklyHours = weeklyHours;
window.heuresEntre = heuresEntre;
window.shortTitle = shortTitle;
window.nextOf = nextOf;
window.nextOccurrence = nextOccurrence;
window.escapeHtml = escapeHtml;
window.renderCal = renderCal;
window.calShift = calShift;
window.calToday = calToday;
window.filterCal = filterCal;
window.renderRep = renderRep;
window.setRep = setRep;
window.setTri = setTri;
window.toggleDone = toggleDone;
window.resetCls = resetCls;
window.compSavoirs = compSavoirs;
window.blocsTxt = blocsTxt;
window.blocsSeances = blocsSeances;
window.renderProg = renderProg;
window.renderCahier = renderCahier;
window.escCode = escCode;
window.openMemo = openMemo;
window.filterRef = filterRef;
window.cloudCfg = cloudCfg;
window.cloudReady = cloudReady;
window.cloudHeaders = cloudHeaders;
window.cloudTime = cloudTime;
window.cloudBadge = cloudBadge;
window.payLoad = payLoad;
window.cloudAutoPush = cloudAutoPush;
window.cloudHasLocalData = cloudHasLocalData;
window.cloudFirstRunRestore = cloudFirstRunRestore;
window.cloudInvite = cloudInvite;
window.authSession = authSession; window.authToken = authToken; window.authUser = authUser;
window.authNeeded = authNeeded; window.openAuth = openAuth; window.closeAuth = closeAuth;
window.doLogin = doLogin; window.doLogout = doLogout; window.afterLogin = afterLogin;
window.cloudWho = cloudWho;
window.openCloudSettings = openCloudSettings;
window.saveCloudSettings = saveCloudSettings;
window.renderRef = renderRef;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveModal = saveModal;
window.exportJSON = exportJSON;
window.cloudCard = cloudCard;
window.renderCloudBar = renderCloudBar;
window.installApp = installApp;
window.registerSW = registerSW;
window.applyUpdate = applyUpdate;
/* état exposé (débogage et tests) */
window.cloudPush = cloudPush;
window.cloudPull = cloudPull;
window.store = store; window.SESSIONS = SESSIONS; window.KEY = KEY;
})();