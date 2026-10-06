import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CustomerInput, PublicAppointment, Slot } from '@/types/booking'

export type BookingStep = 'service' | 'resource' | 'datetime' | 'details' | 'done'

interface BookingState {
  step: BookingStep
  serviceId: string | null
  /** `null` = cualquiera disponible */
  resourceId: string | null
  date: string | null
  slot: Slot | null
  customer: CustomerInput
  result: PublicAppointment | null

  selectService: (serviceId: string, skipResource: boolean) => void
  selectResource: (resourceId: string | null) => void
  setDate: (date: string) => void
  selectSlot: (slot: Slot) => void
  setCustomer: (customer: CustomerInput) => void
  finish: (result: PublicAppointment) => void
  goTo: (step: BookingStep) => void
  reset: () => void
}

const emptyCustomer: CustomerInput = { name: '', email: '', phone: '' }

const initialFlow = {
  step: 'service' as BookingStep,
  serviceId: null,
  resourceId: null,
  date: null,
  slot: null,
  result: null,
}

/** Estado del asistente de reserva de la página pública. */
export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialFlow,
      customer: emptyCustomer,

      selectService: (serviceId, skipResource) =>
        set({
          serviceId,
          resourceId: null,
          date: null,
          slot: null,
          step: skipResource ? 'datetime' : 'resource',
        }),
      selectResource: (resourceId) => set({ resourceId, date: null, slot: null, step: 'datetime' }),
      setDate: (date) => set({ date, slot: null }),
      selectSlot: (slot) => set({ slot, step: 'details' }),
      setCustomer: (customer) => set({ customer }),
      finish: (result) => set({ result, step: 'done' }),
      goTo: (step) => set({ step }),
      reset: () => set(initialFlow),
    }),
    {
      name: 'booking-customer',
      storage: createJSONStorage(() => localStorage),
      // Solo se recuerdan los datos del cliente para su próxima reserva
      partialize: (state) => ({ customer: state.customer }),
    },
  ),
)
