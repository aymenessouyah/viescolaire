// Supabase Edge Function — administration des professeurs
// (déployée côté Supabase ; jamais exposée côté navigateur)
//
// Autorisations : uniquement les adresses listées dans le secret ADMIN_EMAILS.
// Le navigateur appelle la fonction avec SA session (Authorization: Bearer <jeton>) ;
// la fonction vérifie l'identité, puis utilise la clé service_role (injectée
// automatiquement par Supabase) pour gérer les comptes.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMINS = (Deno.env.get("ADMIN_EMAILS") ?? "")
  .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const json = (code, obj) => new Response(JSON.stringify(obj), { status: code, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url  = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // 1) qui appelle ?
    const sbUser = createClient(url, anon, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });
    const { data: { user }, error: eUser } = await sbUser.auth.getUser();
    if (eUser || !user) return json(401, { error: "session requise — connectez-vous au site d'abord" });
    const email = (user.email ?? "").toLowerCase();
    if (!ADMINS.includes(email)) return json(403, { error: "réservé à l'administrateur (" + ADMINS.join(", ") + ")" });

    // 2) opérations d'administration (clé service_role, côté serveur uniquement)
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const body = await req.json();
    const { action, email: newEmail, password, id } = body;

    if (action === "lister") {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) throw error;
      const ids = data.users.map(u => u.id);
      const profiles = ids.length
        ? await admin.from("profils_professeurs").select("prof_id,nom,badge_code").in("prof_id", ids)
        : { data: [], error: null };
      if (profiles.error) throw profiles.error;
      const byId = new Map((profiles.data || []).map(p => [p.prof_id, p]));
      return json(200, {
        users: data.users.map(u => {
          const profile = byId.get(u.id) || {};
          return { id: u.id, email: u.email, nom: profile.nom || "", badge_code: profile.badge_code || "", cree: u.created_at, derniere: u.last_sign_in_at };
        })
      });
    }
    if (action === "creer") {
      const nom = String(body.nom || "").trim();
      const fonction = String(body.fonction || "Professeur").trim() || "Professeur";
      const matiere = String(body.matiere || "Sciences et technologies de l’informatique").trim() || "Sciences et technologies de l’informatique";
      const photoData = String(body.photoData || "");
      if (!newEmail || !password || password.length < 6 || !nom)
        return json(400, { error: "nom, adresse et mot de passe (6 caractères au moins) requis" });
      if (nom.length > 120 || fonction.length > 100 || matiere.length > 160)
        return json(400, { error: "un des champs du badge dépasse la longueur autorisée" });
      if (photoData.length > 2_000_000)
        return json(413, { error: "la photo compressée est trop volumineuse" });
      const photoMatch = /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/.exec(photoData);
      if (!photoMatch) return json(400, { error: "une photo JPEG compressée est requise pour créer le badge" });
      const decoded = atob(photoMatch[1]);
      if (!decoded.length || decoded.length > 1_048_576)
        return json(400, { error: "la photo doit faire au plus 1 Mo après compression" });
      const photoBytes = Uint8Array.from(decoded, char => char.charCodeAt(0));

      const { data, error } = await admin.auth.admin.createUser({
        email: newEmail, password: password, email_confirm: true
      });
      if (error) throw error;
      const id = data.user?.id;
      if (!id) throw new Error("Supabase n’a pas retourné l’identifiant du professeur.");
      const photoPath = id + "/portrait.jpg";
      const badgeCode = "STI-" + id.replace(/-/g, "").slice(0, 8).toUpperCase();
      const photoBlob = new Blob([photoBytes], { type: "image/jpeg" });
      const { error: uploadError } = await admin.storage.from("professeur-photos").upload(photoPath, photoBlob, {
        contentType: "image/jpeg", cacheControl: "3600", upsert: true
      });
      if (uploadError) {
        await admin.auth.admin.deleteUser(id).catch(() => {});
        throw uploadError;
      }
      const { error: profileError } = await admin.from("profils_professeurs").upsert({
        prof_id: id, nom, fonction, matiere, signature: "", badge_code: badgeCode,
        photo_path: photoPath, updated_at: new Date().toISOString()
      }, { onConflict: "prof_id" });
      if (profileError) {
        await admin.storage.from("professeur-photos").remove([photoPath]).catch(() => {});
        await admin.auth.admin.deleteUser(id).catch(() => {});
        throw profileError;
      }
      return json(200, { user: { id, email: data.user?.email, nom, badge_code: badgeCode } });
    }
    if (action === "supprimer") {
      if (!id) return json(400, { error: "id requis" });
      if (email === ADMINS[0]) return json(400, { error: "impossible de supprimer le compte administrateur principal" });
      await admin.storage.from("professeur-photos").remove([id + "/portrait.jpg"]).catch(() => {});
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw error;
      return json(200, { ok: true });
    }
    if (action === "reinit") {
      if (!id || !password || password.length < 6)
        return json(400, { error: "id et mot de passe (6 caractères au moins) requis" });
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) throw error;
      return json(200, { ok: true });
    }
    return json(400, { error: "action inconnue" });
  } catch (e) {
    return json(500, { error: String((e as Error)?.message || e) });
  }
});
