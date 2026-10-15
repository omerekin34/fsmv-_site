import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAnnouncements } from '../hooks/useAnnouncements.js'
import { nextDeadline, formatDate, endOfDay } from '../lib/announcements.js'

const pad = n => String(n).padStart(2, '0')
const cells = diff => [
  ['G', Math.floor(diff / 86400000)],
  ['SA', Math.floor(diff / 3600000) % 24],
  ['DK', Math.floor(diff / 60000) % 60],
  ['SN', Math.floor(diff / 1000) % 60],
]

export default function DeadlineBar() {
  const { announcements } = useAnnouncements()
  const d = nextDeadline(announcements)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--topbar-h', d ? '56px' : '0px')
    return () => document.documentElement.style.setProperty('--topbar-h', '0px')
  }, [d])

  if (!d) return null

  const diff = Math.max(0, endOfDay(d.deadlineISO) - now)

  return (
    <div className="deadline-bar">
      <div className="container deadline-bar-inner">
        <span className="deadline-bar-date">
          <strong>BAŞVURU SON TARİHİ</strong>
          {formatDate(d.deadlineISO)}
        </span>
        <span className="deadline-bar-count">
          {cells(diff).map(([label, v]) => (
            <span key={label} className="deadline-bar-cell">
              <b>{pad(v)}</b>
              <i>{label}</i>
            </span>
          ))}
        </span>
        <span className="deadline-bar-title">{d.title}</span>
        {d.quota && <span className="deadline-bar-quota">Kontenjan {d.approved}/{d.quota}</span>}
        <Link to={`/duyurular/${d.slug}?katil=1`} className="deadline-bar-btn">Hemen Katıl</Link>
      </div>
    </div>
  )
}
