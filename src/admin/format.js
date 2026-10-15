export const fmtDate = v => (v ? new Date(v).toLocaleString('tr-TR') : '—')

export function cellText(col, row) {
  const v = row[col.key]
  if (col.type === 'date') return fmtDate(v)
  if (col.type === 'bool') return v ? 'Evet' : 'Hayır'
  if (col.type === 'array') return Array.isArray(v) ? (v.length ? v.join(', ') : '—') : (v ?? '—')
  if (col.type === 'badge') {
    const opt = col.options?.find(o => o.value === String(v))
    return opt ? opt.label : (v ?? '—')
  }
  return v ?? '—'
}

export function statusSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
}
