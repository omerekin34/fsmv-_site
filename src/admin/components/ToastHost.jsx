import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { subscribe, remove } from '../toast.js'

const icons = { success: CheckCircle2, error: XCircle, info: Info }

export default function ToastHost() {
  const [toasts, setToasts] = useState([])

  useEffect(() => subscribe(setToasts), [])

  return (
    <div className="adm-toasts">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = icons[t.type] || Info
          return (
            <motion.div
              key={t.id}
              className={`adm-toast adm-toast-${t.type}`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.25 }}
            >
              <Icon size={17} />
              <span className="adm-toast-msg">{t.msg}</span>
              <button className="adm-toast-close" onClick={() => remove(t.id)} aria-label="Kapat"><X size={14} /></button>
              <span className="adm-toast-bar" />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
