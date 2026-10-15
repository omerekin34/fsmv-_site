import { Mail } from 'lucide-react'
import { LinkedinIcon } from './SocialIcons.jsx'
import Reveal from './Reveal.jsx'

export default function TeamCard({ p, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="team-card glass-card">
        <img src={p.img} alt={p.name} loading="lazy" />
        <h3>{p.name}</h3>
        <div className="team-role">{p.role}</div>
        <div className="team-socials">
          <a href={p.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon size={15} /></a>
          <a href={p.mail} aria-label="E-posta"><Mail /></a>
        </div>
      </div>
    </Reveal>
  )
}
