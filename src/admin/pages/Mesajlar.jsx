import DataTable from '../components/DataTable.jsx'

const okunduOptions = [
  { value: 'false', label: 'Okunmadı' },
  { value: 'true', label: 'Okundu' },
]

const columns = [
  { key: 'ad_soyad', label: 'Ad Soyad' },
  { key: 'email', label: 'E-posta' },
  { key: 'konu', label: 'Konu' },
  { key: 'mesaj', label: 'Mesaj', hideInTable: true },
  { key: 'okundu', label: 'Durum', type: 'badge', options: okunduOptions },
  { key: 'created_at', label: 'Tarih', type: 'date' },
]

export default function Mesajlar() {
  return (
    <DataTable
      table="iletisim_mesajlari"
      columns={columns}
      statusField="okundu"
      statusOptions={okunduOptions}
      searchKeys={['ad_soyad', 'email', 'konu']}
    />
  )
}
