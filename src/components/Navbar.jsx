import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Landmark, Menu, UserPlus, X } from 'lucide-react'

const kurumsal = [
  { to: '/hakkimizda', label: 'Hakkımızda' },
  { to: '/ekibimiz', label: 'Ekibimiz' },
  { to: '/iletisim', label: 'İletişim' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const kurumsalActive = kurumsal.some(k => pathname.startsWith(k.to))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-brand">
          <img src="/logo.png" alt="FSMVÜ Hukuk Kulübü" />
          <span>FSMVÜ Hukuk Kulübü</span>
        </Link>

        <ul className="nav-links">
          <li
            className="nav-dropdown"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <span className={`nav-link ${kurumsalActive ? 'active' : ''}`}>
              Kurumsal <ChevronDown size={14} style={{ verticalAlign: '-2px' }} />
            </span>
            <AnimatePresence>
              {open && (
                <motion.div
                  className="dropdown-menu"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {kurumsal.map(k => (
                    <NavLink key={k.to} to={k.to}>{k.label}</NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
          <li><NavLink to="/faaliyetler" className="nav-link">Faaliyetler</NavLink></li>
          <li><NavLink to="/duyurular" className="nav-link">Duyurular</NavLink></li>
          <li>
            <NavLink to="/misir-turu" className="nav-link egypt-pill">
              <Landmark /> Mısır Turu
            </NavLink>
          </li>
        </ul>

        <div className="nav-cta">
          <Link to="/uye-ol" className="btn btn-outline"><UserPlus /><span>Üye Ol</span></Link>
          <button className="hamburger" onClick={() => setMobile(v => !v)} aria-label="Menü">
            {mobile ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.nav
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setMobile(false)}
          >
            <span className="mobile-group-label">KURUMSAL</span>
            {kurumsal.map(k => <NavLink key={k.to} to={k.to}>{k.label}</NavLink>)}
            <span className="mobile-group-label">KEŞFET</span>
            <NavLink to="/faaliyetler">Faaliyetler</NavLink>
            <NavLink to="/duyurular">Duyurular</NavLink>
            <NavLink to="/misir-turu">Mısır Turu</NavLink>
            <NavLink to="/uye-ol" className="mobile-join"><UserPlus size={16} /> Üye Ol</NavLink>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
