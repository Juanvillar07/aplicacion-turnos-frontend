import { ArrowLeft, CalendarClock, Mail, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppointmentStatusBadge } from '@/components/agenda/AppointmentStatusBadge'
import { Alert } from '@/components/common/Alert'
import { SOURCE_LABELS } from '@/constants/appointment'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { Textarea } from '@/components/common/Textarea'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/services/api'
import { customersService } from '@/services/customers'
import { toast } from '@/store/toastStore'
import type { CustomerDetail } from '@/types/customer'
import { capitalize, formatInTz } from '@/utils/date'
import { formatCOP } from '@/utils/format'
import { prettyPhone, whatsappUrl } from '@/utils/phone'

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs text-fg-subtle">{label}</p>
      <p className="mt-1.5 text-xl font-medium text-fg tabular-nums">{value}</p>
    </div>
  )
}

function NotesEditor({ customer, businessId }: { customer: CustomerDetail; businessId: string }) {
  const [notes, setNotes] = useState(customer.notes ?? '')
  const [saved, setSaved] = useState(customer.notes ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const save = async () => {
    setIsSaving(true)
    try {
      const updated = await customersService.updateNotes(businessId, customer.id, notes)
      setSaved(updated.notes ?? '')
      toast.success('Notas guardadas')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        label="Notas internas"
        placeholder="Preferencias, alergias, cómo le gusta el corte… Solo las ve tu equipo."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={1000}
        rows={4}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={save} isLoading={isSaving} disabled={notes === saved}>
          Guardar notas
        </Button>
      </div>
    </div>
  )
}

export function CustomerDetailPage() {
  const { customerId = '' } = useParams()
  const { business } = useActiveBusiness()
  const tz = business.timezone
  const { data: customer, isLoading, error } = useAsync<CustomerDetail | null>(
    `${business.id}|${customerId}`,
    () => customersService.get(business.id, customerId),
    null,
  )

  const back = (
    <Link
      to="/app/customers"
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
    >
      <ArrowLeft className="size-4" /> Clientes
    </Link>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }
  if (error || !customer) {
    return (
      <>
        {back}
        <Alert message={error ?? 'Cliente no encontrado'} />
      </>
    )
  }

  return (
    <>
      {back}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-fg">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-fg-muted">
            <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-1.5 hover:text-fg">
              <Phone className="size-3.5" /> {prettyPhone(customer.phone)}
            </a>
            {customer.email && (
              <a href={`mailto:${customer.email}`} className="inline-flex items-center gap-1.5 hover:text-fg">
                <Mail className="size-3.5" /> {customer.email}
              </a>
            )}
            {customer.whatsappOptIn && (
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <MessageCircle className="size-3.5" /> Recibe avisos por WhatsApp
              </span>
            )}
          </div>
        </div>
        <a
          href={whatsappUrl(customer.phone)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-2 self-start rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 sm:self-auto"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Citas" value={customer.appointmentsCount} />
        <Stat label="Completadas" value={customer.completedCount} />
        <Stat label="No asistió" value={customer.noShowCount} />
        <Stat label="Total gastado" value={formatCOP(customer.totalSpent)} />
      </div>

      {customer.nextAppointmentAt && (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-brand/30 bg-brand-soft px-4 py-3 text-sm text-fg">
          <CalendarClock className="size-4 text-brand-hover" />
          Próxima cita:{' '}
          {capitalize(formatInTz(customer.nextAppointmentAt, tz, "EEEE d 'de' MMMM, h:mm aaa"))}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-3 text-sm font-medium text-fg">Historial</h2>
          {customer.appointments.length === 0 ? (
            <p className="text-sm text-fg-subtle">Sin citas todavía.</p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {customer.appointments.map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-28 shrink-0 text-sm">
                    <p className="text-fg">{formatInTz(a.startsAt, tz, 'd MMM yyyy')}</p>
                    <p className="text-xs text-fg-subtle">{formatInTz(a.startsAt, tz, 'h:mm aaa')}</p>
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate text-fg">{a.service.name}</p>
                    <p className="truncate text-xs text-fg-subtle">
                      {a.resource.name} · {SOURCE_LABELS[a.source]}
                    </p>
                  </div>
                  <span className="hidden text-sm text-fg-muted tabular-nums sm:block">
                    {formatCOP(a.price)}
                  </span>
                  <AppointmentStatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="h-fit rounded-lg border border-line bg-surface p-4">
          <NotesEditor key={customer.id} customer={customer} businessId={business.id} />
        </aside>
      </div>
    </>
  )
}
