-- FSMVÜ Hukuk Kulübü — Duyurulara fotoğraflı konuşmacı alanı
-- Supabase Dashboard > SQL Editor içinde bu dosyanın tamamını çalıştırın.
-- (004_duyurular.sql daha önce çalıştırılmış olmalı: duyurular tablosu oradan gelir.)

-- ---------------------------------------------------------------------------
-- duyurular.konusmacilar — duyuru detayında gösterilen konuşmacı listesi.
-- Format: [{ "ad": "...", "unvan": "...", "foto_url": "..." }]
-- ---------------------------------------------------------------------------
alter table public.duyurular
  add column if not exists konusmacilar jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- Storage: duyuru konuşmacı fotoğrafları için herkese açık "duyurular" bucket'ı.
-- Herkes okuyabilir; sadece giriş yapmış yöneticiler yükler / siler.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('duyurular', 'duyurular', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "duyurular public read" on storage.objects;
create policy "duyurular public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'duyurular');
drop policy if exists "duyurular admin insert" on storage.objects;
create policy "duyurular admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'duyurular');
drop policy if exists "duyurular admin update" on storage.objects;
create policy "duyurular admin update" on storage.objects for update to authenticated
  using (bucket_id = 'duyurular') with check (bucket_id = 'duyurular');
drop policy if exists "duyurular admin delete" on storage.objects;
create policy "duyurular admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'duyurular');
