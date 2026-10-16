-- FSMVÜ Hukuk Kulübü — Mısır turu sayfa içeriği (tamamı yönetim panelinden düzenlenir)
-- 006_misir_turu_ayarlar.sql ve 007_misir_turu_basvurular.sql sonrasında çalıştırın.

drop view if exists public.misir_turu_kontenjan;

alter table public.misir_turu_ayarlar
  drop column if exists tur_tarihi,
  add column if not exists tur_baslangic   date,
  add column if not exists tur_bitis       date,
  add column if not exists sure_metni      text,
  add column if not exists hero_ust_baslik text,
  add column if not exists baslik          text,
  add column if not exists aciklama        text,
  add column if not exists hero_gorsel     text,
  add column if not exists one_cikanlar    text[]  not null default '{}',
  add column if not exists program         jsonb   not null default '[]',
  add column if not exists konaklama       jsonb   not null default '[]',
  add column if not exists rota            text[]  not null default '{}',
  add column if not exists dahil           text[]  not null default '{}',
  add column if not exists dahil_degil     text[]  not null default '{}',
  add column if not exists galeri          text[]  not null default '{}',
  add column if not exists sss             jsonb   not null default '[]',
  add column if not exists cta_baslik      text,
  add column if not exists cta_metin       text;

-- Varsayılan içerik (yalnızca boş alanlar doldurulur; mevcut düzenlemeler korunur)
update public.misir_turu_ayarlar set
  sure_metni      = coalesce(sure_metni, '6 Gün / 5 Gece'),
  hero_ust_baslik = coalesce(hero_ust_baslik, 'Kadim uygarlığa yolculuk'),
  baslik          = coalesce(baslik, 'Mısır Hukuk & Kültür Turu'),
  aciklama        = coalesce(aciklama, 'Piramitlerin gölgesinde tarih, Kahire Üniversitesi’nde hukuk. 6 günlük unutulmaz akademik ve kültürel bir deneyim sizi bekliyor.'),
  hero_gorsel     = coalesce(hero_gorsel, 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1600&q=80'),
  one_cikanlar    = case when cardinality(one_cikanlar) = 0 then array[
    'Giza Piramitleri ve Sfenks rehberli turu',
    'Kahire Üniversitesi Hukuk Fakültesi akademik ziyareti',
    'Mısır Müzesi ve Khan el-Khalili çarşısı',
    'Luksor ve Karnak tapınakları',
    'Nil Nehri tekne turu',
    'Türkçe konuşan profesyonel rehber eşliği'] else one_cikanlar end,
  program = case when program = '[]'::jsonb then '[
    {"day":"1. Gün","title":"İstanbul – Kahire","meta":"Uçuş · Otel","desc":"İstanbul Havalimanı’nda buluşma ve Kahire’ye uçuş. Otele yerleşme, akşam serbest zaman ve tanışma programı."},
    {"day":"2. Gün","title":"Giza Piramitleri & Sfenks","meta":"Rehberli gezi","desc":"Keops, Kefren ve Mikerinos piramitleri ile Büyük Sfenks’in rehberli gezisi. Öğleden sonra Sakkara antik bölgesi."},
    {"day":"3. Gün","title":"Mısır Müzesi & Khan el-Khalili","meta":"Müze · Çarşı","desc":"Dünyaca ünlü Mısır Müzesi ziyareti, ardından tarihi Khan el-Khalili çarşısında serbest zaman."},
    {"day":"4. Gün","title":"Kahire Üniversitesi Hukuk Fakültesi","meta":"Akademik ziyaret","desc":"Kahire Üniversitesi Hukuk Fakültesi akademik ziyareti; Mısırlı hukuk öğrencileriyle karşılaştırmalı hukuk söyleşisi ve kampüs turu."},
    {"day":"5. Gün","title":"Luksor & Karnak – Nil Turu","meta":"İç hat uçuş · Nil","desc":"Sabah uçuşuyla Luksor’a geçiş. Karnak ve Luksor tapınakları gezisi, gün batımında Nil Nehri’nde feluka tekne turu."},
    {"day":"6. Gün","title":"Dönüş","meta":"Dönüş uçuşu","desc":"Otelde kahvaltının ardından Kahire’ye dönüş ve İstanbul’a uçuş. Program sonu."}
  ]'::jsonb else program end,
  konaklama = case when konaklama = '[]'::jsonb then '[
    {"title":"Konaklama","desc":"Kahire’de 4 yıldızlı otelde 4 gece, Luksor’da 1 gece konaklama; sabah kahvaltıları dahildir."},
    {"title":"Ulaşım","desc":"İstanbul–Kahire gidiş-dönüş uçak bileti, Kahire–Luksor iç hat uçuşu ve tüm transferler dahildir."},
    {"title":"Rehberlik","desc":"Program boyunca Türkçe konuşan profesyonel rehber ve kulüp görevlisi eşliğinde seyahat."},
    {"title":"Vize & Pasaport","desc":"Mısır vizesi kapıda alınabilmektedir. Pasaportunuzun en az 6 ay geçerliliği olmalıdır."}
  ]'::jsonb else konaklama end,
  rota = case when cardinality(rota) = 0 then array['İstanbul', 'Kahire', 'Giza & Sakkara', 'Luksor & Karnak', 'İstanbul'] else rota end,
  dahil = case when cardinality(dahil) = 0 then array[
    'İstanbul–Kahire gidiş-dönüş uçak bileti',
    'Kahire–Luksor iç hat uçuşu',
    '5 gece konaklama (kahvaltı dahil)',
    'Tüm transferler',
    'Türkçe rehberlik hizmeti',
    'Programdaki müze ve ören yeri girişleri'] else dahil end,
  dahil_degil = case when cardinality(dahil_degil) = 0 then array[
    'Mısır vize ücreti',
    'Öğle ve akşam yemekleri',
    'Kişisel harcamalar',
    'Seyahat sağlık sigortası (önerilir)'] else dahil_degil end,
  galeri = case when cardinality(galeri) = 0 then array[
    'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80',
    'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80',
    'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80',
    'https://images.unsplash.com/photo-1590133324192-1df305deeefc?w=800&q=80',
    'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&q=80',
    'https://images.unsplash.com/photo-1600520611035-84157ad4084d?w=800&q=80'] else galeri end,
  sss = case when sss = '[]'::jsonb then '[
    {"q":"Tura kimler katılabilir?","a":"Tüm FSMVÜ öğrencileri ve mezunları katılabilir. Kulüp üyeliği şartı aranmamakla birlikte üyelere öncelik tanınır."},
    {"q":"Tura dahil olan ücretler nelerdir?","a":"Uçak biletleri, konaklama, sabah kahvaltıları, tüm transferler, rehberlik hizmeti ve belirtilen müze/ören yeri girişleri ücrete dahildir."},
    {"q":"Pasaportum yok, katılabilir miyim?","a":"Evet. Başvuru formunda pasaport durumunuzu belirtmeniz yeterlidir; pasaport çıkarma sürecinde kulüp ekibimiz size rehberlik eder."},
    {"q":"Ödeme nasıl yapılır?","a":"Kesin kayıt sonrasında kulüp saymanımız sizinle iletişime geçerek taksitlendirme ve ödeme seçenekleri hakkında bilgi verir."},
    {"q":"Tur ne zaman gerçekleşecek?","a":"Tur, Mayıs ayı içinde final sınavları sonrasında gerçekleşecek şekilde planlanmaktadır. Kesin tarihler duyurular sayfasından ilan edilecektir."}
  ]'::jsonb else sss end,
  cta_baslik = coalesce(cta_baslik, 'Kontenjan sınırlı, Mısır seni bekliyor'),
  cta_metin  = coalesce(cta_metin, 'Başvuru yaklaşık 2 dakika sürer; soruları tek tek yanıtlayarak ön kaydını oluştur.')
