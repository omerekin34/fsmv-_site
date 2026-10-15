import { supabase } from '../lib/supabase.js'

export async function fetchRows(table, { order = 'created_at', ascending = false } = {}) {
  const { data, error } = await supabase.from(table).select('*').order(order, { ascending })
  if (error) throw error
  return data || []
}

export async function updateRow(table, id, patch) {
  const { error } = await supabase.from(table).update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

export async function insertRow(table, values) {
  const { data, error } = await supabase.from(table).insert(values).select().single()
  if (error) throw error
  return data
}

export async function uploadPublicFile(bucket, path, file) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function countRows(table, filters = {}) {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  for (const [key, value] of Object.entries(filters)) q = q.eq(key, value)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}
