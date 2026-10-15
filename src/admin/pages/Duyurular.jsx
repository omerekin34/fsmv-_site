import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Eye, EyeOff, Pencil, Trash2, Plus, X, Users } from 'lucide-react'
import { fetchRows, updateRow, deleteRow } from '../api.js'
import { formatDate, invalidateAnnouncements } from '../../lib/announcements.js'
import DuyuruForm from '../components/DuyuruForm.jsx'

const trLower = s => (s || '').toLocaleLowerCase('tr')

export default function Duyurular() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(null)
  const [kont, setKont] = useState({})
  const [error, setError] = useState('')
  const [drawer, setDrawer] = useState(null)
  const [q, setQ] = useState('')
  const [t, setT] = useState('')
  const [k, setK] = useState('')
  const [d, setD] = useState('')
  const [s, setS] = useState('new')

  useEffect(() => {
    let alive = true
    Promise.all([
      fetchRows('duyurular', { order: 'yayin_tarihi', ascending: false }),
      fetchRows('duyuru_kontenjan', { order: 'duyuru_id' }),
    ])
      .then(([r, kn]) => {
        if (!alive) return
        setRows(r)
        setKont(Object.fromEntries(kn.map(x => [x.duyuru_id, x])))
      })
      .catch(e => { if (alive) setError(e.message || 'Veriler alınamadı.') })
    return () => { alive = false }
  }, [])

  const cats = useMemo(() => [...new Set((rows || []).map(r => r.kategori).filter(Boolean))].sort(), [rows])

  const list = useMemo(() => {
    const needle = trLower(q.trim())
    const filtered = (rows || []).filter(r => {
      if (t && r.tur !== t) return false
      if (k && r.kategori !== k) return false
      if (d === 'yayinda' && !r.yayinda) return false
      if (d === 'taslak' && r.yayinda) return false
      if (needle && !trLower(`${r.baslik} ${r.ozet} ${r.yer}`).includes(needle)) return false
      return true
    })
    return [...filtered].sort((a, b) => s === 'old'
      ? a.yayin_tarihi.localeCompare(b.yayin_tarihi)
      : b.yayin_tarihi.localeCompare(a.yayin_tarihi))
  }, [rows, q, t, k, d, s])

  const active = q || t || k || d || s !== 'new'
  const clear = () => { setQ(''); setT(''); setK(''); setD(''); setS('new') }

  const patch = (id, p) => setRows(rs => rs.map(r => (r.id === id ? { ...r, ...p } : r)))

  const toggle = async r => {
    patch(r.id, { yayinda: !r.yayinda })
    try {
      await updateRow('duyurular', r.id, { yayinda: !r.yayinda })
      invalidateAnnouncements()
    } catch (e) {
      patch(r.id, { yayinda: r.yayinda })
      setError(e.message || 'Güncelleme başarısız.')
    }
  }

  const remove = async r => {
    if (!window.confirm(`"${r.baslik}" duyurusunu silmek istediğinize emin misiniz?`)) return
    try {
      await deleteRow('duyurular', r.id)
      setRows(rs => rs.filter(x => x.id !== r.id))
      invalidateAnnouncements()
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
        <div className="adm-search">
          <Search size={16} />
          <input type="text" placeholder="Başlık, özet veya yer ara…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="adm-filters">
          <select className="adm-select" value={t} onChange={e => setT(e.target.value)} aria-label="Tür">
            <option value="">Tür: Tümü</option>
            <option value="etkinlik">Etkinlik</option>
            <option value="duyuru">Duyuru</option>
          </select>
          <select className="adm-select" value={k} onChange={e => setK(e.target.value)} aria-label="Kategori">
            <option value="">Kategori: Tümü</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="adm-select" value={d} onChange={e => setD(e.target.value)} aria-label="Durum">
            <option value="">Durum: Tümü</option>
            <option value="yayinda">Yayında</option>
            <option value="taslak">Taslak</option>
          </select>
          <select className="adm-select" value={s} onChange={e => setS(e.target.value)} aria-label="Sıralama">
            <option value="new">Yeniden eskiye</option>
            <option value="old">Eskiden yeniye</option>
          </select>
        </div>
        <button className="adm-btn adm-btn-gold adm-btn-auto" onClick={() => setDrawer({ row: null })}>
          <Plus size={15} /><span>Yeni Duyuru</span>
        </button>
      </div>
      <div className="adm-ekip-hint adm-faal-hint">
        <span>{list.length} duyuru</span>
        {active && (
          <button className="adm-clear" onClick={clear}><X size={13} /> Filtreleri temizle</button>
        )}
      </div>
      {error && <p className="adm-error">{error}</p>}

      {list.length === 0 ? (
        <div className="adm-state adm-glass"><span>Bu kriterlere uygun duyuru yok.</span></div>
      ) : (
        <div className="adm-glass adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Başlık</th><th>Tür</th><th>Kategori</th><th>Yayın</th><th>Etkinlik</th><th>Son Başvuru</th><th>Kontenjan</th><th>Durum</th><th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {list.map(r => {
                const kn = kont[r.id]
                const dolu = kn?.dolu
                return (
                  <tr key={r.id} onClick={() => setDrawer({ row: r })}>
                    <td className="adm-cell-wrap">
                      <strong>{r.baslik}</strong>
                      <span className="adm-dim adm-slug">{r.slug}</span>
                    </td>
                    <td>
                      <span className={`adm-badge ${r.tur === 'etkinlik' ? 'adm-badge-tur' : 'adm-badge-false'}`}>
                        {r.tur === 'etkinlik' ? 'Etkinlik' : 'Duyuru'}
                      </span>
                    </td>
                    <td>{r.kategori}</td>
                    <td>{formatDate(r.yayin_tarihi)}</td>
                    <td>{r.etkinlik_tarihi ? formatDate(r.etkinlik_tarihi) : '—'}</td>
                    <td>{r.son_basvuru ? formatDate(r.son_basvuru) : '—'}</td>
                    <td>
                      {r.tur === 'etkinlik' && r.kontenjan ? (
                        <div className="adm-quota">
                          <span>{(kn?.onaylanan ?? 0)} / {r.kontenjan}</span>
                          <div className="adm-quota-bar">
                            <div className="adm-quota-fill" style={{ width: `${Math.min(100, ((kn?.onaylanan ?? 0) / r.kontenjan) * 100)}%` }} />
                          </div>
                          {dolu && <span className="adm-badge adm-badge-reddedildi">Doldu</span>}
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`adm-badge ${r.yayinda ? 'adm-badge-true' : 'adm-badge-false'}`}>
                        {r.yayinda ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td>
                      <div className="adm-row-actions">
                        <button className="adm-icon-btn" onClick={e => { e.stopPropagation(); toggle(r) }} aria-label="Yayın durumunu değiştir">{r.yayinda ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                        <button className="adm-icon-btn" onClick={e => { e.stopPropagation(); setDrawer({ row: r }) }} aria-label="Düzenle"><Pencil size={15} /></button>
                        {r.tur === 'etkinlik' && (
                          <button className="adm-icon-btn" onClick={e => { e.stopPropagation(); navigate(`/yonetim/etkinlikler?duyuru=${r.id}`) }} aria-label="Başvurular"><Users size={15} /></button>
                        )}
                        <button className="adm-icon-btn adm-icon-btn-danger" onClick={e => { e.stopPropagation(); remove(r) }} aria-label="Sil"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <DuyuruForm
        open={drawer !== null}
        row={drawer?.row || null}
        onClose={() => setDrawer(null)}
        onSaved={onSaved}
      />
    </motion.div>
  )
}
