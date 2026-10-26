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
let adminPromptDrafts = [];

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
async function adminPromptAppel(action, params){
  const c = cloudCfg();
  if (!cloudReady() || !c.url || !c.key) throw new Error("Connexion Supabase non configurée.");
  const token = await authToken();
  if (!token) throw new Error("Session professeur absente ou expirée. Reconnectez-vous.");
  const r = await fetch(c.url.replace(/\/$/, "") + "/functions/v1/prompt-manager", {
    method: "POST",
    headers: { "apikey": c.key, "Authorization": "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(Object.assign({ action: action }, params || {}))
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || ("HTTP " + r.status));
  return d;
}
function adminPromptStatus(message, success){
  const zone = document.getElementById("ad-prompt-msg");
  if (!zone) return;
  zone.style.color = success ? "var(--green)" : "#b02a3a";
  zone.textContent = message || "";
}
function adminPromptRenderDrafts(){
  const zone = document.getElementById("ad-prompt-drafts");
  if (!zone) return;
  zone.innerHTML = adminPromptDrafts.length ? adminPromptDrafts.map((draft, index) =>
    '<article class="admin-prompt-draft"><div class="admin-prompt-draft-title"><strong>Brouillon ' + (index + 1) + '</strong><span>Non partagé tant que vous ne le publiez pas</span></div>' +
    '<label class="f">Titre<input maxlength="120" data-admin-prompt-index="' + index + '" data-admin-prompt-field="title" value="' + escapeHtml(draft.title) + '"></label>' +
    '<label class="f">Résumé<input maxlength="300" data-admin-prompt-index="' + index + '" data-admin-prompt-field="description" value="' + escapeHtml(draft.description) + '"></label>' +
    '<label class="f">Prompt<textarea rows="7" maxlength="4000" data-admin-prompt-index="' + index + '" data-admin-prompt-field="prompt">' + escapeHtml(draft.prompt) + '</textarea></label>' +
    '<div class="row" style="justify-content:flex-end"><button class="btn btn-blue btn-xs" type="button" data-admin-prompt-publish="' + index + '">Approuver et partager</button></div></article>'
  ).join("") : "";
}
async function adminPromptsLister(){
  const zone = document.getElementById("ad-prompt-library");
  if (!zone) return;
  zone.innerHTML = '<p class="tiny muted">Chargement…</p>';
  try {
    const d = await adminPromptAppel("list");
    const prompts = Array.isArray(d.prompts) ? d.prompts : [];
    const labels = { fiche:"Fiche pédagogique", exercices:"Séries d’exercices", correction:"Correction de copies", cahier:"Cahier de textes", repartition:"Répartition", document:"Autres documents" };
    zone.innerHTML = prompts.length ? '<div class="admin-prompt-library-list">' + prompts.map(item =>
      '<article class="admin-prompt-published"><div class="admin-prompt-published-head"><div><strong>' + escapeHtml(item.title || "Prompt sans titre") + '</strong><span>' + escapeHtml(labels[item.task] || item.task || "Outil") + '</span></div><button class="btn btn-xs btn-line" type="button" data-admin-prompt-unpublish="' + escapeHtml(item.id || "") + '">Retirer</button></div>' +
      (item.description ? '<p>' + escapeHtml(item.description) + '</p>' : '') +
      '<details><summary>Consulter le prompt partagé</summary><pre>' + escapeHtml(item.prompt || "") + '</pre></details></article>'
    ).join("") + '</div><p class="tiny muted">' + prompts.length + ' prompt(s) publiés dans la bibliothèque commune.</p>'
      : '<p class="tiny muted">La bibliothèque est encore vide. Générez des brouillons, relisez-les, puis approuvez ceux que vous souhaitez partager.</p>';
  } catch(e){
    zone.innerHTML = '<div class="note warn tiny">Impossible de charger la bibliothèque : ' + escapeHtml(String(e.message || e)) + '<br>Vérifiez le déploiement de <code>prompt-manager</code> et l’application de la migration SQL.</div>';
  }
}
async function adminPromptsGenerer(){
  if (!estAdmin()) { adminPromptStatus("Action réservée à l’administrateur.", false); return; }
  const task = document.getElementById("ad-prompt-task")?.value || "";
  const button = document.getElementById("ad-prompt-generate");
  if (button) button.disabled = true;
  adminPromptStatus("Claude prépare trois brouillons génériques côté serveur…", true);
  try {
    const d = await adminPromptAppel("draft", { task });
    adminPromptDrafts = (Array.isArray(d.drafts) ? d.drafts : []).map(item => ({
      task: String(d.task || task), title: String(item.title || "").slice(0, 120),
      description: String(item.description || "").slice(0, 300), prompt: String(item.prompt || "").slice(0, 4000)
    })).filter(item => item.title && item.prompt);
    adminPromptRenderDrafts();
    adminPromptStatus(adminPromptDrafts.length + " brouillon(s) reçus. Rien n’est partagé avant votre approbation.", true);
  } catch(e){
    adminPromptStatus("Échec de la génération : " + String(e.message || e), false);
  } finally { if (button) button.disabled = false; }
}
async function adminPromptPublier(index){
  if (!estAdmin()) { adminPromptStatus("Action réservée à l’administrateur.", false); return; }
  const draft = adminPromptDrafts[index];
  if (!draft) return;
  if (!draft.title.trim() || !draft.prompt.trim()) { adminPromptStatus("Le titre et le texte du prompt sont obligatoires.", false); return; }
  const button = document.querySelector('[data-admin-prompt-publish="' + index + '"]');
  if (button) button.disabled = true;
  adminPromptStatus("Publication du prompt approuvé…", true);
  try {
    await adminPromptAppel("publish", { task: draft.task, title: draft.title, description: draft.description, prompt: draft.prompt });
    adminPromptDrafts.splice(index, 1);
    adminPromptRenderDrafts();
    adminPromptStatus("Prompt approuvé et ajouté à la bibliothèque commune. Il est maintenant disponible dans l’Agent DeepSeek.", true);
    await adminPromptsLister();
    window.STI_AGENT?.reloadPrompts?.();
  } catch(e){
    adminPromptStatus("Impossible de publier ce prompt : " + String(e.message || e), false);
    if (button) button.disabled = false;
  }
}
async function adminPromptRetirer(id){
  if (!estAdmin() || !id) return;
  if (!confirm("Retirer ce prompt de la bibliothèque partagée ? Les demandes déjà envoyées ne sont pas affectées.")) return;
  try {
    await adminPromptAppel("unpublish", { id });
    adminPromptStatus("Prompt retiré de la bibliothèque commune. Son texte est conservé côté serveur.", true);
    await adminPromptsLister();
    window.STI_AGENT?.reloadPrompts?.();
  } catch(e){ adminPromptStatus("Impossible de retirer ce prompt : " + String(e.message || e), false); }
}
document.addEventListener("input", function(e){
  const field = e.target.closest("[data-admin-prompt-index][data-admin-prompt-field]");
  if (!field) return;
  const draft = adminPromptDrafts[Number(field.dataset.adminPromptIndex)];
  if (draft && ["title", "description", "prompt"].includes(field.dataset.adminPromptField)) draft[field.dataset.adminPromptField] = field.value;
});
document.addEventListener("click", function(e){
  const publish = e.target.closest("[data-admin-prompt-publish]");
  if (publish) { adminPromptPublier(Number(publish.dataset.adminPromptPublish)); return; }
  const unpublish = e.target.closest("[data-admin-prompt-unpublish]");
  if (unpublish) adminPromptRetirer(unpublish.dataset.adminPromptUnpublish);
});
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
  adminPromptsLister();
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
window.adminAppel = adminAppel; window.adminPromptsLister = adminPromptsLister;
window.adminPromptsGenerer = adminPromptsGenerer; window.adminPromptPublier = adminPromptPublier;
window.adminPromptRetirer = adminPromptRetirer;
