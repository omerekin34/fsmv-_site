import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scale, ArrowRight, ChevronDown, Target, Compass, CheckCircle2 } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import StatsBar from '../components/StatsBar.jsx'
import TeamCard from '../components/TeamCard.jsx'
import { pageMotion } from '../motion.js'
import { useActivities } from '../hooks/useActivities.js'
import { announcements, dateParts, getStatus, statusLabel } from '../data/announcements.js'
import { mission } from '../data/about.js'
import { useTeam } from '../hooks/useTeam.js'
import { egyptTour } from '../data/egyptTour.js'

function SectionMore({ to, children }) {
  return (
    <Reveal delay={0.2}><div className="section-more">
      <Link to={to} className="btn btn-outline"><span>{children}</span><ArrowRight /></Link>
    </div></Reveal>
  )
}

export default function Home() {
  const { activities } = useActivities()
  const latest = activities.slice(0, 3)
  const news = announcements.slice(0, 3)
  const { board } = useTeam()
  return (
    <motion.main {...pageMotion}>
      <section className="hero">
        <div className="hero-decor" aria-hidden="true">
          <div className="hero-frame" />
        </div>
        <div className="hero-inner">
          <div className="hero-logo-wrap">
            <motion.img
              src="/logo.png" alt="FSMVÜ Hukuk Kulübü" className="hero-logo"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            Adaletin İzinde, Geleceğin Hukukçuları
            <span className="script">Justitia omnibus</span>
          </motion.h1>
          <div className="gold-divider"><Scale size={20} /></div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}>
            Fatih Sultan Mehmet Vakıf Üniversitesi Hukuk Kulübü olarak vizyonumuz; hukuk nosyonunu yerleşik
            kılmak, üyelerimize akademik ve sosyal alanda katkı sağlamak ve hukuk camiasıyla köprüler kurmaktır.
          </motion.p>
          <motion.div className="hero-btns" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.55 }}>
            <Link to="/uye-ol" className="btn btn-gold"><span>Kulübümüze Üye Ol</span><ArrowRight /></Link>
            <Link to="/faaliyetler" className="btn btn-outline"><span>Faaliyetlerimiz</span></Link>
          </motion.div>
          <StatsBar delay={750} />
        </div>
        <motion.button type="button" className="scroll-cue" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.4 }} aria-label="Aşağı kaydır">
          <span>KEŞFET</span><ChevronDown size={16} />
        </motion.button>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Hakkımızda</h2>
            <p className="section-sub">2015'ten bu yana adaletin izinde yürüyen bir öğrenci topluluğu</p></Reveal>
          <div className="mv-grid">
            <Reveal className="stretch"><div className="glass-card mv-card">
              <div className="value-icon"><Target size={26} /></div>
              <h2>Misyonumuz</h2>
              <p>{mission.misyon}</p>
            </div></Reveal>
            <Reveal delay={0.15} className="stretch"><div className="glass-card mv-card">
              <div className="value-icon"><Compass size={26} /></div>
              <h2>Vizyonumuz</h2>
              <p>{mission.vizyon}</p>
            </div></Reveal>
          </div>
          <SectionMore to="/hakkimizda">Hakkımızda Daha Fazlası</SectionMore>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Ekibimiz</h2>
            <p className="section-sub">Kulübümüze yön veren yönetim kurulumuz</p></Reveal>
          <div className="team-grid">
            {board.slice(0, 4).map((p, i) => <TeamCard key={p.id} p={p} delay={i * 0.08} />)}
          </div>
          <SectionMore to="/ekibimiz">Tüm Ekibi Gör</SectionMore>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Son Faaliyetler</h2>
            <p className="section-sub">Kulübümüzün gerçekleştirdiği güncel etkinliklerden bir seçki</p></Reveal>
          <div className="cards-grid">
            {latest.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.12} className="stretch">
                <article className="glass-card card-hover">
                  <Link to={`/faaliyetler/${a.slug}`} className="card-img"><img src={a.img} alt={a.title} loading="lazy" /></Link>
                  <div className="card-body">
                    <span className="card-tag">{a.category}</span>
                    <div className="card-date">{a.date}</div>
                    <h3><Link to={`/faaliyetler/${a.slug}`}>{a.title}</Link></h3>
                    <p>{a.desc}</p>
                    <Link to={`/faaliyetler/${a.slug}`} className="card-link">Detay <ArrowRight size={14} /></Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <SectionMore to="/faaliyetler">Tüm Faaliyetleri Gör</SectionMore>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Güncel Duyurular</h2>
            <p className="section-sub">Kulübümüzden en son haberler ve etkinlik kayıtları</p></Reveal>
          <div className="ann-list">
            {news.map((n, i) => {
              const st = getStatus(n)
              const dp = dateParts(n.dateISO)
              return (
                <Reveal key={n.id} delay={i * 0.1}>
                  <article className="ann-card glass-card">
                    <div className="ann-date"><span className="day">{dp.day}</span><span className="month">{dp.month}</span></div>
                    <div className="ann-body">
                      <h3><Link to={`/duyurular/${n.slug}`}>{n.title}</Link>
                        {st === 'open'
                          ? <span className="ann-badge event">Etkinlik</span>
                          : st !== 'info' && <span className={`ann-status ann-status--${st}`}>{statusLabel[st]}</span>}
                      </h3>
                      <p>{n.desc}</p>
                      <Link to={`/duyurular/${n.slug}`} className="card-link">Detay <ArrowRight size={14} /></Link>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
          <SectionMore to="/duyurular">Tüm Duyuruları Gör</SectionMore>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="egypt-banner">
              <div className="egypt-banner-bg">
                <img src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1400&q=80" alt="Mısır Piramitleri" loading="lazy" />
              </div>
              <div className="egypt-banner-content">
                <h2>Mısır Hukuk & Kültür Turu</h2>
                <p>Giza Piramitleri’nden Kahire Üniversitesi Hukuk Fakültesi’ne uzanan, tarih ve hukuk dolu 6 günlük unutulmaz bir yolculuğa hazır mısınız?</p>
                <ul className="egypt-banner-list">
                  {egyptTour.highlights.slice(0, 3).map(h => <li key={h}><CheckCircle2 size={16} /> {h}</li>)}
                </ul>
                <Link to="/misir-turu" className="btn btn-gold"><span>Tur Detaylarını Gör</span><ArrowRight /></Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </motion.main>
  )
}
