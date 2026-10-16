import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Save, ExternalLink, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2, X, Upload } from 'lucide-react'
import { fetchRows, updateRow, uploadPublicFile } from '../api.js'
import { fetchMisirTuru, misirStatus, misirStatusLabel, invalidateMisirTuru, misirTuruFallback, withDefaults } from '../../lib/misirTuru.js'
import { toast } from '../toast.js'
import DateInput from '../components/DateInput.jsx'
import ListEditor from '../components/ListEditor.jsx'

const tabs = [
  { key: 'basvuru', label: 'Başvuru & Kontenjan' },
  { key: 'genel', label: 'Genel' },
  { key: 'one_cikanlar', label: 'Öne Çıkanlar' },
  { key: 'program', label: 'Program' },
  { key: 'konaklama', label: 'Konaklama & Ulaşım' },
  { key: 'rota', label: 'Rota' },
  { key: 'dahil', label: 'Dahil / Dahil Değil' },
  { key: 'galeri', label: 'Galeri' },
  { key: 'sss', label: 'SSS' },
  { key: 'cta', label: 'Alt Çağrı (CTA)' },
]

const arr = v => (Array.isArray(v) ? v : [])
const rows = v => (Array.isArray(v) ? v : [])

const toForm = w => ({
  kontenjan: w.kontenjan != null ? String(w.kontenjan) : '',
  son_basvuru: w.son_basvuru ?? '',
  basvuru_acik: w.basvuru_acik ?? true,
  ucret: w.ucret ?? '',
  tur_baslangic: w.tur_baslangic ?? '',
  tur_bitis: w.tur_bitis ?? '',
  sure_metni: w.sure_metni ?? '',
  hero_ust_baslik: w.hero_ust_baslik ?? '',
  baslik: w.baslik ?? '',
  aciklama: w.aciklama ?? '',
  hero_gorsel: w.hero_gorsel ?? '',
  one_cikanlar: arr(w.one_cikanlar),
  program: rows(w.program).map(d => ({ day: d?.day || '', title: d?.title || '', meta: d?.meta || '', desc: d?.desc || '' })),
  konaklama: rows(w.konaklama).map(s => ({ title: s?.title || '', desc: s?.desc || '' })),
  rota: arr(w.rota),
  dahil: arr(w.dahil),
  dahil_degil: arr(w.dahil_degil),
  galeri: arr(w.galeri),
  sss: rows(w.sss).map(f => ({ q: f?.q || '', a: f?.a || '' })),
  cta_baslik: w.cta_baslik ?? '',
  cta_metin: w.cta_metin ?? '',
})

const txt = v => (v || '').trim() || null
const cleanArr = list => list.map(x => (x || '').trim()).filter(Boolean)
const cleanRows = (list, keys) =>
  list.map(r => Object.fromEntries(keys.map(k => [k, (r[k] || '').trim()])))
    .filter(r => keys.some(k => r[k]))

