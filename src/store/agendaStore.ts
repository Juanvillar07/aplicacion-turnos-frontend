import { create } from 'zustand'
import { appointmentsService } from '@/services/appointments'

interface AgendaState {
  /** Reservas futuras pendientes de confirmar (insignia del sidebar) */
  pendingCount: number
  refreshPending: (businessId: string) => Promise<void>
}

export const useAgendaStore = create<AgendaState>()((set) => ({
  pendingCount: 0,
  refreshPending: async (businessId) => {
    try {
      set({ pendingCount: await appointmentsService.pendingCount(businessId) })
    } catch {
      // La insignia es informativa: si falla, se deja el último valor
    }
  },
}))
