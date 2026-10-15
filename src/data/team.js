const person = (name, role, img, linkedin, mail) => ({
  name, role, img: `https://i.pravatar.cc/300?img=${img}`, linkedin, mail,
})

export const board = [
  person('Elif Aydın', 'Kulüp Başkanı', 47, 'https://linkedin.com', 'mailto:elif.aydin@fsm.edu.tr'),
  person('Mert Kaya', 'Başkan Yardımcısı', 12, 'https://linkedin.com', 'mailto:mert.kaya@fsm.edu.tr'),
  person('Zeynep Demir', 'Genel Sekreter', 44, 'https://linkedin.com', 'mailto:zeynep.demir@fsm.edu.tr'),
  person('Emre Şahin', 'Sayman', 15, 'https://linkedin.com', 'mailto:emre.sahin@fsm.edu.tr'),
  person('Selin Yıldız', 'Başkan Danışmanı', 25, 'https://linkedin.com', 'mailto:selin.yildiz@fsm.edu.tr'),
]

export const departments = [
  person('Kerem Aksoy', 'Akademik Komite Başkanı', 33, 'https://linkedin.com', 'mailto:kerem.aksoy@fsm.edu.tr'),
  person('Derya Koç', 'Etkinlik Komitesi Başkanı', 31, 'https://linkedin.com', 'mailto:derya.koc@fsm.edu.tr'),
  person('Burak Öztürk', 'Sosyal Medya & Tasarım Başkanı', 56, 'https://linkedin.com', 'mailto:burak.ozturk@fsm.edu.tr'),
  person('İrem Çelik', 'Sponsorluk Başkanı', 20, 'https://linkedin.com', 'mailto:irem.celik@fsm.edu.tr'),
  person('Onur Erdoğan', 'Kurgusal Duruşma Başkanı', 60, 'https://linkedin.com', 'mailto:onur.erdogan@fsm.edu.tr'),
  person('Melis Arslan', 'Halkla İlişkiler Başkanı', 9, 'https://linkedin.com', 'mailto:melis.arslan@fsm.edu.tr'),
]
