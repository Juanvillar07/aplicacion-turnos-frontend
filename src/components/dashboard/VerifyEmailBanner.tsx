import { MailWarning } from 'lucide-react'
import { useState } from 'react'
import { VerifyEmailModal } from '@/components/auth/VerifyEmailModal'
import { useAuth } from '@/hooks/useAuth'

/** Aviso (no bloquea el panel) mientras la cuenta no confirme su correo. */
export function VerifyEmailBanner() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  // `undefined` = dato aún no cargado del servidor: no se muestra nada
  if (!user || user.emailVerifiedAt !== null) return null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm sm:px-8">
      <MailWarning className="size-4 shrink-0 text-amber-400" />
      <span className="text-fg">
        Confirma tu correo <span className="font-medium">{user.email}</span> para recibir los
        avisos de tus reservas.
      </span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer font-medium text-amber-400 underline-offset-4 hover:underline"
      >
        Verificar ahora
      </button>
      <VerifyEmailModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
