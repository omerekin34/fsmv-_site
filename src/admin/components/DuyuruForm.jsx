import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { insertRow, updateRow } from '../api.js'
import { invalidateAnnouncements } from '../../lib/announcements.js'

const slugify = s => s
  .toLocaleLowerCase('tr')
  .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
  .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const slugRe = /^[a-z0-9]+(-[a-z0-9]+)*$/
const lines = t => t.split('\n').map(x => x.trim()).filter(Boolean)
const paras = t => t.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean)
const emptyToNull = v => (v || '').trim() || null
const today = () => new Date().toISOString().slice(0, 10)

const kategoriler = ['Yarışma', 'Kariyer', 'Gezi', 'Genel', 'Üyelik', 'Yönetim']

export default function DuyuruForm({ open, row, onClose, onSaved }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="adm-drawer-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Form row={row} onClose={onClose} onSaved={onSaved} />
        </>
      )}
    </AnimatePresence>
  )
}

function Form({ row, onClose, onSaved }) {
  const [form, setForm] = useState({
    baslik: row?.baslik || '',
    slug: row?.slug || '',
    tur: row?.tur || 'etkinlik',
    kategori: row?.kategori || 'Genel',
    yayin_tarihi: row?.yayin_tarihi || today(),
    ozet: row?.ozet || '',
    etkinlik_tarihi: row?.etkinlik_tarihi || '',
    saat: row?.saat || '',
    yer: row?.yer || '',
    son_basvuru: row?.son_basvuru || '',
    kontenjan: row?.kontenjan ?? '',
    gecerlilik: row?.gecerlilik || '',
    iletisim: row?.iletisim || '',
    yayinda: row ? row.yayinda : true,
  })
  const [icerik, setIcerik] = useState((row?.icerik || []).join('\n\n'))
  const [detaylar, setDetaylar] = useState((row?.detaylar || []).join('\n'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const slugTouched = useRef(!!row)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const setBaslik = e => {
    const v = e.target.value
    setForm(f => ({ ...f, baslik: v, slug: slugTouched.current ? f.slug : slugify(v) }))
  }

  const setSlug = e => {
    slugTouched.current = true
    setForm(f => ({ ...f, slug: e.target.value }))
  }

  const save = async () => {
    const slug = form.slug.trim()
    if (!form.baslik.trim() || !slug || !form.kategori.trim() || !form.yayin_tarihi) {
      setError('Başlık, slug, kategori ve yayın tarihi zorunludur.')
      return
    }
    if (!slugRe.test(slug)) {
      setError('Slug yalnızca küçük harf, rakam ve tire içerebilir (örn. yeni-duyuru).')
      return
    }
    if (form.tur === 'etkinlik' && !form.etkinlik_tarihi) {
      setError('Etkinlik türü için etkinlik tarihi zorunludur.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const isEvent = form.tur === 'etkinlik'
      const values = {
        baslik: form.baslik.trim(),
        slug,
        tur: form.tur,
        kategori: form.kategori.trim(),
        yayin_tarihi: form.yayin_tarihi,
        ozet: form.ozet.trim(),
        etkinlik_tarihi: isEvent ? form.etkinlik_tarihi || null : null,
        saat: isEvent ? emptyToNull(form.saat) : null,
        yer: isEvent ? emptyToNull(form.yer) : null,
        son_basvuru: isEvent ? form.son_basvuru || null : null,
        kontenjan: isEvent && form.kontenjan !== '' ? Number(form.kontenjan) : null,
        gecerlilik: !isEvent ? form.gecerlilik || null : null,
        icerik: paras(icerik),
        detaylar: lines(detaylar),
        iletisim: emptyToNull(form.iletisim),
        yayinda: form.yayinda,
      }
      if (row) {
        await updateRow('duyurular', row.id, values)
        onSaved({ ...row, ...values })
      } else {
        onSaved(await insertRow('duyurular', values))
      }
      invalidateAnnouncements()
      onClose()
    } catch (e) {
      setError(e.message || 'Kaydetme başarısız.')
    } finally {
      setSaving(false)
    }
  }

  const isEvent = form.tur === 'etkinlik'

  return (
    <motion.aside
      className="adm-drawer adm-drawer-wide"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      <div className="adm-drawer-head">
        <h2>{row ? 'Duyuruyu Düzenle' : 'Yeni Duyuru'}</h2>
        <button className="adm-close" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
      </div>

      <div className="adm-drawer-body">
        <label className="adm-field">
          <span>Başlık *</span>
          <input value={form.baslik} onChange={setBaslik} />
        </label>
        <label className="adm-field">
          <span>Slug *</span>
          <input value={form.slug} onChange={setSlug} placeholder="ornek-duyuru" />
        </label>
        <div className="adm-faal-2col">
          <label className="adm-field">
            <span>Tür *</span>
            <select className="adm-select" value={form.tur} onChange={set('tur')}>
              <option value="etkinlik">Etkinlik</option>
              <option value="duyuru">Duyuru</option>
            </select>
          </label>
          <label className="adm-field">
            <span>Kategori *</span>
            <input value={form.kategori} onChange={set('kategori')} list="duyuru-kategorileri" />
            <datalist id="duyuru-kategorileri">
              {kategoriler.map(k => <option key={k} value={k} />)}
            </datalist>
          </label>
        </div>
        <label className="adm-field">
          <span>Yayın Tarihi *</span>
          <input type="date" value={form.yayin_tarihi} onChange={set('yayin_tarihi')} />
        </label>
        <label className="adm-field">
          <span>Özet</span>
          <textarea className="adm-textarea" rows={3} value={form.ozet} onChange={set('ozet')} />
        </label>
        {isEvent ? (
          <>
            <div className="adm-faal-2col">
              <label className="adm-field">
                <span>Etkinlik Tarihi *</span>
                <input type="date" value={form.etkinlik_tarihi} onChange={set('etkinlik_tarihi')} />
              </label>
              <label className="adm-field">
                <span>Saat</span>
                <input value={form.saat} onChange={set('saat')} placeholder="14:00" />
              </label>
            </div>
            <label className="adm-field">
              <span>Yer</span>
              <input value={form.yer} onChange={set('yer')} />
            </label>
            <div className="adm-faal-2col">
              <label className="adm-field">
                <span>Son Başvuru</span>
                <input type="date" value={form.son_basvuru} onChange={set('son_basvuru')} />
              </label>
              <label className="adm-field">
                <span>Kontenjan (boş = sınırsız)</span>
                <input type="number" min="1" value={form.kontenjan} onChange={set('kontenjan')} />
              </label>
            </div>
          </>
        ) : (
          <label className="adm-field">
            <span>Geçerlilik Tarihi</span>
            <input type="date" value={form.gecerlilik} onChange={set('gecerlilik')} />
          </label>
        )}
        <label className="adm-field">
          <span>İçerik (paragraflar boş satırla ayrılır)</span>
          <textarea className="adm-textarea" rows={6} value={icerik} onChange={e => setIcerik(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>Detaylar (her satır bir madde)</span>
          <textarea className="adm-textarea" rows={5} value={detaylar} onChange={e => setDetaylar(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>İletişim E-posta</span>
          <input type="email" value={form.iletisim} onChange={set('iletisim')} placeholder="hukukkulubu@fsm.edu.tr" />
        </label>
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
