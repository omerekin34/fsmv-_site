import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Plane, CalendarCheck, CalendarDays, Mail, LogOut, Menu, X, ExternalLink, UserCog } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useSession } from './useSession.js'
import '../styles/admin.css'

const navItems = [
  { to: '/yonetim', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/yonetim/uyeler', label: 'Üyeler', icon: Users },
  { to: '/yonetim/misir-turu', label: 'Mısır Turu', icon: Plane },
  { to: '/yonetim/etkinlikler', label: 'Etkinlikler', icon: CalendarCheck },
  { to: '/yonetim/faaliyetler', label: 'Faaliyetler', icon: CalendarDays },
  { to: '/yonetim/ekip', label: 'Ekip', icon: UserCog },
  { to: '/yonetim/mesajlar', label: 'Mesajlar', icon: Mail },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { session } = useSession()

  const current = navItems.find(i => (i.end ? pathname === i.to : pathname.startsWith(i.to)))
  const title = current?.label || 'Panel'

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/yonetim/giris')
  }

  return (
    <div className="adm-shell">
      <button className="adm-burger" onClick={() => setOpen(true)} aria-label="Menüyü aç"><Menu size={22} /></button>
      {open && <div className="adm-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`adm-sidebar${open ? ' open' : ''}`}>
        <div className="adm-brand">
          <span className="adm-brand-title">FSMVÜ Hukuk</span>
          <span className="adm-brand-sub">Yönetim</span>
          <button className="adm-close" onClick={() => setOpen(false)} aria-label="Menüyü kapat"><X size={20} /></button>
        </div>
        <nav className="adm-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `adm-nav-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="adm-user">
          <span className="adm-user-email">{session?.user?.email}</span>
          <button className="adm-signout" onClick={signOut}><LogOut size={16} /><span>Çıkış</span></button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <h1>{title}</h1>
          <Link to="/" className="adm-site-link"><ExternalLink size={15} /><span>Siteye dön</span></Link>
        </header>
        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
