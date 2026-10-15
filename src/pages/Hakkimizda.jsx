import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Target, Compass } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import StatsBar from '../components/StatsBar.jsx'
import { pageMotion } from '../motion.js'
import { history, values, mission } from '../data/about.js'

function Timeline() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 80, damping: 20 })
  return (
    <div className="timeline" ref={ref}>
      <div className="tl-track" aria-hidden="true"><motion.div className="tl-progress" style={{ scaleY }} /></div>
      {history.map((h, i) => {
        const side = i % 2 === 0 ? 'left' : 'right'
        return (
          <motion.div key={h.year} className={`tl-item ${side}`}
            initial={{ opacity: 0, x: side === 'left' ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <motion.div className="tl-year-badge" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.15 }}>{h.year}</motion.div>
            <div className="tl-card glass-card">
              <h4>{h.title}</h4>
              <p>{h.desc}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function Hakkimizda() {
  return (
    <motion.main className="page" {...pageMotion}>
      <div className="container page-head">
        <span className="script">Biz Kimiz</span>
        <h1>Hakkımızda</h1>
        <p>FSMVÜ Hukuk Kulübü, 2015 yılından bu yana hukuk öğrencilerinin akademik ve sosyal gelişimine katkı sağlayan bir öğrenci topluluğudur.</p>
      </div>

      <section className="section about-stats">
        <div className="container"><StatsBar /></div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Tarihçe</h2></Reveal>
          <Timeline />
        </div>
      </section>

      <section className="section">
        <div className="container">
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
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal><h2 className="section-title">Değerlerimiz</h2>
            <p className="section-sub">Bizi biz yapan ilkeler</p></Reveal>
          <div className="values-grid">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1} className="stretch">
                <div className="value-card glass-card">
                  <div className="value-icon"><v.icon size={26} /></div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </motion.main>
  )
}
