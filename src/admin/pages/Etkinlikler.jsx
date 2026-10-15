import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DataTable from '../components/DataTable.jsx'
import { fetchRows } from '../api.js'
import { formatDate } from '../../lib/announcements.js'

const durumOptions = [
  { value: 'beklemede', label: 'Beklemede' },
  { value: 'onaylandi', label: 'Onaylandı' },
  { value: 'reddedildi', label: 'Reddedildi' },
]

const columns = [
  { key: 'ad_soyad', label: 'Ad Soyad' },
  { key: 'ogrenci_no', label: 'Öğrenci No' },
  { key: 'telefon', label: 'Telefon', hideInTable: true },
  { key: 'email', label: 'E-posta' },
  { key: 'etkinlik', label: 'Etkinlik' },
  { key: 'not_metni', label: 'Not', hideInTable: true },
  { key: 'durum', label: 'Durum', type: 'badge', options: durumOptions },
  { key: 'created_at', label: 'Tarih', type: 'date' },
]

export default function Etkinlikler() {
  const [params, setParams] = useSearchParams()
  const [events, setEvents] = useState(null)
  const [kont, setKont] = useState({})
  const [error, setError] = useState('')
  const sel = params.get('duyuru') || ''

  const loadKont = useCallback(() =>
    fetchRows('duyuru_kontenjan', { order: 'duyuru_id' })
      .then(kn => setKont(Object.fromEntries(kn.map(x => [x.duyuru_id, x]))))
      .catch(e => setError(e.message || 'Kontenjan verileri alınamadı.')), [])

  useEffect(() => {
    let alive = true
    Promise.all([
      fetchRows('duyurular', { order: 'yayin_tarihi', ascending: false }),
      fetchRows('duyuru_kontenjan', { order: 'duyuru_id' }),
    ])
      .then(([ds, kn]) => {
        if (!alive) return
        setEvents(ds.filter(d => d.tur === 'etkinlik'))
        setKont(Object.fromEntries(kn.map(x => [x.duyuru_id, x])))
      })
      .catch(e => { if (alive) setError(e.message || 'Veriler alınamadı.') })
    return () => { alive = false }
  }, [])

  const onRows = useCallback(() => { loadKont() }, [loadKont])

  const pick = id => setParams(id ? { duyuru: id } : {})

  const rowFilter = useCallback(row => !sel || row.duyuru_id === sel, [sel])

  const selected = events?.find(e => e.id === sel)

  return (
    <div>
      {error && <p className="adm-error">{error}</p>}
      {!events ? (
        <div className="adm-state adm-glass"><div className="adm-spinner" /><span>Yükleniyor…</span></div>
      ) : (
        <div className="adm-ev-cards">
          <button
            className={`adm-ev-card adm-glass${!sel ? ' active' : ''}`}
            onClick={() => pick('')}
          >
            <strong>Tümü</strong>
            <span className="adm-dim">Tüm başvurular</span>
          </button>
          {events.map(e => {
            const kn = kont[e.id]
            const onayli = kn?.onaylanan ?? 0
            return (
              <button
                key={e.id}
                className={`adm-ev-card adm-glass${sel === e.id ? ' active' : ''}`}
                onClick={() => pick(e.id)}
              >
                <strong>{e.baslik}</strong>
                <span className="adm-dim">
                  {e.etkinlik_tarihi ? formatDate(e.etkinlik_tarihi) : '—'}
                  {e.son_basvuru ? ` · Son: ${formatDate(e.son_basvuru)}` : ''}
                </span>
                {e.kontenjan ? (
                  <span className="adm-ev-quota">
                    <span>{onayli} / {e.kontenjan}{(kn?.bekleyen ?? 0) > 0 ? ` · ${kn.bekleyen} bekleyen` : ''}</span>
                    <span className="adm-quota-bar">
                      <span className="adm-quota-fill" style={{ width: `${Math.min(100, (onayli / e.kontenjan) * 100)}%` }} />
                    </span>
                  </span>
                ) : (
                  <span className="adm-dim">{onayli} onaylı{(kn?.bekleyen ?? 0) > 0 ? ` · ${kn.bekleyen} bekleyen` : ''}</span>
                )}
                {kn?.dolu && <span className="adm-badge adm-badge-reddedildi">Doldu</span>}
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="adm-ev-selected">
          <span className="adm-badge adm-badge-tur">{selected.baslik}</span>
        </div>
      )}

      <DataTable
        table="etkinlik_basvurulari"
        columns={columns}
        statusField="durum"
        statusOptions={durumOptions}
        searchKeys={['ad_soyad', 'email', 'ogrenci_no']}
        rowFilter={rowFilter}
        onRows={onRows}
      />
    </div>
  )
}
