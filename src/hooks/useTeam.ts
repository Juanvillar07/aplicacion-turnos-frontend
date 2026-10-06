import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/services/api'
import { teamService } from '@/services/team'
import type { Team } from '@/types/team'

const EMPTY: Team = { members: [], invitations: [] }

/** Miembros e invitaciones pendientes del negocio. */
export function useTeam(businessId: string) {
  const [team, setTeam] = useState<Team>(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    teamService
      .get(businessId)
      .then((data) => {
        if (cancelled) return
        setTeam(data)
        setError(null)
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [businessId])

  // Las mutaciones del backend devuelven el equipo actualizado
  return { team, setTeam, isLoading, error }
}
