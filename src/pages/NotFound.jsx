import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageMotion } from '../motion.js'

export default function NotFound() {
  return (
    <motion.main className="notfound" {...pageMotion}>
      <h1>404</h1>
      <span className="script">Kaybolmuş bir sayfa</span>
      <p>Aradığınız sayfa bulunamadı veya taşınmış olabilir.</p>
      <Link to="/" className="btn btn-gold"><span>Ana Sayfaya Dön</span></Link>
    </motion.main>
  )
}
