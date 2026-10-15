import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import { insertRow, updateRow, uploadPublicFile } from '../api.js'
import { invalidateActivities } from '../../lib/activities.js'

const slugify = s => s
  .toLocaleLowerCase('tr')
  .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
  .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const slugRe = /^[a-z0-9]+(-[a-z0-9]+)*$/
const lines = t => t.split('\n').map(x => x.trim()).filter(Boolean)
const paras = t => t.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean)

export default function FaaliyetForm({ open, row, categories, onClose, onSaved }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="adm-drawer-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Form row={row} categories={categories} onClose={onClose} onSaved={onSaved} />
        </>
      )}
    </AnimatePresence>
  )
}

function Form({ row, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    baslik: row?.baslik || '',
    slug: row?.slug || '',
    kategori: row?.kategori || categories[0]?.ad || '',
    tarih: row?.tarih || '',
    saat: row?.saat || '',
    yer: row?.yer || '',
    katilimci: row?.katilimci ?? 0,
    ozet: row?.ozet || '',
    yayinda: row ? row.yayinda : true,
  })
  const [kapakUrl, setKapakUrl] = useState(row?.kapak_url || '')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [icerik, setIcerik] = useState((row?.icerik || []).join('\n\n'))
  const [program, setProgram] = useState((row?.program || []).join('\n'))
  const [kazanimlar, setKazanimlar] = useState((row?.kazanimlar || []).join('\n'))
  const [konusmacilar, setKonusmacilar] = useState((row?.konusmacilar || []).map(k => ({ ad: k.ad || '', unvan: k.unvan || '' })))
  const [galeri, setGaleri] = useState((row?.galeri || []).join('\n'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const slugTouched = useRef(!!row)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const setBaslik = e => {
    const v = e.target.value
    setForm(f => ({ ...f, baslik: v, slug: slugTouched.current ? f.slug : slugify(v) }))
  }

  const setSlug = e => {
    slugTouched.current = true
    setForm(f => ({ ...f, slug: e.target.value }))
  }

  const pickFile = e => {
    const f = e.target.files[0] || null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : '')
  }

  const setSpeaker = (i, key, v) => setKonusmacilar(ks => ks.map((k, j) => (j === i ? { ...k, [key]: v } : k)))

  const pickGallery = async e => {
    const files = [...e.target.files]
    if (!files.length) return
    try {
      const urls = await Promise.all(files.map(f => {
        const ext = f.name.split('.').pop()
        return uploadPublicFile('faaliyetler', `${crypto.randomUUID()}.${ext}`, f)
      }))
      setGaleri(g => [...(g ? g.split('\n').filter(x => x.trim()) : []), ...urls].join('\n'))
    } catch (err) {
      setError(err.message || 'Görsel yüklenemedi.')
    } finally {
      e.target.value = ''
    }
  }

  const save = async () => {
    const slug = form.slug.trim()
    if (!form.baslik.trim() || !slug || !form.kategori || !form.tarih) {
      setError('Başlık, slug, kategori ve tarih zorunludur.')
      return
    }
    if (!slugRe.test(slug)) {
      setError('Slug yalnızca küçük harf, rakam ve tire içerebilir (örn. yeni-faaliyet).')
      return
    }
    setSaving(true)
    setError('')
    try {
      let kapak = kapakUrl.trim() || null
      if (file) {
        const ext = file.name.split('.').pop()
        kapak = await uploadPublicFile('faaliyetler', `${crypto.randomUUID()}.${ext}`, file)
      }
      const values = {
        baslik: form.baslik.trim(),
        slug,
        kategori: form.kategori,
        tarih: form.tarih,
        saat: form.saat.trim() || null,
        yer: form.yer.trim() || null,
        katilimci: Math.max(0, Number(form.katilimci) || 0),
        ozet: form.ozet.trim(),
        kapak_url: kapak,
        icerik: paras(icerik),
        program: lines(program),
        kazanimlar: lines(kazanimlar),
        konusmacilar: konusmacilar.filter(k => (k.ad || '').trim()).map(k => ({ ad: (k.ad || '').trim(), unvan: (k.unvan || '').trim() })),
        galeri: lines(galeri),
        yayinda: form.yayinda,
      }
      if (row) {
        await updateRow('faaliyetler', row.id, values)
        onSaved({ ...row, ...values })
      } else {
        onSaved(await insertRow('faaliyetler', values))
      }
      invalidateActivities()
      onClose()
    } catch (e) {
      setError(e.message || 'Kaydetme başarısız.')
    } finally {
      setSaving(false)
    }
  }

  const shown = preview || kapakUrl

  return (
    <motion.aside
      className="adm-drawer adm-drawer-wide"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      <div className="adm-drawer-head">
        <h2>{row ? 'Faaliyeti Düzenle' : 'Yeni Faaliyet'}</h2>
        <button className="adm-close" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
      </div>

      <div className="adm-drawer-body">
        <label className="adm-field">
          <span>Başlık *</span>
          <input value={form.baslik} onChange={setBaslik} />
        </label>
        <label className="adm-field">
          <span>Slug *</span>
          <input value={form.slug} onChange={setSlug} placeholder="ornek-faaliyet" />
        </label>
        <label className="adm-field">
          <span>Kategori *</span>
          <select className="adm-select" value={form.kategori} onChange={set('kategori')}>
            {categories.map(c => <option key={c.id} value={c.ad}>{c.ad}</option>)}
          </select>
        </label>
        <div className="adm-faal-2col">
          <label className="adm-field">
            <span>Tarih *</span>
            <input type="date" value={form.tarih} onChange={set('tarih')} />
          </label>
          <label className="adm-field">
            <span>Saat</span>
            <input value={form.saat} onChange={set('saat')} placeholder="14:00 – 17:00" />
          </label>
        </div>
        <div className="adm-faal-2col">
          <label className="adm-field">
            <span>Yer</span>
            <input value={form.yer} onChange={set('yer')} />
          </label>
          <label className="adm-field">
            <span>Katılımcı</span>
            <input type="number" min="0" value={form.katilimci} onChange={set('katilimci')} />
          </label>
        </div>
        <label className="adm-field">
          <span>Özet</span>
          <textarea className="adm-textarea" rows={3} value={form.ozet} onChange={set('ozet')} />
        </label>
        <div className="adm-field">
          <span>Kapak görseli</span>
          <div className="adm-ekip-foto-row">
            {shown
              ? <img className="adm-thumb adm-thumb-lg" src={shown} alt="Önizleme" />
              : <div className="adm-thumb adm-thumb-lg adm-thumb-empty" />}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} />
          </div>
          <input value={kapakUrl} onChange={e => { setKapakUrl(e.target.value); setFile(null); setPreview('') }} placeholder="veya görsel URL'si" />
        </div>
        <label className="adm-field">
          <span>Etkinlik Hakkında (paragraflar boş satırla ayrılır)</span>
          <textarea className="adm-textarea" rows={6} value={icerik} onChange={e => setIcerik(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>Neler Yapıldı (her satır bir adım)</span>
          <textarea className="adm-textarea" rows={5} value={program} onChange={e => setProgram(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>Kazanımlar (her satır bir madde)</span>
          <textarea className="adm-textarea" rows={5} value={kazanimlar} onChange={e => setKazanimlar(e.target.value)} />
        </label>
        <div className="adm-field">
          <span>Konuşmacılar</span>
          {konusmacilar.map((k, i) => (
            <div className="adm-speaker-row" key={i}>
              <input value={k.ad} onChange={e => setSpeaker(i, 'ad', e.target.value)} placeholder="Ad" />
              <input value={k.unvan} onChange={e => setSpeaker(i, 'unvan', e.target.value)} placeholder="Ünvan" />
              <button type="button" className="adm-icon-btn adm-icon-btn-danger" onClick={() => setKonusmacilar(ks => ks.filter((_, j) => j !== i))} aria-label="Konuşmacıyı sil"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" className="adm-btn adm-btn-outline adm-btn-auto" onClick={() => setKonusmacilar(ks => [...ks, { ad: '', unvan: '' }])}>
            <Plus size={14} /><span>Konuşmacı Ekle</span>
          </button>
        </div>
        <div className="adm-field">
          <span>Galeri (her satır bir görsel URL'si)</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pickGallery} />
          <textarea className="adm-textarea" rows={4} value={galeri} onChange={e => setGaleri(e.target.value)} />
        </div>
        <label className="adm-check">
          <input type="checkbox" checked={form.yayinda} onChange={set('yayinda')} />
          <span>Yayında (sitede görünsün)</span>
        </label>

        {error && <p className="adm-error">{error}</p>}
      </div>

      <div className="adm-drawer-foot">
        <button className="adm-btn adm-btn-gold" disabled={saving} onClick={save}>
          <Save size={15} /><span>{saving ? 'Kaydediliyor…' : 'Kaydet'}</span>
        </button>
      </div>
    </motion.aside>
  )
}
