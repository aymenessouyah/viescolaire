-- Bibliothèque commune de prompts Gemini.
-- À appliquer seulement après confirmation explicite de l’administrateur du projet.
-- Les professeurs connectés peuvent lire les prompts publiés; seul le serveur
-- prompt-manager, avec service_role et contrôle ADMIN_EMAILS, peut les gérer.

begin;

create table if not exists public.agent_prompt_library (
  id uuid primary key default gen_random_uuid(),
  task text not null check (task in ('fiche', 'exercices', 'correction', 'cahier', 'repartition', 'document')),
  title text not null check (length(title) between 1 and 120),
  description text not null default '' check (length(description) <= 300),
  prompt text not null check (length(prompt) between 1 and 4000),
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_prompt_library_published_task_title_idx
  on public.agent_prompt_library (task, title)
  where published = true;

alter table public.agent_prompt_library enable row level security;

drop policy if exists "lecture des prompts publies" on public.agent_prompt_library;
create policy "lecture des prompts publies"
  on public.agent_prompt_library for select
  to authenticated
  using (published = true);

revoke all on public.agent_prompt_library from public, anon, authenticated;
grant select on public.agent_prompt_library to authenticated;
grant all on public.agent_prompt_library to service_role;

commit;
