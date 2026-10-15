import DataTable from '../components/DataTable.jsx'

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

export default function MisirTuruAdmin() {
  return (
    <DataTable
      table="misir_turu_basvurulari"
      columns={columns}
      statusField="durum"
      statusOptions={durumOptions}
      searchKeys={['ad_soyad', 'email', 'ogrenci_no']}
      hasAdminNote
    />
  )
}
