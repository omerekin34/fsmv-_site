const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const monthsLong = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

export const announcements = [
  {
    id: 8,
    slug: 'guz-donemi-hukuk-semineri',
    dateISO: '2026-10-14',
    title: 'Güz Dönemi Hukuk Semineri: Anayasa Yargısında Güncel Gelişmeler',
    desc: 'Anayasa Mahkemesi raportörlerinin konuk olacağı güz dönemi seminerimiz için kayıtlar açıldı.',
    category: 'Kariyer',
    isEvent: true,
    eventDateISO: '2026-11-05',
    eventTime: '14:00',
    location: 'FSMVÜ Hukuk Fakültesi, Amfi 2',
    deadlineISO: '2026-11-03',
    quota: 120,
    content: [
      'Güz dönemi hukuk seminerimizde bu yıl anayasa yargısındaki güncel gelişmeleri ele alıyoruz. Anayasa Mahkemesi raportörleri ve akademisyenlerin katılacağı seminerde bireysel başvuru usulü, norm denetimi ve güncel içtihatlar tartışılacak.',
      'Seminer iki oturumdan oluşacak; ilk oturumda bireysel başvuruya ilişkin usul ve esaslar, ikinci oturumda ise güncel AYM kararlarının uygulamaya yansımaları değerlendirilecek. Oturumların ardından soru-cevap bölümü yapılacaktır.',
      'Katılım ücretsizdir ancak salon kapasitesi nedeniyle kayıt zorunludur. Tüm katılımcılara dijital katılım belgesi gönderilecektir.',
    ],
    details: [
      'Tüm fakülte öğrencilerine açıktır, kulüp üyeliği şartı yoktur.',
      'Katılım belgesi için her iki oturuma da katılım gereklidir.',
      'Kayıtlar 3 Kasım 2026 tarihinde kapanacaktır.',
      'Program akışı kayıt olanlara e-posta ile iletilecektir.',
    ],
    contact: 'hukukkulubu@fsm.edu.tr',
  },
  {
    id: 1,
    slug: 'ix-kurgusal-durusma-yarismasi',
    dateISO: '2026-10-08',
    title: 'IX. Kurgusal Duruşma Yarışması Başvuruları Açıldı',
    desc: 'Bu yıl ceza hukuku temalı kurgusal duruşma yarışmamız için takım başvuruları başladı. Kontenjan sınırlıdır.',
    category: 'Yarışma',
    isEvent: true,
    eventDateISO: '2026-12-05',
    eventTime: '10:00',
    location: 'FSMVÜ Hukuk Fakültesi, Konferans Salonu',
    deadlineISO: '2026-11-15',
    quota: 40,
    content: [
      'Geleneksel hâle gelen Kurgusal Duruşma Yarışmamızın dokuzuncusu bu yıl ceza hukuku temasıyla düzenleniyor. Katılımcı takımlar, kurgusal bir dosya üzerinden iddia ve savunma makamı olarak duruşma pratiği yapma imkânı bulacak.',
      'Yarışmaya 2 veya 3 kişilik takımlar hâlinde başvuru yapılabilir. Başvurusu kabul edilen takımlara yarışma dosyası ve yazılı dilekçe takvimi e-posta ile iletilecektir. Jüri, alanında deneyimli akademisyenler ve uygulamacı hukukçulardan oluşacaktır.',
      'Final turu ödül töreniyle sona erecek olup dereceye giren takımlara çeşitli hukuk yayınları ve staj imkânları sunulacaktır.',
    ],
    details: [
      'Başvurular 2 veya 3 kişilik takımlar hâlinde yapılır.',
      'Son başvuru tarihi 15 Kasım 2026’dır.',
      'Kontenjan 40 takımla sınırlıdır; başvurular değerlendirme sırasına göre kabul edilir.',
      'Yazılı dilekçe formatı ve puanlama kriterleri kabul edilen takımlara gönderilecektir.',
      'Eleme ve final turları 5 Aralık 2026’da fakülte konferans salonunda yapılacaktır.',
    ],
    contact: 'hukukkulubu@fsm.edu.tr',
  },
  {
    id: 5,
    slug: 'hukuk-kutuphanesi-calisma-saatleri',
    dateISO: '2026-10-05',
    title: 'Hukuk Kütüphanesi Çalışma Saatleri',
    desc: 'Kulüp çalışma odamızın dönem içi kullanım saatleri güncellenmiştir. Hafta içi 09.00–18.00 arası açıktır.',
    category: 'Genel',
    isEvent: false,
    content: [
      'Kulüp çalışma odamızın 2026–2027 güz dönemi kullanım saatleri güncellenmiştir. Oda, hafta içi her gün 09.00 ile 18.00 saatleri arasında tüm üyelerimizin kullanımına açıktır.',
      'Sınav dönemlerinde çalışma odasının açık kalma saati, talep yoğunluğuna göre 21.00’e kadar uzatılabilir. Güncel saat değişiklikleri kulübümüzün duyuru kanallarından paylaşılacaktır.',
      'Oda kullanımı sırasında sessizlik kurallarına uyulmasını ve ortak materyallerin yerine bırakılmasını rica ederiz.',
    ],
    details: [
      'Hafta içi 09.00–18.00 arası açıktır; hafta sonu kapalıdır.',
      'Sınav dönemlerinde saatler uzatılabilir.',
      'Kütüphane materyalleri oda dışına çıkarılamaz.',
      'Grup çalışması için rezervasyon yönetim kurulundan yapılabilir.',
    ],
  },
  {
    id: 2,
    slug: 'misir-hukuk-ve-kultur-turu',
    dateISO: '2026-10-01',
    title: 'Mısır Hukuk ve Kültür Turu Kayıtları',
    desc: 'Kahire ve Luksor’u kapsayan hukuk temalı kültür turumuza katılım başvuruları alınmaya başlandı.',
    category: 'Gezi',
    isEvent: true,
    eventDateISO: '2027-01-25',
    eventTime: '09:00',
    location: 'Kahire – Luksor, Mısır',
    deadlineISO: '2026-11-30',
    quota: 30,
    content: [
      'Geleneksel yurt dışı gezimiz bu yıl Mısır’a düzenleniyor. 6 gün sürecek programda Kahire Üniversitesi Hukuk Fakültesi ziyareti, Kahire’de hukuk müzeleri ve tabii ki Giza Piramitleri ile Luksor’un tarihî mekânları yer alıyor.',
      'Gezi ücrete tabidir; ücrete ulaşım, konaklama, kahvaltı ve programdaki rehberli turlar dâhildir. Ödeme iki taksit hâlinde yapılabilir. Pasaport süresi geziden itibaren en az 6 ay geçerli olmalıdır.',
      'Kontenjan 30 kişiyle sınırlıdır ve başvurular üyelik önceliğine göre değerlendirilecektir.',
    ],
    details: [
      'Başvurular 30 Kasım 2026’da kapanacaktır; kontenjan 30 kişidir.',
      'Pasaportun gezi tarihinden itibaren en az 6 ay geçerli olması gerekir.',
      'Ücrete ulaşım, konaklama, kahvaltı ve rehberli turlar dâhildir.',
      'Ödemeler iki taksit hâlinde yapılabilir.',
      '18 yaş altı öğrenciler veli izin belgesi ile katılabilir.',
    ],
    contact: 'hukukkulubu@fsm.edu.tr',
  },
  {
    id: 4,
    slug: 'donem-ici-uye-alimi-sonuclari',
    dateISO: '2026-09-30',
    title: 'Dönem İçi Üye Alımı Sonuçları',
    desc: 'Dönem içi üye alım mülakat sonuçları açıklanmıştır. Sonuçlar e-posta yoluyla bildirilmiştir.',
    category: 'Üyelik',
    isEvent: false,
    validUntilISO: '2026-10-05',
    content: [
      'Eylül ayında yapılan dönem içi üye alım mülakatlarının sonuçları açıklanmıştır. Değerlendirme, başvuru formu ve mülakat performansı esas alınarak yapılmıştır.',
      'Kabul edilen adaylara sonuçlar e-posta yoluyla bildirilmiş olup oryantasyon toplantısı daveti ayrıca iletilecektir. Bu duyuru 5 Ekim 2026 tarihine kadar geçerlidir; itirazlar bu tarihe kadar yapılabilir.',
    ],
    details: [
      'Sonuçlar başvuruda belirtilen e-posta adreslerine gönderilmiştir.',
      'E-posta ulaşmayan adaylar spam klasörünü kontrol etmelidir.',
      'İtirazlar 5 Ekim 2026’ya kadar yapılabilir.',
      'Bir sonraki üye alımı bahar döneminde yapılacaktır.',
    ],
    contact: 'hukukkulubu@fsm.edu.tr',
  },
  {
    id: 3,
    slug: 'staj-ve-kariyer-gunleri',
    dateISO: '2026-09-28',
    title: 'Staj ve Kariyer Günleri Etkinliği',
    desc: 'Önde gelen hukuk bürolarının katılacağı kariyer günleri etkinliğimiz için kayıt yaptırmayı unutmayın.',
    category: 'Kariyer',
    isEvent: true,
    eventDateISO: '2026-10-28',
    eventTime: '10:00',
    location: 'FSMVÜ Merkez Kampüs, Fuaye Alanı',
    deadlineISO: '2026-10-10',
    quota: 200,
    content: [
      'Staj ve Kariyer Günleri etkinliğimizde önde gelen hukuk büroları, kurumsal şirketlerin hukuk departmanları ve kamu kurumları temsilcileri öğrencilerle buluşuyor. Etkinlikte stant görüşmelerinin yanı sıra panel oturumları ve CV değerlendirme stantları da yer alacak.',
      'Katılımcılar, temsil ettikleri kurumun staj programları hakkında bilgi alabilecek ve başvuru süreçlerine ilişkin sorularını doğrudan yetkililere iletebileceklerdir.',
    ],
    details: [
      'Etkinlik tüm hukuk fakültesi öğrencilerine açıktır.',
      'CV’nizi yanınızda getirmeniz önerilir; değerlendirme stantları ücretsizdir.',
      'Panel oturumları salon kapasitesiyle sınırlıdır.',
    ],
  },
  {
    id: 6,
    slug: 'yeni-yonetim-kurulu-secildi',
    dateISO: '2026-09-15',
    title: 'Yeni Yönetim Kurulu Seçildi',
    desc: 'Olağan genel kurul toplantımızda 2026–2027 dönemi yönetim kurulumuz belirlenmiştir. Tüm üyelerimize teşekkür ederiz.',
    category: 'Yönetim',
    isEvent: false,
    content: [
      'Olağan genel kurul toplantımızda 2026–2027 akademik yılı yönetim kurulumuz belirlenmiştir. Toplantıya katılan tüm üyelerimize ve görev üstlenen arkadaşlarımıza teşekkür ederiz.',
      'Yeni yönetim kurulumuz; akademik etkinlikler, sosyal sorumluluk projeleri ve üyeler arası iletişimi güçlendirmeyi hedefleyen bir çalışma programıyla göreve başlamıştır.',
      'Yönetim kurulu listesi ve çalışma komiteleri kulüp panosunda ve dijital kanallarımızda ilan edilmiştir.',
    ],
    details: [
      'Yönetim kurulu 7 asil 5 yedek üyeden oluşmaktadır.',
      'Çalışma komiteleri için üye başvuruları devam etmektedir.',
      'Genel kurul tutanağı üyelerimizin erişimine açıktır.',
    ],
  },
  {
    id: 7,
    slug: 'oryantasyon-bulusmasi',
    dateISO: '2026-09-10',
    title: 'Oryantasyon Buluşması',
    desc: 'Yeni üyelerimize ve birinci sınıf öğrencilerimize yönelik tanışma ve oryantasyon buluşmamız gerçekleşti.',
    category: 'Üyelik',
    isEvent: true,
    eventDateISO: '2026-09-25',
    eventTime: '13:30',
    location: 'FSMVÜ Hukuk Fakültesi, Bahçe',
    deadlineISO: '2026-09-22',
    quota: 150,
    content: [
      'Yeni akademik yılın ilk buluşması olan oryantasyon etkinliğimizde kulübümüzü, çalışma komitelerimizi ve yıl içi programımızı tanıttık. Katılan tüm üyelerimize ve birinci sınıf öğrencilerimize teşekkür ederiz.',
      'Etkinlikte komite tanıtımları, soru-cevap oturumu ve tanışma oyunları yer aldı.',
    ],
    details: [
      'Etkinlik 25 Eylül 2026’da gerçekleşmiştir.',
      'Katılım serbestti; komite başvuruları etkinlik sonrasında da devam etmektedir.',
    ],
  },
]

