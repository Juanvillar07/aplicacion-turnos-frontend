import { useState, type FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Textarea } from '@/components/common/Textarea'
import { getErrorMessage } from '@/services/api'
import { adminService } from '@/services/admin'
import { toast } from '@/store/toastStore'
import type { AdminBusinessDetail } from '@/types/admin'

interface BusinessStatusModalProps {
  business: AdminBusinessDetail
  open: boolean
  onClose: () => void
  onChanged: (business: AdminBusinessDetail) => void
}

/** Suspende (con motivo) o reactiva un negocio, según su estado actual. */
export function BusinessStatusModal({ business, open, onClose, onChanged }: BusinessStatusModalProps) {
  const suspending = business.status === 'ACTIVE'
  const [reason, setReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const close = () => {
    if (isSaving) return
    setReason('')
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const updated = suspending
        ? await adminService.suspend(business.id, reason.trim())
        : await adminService.reactivate(business.id)
      toast.success(suspending ? `${business.name} quedó suspendido` : `${business.name} está activo de nuevo`)
      setReason('')
      onChanged(updated)
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={suspending ? `Suspender ${business.name}` : `Reactivar ${business.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="business-status-form"
            variant={suspending ? 'danger' : 'primary'}
            isLoading={isSaving}
            disabled={suspending && reason.trim().length < 5}
          >
            {suspending ? 'Suspender negocio' : 'Reactivar negocio'}
          </Button>
        </>
      }
    >
      <form id="business-status-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {suspending ? (
          <>
            <ul className="list-disc space-y-1 pl-5 text-sm text-fg-muted">
              <li>La página de reservas y el asistente de WhatsApp dejan de recibir citas.</li>
              <li>El equipo puede entrar al panel, pero solo en modo lectura.</li>
              <li>Los clientes aún pueden cancelar las citas que ya tenían.</li>
              <li>Avisaremos por correo a los administradores con el motivo.</li>
            </ul>
            <Textarea
              label="Motivo (lo verá el negocio)"
              placeholder="Ej.: Uso indebido de la plataforma, solicitud del administrador…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={300}
              rows={3}
              required
              autoFocus
            />
          </>
        ) : (
          <p className="text-sm text-fg-muted">
            El negocio volverá a recibir reservas por web y WhatsApp, y su equipo podrá usar el
            panel con normalidad. Avisaremos por correo a los administradores.
          </p>
        )}
      </form>
    </Modal>
  )
}
