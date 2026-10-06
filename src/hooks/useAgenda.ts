import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/services/api'
import { appointmentsService } from '@/services/appointments'
import type { Appointment, TimeOff } from '@/types/appointment'

interface AgendaState {
  /** Día cargado (negocio + fecha) */
  dayKey: string
  appointments: Appointment[]
  timeOffs: TimeOff[]
  isLoading: boolean
  error: string | null
}

/**
 * Citas y bloqueos de un día de la agenda. Al cambiar de día se muestra
 * "cargando"; al recargar el mismo día se mantienen los datos actuales.
 */
export function useAgenda(businessId: string, date: string) {
  const dayKey = `${businessId}|${date}`
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState<AgendaState>({
    dayKey,
    appointments: [],
    timeOffs: [],
    isLoading: true,
    error: null,
  })

  if (state.dayKey !== dayKey) {
    setState({ dayKey, appointments: [], timeOffs: [], isLoading: true, error: null })
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([
      appointmentsService.listByDay(businessId, date),
      appointmentsService.listTimeOffs(businessId, date),
    ])
      .then(([appointments, timeOffs]) => {
        if (!cancelled) {
          setState({ dayKey, appointments, timeOffs, isLoading: false, error: null })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState((s) => ({ ...s, isLoading: false, error: getErrorMessage(err) }))
        }
      })
    return () => {
      cancelled = true
    }
  }, [businessId, date, dayKey, reloadKey])

  return {
    appointments: state.appointments,
    timeOffs: state.timeOffs,
    isLoading: state.isLoading,
    error: state.error,
    reload: () => setReloadKey((k) => k + 1),
  }
}
