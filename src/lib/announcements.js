import { supabase } from './supabase.js'

const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const monthsLong = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

export function dateParts(iso) {
  const [year, month, day] = iso.split('-')
  return { day, month: months[Number(month) - 1], year }
}

export function formatDate(iso) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-')
  return `${Number(day)} ${monthsLong[Number(month) - 1]} ${year}`
}

export const endOfDay = iso => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 23, 59, 59, 999)
}

export const daysUntil = (iso, now = new Date()) =>
  Math.ceil((endOfDay(iso) - now) / 86400000)

export function getStatus(a, now = new Date()) {
  if (a.isEvent) {
    const limit = a.deadlineISO || a.eventDateISO
    if (endOfDay(a.eventDateISO) < now) return 'past'
    if (endOfDay(limit) < now) return 'closed'
    if (a.isFull) return 'full'
    return 'open'
  }
  if (a.validUntilISO && endOfDay(a.validUntilISO) < now) return 'expired'
  return 'info'
}

export const statusLabel = {
  open: 'Başvurular Açık',
  closed: 'Başvurular Kapandı',
  past: 'Etkinlik Sona Erdi',
  expired: 'Süresi Doldu',
  info: 'Duyuru',
  full: 'Kontenjan Doldu',
}

export const isActive = a => ['open', 'info', 'full'].includes(getStatus(a))

export const mapAnnouncement = (r, k) => ({
  id: r.id,
  slug: r.slug,
  dateISO: r.yayin_tarihi,
  title: r.baslik,
  desc: r.ozet,
  category: r.kategori,
  isEvent: r.tur === 'etkinlik',
  eventDateISO: r.etkinlik_tarihi,
  eventTime: r.saat,
  location: r.yer,
  deadlineISO: r.son_basvuru,
  quota: r.kontenjan,
  approved: k?.onaylanan ?? 0,
  isFull: !!k?.dolu,
  validUntilISO: r.gecerlilik,
  content: r.icerik || [],
  details: r.detaylar || [],
  contact: r.iletisim,
})

export function nextDeadline(list) {
  const open = list.filter(a => getStatus(a) === 'open' && a.deadlineISO)
  if (!open.length) return null
  return open.reduce((min, a) => (a.deadlineISO < min.deadlineISO ? a : min))
}

let cache = null

export function fetchAnnouncements() {
  if (!cache) {
    cache = Promise.all([
      supabase
        .from('duyurular')
        .select('*')
        .eq('yayinda', true)
        .order('yayin_tarihi', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('duyuru_kontenjan').select('*'),
    ])
      .then(([{ data, error }, { data: kont, error: kError }]) => {
        if (error) throw error
        if (kError) throw kError
        const byId = new Map((kont || []).map(k => [k.duyuru_id, k]))
        return (data || []).map(r => mapAnnouncement(r, byId.get(r.id)))
      })
      .catch(e => { cache = null; throw e })
  }
  return cache
}

export function invalidateAnnouncements() {
  cache = null
}
