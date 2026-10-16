export default function DateInput({ onClick, onFocus, ...props }) {
  const open = e => { try { e.currentTarget.showPicker?.() } catch { /* kullanıcı etkileşimi gerekebilir */ } }
  return (
    <input
      type="date"
      {...props}
      onClick={e => { open(e); onClick?.(e) }}
      onFocus={e => { open(e); onFocus?.(e) }}
    />
  )
}
