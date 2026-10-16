import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, CheckCircle2, XCircle, BedDouble, Plane, Compass, Stamp,
  ArrowRight, CalendarDays, CalendarRange, Users, Wallet, MapPin,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import Countdown from '../components/Countdown.jsx'
import { pageMotion } from '../motion.js'
import { useMisirTuru } from '../hooks/useMisirTuru.js'
import { misirStatus, misirStatusLabel, misirTuruFallback, formatDateRange } from '../lib/misirTuru.js'

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

function ApplyCta({ status, className = 'btn btn-gold' }) {
  if (status === 'open') {
    return <Link to="/misir-turu/basvuru" className={className}><span>Tura Başvur</span></Link>
  }
  return <span className="btn btn-outline egypt-btn-disabled">{misirStatusLabel[status]}</span>
}

export default function MisirTuru() {
  const [openDay, setOpenDay] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)
  const { tour } = useMisirTuru()

  const t = tour || misirTuruFallback
  const status = misirStatus(t)
  const kontenjan = t.kontenjan
  const kesinlesen = t.kesinlesen ?? 0
  const kalan = kontenjan ? Math.max(0, kontenjan - kesinlesen) : null
  const pct = kontenjan ? Math.min(100, (kesinlesen / kontenjan) * 100) : 0

  return (
    <motion.main className="egypt-page" {...pageMotion}>
      <section className="egypt-hero">
        <div className="egypt-hero-bg">
          <img src={t.hero_gorsel} alt={t.baslik} />
        </div>
        <div className="egypt-hero-inner">
          <span className="script">{t.hero_ust_baslik}</span>
          <span className={`egypt-status egypt-status-${status}`}>
            <i />{misirStatusLabel[status]}
          </span>
          <h1>{t.baslik}</h1>
          <p>{t.aciklama}</p>
          <div className="egypt-hero-meta">
            <ApplyCta status={status} />
            {kontenjan && (
              <span className="egypt-quota-pill">
                <span>Kontenjan {kesinlesen} / {kontenjan}</span>
                <span className="egypt-quota-bar"><span style={{ width: `${pct}%` }} /></span>
              </span>
            )}
            {t.son_basvuru && status === 'open' && (
              <span className="egypt-deadline">
                <span className="egypt-deadline-label">Son başvuruya</span>
                <Countdown toISO={t.son_basvuru} />
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="section egypt-facts-section">
        <div className="container">
          <div className="egypt-facts">
            {[
              { Icon: CalendarDays, label: 'Süre', value: t.sure_metni },
              { Icon: CalendarRange, label: 'Tarih', value: formatDateRange(t.tur_baslangic, t.tur_bitis) || 'Mayıs 2026' },
              { Icon: Users, label: 'Kontenjan', value: kontenjan ? `${kalan} yer kaldı` : 'Sınırlı', sub: kontenjan ? `${kesinlesen}/${kontenjan} kesinleşti` : null },
              { Icon: Wallet, label: 'Ücret', value: t.ucret || 'Yakında açıklanacak' },
            ].map(({ Icon, label, value, sub }, i) => (
              <Reveal key={label} delay={i * 0.07}>
                <div className="egypt-fact glass-card">
                  <Icon size={24} />
                  <span className="egypt-fact-label">{label}</span>
                  <strong>{value}</strong>
                  {sub && <span className="egypt-fact-sub">{sub}</span>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Tur Öne Çıkanlar</h2>
            <p className="section-sub">Programımızdan öne çıkan deneyimler</p></Reveal>
          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {t.one_cikanlar.map((h, i) => (
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

      <section className="section egypt-route-section">
        <div className="container">
          <Reveal><h2 className="section-title">Rota</h2>
            <p className="section-sub">İstanbul’dan Nil’e uzanan yolculuk</p></Reveal>
          <Reveal>
            <div className="egypt-route">
              {t.rota.map((stop, i) => {
                const end = i === 0 || i === t.rota.length - 1
                const Icon = end ? Plane : MapPin
                return (
                  <div className="egypt-route-stop" key={`${stop}-${i}`}>
                    <span className={`egypt-route-dot${end ? ' end' : ''}`}><Icon size={16} /></span>
                    <span className="egypt-route-name">{stop}</span>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Tur Programı</h2>
            <p className="section-sub">6 günlük detaylı gezi programımız</p></Reveal>
          <div className="accordion">
            {t.program.map((d, i) => (
              <Reveal key={d.day} delay={i * 0.05}>
                <AccordionItem
                  open={openDay === i}
                  onToggle={() => setOpenDay(openDay === i ? null : i)}
                  head={<>
                    <span className={`acc-day${openDay === i ? ' acc-day-open' : ''}`}>{d.day}</span>
                    {d.title}
                    {d.meta && <span className="acc-meta">{d.meta}</span>}
                  </>}
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
            {t.konaklama.map((s, i) => {
              const Icon = stayIcons[i] || Compass
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
          <Reveal><h2 className="section-title">Neler Dahil?</h2>
            <p className="section-sub">Ücrete dahil olan ve olmayan hizmetler</p></Reveal>
          <div className="egypt-incl">
            <Reveal>
              <div className="glass-card egypt-incl-col">
                <h3><CheckCircle2 size={20} /> Dahil</h3>
                <ul>
                  {t.dahil.map(x => (
                    <li key={x}><CheckCircle2 size={17} /><span>{x}</span></li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="glass-card egypt-incl-col">
                <h3><XCircle size={20} /> Dahil Değil</h3>
                <ul>
                  {t.dahil_degil.map(x => (
                    <li key={x}><XCircle size={17} /><span>{x}</span></li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Galeri</h2>
            <p className="section-sub">Rotamızdan kareler</p></Reveal>
          <div className="gallery-grid">
            {t.galeri.map((g, i) => (
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
            {t.sss.map((f, i) => (
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
              {status === 'open' ? (
                <>
                  <span className="script">Yerini ayırt</span>
                  <h2>{t.cta_baslik}</h2>
                  <p>{t.cta_metin}</p>
                  <Link to="/misir-turu/basvuru" className="btn btn-gold"><span>Tura Başvur</span><ArrowRight size={18} /></Link>
                </>
              ) : status === 'full' ? (
                <>
                  <span className="script">Yerini ayırt</span>
                  <h2>Kontenjan doldu</h2>
                  <p>Tüm yerler kesinleşti. İptal olursa duyurular sayfasından ilan edeceğiz.</p>
                  <Link to="/duyurular" className="btn btn-outline"><span>Duyurular</span></Link>
                </>
              ) : (
                <>
                  <span className="script">Yerini ayırt</span>
                  <h2>Başvurular kapandı</h2>
                  <p>Bir sonraki tur için duyuruları takip et.</p>
                  <Link to="/duyurular" className="btn btn-outline"><span>Duyurular</span></Link>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="egypt-sticky">
        <span className="egypt-sticky-info">
          {kontenjan ? `${kesinlesen}/${kontenjan} · ${misirStatusLabel[status]}` : misirStatusLabel[status]}
        </span>
        <ApplyCta status={status} />
      </div>
    </motion.main>
  )
}
