import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { stats } from '../data/stats.js'

function useCountUp(target, started, duration = 2000) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!started) return
    let raf, t0
    const step = t => {
      if (!t0) t0 = t
      const p = Math.min((t - t0) / duration, 1)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [started, target, duration])
  return n
}

function HeroStat({ value, suffix, label, started }) {
  const n = useCountUp(value, started, 2200)
  return (
    <div className="hero-stat">
      <div className="stat-num">{n}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function StatsBar({ delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [started, setStarted] = useState(false)
  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(t)
  }, [inView, delay])
  return (
    <motion.div ref={ref} className={`hero-stats ${className}`.trim()} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}>
      {stats.map(s => <HeroStat key={s.id} {...s} started={started} />)}
    </motion.div>
  )
}
