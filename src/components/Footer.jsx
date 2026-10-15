import { Link } from 'react-router-dom'
import { MapPin, Mail, MessageCircle, ArrowUp, UserPlus } from 'lucide-react'
import { InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from './SocialIcons.jsx'
import { site } from '../data/site.js'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/logo.png" alt="Logo" />
          <h3>FSMVÜ Hukuk Kulübü</h3>
          <p>Adaletin izinde, geleceğin hukukçularını yetiştiren öğrenci topluluğuyuz. Seminerler, kurgusal duruşmalar ve teknik gezilerle hukuk eğitimini destekliyoruz.</p>
          <div className="footer-cta">
            <Link to="/uye-ol" className="btn btn-gold"><UserPlus /><span>Üye Ol</span></Link>
            <Link to="/misir-turu/basvuru" className="btn btn-outline"><span>Mısır Turu Başvuru</span></Link>
          </div>
        </div>
        <div>
          <h4>Hızlı Erişim</h4>
          <ul className="footer-links">
            <li><Link to="/">Ana Sayfa</Link></li>
            <li><Link to="/hakkimizda">Hakkımızda</Link></li>
            <li><Link to="/ekibimiz">Ekibimiz</Link></li>
            <li><Link to="/faaliyetler">Faaliyetler</Link></li>
            <li><Link to="/duyurular">Duyurular</Link></li>
          </ul>
        </div>
        <div>
          <h4>Katılım</h4>
          <ul className="footer-links">
            <li><Link to="/uye-ol">Üye Ol</Link></li>
            <li><Link to="/misir-turu">Mısır Turu</Link></li>
            <li><Link to="/misir-turu/basvuru">Mısır Turu Başvurusu</Link></li>
            <li><Link to="/iletisim">İletişim</Link></li>
          </ul>
        </div>
        <div>
          <h4>İletişim</h4>
          <div className="footer-contact">
            <div><MapPin /><span>{site.address}</span></div>
            <div><Mail /><a href={`mailto:${site.email}`}>{site.email}</a></div>
            <div><MessageCircle /><a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp Destek Hattı</a></div>
          </div>
          <div className="footer-socials">
            <a href={site.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={17} /></a>
            <a href={site.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon size={17} /></a>
            <a href={site.socials.x} target="_blank" rel="noreferrer" aria-label="X"><XIcon size={15} /></a>
            <a href={site.socials.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><YoutubeIcon size={18} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© {year} FSMVÜ Hukuk Kulübü. Tüm hakları saklıdır.</span>
        <div className="footer-bottom-right">
          <Link to="/iletisim">İletişim</Link>
          <Link to="/duyurular">Duyurular</Link>
          <button type="button" className="footer-top-btn" aria-label="Yukarı Çık" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp /></button>
        </div>
      </div>
      <div className="footer-watermark" aria-hidden="true">
        <span>HUKUK KULÜBÜ</span>
      </div>
    </footer>
  )
}
