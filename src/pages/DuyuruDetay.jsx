import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Ban, CalendarDays, CheckCircle2, Clock,
  MapPin, Share2, Users,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { pageMotion } from '../motion.js'
import EventJoinModal from '../components/EventJoinModal.jsx'
import NotFound from './NotFound.jsx'
import { useAnnouncements } from '../hooks/useAnnouncements.js'
import { dateParts, daysUntil, formatDate, getStatus, statusLabel } from '../lib/announcements.js'

const initials = name => name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr')

export default function DuyuruDetay() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [join, setJoin] = useState(null)
  const { announcements, loading } = useAnnouncements()
  const [autoOpened, setAutoOpened] = useState(false)

  const a = useMemo(() => announcements.find(x => x.slug === slug), [announcements, slug])
  const st = a ? getStatus(a) : null
  const openEvents = useMemo(() => announcements.filter(x => getStatus(x) === 'open'), [announcements])

  if (!autoOpened && !loading && a) {
    setAutoOpened(true)
    if (params.get('katil') === '1' && st === 'open') setJoin(a)
  }

  if (loading) {
    return (
      <motion.main className="page" {...pageMotion}>
        <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--ink-dim)' }}>Yükleniyor…</div>
      </motion.main>
    )
  }
  if (!a) return <NotFound />

  const daysLeft = a.deadlineISO ? daysUntil(a.deadlineISO) : null
  const active = st === 'open' || st === 'info'

  const idx = announcements.findIndex(x => x.slug === slug)
  const prev = announcements[idx - 1]
  const next = announcements[idx + 1]

  let others = announcements.filter(x => x.slug !== slug && x.category === a.category).slice(0, 3)
  if (others.length < 3) {
    others = [...others, ...announcements.filter(x => x.slug !== slug && x.category !== a.category)].slice(0, 3)
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: a.title, url }) } catch { /* kullanıcı vazgeçti */ }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch { /* pano erişimi yok */ }
    }
  }

  return (
    <motion.main className="page fa-detail" {...pageMotion}>
      <section className="dd-hero">
        <div className="dd-hero-overlay" />
        <div className="container fad-hero-content">
          <Link to="/duyurular" className="fad-back"><ArrowLeft size={16} /> Tüm Duyurular</Link>
          <div className="fad-tags">
            <span className="card-tag">{a.category}</span>
            <span className={`ann-badge ${a.isEvent ? 'event' : 'info'}`}>
              {a.isEvent ? 'Etkinlik' : 'Duyuru'}
            </span>
            {st !== 'info' && <span className={`ann-status ann-status--${st}`}>{statusLabel[st]}</span>}
          </div>
          <h1>{a.title}</h1>
          <div className="fad-meta">
            <span><CalendarDays size={16} /> Yayın: {formatDate(a.dateISO)}</span>
            {a.isEvent && <span><CalendarDays size={16} /> {formatDate(a.eventDateISO)}</span>}
            {a.isEvent && a.eventTime && <span><Clock size={16} /> {a.eventTime}</span>}
            {a.isEvent && a.location && <span><MapPin size={16} /> {a.location}</span>}
            {a.isEvent && a.deadlineISO && <span><Clock size={16} /> Son başvuru: {formatDate(a.deadlineISO)}</span>}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 50 }}>
        <div className="container">
          {!active && (
            <div className="dd-notice">
              {st === 'past' ? <Ban size={18} /> : <Clock size={18} />}
              <span>
                {st === 'closed' && `Bu etkinliğin başvuru süresi ${formatDate(a.deadlineISO)} tarihinde sona ermiştir.`}
                {st === 'past' && `Bu etkinlik ${formatDate(a.eventDateISO)} tarihinde gerçekleşmiştir.`}
                {st === 'expired' && 'Bu duyurunun geçerlilik süresi dolmuştur.'}
                {st === 'full' && 'Bu etkinliğin kontenjanı dolmuştur.'}
              </span>
            </div>
          )}
          <div className="fad-grid">
            <div className="fad-content">
              <Reveal>
                <h2 className="fad-h">Duyuru Hakkında</h2>
                {a.content.map((p, i) => <p key={i} className="fad-p">{p}</p>)}
              </Reveal>

              {a.details && a.details.length > 0 && (
                <Reveal>
                  <h2 className="fad-h">Detaylar</h2>
                  <ul className="fad-gains">
                    {a.details.map((d, i) => (
                      <li key={i}><CheckCircle2 size={20} /> <span>{d}</span></li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {a.speakers.length > 0 && (
                <Reveal>
                  <h2 className="fad-h">Konuşmacılar</h2>
                  <div className="fad-speakers">
                    {a.speakers.map((s, i) => (
                      <div key={i} className="glass-card fad-speaker">
                        {s.photo
                          ? <img className="fad-avatar fad-avatar-img" src={s.photo} alt={s.name} loading="lazy" />
                          : <div className="fad-avatar">{initials(s.name)}</div>}
                        <div>
                          <strong>{s.name}</strong>
                          {s.title && <span>{s.title}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>

            <aside className="fad-side">
              <div className="glass-card fad-info">
                <h3>Duyuru Bilgileri</h3>
                <div className="fad-info-row"><span>Tür</span><strong>{a.isEvent ? 'Etkinlik' : 'Duyuru'}</strong></div>
                <div className="fad-info-row"><span>Kategori</span><strong>{a.category}</strong></div>
                <div className="fad-info-row"><span>Yayın Tarihi</span><strong>{formatDate(a.dateISO)}</strong></div>
                {a.isEvent && (
                  <>
                    <div className="fad-info-row"><span>Etkinlik Tarihi</span><strong>{formatDate(a.eventDateISO)}</strong></div>
                    {a.eventTime && <div className="fad-info-row"><span>Saat</span><strong>{a.eventTime}</strong></div>}
                    {a.location && <div className="fad-info-row"><span>Yer</span><strong>{a.location}</strong></div>}
                    {a.deadlineISO && <div className="fad-info-row"><span>Son Başvuru</span><strong>{formatDate(a.deadlineISO)}</strong></div>}
                    {a.quota && (
                      <>
                        <div className="fad-info-row"><span>Kontenjan</span><strong>{a.approved} / {a.quota} kişi</strong></div>
                        <div className="ann-quota-bar">
                          <div className="ann-quota-fill" style={{ width: `${Math.min(100, (a.approved / a.quota) * 100)}%` }} />
                        </div>
                      </>
                    )}
                  </>
                )}
                <div className="fad-info-row"><span>Durum</span><strong>{statusLabel[st]}</strong></div>

                {st === 'open' && (
                  <>
                    <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 22 }} onClick={() => setJoin(a)}>
                      <span>Etkinliğe Katıl</span>
                    </button>
                    {a.deadlineISO && (
                      <p className="dd-deadline">Son başvuru: {formatDate(a.deadlineISO)}{daysLeft !== null && daysLeft > 0 ? ` · ${daysLeft} gün kaldı` : ''}</p>
                    )}
                  </>
                )}
                {(st === 'closed' || st === 'past' || st === 'full') && (
                  <span className="btn btn-disabled">{statusLabel[st]}</span>
                )}
                {!a.isEvent && (
                  <Link to="/iletisim" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                    <span>Bilgi Al</span>
                  </Link>
                )}
                <button className="btn btn-outline fad-share" onClick={share}>
                  <Share2 size={15} /> <span>{copied ? 'Bağlantı kopyalandı' : 'Duyuruyu Paylaş'}</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <Reveal><h2 className="section-title" style={{ textAlign: 'left' }}>Diğer Duyurular</h2></Reveal>
          <div className="ann-list">
            {others.map((x, i) => {
              const xs = getStatus(x)
              const dp = dateParts(x.dateISO)
              return (
                <Reveal key={x.id} delay={i * 0.08}>
                  <article className={`ann-card glass-card${xs === 'open' || xs === 'info' ? '' : ' ann-card--inactive'}`}>
                    <div className="ann-date">
                      <span className="day">{dp.day}</span>
                      <span className="month">{dp.month} {dp.year}</span>
                    </div>
                    <div className="ann-body">
                      <h3>
                        <Link to={`/duyurular/${x.slug}`}>{x.title}</Link>
                        <span className={`ann-badge ${x.isEvent ? 'event' : 'info'}`}>
                          {x.isEvent ? 'Etkinlik' : 'Duyuru'}
                        </span>
                      </h3>
                      <p>{x.desc}</p>
                      {x.isEvent && x.quota && (
                        <div className="ann-meta">
                          <span><Users size={14} /> Kontenjan: {x.approved} / {x.quota}</span>
                        </div>
                      )}
                      <Link to={`/duyurular/${x.slug}`} className="card-link">Detay <ArrowRight size={14} /></Link>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>

          <div className="fad-nav">
            {prev ? (
              <Link to={`/duyurular/${prev.slug}`} className="glass-card fad-nav-item">
                <ArrowLeft size={16} />
                <span><em>Önceki</em>{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`/duyurular/${next.slug}`} className="glass-card fad-nav-item next">
                <span><em>Sonraki</em>{next.title}</span>
                <ArrowRight size={16} />
              </Link>
            ) : <span />}
          </div>
        </div>
      </section>

      <EventJoinModal announcement={join} events={openEvents} onClose={() => setJoin(null)} />
    </motion.main>
  )
}
