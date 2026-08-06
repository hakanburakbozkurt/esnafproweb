-- Marka ve telif hakları onay sözleşmesi kabul zamanı
alter table public.dukkanlar
  add column if not exists terms_accepted_at timestamptz;

comment on column public.dukkanlar.terms_accepted_at is
  'Esnafın marka/telif onay sözleşmesini kabul ettiği UTC zaman damgası';
