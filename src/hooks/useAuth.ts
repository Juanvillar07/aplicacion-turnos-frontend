import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '@/store/authStore'

/** Acceso cómodo al estado de autenticación desde los componentes. */
export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      token: state.token,
      isAuthenticated: Boolean(state.token),
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      register: state.register,
      fetchMe: state.fetchMe,
      logout: state.logout,
      clearError: state.clearError,
    })),
  )
}
