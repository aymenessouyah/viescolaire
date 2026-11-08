-- Pièces jointes des séances : métadonnées dans PostgreSQL, fichiers dans un
-- bucket privé. À appliquer au projet explicitement après validation.
create table if not exists public.documents_seance (
  id uuid primary key default gen_random_uuid(),
  prof_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  annee text not null check (length(annee) between 4 and 40),
  classe text not null check (classe in ('3SI1', '4SI2')),
  seance integer not null check (seance between 1 and 200),
  categorie text not null check (categorie in ('enonce', 'ressources', 'correction')),
  nom text not null check (length(nom) between 1 and 255),
  chemin text not null unique,
  taille bigint not null check (taille between 1 and 10485760),
  created_at timestamptz not null default now(),
  check (chemin ~ ('^' || prof_id::text || '/[0-9a-f-]{36}$')),
  unique (prof_id, annee, classe, seance, categorie, nom)
);
create index if not exists documents_seance_owner_year_idx on public.documents_seance (prof_id, annee, classe, seance);
alter table public.documents_seance enable row level security;
revoke all on public.documents_seance from public, anon;
grant select, insert, update, delete on public.documents_seance to authenticated;
drop policy if exists "documents_seance_select" on public.documents_seance;
drop policy if exists "documents_seance_insert" on public.documents_seance;
drop policy if exists "documents_seance_update" on public.documents_seance;
drop policy if exists "documents_seance_delete" on public.documents_seance;
create policy "documents_seance_select" on public.documents_seance for select to authenticated using (prof_id = auth.uid());
create policy "documents_seance_insert" on public.documents_seance for insert to authenticated with check (prof_id = auth.uid());
create policy "documents_seance_update" on public.documents_seance for update to authenticated using (prof_id = auth.uid()) with check (prof_id = auth.uid());
create policy "documents_seance_delete" on public.documents_seance for delete to authenticated using (prof_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents-seances', 'documents-seances', false, 10485760, null)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = null;
drop policy if exists "documents_seances_storage_select" on storage.objects;
drop policy if exists "documents_seances_storage_insert" on storage.objects;
drop policy if exists "documents_seances_storage_delete" on storage.objects;
create policy "documents_seances_storage_select" on storage.objects for select to authenticated
  using (bucket_id = 'documents-seances' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents_seances_storage_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents-seances' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents_seances_storage_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'documents-seances' and (storage.foldername(name))[1] = auth.uid()::text);
