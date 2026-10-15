import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { pageMotion } from '../motion.js'
import EventJoinModal from '../components/EventJoinModal.jsx'
import { useAnnouncements } from '../hooks/useAnnouncements.js'
import { dateParts, formatDate, getStatus, isActive, statusLabel } from '../lib/announcements.js'

const filters = ['Tümü', 'Etkinlikler', 'Duyurular', 'Aktif', 'Geçmiş']

const noticeText = {
  closed: 'Bu etkinliğin başvuru süresi dolmuştur.',
  past: 'Bu etkinlik sona ermiştir.',
  expired: 'Bu duyurunun geçerlilik süresi dolmuştur.',
  full: 'Bu etkinliğin kontenjanı dolmuştur.',
}

export default function Duyurular() {
  const [modal, setModal] = useState(null)
  const [filter, setFilter] = useState('Tümü')
  const { announcements, loading, error } = useAnnouncements()

  const openEvents = useMemo(() => announcements.filter(a => getStatus(a) === 'open'), [announcements])

  const list = useMemo(() => announcements.filter(a => {
    const st = getStatus(a)
    if (filter === 'Etkinlikler') return a.isEvent
    if (filter === 'Duyurular') return !a.isEvent
    if (filter === 'Aktif') return isActive(a)
    if (filter === 'Geçmiş') return st === 'closed' || st === 'past' || st === 'expired'
    return true
  }), [announcements, filter])

  return (
    <motion.main className="page" {...pageMotion}>
      <div className="container page-head">
        <span className="script">Haberler</span>
        <h1>Duyurular</h1>
        <p>Kulübümüzden güncel haberler, etkinlik duyuruları ve başvuru fırsatları.</p>
      </div>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="filter-chips ann-filters">
            {filters.map(f => (
              <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>

          <div className="ann-list">
            {loading ? (
              <div className="glass-card fa-empty"><p>Yükleniyor…</p></div>
            ) : error ? (
              <div className="glass-card fa-empty"><p>Duyurular yüklenemedi. Lütfen daha sonra tekrar deneyin.</p></div>
            ) : list.length === 0 ? (
              <div className="glass-card fa-empty"><p>Bu kriterlere uygun duyuru bulunamadı.</p></div>
            ) : list.map((a, i) => {
              const st = getStatus(a)
              const dp = dateParts(a.dateISO)
              const active = st === 'open' || st === 'info'
              return (
                <Reveal key={a.id} delay={i * 0.07}>
                  <article className={`ann-card glass-card${active ? '' : ' ann-card--inactive'}`}>
                    <div className="ann-date">
                      <span className="day">{dp.day}</span>
                      <span className="month">{dp.month} {dp.year}</span>
                    </div>
                    <div className="ann-body">
                      <h3>
                        <Link to={`/duyurular/${a.slug}`}>{a.title}</Link>
                        <span className={`ann-badge ${a.isEvent ? 'event' : 'info'}`}>
                          {a.isEvent ? 'Etkinlik' : 'Duyuru'}
                        </span>
                        {st !== 'info' && (
                          <span className={`ann-status ann-status--${st}`}>{statusLabel[st]}</span>
                        )}
                      </h3>
                      <p>{a.desc}</p>
                      {a.isEvent && (
                        <div className="ann-meta">
                          <span><CalendarDays size={14} /> {formatDate(a.eventDateISO)}{a.eventTime ? ` · ${a.eventTime}` : ''}</span>
                          {a.location && <span><MapPin size={14} /> {a.location}</span>}
                          {a.quota && <span><Users size={14} /> Kontenjan: {a.approved} / {a.quota}</span>}
                        </div>
                      )}
                      <div className="ann-actions">
                        <Link to={`/duyurular/${a.slug}`} className="card-link">Detay <ArrowRight size={14} /></Link>
                        {st === 'open' && (
                          <button className="btn btn-gold btn-join" onClick={() => setModal(a)}><span>Katıl</span></button>
                        )}
                        {st === 'full' && <span className="btn btn-disabled" style={{ width: 'auto', marginTop: 0, padding: '12px 24px' }}>Kontenjan Doldu</span>}
                      </div>
                      {noticeText[st] && <p className="ann-notice">{noticeText[st]}</p>}
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <EventJoinModal announcement={modal} events={openEvents} onClose={() => setModal(null)} />
    </motion.main>
  )
}
