-- Vie scolaire 1.4 : synchronisation atomique sur la table EXISTANTE.
-- À appliquer dans SQL Editor APRÈS export JSON et sauvegarde de la base.
-- N'efface aucune donnée, ne change aucune politique RLS, ne crée pas de compte.
-- Accorde les seuls droits de table/séquence requis à authenticated ; RLS
-- continue d'isoler les données par prof_id. Aucune lecture anonyme.
-- Toutes les applications qui écrivent ce compte doivent être mises à jour.
-- Les anciens clients qui insèrent directement ne participent pas au verrou.

revoke all on public.espace_pedagogique from public, anon;
grant select, insert on public.espace_pedagogique to authenticated;
do $$
declare
  v_id_sequence text := pg_catalog.pg_get_serial_sequence('public.espace_pedagogique', 'id');
begin
  if v_id_sequence is not null then
    execute format('revoke all on sequence %s from public, anon', v_id_sequence);
    execute format('grant usage, select on sequence %s to authenticated', v_id_sequence);
  end if;
end;
$$;

create or replace function public.sti_sync_snapshot(
  p_annee text,
  p_expected_id text default null,
  p_snapshot jsonb default null,
  p_commit boolean default false
) returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_head public.espace_pedagogique%rowtype;
  v_id bigint;
  v_exists boolean;
begin
  if v_uid is null then raise exception 'Connexion obligatoire' using errcode = '28000'; end if;
  if p_annee is null or length(p_annee) not between 4 and 40 then
    raise exception 'Annee invalide' using errcode = '22023';
  end if;
  -- Un seul écrivain à la fois pour ce professeur et cette année.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text || '|' || p_annee, 0));
  select * into v_head from public.espace_pedagogique
    where prof_id = v_uid and annee = p_annee order by id desc limit 1;
  v_exists := found;
  if not p_commit then
    return jsonb_build_object('status','read','head',case when v_exists then
      jsonb_build_object('id',v_head.id::text,'payload',v_head.payload,'created_at',v_head.created_at) else null end);
  end if;
  if (case when v_exists then v_head.id::text else null end) is distinct from p_expected_id then
    return jsonb_build_object('status','retry','head',case when v_exists then
      jsonb_build_object('id',v_head.id::text,'payload',v_head.payload,'created_at',v_head.created_at) else null end);
  end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object'
     or jsonb_typeof(p_snapshot->'payload') is distinct from 'object' then
    raise exception 'Instantane invalide' using errcode = '22023';
  end if;
  insert into public.espace_pedagogique(prof,lycee,annee,device,prof_id,payload)
    values(p_snapshot->>'prof',p_snapshot->>'lycee',p_annee,p_snapshot->>'device',v_uid,p_snapshot->'payload')
    returning id into v_id;
  select * into v_head from public.espace_pedagogique where id=v_id and prof_id=v_uid;
  return jsonb_build_object('status','committed','head',jsonb_build_object(
    'id',v_head.id::text,'payload',v_head.payload,'created_at',v_head.created_at));
end;
$$;
revoke all on function public.sti_sync_snapshot(text,text,jsonb,boolean) from public;
revoke all on function public.sti_sync_snapshot(text,text,jsonb,boolean) from anon;
grant execute on function public.sti_sync_snapshot(text,text,jsonb,boolean) to authenticated;

-- Retour arrière du SQL seul, sans effacer les instantanés :
-- drop function public.sti_sync_snapshot(text,text,jsonb,boolean);
-- Ne pas retirer cette fonction tant que la nouvelle application est utilisée.
