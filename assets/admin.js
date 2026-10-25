/* ==================================================================
   ADMINISTRATION DES PROFESSEURS — Espace pédagogique STI
   ------------------------------------------------------------------
   Réservé à l'administrateur (adresse définie dans supabase/config.js).
   Les comptes sont créés/supprimés par une fonction Edge sécurisée
   (supabase/functions/admin-users) : la clé secrète ne quitte jamais
   les serveurs Supabase — le navigateur n'envoie que sa propre session.
   ================================================================== */
'use strict';
let adminPhotoPreviewUrl = "";

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
  adminBadgePreview();
  adminLister();
}
function closeAdmin(){
  const b = document.getElementById("admin-modal"); if (b) b.classList.remove("on");
  if (adminPhotoPreviewUrl) URL.revokeObjectURL(adminPhotoPreviewUrl);
  adminPhotoPreviewUrl = "";
  const photo=b&&b.querySelector("#ad-photo"),status=b&&b.querySelector("#ad-photo-status");
  if(photo)photo.value="";if(status)status.textContent="";
}
function adminBadgeDraft(){
  const b = document.getElementById("admin-modal");
  const value = id => b && b.querySelector(id) ? b.querySelector(id).value.trim() : "";
  return {
    nom:value("#ad-name")||"NOM PRÉNOM",
    fonction:value("#ad-function")||"Professeur",
    matiere:value("#ad-subject")||"Sciences et technologies de l’informatique",
    email:value("#ad-email"),
    badge_code:"STI-ATTRIBUÉ À LA CRÉATION"
  };
}
function adminBadgePreview(){
  if(window.STI_PROF_BADGE)window.STI_PROF_BADGE.renderInto("ad-badge-preview",adminBadgeDraft(),adminPhotoPreviewUrl||"",{compact:true});
}
function adminBadgePhotoChanged(input){
  const file=input&&input.files&&input.files[0],status=document.getElementById("ad-photo-status");
  if(adminPhotoPreviewUrl)URL.revokeObjectURL(adminPhotoPreviewUrl);
  adminPhotoPreviewUrl="";
  if(!file){if(status)status.textContent="Une photo est obligatoire pour créer le badge.";adminBadgePreview();return;}
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>10*1024*1024){
    if(status)status.textContent=file.size>10*1024*1024?"Photo trop volumineuse (10 Mo maximum).":"Format non accepté : choisissez un JPEG, PNG ou WebP.";
    input.value="";adminBadgePreview();return;
  }
  adminPhotoPreviewUrl=URL.createObjectURL(file);
  if(status)status.textContent="Photo sélectionnée : "+file.name;
  adminBadgePreview();
}
function adminLigne(u){
  const em = (u.email || "").replace(/"/g, "");
  return '<tr>' +
    '<td><strong>' + escapeHtml(u.nom || u.email || "(sans adresse)") + '</strong>' +
      (u.nom ? '<div class="tiny muted">' + escapeHtml(u.email || "") + '</div>' : "") +
      (u.badge_code ? '<div class="tiny muted">' + escapeHtml(u.badge_code) + '</div>' : "") +
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
  const nom   = b.querySelector("#ad-name").value.trim();
  const fonction = b.querySelector("#ad-function").value.trim() || "Professeur";
  const matiere = b.querySelector("#ad-subject").value.trim() || "Sciences et technologies de l’informatique";
  const photoFile = b.querySelector("#ad-photo").files[0];
  const msg   = b.querySelector("#ad-msg");
  msg.style.color = "#b02a3a"; msg.textContent = "";
  if (!nom || !email || !pwd){ msg.textContent = "Nom, adresse électronique et mot de passe sont requis."; return; }
  if (pwd.length < 6){ msg.textContent = "Mot de passe : 6 caractères au moins."; return; }
  if (!photoFile){ msg.textContent = "Choisissez la photo du professeur pour créer son badge."; return; }
  if (!window.STI_PROF_BADGE){ msg.textContent = "Le module de création des badges n’est pas chargé. Rechargez la page."; return; }
  const button = b.querySelector("button[onclick=\"adminCreer()\"]");
  if(button)button.disabled=true;
  msg.style.color = "var(--ink-3)"; msg.textContent = "Préparation de la photo…";
  try {
    const photoData = await window.STI_PROF_BADGE.blobToDataUrl(await window.STI_PROF_BADGE.compressPhoto(photoFile));
    msg.textContent = "Création du compte et enregistrement sécurisé du badge…";
    await adminAppel("creer", { email: email, password: pwd, nom:nom, fonction:fonction, matiere:matiere, photoData:photoData });
    msg.style.color = "var(--green)";
    msg.textContent = "Compte et badge créés ✔ — transmettez au professeur l’adresse du site, son adresse et son mot de passe provisoire.";
    ["#ad-name","#ad-email","#ad-pass","#ad-photo"].forEach(selector=>{const field=b.querySelector(selector);if(field)field.value="";});
    if(adminPhotoPreviewUrl)URL.revokeObjectURL(adminPhotoPreviewUrl);
    adminPhotoPreviewUrl="";b.querySelector("#ad-photo-status").textContent="";
    adminBadgePreview();
    adminLister();
  } catch(e){
    msg.style.color = "#b02a3a";
    msg.textContent = "Échec : " + (e.message || e);
  } finally { if(button)button.disabled=false; }
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
window.adminBadgePreview = adminBadgePreview; window.adminBadgePhotoChanged = adminBadgePhotoChanged;
window.adminSupprimer = adminSupprimer; window.adminReinitPrompt = adminReinitPrompt;
window.adminAppel = adminAppel;
