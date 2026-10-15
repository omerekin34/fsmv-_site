import { useEffect, useState } from 'react'
import { fetchActivities, fetchCategories } from '../lib/activities.js'

export function useActivities() {
  const [activities, setActivities] = useState([])
  const [categories, setCategories] = useState(['Tümü'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all([fetchActivities(), fetchCategories()])
      .then(([acts, cats]) => {
        if (!alive) return
        setActivities(acts)
        setCategories(['Tümü', ...cats])
      })
      .catch(e => {
        console.error('Faaliyet verileri alınamadı:', e)
        if (alive) setError(e)
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const years = [...new Set(activities.map(a => a.dateISO.slice(0, 4)))].sort().reverse()

  return { activities, categories, years, loading, error }
}
