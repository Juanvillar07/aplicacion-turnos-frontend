import axios from 'axios'
import { CalendarClock, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { ReschedulePanel } from '@/components/booking/ReschedulePanel'
import { AppointmentStatusBadge } from '@/components/agenda/AppointmentStatusBadge'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { FullPageSpinner } from '@/components/common/Spinner'
import { PublicLayout } from '@/layouts/PublicLayout'
import { getErrorMessage } from '@/services/api'
import { publicBookingService } from '@/services/publicBooking'
import { toast } from '@/store/toastStore'
import type { PublicAppointment } from '@/types/booking'
import { NotFoundBusinessPage } from './NotFoundBusinessPage'

/** Enlace privado del cliente: ver, reprogramar o cancelar su cita. */
export function ManageAppointmentPage() {
  const { token = '' } = useParams()
  const [appointment, setAppointment] = useState<PublicAppointment | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)

  useEffect(() => {
    let cancelled = false
    publicBookingService
      .getAppointment(token)
      .then((data) => !cancelled && setAppointment(data))
      .catch((err) => {
        if (cancelled) return
        if (axios.isAxiosError(err) && err.response?.status === 404) setNotFound(true)
        else setError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (notFound) {
    return (
      <NotFoundBusinessPage
        title="No encontramos esta cita"
        description="El enlace puede estar incompleto. Revisa el mensaje donde lo recibiste."
      />
    )
  }
  if (error && !appointment) {
    return (
      <PublicLayout>
        <Alert message={error} />
      </PublicLayout>
    )
  }
  if (!appointment) return <FullPageSpinner />

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      setAppointment(await publicBookingService.cancelAppointment(token))
      setConfirming(false)
      toast.success('Tu cita fue cancelada')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsCancelling(false)
    }
  }

  const { business } = appointment

  return (
    <PublicLayout business={business}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-fg">Tu cita</h2>
          <AppointmentStatusBadge status={appointment.status} />
        </div>

        <BookingSummary
          serviceName={appointment.service.name}
          durationMinutes={appointment.service.durationMinutes}
          price={appointment.price}
          resourceName={appointment.resource.name}
          startsAt={appointment.startsAt}
          timezone={business.timezone}
        />

        {appointment.status === 'PENDING' && (
          <p className="text-sm text-fg-muted">
            {business.name} aún debe confirmar esta cita. Te avisaremos por correo.
          </p>
        )}

        {rescheduling ? (
          <ReschedulePanel
            token={token}
            timezone={business.timezone}
            onDone={(updated) => {
              setAppointment(updated)
              setRescheduling(false)
            }}
            onCancel={() => setRescheduling(false)}
          />
        ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          {appointment.canReschedule && (
            <Button variant="secondary" onClick={() => setRescheduling(true)} className="sm:flex-1">
              <CalendarClock className="size-4" /> Reprogramar
            </Button>
          )}
          {appointment.canCancel && (
            <Button variant="danger" onClick={() => setConfirming(true)} className="sm:flex-1">
              Cancelar cita
            </Button>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line-strong bg-surface-2 px-4 text-sm font-medium text-fg hover:bg-line sm:flex-1"
            >
              <Phone className="size-4" /> Llamar al negocio
            </a>
          )}
        </div>
        )}

        {appointment.canCancel && !appointment.canReschedule && !rescheduling && (
          <p className="text-xs text-fg-subtle">
            Ya no es posible reprogramar en línea por la cercanía de la cita. Si necesitas
            cambiarla, comunícate con el negocio.
          </p>
        )}

        <Link
          to={`/b/${business.slug}`}
          className="text-center text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          Hacer otra reserva en {business.name}
        </Link>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="¿Cancelar tu cita?"
        description="El horario quedará libre para otra persona."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Volver
            </Button>
            <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
              Sí, cancelar
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          {appointment.service.name} con {appointment.resource.name}.
        </p>
      </Modal>
    </PublicLayout>
  )
}
