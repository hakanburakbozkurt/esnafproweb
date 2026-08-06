-- Toptancı feed dosyaları (XML / Excel / CSV) için depolama
insert into storage.buckets (id, name, public, file_size_limit)
values (
  'toptanci-feedleri',
  'toptanci-feedleri',
  true,
  52428800
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists toptanci_feedleri_public_read on storage.objects;
drop policy if exists toptanci_feedleri_insert_own on storage.objects;
drop policy if exists toptanci_feedleri_update_own on storage.objects;
drop policy if exists toptanci_feedleri_delete_own on storage.objects;

create policy toptanci_feedleri_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'toptanci-feedleri');

create policy toptanci_feedleri_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'toptanci-feedleri'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy toptanci_feedleri_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'toptanci-feedleri'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'toptanci-feedleri'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy toptanci_feedleri_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'toptanci-feedleri'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
