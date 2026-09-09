-- İlan bazlı kredi kartı taksit kabul bayrağı (public vitrin)

alter table public.second_hand_devices
  add column if not exists accepts_installments boolean not null default false;

comment on column public.second_hand_devices.accepts_installments is
  'Aktifken public vitrinde taksit önizlemesi gösterilir.';

drop view if exists public.second_hand_devices_public;

create view public.second_hand_devices_public as
select
  id,
  user_id,
  brand,
  model,
  capacity,
  color,
  condition,
  sale_price,
  device_category,
  listing_type,
  accepts_installments,
  image_urls,
  notes,
  battery_health,
  battery_cycle_count,
  changed_parts,
  non_working_features,
  has_warranty,
  warranty_type,
  has_box,
  has_invoice,
  processor,
  ram,
  hdd,
  ssd,
  gpu,
  screen_size,
  resolution,
  sim_support,
  operating_system,
  case_material,
  has_sapphire_glass,
  casing_type,
  drive_type,
  web_published,
  web_published_at,
  web_slug,
  web_title,
  web_description,
  created_at
from public.second_hand_devices
where web_published = true and status = 'available';
