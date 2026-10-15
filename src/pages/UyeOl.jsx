import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { pageMotion } from '../motion.js'
import Field from '../components/Field.jsx'
import { useFormState, validate } from '../hooks/useForm.js'

const siniflar = ['Hazırlık', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', 'Yüksek Lisans']
const komiteler = ['Akademik', 'Etkinlik', 'Sosyal Medya & Tasarım', 'Sponsorluk', 'Kurgusal Duruşma', 'Halkla İlişkiler']

export default function UyeOl() {
  const [done, setDone] = useState(false)
  const { values, errors, setErrors, onChange } = useFormState({
    ad: '', ogrNo: '', bolum: '', sinif: '', tel: '', email: '', komite: '', motivasyon: '', kvkk: false,
  })

  const submit = e => {
    e.preventDefault()
    const errs = validate(values, {
      ad: { required: true }, ogrNo: { required: true }, bolum: { required: true },
      sinif: { required: true }, tel: { required: true, phone: true },
      email: { required: true, email: true }, komite: { required: true }, kvkk: { required: true },
    })
    if (Object.keys(errs).length) return setErrors(errs)
    setTimeout(() => setDone(true), 1000)
  }

  return (
    <motion.main className="page" {...pageMotion}>
      <div className="container page-head">
        <span className="script">Aramıza Katıl</span>
        <h1>Üye Ol</h1>
        <p>FSMVÜ Hukuk Kulübü ailesinin bir parçası olmak için başvuru formunu doldurun.</p>
      </div>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <Reveal>
            <div className="form-card glass-card">
              {done ? (
                <div className="success-panel">
                  <CheckCircle2 size={52} />
                  <h3>Başvurunuz Alındı</h3>
                  <p>Üyelik başvurunuz başarıyla kaydedildi. Ekibimiz mülakat süreci için sizinle iletişime geçecektir.</p>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <div className="form-row">
                    <Field label="Ad Soyad" name="ad" value={values.ad} onChange={onChange} error={errors.ad} required />
                    <Field label="Öğrenci Numarası" name="ogrNo" value={values.ogrNo} onChange={onChange} error={errors.ogrNo} required />
                  </div>
                  <div className="form-row">
                    <Field label="Fakülte / Bölüm" name="bolum" value={values.bolum} onChange={onChange} error={errors.bolum} required />
                    <Field label="Sınıf" name="sinif" as="select" options={siniflar} value={values.sinif} onChange={onChange} error={errors.sinif} required />
                  </div>
                  <div className="form-row">
                    <Field label="Telefon" name="tel" value={values.tel} onChange={onChange} error={errors.tel} required />
                    <Field label="E-posta" name="email" type="email" value={values.email} onChange={onChange} error={errors.email} required />
                  </div>
                  <Field label="Komite / Departman" name="komite" as="select" options={komiteler} value={values.komite} onChange={onChange} error={errors.komite} required />
                  <Field label="Kısa Motivasyon Notu" name="motivasyon" as="textarea" value={values.motivasyon} onChange={onChange} error={errors.motivasyon} placeholder="Neden aramıza katılmak istiyorsunuz?" />
                  <label className="checkbox-field">
                    <input type="checkbox" name="kvkk" checked={values.kvkk} onChange={onChange} />
                    <span>KVKK kapsamında kişisel verilerimin kulüp faaliyetleri ve iletişim amacıyla işlenmesini kabul ediyorum. *</span>
                  </label>
                  {errors.kvkk && <span className="field-error" style={{ display: 'block', marginTop: -12, marginBottom: 14 }}>{errors.kvkk}</span>}
                  <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} type="submit"><span>Üyelik Başvurusu Gönder</span></button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </motion.main>
  )
}
