-- FSMVÜ Hukuk Kulübü — başlangıç şeması
-- Supabase Dashboard > SQL Editor içinde bu dosyanın tamamını çalıştırın.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Ortak: güncellenme zamanı tetikleyicisi
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- uyeler — /uye-ol formu
-- ---------------------------------------------------------------------------
create table if not exists public.uyeler (
  id          uuid primary key default gen_random_uuid(),
  ad_soyad    text not null,
  ogrenci_no  text not null,
  bolum       text not null,
  sinif       text not null,
  telefon     text not null,
  email       text not null,
  komite      text not null,
  motivasyon  text,
  kvkk_onay   boolean not null default false,
  durum       text not null default 'beklemede'
              check (durum in ('beklemede', 'mulakat', 'onaylandi', 'reddedildi')),
  admin_notu  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists uyeler_created_at_idx on public.uyeler (created_at desc);
create index if not exists uyeler_durum_idx on public.uyeler (durum);
drop trigger if exists uyeler_set_updated_at on public.uyeler;
create trigger uyeler_set_updated_at before update on public.uyeler
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- misir_turu_basvurulari — /misir-turu/basvuru sihirbazı
-- ---------------------------------------------------------------------------
create table if not exists public.misir_turu_basvurulari (
  id            uuid primary key default gen_random_uuid(),
  ad_soyad      text not null,
  ogrenci_no    text not null,
  sinif         text not null,
  telefon       text not null,
  email         text not null,
  pasaport      text not null,
  yurtdisi      text not null,
  heyecan       text[] not null default '{}',
  oda_tercihi   text not null,
  saglik_notu   text,
  kaynak        text not null,
  ek_not        text,
  kvkk_onay     boolean not null default false,
  durum         text not null default 'beklemede'
                check (durum in ('beklemede', 'iletisime_gecildi', 'kesinlesti', 'iptal')),
  admin_notu    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists misir_created_at_idx on public.misir_turu_basvurulari (created_at desc);
create index if not exists misir_durum_idx on public.misir_turu_basvurulari (durum);
drop trigger if exists misir_set_updated_at on public.misir_turu_basvurulari;
create trigger misir_set_updated_at before update on public.misir_turu_basvurulari
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- etkinlik_basvurulari — duyurulardaki "Katıl" modalı
-- ---------------------------------------------------------------------------
create table if not exists public.etkinlik_basvurulari (
  id          uuid primary key default gen_random_uuid(),
  ad_soyad    text not null,
  ogrenci_no  text not null,
  telefon     text not null,
  email       text not null,
  etkinlik    text not null,
  not_metni   text,
  durum       text not null default 'beklemede'
              check (durum in ('beklemede', 'onaylandi', 'reddedildi')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists etkinlik_created_at_idx on public.etkinlik_basvurulari (created_at desc);
create index if not exists etkinlik_etkinlik_idx on public.etkinlik_basvurulari (etkinlik);
drop trigger if exists etkinlik_set_updated_at on public.etkinlik_basvurulari;
create trigger etkinlik_set_updated_at before update on public.etkinlik_basvurulari
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- iletisim_mesajlari — /iletisim formu
-- ---------------------------------------------------------------------------
create table if not exists public.iletisim_mesajlari (
  id          uuid primary key default gen_random_uuid(),
  ad_soyad    text not null,
  email       text not null,
  konu        text not null,
  mesaj       text not null,
  okundu      boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists iletisim_created_at_idx on public.iletisim_mesajlari (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: ziyaretçiler (anon) sadece ekleyebilir; giriş yapmış yöneticiler
-- (authenticated) her şeyi okuyup düzenleyebilir / silebilir.
-- ---------------------------------------------------------------------------
alter table public.uyeler                 enable row level security;
alter table public.misir_turu_basvurulari enable row level security;
alter table public.etkinlik_basvurulari   enable row level security;
alter table public.iletisim_mesajlari     enable row level security;

-- uyeler
drop policy if exists "anon insert" on public.uyeler;
create policy "anon insert" on public.uyeler for insert to anon, authenticated with check (true);
drop policy if exists "admin select" on public.uyeler;
create policy "admin select" on public.uyeler for select to authenticated using (true);
drop policy if exists "admin update" on public.uyeler;
create policy "admin update" on public.uyeler for update to authenticated using (true) with check (true);
drop policy if exists "admin delete" on public.uyeler;
create policy "admin delete" on public.uyeler for delete to authenticated using (true);

-- misir_turu_basvurulari
drop policy if exists "anon insert" on public.misir_turu_basvurulari;
create policy "anon insert" on public.misir_turu_basvurulari for insert to anon, authenticated with check (true);
drop policy if exists "admin select" on public.misir_turu_basvurulari;
create policy "admin select" on public.misir_turu_basvurulari for select to authenticated using (true);
drop policy if exists "admin update" on public.misir_turu_basvurulari;
create policy "admin update" on public.misir_turu_basvurulari for update to authenticated using (true) with check (true);
drop policy if exists "admin delete" on public.misir_turu_basvurulari;
create policy "admin delete" on public.misir_turu_basvurulari for delete to authenticated using (true);

-- etkinlik_basvurulari
drop policy if exists "anon insert" on public.etkinlik_basvurulari;
create policy "anon insert" on public.etkinlik_basvurulari for insert to anon, authenticated with check (true);
drop policy if exists "admin select" on public.etkinlik_basvurulari;
create policy "admin select" on public.etkinlik_basvurulari for select to authenticated using (true);
drop policy if exists "admin update" on public.etkinlik_basvurulari;
create policy "admin update" on public.etkinlik_basvurulari for update to authenticated using (true) with check (true);
drop policy if exists "admin delete" on public.etkinlik_basvurulari;
create policy "admin delete" on public.etkinlik_basvurulari for delete to authenticated using (true);

-- iletisim_mesajlari
drop policy if exists "anon insert" on public.iletisim_mesajlari;
create policy "anon insert" on public.iletisim_mesajlari for insert to anon, authenticated with check (true);
drop policy if exists "admin select" on public.iletisim_mesajlari;
create policy "admin select" on public.iletisim_mesajlari for select to authenticated using (true);
drop policy if exists "admin update" on public.iletisim_mesajlari;
create policy "admin update" on public.iletisim_mesajlari for update to authenticated using (true) with check (true);
drop policy if exists "admin delete" on public.iletisim_mesajlari;
create policy "admin delete" on public.iletisim_mesajlari for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Yönetici hesabı: Dashboard > Authentication > Users > "Add user" ile
-- e-posta/şifre kullanıcısı oluşturun ("Auto Confirm User" işaretli).
-- Authentication > Providers > Email altında "Allow new users to sign up"
-- seçeneğini KAPATIN; böylece dışarıdan kimse hesap açamaz.
-- ---------------------------------------------------------------------------
