import axios from 'axios'
import { useMemo, useState } from 'react'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/services/api'
import { publicBookingService } from '@/services/publicBooking'
import { toast } from '@/store/toastStore'
import type { PublicAppointment, Slot } from '@/types/booking'
import { capitalize, daysBetween, formatDate, todayIn } from '@/utils/date'
import { DateStrip } from './DateStrip'
import { SlotGrid } from './SlotGrid'

const NO_DAYS: string[] = []
const NO_SLOTS: Slot[] = []

interface ReschedulePanelProps {
  token: string
  timezone: string
  onDone: (appointment: PublicAppointment) => void
  onCancel: () => void
}

/** El cliente elige un nuevo día y hora (mismo servicio y profesional). */
export function ReschedulePanel({ token, timezone, onDone, onCancel }: ReschedulePanelProps) {
  const [reloadKey, setReloadKey] = useState(0)
  const [pickedDate, setPickedDate] = useState<string | null>(null)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const days = useAsync(
    `${token}|${reloadKey}`,
    () => publicBookingService.rescheduleDays(token),
    NO_DAYS,
  )
  // Sin elección del cliente, se muestra el primer día con turnos
  const date = pickedDate ?? days.data[0] ?? null
  const slots = useAsync(
    date ? `${token}|${date}|${reloadKey}` : null,
    () => publicBookingService.rescheduleSlots(token, date!),
    NO_SLOTS,
  )
  const available = useMemo(() => new Set(days.data), [days.data])
  const today = todayIn(timezone)

  const confirm = async () => {
    if (!slot) return
    setIsSaving(true)
    try {
      const updated = await publicBookingService.reschedule(token, slot.startsAt)
      toast.success(
        updated.status === 'PENDING'
          ? 'Solicitamos el cambio: el negocio debe confirmarlo'
          : 'Tu cita fue reprogramada',
      )
      onDone(updated)
    } catch (err) {
      toast.error(getErrorMessage(err))
      // Si el turno se ocupó, se recarga la disponibilidad
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setSlot(null)
        setReloadKey((k) => k + 1)
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (days.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    )
  }

  if (days.data.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-dashed border-line-strong p-5 text-center">
        <p className="text-sm text-fg-muted">
          No hay otros horarios disponibles con este profesional. Comunícate con el negocio.
        </p>
        <Button variant="secondary" onClick={onCancel}>
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-base font-medium text-fg">Elige el nuevo horario</h3>
      <DateStrip
        from={today}
        days={daysBetween(today, days.data[days.data.length - 1])}
        available={available}
        selected={date}
        onSelect={(d) => {
          setPickedDate(d)
          setSlot(null)
        }}
      />
      {date && (
        <div>
          <p className="mb-3 text-sm font-medium text-fg">{capitalize(formatDate(date))}</p>
          {slots.isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : slots.data.length === 0 ? (
            <p className="text-sm text-fg-muted">No quedan turnos este día.</p>
          ) : (
            <SlotGrid
              slots={slots.data}
              timezone={timezone}
              selected={slot?.startsAt ?? null}
              onSelect={setSlot}
            />
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button onClick={confirm} isLoading={isSaving} disabled={!slot} className="sm:flex-1">
          Confirmar nuevo horario
        </Button>
        <Button variant="secondary" onClick={onCancel} className="sm:flex-1">
          No cambiar
        </Button>
      </div>
    </div>
  )
}
