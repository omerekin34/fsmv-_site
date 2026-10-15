import DataTable from '../components/DataTable.jsx'

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
  return (
    <DataTable
      table="etkinlik_basvurulari"
      columns={columns}
      statusField="durum"
      statusOptions={durumOptions}
      searchKeys={['ad_soyad', 'email', 'ogrenci_no']}
    />
  )
}
