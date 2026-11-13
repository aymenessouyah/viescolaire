-- Carnet de liens utiles du professeur : une table par professeur, protégée par
-- RLS. À appliquer au projet Supabase après validation de l'administrateur.
-- Sans cette migration, la page « Mon carnet de liens » le signale clairement
-- et n'enregistre rien en prétendant le contraire.
create table if not exists public.liens_utiles (
  id uuid primary key default gen_random_uuid(),
  prof_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  titre text not null check (length(btrim(titre)) between 1 and 120),
  url text not null check (length(url) between 8 and 2048),
  categorie text not null default 'Autre' check (categorie in ('Cours', 'Exercices', 'Outils', 'Références', 'Autre')),
  description text not null default '' check (length(description) <= 300),
  -- seuls http(s) sont acceptés : un « javascript: » collé par erreur ne peut
  -- pas devenir un lien exécutable dans la page
  check (url ~* '^https?://[^[:space:]]+$'),
  ordre integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists liens_utiles_owner_idx on public.liens_utiles (prof_id, categorie, ordre, created_at);
alter table public.liens_utiles enable row level security;
revoke all on public.liens_utiles from public, anon;
grant select, insert, update, delete on public.liens_utiles to authenticated;
drop policy if exists "liens_utiles_select" on public.liens_utiles;
drop policy if exists "liens_utiles_insert" on public.liens_utiles;
drop policy if exists "liens_utiles_update" on public.liens_utiles;
drop policy if exists "liens_utiles_delete" on public.liens_utiles;
create policy "liens_utiles_select" on public.liens_utiles for select to authenticated using (prof_id = auth.uid());
create policy "liens_utiles_insert" on public.liens_utiles for insert to authenticated with check (prof_id = auth.uid());
create policy "liens_utiles_update" on public.liens_utiles for update to authenticated using (prof_id = auth.uid()) with check (prof_id = auth.uid());
create policy "liens_utiles_delete" on public.liens_utiles for delete to authenticated using (prof_id = auth.uid());

-- La date de modification est tenue par la base : un client ne peut pas la
-- falsifier, et deux appareils ne se contredisent pas sur l'horloge.
create or replace function public.liens_utiles_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists liens_utiles_touch on public.liens_utiles;
create trigger liens_utiles_touch before update on public.liens_utiles
  for each row execute function public.liens_utiles_touch();
