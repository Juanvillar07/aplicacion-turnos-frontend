import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { businessesService } from '@/services/businesses'
import type {
  Business,
  CreateBusinessPayload,
  UpdateBusinessPayload,
} from '@/types/business'

interface BusinessState {
  businesses: Business[]
  activeBusinessId: string | null
  /** true cuando ya se consultó la lista al servidor en esta sesión */
  isLoaded: boolean

  fetchMyBusinesses: () => Promise<Business[]>
  createBusiness: (payload: CreateBusinessPayload) => Promise<Business>
  updateBusiness: (payload: UpdateBusinessPayload) => Promise<Business>
  setActive: (businessId: string) => void
  reset: () => void
}

const initialState = {
  businesses: [],
  activeBusinessId: null,
  isLoaded: false,
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchMyBusinesses: async () => {
        const businesses = await businessesService.listMine()
        const { activeBusinessId } = get()
        const stillValid = businesses.some((b) => b.id === activeBusinessId)
        set({
          businesses,
          isLoaded: true,
          activeBusinessId: stillValid ? activeBusinessId : (businesses[0]?.id ?? null),
        })
        return businesses
      },

      createBusiness: async (payload) => {
        const business = await businessesService.create(payload)
        set((state) => ({
          businesses: [...state.businesses, business],
          activeBusinessId: business.id,
          isLoaded: true,
        }))
        return business
      },

      updateBusiness: async (payload) => {
        const { activeBusinessId } = get()
        if (!activeBusinessId) throw new Error('No hay negocio activo')
        const updated = await businessesService.update(activeBusinessId, payload)
        set((state) => ({
          businesses: state.businesses.map((b) => (b.id === updated.id ? updated : b)),
        }))
        return updated
      },

      setActive: (businessId) => set({ activeBusinessId: businessId }),

      reset: () => set(initialState),
    }),
    {
      name: 'business-storage',
      storage: createJSONStorage(() => localStorage),
      // Solo se recuerda qué negocio estaba activo; la lista se pide al servidor.
      partialize: (state) => ({ activeBusinessId: state.activeBusinessId }),
    },
  ),
)
