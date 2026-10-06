import { Ban } from 'lucide-react'
import { GRID_STATUSES } from '@/constants/appointment'
import type { Appointment, TimeOff } from '@/types/appointment'
import type { Resource } from '@/types/resource'
import { formatClock } from '@/utils/date'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'

interface AgendaListProps {
  timezone: string
  resources: Resource[]
  appointments: Appointment[]
  timeOffs: TimeOff[]
  onSelectAppointment: (appointment: Appointment) => void
  onSelectTimeOff: (timeOff: TimeOff) => void
}

/** Vista móvil de la agenda: citas del día agrupadas por recurso. */
export function AgendaList({
  timezone,
  resources,
  appointments,
  timeOffs,
  onSelectAppointment,
  onSelectTimeOff,
}: AgendaListProps) {
  const visible = appointments.filter((a) => GRID_STATUSES.includes(a.status))

  return (
    <div className="flex flex-col gap-5">
      {resources.map((r) => {
        const items = [
          ...visible
            .filter((a) => a.resourceId === r.id)
            .map((a) => ({ kind: 'appointment' as const, at: a.startsAt, a })),
          ...timeOffs
            .filter((t) => t.resourceId === r.id)
            .map((t) => ({ kind: 'timeOff' as const, at: t.startsAt, t })),
        ].sort((x, y) => x.at.localeCompare(y.at))

        return (
          <section key={r.id}>
            <h3 className="mb-2 text-sm font-medium text-fg">
              {r.name} <span className="text-fg-subtle">· {items.length}</span>
            </h3>
            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line px-4 py-3 text-sm text-fg-subtle">
                Sin citas
              </p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
                {items.map((item) =>
                  item.kind === 'appointment' ? (
                    <li key={item.a.id}>
                      <button
                        type="button"
                        onClick={() => onSelectAppointment(item.a)}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
                      >
                        <span className="w-[4.5rem] shrink-0 text-sm font-medium whitespace-nowrap text-fg tabular-nums">
                          {formatClock(item.a.startsAt, timezone)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-fg">
                            {item.a.customer.name}
                          </span>
                          <span className="block truncate text-xs text-fg-subtle">
                            {item.a.service.name}
                          </span>
                        </span>
                        <AppointmentStatusBadge status={item.a.status} />
                      </button>
                    </li>
                  ) : (
                    <li key={item.t.id}>
                      <button
                        type="button"
                        onClick={() => onSelectTimeOff(item.t)}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-fg-muted hover:bg-surface-2"
                      >
                        <span className="w-[4.5rem] shrink-0 text-sm whitespace-nowrap tabular-nums">
                          {formatClock(item.t.startsAt, timezone)}
                        </span>
                        <Ban className="size-4" />
                        <span className="truncate text-sm">{item.t.reason || 'Bloqueado'}</span>
                      </button>
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
