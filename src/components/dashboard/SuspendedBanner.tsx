import { Ban } from 'lucide-react'
import { useBusinessStore } from '@/store/businessStore'

/** Aviso fijo cuando la plataforma suspendió el negocio activo. */
export function SuspendedBanner() {
  const business = useBusinessStore((s) =>
    s.businesses.find((b) => b.id === s.activeBusinessId),
  )
  if (business?.status !== 'SUSPENDED') return null

  return (
    <div className="flex items-start gap-3 border-b border-danger/30 bg-danger-soft px-4 py-3 text-sm sm:px-8">
      <Ban className="mt-0.5 size-4 shrink-0 text-danger" />
      <div className="min-w-0">
        <p className="font-medium text-fg">Este negocio está suspendido</p>
        <p className="text-fg-muted">
          Tu página de reservas y el asistente de WhatsApp no reciben citas, y el panel está en
          solo lectura.
          {business.suspendedReason && <> Motivo: {business.suspendedReason}.</>} Si crees que es
          un error, escríbenos.
        </p>
      </div>
    </div>
  )
}
