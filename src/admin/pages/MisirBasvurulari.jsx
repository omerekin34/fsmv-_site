import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import DataTable from '../components/DataTable.jsx'
import { fetchRows } from '../api.js'

const durumOptions = [
  { value: 'beklemede', label: 'Beklemede' },
  { value: 'iletisime_gecildi', label: 'İletişime Geçildi' },
  { value: 'kesinlesti', label: 'Kesinleşti' },
  { value: 'iptal', label: 'İptal' },
]

const columns = [
  { key: 'ad_soyad', label: 'Ad Soyad' },
  { key: 'ogrenci_no', label: 'Öğrenci No' },
  { key: 'sinif', label: 'Sınıf' },
  { key: 'telefon', label: 'Telefon', hideInTable: true },
  { key: 'email', label: 'E-posta' },
  { key: 'pasaport', label: 'Pasaport', hideInTable: true },
  { key: 'yurtdisi', label: 'Yurt Dışı', hideInTable: true },
  { key: 'heyecan', label: 'Heyecanlandıran', type: 'array', hideInTable: true },
  { key: 'oda_tercihi', label: 'Oda Tercihi', hideInTable: true },
  { key: 'saglik_notu', label: 'Sağlık Notu', hideInTable: true },
  { key: 'kaynak', label: 'Kaynak', hideInTable: true },
  { key: 'ek_not', label: 'Ek Not', hideInTable: true },
  { key: 'kvkk_onay', label: 'KVKK', type: 'bool', hideInTable: true },
  { key: 'durum', label: 'Durum', type: 'badge', options: durumOptions },
  { key: 'admin_notu', label: 'Yönetici Notu', hideInTable: true },
  { key: 'created_at', label: 'Tarih', type: 'date' },
]

export default function MisirBasvurulari() {
  const [kontenjan, setKontenjan] = useState(null)
  const [kesinlesen, setKesinlesen] = useState(0)

  useEffect(() => {
    let alive = true
    fetchRows('misir_turu_ayarlar', { order: 'id' })
      .then(rows => {
        if (!alive) return
        const r = rows.find(x => x.id === 1) || rows[0]
        setKontenjan(r?.kontenjan ?? null)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const onRows = useCallback(rows => {
    setKesinlesen(rows.filter(r => r.durum === 'kesinlesti').length)
  }, [])

  const dolu = kontenjan != null && kesinlesen >= kontenjan
  const pct = kontenjan ? Math.min(100, (kesinlesen / kontenjan) * 100) : 0

  return (
    <div>
      <div className="adm-glass adm-misir-strip">
        <span className="adm-ev-quota">
          <span>Kesinleşen {kesinlesen} / {kontenjan ?? '∞'}</span>
          <span className="adm-quota-bar">
            <span className="adm-quota-fill" style={{ width: `${pct}%` }} />
          </span>
        </span>
        {dolu && <span className="adm-badge adm-badge-reddedildi">Doldu</span>}
        <Link to="/yonetim/misir-turu" className="adm-misir-settings-link">
          <Settings2 size={14} /><span>Tur Ayarları</span>
        </Link>
      </div>

      <DataTable
        table="misir_turu_basvurulari"
        columns={columns}
        statusField="durum"
        statusOptions={durumOptions}
        searchKeys={['ad_soyad', 'email', 'ogrenci_no']}
        hasAdminNote
        onRows={onRows}
      />
    </div>
  )
}
