import { supabase } from './supabase.js'

export const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

export const formatDate = iso => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`
}

export const mapActivity = r => ({
  id: r.id,
  slug: r.slug,
  category: r.kategori,
  date: formatDate(r.tarih),
  dateISO: r.tarih,
  title: r.baslik,
  desc: r.ozet,
  img: r.kapak_url,
  time: r.saat,
  location: r.yer,
  participants: r.katilimci,
  summary: r.icerik || [],
  program: r.program || [],
  gains: r.kazanimlar || [],
  speakers: (r.konusmacilar || []).map(s => ({ name: s.ad, title: s.unvan })),
  gallery: r.galeri || [],
})

let cache = null

export function fetchActivities() {
  if (!cache) {
    cache = supabase
      .from('faaliyetler')
      .select('*')
      .eq('yayinda', true)
      .order('tarih', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        return (data || []).map(mapActivity)
      })
      .catch(e => { cache = null; throw e })
  }
  return cache
}

let catCache = null

export function fetchCategories() {
  if (!catCache) {
    catCache = supabase
      .from('faaliyet_kategorileri')
      .select('ad')
      .order('sira', { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error
        return (data || []).map(r => r.ad)
      })
      .catch(e => { catCache = null; throw e })
  }
  return catCache
}

export function invalidateActivities() {
  cache = null
  catCache = null
}
