import { CheckCircle2, Clock3, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import type { PublicAppointment } from '@/types/booking'
import { AddToCalendar } from './AddToCalendar'
import { BookingSummary } from './BookingSummary'

interface BookingConfirmationProps {
  appointment: PublicAppointment
  onBookAnother: () => void
}

export function BookingConfirmation({ appointment, onBookAnother }: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false)
  const isPending = appointment.status === 'PENDING'
  const manageUrl = `${window.location.origin}/cita/${appointment.manageToken}`

  const copy = async () => {
    await navigator.clipboard.writeText(manageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center pt-2 text-center">
        <span
          className={`mb-4 flex size-14 items-center justify-center rounded-full ${
            isPending ? 'bg-amber-500/15 text-amber-400' : 'bg-brand-soft text-brand-hover'
          }`}
        >
          {isPending ? <Clock3 className="size-7" /> : <CheckCircle2 className="size-7" />}
        </span>
        <h2 className="text-xl font-semibold text-fg">
          {isPending ? 'Reserva recibida' : '¡Reserva confirmada!'}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-fg-muted">
          {isPending
            ? `${appointment.business.name} confirmará tu cita pronto.`
            : `Te esperamos, ${appointment.customer.name.split(' ')[0]}.`}
        </p>
      </div>

      <BookingSummary
        serviceName={appointment.service.name}
        durationMinutes={appointment.service.durationMinutes}
        price={appointment.price}
        resourceName={appointment.resource.name}
        startsAt={appointment.startsAt}
        timezone={appointment.business.timezone}
      />

      {appointment.manageToken && (
        <AddToCalendar
          token={appointment.manageToken}
          title={`${appointment.service.name} · ${appointment.business.name}`}
          startsAt={appointment.startsAt}
          endsAt={appointment.endsAt}
          details={`${appointment.service.name} con ${appointment.resource.name}. Ver o cambiar tu cita: ${window.location.origin}/cita/${appointment.manageToken}`}
          location={
            [appointment.business.address, appointment.business.city].filter(Boolean).join(', ') ||
            null
          }
        />
      )}

      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="text-sm text-fg">Guarda este enlace para ver o cancelar tu cita:</p>
        <div className="mt-2 flex items-center gap-2">
          <Link
            to={`/cita/${appointment.manageToken}`}
            className="min-w-0 flex-1 truncate text-sm text-brand-hover underline-offset-4 hover:underline"
          >
            {manageUrl}
          </Link>
          <Button variant="secondary" size="sm" onClick={copy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </div>

      <Button variant="ghost" onClick={onBookAnother}>
        Hacer otra reserva
      </Button>
    </div>
  )
}
