import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, CalendarDays, Clock, MapPin, Users,
  CheckCircle2, Share2,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { pageMotion } from '../motion.js'
import { useActivities } from '../hooks/useActivities.js'
import NotFound from './NotFound.jsx'

const initials = name => name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr')

export default function FaaliyetDetay() {
  const { slug } = useParams()
  const { activities, loading } = useActivities()
  const [copied, setCopied] = useState(false)
  if (loading) return <motion.main className="page fa-detail" {...pageMotion} />
  const a = activities.find(x => x.slug === slug)
  if (!a) return <NotFound />

  const idx = activities.findIndex(x => x.slug === slug)
  const prev = activities[idx - 1]
  const next = activities[idx + 1]

  let similar = activities.filter(x => x.slug !== slug && x.category === a.category).slice(0, 3)
  if (similar.length === 0) similar = activities.filter(x => x.slug !== slug).slice(0, 3)

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
      <section className="fad-hero">
        <img src={a.img} alt={a.title} className="fad-hero-img" />
        <div className="fad-hero-overlay" />
        <div className="container fad-hero-content">
          <Link to="/faaliyetler" className="fad-back"><ArrowLeft size={16} /> Tüm Faaliyetler</Link>
          <div className="fad-tags"><span className="card-tag">{a.category}</span></div>
          <h1>{a.title}</h1>
          <div className="fad-meta">
            <span><CalendarDays size={16} /> {a.date}</span>
            <span><Clock size={16} /> {a.time}</span>
            <span><MapPin size={16} /> {a.location}</span>
            <span><Users size={16} /> {a.participants} katılımcı</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 50 }}>
        <div className="container fad-grid">
          <div className="fad-content">
            <Reveal>
              <h2 className="fad-h">Etkinlik Hakkında</h2>
              {a.summary.map((p, i) => <p key={i} className="fad-p">{p}</p>)}
            </Reveal>

            <Reveal>
              <h2 className="fad-h">Neler Yapıldı</h2>
              <ol className="fad-steps">
                {a.program.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </Reveal>

            <Reveal>
              <h2 className="fad-h">Katılımcılara Kazandırdıkları</h2>
              <ul className="fad-gains">
                {a.gains.map((g, i) => (
                  <li key={i}><CheckCircle2 size={20} /> <span>{g}</span></li>
                ))}
              </ul>
            </Reveal>

            {a.speakers.length > 0 && (
              <Reveal>
                <h2 className="fad-h">Konuşmacılar</h2>
                <div className="fad-speakers">
                  {a.speakers.map(s => (
                    <div key={s.name} className="glass-card fad-speaker">
                      <div className="fad-avatar">{initials(s.name)}</div>
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            <Reveal>
              <h2 className="fad-h">Galeri</h2>
              <div className="gallery-grid">
                {a.gallery.map((g, i) => <img key={g} src={g} alt={`${a.title} ${i + 1}`} loading="lazy" />)}
              </div>
            </Reveal>
          </div>

          <aside className="fad-side">
            <div className="glass-card fad-info">
              <h3>Etkinlik Bilgileri</h3>
              <div className="fad-info-row"><span>Kategori</span><strong>{a.category}</strong></div>
              <div className="fad-info-row"><span>Tarih</span><strong>{a.date}</strong></div>
              <div className="fad-info-row"><span>Saat</span><strong>{a.time}</strong></div>
              <div className="fad-info-row"><span>Yer</span><strong>{a.location}</strong></div>
              <div className="fad-info-row"><span>Katılımcı</span><strong>{a.participants} kişi</strong></div>
              <Link to="/uye-ol" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                <span>Üye Ol, Bir Sonrakinde Sen de Ol</span>
              </Link>
              <button className="btn btn-outline fad-share" onClick={share}>
                <Share2 size={15} /> <span>{copied ? 'Bağlantı kopyalandı' : 'Etkinliği Paylaş'}</span>
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <Reveal><h2 className="section-title" style={{ textAlign: 'left' }}>Benzer Faaliyetler</h2></Reveal>
          <div className="cards-grid">
            {similar.map((x, i) => (
              <Reveal key={x.id} delay={i * 0.08}>
                <article className="glass-card card-hover">
                  <Link to={`/faaliyetler/${x.slug}`} className="card-img"><img src={x.img} alt={x.title} loading="lazy" /></Link>
                  <div className="card-body">
                    <span className="card-tag">{x.category}</span>
                    <div className="card-date">{x.date}</div>
                    <h3><Link to={`/faaliyetler/${x.slug}`}>{x.title}</Link></h3>
                    <p>{x.desc}</p>
                    <Link to={`/faaliyetler/${x.slug}`} className="card-link">Detay <ArrowRight size={14} /></Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="fad-nav">
            {prev ? (
              <Link to={`/faaliyetler/${prev.slug}`} className="glass-card fad-nav-item">
                <ArrowLeft size={16} />
                <span><em>Önceki</em>{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`/faaliyetler/${next.slug}`} className="glass-card fad-nav-item next">
                <span><em>Sonraki</em>{next.title}</span>
                <ArrowRight size={16} />
              </Link>
            ) : <span />}
          </div>
        </div>
      </section>
    </motion.main>
  )
}