export default function MisirTuruAdmin() {
  const [form, setForm] = useState(null)
  const [tab, setTab] = useState('basvuru')
  const [loadError, setLoadError] = useState('')
  const [countsError, setCountsError] = useState(false)
  const [counts, setCounts] = useState({ kesinlesen: 0, bekleyen: 0, iletisimde: 0, iptal: 0, toplam: 0 })
  const [saveError, setSaveError] = useState('')
  const [savedAt, setSavedAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [galUrl, setGalUrl] = useState('')
  const heroFileRef = useRef(null)
  const galFileRef = useRef(null)

  useEffect(() => {
    let alive = true
    fetchRows('misir_turu_ayarlar', { order: 'id' })
      .then(list => {
        if (!alive) return
        const r = list.find(x => x.id === 1) || list[0] || null
        setForm(toForm(withDefaults(r || {})))
      })
      .catch(e => {
        console.error('Mısır turu ayarları alınamadı:', e)
        if (alive) {
          setLoadError('Ayarlar alınamadı. 006_misir_turu_ayarlar.sql migrasyonunu çalıştırın.')
          setForm(toForm(misirTuruFallback))
        }
      })
    invalidateMisirTuru()
    fetchMisirTuru()
      .then(t => {
        if (!alive) return
        setCounts({ kesinlesen: t.kesinlesen, bekleyen: t.bekleyen, iletisimde: t.iletisimde, iptal: t.iptal, toplam: t.toplam })
      })
      .catch(e => {
        console.error('Mısır turu kontenjan verisi alınamadı:', e)
        if (alive) setCountsError(true)
      })
    return () => { alive = false }
  }, [])

  if (!form) {
    return <div className="adm-state adm-glass"><div className="adm-spinner" /><span>Yükleniyor…</span></div>
  }

  const kontenjan = form.kontenjan === '' ? null : Number(form.kontenjan)
  const dolu = kontenjan != null && counts.kesinlesen >= kontenjan
  const pct = kontenjan ? Math.min(100, (counts.kesinlesen / kontenjan) * 100) : 0
  const status = misirStatus({ basvuru_acik: form.basvuru_acik, son_basvuru: form.son_basvuru || null, dolu })
  const quotaExceeded = kontenjan != null && counts.kesinlesen > kontenjan

  const set = key => e => setForm(f => ({ ...f, [key]: key === 'basvuru_acik' ? e.target.checked : e.target.value }))
  const setArr = key => v => setForm(f => ({ ...f, [key]: v }))
  const setRow = (key, i, field, v) => setForm(f => ({ ...f, [key]: f[key].map((r, j) => (j === i ? { ...r, [field]: v } : r)) }))
  const moveRow = (key, i, d) => setForm(f => {
    const j = i + d
    if (j < 0 || j >= f[key].length) return f
    const a = [...f[key]]
    ;[a[i], a[j]] = [a[j], a[i]]
    return { ...f, [key]: a }
  })
  const delRow = (key, i) => setForm(f => ({ ...f, [key]: f[key].filter((_, j) => j !== i) }))
  const addRow = (key, row) => setForm(f => ({ ...f, [key]: [...f[key], row] }))

  const uploadHero = async e => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadPublicFile('misir-turu', `hero/${Date.now()}-${file.name}`, file)
      setForm(f => ({ ...f, hero_gorsel: url }))
      toast.success('Hero görseli yüklendi.')
    } catch (err) {
      toast.error(err.message || 'Görsel yüklenemedi.')
    } finally {
      setUploading(false)
    }
  }

  const uploadGallery = async e => {
    const files = [...e.target.files]
    e.target.value = ''
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(f => uploadPublicFile('misir-turu', `galeri/${Date.now()}-${f.name}`, f)))
      setForm(f => ({ ...f, galeri: [...f.galeri, ...urls] }))
      toast.success(`${urls.length} görsel eklendi.`)
    } catch (err) {
      toast.error(err.message || 'Görsel yüklenemedi.')
    } finally {
      setUploading(false)
    }
  }

  const addGalleryUrl = () => {
    const u = galUrl.trim()
    if (!u) return
    setForm(f => ({ ...f, galeri: [...f.galeri, u] }))
    setGalUrl('')
  }

  const save = async () => {
    if (saving) return
    if (kontenjan != null && (Number.isNaN(kontenjan) || kontenjan < 1)) {
      setSaveError('Kontenjan en az 1 olmalı (boş = sınırsız).')
      return
    }
    if (form.tur_baslangic && form.tur_bitis && form.tur_bitis < form.tur_baslangic) {
      setSaveError('Tur bitiş tarihi başlangıçtan önce olamaz.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      await updateRow('misir_turu_ayarlar', 1, {
        kontenjan,
        son_basvuru: form.son_basvuru || null,
        basvuru_acik: form.basvuru_acik,
        ucret: txt(form.ucret),
        tur_baslangic: form.tur_baslangic || null,
        tur_bitis: form.tur_bitis || null,
        sure_metni: txt(form.sure_metni),
        hero_ust_baslik: txt(form.hero_ust_baslik),
        baslik: txt(form.baslik),
        aciklama: txt(form.aciklama),
        hero_gorsel: txt(form.hero_gorsel),
        one_cikanlar: cleanArr(form.one_cikanlar),
        program: cleanRows(form.program, ['day', 'title', 'meta', 'desc']),
        konaklama: cleanRows(form.konaklama, ['title', 'desc']),
        rota: cleanArr(form.rota),
        dahil: cleanArr(form.dahil),
        dahil_degil: cleanArr(form.dahil_degil),
        galeri: cleanArr(form.galeri),
        sss: cleanRows(form.sss, ['q', 'a']),
        cta_baslik: txt(form.cta_baslik),
        cta_metin: txt(form.cta_metin),
      })
      invalidateMisirTuru()
      setSavedAt(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }))
      toast.success('Tur ayarları kaydedildi.')
    } catch (e) {
      const msg = /column .* does not exist/i.test(e.message || '') || e.code === '42703'
        ? 'Sayfa içeriği sütunları yok. 008_misir_turu_icerik.sql migrasyonunu çalıştırın.'
        : (e.message || 'Kaydetme başarısız.')
      setSaveError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const onKeyDown = e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      save()
    }
  }

  return (
    <div onKeyDown={onKeyDown}>
      <div className="adm-glass adm-misir-summary adm-misir-summary-row">
        <div className="adm-misir-big">
          {counts.kesinlesen} <span className="adm-dim">/ {kontenjan ?? '∞'}</span>
        </div>
        <div className="adm-misir-mid">
          <span className="adm-dim">Kesinleşen</span>
          <span className="adm-quota-bar adm-misir-bar">
            <span className="adm-quota-fill" style={{ width: `${pct}%` }} />
          </span>
          <div className="adm-misir-badges">
            <span className={`adm-badge ${status === 'open' ? 'adm-badge-true' : 'adm-badge-false'}`}>{misirStatusLabel[status]}</span>
            {dolu && <span className="adm-badge adm-badge-reddedildi">Doldu</span>}
          </div>
        </div>
        <div className="adm-misir-minis">
          <div><strong>{counts.bekleyen}</strong><span className="adm-dim">Bekleyen</span></div>
          <div><strong>{counts.iletisimde}</strong><span className="adm-dim">İletişimde</span></div>
          <div><strong>{counts.iptal}</strong><span className="adm-dim">İptal</span></div>
          <div><strong>{counts.toplam}</strong><span className="adm-dim">Toplam</span></div>
        </div>
        <Link to="/yonetim/misir-basvurulari" className="adm-btn adm-btn-outline adm-misir-link">
          <Users size={15} /><span>Başvuruları Gör</span>
        </Link>
        {countsError && <p className="adm-dim adm-misir-hint">Sayılar için 007_misir_turu_basvurular.sql migrasyonunu çalıştırın.</p>}
      </div>

      {loadError && <p className="adm-error">{loadError}</p>}

      <div className="adm-misir-editor">
        <div className="adm-misir-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`adm-misir-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="adm-glass adm-misir-panel">
          {tab === 'basvuru' && (
            <>
              <div className="adm-faal-2col">
                <label className="adm-field">
                  <span>Kontenjan</span>
                  <input type="number" min={1} placeholder="boş = sınırsız" value={form.kontenjan} onChange={set('kontenjan')} />
                </label>
                <label className="adm-field">
                  <span>Son Başvuru</span>
                  <DateInput value={form.son_basvuru} onChange={set('son_basvuru')} />
                </label>
              </div>
              {quotaExceeded && <p className="adm-error">Kesinleşen sayısı yeni kontenjanı aşıyor.</p>}
              <label className="adm-field">
                <span>Ücret</span>
                <input type="text" placeholder="Örn. 950 USD" value={form.ucret} onChange={set('ucret')} />
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={form.basvuru_acik} onChange={set('basvuru_acik')} />
                Başvurular açık
              </label>
            </>
          )}

          {tab === 'genel' && (
            <>
              <div className="adm-faal-2col">
                <label className="adm-field">
                  <span>Tur Başlangıcı</span>
                  <DateInput value={form.tur_baslangic} onChange={set('tur_baslangic')} />
                </label>
                <label className="adm-field">
                  <span>Tur Bitişi</span>
                  <DateInput value={form.tur_bitis} onChange={set('tur_bitis')} />
                </label>
              </div>
              <label className="adm-field">
                <span>Süre Metni</span>
                <input value={form.sure_metni} onChange={set('sure_metni')} placeholder="Örn. 6 Gün / 5 Gece" />
              </label>
              <label className="adm-field">
                <span>Hero Üst Başlık</span>
                <input value={form.hero_ust_baslik} onChange={set('hero_ust_baslik')} />
              </label>
              <label className="adm-field">
                <span>Başlık</span>
                <input value={form.baslik} onChange={set('baslik')} />
              </label>
              <label className="adm-field">
                <span>Açıklama</span>
                <textarea className="adm-textarea" rows={4} value={form.aciklama} onChange={set('aciklama')} />
              </label>
              <div className="adm-field">
                <span>Hero Görseli</span>
                <div className="adm-ekip-foto-row">
                  {form.hero_gorsel
                    ? <img className="adm-thumb adm-thumb-lg" src={form.hero_gorsel} alt="Önizleme" />
                    : <div className="adm-thumb adm-thumb-lg adm-thumb-empty" />}
                  <button type="button" className="adm-btn adm-btn-outline adm-btn-auto" disabled={uploading} onClick={() => heroFileRef.current?.click()}>
                    <Upload size={14} /><span>{uploading ? 'Yükleniyor…' : 'Yükle'}</span>
                  </button>
                  <input ref={heroFileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadHero} />
                </div>
                <input value={form.hero_gorsel} onChange={set('hero_gorsel')} placeholder="veya görsel URL'si" />
              </div>
            </>
          )}

          {tab === 'one_cikanlar' && (
            <div className="adm-field">
              <span>Öne Çıkanlar</span>
              <ListEditor items={form.one_cikanlar} onChange={setArr('one_cikanlar')} placeholder="Örn. Giza Piramitleri rehberli turu" />
            </div>
          )}

          {tab === 'program' && (
            <div className="adm-field">
              <span>Günlük Program</span>
              {form.program.map((d, i) => (
                <div className="adm-misir-rowcard" key={i}>
                  <div className="adm-misir-rowhead">
                    <input className="adm-misir-day" value={d.day} placeholder={`${i + 1}. Gün`} onChange={e => setRow('program', i, 'day', e.target.value)} />
                    <input value={d.title} placeholder="Başlık" onChange={e => setRow('program', i, 'title', e.target.value)} />
                    <input className="adm-misir-meta" value={d.meta} placeholder="Meta (örn. Uçuş · Otel)" onChange={e => setRow('program', i, 'meta', e.target.value)} />
                    <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => moveRow('program', i, -1)} aria-label="Yukarı"><ChevronUp size={15} /></button>
                    <button type="button" className="adm-icon-btn" disabled={i === form.program.length - 1} onClick={() => moveRow('program', i, 1)} aria-label="Aşağı"><ChevronDown size={15} /></button>
                    <button type="button" className="adm-icon-btn adm-icon-btn-danger" onClick={() => delRow('program', i)} aria-label="Sil"><Trash2 size={15} /></button>
                  </div>
                  <textarea className="adm-textarea" rows={2} value={d.desc} placeholder="Gün açıklaması" onChange={e => setRow('program', i, 'desc', e.target.value)} />
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn-outline adm-btn-auto" onClick={() => addRow('program', { day: `${form.program.length + 1}. Gün`, title: '', meta: '', desc: '' })}>
                <Plus size={14} /><span>Gün Ekle</span>
              </button>
            </div>
          )}

          {tab === 'konaklama' && (
            <div className="adm-field">
              <span>Konaklama & Ulaşım Kartları</span>
              {form.konaklama.map((s, i) => (
                <div className="adm-misir-rowcard" key={i}>
                  <div className="adm-misir-rowhead">
                    <input value={s.title} placeholder="Başlık" onChange={e => setRow('konaklama', i, 'title', e.target.value)} />
                    <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => moveRow('konaklama', i, -1)} aria-label="Yukarı"><ChevronUp size={15} /></button>
                    <button type="button" className="adm-icon-btn" disabled={i === form.konaklama.length - 1} onClick={() => moveRow('konaklama', i, 1)} aria-label="Aşağı"><ChevronDown size={15} /></button>
                    <button type="button" className="adm-icon-btn adm-icon-btn-danger" onClick={() => delRow('konaklama', i)} aria-label="Sil"><Trash2 size={15} /></button>
                  </div>
                  <textarea className="adm-textarea" rows={2} value={s.desc} placeholder="Açıklama" onChange={e => setRow('konaklama', i, 'desc', e.target.value)} />
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn-outline adm-btn-auto" onClick={() => addRow('konaklama', { title: '', desc: '' })}>
                <Plus size={14} /><span>Kart Ekle</span>
              </button>
            </div>
          )}

          {tab === 'rota' && (
            <div className="adm-field">
              <span>Rota Durakları</span>
              <ListEditor items={form.rota} onChange={setArr('rota')} placeholder="Örn. Kahire" addLabel="Durak Ekle" />
            </div>
          )}

          {tab === 'dahil' && (
            <div className="adm-faal-2col">
              <div className="adm-field">
                <span>Dahil</span>
                <ListEditor items={form.dahil} onChange={setArr('dahil')} placeholder="Örn. Tüm transferler" />
              </div>
              <div className="adm-field">
                <span>Dahil Değil</span>
                <ListEditor items={form.dahil_degil} onChange={setArr('dahil_degil')} placeholder="Örn. Mısır vize ücreti" />
              </div>
            </div>
          )}

          {tab === 'galeri' && (
            <div className="adm-field">
              <span>Galeri Görselleri</span>
              <div className="adm-misir-gal">
                {form.galeri.map((g, i) => (
                  <div className="adm-misir-gal-item" key={`${g}-${i}`}>
                    <img src={g} alt="" loading="lazy" />
                    <div className="adm-misir-gal-actions">
                      <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => moveRow('galeri', i, -1)} aria-label="Sola"><ChevronLeft size={14} /></button>
                      <button type="button" className="adm-icon-btn" disabled={i === form.galeri.length - 1} onClick={() => moveRow('galeri', i, 1)} aria-label="Sağa"><ChevronRight size={14} /></button>
                      <button type="button" className="adm-icon-btn adm-icon-btn-danger" onClick={() => delRow('galeri', i)} aria-label="Sil"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="adm-misir-gal-add">
                <input value={galUrl} placeholder="Görsel URL'si" onChange={e => setGalUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGalleryUrl() } }} />
                <button type="button" className="adm-btn adm-btn-outline adm-btn-auto" onClick={addGalleryUrl}><Plus size={14} /><span>Ekle</span></button>
                <button type="button" className="adm-btn adm-btn-outline adm-btn-auto" disabled={uploading} onClick={() => galFileRef.current?.click()}>
                  <Upload size={14} /><span>{uploading ? 'Yükleniyor…' : 'Yükle'}</span>
                </button>
                <input ref={galFileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={uploadGallery} />
              </div>
            </div>
          )}

          {tab === 'sss' && (
            <div className="adm-field">
              <span>Sık Sorulan Sorular</span>
              {form.sss.map((f, i) => (
                <div className="adm-misir-rowcard" key={i}>
                  <div className="adm-misir-rowhead">
                    <input value={f.q} placeholder="Soru" onChange={e => setRow('sss', i, 'q', e.target.value)} />
                    <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => moveRow('sss', i, -1)} aria-label="Yukarı"><ChevronUp size={15} /></button>
                    <button type="button" className="adm-icon-btn" disabled={i === form.sss.length - 1} onClick={() => moveRow('sss', i, 1)} aria-label="Aşağı"><ChevronDown size={15} /></button>
                    <button type="button" className="adm-icon-btn adm-icon-btn-danger" onClick={() => delRow('sss', i)} aria-label="Sil"><Trash2 size={15} /></button>
                  </div>
                  <textarea className="adm-textarea" rows={2} value={f.a} placeholder="Yanıt" onChange={e => setRow('sss', i, 'a', e.target.value)} />
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn-outline adm-btn-auto" onClick={() => addRow('sss', { q: '', a: '' })}>
                <Plus size={14} /><span>Soru Ekle</span>
              </button>
            </div>
          )}

          {tab === 'cta' && (
            <>
              <label className="adm-field">
                <span>CTA Başlığı</span>
                <input value={form.cta_baslik} onChange={set('cta_baslik')} />
              </label>
              <label className="adm-field">
                <span>CTA Metni</span>
                <textarea className="adm-textarea" rows={3} value={form.cta_metin} onChange={set('cta_metin')} />
              </label>
            </>
          )}

          {saveError && <p className="adm-error">{saveError}</p>}

          <div className="adm-misir-savebar">
            <button className="adm-btn adm-btn-gold" disabled={saving} onClick={save}>
              <Save size={15} /><span>{saving ? 'Kaydediliyor…' : 'Kaydet'}</span>
            </button>
            {savedAt && <span className="adm-dim">Son kayıt: {savedAt}</span>}
            <a href="/misir-turu" target="_blank" rel="noreferrer" className="adm-misir-settings-link">
              <ExternalLink size={14} /><span>Siteyi Gör</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
