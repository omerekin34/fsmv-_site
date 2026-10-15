import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronUp, ChevronDown, Pencil, Trash2, Plus, Check } from 'lucide-react'
import { insertRow, updateRow, deleteRow } from '../api.js'
import { invalidateActivities } from '../../lib/activities.js'

export default function KategoriForm({ open, categories, setCategories, onRenamed, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="adm-drawer-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Drawer categories={categories} setCategories={setCategories} onRenamed={onRenamed} onClose={onClose} />
        </>
      )}
    </AnimatePresence>
  )
}

function Drawer({ categories, setCategories, onRenamed, onClose }) {
  const [newAd, setNewAd] = useState('')
  const [editing, setEditing] = useState(null)
  const [editAd, setEditAd] = useState('')
  const [error, setError] = useState('')

  const cats = [...categories].sort((a, b) => a.sira - b.sira)

  const patch = (id, p) => setCategories(cs => cs.map(c => (c.id === id ? { ...c, ...p } : c)))

  const move = async (c, dir) => {
    const i = cats.findIndex(x => x.id === c.id)
    const other = cats[i + dir]
    if (!other) return
    patch(c.id, { sira: other.sira })
    patch(other.id, { sira: c.sira })
    try {
      await updateRow('faaliyet_kategorileri', c.id, { sira: other.sira })
      await updateRow('faaliyet_kategorileri', other.id, { sira: c.sira })
      invalidateActivities()
    } catch (e) {
      patch(c.id, { sira: c.sira })
      patch(other.id, { sira: other.sira })
      setError(e.message || 'Sıralama güncellenemedi.')
    }
  }

  const rename = async c => {
    const ad = editAd.trim()
    if (!ad || ad === c.ad) { setEditing(null); return }
    try {
      await updateRow('faaliyet_kategorileri', c.id, { ad })
      patch(c.id, { ad })
      onRenamed(c.ad, ad)
      setEditing(null)
      invalidateActivities()
    } catch (e) {
      setError(e.message || 'Yeniden adlandırma başarısız.')
    }
  }

  const remove = async c => {
    if (!window.confirm(`"${c.ad}" kategorisini silmek istediğinize emin misiniz?`)) return
    try {
      await deleteRow('faaliyet_kategorileri', c.id)
      setCategories(cs => cs.filter(x => x.id !== c.id))
      invalidateActivities()
    } catch {
      setError('Bu kategoriye bağlı faaliyetler var, önce onları taşıyın.')
    }
  }

  const add = async () => {
    const ad = newAd.trim()
    if (!ad) return
    try {
      const sira = Math.max(0, ...cats.map(c => c.sira)) + 1
      const row = await insertRow('faaliyet_kategorileri', { ad, sira })
      setCategories(cs => [...cs, row])
      setNewAd('')
      invalidateActivities()
    } catch (e) {
      setError(e.message || 'Kategori eklenemedi.')
    }
  }

  return (
    <motion.aside
      className="adm-drawer"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
    >
      <div className="adm-drawer-head">
        <h2>Kategoriler</h2>
        <button className="adm-close" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
      </div>

      <div className="adm-drawer-body">
        {cats.map((c, i) => (
          <div className="adm-cat-row" key={c.id}>
            {editing === c.id ? (
              <>
                <input value={editAd} onChange={e => setEditAd(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') rename(c) }} />
                <button className="adm-icon-btn" onClick={() => rename(c)} aria-label="Kaydet"><Check size={15} /></button>
                <button className="adm-icon-btn" onClick={() => setEditing(null)} aria-label="Vazgeç"><X size={15} /></button>
              </>
            ) : (
              <>
                <span className="adm-cat-name">{c.ad}</span>
                <button className="adm-icon-btn" disabled={i === 0} onClick={() => move(c, -1)} aria-label="Yukarı taşı"><ChevronUp size={15} /></button>
                <button className="adm-icon-btn" disabled={i === cats.length - 1} onClick={() => move(c, 1)} aria-label="Aşağı taşı"><ChevronDown size={15} /></button>
                <button className="adm-icon-btn" onClick={() => { setEditing(c.id); setEditAd(c.ad) }} aria-label="Yeniden adlandır"><Pencil size={15} /></button>
                <button className="adm-icon-btn adm-icon-btn-danger" onClick={() => remove(c)} aria-label="Sil"><Trash2 size={15} /></button>
              </>
            )}
          </div>
        ))}

        <div className="adm-cat-row">
          <input value={newAd} onChange={e => setNewAd(e.target.value)} placeholder="Yeni kategori" onKeyDown={e => { if (e.key === 'Enter') add() }} />
          <button className="adm-icon-btn" onClick={add} aria-label="Ekle"><Plus size={15} /></button>
        </div>

        {error && <p className="adm-error">{error}</p>}
      </div>
    </motion.aside>
  )
}
