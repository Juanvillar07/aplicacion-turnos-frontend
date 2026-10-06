import { Ban, Box, User } from 'lucide-react'
import { GRID_STATUSES, STATUS_META } from '@/constants/appointment'
import { useNow } from '@/hooks/useNow'
import type { Appointment, TimeOff } from '@/types/appointment'
import type { Resource } from '@/types/resource'
import { dayOfWeek, formatClock, minutesOfDay, toLocalDate } from '@/utils/date'
import { formatTime } from '@/utils/format'

/** Altura de un minuto en píxeles (84 px por hora) */
const PX = 1.4

interface DayGridProps {
  date: string
  timezone: string
  resources: Resource[]
  appointments: Appointment[]
  timeOffs: TimeOff[]
  onSelectAppointment: (appointment: Appointment) => void
  onSelectTimeOff: (timeOff: TimeOff) => void
}

/** Minutos del día [inicio, fin] de un intervalo, recortado al día `date`. */
function clampToDay(startsAt: string, endsAt: string, date: string, tz: string) {
  const start = toLocalDate(startsAt, tz) < date ? 0 : minutesOfDay(startsAt, tz)
  const end = toLocalDate(endsAt, tz) > date ? 24 * 60 : minutesOfDay(endsAt, tz)
  return [start, end] as const
}

export function DayGrid({
  date,
  timezone,
  resources,
  appointments,
  timeOffs,
  onSelectAppointment,
  onSelectTimeOff,
}: DayGridProps) {
  const weekday = dayOfWeek(date)
  const visible = appointments.filter((a) => GRID_STATUSES.includes(a.status))

  // Rango visible: desde la primera apertura (o cita) hasta el último cierre
  const bounds = [
    ...resources.flatMap((r) =>
      r.workingHours
        .filter((w) => w.dayOfWeek === weekday)
        .flatMap((w) => [w.startMinute, w.endMinute]),
    ),
    ...visible.flatMap((a) => clampToDay(a.startsAt, a.endsAt, date, timezone)),
  ]
  const startMin = bounds.length ? Math.floor(Math.min(...bounds) / 60) * 60 : 8 * 60
  const endMin = bounds.length ? Math.ceil(Math.max(...bounds) / 60) * 60 : 20 * 60
  const height = (endMin - startMin) * PX
  const y = (minute: number) => (Math.min(Math.max(minute, startMin), endMin) - startMin) * PX
  const hours = Array.from({ length: (endMin - startMin) / 60 + 1 }, (_, i) => startMin + i * 60)

  const now = useNow()
  const isToday = date === toLocalDate(now, timezone)
  const nowMin = minutesOfDay(now, timezone)

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <div className="min-w-fit">
        {/* Cabecera: un recurso por columna */}
        <div className="sticky top-0 z-10 flex border-b border-line bg-surface">
          <div className="w-14 shrink-0" />
          {resources.map((r) => {
            const Icon = r.type === 'PERSON' ? User : Box
            const count = visible.filter((a) => a.resourceId === r.id).length
            return (
              <div
                key={r.id}
                className="flex min-w-40 flex-1 items-center gap-2 border-l border-line px-3 py-2.5"
              >
                <Icon className="size-3.5 shrink-0 text-fg-subtle" />
                <span className="truncate text-sm font-medium text-fg">{r.name}</span>
                <span className="ml-auto text-xs text-fg-subtle tabular-nums">{count}</span>
              </div>
            )
          })}
        </div>

        <div className="relative my-3 flex" style={{ height }}>
          {/* Eje de horas */}
          <div className="relative w-14 shrink-0">
            {hours.map((m) => (
              <span
                key={m}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-fg-subtle tabular-nums"
                style={{ top: y(m) }}
              >
                {formatTime(m).replace(':00', '')}
              </span>
            ))}
          </div>

          {/* Líneas de hora y media hora */}
          <div className="pointer-events-none absolute inset-y-0 right-0 left-14">
            {hours.map((m) => (
              <div key={m} className="absolute inset-x-0 border-t border-line" style={{ top: y(m) }} />
            ))}
            {hours.slice(0, -1).map((m) => (
              <div
                key={`h${m}`}
                className="absolute inset-x-0 border-t border-dashed border-line/50"
                style={{ top: y(m + 30) }}
              />
            ))}
          </div>

          {resources.map((r) => {
            const windows = r.workingHours.filter((w) => w.dayOfWeek === weekday)
            return (
              <div
                key={r.id}
                className="relative min-w-40 flex-1 border-l border-line bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgb(255_255_255/0.025)_6px,rgb(255_255_255/0.025)_12px)]"
              >
                {/* Horario de atención (fondo liso) */}
                {windows.map((w) => (
                  <div
                    key={w.startMinute}
                    className="absolute inset-x-0 bg-surface"
                    style={{ top: y(w.startMinute), height: y(w.endMinute) - y(w.startMinute) }}
                  />
                ))}

                {timeOffs
                  .filter((t) => t.resourceId === r.id)
                  .map((t) => {
                    const [s, e] = clampToDay(t.startsAt, t.endsAt, date, timezone)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelectTimeOff(t)}
                        className="absolute inset-x-1 z-[1] flex cursor-pointer items-start gap-1.5 overflow-hidden rounded-md border border-line-strong bg-[repeating-linear-gradient(135deg,var(--color-surface-2),var(--color-surface-2)_5px,var(--color-line)_5px,var(--color-line)_10px)] px-2 py-1 text-left text-xs text-fg-muted"
                        style={{ top: y(s), height: Math.max(y(e) - y(s), 18) }}
                      >
                        <Ban className="mt-px size-3 shrink-0" />
                        <span className="truncate">{t.reason || 'Bloqueado'}</span>
                      </button>
                    )
                  })}

                {visible
                  .filter((a) => a.resourceId === r.id)
                  .map((a) => {
                    const [s, e] = clampToDay(a.startsAt, a.endsAt, date, timezone)
                    const h = Math.max(y(e) - y(s), 20)
                    const compact = h < 40
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => onSelectAppointment(a)}
                        className={`absolute inset-x-1 z-[2] cursor-pointer overflow-hidden rounded-md border px-2 text-left text-xs text-fg transition-colors ${STATUS_META[a.status].block} ${compact ? 'flex items-center gap-1.5 py-0' : 'py-1'}`}
                        style={{ top: y(s) + 1, height: h - 2 }}
                      >
                        <span className="shrink-0 font-medium tabular-nums">
                          {formatClock(a.startsAt, timezone)}
                        </span>
                        <span className={`truncate font-medium ${compact ? '' : 'block'}`}>
                          {a.customer.name}
                        </span>
                        {!compact && (
                          <span className="block truncate text-fg-muted">{a.service.name}</span>
                        )}
                      </button>
                    )
                  })}
              </div>
            )
          })}

          {/* Línea de "ahora" */}
          {isToday && nowMin >= startMin && nowMin <= endMin && (
            <div
              className="pointer-events-none absolute right-0 left-14 z-[3] border-t-2 border-danger"
              style={{ top: y(nowMin) }}
            >
              <span className="absolute -top-[5px] -left-1 size-2 rounded-full bg-danger" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
