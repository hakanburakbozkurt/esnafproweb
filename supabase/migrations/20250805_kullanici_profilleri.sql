-- auth.users.user_metadata.role ile senkron kullanıcı rol kaydı
create table if not exists public.kullanici_profilleri (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('esnaf', 'toptanci')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.kullanici_profilleri is
  'Kayıt sırasında atanan kullanıcı rolü — auth metadata ile senkron';

comment on column public.kullanici_profilleri.id is
  'auth.users(id) — kullanıcı hesabı';

comment on column public.kullanici_profilleri.role is
  'esnaf | toptanci';

alter table public.kullanici_profilleri enable row level security;

drop policy if exists kullanici_profilleri_select_own on public.kullanici_profilleri;

create policy kullanici_profilleri_select_own
  on public.kullanici_profilleri
  for select
  to authenticated
  using (id = auth.uid());

create or replace function public.sync_user_role_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
begin
  assigned_role := coalesce(
    nullif(new.raw_user_meta_data->>'role', ''),
    case
      when coalesce((new.raw_user_meta_data->>'toptanci')::boolean, false) then 'toptanci'
      else 'esnaf'
    end
  );

  if assigned_role not in ('esnaf', 'toptanci') then
    assigned_role := 'esnaf';
  end if;

  insert into public.kullanici_profilleri (id, role)
  values (new.id, assigned_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_sync_role on auth.users;

create trigger on_auth_user_created_sync_role
  after insert on auth.users
  for each row
  execute function public.sync_user_role_from_auth();
