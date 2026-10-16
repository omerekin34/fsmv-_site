import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Plane, CalendarCheck, CalendarDays, Megaphone, Mail, UserCog } from 'lucide-react'
import { countRows, fetchRows } from '../api.js'
import { fmtDate } from '../format.js'

const tables = [
  { table: 'uyeler', label: 'Üye Başvuruları', icon: Users, to: '/yonetim/uyeler', sub: { label: 'beklemede', filters: { durum: 'beklemede' } } },
  { table: 'misir_turu_basvurulari', label: 'Mısır Turu Başvuruları', icon: Plane, to: '/yonetim/misir-basvurulari', sub: { label: 'kesinleşti', filters: { durum: 'kesinlesti' } } },
  { table: 'etkinlik_basvurulari', label: 'Etkinlik Başvuruları', icon: CalendarCheck, to: '/yonetim/etkinlikler' },
  { table: 'iletisim_mesajlari', label: 'Mesajlar', icon: Mail, to: '/yonetim/mesajlar', sub: { label: 'okunmadı', filters: { okundu: false } } },
  { table: 'ekip_uyeleri', label: 'Ekip Üyeleri', icon: UserCog, to: '/yonetim/ekip', sub: { label: 'aktif', filters: { aktif: true } } },
  { table: 'faaliyetler', label: 'Faaliyetler', icon: CalendarDays, to: '/yonetim/faaliyetler', sub: { label: 'yayında', filters: { yayinda: true } } },
  { table: 'duyurular', label: 'Duyurular', icon: Megaphone, to: '/yonetim/duyurular', sub: { label: 'yayında', filters: { yayinda: true } } },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([
      ...tables.map(t => countRows(t.table)),
      ...tables.map(t => (t.sub ? countRows(t.table, t.sub.filters) : Promise.resolve(null))),
      fetchRows('uyeler'),
      fetchRows('misir_turu_basvurulari'),
    ])
      .then(res => {
        if (!alive) return
        const n = tables.length
        const counts = res.slice(0, n)
        const subs = res.slice(n, n * 2)
        setStats(tables.map((t, i) => ({ ...t, count: counts[i], subCount: subs[i] })))
        const merged = [...res[n * 2].map(r => ({ ...r, _type: 'Üye' })), ...res[n * 2 + 1].map(r => ({ ...r, _type: 'Mısır Turu' }))]
        merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setRecent(merged.slice(0, 5))
      })
      .catch(e => { if (alive) setError(e.message || 'Veriler alınamadı.') })
    return () => { alive = false }
  }, [])

  if (error) return <div className="adm-state adm-glass adm-error-state">{error}</div>
  if (!stats) return <div className="adm-state adm-glass"><div className="adm-spinner" /><span>Yükleniyor…</span></div>

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="adm-stats">
        {stats.map(({ label, icon: Icon, to, count, sub, subCount }) => (
          <Link to={to} className="adm-stat adm-glass" key={label}>
            <Icon size={22} className="adm-stat-icon" />
            <div>
              <span className="adm-stat-label">{label}</span>
              <span className="adm-stat-count">{count}</span>
              {sub && <span className="adm-stat-sub">{subCount} {sub.label}</span>}
            </div>
          </Link>
        ))}
      </div>

      <div className="adm-glass adm-recent">
        <h2>Son Başvurular</h2>
        {recent.length === 0 ? (
          <p className="adm-dim">Henüz kayıt yok.</p>
        ) : (
          <ul className="adm-recent-list">
            {recent.map(r => (
              <li key={r.id}>
                <span className="adm-badge adm-badge-tur">{r._type}</span>
                <span className="adm-recent-name">{r.ad_soyad}</span>
                <span className="adm-dim">{r.email}</span>
                <span className="adm-dim adm-recent-date">{fmtDate(r.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  )
}
