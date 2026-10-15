import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Mail, Send, CheckCircle2 } from 'lucide-react'
import { InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from '../components/SocialIcons.jsx'
import Reveal from '../components/Reveal.jsx'
import { pageMotion } from '../motion.js'
import Field from '../components/Field.jsx'
import { useFormState, validate } from '../hooks/useForm.js'
import { supabase } from '../lib/supabase.js'
import { FORM_ERROR } from '../lib/forms.js'
import { site } from '../data/site.js'

export default function Iletisim() {
  const { values, errors, setErrors, onChange } = useFormState({ ad: '', email: '', konu: '', mesaj: '' })
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(false)

  const submit = async e => {
    e.preventDefault()
    const errs = validate(values, {
      ad: { required: true }, email: { required: true, email: true },
      konu: { required: true }, mesaj: { required: true },
    })
    if (Object.keys(errs).length) return setErrors(errs)
    setSending(true)
    const { error } = await supabase.from('iletisim_mesajlari').insert({
      ad_soyad: values.ad,
      email: values.email,
      konu: values.konu,
      mesaj: values.mesaj,
    })
    setSending(false)
    if (error) return setErrors({ form: FORM_ERROR })
    setToast(true)
    setTimeout(() => setToast(false), 3500)
  }

  return (
    <motion.main className="page" {...pageMotion}>
      <div className="container page-head">
        <span className="script">Bize Ulaşın</span>
        <h1>İletişim</h1>
        <p>Sorularınız, iş birliği önerileriniz ve üyelik hakkında bilgi almak için bize yazın.</p>
      </div>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container contact-grid">
          <Reveal>
            <div className="glass-card" style={{ padding: 34 }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 22 }}>Mesaj Gönderin</h2>
              <form onSubmit={submit} noValidate>
                <Field label="Ad Soyad" name="ad" value={values.ad} onChange={onChange} error={errors.ad} required />
                <Field label="E-posta" name="email" type="email" value={values.email} onChange={onChange} error={errors.email} required />
                <Field label="Konu" name="konu" value={values.konu} onChange={onChange} error={errors.konu} required />
                <Field label="Mesaj" name="mesaj" as="textarea" value={values.mesaj} onChange={onChange} error={errors.mesaj} required />
                {errors.form && <p className="field-error" style={{ display: 'block', marginBottom: 14 }}>{errors.form}</p>}
                <button className="btn btn-gold" type="submit" disabled={sending}>
                  <span>{sending ? 'Gönderiliyor...' : 'Gönder'}</span><Send />
                </button>
              </form>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="contact-info">
              <div className="map-frame"><iframe src={site.mapEmbed} title="FSMVÜ Harita" loading="lazy" /></div>
              <div className="glass-card" style={{ padding: 26 }}>
                <div className="contact-info" style={{ gap: 16 }}>
                  <div className="contact-line"><MapPin /><div><strong>Adres</strong><span>{site.address}</span></div></div>
                  <div className="contact-line"><Mail /><div><strong>E-posta</strong><span>{site.email}</span></div></div>
                </div>
                <div className="footer-socials" style={{ marginTop: 20 }}>
                  <a href={site.socials.instagram} target="_blank" rel="noreferrer"><InstagramIcon size={17} /></a>
                  <a href={site.socials.linkedin} target="_blank" rel="noreferrer"><LinkedinIcon size={17} /></a>
                  <a href={site.socials.x} target="_blank" rel="noreferrer"><XIcon size={15} /></a>
                  <a href={site.socials.youtube} target="_blank" rel="noreferrer"><YoutubeIcon size={18} /></a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.6 }}>
            <CheckCircle2 size={17} style={{ verticalAlign: '-3px', marginRight: 8 }} />
            Mesajınız başarıyla gönderildi. En kısa sürede döneceğiz.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  )
}