announcements.sort((a, b) => b.dateISO.localeCompare(a.dateISO))

export function dateParts(iso) {
  const [year, month, day] = iso.split('-')
  return { day, month: months[Number(month) - 1], year }
}

export function formatDate(iso) {
  const [year, month, day] = iso.split('-')
  return `${Number(day)} ${monthsLong[Number(month) - 1]} ${year}`
}

export const getAnnouncement = slug => announcements.find(a => a.slug === slug)

const endOfDay = iso => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 23, 59, 59, 999)
}

export function getStatus(a, now = new Date()) {
  if (a.isEvent) {
    const limit = a.deadlineISO || a.eventDateISO
    if (endOfDay(a.eventDateISO) < now) return 'past'
    if (endOfDay(limit) < now) return 'closed'
    return 'open'
  }
  if (a.validUntilISO && endOfDay(a.validUntilISO) < now) return 'expired'
  return 'info'
}

export const statusLabel = {
  open: 'Başvurular Açık',
  closed: 'Başvurular Kapandı',
  past: 'Etkinlik Sona Erdi',
  expired: 'Süresi Doldu',
  info: 'Duyuru',
}

export const isActive = a => ['open', 'info'].includes(getStatus(a))

export const daysUntil = (iso, now = new Date()) =>
  Math.ceil((endOfDay(iso) - now) / 86400000)
