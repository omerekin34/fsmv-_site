import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, EyeOff, Pencil, Trash2, Plus, X } from 'lucide-react'
import { fetchRows, updateRow, deleteRow } from '../api.js'
import { months, formatDate, invalidateActivities } from '../../lib/activities.js'
import { toast } from '../toast.js'
import FaaliyetForm from '../components/FaaliyetForm.jsx'
import KategoriForm from '../components/KategoriForm.jsx'

const trLower = s => (s || '').toLocaleLowerCase('tr')

export default function Faaliyetler() {
  const [rows, setRows] = useState(null)
  const [cats, setCats] = useState([])
  const [error, setError] = useState('')
  const [drawer, setDrawer] = useState(null)
  const [catDrawer, setCatDrawer] = useState(false)
  const [q, setQ] = useState('')
  const [k, setK] = useState('')
  const [y, setY] = useState('')
  const [m, setM] = useState('')
  const [d, setD] = useState('')
  const [s, setS] = useState('new')

  useEffect(() => {
    let alive = true
    Promise.all([
      fetchRows('faaliyetler', { order: 'tarih', ascending: false }),
      fetchRows('faaliyet_kategorileri', { order: 'sira', ascending: true }),
    ])
      .then(([f, c]) => { if (alive) { setRows(f); setCats(c) } })
      .catch(e => { if (alive) setError(e.message || 'Veriler alınamadı.') })
    return () => { alive = false }
  }, [])

  const years = useMemo(() => [...new Set((rows || []).map(r => r.tarih.slice(0, 4)))].sort().reverse(), [rows])

  const list = useMemo(() => {
    const needle = trLower(q.trim())
    const filtered = (rows || []).filter(r => {
      if (k && r.kategori !== k) return false
      if (y && r.tarih.slice(0, 4) !== y) return false
      if (m && r.tarih.slice(5, 7) !== String(m).padStart(2, '0')) return false
      if (d === 'yayinda' && !r.yayinda) return false
      if (d === 'taslak' && r.yayinda) return false
      if (needle && !trLower(`${r.baslik} ${r.ozet} ${r.yer}`).includes(needle)) return false
      return true
    })
    return [...filtered].sort((a, b) => s === 'old' ? a.tarih.localeCompare(b.tarih) : b.tarih.localeCompare(a.tarih))
  }, [rows, q, k, y, m, d, s])

  const active = q || k || y || m || d || s !== 'new'
  const clear = () => { setQ(''); setK(''); setY(''); setM(''); setD(''); setS('new') }

  const patch = (id, p) => setRows(rs => rs.map(r => (r.id === id ? { ...r, ...p } : r)))

  const toggle = async r => {
    patch(r.id, { yayinda: !r.yayinda })
    try {
      await updateRow('faaliyetler', r.id, { yayinda: !r.yayinda })
      invalidateActivities()
      toast.success(r.yayinda ? 'Taslağa alındı.' : 'Yayına alındı.')
    } catch (e) {
      patch(r.id, { yayinda: r.yayinda })
      setError(e.message || 'Güncelleme başarısız.')
      toast.error(e.message || 'Güncelleme başarısız.')
    }
  }

  const remove = async r => {
    if (!window.confirm(`"${r.baslik}" faaliyetini silmek istediğinize emin misiniz?`)) return
    try {
      await deleteRow('faaliyetler', r.id)
      setRows(rs => rs.filter(x => x.id !== r.id))
      invalidateActivities()
      toast.success('Faaliyet silindi.')
    } catch (e) {
      setError(e.message || 'Silme başarısız.')
      toast.error(e.message || 'Silme başarısız.')
    }
  }

  const onSaved = row => {
    setRows(rs => {
      const exists = rs.some(r => r.id === row.id)
      return exists ? rs.map(r => (r.id === row.id ? row : r)) : [...rs, row]
    })
  }

  const onRenamed = (oldAd, newAd) => {
    setRows(rs => rs.map(r => (r.kategori === oldAd ? { ...r, kategori: newAd } : r)))
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
          <select className="adm-select" value={k} onChange={e => setK(e.target.value)} aria-label="Kategori">
            <option value="">Kategori: Tümü</option>
            {cats.map(c => <option key={c.id} value={c.ad}>{c.ad}</option>)}
          </select>
          <select className="adm-select" value={y} onChange={e => setY(e.target.value)} aria-label="Yıl">
            <option value="">Yıl: Tümü</option>
            {years.map(yy => <option key={yy} value={yy}>{yy}</option>)}
          </select>
          <select className="adm-select" value={m} onChange={e => setM(e.target.value)} aria-label="Ay">
            <option value="">Ay: Tümü</option>
            {months.map((mm, i) => <option key={mm} value={i + 1}>{mm}</option>)}
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
        <button className="adm-btn adm-btn-outline" onClick={() => setCatDrawer(true)}><span>Kategoriler</span></button>
        <button className="adm-btn adm-btn-gold adm-btn-auto" onClick={() => setDrawer({ row: null })}>
          <Plus size={15} /><span>Yeni Faaliyet</span>
        </button>
      </div>
      <div className="adm-ekip-hint adm-faal-hint">
        <span>{list.length} faaliyet</span>
        {active && (
          <button className="adm-clear" onClick={clear}><X size={13} /> Filtreleri temizle</button>
        )}
      </div>
      {error && <p className="adm-error">{error}</p>}

      {list.length === 0 ? (
        <div className="adm-state adm-glass"><span>Bu kriterlere uygun faaliyet yok.</span></div>
      ) : (
        <div className="adm-glass adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Görsel</th><th>Başlık</th><th>Kategori</th><th>Tarih</th><th>Yer</th><th>Katılımcı</th><th>Durum</th><th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {list.map(r => (
                <tr key={r.id} onClick={() => setDrawer({ row: r })}>
                  <td>
                    {r.kapak_url
                      ? <img className="adm-thumb" src={r.kapak_url} alt="" loading="lazy" />
                      : <div className="adm-thumb adm-thumb-empty" />}
                  </td>
                  <td className="adm-cell-wrap">
                    <strong>{r.baslik}</strong>
                    <span className="adm-dim adm-slug">{r.slug}</span>
                  </td>
                  <td><span className="adm-badge adm-badge-tur">{r.kategori}</span></td>
                  <td>{formatDate(r.tarih)}</td>
                  <td className="adm-cell-wrap">{r.yer || '—'}</td>
                  <td>{r.katilimci}</td>
                  <td>
                    <span className={`adm-badge ${r.yayinda ? 'adm-badge-true' : 'adm-badge-false'}`}>
                      {r.yayinda ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <button className="adm-icon-btn" onClick={e => { e.stopPropagation(); toggle(r) }} aria-label="Yayın durumunu değiştir">{r.yayinda ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                      <button className="adm-icon-btn" onClick={e => { e.stopPropagation(); setDrawer({ row: r }) }} aria-label="Düzenle"><Pencil size={15} /></button>
                      <button className="adm-icon-btn adm-icon-btn-danger" onClick={e => { e.stopPropagation(); remove(r) }} aria-label="Sil"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FaaliyetForm
        open={drawer !== null}
        row={drawer?.row || null}
        categories={cats}
        onClose={() => setDrawer(null)}
        onSaved={onSaved}
      />
      <KategoriForm
        open={catDrawer}
        categories={cats}
        setCategories={setCats}
        onRenamed={onRenamed}
        onClose={() => setCatDrawer(false)}
      />
    </motion.div>
  )
}
