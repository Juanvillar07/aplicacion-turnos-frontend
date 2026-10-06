import { MailWarning } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'
import { toast } from '@/store/toastStore'

/** Aviso (no bloquea) mientras el dueño no confirme su correo. */
export function VerifyEmailBanner() {
  const { user } = useAuth()
  const [isSending, setIsSending] = useState(false)

  // `undefined` = dato aún no cargado del servidor: no se muestra nada
  if (!user || user.emailVerifiedAt !== null) return null

  const resend = async () => {
    setIsSending(true)
    try {
      toast.success(await authService.resendVerification())
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm sm:px-8">
      <MailWarning className="size-4 shrink-0 text-amber-400" />
      <span className="text-fg">
        Confirma tu correo <span className="font-medium">{user.email}</span> para recibir los
        avisos de tus reservas.
      </span>
      <button
        type="button"
        onClick={resend}
        disabled={isSending}
        className="cursor-pointer font-medium text-amber-400 underline-offset-4 hover:underline disabled:opacity-60"
      >
        {isSending ? 'Enviando…' : 'Reenviar enlace'}
      </button>
    </div>
  )
}
