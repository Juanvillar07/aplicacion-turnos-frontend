import { Search } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { fieldClass, Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Select } from '@/components/common/Select'
import { Spinner } from '@/components/common/Spinner'
import { Textarea } from '@/components/common/Textarea'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/services/api'
import { appointmentsService } from '@/services/appointments'
import { toast } from '@/store/toastStore'
import type { Appointment, Customer } from '@/types/appointment'
import type { Slot } from '@/types/booking'
import type { Service } from '@/types/catalog'
import type { Resource } from '@/types/resource'
import { formatClock } from '@/utils/date'
import { formatDuration } from '@/utils/format'

const FORM_ID = 'new-appointment-form'
const NO_SLOTS: Slot[] = []
const NO_CUSTOMERS: Customer[] = []

interface NewAppointmentModalProps {
  open: boolean
  onClose: () => void
  businessId: string
  timezone: string
  defaultDate: string
  services: Service[]
  resources: Resource[]
  onCreated: (appointment: Appointment) => void
}

/** Cita registrada por el negocio (llamada, WhatsApp o cliente en el local). */
export function NewAppointmentModal(props: NewAppointmentModalProps) {
  if (!props.open) return null
  return <NewAppointmentForm {...props} />
}

function NewAppointmentForm({
  onClose,
  businessId,
  timezone,
  defaultDate,
  services,
  resources,
  onCreated,
}: NewAppointmentModalProps) {
  const activeServices = services.filter((s) => s.isActive)
  const [serviceId, setServiceId] = useState(activeServices[0]?.id ?? '')
  const [resourceId, setResourceId] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [slot, setSlot] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const providers = resources.filter((r) => r.isActive && r.serviceIds.includes(serviceId))

  const slots = useAsync(
    serviceId && date ? `${serviceId}|${resourceId}|${date}` : null,
    () => appointmentsService.slots(businessId, serviceId, date, resourceId || null),
    NO_SLOTS,
  )

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const suggestions = useAsync(
    debounced.length >= 2 ? debounced : null,
    () => appointmentsService.searchCustomers(businessId, debounced),
    NO_CUSTOMERS,
  )

  const pickCustomer = (c: Customer) => {
    setName(c.name)
    setEmail(c.email ?? '')
    setPhone(c.phone.replace(/^\+57/, ''))
    setSearch('')
    setDebounced('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!slot) {
      toast.error('Elige una hora para la cita')
      return
    }
    setIsSaving(true)
    try {
      const created = await appointmentsService.create(businessId, {
        serviceId,
        resourceId: resourceId || null,
        startsAt: slot,
        customer: { name, email, phone },
        notes: notes.trim() || undefined,
      })
      toast.success(`Cita creada para ${created.customer.name}`)
      onCreated(created)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setIsSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Nueva cita"
      description="Para reservas por teléfono, WhatsApp o en el local."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSaving}>
            Crear cita
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Servicio"
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value)
              setResourceId('')
              setSlot(null)
            }}
            options={activeServices.map((s) => ({
              value: s.id,
              label: `${s.name} (${formatDuration(s.durationMinutes)})`,
            }))}
          />
          <Select
            label="Con"
            value={resourceId}
            onChange={(e) => {
              setResourceId(e.target.value)
              setSlot(null)
            }}
            options={[
              { value: '', label: 'Cualquiera disponible' },
              ...providers.map((r) => ({ value: r.id, label: r.name })),
            ]}
          />
          <Input
            label="Fecha"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setSlot(null)
            }}
            required
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-fg-muted">Hora</p>
          {slots.isLoading ? (
            <Spinner className="size-4" />
          ) : slots.error ? (
            <Alert message={slots.error} />
          ) : slots.data.length === 0 ? (
            <p className="text-sm text-fg-subtle">No hay turnos libres ese día.</p>
          ) : (
            <div className="grid max-h-36 grid-cols-4 gap-1.5 overflow-y-auto sm:grid-cols-6">
              {slots.data.map((s) => (
                <button
                  key={s.startsAt}
                  type="button"
                  onClick={() => setSlot(s.startsAt)}
                  className={`h-8 cursor-pointer rounded-md border text-xs font-medium tabular-nums ${
                    slot === s.startsAt
                      ? 'border-brand bg-brand text-white'
                      : 'border-line bg-surface-2 text-fg hover:border-brand/60'
                  }`}
                >
                  {formatClock(s.startsAt, timezone)}
                </button>
              ))}
            </div>
          )}
        </div>

        <fieldset className="flex flex-col gap-4 rounded-lg border border-line p-4">
          <legend className="px-1 text-sm text-fg-muted">Cliente</legend>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" />
            <input
              aria-label="Buscar cliente"
              placeholder="Buscar cliente por nombre, celular o email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-9 pl-9 ${fieldClass}`}
            />
            {suggestions.data.length > 0 && search && (
              <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-line-strong bg-surface shadow-xl">
                {suggestions.data.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => pickCustomer(c)}
                      className="flex w-full cursor-pointer flex-col px-3 py-2 text-left hover:bg-surface-2"
                    >
                      <span className="text-sm text-fg">{c.name}</span>
                      <span className="text-xs text-fg-subtle">
                        {c.phone}{c.email && ` · ${c.email}`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              label="Celular"
              type="tel"
              placeholder="300 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </fieldset>

        <Textarea
          label="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={300}
          rows={2}
        />

      </form>
    </Modal>
  )
}
