import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Modal from './Modal.jsx'
import Field from './Field.jsx'
import { useFormState, validate } from '../hooks/useForm.js'
import { supabase } from '../lib/supabase.js'
import { nullIfEmpty, FORM_ERROR } from '../lib/forms.js'
import { invalidateAnnouncements } from '../lib/announcements.js'

export default function EventJoinModal({ announcement, events = [], onClose }) {
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [lastAnn, setLastAnn] = useState(null)
  const { values, setValues, errors, setErrors, onChange } = useFormState({
    ad: '', ogrNo: '', tel: '', email: '', etkinlik: '', not: '',
  })

  if (announcement !== lastAnn) {
    setLastAnn(announcement)
    setDone(false)
    if (announcement) setValues(v => ({ ...v, etkinlik: announcement.title }))
  }

  const submit = async e => {
    e.preventDefault()
    const errs = validate(values, {
      ad: { required: true }, ogrNo: { required: true },
      tel: { required: true, phone: true }, email: { required: true, email: true },
      etkinlik: { required: true },
    })
    if (Object.keys(errs).length) return setErrors(errs)
    setSending(true)
    const { error } = await supabase.from('etkinlik_basvurulari').insert({
      ad_soyad: values.ad,
      ogrenci_no: values.ogrNo,
      telefon: values.tel,
      email: values.email,
      etkinlik: values.etkinlik,
      duyuru_id: events.find(ev => ev.title === values.etkinlik)?.id ?? null,
      not_metni: nullIfEmpty(values.not),
    })
    setSending(false)
    if (error) {
      const msg = /kontenjan|süresi/i.test(error.message || '') ? error.message : FORM_ERROR
      return setErrors({ form: msg })
    }
    invalidateAnnouncements()
    setDone(true)
  }

  return (
    <Modal open={!!announcement} onClose={onClose}>
      {done ? (
        <div className="success-panel">
          <CheckCircle2 size={52} />
          <h3>Başvurunuz Alındı</h3>
          <p>Etkinlik başvurunuz başarıyla kaydedildi. Detaylar e-posta adresinize iletilecektir.</p>
        </div>
      ) : (
        <>
          <h3>Etkinlik Başvuru Formu</h3>
          <form onSubmit={submit} noValidate>
            <div className="form-row">
              <Field label="Ad Soyad" name="ad" value={values.ad} onChange={onChange} error={errors.ad} required />
              <Field label="Öğrenci No" name="ogrNo" value={values.ogrNo} onChange={onChange} error={errors.ogrNo} required />
            </div>
            <div className="form-row">
              <Field label="Telefon" name="tel" value={values.tel} onChange={onChange} error={errors.tel} required />
              <Field label="E-posta" name="email" type="email" value={values.email} onChange={onChange} error={errors.email} required />
            </div>
            <Field label="Etkinlik Seçimi" name="etkinlik" as="select" options={events.map(ev => ev.title)} value={values.etkinlik} onChange={onChange} error={errors.etkinlik} required />
            <Field label="Not" name="not" as="textarea" value={values.not} onChange={onChange} error={errors.not} />
            {errors.form && <p className="field-error" style={{ display: 'block', marginBottom: 14 }}>{errors.form}</p>}
            <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} type="submit" disabled={sending}><span>{sending ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}</span></button>
          </form>
        </>
      )}
    </Modal>
  )
}
