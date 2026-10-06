import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Select } from '@/components/common/Select'
import { Switch } from '@/components/common/Switch'
import { getErrorMessage } from '@/services/api'
import { appointmentsService } from '@/services/appointments'
import { toast } from '@/store/toastStore'
import type { Appointment } from '@/types/appointment'
import type { Resource } from '@/types/resource'
import { addDays, formatClock, localToIso } from '@/utils/date'

const FORM_ID = 'time-off-form'

interface TimeOffModalProps {
  open: boolean
  onClose: () => void
  businessId: string
  timezone: string
  defaultDate: string
  resources: Resource[]
  onCreated: () => void
}

/** Bloquea un rango de tiempo de un recurso (vacaciones, diligencias, mantenimiento…). */
export function TimeOffModal(props: TimeOffModalProps) {
  if (!props.open) return null
  return <TimeOffForm {...props} />
}

function TimeOffForm({
  onClose,
  businessId,
  timezone,
  defaultDate,
  resources,
  onCreated,
}: TimeOffModalProps) {
  const [resourceId, setResourceId] = useState(resources[0]?.id ?? '')
  const [allDay, setAllDay] = useState(false)
  const [startDate, setStartDate] = useState(defaultDate)
  const [startTime, setStartTime] = useState('12:00')
  const [endDate, setEndDate] = useState(defaultDate)
  const [endTime, setEndTime] = useState('14:00')
  const [reason, setReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [conflicts, setConflicts] = useState<Appointment[] | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const { conflicts } = await appointmentsService.createTimeOff(businessId, {
        resourceId,
        startsAt: localToIso(startDate, allDay ? '00:00' : startTime, timezone),
        // "Todo el día" bloquea hasta las 00:00 del día siguiente al último día
        endsAt: allDay
          ? localToIso(addDays(endDate, 1), '00:00', timezone)
          : localToIso(endDate, endTime, timezone),
        reason: reason.trim() || undefined,
      })
      onCreated()
      if (conflicts.length > 0) {
        setConflicts(conflicts)
      } else {
        toast.success('Horario bloqueado')
        onClose()
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  // Tras crear el bloqueo, avisa de las citas que ya existían en ese rango
  if (conflicts) {
    return (
      <Modal
        open
        onClose={onClose}
        title="Bloqueo creado"
        footer={<Button onClick={onClose}>Entendido</Button>}
      >
        <div className="flex flex-col gap-3">
          <Alert
            message={`Hay ${conflicts.length} cita(s) dentro del bloqueo. No se cancelaron: revísalas en la agenda y avisa a los clientes.`}
          />
          <ul className="divide-y divide-line rounded-md border border-line text-sm">
            {conflicts.map((a) => (
              <li key={a.id} className="flex justify-between gap-3 px-3 py-2">
                <span className="text-fg">{a.customer.name}</span>
                <span className="text-fg-muted tabular-nums">
                  {formatClock(a.startsAt, timezone)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Bloquear horario"
      description="Durante el bloqueo no se podrán hacer reservas."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSaving}>
            Bloquear
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="¿Quién o qué?"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          options={resources.map((r) => ({ value: r.id, label: r.name }))}
        />
        <Switch checked={allDay} onChange={setAllDay} label="Todo el día" />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Desde"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              if (e.target.value > endDate) setEndDate(e.target.value)
            }}
            required
          />
          {!allDay && (
            <Input
              label="Hora"
              type="time"
              step={900}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          )}
          <Input
            label="Hasta"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          {!allDay && (
            <Input
              label="Hora"
              type="time"
              step={900}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          )}
        </div>
        <Input
          label="Motivo (opcional)"
          placeholder="Vacaciones, almuerzo, mantenimiento…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={120}
        />
      </form>
    </Modal>
  )
}
