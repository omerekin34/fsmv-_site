import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react'

export default function ListEditor({ items, onChange, placeholder = 'Madde…', addLabel = 'Madde Ekle' }) {
  const set = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)))
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const a = [...items]
    ;[a[i], a[j]] = [a[j], a[i]]
    onChange(a)
  }
  const del = i => onChange(items.filter((_, j) => j !== i))
  const add = () => onChange([...items, ''])

  return (
    <div className="adm-list-editor">
      {items.map((x, i) => (
        <div className="adm-cat-row" key={i}>
          <input
            value={x}
            placeholder={placeholder}
            onChange={e => set(i, e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && i === items.length - 1) { e.preventDefault(); add() }
            }}
          />
          <button type="button" className="adm-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Yukarı taşı"><ChevronUp size={15} /></button>
          <button type="button" className="adm-icon-btn" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Aşağı taşı"><ChevronDown size={15} /></button>
          <button type="button" className="adm-icon-btn adm-icon-btn-danger" onClick={() => del(i)} aria-label="Sil"><Trash2 size={15} /></button>
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn-outline adm-btn-auto" onClick={add}>
        <Plus size={14} /><span>{addLabel}</span>
      </button>
    </div>
  )
}
