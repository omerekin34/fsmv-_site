import { Mail } from 'lucide-react'
import { LinkedinIcon } from './SocialIcons.jsx'
import Reveal from './Reveal.jsx'

const initials = name => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

export default function TeamCard({ p, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="team-card glass-card">
        {p.img
          ? <img src={p.img} alt={p.name} loading="lazy" />
          : <div className="team-avatar-fallback">{initials(p.name)}</div>}
        <h3>{p.name}</h3>
        <div className="team-role">{p.role}</div>
        <div className="team-socials">
          {p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon size={15} /></a>}
          {p.mail && <a href={p.mail} aria-label="E-posta"><Mail /></a>}
        </div>
      </div>
    </Reveal>
  )
}
