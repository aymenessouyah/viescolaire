// Shared DeepSeek prompt library and Claude prompt-draft generator.
// Claude is called only for generic, task-level drafts. No teacher request,
// student work, copy, image, profile, or document content is forwarded to Claude.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TASKS: Record<string, { label: string; genericGoal: string }> = {
  fiche: {
    label: "Fiche pédagogique",
    genericGoal: "préparer une fiche de séance avec objectifs observables, déroulement, activités, supports et évaluation, sans prétendre décrire un cours déjà réalisé",
  },
  exercices: {
    label: "Séries d’exercices",
    genericGoal: "concevoir des exercices de Sciences et technologies de l’informatique avec consignes autonomes, niveau adapté et corrigé vérifiable",
  },
  correction: {
    label: "Correction de copies",
    genericGoal: "analyser pédagogiquement une copie selon un sujet et un barème, justifier les points et signaler les éléments incertains sans inventer de réponse",
  },
  cahier: {
    label: "Cahier de textes",
    genericGoal: "rédiger une entrée de cahier à partir du seul travail réellement déclaré par le professeur, sans inventer une séance effectuée",
  },
  repartition: {
    label: "Répartition",
    genericGoal: "proposer une progression pédagogique qui respecte les séances, les dates, le calendrier et les statuts transmis par le professeur",
  },
  document: {
    label: "Autres documents",
    genericGoal: "réviser un document pédagogique fourni à l’avenir, en conservant les informations utiles et sans modifier le fichier source",
  },
};

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 300;
const MAX_PROMPT = 4_000;
const MAX_BODY_BYTES = 128 * 1024;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

