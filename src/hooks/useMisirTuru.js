import { useEffect, useState } from 'react'
import { fetchMisirTuru, misirTuruFallback } from '../lib/misirTuru.js'

export function useMisirTuru() {
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    fetchMisirTuru()
      .then(t => { if (alive) setTour(t) })
      .catch(e => {
        console.error('Mısır turu verileri alınamadı:', e)
        if (alive) { setTour(misirTuruFallback); setError(e) }
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return { tour, loading, error }
}
