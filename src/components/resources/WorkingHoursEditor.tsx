import { CopyPlus, Plus, Trash2 } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { fieldClass } from '@/components/common/Input'
import { Switch } from '@/components/common/Switch'
import { WEEK_DAYS } from '@/constants/business'
import { toast } from '@/store/toastStore'
import type { WorkingHoursSlot } from '@/types/resource'
import { minutesToTime, timeToMinutes } from '@/utils/format'
import { findScheduleError } from '@/utils/schedule'

export const WORKING_HOURS_FORM_ID = 'working-hours-form'

interface TimeRange {
  start: string
  end: string
}

type WeekState = Record<number, TimeRange[]>

const DEFAULT_RANGE: TimeRange = { start: '09:00', end: '18:00' }

function toWeekState(slots: WorkingHoursSlot[]): WeekState {
  const state: WeekState = {}
  for (const day of WEEK_DAYS) {
    state[day.value] = slots
      .filter((s) => s.dayOfWeek === day.value)
      .sort((a, b) => a.startMinute - b.startMinute)
      .map((s) => ({ start: minutesToTime(s.startMinute), end: minutesToTime(s.endMinute) }))
  }
  return state
}

function toSlots(state: WeekState): WorkingHoursSlot[] {
  return Object.entries(state).flatMap(([day, ranges]) =>
    ranges.map((r) => ({
      dayOfWeek: Number(day),
      startMinute: timeToMinutes(r.start),
      endMinute: timeToMinutes(r.end),
    })),
  )
}

interface WorkingHoursEditorProps {
  initial: WorkingHoursSlot[]
  onSubmit: (hours: WorkingHoursSlot[]) => void
}

export function WorkingHoursEditor({ initial, onSubmit }: WorkingHoursEditorProps) {
  const [week, setWeek] = useState<WeekState>(() => toWeekState(initial))
  /** Día con el error de validación: se resalta hasta que se edite */
  const [invalidDay, setInvalidDay] = useState<number | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const setDay = (day: number, ranges: TimeRange[]) => {
    setWeek((prev) => ({ ...prev, [day]: ranges }))
    if (day === invalidDay) setInvalidDay(null)
  }

  const updateRange = (day: number, index: number, patch: Partial<TimeRange>) =>
    setDay(
      day,
      week[day].map((r, i) => (i === index ? { ...r, ...patch } : r)),
    )

  /** Copia las franjas de este día a todos los demás días que estén abiertos. */
  const copyToOpenDays = (day: number) =>
    setWeek((prev) => {
      const next = { ...prev }
      for (const d of WEEK_DAYS) {
        if (d.value !== day && prev[d.value].length > 0) {
          next[d.value] = prev[day].map((r) => ({ ...r }))
        }
      }
      return next
    })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const slots = toSlots(week)
    const problem = findScheduleError(slots)
    if (!problem) {
      setInvalidDay(null)
      onSubmit(slots)
      return
    }
    // Avisa con un toast y lleva la vista al día que hay que corregir
    toast.error(problem.message)
    setInvalidDay(problem.dayOfWeek)
    formRef.current
      ?.querySelector(`[data-day="${problem.dayOfWeek}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <form
      ref={formRef}
      id={WORKING_HOURS_FORM_ID}
      onSubmit={handleSubmit}
      className="flex flex-col gap-1"
    >
      {WEEK_DAYS.map((day) => {
        const ranges = week[day.value]
        const isOpen = ranges.length > 0
        const isInvalid = day.value === invalidDay
        return (
          <div
            key={day.value}
            data-day={day.value}
            className={`flex flex-col gap-3 border-b py-3 last:border-0 sm:flex-row sm:items-start ${
              isInvalid
                ? 'animate-attention -mx-2 rounded-md border border-danger/50 bg-danger-soft px-2'
                : 'border-line'
            }`}
          >
            <div className="flex h-8 w-36 shrink-0 items-center">
              <Switch
                checked={isOpen}
                onChange={(open) => setDay(day.value, open ? [{ ...DEFAULT_RANGE }] : [])}
                label={day.label}
              />
            </div>

            {isOpen ? (
              <div className="flex flex-1 flex-col gap-2">
                {ranges.map((range, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      step={900}
                      aria-label={`${day.label} desde`}
                      value={range.start}
                      onChange={(e) => updateRange(day.value, i, { start: e.target.value })}
                      required
                      className={`h-8 w-28 ${fieldClass}`}
                    />
                    <span className="text-fg-subtle">–</span>
                    <input
                      type="time"
                      step={900}
                      aria-label={`${day.label} hasta`}
                      value={range.end}
                      onChange={(e) => updateRange(day.value, i, { end: e.target.value })}
                      required
                      className={`h-8 w-28 ${fieldClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => setDay(day.value, ranges.filter((_, j) => j !== i))}
                      aria-label="Quitar franja"
                      className="cursor-pointer rounded-md p-1.5 text-fg-subtle hover:bg-surface-2 hover:text-danger"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const last = ranges[ranges.length - 1]
                      const start = last ? last.end : DEFAULT_RANGE.start
                      const end = minutesToTime(Math.min(timeToMinutes(start) + 120, 1439))
                      setDay(day.value, [...ranges, { start, end }])
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 text-fg-muted hover:text-fg"
                  >
                    <Plus className="size-3.5" /> Agregar franja
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToOpenDays(day.value)}
                    className="inline-flex cursor-pointer items-center gap-1 text-fg-muted hover:text-fg"
                  >
                    <CopyPlus className="size-3.5" /> Copiar a días abiertos
                  </button>
                </div>
              </div>
            ) : (
              <p className="flex h-8 items-center text-sm text-fg-subtle">Cerrado</p>
            )}
          </div>
        )
      })}
    </form>
  )
}
