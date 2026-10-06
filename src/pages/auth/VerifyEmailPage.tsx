import { CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Spinner } from '@/components/common/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/auth'

/**
 * El token es de un solo uso. En desarrollo, StrictMode ejecuta los efectos dos
 * veces: ambas ejecuciones comparten la misma petición en lugar de gastar el token.
 */
const verifications = new Map<string, Promise<User>>()
function verifyOnce(token: string) {
  if (!verifications.has(token)) verifications.set(token, authService.verifyEmail(token))
  return verifications.get(token)!
}

type State = { status: 'loading' } | { status: 'ok' } | { status: 'error'; message: string }

/** Destino del enlace de verificación que llega por correo. */
export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const { isAuthenticated, user } = useAuth()
  const [state, setState] = useState<State>(
    token ? { status: 'loading' } : { status: 'error', message: 'El enlace está incompleto.' },
  )

  useEffect(() => {
    if (!token) return
    let cancelled = false
    verifyOnce(token)
      .then((verified) => {
        if (cancelled) return
        // Si la sesión abierta es de esta misma cuenta, se actualiza el aviso
        const current = useAuthStore.getState().user
        if (current?.id === verified.id) useAuthStore.getState().setUser(verified)
        setState({ status: 'ok' })
      })
      .catch((err) => !cancelled && setState({ status: 'error', message: getErrorMessage(err) }))
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="flex flex-col items-center rounded-lg border border-line bg-surface p-8 text-center shadow-xl shadow-black/20">
      {state.status === 'loading' && (
        <>
          <Spinner className="size-6" />
          <p className="mt-4 text-sm text-fg-muted">Verificando tu correo…</p>
        </>
      )}
      {state.status === 'ok' && (
        <>
          <CheckCircle2 className="size-12 text-brand-hover" />
          <h1 className="mt-4 text-xl font-medium text-fg">¡Correo verificado!</h1>
          <p className="mt-1 text-sm text-fg-muted">Gracias por confirmar tu correo.</p>
        </>
      )}
      {state.status === 'error' && (
        <>
          <XCircle className="size-12 text-danger" />
          <h1 className="mt-4 text-xl font-medium text-fg">No pudimos verificar tu correo</h1>
          <p className="mt-1 text-sm text-fg-muted">{state.message}</p>
          {isAuthenticated && !user?.emailVerifiedAt && (
            <p className="mt-2 text-xs text-fg-subtle">
              Puedes pedir un enlace nuevo desde el aviso en tu panel.
            </p>
          )}
        </>
      )}
      {state.status !== 'loading' && (
        <Link
          to={isAuthenticated ? '/app' : '/login'}
          className="mt-6 text-sm text-fg underline underline-offset-4 hover:text-brand-hover"
        >
          {isAuthenticated ? 'Ir a mi panel' : 'Iniciar sesión'}
        </Link>
      )}
    </div>
  )
}
