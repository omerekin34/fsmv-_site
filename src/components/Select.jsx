import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

const MAX_LIST_H = 280

const normalize = options =>
  options.map(o => (typeof o === 'object' && o !== null ? o : { value: o, label: String(o) }))

export default function Select({ id, name, value, onChange, options = [], placeholder, ariaLabel, className }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, up: false })
  const wrapRef = useRef(null)
  const trigRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  const opts = normalize(options)
  const selected = opts.find(o => String(o.value) === String(value ?? ''))

  const updatePos = useCallback(() => {
    const el = trigRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const need = Math.min(Math.max(opts.length * 40 + 12, 60), MAX_LIST_H)
    const up = spaceBelow < need && spaceAbove > spaceBelow
    setPos({ top: rect.bottom + 6, bottom: window.innerHeight - rect.top + 6, left: rect.left, width: rect.width, up })
  }, [opts.length])

  const openList = useCallback(() => {
    setActive(Math.max(0, opts.findIndex(o => String(o.value) === String(value ?? ''))))
    updatePos()
    setOpen(true)
  }, [opts, value, updatePos])

  const close = useCallback((refocus = false) => {
    setOpen(false)
    if (refocus) trigRef.current?.focus()
  }, [])

  const commit = useCallback(opt => {
    onChange?.({ target: { name, value: opt.value, type: 'select' } })
    close(true)
  }, [name, onChange, close])

  useEffect(() => {
    if (!open) return
    const onDown = e => {
      if (!wrapRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) close()
    }
    const onScrollResize = () => updatePos()
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', onScrollResize)
    window.addEventListener('scroll', onScrollResize, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', onScrollResize)
      window.removeEventListener('scroll', onScrollResize, true)
    }
  }, [open, close, updatePos])

  useEffect(() => {
    if (open && active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const onTriggerKey = e => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActive(a => Math.min(a + 1, opts.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive(a => Math.max(a - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setActive(0)
        break
      case 'End':
        e.preventDefault()
        setActive(opts.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (opts[active]) commit(opts[active])
        break
      case 'Tab':
        close()
        break
      case 'Escape':
        e.preventDefault()
        close(true)
        break
    }
  }

  return (
    <div className={`sel ${className || ''}`} data-open={open || undefined} ref={wrapRef}>
      <button
        type="button"
        className="sel-trigger"
        id={id}
        ref={trigRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKey}
      >
        <span className={selected ? undefined : 'sel-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} />
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.ul
              id={listId}
              ref={listRef}
              role="listbox"
              aria-label={ariaLabel}
              className={`sel-list ${pos.up ? 'sel-list-up' : ''}`}
              style={pos.up
                ? { bottom: pos.bottom, left: pos.left, width: pos.width }
                : { top: pos.top, left: pos.left, width: pos.width }}
              initial={{ opacity: 0, y: pos.up ? 8 : -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.up ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {opts.map((o, i) => {
                const isSel = String(o.value) === String(value ?? '')
                return (
                  <li
                    key={String(o.value)}
                    role="option"
                    aria-selected={isSel}
                    className={`sel-option ${isSel ? 'is-selected' : ''} ${i === active ? 'is-active' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => commit(o)}
                  >
                    <span>{o.label}</span>
                    {isSel && <Check size={15} />}
                  </li>
                )
              })}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
