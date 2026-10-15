import { supabase } from './supabase.js'

const mapMember = r => ({
  id: r.id,
  name: r.ad_soyad,
  role: r.unvan,
  img: r.foto_url,
  linkedin: r.linkedin,
  mail: r.email ? `mailto:${r.email}` : null,
})

export async function fetchTeam() {
  const { data, error } = await supabase
    .from('ekip_uyeleri')
    .select('*')
    .eq('aktif', true)
    .order('sira', { ascending: true })
  if (error) throw error
  const rows = data || []
  return {
    board: rows.filter(r => r.grup === 'yonetim').map(mapMember),
    departments: rows.filter(r => r.grup === 'departman').map(mapMember),
  }
}
