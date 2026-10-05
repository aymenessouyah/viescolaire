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
    const { action, email: newEmail, password, id } = await req.json();

    if (action === "lister") {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) throw error;
      return json(200, {
        users: data.users.map(u => ({ id: u.id, email: u.email, cree: u.created_at, derniere: u.last_sign_in_at }))
      });
    }
    if (action === "creer") {
      if (!newEmail || !password || password.length < 6)
        return json(400, { error: "adresse et mot de passe (6 caractères au moins) requis" });
      const { data, error } = await admin.auth.admin.createUser({
        email: newEmail, password: password, email_confirm: true
      });
      if (error) throw error;
      return json(200, { user: { id: data.user?.id, email: data.user?.email } });
    }
    if (action === "supprimer") {
      if (!id) return json(400, { error: "id requis" });
      if (email === ADMINS[0]) return json(400, { error: "impossible de supprimer le compte administrateur principal" });
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
