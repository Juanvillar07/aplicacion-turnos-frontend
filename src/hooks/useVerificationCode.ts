import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'

export type CodeRequest =
  | { status: 'sending' }
  | { status: 'ready'; cooldown: number }
  | { status: 'error'; message: string }

const secondsUntil = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000))

/**
 * Deja listo un código de verificación al activarse. Primero consulta si ya
 * hay uno vigente (p. ej. el que se envió al registrarse o al cambiar el
 * correo): en ese caso no envía otro y solo calcula la espera para reenviar.
 * `key` cambia para volver a comprobar (p. ej. con un correo nuevo).
 */
export function useVerificationCode(active: boolean, key = ''): CodeRequest {
  const [state, setState] = useState<CodeRequest & { key: string }>({
    status: 'sending',
    key,
  })

  // Al cambiar `key` se vuelve a "enviando" durante el render
  if (state.key !== key) setState({ status: 'sending', key })

  useEffect(() => {
    if (!active) return
    let cancelled = false
    const ready = (cooldown: number) => !cancelled && setState({ status: 'ready', cooldown, key })

    authService
      .verificationStatus()
      .then(async ({ hasActiveCode, resendAvailableAt }) => {
        if (hasActiveCode) return ready(secondsUntil(resendAvailableAt))
        const sent = await authService.resendVerification()
        ready(secondsUntil(sent.resendAvailableAt))
      })
      .catch((err) => !cancelled && setState({ status: 'error', message: getErrorMessage(err), key }))
    return () => {
      cancelled = true
    }
  }, [active, key])

  return state
}
