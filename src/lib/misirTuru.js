import { supabase } from './supabase.js'
import { endOfDay, formatDate, monthsLong } from './announcements.js'
import { egyptTour } from '../data/egyptTour.js'

export const misirTuruFallback = {
  kontenjan: null, son_basvuru: null, basvuru_acik: true,
  tur_baslangic: null, tur_bitis: null, sure_metni: '6 Gün / 5 Gece',
  hero_ust_baslik: 'Kadim uygarlığa yolculuk',
  baslik: 'Mısır Hukuk & Kültür Turu',
  aciklama: 'Piramitlerin gölgesinde tarih, Kahire Üniversitesi’nde hukuk. 6 günlük unutulmaz akademik ve kültürel bir deneyim sizi bekliyor.',
  hero_gorsel: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1600&q=80',
  one_cikanlar: egyptTour.highlights,
  program: egyptTour.program,
  konaklama: egyptTour.stay,
  rota: egyptTour.route,
  dahil: egyptTour.included,
  dahil_degil: egyptTour.excluded,
  galeri: egyptTour.gallery,
  sss: egyptTour.faq,
  cta_baslik: 'Kontenjan sınırlı, Mısır seni bekliyor',
  cta_metin: 'Başvuru yaklaşık 2 dakika sürer; soruları tek tek yanıtlayarak ön kaydını oluştur.',
  ucret: null,
  kesinlesen: 0, bekleyen: 0, iletisimde: 0, iptal: 0, toplam: 0, dolu: false,
}

const isEmpty = v => v == null || v === '' || (Array.isArray(v) && v.length === 0)

export function withDefaults(row) {
  if (!row) return misirTuruFallback
  const out = { ...misirTuruFallback }
  for (const k of Object.keys(misirTuruFallback)) {
    if (!isEmpty(row[k])) out[k] = row[k]
  }
  return out
}

export function formatDateRange(start, end) {
  if (!start) return ''
  if (!end || end === start) return formatDate(start)
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  if (sy === ey && sm === em) return `${sd}–${ed} ${monthsLong[em - 1]} ${ey}`
  if (sy === ey) return `${sd} ${monthsLong[sm - 1]} – ${ed} ${monthsLong[em - 1]} ${ey}`
  return `${formatDate(start)} – ${formatDate(end)}`
}

let cache = null

export function fetchMisirTuru() {
  if (!cache) {
    cache = supabase
      .from('misir_turu_kontenjan')
      .select('*')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error
        return withDefaults(data)
      })
      .catch(e => { cache = null; throw e })
  }
  return cache
}

export function invalidateMisirTuru() {
  cache = null
}

export function misirStatus(t, now = new Date()) {
  if (!t.basvuru_acik) return 'closed'
  if (t.son_basvuru && endOfDay(t.son_basvuru) < now) return 'expired'
  if (t.dolu) return 'full'
  return 'open'
}

export const misirStatusLabel = {
  open: 'Başvurular Açık',
  full: 'Kontenjan Doldu',
  expired: 'Başvurular Kapandı',
  closed: 'Başvurular Kapalı',
}