where id = 1;

-- Görünüm: tüm sayfa içeriği + başvuru sayıları (ziyaretçi başvuru tablosunu göremez)
create or replace view public.misir_turu_kontenjan as
select
  a.kontenjan, a.son_basvuru, a.basvuru_acik, a.ucret,
  a.tur_baslangic, a.tur_bitis, a.sure_metni,
  a.hero_ust_baslik, a.baslik, a.aciklama, a.hero_gorsel,
  a.one_cikanlar, a.program, a.konaklama, a.rota, a.dahil, a.dahil_degil, a.galeri, a.sss,
  a.cta_baslik, a.cta_metin,
  count(b.id) filter (where b.durum = 'kesinlesti')::int        as kesinlesen,
  count(b.id) filter (where b.durum = 'beklemede')::int         as bekleyen,
  count(b.id) filter (where b.durum = 'iletisime_gecildi')::int as iletisimde,
  count(b.id) filter (where b.durum = 'iptal')::int             as iptal,
  count(b.id)::int                                              as toplam,
  (a.kontenjan is not null
    and count(b.id) filter (where b.durum = 'kesinlesti') >= a.kontenjan) as dolu
from public.misir_turu_ayarlar a
left join public.misir_turu_basvurulari b on true
where a.id = 1
group by a.id;

grant select on public.misir_turu_kontenjan to anon, authenticated;

-- Galeri / hero görselleri için depolama
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('misir-turu', 'misir-turu', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "misir public read" on storage.objects;
create policy "misir public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'misir-turu');
drop policy if exists "misir admin insert" on storage.objects;
create policy "misir admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'misir-turu');
drop policy if exists "misir admin update" on storage.objects;
create policy "misir admin update" on storage.objects for update to authenticated
  using (bucket_id = 'misir-turu') with check (bucket_id = 'misir-turu');
drop policy if exists "misir admin delete" on storage.objects;
create policy "misir admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'misir-turu');
