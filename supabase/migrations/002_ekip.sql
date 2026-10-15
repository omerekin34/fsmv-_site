-- FSMVÜ Hukuk Kulübü — Ekibimiz sayfası yönetimi
-- Supabase Dashboard > SQL Editor içinde bu dosyanın tamamını çalıştırın.
-- (001_init.sql daha önce çalıştırılmış olmalı: set_updated_at fonksiyonu oradan gelir.)

-- ---------------------------------------------------------------------------
-- ekip_uyeleri — /ekibimiz sayfası ve ana sayfadaki "Ekibimiz" bölümü
-- ---------------------------------------------------------------------------
create table if not exists public.ekip_uyeleri (
  id          uuid primary key default gen_random_uuid(),
  ad_soyad    text not null,
  unvan       text not null,
  grup        text not null default 'yonetim'
              check (grup in ('yonetim', 'departman')),
  foto_url    text,
  linkedin    text,
  email       text,
  sira        integer not null default 0,
  aktif       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists ekip_grup_sira_idx on public.ekip_uyeleri (grup, sira);
drop trigger if exists ekip_set_updated_at on public.ekip_uyeleri;
create trigger ekip_set_updated_at before update on public.ekip_uyeleri
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: ziyaretçiler sadece aktif üyeleri görür; yöneticiler her şeyi yapar.
-- ---------------------------------------------------------------------------
alter table public.ekip_uyeleri enable row level security;

drop policy if exists "public select aktif" on public.ekip_uyeleri;
create policy "public select aktif" on public.ekip_uyeleri for select to anon using (aktif = true);
drop policy if exists "admin select" on public.ekip_uyeleri;
create policy "admin select" on public.ekip_uyeleri for select to authenticated using (true);
drop policy if exists "admin insert" on public.ekip_uyeleri;
create policy "admin insert" on public.ekip_uyeleri for insert to authenticated with check (true);
drop policy if exists "admin update" on public.ekip_uyeleri;
create policy "admin update" on public.ekip_uyeleri for update to authenticated using (true) with check (true);
drop policy if exists "admin delete" on public.ekip_uyeleri;
create policy "admin delete" on public.ekip_uyeleri for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Storage: ekip fotoğrafları için herkese açık "ekip" bucket'ı.
-- Herkes okuyabilir; sadece giriş yapmış yöneticiler yükler / siler.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ekip', 'ekip', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ekip public read" on storage.objects;
create policy "ekip public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'ekip');
drop policy if exists "ekip admin insert" on storage.objects;
create policy "ekip admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'ekip');
drop policy if exists "ekip admin update" on storage.objects;
create policy "ekip admin update" on storage.objects for update to authenticated
  using (bucket_id = 'ekip') with check (bucket_id = 'ekip');
drop policy if exists "ekip admin delete" on storage.objects;
create policy "ekip admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'ekip');

-- ---------------------------------------------------------------------------
-- Başlangıç verisi: sitede hâlihazırda görünen ekip (tablo boşsa eklenir).
-- Fotoğraflar geçici örneklerdir; yönetim panelinden değiştirin.
-- ---------------------------------------------------------------------------
insert into public.ekip_uyeleri (ad_soyad, unvan, grup, foto_url, linkedin, email, sira)
select * from (values
  ('Elif Aydın',   'Kulüp Başkanı',                   'yonetim',   'https://i.pravatar.cc/300?img=47', 'https://linkedin.com', 'elif.aydin@fsm.edu.tr',    1),
  ('Mert Kaya',    'Başkan Yardımcısı',               'yonetim',   'https://i.pravatar.cc/300?img=12', 'https://linkedin.com', 'mert.kaya@fsm.edu.tr',     2),
  ('Zeynep Demir', 'Genel Sekreter',                  'yonetim',   'https://i.pravatar.cc/300?img=44', 'https://linkedin.com', 'zeynep.demir@fsm.edu.tr',  3),
  ('Emre Şahin',   'Sayman',                          'yonetim',   'https://i.pravatar.cc/300?img=15', 'https://linkedin.com', 'emre.sahin@fsm.edu.tr',    4),
  ('Selin Yıldız', 'Başkan Danışmanı',                'yonetim',   'https://i.pravatar.cc/300?img=25', 'https://linkedin.com', 'selin.yildiz@fsm.edu.tr',  5),
  ('Kerem Aksoy',  'Akademik Komite Başkanı',         'departman', 'https://i.pravatar.cc/300?img=33', 'https://linkedin.com', 'kerem.aksoy@fsm.edu.tr',   1),
  ('Derya Koç',    'Etkinlik Komitesi Başkanı',       'departman', 'https://i.pravatar.cc/300?img=31', 'https://linkedin.com', 'derya.koc@fsm.edu.tr',     2),
  ('Burak Öztürk', 'Sosyal Medya & Tasarım Başkanı',  'departman', 'https://i.pravatar.cc/300?img=56', 'https://linkedin.com', 'burak.ozturk@fsm.edu.tr',  3),
  ('İrem Çelik',   'Sponsorluk Başkanı',              'departman', 'https://i.pravatar.cc/300?img=20', 'https://linkedin.com', 'irem.celik@fsm.edu.tr',    4),
  ('Onur Erdoğan', 'Kurgusal Duruşma Başkanı',        'departman', 'https://i.pravatar.cc/300?img=60', 'https://linkedin.com', 'onur.erdogan@fsm.edu.tr',  5),
  ('Melis Arslan', 'Halkla İlişkiler Başkanı',        'departman', 'https://i.pravatar.cc/300?img=9',  'https://linkedin.com', 'melis.arslan@fsm.edu.tr',  6)
) as v(ad_soyad, unvan, grup, foto_url, linkedin, email, sira)
where not exists (select 1 from public.ekip_uyeleri);