function json(status: number, value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

function clean(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

function parseJson(text: string): any {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try { return JSON.parse(trimmed); } catch (_) { /* try the JSON object in the response */ }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
  throw new Error("Claude n’a pas renvoyé un objet JSON exploitable.");
}

function adminEmails(): string[] {
  return (Deno.env.get("ADMIN_EMAILS") ?? "")
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
}

async function getUser(request: Request) {
  const authorization = request.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return { error: json(401, { error: "Connexion professeur requise." }) };
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) return { error: json(500, { error: "Configuration Supabase de la fonction incomplète." }) };
  try {
    const client = createClient(url, anon, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return { error: json(401, { error: "Session professeur invalide ou expirée." }) };
    return { user, url };
  } catch (_) {
    return { error: json(503, { error: "Impossible de vérifier la session professeur." }) };
  }
}

function serviceClient(url: string) {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("Configuration service_role manquante pour la bibliothèque de prompts.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function cleanDrafts(value: unknown) {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>).prompts : null;
  if (!Array.isArray(source)) throw new Error("La réponse de Claude ne contient pas de liste de prompts.");
  const seen = new Set<string>();
  const prompts = source.slice(0, 3).map((item: any) => ({
    title: clean(item?.title, MAX_TITLE),
    description: clean(item?.description, MAX_DESCRIPTION),
    prompt: clean(item?.prompt, MAX_PROMPT),
  })).filter(item => {
    if (!item.title || !item.prompt) return false;
    const key = item.prompt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!prompts.length) throw new Error("Claude n’a proposé aucun prompt complet.");
  return prompts;
}

async function generateGenericDrafts(task: string) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
  const model = clean(Deno.env.get("ANTHROPIC_MODEL"), 120);
  if (!apiKey || !model) {
    return { error: json(503, {
      error: "Génération Claude indisponible : configurez ANTHROPIC_API_KEY et ANTHROPIC_MODEL dans les secrets des fonctions Edge Supabase.",
    }) };
  }
  const taskInfo = TASKS[task];
  // Deliberately build this request from a fixed allowlisted task only. Do not
  // read or forward any other request field to Anthropic.
  const genericRequest = [
    "Crée exactement trois propositions distinctes de prompts génériques, réutilisables par un professeur tunisien de Sciences et technologies de l’informatique.",
    `Outil concerné : ${taskInfo.label}.`,
    `Objectif pédagogique général : ${taskInfo.genericGoal}.`,
    "Chaque prompt doit compléter les consignes de l’outil et ne doit pas inventer de contenu officiel, de données de classe ou de réponse d’élève.",
    "Les futurs prompts seront appliqués par DeepSeek à des demandes qui ne te sont pas transmises.",
    "N’inclus aucun nom, identifiant, résultat, copie, photographie ni contenu provenant d’un professeur ou d’un élève.",
    "Renvoie exclusivement un objet JSON avec une propriété prompts contenant trois objets {title, description, prompt}.",
  ].join("\n");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 3_000,
        temperature: 0.4,
        system: "Tu es un concepteur de consignes pédagogiques génériques. Tu rédiges des modèles réutilisables, jamais une réponse à une demande réelle. Respecte strictement le format JSON demandé et n’ajoute aucun texte autour.",
        messages: [{ role: "user", content: genericRequest }],
      }),
      signal: controller.signal,
    });
    const raw = await response.text();
    if (!response.ok) {
      let reason = "";
      try { reason = clean(JSON.parse(raw)?.error?.message, 240); } catch (_) { /* omit non-JSON provider details */ }
      return { error: json(502, { error: `L’API Claude a répondu avec le code ${response.status}.${reason ? ` ${reason}` : ""}` }) };
    }
    let providerData: any;
    try { providerData = JSON.parse(raw); }
    catch (_) { return { error: json(502, { error: "Réponse illisible de l’API Claude." }) }; }
    const content = Array.isArray(providerData?.content)
      ? providerData.content.map((part: any) => typeof part?.text === "string" ? part.text : "").join("\n")
      : "";
    if (!content.trim()) return { error: json(502, { error: "Claude n’a produit aucun brouillon exploitable." }) };
    try { return { drafts: cleanDrafts(parseJson(content)) }; }
    catch (error) { return { error: json(502, { error: clean((error as Error)?.message || error, 300) }) }; }
  } catch (error) {
    if ((error as Error)?.name === "AbortError") return { error: json(504, { error: "La génération Claude a dépassé le délai de 45 secondes. Réessayez." }) };
    return { error: json(502, { error: "Impossible de contacter l’API Claude." }) };
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json(405, { error: "Méthode non autorisée." });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return json(413, { error: "Demande trop volumineuse." });

  const auth = await getUser(request);
  if ("error" in auth) return auth.error;
  const user = auth.user;
  let bodyText = "";
  try { bodyText = await request.text(); }
  catch (_) { return json(400, { error: "Corps JSON invalide." }); }
  if (new TextEncoder().encode(bodyText).byteLength > MAX_BODY_BYTES) return json(413, { error: "Demande trop volumineuse." });
  let body: any;
  try { body = JSON.parse(bodyText); }
  catch (_) { return json(400, { error: "Corps JSON invalide." }); }

  const action = clean(body?.action, 30);
  const task = clean(body?.task, 30);
  const admins = adminEmails();
  const isAdmin = !!user.email && admins.includes(user.email.toLowerCase());
  const requireAdmin = () => isAdmin ? null : json(403, { error: "Action réservée à l’administrateur." });

  try {
    if (action === "list") {
      const client = serviceClient(auth.url!);
      const { data, error } = await client.from("agent_prompt_library")
        .select("id,task,title,description,prompt,created_at")
        .eq("published", true)
        .order("task", { ascending: true })
        .order("title", { ascending: true });
      if (error) throw error;
      return json(200, { prompts: data ?? [] });
    }

    if (action === "draft") {
      const denied = requireAdmin();
      if (denied) return denied;
      if (!Object.hasOwn(TASKS, task)) return json(400, { error: "Choisissez un outil pédagogique valide." });
      const generated = await generateGenericDrafts(task);
      if ("error" in generated) return generated.error;
      return json(200, { drafts: generated.drafts, task, privacy: "generic-only" });
    }

    if (action === "publish") {
      const denied = requireAdmin();
      if (denied) return denied;
      if (!Object.hasOwn(TASKS, task)) return json(400, { error: "Choisissez un outil pédagogique valide." });
      const title = clean(body?.title, MAX_TITLE);
      const description = clean(body?.description, MAX_DESCRIPTION);
      const prompt = clean(body?.prompt, MAX_PROMPT);
      if (!title || !prompt) return json(400, { error: "Le titre et le texte du prompt sont obligatoires." });
      const client = serviceClient(auth.url!);
      const { data, error } = await client.from("agent_prompt_library").insert({
        task, title, description, prompt, published: true, created_by: user.id,
      }).select("id,task,title,description,prompt,created_at").single();
      if (error) throw error;
      return json(201, { prompt: data });
    }

    if (action === "unpublish") {
      const denied = requireAdmin();
      if (denied) return denied;
      const id = clean(body?.id, 36);
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return json(400, { error: "Identifiant de prompt invalide." });
      }
      const client = serviceClient(auth.url!);
      const { error } = await client.from("agent_prompt_library").update({ published: false, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return json(200, { ok: true });
    }

    return json(400, { error: "Action inconnue." });
  } catch (error) {
    return json(500, { error: clean((error as Error)?.message || error, 400) || "Erreur serveur." });
  }
});
