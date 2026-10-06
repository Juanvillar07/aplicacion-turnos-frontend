import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuthStore } from '@/store/authStore'
import type { LoginPayload } from '@/types/auth'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/app'

  useEffect(() => clearError, [clearError])

  const handleSubmit = async (payload: LoginPayload) => {
    if (await login(payload)) navigate(from, { replace: true })
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-8 shadow-xl shadow-black/20">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-fg">Bienvenido de nuevo</h1>
        <p className="mt-1 text-sm text-fg-muted">Inicia sesión en tu cuenta</p>
      </div>
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      <p className="mt-6 text-center text-sm text-fg-muted">
        ¿No tienes cuenta?{' '}
        <Link
          to="/crear-negocio"
          className="text-fg underline underline-offset-4 hover:text-brand-hover"
        >
          Crea tu negocio
        </Link>
      </p>
    </div>
  )
}
