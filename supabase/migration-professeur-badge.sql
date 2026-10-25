-- Badge privé par professeur : profil global + photo dans un bucket Supabase privé.
-- À exécuter une fois dans Supabase → SQL Editor → New query.
-- Les objets photo sont rangés sous <auth.uid()>/portrait.jpg.

create table if not exists public.profils_professeurs (
  prof_id uuid primary key references auth.users(id) on delete cascade,
  nom text not null default '',
  fonction text not null default 'Professeur',
  matiere text not null default 'Sciences et technologies de l’informatique',
  signature text not null default '',
  badge_code text,
  photo_path text,
  updated_at timestamptz not null default now()
);

alter table public.profils_professeurs
  add column if not exists nom text not null default '',
  add column if not exists fonction text not null default 'Professeur',
  add column if not exists matiere text not null default 'Sciences et technologies de l’informatique',
  add column if not exists signature text not null default '',
  add column if not exists badge_code text,
  add column if not exists photo_path text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profils_professeurs_badge_code_idx
  on public.profils_professeurs (badge_code) where badge_code is not null;

alter table public.profils_professeurs enable row level security;

drop policy if exists "profils_professeurs_select_own" on public.profils_professeurs;
drop policy if exists "profils_professeurs_insert_own" on public.profils_professeurs;
drop policy if exists "profils_professeurs_update_own" on public.profils_professeurs;

create policy "profils_professeurs_select_own"
  on public.profils_professeurs for select to authenticated
  using (prof_id = auth.uid());

create policy "profils_professeurs_insert_own"
  on public.profils_professeurs for insert to authenticated
  with check (prof_id = auth.uid());

create policy "profils_professeurs_update_own"
  on public.profils_professeurs for update to authenticated
  using (prof_id = auth.uid())
  with check (prof_id = auth.uid());

revoke all on public.profils_professeurs from public, anon;
grant select, insert, update on public.profils_professeurs to authenticated;

-- Le bucket est privé : ni URL publique ni lecture anonyme.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'professeur-photos',
  'professeur-photos',
  false,
  1048576,
  array['image/jpeg']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Chaque professeur peut lire, créer, remplacer et supprimer uniquement sa photo.
drop policy if exists "professeur_photo_select_own" on storage.objects;
drop policy if exists "professeur_photo_insert_own" on storage.objects;
drop policy if exists "professeur_photo_update_own" on storage.objects;
drop policy if exists "professeur_photo_delete_own" on storage.objects;

create policy "professeur_photo_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'professeur-photos' and name = (auth.uid()::text || '/portrait.jpg'));

create policy "professeur_photo_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'professeur-photos' and name = (auth.uid()::text || '/portrait.jpg'));

create policy "professeur_photo_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'professeur-photos' and name = (auth.uid()::text || '/portrait.jpg'))
  with check (bucket_id = 'professeur-photos' and name = (auth.uid()::text || '/portrait.jpg'));

create policy "professeur_photo_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'professeur-photos' and name = (auth.uid()::text || '/portrait.jpg'));
