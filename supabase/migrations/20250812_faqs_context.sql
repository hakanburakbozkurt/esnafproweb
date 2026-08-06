-- SSS kayıtlarını sayfa bağlamına göre ayır (ana sayfa / fiyatlandırma)
alter table public.faqs
  add column if not exists context text not null default 'anasayfa'
  check (context in ('anasayfa', 'fiyatlandirma'));

drop index if exists faqs_active_sort_idx;

create index if not exists faqs_context_active_sort_idx
  on public.faqs (context, is_active, sort_order);

comment on column public.faqs.context is
  'SSS görünüm alanı: anasayfa (esnafpro.app alt) veya fiyatlandirma';
