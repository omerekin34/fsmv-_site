-- FSMVÜ Hukuk Kulübü — Mısır turu başvuruları: kontenjan görünümü ve sunucu tarafı kontrol
-- 006_misir_turu_ayarlar.sql sonrasında çalıştırın.

-- Ziyaretçiler başvuru tablosunu okuyamaz; bu görünüm yalnızca sayıları açar.
create or replace view public.misir_turu_kontenjan as
select
  a.kontenjan,
  a.son_basvuru,
  a.basvuru_acik,
  a.tur_tarihi,
  a.ucret,
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
group by a.id, a.kontenjan, a.son_basvuru, a.basvuru_acik, a.tur_tarihi, a.ucret;

grant select on public.misir_turu_kontenjan to anon, authenticated;

-- Sunucu tarafı güvence: kapalı / süresi dolmuş / dolu iken başvuru alınmaz,
-- aynı öğrenci no ile mükerrer başvuru engellenir, kontenjan doluyken yeni
-- "Kesinleşti" verilemez.
create or replace function public.misir_basvuru_kontrol()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  a        public.misir_turu_ayarlar%rowtype;
  kesin    integer;
begin
  select * into a from public.misir_turu_ayarlar where id = 1 for update;
  if not found then
    return new;
  end if;

  select count(*) into kesin
  from public.misir_turu_basvurulari
  where durum = 'kesinlesti' and (tg_op = 'INSERT' or id <> new.id);

  if tg_op = 'INSERT' then
    if not a.basvuru_acik then
      raise exception 'Mısır turu başvuruları şu anda kapalıdır.';
    end if;
    if a.son_basvuru is not null and a.son_basvuru < current_date then
      raise exception 'Mısır turu başvuru süresi dolmuştur.';
    end if;
    if a.kontenjan is not null and kesin >= a.kontenjan then
      raise exception 'Mısır turu kontenjanı dolmuştur.';
    end if;
    if exists (
      select 1 from public.misir_turu_basvurulari
      where durum <> 'iptal' and (ogrenci_no = new.ogrenci_no or lower(email) = lower(new.email))
    ) then
      raise exception 'Bu öğrenci numarası veya e-posta ile zaten başvuru yapılmış.';
    end if;
  end if;

  if new.durum = 'kesinlesti' and (tg_op = 'INSERT' or old.durum is distinct from 'kesinlesti') then
    if a.kontenjan is not null and kesin >= a.kontenjan then
      raise exception 'Kontenjan dolu (% / %). Yeni kesinleştirme yapılamaz.', kesin, a.kontenjan;
    end if;
  end if;

  return new;
end $$;

drop trigger if exists misir_basvuru_kontrol on public.misir_turu_basvurulari;
create trigger misir_basvuru_kontrol before insert or update on public.misir_turu_basvurulari
  for each row execute function public.misir_basvuru_kontrol();
