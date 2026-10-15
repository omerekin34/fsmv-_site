import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle2, BedDouble, Plane, Compass, Stamp, ArrowRight } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { pageMotion } from '../motion.js'
import { egyptTour } from '../data/egyptTour.js'

const stayIcons = [BedDouble, Plane, Compass, Stamp]

function AccordionItem({ head, children, open, onToggle }) {
  return (
    <div className="accordion-item glass-card">
      <button className="accordion-head" onClick={onToggle}>
        <span>{head}</span>
        <ChevronDown className={open ? 'open' : ''} size={20} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="accordion-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MisirTuru() {
  const [openDay, setOpenDay] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <motion.main className="egypt-page" {...pageMotion}>
      <section className="egypt-hero">
        <div className="egypt-hero-bg">
          <img src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1600&q=80" alt="Giza Piramitleri" />
        </div>
        <div className="egypt-hero-inner">
          <span className="script">Kadim uygarlığa yolculuk</span>
          <h1>Mısır Hukuk & Kültür Turu</h1>
          <p>Piramitlerin gölgesinde tarih, Kahire Üniversitesi’nde hukuk. 6 günlük unutulmaz akademik ve kültürel bir deneyim sizi bekliyor.</p>
          <Link to="/misir-turu/basvuru" className="btn btn-gold"><span>Tura Başvur</span></Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Tur Öne Çıkanlar</h2>
            <p className="section-sub">Programımızdan öne çıkan deneyimler</p></Reveal>
          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {egyptTour.highlights.map((h, i) => (
              <Reveal key={h} delay={i * 0.07}>
                <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <CheckCircle2 size={20} style={{ color: 'var(--gold)', flex: 'none' }} />
                  <span style={{ fontSize: '0.92rem' }}>{h}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Tur Programı</h2>
            <p className="section-sub">6 günlük detaylı gezi programımız</p></Reveal>
          <div className="accordion">
            {egyptTour.program.map((d, i) => (
              <Reveal key={d.day} delay={i * 0.05}>
                <AccordionItem
                  open={openDay === i}
                  onToggle={() => setOpenDay(openDay === i ? null : i)}
                  head={<><span className="acc-day">{d.day}</span>{d.title}</>}
                >
                  {d.desc}
                </AccordionItem>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Konaklama & Ulaşım</h2>
            <p className="section-sub">Seyahatiniz boyunca size eşlik edecek ayrıntılar</p></Reveal>
          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {egyptTour.stay.map((s, i) => {
              const Icon = stayIcons[i]
              return (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className="value-card glass-card">
                    <div className="value-icon"><Icon size={26} /></div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Galeri</h2>
            <p className="section-sub">Rotamızdan kareler</p></Reveal>
          <div className="gallery-grid">
            {egyptTour.gallery.map((g, i) => (
              <Reveal key={g} delay={i * 0.05}>
                <img src={g} alt={`Mısır ${i + 1}`} loading="lazy" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Sık Sorulan Sorular</h2></Reveal>
          <div className="accordion">
            {egyptTour.faq.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <AccordionItem open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} head={f.q}>
                  {f.a}
                </AccordionItem>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="glass-card egypt-cta">
              <span className="script">Yerini ayırt</span>
              <h2>Kontenjan sınırlı, Mısır seni bekliyor</h2>
              <p>Başvuru yaklaşık 2 dakika sürer; soruları tek tek yanıtlayarak ön kaydını oluştur.</p>
              <Link to="/misir-turu/basvuru" className="btn btn-gold"><span>Tura Başvur</span><ArrowRight size={18} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </motion.main>
  )
}
