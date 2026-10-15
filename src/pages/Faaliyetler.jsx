import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, MapPin, Users, ArrowRight, X } from 'lucide-react'
import { pageMotion } from '../motion.js'
import { activities, categories, months, years } from '../data/activities.js'
import Select from '../components/Select.jsx'

const trLower = s => s.toLocaleLowerCase('tr')

function FilterSelects({ y, m, s, setParam }) {
  return (
    <>
      <Select
        ariaLabel="Yıl" value={y} onChange={e => setParam('y', e.target.value)}
        options={[{ value: '', label: 'Yıl: Tümü' }, ...years.map(yy => ({ value: yy, label: String(yy) }))]}
      />
      <Select
        ariaLabel="Ay" value={m} onChange={e => setParam('m', e.target.value)}
        options={[{ value: '', label: 'Ay: Tümü' }, ...months.map((mm, i) => ({ value: i + 1, label: mm }))]}
      />
      <Select
        ariaLabel="Sıralama" value={s} onChange={e => setParam('s', e.target.value)}
        options={[{ value: 'new', label: 'Yeniden eskiye' }, { value: 'old', label: 'Eskiden yeniye' }]}
      />
    </>
  )
}

export default function Faaliyetler() {
  const [params, setParams] = useSearchParams()
  const [panelOpen, setPanelOpen] = useState(false)

  const k = params.get('k') || 'Tümü'
  const y = params.get('y') || ''
  const m = params.get('m') || ''
  const q = params.get('q') || ''
  const s = params.get('s') || 'new'

  const setParam = (key, val) => {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      if (val && !(key === 'k' && val === 'Tümü') && !(key === 's' && val === 'new')) next.set(key, val)
      else next.delete(key)
      return next
    }, { replace: true })
  }

  const list = useMemo(() => {
    const needle = trLower(q.trim())
    const filtered = activities.filter(a => {
      if (k !== 'Tümü' && a.category !== k) return false
      if (y && a.dateISO.slice(0, 4) !== y) return false
      if (m && a.dateISO.slice(5, 7) !== String(m).padStart(2, '0')) return false
      if (needle && !trLower(`${a.title} ${a.desc} ${a.location}`).includes(needle)) return false
      return true
    })
    return [...filtered].sort((a, b) => s === 'old' ? a.dateISO.localeCompare(b.dateISO) : b.dateISO.localeCompare(a.dateISO))
  }, [k, y, m, q, s])

  const active = k !== 'Tümü' || y || m || q || s !== 'new'
  const clear = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <motion.main className="page" {...pageMotion}>
      <div className="container page-head">
        <span className="script">Etkinliklerimiz</span>
        <h1>Faaliyetler</h1>
        <p>Seminerlerden kurgusal duruşmalara, teknik gezilerden zirvelere tüm faaliyetlerimiz.</p>
      </div>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="fa-toolbar glass-card">
            <div className="fa-toolbar-row">
              <div className="fa-search">
                <Search size={17} />
                <input
                  type="text" placeholder="Faaliyet, konu veya yer ara..." value={q}
                  onChange={e => setParam('q', e.target.value)}
                />
              </div>
              <button className="fa-filter-toggle" onClick={() => setPanelOpen(o => !o)} aria-expanded={panelOpen}>
                <SlidersHorizontal size={16} /> Filtrele
              </button>
              <div className="fa-selects fa-selects-desktop">
                <FilterSelects y={y} m={m} s={s} setParam={setParam} />
              </div>
            </div>
            <AnimatePresence initial={false}>
              {panelOpen && (
                <motion.div
                  className="fa-selects-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="fa-selects">
                    <FilterSelects y={y} m={m} s={s} setParam={setParam} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="filter-chips">
              {categories.map(c => (
                <button key={c} className={`chip ${k === c ? 'active' : ''}`} onClick={() => setParam('k', c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="fa-result">
            <span>{list.length} faaliyet bulundu</span>
            {active && (
              <button className="fa-clear" onClick={clear}><X size={14} /> Filtreleri temizle</button>
            )}
          </div>

          {list.length === 0 ? (
            <div className="glass-card fa-empty">
              <p>Bu kriterlere uygun faaliyet bulunamadı.</p>
              <button className="btn btn-outline" onClick={clear}><span>Filtreleri Temizle</span></button>
            </div>
          ) : (
            <motion.div className="cards-grid" layout>
              <AnimatePresence mode="popLayout">
                {list.map(a => (
                  <motion.article
                    key={a.id} layout
                    className="glass-card card-hover"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link to={`/faaliyetler/${a.slug}`} className="card-img"><img src={a.img} alt={a.title} loading="lazy" /></Link>
                    <div className="card-body">
                      <span className="card-tag">{a.category}</span>
                      <div className="card-date">{a.date}</div>
                      <h3><Link to={`/faaliyetler/${a.slug}`}>{a.title}</Link></h3>
                      <p>{a.desc}</p>
                      <div className="card-meta">
                        <span><MapPin size={14} /> {a.location}</span>
                        <span><Users size={14} /> {a.participants} katılımcı</span>
                      </div>
                      <Link to={`/faaliyetler/${a.slug}`} className="card-link">Detay <ArrowRight size={14} /></Link>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </motion.main>
  )
}
