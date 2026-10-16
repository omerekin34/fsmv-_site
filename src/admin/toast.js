let nextId = 0
let toasts = []
const listeners = new Set()

const emit = () => { for (const fn of listeners) fn(toasts) }

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function remove(id) {
  toasts = toasts.filter(t => t.id !== id)
  emit()
}

const push = (type, msg) => {
  const t = { id: ++nextId, type, msg }
  toasts = [...toasts, t]
  emit()
  setTimeout(() => remove(t.id), 5000)
}

export const toast = {
  success: msg => push('success', msg),
  error: msg => push('error', msg),
  info: msg => push('info', msg),
}
