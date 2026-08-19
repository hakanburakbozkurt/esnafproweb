-- stores.owner_id → auth.users(id)
-- Önceki FK public.profiles(id) idi; profiles boş kaldığı için dukkan oluşturma
-- trigger'ı (handle_new_dukkan) stores insert sırasında 23503 hatası veriyordu.
-- RLS ve uygulama kodu owner_id = auth.uid() bekliyor.

alter table public.stores
  drop constraint if exists stores_owner_id_fkey;

alter table public.stores
  add constraint stores_owner_id_fkey
  foreign key (owner_id)
  references auth.users (id)
  on delete cascade;

comment on column public.stores.owner_id is
  'Mağaza sahibi — auth.users(id), dukkanlar.user_id ile aynı uuid.';

create or replace function public.handle_new_dukkan()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.stores (id, owner_id, slug, name)
  values (new.id, new.user_id, new.slug, new.dukkan_adi)
  on conflict (id) do update
    set owner_id = excluded.owner_id,
        slug = excluded.slug,
        name = excluded.name;

  return new;
end;
$$;

comment on function public.handle_new_dukkan() is
  'dukkanlar insert sonrası service_devices RLS için stores satırı oluşturur.';
