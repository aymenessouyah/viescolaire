/* ==================================================================
   ADMINISTRATION DES PROFESSEURS — Espace pédagogique STI
   ------------------------------------------------------------------
   Réservé à l'administrateur (adresse définie dans supabase/config.js).
   Les comptes sont créés/supprimés par une fonction Edge sécurisée
   (supabase/functions/admin-users) : la clé secrète ne quitte jamais
   les serveurs Supabase — le navigateur n'envoie que sa propre session.
   ================================================================== */
'use strict';

function estAdmin(){
  const a = (cloudCfg().admin || "").toLowerCase();
  return cloudReady() && !!a && authUser().toLowerCase() === a;
}
function adminHeaders(){
  const c = cloudCfg(), s = authSession();
  return {
    "apikey": c.key,
    "Authorization": "Bearer " + (s ? s.access_token : ""),
    "Content-Type": "application/json"
  };
}
async function adminAppel(action, params){
  const c = cloudCfg();
  const r = await fetch(c.url.replace(/\/$/, "") + "/functions/v1/admin-users", {
    method: "POST", headers: adminHeaders(),
    body: JSON.stringify(Object.assign({ action: action }, params || {}))
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || ("HTTP " + r.status));
  return d;
}
function openAdmin(){
  const b = document.getElementById("admin-modal");
  if (!b) return;
  if (!estAdmin()){
    toast("Espace réservé à l'administrateur (" + (cloudCfg().admin || "—") + ")");
    return;
  }
  b.classList.add("on");
  adminLister();
}
function closeAdmin(){ const b = document.getElementById("admin-modal"); if (b) b.classList.remove("on"); }
function adminLigne(u){
  const em = (u.email || "").replace(/"/g, "");
  return '<tr>' +
    '<td><strong>' + escapeHtml(u.email || "(sans adresse)") + '</strong>' +
      (u.email && cloudCfg().admin && u.email.toLowerCase() === cloudCfg().admin.toLowerCase() ? ' <span class="badge b-navy" style="margin-left:4px">administrateur</span>' : "") + '</td>' +
    '<td class="tiny">' + (u.cree ? fmtShort(String(u.cree).slice(0,10)) : "—") + '</td>' +
    '<td class="tiny">' + (u.derniere ? fmtShort(String(u.derniere).slice(0,10)) : '<span class="muted">jamais</span>') + '</td>' +
    '<td style="white-space:nowrap">' +
      '<button class="btn btn-xs btn-line" onclick="adminReinitPrompt(&quot;' + u.id + '&quot;,&quot;' + em + '&quot;)">Mot de passe</button> ' +
      (u.email && u.email.toLowerCase() === (cloudCfg().admin || "").toLowerCase() ? "" :
        '<button class="btn btn-xs btn-line" style="color:#b02a3a" onclick="adminSupprimer(&quot;' + u.id + '&quot;,&quot;' + em + '&quot;)">✕</button>') +
    '</td></tr>';
}
async function adminLister(){
  const zone = document.getElementById("admin-liste");
  if (!zone) return;
  zone.innerHTML = '<p class="tiny muted">Chargement…</p>';
  try {
    const d = await adminAppel("lister");
    const us = (d.users || []).sort((a,b) => String(a.email).localeCompare(String(b.email)));
    zone.innerHTML = us.length
      ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Professeur</th><th style="width:100px">Créé le</th><th style="width:110px">Dernière connex.</th><th style="width:190px">Actions</th></tr></thead><tbody>'
        + us.map(adminLigne).join("") + '</tbody></table></div>'
        + '<p class="tiny muted" style="margin-top:8px">' + us.length + ' compte(s). Communiquez à chaque collègue : l’adresse du site, son adresse et le mot de passe que vous avez fixé.</p>'
      : '<p class="tiny muted">Aucun compte pour l’instant — créez le premier ci-dessus.</p>';
  } catch(e){
    zone.innerHTML = '<div class="note warn tiny">Impossible de lister les comptes : ' + escapeHtml(String(e.message || e)) +
      (/net|fetch/i.test(String(e)) ? '<br>Vérifiez votre connexion ou le déploiement de la fonction <code>admin-users</code>.' : "") + '</div>';
  }
}
async function adminCreer(){
  const b = document.getElementById("admin-modal");
  const email = b.querySelector("#ad-email").value.trim();
  const pwd   = b.querySelector("#ad-pass").value;
  const msg   = b.querySelector("#ad-msg");
  msg.textContent = "";
  if (!email || !pwd){ msg.textContent = "Adresse et mot de passe requis."; return; }
  if (pwd.length < 6){ msg.textContent = "Mot de passe : 6 caractères au moins."; return; }
  msg.textContent = "Création…";
  try {
    await adminAppel("creer", { email: email, password: pwd });
    msg.style.color = "var(--green)";
    msg.textContent = "Compte créé ✔ — à transmettre : adresse du site + " + email + " + ce mot de passe.";
    b.querySelector("#ad-email").value = ""; b.querySelector("#ad-pass").value = "";
    adminLister();
  } catch(e){
    msg.style.color = "#b02a3a";
    msg.textContent = "Échec : " + (e.message || e);
  }
}
async function adminSupprimer(id, email){
  if (!confirm("Supprimer définitivement le compte de " + (email || id) + " ?\nSes données sauvegardées resteront dans la table jusqu'à purge.")) return;
  try { await adminAppel("supprimer", { id: id }); toast("Compte supprimé — " + email); adminLister(); }
  catch(e){ toast("Échec : " + (e.message || e)); }
}
function adminReinitPrompt(id, email){
  const p = prompt("Nouveau mot de passe pour " + (email || id) + " (6 caractères au moins) :");
  if (p === null) return;
  if (p.length < 6){ toast("Mot de passe trop court (6 caractères au moins)"); return; }
  adminAppel("reinit", { id: id, password: p })
    .then(() => toast("Mot de passe réinitialisé — " + email))
    .catch(e => toast("Échec : " + (e.message || e)));
}

window.estAdmin = estAdmin; window.openAdmin = openAdmin; window.closeAdmin = closeAdmin;
window.adminLister = adminLister; window.adminCreer = adminCreer;
window.adminSupprimer = adminSupprimer; window.adminReinitPrompt = adminReinitPrompt;
window.adminAppel = adminAppel;
