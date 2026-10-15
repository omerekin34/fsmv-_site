// Kulübün kuruluş yılı: 2026 itibarıyla 6 yıllık deneyim, her yıl otomatik artar
const FOUNDING_YEAR = 2020
const yearsOfExperience = new Date().getFullYear() - FOUNDING_YEAR

export const buildStats = activityCount => [
  { id: 1, value: 500, suffix: '+', label: 'Aktif Üye' },
  { id: 2, value: activityCount, suffix: '+', label: 'Gerçekleştirilen Etkinlik' },
  { id: 3, value: yearsOfExperience, suffix: '+', label: 'Yıllık Deneyim' },
]
