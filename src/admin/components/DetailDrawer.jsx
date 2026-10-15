import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Save } from 'lucide-react'
import { updateRow, deleteRow } from '../api.js'
import { cellText, statusSlug } from '../format.js'

const parseStatus = v => (v === 'true' ? true : v === 'false' ? false : v)

export default function DetailDrawer({ table, row, columns, statusField, statusOptions = [], hasAdminNote, onClose, onUpdated, onDeleted }) {
  const [note, setNote] = useState(row?.admin_notu ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const patchRow = async patch => {
    setSaving(true)
    setError('')
    try {
      await updateRow(table, row.id, patch)
      onUpdated({ ...row, ...patch })
    } catch (e) {
      setError(e.message || 'Güncelleme başarısız.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
    setSaving(true)
    setError('')
    try {
      await deleteRow(table, row.id)
      onDeleted(row.id)
    } catch (e) {
      setError(e.message || 'Silme başarısız.')
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {row && (
        <>
          <motion.div
            className="adm-drawer-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="adm-drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="adm-drawer-head">
              <h2>Kayıt Detayı</h2>
              <button className="adm-close" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
            </div>

            <div className="adm-drawer-body">
              {columns.map(col => (
                <div className="adm-drawer-row" key={col.key}>
                  <span className="adm-drawer-label">{col.label}</span>
                  {col.key === statusField ? (
                    <select
                      className={`adm-badge adm-badge-${statusSlug(row[col.key])} adm-badge-select`}
                      value={String(row[col.key])}
                      disabled={saving}
                      onChange={e => patchRow({ [statusField]: parseStatus(e.target.value) })}
                    >
                      {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <span className="adm-drawer-value">{cellText(col, row)}</span>
                  )}
                </div>
              ))}

              {hasAdminNote && (
                <div className="adm-drawer-row">
                  <span className="adm-drawer-label">Yönetici Notu</span>
                  <textarea
                    className="adm-textarea"
                    rows={4}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Bu kayıt için iç not..."
                  />
                  <button className="adm-btn adm-btn-outline" disabled={saving} onClick={() => patchRow({ admin_notu: note.trim() || null })}>
                    <Save size={15} /><span>{saving ? 'Kaydediliyor…' : 'Kaydet'}</span>
                  </button>
                </div>
              )}

              {error && <p className="adm-error">{error}</p>}
            </div>

            <div className="adm-drawer-foot">
              <button className="adm-btn adm-btn-danger" disabled={saving} onClick={remove}>
                <Trash2 size={15} /><span>Sil</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
