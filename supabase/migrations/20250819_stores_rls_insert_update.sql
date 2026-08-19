-- stores: INSERT/UPDATE RLS (service_devices mirror tablosu)
-- Önceki durum: yalnızca stores_select_public vardı; upsert 42501 veriyordu.

alter table public.stores enable row level security;

drop policy if exists stores_insert_owner on public.stores;
drop policy if exists stores_update_owner on public.stores;

create policy stores_insert_owner
  on public.stores
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.dukkanlar d
      where d.id = stores.id
        and d.user_id = auth.uid()
    )
  );

create policy stores_update_owner
  on public.stores
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.dukkanlar d
      where d.id = stores.id
        and d.user_id = auth.uid()
    )
  );

comment on policy stores_insert_owner on public.stores is
  'Mağaza sahibi, kendi dukkanlar kaydına karşılık gelen stores mirror satırını oluşturabilir.';

comment on policy stores_update_owner on public.stores is
  'Mağaza sahibi slug/ad güncellemelerinde kendi stores mirror satırını güncelleyebilir.';
