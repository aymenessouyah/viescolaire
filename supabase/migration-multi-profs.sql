-- =========================================================================
--  Espace pédagogique STI — MIGRATION MULTI-PROFESSEURS
--  À exécuter UNE SEULE FOIS dans un projet existant (celui déjà créé) :
--    Supabase → SQL Editor → New query → coller tout → Run
--
--  Effet :
--    • chaque professeur connecté possède SES sauvegardes (colonne prof_id,
--      remplie automatiquement avec l'identifiant du compte connecté) ;
--    • un professeur ne peut ni lire ni écrire les sauvegardes d'un autre ;
--    • les anciens instantanés restent en base mais deviennent invisibles
--      (aucune donnée n'est perdue — l'application en crée un nouveau dès
--      le premier enregistrement).
-- =========================================================================

-- 1) Colonne du propriétaire (remplie automatiquement à l'insertion)
alter table public.espace_pedagogique
  add column if not exists prof_id uuid default auth.uid();

-- 2) Règles de sécurité : chaque compte ne voit que SES lignes
alter table public.espace_pedagogique enable row level security;

drop policy if exists "lecture authentifiee"          on public.espace_pedagogique;
drop policy if exists "ecriture authentifiee"         on public.espace_pedagogique;
drop policy if exists "lecture proprietaire"          on public.espace_pedagogique;
drop policy if exists "ecriture proprietaire"         on public.espace_pedagogique;
drop policy if exists "lecture espace"                on public.espace_pedagogique;
drop policy if exists "ecriture espace"               on public.espace_pedagogique;
drop policy if exists "lecture espace (propre prof)"  on public.espace_pedagogique;
drop policy if exists "ecriture espace (propre prof)" on public.espace_pedagogique;

create policy "lecture espace (propre prof)"
  on public.espace_pedagogique for select
  to authenticated
  using (prof_id = auth.uid());

create policy "ecriture espace (propre prof)"
  on public.espace_pedagogique for insert
  to authenticated
  with check (prof_id = auth.uid());

-- 3) Créer les comptes des professeurs
--    Authentication → Users → Add user → Create new user :
--      adresse électronique + mot de passe, cocher « Auto Confirm User ».
--    Les inscriptions restent fermées (« Allow new users to sign up » : OFF)
--    : personne ne peut créer de compte tout seul.

-- 4) (Facultatif) Nettoyage des instantanés d'essai antérieurs :
--    delete from public.espace_pedagogique;
