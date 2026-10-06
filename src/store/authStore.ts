import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { configureApiAuth, getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'
import type { LoginPayload, RegisterPayload, User } from '@/types/auth'
import { useBusinessStore } from './businessStore'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  login: (payload: LoginPayload) => Promise<boolean>
  register: (payload: RegisterPayload) => Promise<boolean>
  fetchMe: () => Promise<void>
  setUser: (user: User) => void
  /** Inicia sesión con un token ya emitido (p. ej. al aceptar una invitación) */
  setSession: (token: string, user: User) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const { accessToken, user } = await authService.login(payload)
          set({ token: accessToken, user, isLoading: false })
          return true
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false })
          return false
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const { accessToken, user } = await authService.register(payload)
          set({ token: accessToken, user, isLoading: false })
          return true
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false })
          return false
        }
      },

      fetchMe: async () => {
        try {
          const user = await authService.me()
          set({ user })
        } catch {
          // Un 401 ya dispara logout() desde el interceptor.
        }
      },

      setUser: (user) => set({ user }),

      setSession: (token, user) => {
        useBusinessStore.getState().reset()
        set({ token, user, error: null })
      },

      logout: () => {
        set({ user: null, token: null, error: null })
        useBusinessStore.getState().reset()
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Solo se persiste la sesión, no el estado efímero de la UI.
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)

// Conecta el cliente HTTP con el store (token + cierre de sesión en 401).
configureApiAuth({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().logout(),
})

/**
 * Sincroniza la sesión entre pestañas. `persist` solo lee localStorage al
 * cargar la página; el evento `storage` avisa a las demás pestañas cuando una
 * inicia o cierra sesión, y aquí se vuelve a leer.
 */
window.addEventListener('storage', async (event) => {
  if (event.key !== 'auth-storage') return

  const previousUserId = useAuthStore.getState().user?.id
  await useAuthStore.persist.rehydrate()

  // Otro usuario (o ninguno): la lista de negocios en memoria ya no aplica.
  // Se limpia sin tocar `activeBusinessId` para no reescribir localStorage.
  if (useAuthStore.getState().user?.id !== previousUserId) {
    useBusinessStore.setState({ businesses: [], isLoaded: false })
  }
})
