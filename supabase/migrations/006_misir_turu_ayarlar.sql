-- FSMVÜ Hukuk Kulübü — Mısır turu ayarları (kontenjan, son başvuru, tarih, ücret)

create table if not exists public.misir_turu_ayarlar (
  id            int primary key default 1 check (id = 1),
  kontenjan     int check (kontenjan is null or kontenjan > 0),
  son_basvuru   date,
  basvuru_acik  boolean not null default true,
  tur_tarihi    text,
  ucret         text,
  updated_at    timestamptz not null default now()
);
insert into public.misir_turu_ayarlar (id, kontenjan) values (1, 40) on conflict (id) do nothing;
drop trigger if exists misir_ayarlar_set_updated_at on public.misir_turu_ayarlar;
create trigger misir_ayarlar_set_updated_at before update on public.misir_turu_ayarlar
  for each row execute function public.set_updated_at();

alter table public.misir_turu_ayarlar enable row level security;
drop policy if exists "public select" on public.misir_turu_ayarlar;
create policy "public select" on public.misir_turu_ayarlar for select to anon, authenticated using (true);
drop policy if exists "admin update" on public.misir_turu_ayarlar;
create policy "admin update" on public.misir_turu_ayarlar for update to authenticated using (true) with check (true);
