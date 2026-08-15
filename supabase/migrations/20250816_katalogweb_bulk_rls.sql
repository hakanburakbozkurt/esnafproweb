-- katalogweb: hızlı toplu kayıt sıralaması
alter table public.katalogweb
  add column if not exists sort_order integer not null default 0;

comment on column public.katalogweb.sort_order is
  'Aynı marka/model altındaki görsellerin vitrin sırası.';

create index if not exists katalogweb_user_brand_model_idx
  on public.katalogweb (user_id, brand, model_name, sort_order);

-- Sahip: kendi kayıtlarını (satılmış dahil) okuyabilir
drop policy if exists katalogweb_select_owner on public.katalogweb;
create policy katalogweb_select_owner
  on public.katalogweb
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Sahip: kendi adına kayıt ekleyebilir
drop policy if exists katalogweb_insert_owner on public.katalogweb;
create policy katalogweb_insert_owner
  on public.katalogweb
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Sahip: kendi kayıtlarını silebilir
drop policy if exists katalogweb_delete_owner on public.katalogweb;
create policy katalogweb_delete_owner
  on public.katalogweb
  for delete
  to authenticated
  using (auth.uid() = user_id);
