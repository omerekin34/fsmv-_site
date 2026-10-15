import { motion } from 'framer-motion'
import { ease } from '../motion.js'

export default function Reveal({ children, delay = 0, y = 30, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
