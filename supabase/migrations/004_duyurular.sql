-- FSMVÜ Hukuk Kulübü — Duyurular sayfası yönetimi + etkinlik kontenjan sistemi
-- Supabase Dashboard > SQL Editor içinde bu dosyanın tamamını çalıştırın.
-- (001_init.sql daha önce çalıştırılmış olmalı: etkinlik_basvurulari tablosu
--  ve set_updated_at fonksiyonu oradan gelir.)

-- ---------------------------------------------------------------------------
-- duyurular — /duyurular listesi, /duyurular/:slug detayı, ana sayfadaki
-- "Güncel Duyurular" bölümü ve navbar üstündeki "Son Başvuru" çubuğu.
--   tur = 'etkinlik' → başvuru alınır (Katıl butonu, kontenjan, son başvuru)
--   tur = 'duyuru'   → sadece bilgi; gecerlilik dolunca "Süresi Doldu" olur
-- ---------------------------------------------------------------------------
create table if not exists public.duyurular (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  baslik           text not null,
  ozet             text not null default '',          -- kart üzerindeki kısa açıklama
  kategori         text not null default 'Genel',     -- Yarışma, Kariyer, Gezi, Genel, Üyelik, Yönetim ...
  tur              text not null default 'duyuru' check (tur in ('etkinlik', 'duyuru')),
  yayin_tarihi     date not null default current_date, -- karttaki büyük tarih, sıralama bu alandan
  etkinlik_tarihi  date,                              -- tur = etkinlik için zorunlu (tetikleyici kontrol eder)
  saat             text,                              -- örn. '14:00'
  yer              text,
  son_basvuru      date,                              -- boşsa etkinlik tarihine kadar başvuru alınır
  kontenjan        integer check (kontenjan is null or kontenjan > 0), -- boş = sınırsız
  gecerlilik       date,                              -- tur = duyuru için: bu tarihten sonra "Süresi Doldu"
  icerik           text[] not null default '{}',      -- "Duyuru Hakkında" paragrafları
  detaylar         text[] not null default '{}',      -- "Detaylar" maddeleri
  iletisim         text,                              -- e-posta
  yayinda          boolean not null default true,     -- false ise sitede görünmez (taslak)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists duyurular_yayin_tarihi_idx on public.duyurular (yayin_tarihi desc);
create index if not exists duyurular_son_basvuru_idx on public.duyurular (son_basvuru);
drop trigger if exists duyurular_set_updated_at on public.duyurular;
create trigger duyurular_set_updated_at before update on public.duyurular
  for each row execute function public.set_updated_at();

-- Etkinlik türündeki duyurularda etkinlik tarihi zorunludur.
create or replace function public.duyuru_dogrula()
returns trigger language plpgsql as $$
begin
  if new.tur = 'etkinlik' and new.etkinlik_tarihi is null then
    raise exception 'Etkinlik türündeki duyurular için etkinlik tarihi zorunludur.';
  end if;
  if new.tur = 'etkinlik' and new.son_basvuru is not null and new.son_basvuru > new.etkinlik_tarihi then
    raise exception 'Son başvuru tarihi etkinlik tarihinden sonra olamaz.';
  end if;
  return new;
end $$;
drop trigger if exists duyurular_dogrula on public.duyurular;
create trigger duyurular_dogrula before insert or update on public.duyurular
  for each row execute function public.duyuru_dogrula();

-- ---------------------------------------------------------------------------
-- etkinlik_basvurulari → duyurular bağı
-- "etkinlik" (başlık metni) sütunu geriye dönük uyumluluk için kalır;
-- yeni başvurular duyuru_id ile eşleşir.
-- ---------------------------------------------------------------------------
alter table public.etkinlik_basvurulari
  add column if not exists duyuru_id uuid references public.duyurular (id) on delete set null;
create index if not exists etkinlik_duyuru_id_idx on public.etkinlik_basvurulari (duyuru_id);
create index if not exists etkinlik_durum_idx on public.etkinlik_basvurulari (durum);

-- ---------------------------------------------------------------------------
-- duyuru_kontenjan — her etkinlik için onaylanan başvuru sayısı.
-- Ziyaretçiler başvuru tablosunu okuyamaz (RLS), ancak bu görünüm yalnızca
-- toplam sayıları açığa çıkarır; siteye "12 / 40" ve "Kontenjan Doldu"
-- etiketi buradan gelir.
-- ---------------------------------------------------------------------------
create or replace view public.duyuru_kontenjan as
select
  d.id                                                    as duyuru_id,
  d.kontenjan,
  count(b.id) filter (where b.durum = 'onaylandi')::int   as onaylanan,
  count(b.id) filter (where b.durum = 'beklemede')::int   as bekleyen,
  count(b.id)::int                                        as toplam,
  (d.kontenjan is not null
    and count(b.id) filter (where b.durum = 'onaylandi') >= d.kontenjan) as dolu
from public.duyurular d
left join public.etkinlik_basvurulari b on b.duyuru_id = d.id
where d.tur = 'etkinlik'
group by d.id, d.kontenjan;

grant select on public.duyuru_kontenjan to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Kontenjan ve süre kontrolü (sunucu tarafı güvence):
--  • Ziyaretçi başvurusu: etkinlik yayında değilse, son başvuru geçmişse ya da
--    kontenjan dolmuşsa yeni başvuru kabul edilmez.
--  • Yönetici onayı: onaylanan sayısı kontenjana ulaşmışsa yeni onay verilemez
--    (panelde hata mesajı görünür).
-- ---------------------------------------------------------------------------
create or replace function public.etkinlik_basvuru_kontrol()
returns trigger language plpgsql as $$
declare
  d        public.duyurular%rowtype;
  onayli   integer;
begin
  if new.duyuru_id is null then
    return new;
  end if;

  select * into d from public.duyurular where id = new.duyuru_id for update;
  if not found then
    raise exception 'Etkinlik bulunamadı.';
  end if;

  select count(*) into onayli
  from public.etkinlik_basvurulari
  where duyuru_id = new.duyuru_id and durum = 'onaylandi'
    and (tg_op = 'INSERT' or id <> new.id);

  if tg_op = 'INSERT' then
    if not d.yayinda or d.tur <> 'etkinlik' then
      raise exception 'Bu etkinlik için başvuru alınmamaktadır.';
    end if;
    if coalesce(d.son_basvuru, d.etkinlik_tarihi) < current_date then
      raise exception 'Bu etkinliğin başvuru süresi dolmuştur.';
    end if;
    if d.kontenjan is not null and onayli >= d.kontenjan then
      raise exception 'Bu etkinliğin kontenjanı dolmuştur.';
    end if;
  end if;

  if new.durum = 'onaylandi' and (tg_op = 'INSERT' or old.durum is distinct from 'onaylandi') then
    if d.kontenjan is not null and onayli >= d.kontenjan then
      raise exception 'Kontenjan dolu (% / %). Yeni onay verilemez.', onayli, d.kontenjan;
    end if;
  end if;

  return new;
end $$;
drop trigger if exists etkinlik_basvuru_kontrol on public.etkinlik_basvurulari;
create trigger etkinlik_basvuru_kontrol before insert or update on public.etkinlik_basvurulari
  for each row execute function public.etkinlik_basvuru_kontrol();

-- ---------------------------------------------------------------------------
-- RLS: ziyaretçiler sadece yayındaki duyuruları görür; giriş yapmış
-- yöneticiler her şeyi yapar.
-- ---------------------------------------------------------------------------
alter table public.duyurular enable row level security;

drop policy if exists "public select yayinda" on public.duyurular;
create policy "public select yayinda" on public.duyurular for select to anon using (yayinda = true);
drop policy if exists "admin select" on public.duyurular;
create policy "admin select" on public.duyurular for select to authenticated using (true);
drop policy if exists "admin insert" on public.duyurular;
create policy "admin insert" on public.duyurular for insert to authenticated with check (true);
drop policy if exists "admin update" on public.duyurular;
create policy "admin update" on public.duyurular for update to authenticated using (true) with check (true);
drop policy if exists "admin delete" on public.duyurular;
create policy "admin delete" on public.duyurular for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Başlangıç verisi: sitede hâlihazırda görünen 8 duyuru (slug yoksa eklenir).
-- Yönetim panelinden düzenleyebilir / silebilirsiniz.
-- ---------------------------------------------------------------------------
insert into public.duyurular (slug, baslik, ozet, kategori, tur, yayin_tarihi, etkinlik_tarihi, saat, yer, son_basvuru, kontenjan, gecerlilik, icerik, detaylar, iletisim)
values
  ('guz-donemi-hukuk-semineri', 'Güz Dönemi Hukuk Semineri: Anayasa Yargısında Güncel Gelişmeler',
   'Anayasa Mahkemesi raportörlerinin konuk olacağı güz dönemi seminerimiz için kayıtlar açıldı.',
   'Kariyer', 'etkinlik', date '2026-10-14', date '2026-11-05', '14:00', 'FSMVÜ Hukuk Fakültesi, Amfi 2', date '2026-11-03', 120, null,
   array['Güz dönemi hukuk seminerimizde bu yıl anayasa yargısındaki güncel gelişmeleri ele alıyoruz. Anayasa Mahkemesi raportörleri ve akademisyenlerin katılacağı seminerde bireysel başvuru usulü, norm denetimi ve güncel içtihatlar tartışılacak.','Seminer iki oturumdan oluşacak; ilk oturumda bireysel başvuruya ilişkin usul ve esaslar, ikinci oturumda ise güncel AYM kararlarının uygulamaya yansımaları değerlendirilecek. Oturumların ardından soru-cevap bölümü yapılacaktır.','Katılım ücretsizdir ancak salon kapasitesi nedeniyle kayıt zorunludur. Tüm katılımcılara dijital katılım belgesi gönderilecektir.']::text[],
   array['Tüm fakülte öğrencilerine açıktır, kulüp üyeliği şartı yoktur.','Katılım belgesi için her iki oturuma da katılım gereklidir.','Kayıtlar 3 Kasım 2026 tarihinde kapanacaktır.','Program akışı kayıt olanlara e-posta ile iletilecektir.']::text[],
   'hukukkulubu@fsm.edu.tr'),

  ('ix-kurgusal-durusma-yarismasi', 'IX. Kurgusal Duruşma Yarışması Başvuruları Açıldı',
   'Bu yıl ceza hukuku temalı kurgusal duruşma yarışmamız için takım başvuruları başladı. Kontenjan sınırlıdır.',
   'Yarışma', 'etkinlik', date '2026-10-08', date '2026-12-05', '10:00', 'FSMVÜ Hukuk Fakültesi, Konferans Salonu', date '2026-11-15', 40, null,
   array['Geleneksel hâle gelen Kurgusal Duruşma Yarışmamızın dokuzuncusu bu yıl ceza hukuku temasıyla düzenleniyor. Katılımcı takımlar, kurgusal bir dosya üzerinden iddia ve savunma makamı olarak duruşma pratiği yapma imkânı bulacak.','Yarışmaya 2 veya 3 kişilik takımlar hâlinde başvuru yapılabilir. Başvurusu kabul edilen takımlara yarışma dosyası ve yazılı dilekçe takvimi e-posta ile iletilecektir. Jüri, alanında deneyimli akademisyenler ve uygulamacı hukukçulardan oluşacaktır.','Final turu ödül töreniyle sona erecek olup dereceye giren takımlara çeşitli hukuk yayınları ve staj imkânları sunulacaktır.']::text[],
   array['Başvurular 2 veya 3 kişilik takımlar hâlinde yapılır.','Son başvuru tarihi 15 Kasım 2026’dır.','Kontenjan 40 takımla sınırlıdır; başvurular değerlendirme sırasına göre kabul edilir.','Yazılı dilekçe formatı ve puanlama kriterleri kabul edilen takımlara gönderilecektir.','Eleme ve final turları 5 Aralık 2026’da fakülte konferans salonunda yapılacaktır.']::text[],
   'hukukkulubu@fsm.edu.tr'),

  ('hukuk-kutuphanesi-calisma-saatleri', 'Hukuk Kütüphanesi Çalışma Saatleri',
   'Kulüp çalışma odamızın dönem içi kullanım saatleri güncellenmiştir. Hafta içi 09.00–18.00 arası açıktır.',
   'Genel', 'duyuru', date '2026-10-05', null, null, null, null, null, null,
   array['Kulüp çalışma odamızın 2026–2027 güz dönemi kullanım saatleri güncellenmiştir. Oda, hafta içi her gün 09.00 ile 18.00 saatleri arasında tüm üyelerimizin kullanımına açıktır.','Sınav dönemlerinde çalışma odasının açık kalma saati, talep yoğunluğuna göre 21.00’e kadar uzatılabilir. Güncel saat değişiklikleri kulübümüzün duyuru kanallarından paylaşılacaktır.','Oda kullanımı sırasında sessizlik kurallarına uyulmasını ve ortak materyallerin yerine bırakılmasını rica ederiz.']::text[],
   array['Hafta içi 09.00–18.00 arası açıktır; hafta sonu kapalıdır.','Sınav dönemlerinde saatler uzatılabilir.','Kütüphane materyalleri oda dışına çıkarılamaz.','Grup çalışması için rezervasyon yönetim kurulundan yapılabilir.']::text[],
   null),

  ('misir-hukuk-ve-kultur-turu', 'Mısır Hukuk ve Kültür Turu Kayıtları',
   'Kahire ve Luksor’u kapsayan hukuk temalı kültür turumuza katılım başvuruları alınmaya başlandı.',
   'Gezi', 'etkinlik', date '2026-10-01', date '2027-01-25', '09:00', 'Kahire – Luksor, Mısır', date '2026-11-30', 30, null,
   array['Geleneksel yurt dışı gezimiz bu yıl Mısır’a düzenleniyor. 6 gün sürecek programda Kahire Üniversitesi Hukuk Fakültesi ziyareti, Kahire’de hukuk müzeleri ve tabii ki Giza Piramitleri ile Luksor’un tarihî mekânları yer alıyor.','Gezi ücrete tabidir; ücrete ulaşım, konaklama, kahvaltı ve programdaki rehberli turlar dâhildir. Ödeme iki taksit hâlinde yapılabilir. Pasaport süresi geziden itibaren en az 6 ay geçerli olmalıdır.','Kontenjan 30 kişiyle sınırlıdır ve başvurular üyelik önceliğine göre değerlendirilecektir.']::text[],
   array['Başvurular 30 Kasım 2026’da kapanacaktır; kontenjan 30 kişidir.','Pasaportun gezi tarihinden itibaren en az 6 ay geçerli olması gerekir.','Ücrete ulaşım, konaklama, kahvaltı ve rehberli turlar dâhildir.','Ödemeler iki taksit hâlinde yapılabilir.','18 yaş altı öğrenciler veli izin belgesi ile katılabilir.']::text[],
   'hukukkulubu@fsm.edu.tr'),

  ('donem-ici-uye-alimi-sonuclari', 'Dönem İçi Üye Alımı Sonuçları',
   'Dönem içi üye alım mülakat sonuçları açıklanmıştır. Sonuçlar e-posta yoluyla bildirilmiştir.',
   'Üyelik', 'duyuru', date '2026-09-30', null, null, null, null, null, date '2026-10-05',
   array['Eylül ayında yapılan dönem içi üye alım mülakatlarının sonuçları açıklanmıştır. Değerlendirme, başvuru formu ve mülakat performansı esas alınarak yapılmıştır.','Kabul edilen adaylara sonuçlar e-posta yoluyla bildirilmiş olup oryantasyon toplantısı daveti ayrıca iletilecektir. Bu duyuru 5 Ekim 2026 tarihine kadar geçerlidir; itirazlar bu tarihe kadar yapılabilir.']::text[],
   array['Sonuçlar başvuruda belirtilen e-posta adreslerine gönderilmiştir.','E-posta ulaşmayan adaylar spam klasörünü kontrol etmelidir.','İtirazlar 5 Ekim 2026’ya kadar yapılabilir.','Bir sonraki üye alımı bahar döneminde yapılacaktır.']::text[],
   'hukukkulubu@fsm.edu.tr'),

  ('staj-ve-kariyer-gunleri', 'Staj ve Kariyer Günleri Etkinliği',
   'Önde gelen hukuk bürolarının katılacağı kariyer günleri etkinliğimiz için kayıt yaptırmayı unutmayın.',
   'Kariyer', 'etkinlik', date '2026-09-28', date '2026-10-28', '10:00', 'FSMVÜ Merkez Kampüs, Fuaye Alanı', date '2026-10-10', 200, null,
   array['Staj ve Kariyer Günleri etkinliğimizde önde gelen hukuk büroları, kurumsal şirketlerin hukuk departmanları ve kamu kurumları temsilcileri öğrencilerle buluşuyor. Etkinlikte stant görüşmelerinin yanı sıra panel oturumları ve CV değerlendirme stantları da yer alacak.','Katılımcılar, temsil ettikleri kurumun staj programları hakkında bilgi alabilecek ve başvuru süreçlerine ilişkin sorularını doğrudan yetkililere iletebileceklerdir.']::text[],
   array['Etkinlik tüm hukuk fakültesi öğrencilerine açıktır.','CV’nizi yanınızda getirmeniz önerilir; değerlendirme stantları ücretsizdir.','Panel oturumları salon kapasitesiyle sınırlıdır.']::text[],
   null),

  ('yeni-yonetim-kurulu-secildi', 'Yeni Yönetim Kurulu Seçildi',
   'Olağan genel kurul toplantımızda 2026–2027 dönemi yönetim kurulumuz belirlenmiştir. Tüm üyelerimize teşekkür ederiz.',
   'Yönetim', 'duyuru', date '2026-09-15', null, null, null, null, null, null,
   array['Olağan genel kurul toplantımızda 2026–2027 akademik yılı yönetim kurulumuz belirlenmiştir. Toplantıya katılan tüm üyelerimize ve görev üstlenen arkadaşlarımıza teşekkür ederiz.','Yeni yönetim kurulumuz; akademik etkinlikler, sosyal sorumluluk projeleri ve üyeler arası iletişimi güçlendirmeyi hedefleyen bir çalışma programıyla göreve başlamıştır.','Yönetim kurulu listesi ve çalışma komiteleri kulüp panosunda ve dijital kanallarımızda ilan edilmiştir.']::text[],
   array['Yönetim kurulu 7 asil 5 yedek üyeden oluşmaktadır.','Çalışma komiteleri için üye başvuruları devam etmektedir.','Genel kurul tutanağı üyelerimizin erişimine açıktır.']::text[],
   null),

  ('oryantasyon-bulusmasi', 'Oryantasyon Buluşması',
   'Yeni üyelerimize ve birinci sınıf öğrencilerimize yönelik tanışma ve oryantasyon buluşmamız gerçekleşti.',
   'Üyelik', 'etkinlik', date '2026-09-10', date '2026-09-25', '13:30', 'FSMVÜ Hukuk Fakültesi, Bahçe', date '2026-09-22', 150, null,
   array['Yeni akademik yılın ilk buluşması olan oryantasyon etkinliğimizde kulübümüzü, çalışma komitelerimizi ve yıl içi programımızı tanıttık. Katılan tüm üyelerimize ve birinci sınıf öğrencilerimize teşekkür ederiz.','Etkinlikte komite tanıtımları, soru-cevap oturumu ve tanışma oyunları yer aldı.']::text[],
   array['Etkinlik 25 Eylül 2026’da gerçekleşmiştir.','Katılım serbestti; komite başvuruları etkinlik sonrasında da devam etmektedir.']::text[],
   null)
on conflict (slug) do nothing;

-- Daha önce başlık metniyle kaydedilmiş başvuruları ilgili duyuruya bağla.
update public.etkinlik_basvurulari b
set duyuru_id = d.id
from public.duyurular d
where b.duyuru_id is null and b.etkinlik = d.baslik;
