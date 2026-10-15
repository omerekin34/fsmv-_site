-- FSMVÜ Hukuk Kulübü — etkinlik başvuru kontrolü düzeltmesi
-- 004_duyurular.sql'i daha önce çalıştırdıysanız bu dosyayı da çalıştırın.
-- Sorun: tetikleyici ziyaretçi (anon) yetkisiyle çalışınca RLS yüzünden
-- etkinliği göremiyor ("Etkinlik bulunamadı") ve kontenjan sayımı sıfır çıkıyordu.
-- Çözüm: fonksiyon tablo sahibi yetkisiyle (security definer) çalışır.

create or replace function public.etkinlik_basvuru_kontrol()
returns trigger language plpgsql security definer set search_path = public as $$
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
