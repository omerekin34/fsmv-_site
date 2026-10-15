import { useEffect, useState } from 'react'
import { fetchAnnouncements } from '../lib/announcements.js'

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    fetchAnnouncements()
      .then(list => { if (alive) setAnnouncements(list) })
      .catch(e => {
        console.error('Duyuru verileri alınamadı:', e)
        if (alive) setError(e)
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return { announcements, loading, error }
}
