import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useBusinessStore } from '@/store/businessStore'
import { Alert } from './Alert'
import { Button } from './Button'
import { FullPageSpinner } from './Spinner'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

/** Inverso: evita que un usuario logueado vuelva a /login o /register. */
export function GuestRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/app" replace /> : <Outlet />
}

/**
 * Solo administradores. Un profesional va directo a su agenda.
 */
export function RequireManager() {
  const role = useBusinessStore(
    (s) => s.businesses.find((b) => b.id === s.activeBusinessId)?.role,
  )
  if (role === 'STAFF') return <Navigate to="/app/agenda" replace />
  return <Outlet />
}

/**
 * Carga los negocios del usuario. Si no tiene ninguno lo envía al onboarding;
 * si tiene, garantiza que haya un negocio activo para las rutas del panel.
 */
export function RequireBusiness() {
  const isLoaded = useBusinessStore((s) => s.isLoaded)
  const hasActive = useBusinessStore((s) =>
    s.businesses.some((b) => b.id === s.activeBusinessId),
  )
  const fetchMyBusinesses = useBusinessStore((s) => s.fetchMyBusinesses)
  const isSuperAdmin = useAuthStore((s) => s.user?.isSuperAdmin ?? false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded && !error) {
      fetchMyBusinesses().catch((err) => setError(getErrorMessage(err)))
    }
  }, [isLoaded, error, fetchMyBusinesses])

  if (error) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 px-4">
        <Alert message={error} />
        <Button variant="secondary" onClick={() => setError(null)}>
          Reintentar
        </Button>
      </div>
    )
  }
  if (!isLoaded) return <FullPageSpinner />
  // El superadministrador no necesita un negocio propio: va a su panel
  if (!hasActive) return <Navigate to={isSuperAdmin ? '/admin' : '/onboarding'} replace />
  return <Outlet />
}

/**
 * Solo el superadministrador de la plataforma. Como el usuario guardado puede
 * estar desactualizado (p. ej. recién se le dio el rol), lo refresca una vez
 * antes de negar el acceso. El backend vuelve a validarlo en cada petición.
 */
export function RequireSuperAdmin() {
  const isSuperAdmin = useAuthStore((s) => s.user?.isSuperAdmin ?? false)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const [checked, setChecked] = useState(isSuperAdmin)

  useEffect(() => {
    if (checked) return
    void fetchMe().finally(() => setChecked(true))
  }, [checked, fetchMe])

  if (isSuperAdmin) return <Outlet />
  if (!checked) return <FullPageSpinner />
  return <Navigate to="/app" replace />
}
