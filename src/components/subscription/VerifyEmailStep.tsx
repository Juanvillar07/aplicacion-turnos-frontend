import { MailCheck } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { VerifyEmailCode } from '@/components/auth/VerifyEmailCode'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { useVerificationCode } from '@/hooks/useVerificationCode'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { BackButton } from './BackButton'
import { SignupSteps } from './SignupSteps'

/**
 * Paso "Verificación" del asistente: el código que llegó al correo, con la
 * opción de corregir el correo si se escribió mal. "Atrás" abre esa
 * corrección (la cuenta ya existe, no se puede volver al paso Cuenta).
 */
export function VerifyEmailStep({ footer }: { footer?: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const setSession = useAuthStore((s) => s.setSession)
  const [changing, setChanging] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  // Un correo nuevo = un código nuevo
  const request = useVerificationCode(true, user?.email ?? '')

  if (!user) return null

  const changeEmail = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const { accessToken, user: updated } = await authService.changeEmail(newEmail.trim())
      setSession(accessToken, updated)
      toast.success(`Te enviamos un código a ${updated.email}`)
      setChanging(false)
      setNewEmail('')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[460px]">
      <SignupSteps current="verify" />
      <div className="rounded-lg border border-line bg-surface p-8 shadow-xl shadow-black/20">
        {changing ? (
          <>
            <BackButton onClick={() => setChanging(false)} label="Volver al código" />
            <h1 className="text-2xl font-medium text-fg">Cambiar correo</h1>
            <p className="mt-1 mb-6 text-sm text-fg-muted">
              Ahora es <span className="text-fg">{user.email}</span>. Te enviaremos un código al
              correo nuevo.
            </p>
            <form onSubmit={changeEmail} className="flex flex-col gap-5">
              <Input
                label="Correo correcto"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                autoFocus
              />
              <Button type="submit" fullWidth isLoading={isSaving}>
                Guardar y enviar código
              </Button>
            </form>
          </>
        ) : (
          <>
            <BackButton onClick={() => setChanging(true)} />
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-hover">
                <MailCheck className="size-5" />
              </span>
              <h1 className="text-2xl font-medium text-fg">Revisa tu correo</h1>
            </div>
            {request.status === 'sending' ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : request.status === 'error' ? (
              <Alert message={request.message} />
            ) : (
              <VerifyEmailCode
                key={user.email}
                email={user.email}
                initialCooldown={request.cooldown}
                onVerified={(verified) => {
                  setUser(verified)
                  toast.success('¡Correo verificado!')
                }}
              />
            )}
            <p className="mt-6 text-center text-sm text-fg-muted">
              ¿Correo equivocado?{' '}
              <button
                type="button"
                onClick={() => setChanging(true)}
                className="cursor-pointer text-fg underline underline-offset-4 hover:text-brand-hover"
              >
                Cambiar correo
              </button>
            </p>
          </>
        )}
      </div>
      {footer}
    </div>
  )
}
