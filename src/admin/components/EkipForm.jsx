import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { insertRow, updateRow, uploadPublicFile } from '../api.js'
import { toast } from '../toast.js'

const initials = name => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

export default function EkipForm({ open, member, defaultGrup, members, onClose, onSaved }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="adm-drawer-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Form member={member} defaultGrup={defaultGrup} members={members} onClose={onClose} onSaved={onSaved} />
        </>
      )}
    </AnimatePresence>
  )
}

function Form({ member, defaultGrup, members, onClose, onSaved }) {
  const [form, setForm] = useState({
    ad_soyad: member?.ad_soyad || '',
    unvan: member?.unvan || '',
    grup: member?.grup || defaultGrup || 'yonetim',
    linkedin: member?.linkedin || '',
    email: member?.email || '',
    aktif: member ? member.aktif : true,
  })
  const [fotoUrl, setFotoUrl] = useState(member?.foto_url || '')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const pickFile = e => {
    const f = e.target.files[0] || null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : '')
  }

  const save = async () => {
    if (!form.ad_soyad.trim() || !form.unvan.trim()) {
      setError('Ad Soyad ve Ünvan zorunludur.')
      return
    }
    setSaving(true)
    setError('')
    try {
      let foto = fotoUrl.trim() || null
      if (file) {
        const ext = file.name.split('.').pop()
        foto = await uploadPublicFile('ekip', `${crypto.randomUUID()}.${ext}`, file)
      }
      const values = {
        ad_soyad: form.ad_soyad.trim(),
        unvan: form.unvan.trim(),
        grup: form.grup,
        foto_url: foto,
        linkedin: form.linkedin.trim() || null,
        email: form.email.trim() || null,
        aktif: form.aktif,
      }
      if (member) {
        await updateRow('ekip_uyeleri', member.id, values)
        onSaved({ ...member, ...values })
      } else {
        const sira = Math.max(0, ...members.filter(m => m.grup === form.grup).map(m => m.sira)) + 1
        onSaved(await insertRow('ekip_uyeleri', { ...values, sira }))
      }
      toast.success(member ? 'Ekip üyesi güncellendi.' : 'Ekip üyesi eklendi.')
      onClose()
    } catch (e) {
      setError(e.message || 'Kaydetme başarısız.')
      toast.error(e.message || 'Kaydetme başarısız.')
    } finally {
      setSaving(false)
    }
  }

  const shown = preview || fotoUrl

  return (
    <motion.aside
      className="adm-drawer"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      <div className="adm-drawer-head">
        <h2>{member ? 'Üyeyi Düzenle' : 'Yeni Üye'}</h2>
        <button className="adm-close" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
      </div>

      <div className="adm-drawer-body">
        <label className="adm-field">
          <span>Ad Soyad *</span>
          <input value={form.ad_soyad} onChange={set('ad_soyad')} />
        </label>
        <label className="adm-field">
          <span>Ünvan *</span>
          <input value={form.unvan} onChange={set('unvan')} />
        </label>
        <label className="adm-field">
          <span>Grup</span>
          <select className="adm-select" value={form.grup} onChange={set('grup')}>
            <option value="yonetim">Yönetim Kurulu</option>
            <option value="departman">Departman Başkanları</option>
          </select>
        </label>
        <div className="adm-field">
          <span>Fotoğraf</span>
          <div className="adm-ekip-foto-row">
            {shown
              ? <img className="adm-ekip-photo" src={shown} alt="Önizleme" />
              : <div className="adm-ekip-photo adm-ekip-photo-empty">{form.ad_soyad ? initials(form.ad_soyad) : '?'}</div>}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} />
          </div>
          <input value={fotoUrl} onChange={e => { setFotoUrl(e.target.value); setFile(null); setPreview('') }} placeholder="veya fotoğraf URL'si" />
        </div>
        <label className="adm-field">
          <span>LinkedIn URL</span>
          <input value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/..." />
        </label>
        <label className="adm-field">
          <span>E-posta</span>
          <input type="email" value={form.email} onChange={set('email')} />
        </label>
        <label className="adm-check">
          <input type="checkbox" checked={form.aktif} onChange={set('aktif')} />
          <span>Aktif (sitede görünsün)</span>
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
