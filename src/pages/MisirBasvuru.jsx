import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, CornerDownLeft, Lock } from 'lucide-react'
import { pageMotion, ease } from '../motion.js'
import { useFormState, validate } from '../hooks/useForm.js'
import { supabase } from '../lib/supabase.js'
import { nullIfEmpty, FORM_ERROR } from '../lib/forms.js'
import { useMisirTuru } from '../hooks/useMisirTuru.js'
import { misirStatus, misirStatusLabel, invalidateMisirTuru } from '../lib/misirTuru.js'

const steps = [
  {
    key: 'intro', type: 'intro',
    title: "Mısır'a hazır mısın?",
    hint: 'Birkaç kısa soruyla ön kaydını oluşturalım. Yaklaşık 2 dakika sürer, istediğin an geri dönebilirsin.',
  },
  {
    key: 'ad', type: 'text', label: 'Ad Soyad',
    title: 'Önce tanışalım. Adın soyadın nedir?',
    placeholder: 'Ad Soyad',
    rules: { required: true },
  },
  {
    key: 'ogrNo', type: 'text', label: 'Öğrenci No',
    title: 'Öğrenci numaran?',
    hint: 'FSMVÜ öğrenci numaranı yaz.',
    placeholder: 'Örn. 2022XXXXX',
    rules: { required: true },
  },
  {
    key: 'sinif', type: 'choice', label: 'Sınıf',
    title: 'Kaçıncı sınıftasın?',
    options: ['Hazırlık', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', 'Mezun / Diğer'],
    rules: { required: true },
  },
  {
    key: 'tel', type: 'tel', label: 'Telefon',
    title: 'Sana hangi numaradan ulaşalım?',
    placeholder: '05xx xxx xx xx',
    rules: { required: true, phone: true },
  },
  {
    key: 'email', type: 'email', label: 'E-posta',
    title: 'E-posta adresin?',
    hint: 'Bilgilendirmeleri buraya göndereceğiz.',
    placeholder: 'ornek@eposta.com',
    rules: { required: true, email: true },
  },
  {
    key: 'pasaport', type: 'choice', label: 'Pasaport',
    title: 'Pasaport durumun nedir?',
    hint: 'Turdan en az 6 ay geçerli pasaport gerekir; yoksa sorun değil, yönlendiririz.',
    options: ['Geçerli pasaportum var', 'Pasaportum var ama süresi dolmak üzere', 'Pasaportum yok, çıkartacağım'],
    rules: { required: true },
  },
  {
    key: 'yurtdisi', type: 'choice', label: 'Yurt dışı deneyimi',
    title: 'Daha önce yurt dışına çıktın mı?',
    options: ['Evet, birçok kez', 'Bir iki kez', 'İlk kez olacak'],
    rules: { required: true },
  },
  {
    key: 'heyecan', type: 'multi', label: 'Heyecanlandıran',
    title: 'Seni en çok ne heyecanlandırıyor?',
    hint: 'Birden fazla seçebilirsin.',
    options: ['Piramitler & Sfenks', 'Kahire Üniversitesi hukuk oturumları', "Nil'de tekne gezisi", 'Mısır Müzesi', 'Han el-Halili çarşısı', 'Yerel mutfak'],
    rules: { required: true },
  },
  {
    key: 'oda', type: 'choice', label: 'Oda tercihi',
    title: 'Oda tercihin?',
    options: ['2 kişilik oda', '3 kişilik oda', 'Fark etmez'],
    rules: { required: true },
  },
  {
    key: 'saglik', type: 'textarea', label: 'Sağlık / Alerji',
    title: 'Bilmemiz gereken bir alerji, diyet ya da sağlık durumu var mı?',
    hint: 'Yoksa atlayabilirsin.',
    placeholder: 'Varsa kısaca yazabilirsin...',
  },
  {
    key: 'kaynak', type: 'choice', label: 'Turu nereden duydun?',
    title: 'Turu nereden duydun?',
    options: ['Instagram', 'Arkadaşımdan', 'Okul duyurusu', 'Web sitesi', 'Diğer'],
    rules: { required: true },
  },
  {
    key: 'not', type: 'textarea', label: 'Ek not',
    title: 'Eklemek istediğin bir şey var mı?',
    hint: 'Soru, istek, selam... hepsi olur.',
    placeholder: 'İstersen buraya yaz...',
  },
  {
    key: 'review', type: 'review',
    title: 'Her şey tamam mı?',
  },
]

const questionSteps = steps.filter(s => s.type !== 'intro' && s.type !== 'review')

const variants = {
  enter: dir => ({ opacity: 0, y: 24 * dir }),
  center: { opacity: 1, y: 0 },
  exit: dir => ({ opacity: 0, y: -24 * dir }),
}

export default function MisirBasvuru() {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const advancing = useRef(false)
  const { tour } = useMisirTuru()
  const { values, setValues, errors, setErrors } = useFormState({
    ad: '', ogrNo: '', sinif: '', tel: '', email: '', pasaport: '',
    yurtdisi: '', heyecan: [], oda: '', saglik: '', kaynak: '', not: '', kvkk: false,
  })

  const current = steps[step]
  const last = steps.length - 1
  const questionIndex = steps.slice(0, step + 1).filter(s => s.type !== 'intro' && s.type !== 'review').length
  const progress = (step / last) * 100

  const setValue = (key, value) => {
    setValues(v => ({ ...v, [key]: value }))
    setErrors(er => ({ ...er, [key]: undefined }))
  }

  const go = delta => {
    setDir(delta)
    setStep(s => s + delta)
  }

  const next = () => {
    if (current.type === 'multi' && current.rules?.required && !(values[current.key] || []).length) {
      return setErrors(er => ({ ...er, [current.key]: 'En az bir seçenek seçmelisin.' }))
    }
    if (current.rules) {
      const errs = validate(values, { [current.key]: current.rules })
      if (Object.keys(errs).length) return setErrors(er => ({ ...er, ...errs }))
    }
    go(1)
  }

  const back = () => go(-1)

  const pickOption = value => {
    setValue(current.key, value)
    if (advancing.current) return
    advancing.current = true
    setDir(1)
    setTimeout(() => { advancing.current = false; setStep(s => s + 1) }, 350)
  }

  const toggleMulti = value => {
    const list = values[current.key] || []
    setValue(current.key, list.includes(value) ? list.filter(x => x !== value) : [...list, value])
  }

  const onInputKey = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      next()
    }
  }

  const onAreaKey = e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      next()
    }
  }

  const submit = async () => {
    const errs = validate(values, { kvkk: { required: true } })
    if (Object.keys(errs).length) return setErrors(er => ({ ...er, kvkk: 'Devam etmek için onaylamalısın.' }))
    setSending(true)
    const { error } = await supabase.from('misir_turu_basvurulari').insert({
      ad_soyad: values.ad,
      ogrenci_no: values.ogrNo,
      sinif: values.sinif,
      telefon: values.tel,
      email: values.email,
      pasaport: values.pasaport,
      yurtdisi: values.yurtdisi,
      heyecan: values.heyecan,
      oda_tercihi: values.oda,
      saglik_notu: nullIfEmpty(values.saglik),
      kaynak: values.kaynak,
      ek_not: nullIfEmpty(values.not),
      kvkk_onay: values.kvkk,
    })
    setSending(false)
    if (error) {
      const msg = /kontenjan|süresi|kapalı|zaten/i.test(error.message || '') ? error.message : FORM_ERROR
      return setErrors(er => ({ ...er, form: msg }))
    }
    invalidateMisirTuru()
    setDone(true)
  }

  const num = String(questionIndex).padStart(2, '0')

  if (!tour) {
    return (
      <motion.main className="egypt-page wizard-page" {...pageMotion}>
        <div className="wizard-stage"><div className="wizard-card glass-card" /></div>
      </motion.main>
    )
  }

  const status = misirStatus(tour)
  const kalan = tour.kontenjan ? Math.max(0, tour.kontenjan - (tour.kesinlesen ?? 0)) : null

  if (status !== 'open' && !done) {
    return (
      <motion.main className="egypt-page wizard-page" {...pageMotion}>
        <div className="wizard-stage">
          <div className="wizard-card glass-card">
            <div className="success-panel wizard-success">
              <Lock size={52} />
              <h3>{misirStatusLabel[status]}</h3>
              <p>{status === 'full'
                ? 'Mısır turu kontenjanı dolmuştur. İptal durumunda duyurular sayfasından ilan edeceğiz.'
                : 'Mısır turu başvuruları şu anda alınmamaktadır. Duyuruları takip et.'}</p>
              <div className="wizard-success-actions">
                <Link to="/misir-turu" className="btn btn-outline"><span>Tur sayfasına dön</span></Link>
                <Link to="/duyurular" className="btn btn-gold"><span>Duyurular</span></Link>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    )
  }

  const renderBody = () => {
    const err = current.key && errors[current.key]
    switch (current.type) {
      case 'intro':
        return (
          <>
            {kalan !== null && <p className="wizard-hint">{kalan} yer kaldı</p>}
            <div className="wizard-actions">
              <button className="btn btn-gold" onClick={next}><span>Başlayalım</span><ChevronRight size={18} /></button>
            </div>
          </>
        )
      case 'text':
      case 'email':
      case 'tel':
        return (
          <>
            <input
              className="wizard-input"
              type={current.type === 'text' ? 'text' : current.type}
              name={current.key}
              placeholder={current.placeholder}
              value={values[current.key]}
              onChange={e => setValue(current.key, e.target.value)}
              onKeyDown={onInputKey}
              autoFocus
            />
            {err && <p className="field-error" style={{ marginTop: 10 }}>{err}</p>}
            <div className="wizard-actions">
              <button className="btn btn-gold" onClick={next}><span>Devam</span><ChevronRight size={18} /></button>
              <span className="wizard-enter-hint">Enter <CornerDownLeft size={13} /> ile devam</span>
            </div>
          </>
        )
      case 'choice':
        return (
          <>
            <div className="wizard-options">
              {current.options.map((opt, i) => (
                <button
                  key={opt}
                  className={`wizard-option${values[current.key] === opt ? ' selected' : ''}`}
                  onClick={() => pickOption(opt)}
                >
                  <span className="wizard-key">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
            {err && <p className="field-error" style={{ marginTop: 10 }}>{err}</p>}
          </>
        )
      case 'multi':
        return (
          <>
            <div className="wizard-options">
              {current.options.map((opt, i) => (
                <button
                  key={opt}
                  className={`wizard-option${(values[current.key] || []).includes(opt) ? ' selected' : ''}`}
                  onClick={() => toggleMulti(opt)}
                >
                  <span className="wizard-key">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
            {err && <p className="field-error" style={{ marginTop: 10 }}>{err}</p>}
            <div className="wizard-actions">
              <button className="btn btn-gold" onClick={next}><span>Devam</span><ChevronRight size={18} /></button>
            </div>
          </>
        )
      case 'textarea':
        return (
          <>
            <textarea
              className="wizard-input wizard-textarea"
              name={current.key}
              placeholder={current.placeholder}
              value={values[current.key]}
              onChange={e => setValue(current.key, e.target.value)}
              onKeyDown={onAreaKey}
              autoFocus
            />
            <div className="wizard-actions">
              <button className="btn btn-gold" onClick={next}><span>Devam</span><ChevronRight size={18} /></button>
              <button className="btn btn-outline" onClick={next}><span>Atla</span></button>
              <span className="wizard-enter-hint">Ctrl + Enter ile devam</span>
            </div>
          </>
        )
      case 'review':
        return (
          <>
            <div className="wizard-review">
              {questionSteps.map(q => (
                <div className="wizard-review-row" key={q.key}>
                  <span className="wizard-review-label">{q.label}</span>
                  <span className="wizard-review-value">
                    {Array.isArray(values[q.key])
                      ? (values[q.key].length ? values[q.key].join(', ') : '—')
                      : (values[q.key] || '—')}
                  </span>
                </div>
              ))}
            </div>
            <label className="checkbox-field" style={{ marginTop: 22 }}>
              <input
                type="checkbox"
                name="kvkk"
                checked={values.kvkk}
                onChange={e => setValue('kvkk', e.target.checked)}
              />
              Kişisel verilerimin tur başvurusu kapsamında işlenmesini kabul ediyorum.
            </label>
            {errors.kvkk && <p className="field-error">{errors.kvkk}</p>}
            {errors.form && <p className="field-error">{errors.form}</p>}
            <div className="wizard-actions">
              <button className="btn btn-gold" onClick={submit} disabled={sending}>
                <span>{sending ? 'Gönderiliyor…' : 'Başvuruyu Gönder'}</span>
              </button>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <motion.main className="egypt-page wizard-page" {...pageMotion}>
      {done ? (
        <div className="wizard-stage">
          <div className="wizard-card glass-card">
            <div className="success-panel wizard-success">
              <CheckCircle2 size={52} />
              <h3>Başvurun Alındı!</h3>
              <p>Mısır turu ön kaydın oluşturuldu. Ekibimiz en kısa sürede seninle iletişime geçecek.</p>
              <div className="wizard-success-actions">
                <Link to="/misir-turu" className="btn btn-outline"><span>Tur sayfasına dön</span></Link>
                <Link to="/" className="btn btn-gold"><span>Ana sayfa</span></Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="container wizard-top">
            <Link to="/misir-turu" className="wizard-back-link">← Tur sayfasına dön</Link>
            {current.type !== 'intro' && (
              <span className="wizard-count">Soru {questionIndex} / {questionSteps.length}</span>
            )}
          </div>
          <div className="wizard-progress">
            <motion.div
              className="wizard-progress-bar"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease }}
            />
          </div>
          <div className="wizard-stage">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                className="wizard-card glass-card"
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease }}
              >
                {current.type !== 'intro' && <span className="wizard-num">{num}</span>}
                <h2>{current.title}</h2>
                {current.hint && <p className="wizard-hint">{current.hint}</p>}
                {renderBody()}
                {step > 0 && (
                  <button className="btn btn-outline wizard-back-btn" onClick={back}>
                    <ChevronLeft size={18} /><span>Geri</span>
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.main>
  )
}
