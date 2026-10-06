import { CalendarDays, Mail, MessageCircle, Phone, StickyNote, Tag, User } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { getErrorMessage } from '@/services/api'
import { toast } from '@/store/toastStore'
import type { Appointment, AppointmentStatus } from '@/types/appointment'
import { capitalize, formatClock, formatInTz } from '@/utils/date'
import { formatCOP } from '@/utils/format'
import { prettyPhone, whatsappUrl } from '@/utils/phone'
import { SOURCE_LABELS } from '@/constants/appointment'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'

interface AppointmentDetailsModalProps {
  appointment: Appointment | null
  timezone: string
  onClose: () => void
  onChangeStatus: (appointment: Appointment, status: AppointmentStatus) => Promise<unknown>
}

const STATUS_TOAST: Partial<Record<AppointmentStatus, string>> = {
  CONFIRMED: 'Cita confirmada',
  COMPLETED: 'Cita marcada como completada',
  NO_SHOW: 'Cita marcada como no asistió',
  CANCELLED: 'Cita cancelada',
}

function Row({ icon: Icon, children }: { icon: typeof Tag; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
      <div className="min-w-0 text-sm text-fg">{children}</div>
    </li>
  )
}

export function AppointmentDetailsModal({
  appointment,
  timezone,
  onClose,
  onChangeStatus,
}: AppointmentDetailsModalProps) {
  const [busy, setBusy] = useState<AppointmentStatus | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!appointment) return null
  const a = appointment

  const change = async (status: AppointmentStatus) => {
    setBusy(status)
    try {
      await onChangeStatus(a, status)
      setConfirmCancel(false)
      const message = STATUS_TOAST[status]
      if (message) toast.success(message)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const close = () => {
    setConfirmCancel(false)
    onClose()
  }

  const action = (status: AppointmentStatus, label: string, variant: 'primary' | 'secondary' | 'danger' = 'secondary') => (
    <Button
      variant={variant}
      size="sm"
      isLoading={busy === status}
      disabled={busy !== null}
      onClick={() => change(status)}
    >
      {label}
    </Button>
  )

  const cancelButton =
    a.status === 'PENDING' || a.status === 'CONFIRMED' ? (
      confirmCancel ? (
        action('CANCELLED', 'Sí, cancelar', 'danger')
      ) : (
        <Button variant="danger" size="sm" onClick={() => setConfirmCancel(true)}>
          {a.status === 'PENDING' ? 'Rechazar' : 'Cancelar cita'}
        </Button>
      )
    ) : null

  const footer = (
    <div className="flex w-full flex-wrap items-center gap-2">
      {cancelButton}
      <div className="ml-auto flex flex-wrap gap-2">
        {a.status === 'PENDING' && action('CONFIRMED', 'Confirmar', 'primary')}
        {a.status === 'CONFIRMED' && (
          <>
            {action('NO_SHOW', 'No asistió')}
            {action('COMPLETED', 'Completada', 'primary')}
          </>
        )}
        {a.status === 'COMPLETED' && action('NO_SHOW', 'Marcar como no asistió')}
        {a.status === 'NO_SHOW' && action('COMPLETED', 'Marcar como completada')}
      </div>
    </div>
  )

  return (
    <Modal open onClose={close} title={a.customer.name} footer={a.status === 'CANCELLED' ? undefined : footer}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <AppointmentStatusBadge status={a.status} />
          <span className="text-xs text-fg-subtle">
            {SOURCE_LABELS[a.source]}
          </span>
        </div>

        <ul className="flex flex-col gap-3">
          <Row icon={CalendarDays}>
            {capitalize(formatInTz(a.startsAt, timezone, "EEEE d 'de' MMMM"))}
            <span className="block text-fg-muted">
              {formatClock(a.startsAt, timezone)} – {formatClock(a.endsAt, timezone)}
            </span>
          </Row>
          <Row icon={Tag}>
            {a.service.name} <span className="text-fg-muted">· {formatCOP(a.price)}</span>
          </Row>
          <Row icon={User}>{a.resource.name}</Row>
          {a.notes && (
            <Row icon={StickyNote}>
              <span className="text-fg-muted">{a.notes}</span>
            </Row>
          )}
        </ul>

        <div className="rounded-lg border border-line bg-surface-2/50 p-3">
          <p className="mb-2 text-xs font-medium text-fg-subtle">Contacto</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <a href={`tel:${a.customer.phone}`} className="inline-flex items-center gap-2 text-fg hover:text-brand-hover">
              <Phone className="size-3.5 text-fg-subtle" /> {prettyPhone(a.customer.phone)}
            </a>
            {a.customer.email && (
              <a href={`mailto:${a.customer.email}`} className="inline-flex items-center gap-2 truncate text-fg hover:text-brand-hover">
                <Mail className="size-3.5 text-fg-subtle" /> {a.customer.email}
              </a>
            )}
          </div>
          <a
            href={whatsappUrl(a.customer.phone)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex h-8 items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 text-[13px] font-medium text-emerald-400 hover:bg-emerald-500/20"
          >
            <MessageCircle className="size-3.5" /> Escribir por WhatsApp
          </a>
        </div>

      </div>
    </Modal>
  )
}
