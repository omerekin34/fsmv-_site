import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, MessageCircle, Send, X } from 'lucide-react'
import { site } from '../data/site.js'

const questions = [
  'Kulübe nasıl üye olabilirim?',
  'Yaklaşan etkinlikler hakkında bilgi almak istiyorum.',
  'Mısır Turu hakkında detaylı bilgi alabilir miyim?',
  'Kurgusal duruşma ve seminerlere nasıl katılabilirim?',
  'Kulüple iş birliği / sponsorluk için iletişime geçmek istiyorum.',
]

const PREFIX = 'Merhaba, FSMVÜ Hukuk Kulübü web sitesinden yazıyorum. '

export default function LiveSupport() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const { pathname } = useLocation()
  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const openWhatsApp = (text) => {
    window.open(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(PREFIX + text)}`, '_blank', 'noopener,noreferrer')
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const text = message.trim()
    if (!text) return
    openWhatsApp(text)
    setMessage('')
  }

  return (
    <>
      <div className="ls-wrap">
        <button type="button" className="ls-label" onClick={() => setOpen(v => !v)}>
          Canlı Destek
        </button>
        <button
          type="button"
          className={`ls-fab ${open ? 'open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label="Canlı Destek"
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <MessageCircle size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ls-panel"
            role="dialog"
            aria-label="Canlı Destek"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ls-head">
              <img src="/logo.png" alt="FSMVÜ Hukuk Kulübü" />
              <div>
                <h3>FSMVÜ Hukuk Kulübü</h3>
                <p><span className="ls-dot" />Canlı Destek · WhatsApp üzerinden</p>
              </div>
            </div>
            <div className="ls-body">
              <div className="ls-bubble">
                Merhaba! 👋 FSMVÜ Hukuk Kulübü'ne hoş geldiniz. Size nasıl yardımcı olabiliriz? Aşağıdaki sorulardan birini seçin ya da kendi mesajınızı yazın.
              </div>
              <p className="ls-q-label">SIK SORULAN SORULAR</p>
              {questions.map(q => (
                <button key={q} type="button" className="ls-q" onClick={() => openWhatsApp(q)}>
                  <span>{q}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
            <div className="ls-foot">
              <form className="ls-input" onSubmit={onSubmit}>
                <input
                  type="text"
                  placeholder="Mesajınızı yazın..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                <button type="submit" className="ls-send" aria-label="Gönder">
                  <Send size={16} />
                </button>
              </form>
              <p className="ls-note">Mesajınız WhatsApp uygulamasında açılacaktır.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
