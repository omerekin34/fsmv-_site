import { motion } from 'framer-motion'
import Reveal from '../components/Reveal.jsx'
import TeamCard from '../components/TeamCard.jsx'
import { pageMotion } from '../motion.js'
import { useTeam } from '../hooks/useTeam.js'

export default function Ekibimiz() {
  const { board, departments, loading } = useTeam()
  return (
    <motion.main className="page" {...pageMotion}>
      <div className="container page-head">
        <span className="script">Kadromuz</span>
        <h1>Ekibimiz</h1>
        <p>Kulübümüzün arkasındaki gönüllü ve özverili ekip ile tanışın.</p>
      </div>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <Reveal><h2 className="section-title">Yönetim Kurulu</h2>
            <p className="section-sub">2025 dönemi yönetim kurulumuz</p></Reveal>
          <div className="team-grid">
            {board.map((p, i) => <TeamCard key={p.id} p={p} delay={i * 0.08} />)}
          </div>
          {!loading && board.length === 0 && <p className="section-sub">Henüz üye eklenmedi.</p>}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 30 }}>
        <div className="container">
          <Reveal><h2 className="section-title">Departman Başkanları</h2>
            <p className="section-sub">Komitelerimize liderlik eden başkanlarımız</p></Reveal>
          <div className="team-grid">
            {departments.map((p, i) => <TeamCard key={p.id} p={p} delay={i * 0.08} />)}
          </div>
          {!loading && departments.length === 0 && <p className="section-sub">Henüz üye eklenmedi.</p>}
        </div>
      </section>
    </motion.main>
  )
}
