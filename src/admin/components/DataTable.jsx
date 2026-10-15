import { useEffect, useMemo, useState } from 'react'
import { Search, Download } from 'lucide-react'
import { fetchRows } from '../api.js'
import { cellText, statusSlug } from '../format.js'
import DetailDrawer from './DetailDrawer.jsx'

const exportCsv = (columns, rows, name) => {
  const esc = v => `"${String(v).replace(/"/g, '""')}"`
  const lines = [columns.map(c => esc(c.label)).join(';')]
  for (const row of rows) lines.push(columns.map(c => esc(cellText(c, row) ?? '')).join(';'))
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })


  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function DataTable({ table, columns, statusField, statusOptions = [], searchKeys = [], hasAdminNote = false }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let alive = true
    fetchRows(table, { order: 'created_at' })
      .then(data => { if (alive) setRows(data) })
      .catch(e => { if (alive) setError(e.message || 'Veriler alınamadı.') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [table])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(row => {
      if (statusField && statusFilter !== 'all' && String(row[statusField]) !== statusFilter) return false
      if (!q) return true
      return searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
    })
  }, [rows, query, statusFilter, statusField, searchKeys])

  const visibleCols = columns.filter(c => !c.hideInTable)

  return (
    <div className="adm-table-page">
      <div className="adm-toolbar adm-glass">
        <div className="adm-search">
          <Search size={16} />
          <input
            placeholder="Ara (ad, e-posta, öğrenci no)…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        {statusField && (
          <select className="adm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tüm durumlar</option>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
        <button className="adm-btn adm-btn-outline" onClick={() => exportCsv(columns, filtered, table)}>
          <Download size={15} /><span>CSV</span>
        </button>
      </div>

      {error ? (
        <div className="adm-state adm-glass adm-error-state">{error}</div>
      ) : loading ? (
        <div className="adm-state adm-glass"><div className="adm-spinner" /><span>Yükleniyor…</span></div>
      ) : filtered.length === 0 ? (
        <div className="adm-state adm-glass">Kayıt bulunamadı.</div>
      ) : (
        <div className="adm-table-wrap adm-glass">
          <table className="adm-table">
            <thead>
              <tr>{visibleCols.map(c => <th key={c.key}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} onClick={() => setSelected(row)}>
                  {visibleCols.map(c => (
                    <td key={c.key}>
                      {c.type === 'badge' ? (
                        <span className={`adm-badge adm-badge-${statusSlug(row[c.key])}`}>{cellText(c, row)}</span>
                      ) : cellText(c, row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <DetailDrawer
          key={selected.id}
          table={table}
          row={selected}
          columns={columns}
          statusField={statusField}
          statusOptions={statusOptions}
          hasAdminNote={hasAdminNote}
          onClose={() => setSelected(null)}
          onUpdated={updated => {
            setRows(rs => rs.map(r => (r.id === updated.id ? updated : r)))
            setSelected(updated)
          }}
          onDeleted={id => {
            setRows(rs => rs.filter(r => r.id !== id))
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}
