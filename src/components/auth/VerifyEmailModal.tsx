import { Alert } from '@/components/common/Alert'
import { Modal } from '@/components/common/Modal'
import { Spinner } from '@/components/common/Spinner'
import { useVerificationCode } from '@/hooks/useVerificationCode'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { VerifyEmailCode } from './VerifyEmailCode'

/**
 * Verificar el correo desde el panel (cuentas sin verificar): al abrirse
 * envía un código y muestra las casillas para escribirlo.
 */
export function VerifyEmailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const email = useAuthStore((s) => s.user?.email ?? '')
  const setUser = useAuthStore((s) => s.setUser)
  // Cada apertura pide su propio código
  const request = useVerificationCode(open, open ? 'open' : 'closed')

  return (
    <Modal open={open} onClose={onClose} title="Verifica tu correo">
      {request.status === 'sending' ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : request.status === 'error' ? (
        <Alert message={request.message} />
      ) : (
        <VerifyEmailCode
          email={email}
          initialCooldown={request.cooldown}
          onVerified={(user) => {
            setUser(user)
            toast.success('¡Correo verificado!')
            onClose()
          }}
        />
      )}
    </Modal>
  )
}
