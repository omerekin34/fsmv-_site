import DataTable from '../components/DataTable.jsx'

const durumOptions = [
  { value: 'beklemede', label: 'Beklemede' },
  { value: 'mulakat', label: 'Mülakat' },
  { value: 'onaylandi', label: 'Onaylandı' },
  { value: 'reddedildi', label: 'Reddedildi' },
]

const columns = [
  { key: 'ad_soyad', label: 'Ad Soyad' },
  { key: 'ogrenci_no', label: 'Öğrenci No' },
  { key: 'bolum', label: 'Bölüm' },
  { key: 'sinif', label: 'Sınıf' },
  { key: 'telefon', label: 'Telefon', hideInTable: true },
  { key: 'email', label: 'E-posta' },
  { key: 'komite', label: 'Komite', hideInTable: true },
  { key: 'motivasyon', label: 'Motivasyon', hideInTable: true },
  { key: 'kvkk_onay', label: 'KVKK', type: 'bool', hideInTable: true },
  { key: 'durum', label: 'Durum', type: 'badge', options: durumOptions },
  { key: 'admin_notu', label: 'Yönetici Notu', hideInTable: true },
  { key: 'created_at', label: 'Tarih', type: 'date' },
]

export default function Uyeler() {
  return (
    <DataTable
      table="uyeler"
      columns={columns}
      statusField="durum"
      statusOptions={durumOptions}
      searchKeys={['ad_soyad', 'email', 'ogrenci_no']}
      hasAdminNote
    />
  )
}
