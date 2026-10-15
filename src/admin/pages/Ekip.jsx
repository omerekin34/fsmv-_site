import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, Eye, EyeOff, Pencil, Trash2, Plus, Mail } from 'lucide-react'
import { LinkedinIcon } from '../../components/SocialIcons.jsx'
import { fetchRows, updateRow, deleteRow } from '../api.js'
import EkipForm from '../components/EkipForm.jsx'

const tabs = [
  { key: 'yonetim', label: 'Yönetim Kurulu' },
  { key: 'departman', label: 'Departman Başkanları' },
]

const initials = name => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

export default function Ekip() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('yonetim')
  const [drawer, setDrawer] = useState(null)

  useEffect(() => {
    let alive = true
    fetchRows('ekip_uyeleri', { order: 'sira', ascending: true })
      .then(data => { if (alive) setRows(data) })
      .catch(e => { if (alive) setError(e.message || 'Veriler alınamadı.') })
    return () => { alive = false }
  }, [])

  const members = (rows || []).filter(r => r.grup === tab).sort((a, b) => a.sira - b.sira)

  const patch = (id, p) => setRows(rs => rs.map(r => (r.id === id ? { ...r, ...p } : r)))

  const move = async (m, dir) => {
    const i = members.findIndex(r => r.id === m.id)
    const other = members[i + dir]
    if (!other) return
    patch(m.id, { sira: other.sira })
    patch(other.id, { sira: m.sira })
    try {
      await updateRow('ekip_uyeleri', m.id, { sira: other.sira })
      await updateRow('ekip_uyeleri', other.id, { sira: m.sira })
    } catch (e) {
      patch(m.id, { sira: m.sira })
      patch(other.id, { sira: other.sira })
      setError(e.message || 'Sıralama güncellenemedi.')
    }
  }

  const toggle = async m => {
    patch(m.id, { aktif: !m.aktif })
    try {
      await updateRow('ekip_uyeleri', m.id, { aktif: !m.aktif })
    } catch (e) {
      patch(m.id, { aktif: m.aktif })
      setError(e.message || 'Güncelleme başarısız.')
    }
  }

  const remove = async m => {
    if (!window.confirm(`${m.ad_soyad} adlı üyeyi silmek istediğinize emin misiniz?`)) return
    try {
      await deleteRow('ekip_uyeleri', m.id)
      setRows(rs => rs.filter(r => r.id !== m.id))
    } catch (e) {
      setError(e.message || 'Silme başarısız.')
    }
  }

  const onSaved = row => {
    setRows(rs => {
      const exists = rs.some(r => r.id === row.id)
      return exists ? rs.map(r => (r.id === row.id ? row : r)) : [...rs, row]
    })
  }

  if (error && !rows) return <div className="adm-state adm-glass adm-error-state">{error}</div>
  if (!rows) return <div className="adm-state adm-glass"><div className="adm-spinner" /><span>Yükleniyor…</span></div>

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="adm-toolbar adm-glass">
        <div className="adm-ekip-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`adm-ekip-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="adm-ekip-count">{rows.filter(r => r.grup === t.key).length}</span>
            </button>
          ))}
        </div>
        <button className="adm-btn adm-btn-gold adm-btn-auto" onClick={() => setDrawer({ member: null })}>
          <Plus size={15} /><span>Yeni Üye</span>
        </button>
      </div>
      <p className="adm-ekip-hint">Sıralama ok tuşlarıyla değiştirilir; pasif üyeler sitede görünmez.</p>
      {error && <p className="adm-error">{error}</p>}

      {members.length === 0 ? (
        <div className="adm-state adm-glass"><span>Bu grupta henüz üye yok.</span></div>
      ) : (
        <div className="adm-ekip-grid">
          {members.map((m, i) => (
            <div className={`adm-glass adm-ekip-card${m.aktif ? '' : ' inactive'}`} key={m.id}>
              {m.foto_url
                ? <img className="adm-ekip-photo" src={m.foto_url} alt={m.ad_soyad} loading="lazy" />
                : <div className="adm-ekip-photo adm-ekip-photo-empty">{initials(m.ad_soyad)}</div>}
              <span className="adm-ekip-name">{m.ad_soyad}</span>
              <span className="adm-ekip-unvan">{m.unvan}</span>
              <div className="adm-ekip-badges">
                {!m.aktif && <span className="adm-badge adm-badge-false">Pasif</span>}
                {m.linkedin && <span className="adm-ekip-soc"><LinkedinIcon size={14} /></span>}
                {m.email && <Mail size={14} className="adm-ekip-soc" />}
              </div>
              <div className="adm-ekip-actions">
                <button className="adm-icon-btn" disabled={i === 0} onClick={() => move(m, -1)} aria-label="Yukarı taşı"><ChevronUp size={15} /></button>
                <button className="adm-icon-btn" disabled={i === members.length - 1} onClick={() => move(m, 1)} aria-label="Aşağı taşı"><ChevronDown size={15} /></button>
                <button className="adm-icon-btn" onClick={() => toggle(m)} aria-label="Aktifliği değiştir">{m.aktif ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                <button className="adm-icon-btn" onClick={() => setDrawer({ member: m })} aria-label="Düzenle"><Pencil size={15} /></button>
                <button className="adm-icon-btn adm-icon-btn-danger" onClick={() => remove(m)} aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EkipForm
        open={drawer !== null}
        member={drawer?.member || null}
        defaultGrup={tab}
        members={rows}
        onClose={() => setDrawer(null)}
        onSaved={onSaved}
      />
    </motion.div>
  )
}
