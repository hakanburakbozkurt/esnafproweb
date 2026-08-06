-- wholesaler_xmls: legacy wholesaler_id → user_id (auth.users), toptancilar ile aynı sözleşme

alter table public.wholesaler_xmls add column if not exists user_id uuid;

-- Eski şema: wholesaler_id → profiles.id (genelde auth.users ile aynı uuid)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wholesaler_xmls'
      and column_name = 'wholesaler_id'
  ) then
    update public.wholesaler_xmls
    set user_id = wholesaler_id
    where user_id is null
      and wholesaler_id is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wholesaler_xmls'
      and column_name = 'last_sync_at'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wholesaler_xmls'
      and column_name = 'last_synced_at'
  ) then
    alter table public.wholesaler_xmls rename column last_sync_at to last_synced_at;
  end if;
end $$;

alter table public.wholesaler_xmls add column if not exists last_synced_at timestamptz;
alter table public.wholesaler_xmls add column if not exists updated_at timestamptz not null default now();

alter table public.wholesaler_xmls drop constraint if exists wholesaler_xmls_wholesaler_id_fkey;
alter table public.wholesaler_xmls drop column if exists wholesaler_id;

do $$
begin
  if not exists (select 1 from public.wholesaler_xmls where user_id is null) then
    alter table public.wholesaler_xmls alter column user_id set not null;
  end if;
end $$;

alter table public.wholesaler_xmls drop constraint if exists wholesaler_xmls_user_id_fkey;

alter table public.wholesaler_xmls
  add constraint wholesaler_xmls_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

create index if not exists wholesaler_xmls_user_id_idx on public.wholesaler_xmls (user_id);

comment on column public.wholesaler_xmls.user_id is
  'auth.users(id) — feed kaydının sahibi toptancı hesabı';

alter table public.wholesaler_xmls enable row level security;

drop policy if exists wholesaler_xmls_select_own on public.wholesaler_xmls;
drop policy if exists wholesaler_xmls_insert_own on public.wholesaler_xmls;
drop policy if exists wholesaler_xmls_update_own on public.wholesaler_xmls;
drop policy if exists wholesaler_xmls_delete_own on public.wholesaler_xmls;

create policy wholesaler_xmls_select_own
  on public.wholesaler_xmls
  for select
  to authenticated
  using (user_id = auth.uid());

create policy wholesaler_xmls_insert_own
  on public.wholesaler_xmls
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy wholesaler_xmls_update_own
  on public.wholesaler_xmls
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy wholesaler_xmls_delete_own
  on public.wholesaler_xmls
  for delete
  to authenticated
  using (user_id = auth.uid());
