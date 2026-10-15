import { useEffect, useState } from 'react'
import { fetchTeam } from '../lib/team.js'

export function useTeam() {
  const [team, setTeam] = useState({ board: [], departments: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetchTeam()
      .then(data => { if (alive) setTeam(data) })
      .catch(e => console.error('Ekip verileri alınamadı:', e))
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return { ...team, loading }
}
