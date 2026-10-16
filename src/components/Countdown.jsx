import { useEffect, useState } from 'react'
import { endOfDay } from '../lib/announcements.js'

const pad = n => String(n).padStart(2, '0')
const cells = diff => [
  ['G', Math.floor(diff / 86400000)],
  ['SA', Math.floor(diff / 3600000) % 24],
  ['DK', Math.floor(diff / 60000) % 60],
  ['SN', Math.floor(diff / 1000) % 60],
]

export default function Countdown({ toISO }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, endOfDay(toISO) - now)

  return (
    <span className="countdown">
      {cells(diff).map(([label, v]) => (
        <span key={label} className="countdown-cell">
          <b>{pad(v)}</b>
          <i>{label}</i>
        </span>
      ))}
    </span>
  )
}
