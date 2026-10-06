import { WEEK_DAYS } from '@/constants/business'
import type { WorkingHoursSlot } from '@/types/resource'
import { formatTime } from './format'

export interface ScheduleLine {
  days: string
  hours: string
}

/**
 * Resume el horario agrupando días consecutivos con las mismas franjas:
 *   [{ days: 'Lun – Vie', hours: '9:00 a. m. – 1:00 p. m., 2:00 p. m. – 7:00 p. m.' }]
 */
export function summarizeSchedule(slots: WorkingHoursSlot[]): ScheduleLine[] {
  const keyFor = (day: number) =>
    slots
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.startMinute - b.startMinute)
      .map((s) => `${formatTime(s.startMinute)} – ${formatTime(s.endMinute)}`)
      .join(', ')

  const lines: ScheduleLine[] = []
  let groupStart: (typeof WEEK_DAYS)[number] | null = null
  let groupEnd: (typeof WEEK_DAYS)[number] | null = null
  let groupKey = ''

  const flush = () => {
    if (groupStart && groupKey) {
      lines.push({
        days:
          groupStart === groupEnd ? groupStart.short : `${groupStart.short} – ${groupEnd!.short}`,
        hours: groupKey,
      })
    }
  }

  for (const day of WEEK_DAYS) {
    const key = keyFor(day.value)
    if (key && key === groupKey) {
      groupEnd = day
      continue
    }
    flush()
    groupStart = day
    groupEnd = day
    groupKey = key
  }
  flush()
  return lines
}

export interface ScheduleError {
  dayOfWeek: number
  message: string
}

/** Primer problema del horario (franja invertida o solapada), o null si es válido. */
export function findScheduleError(slots: WorkingHoursSlot[]): ScheduleError | null {
  for (const day of WEEK_DAYS) {
    const daySlots = slots
      .filter((s) => s.dayOfWeek === day.value)
      .sort((a, b) => a.startMinute - b.startMinute)
    for (let i = 0; i < daySlots.length; i++) {
      if (daySlots[i].startMinute >= daySlots[i].endMinute) {
        return {
          dayOfWeek: day.value,
          message: `${day.label}: la hora de inicio debe ser anterior a la de fin`,
        }
      }
      if (i > 0 && daySlots[i].startMinute < daySlots[i - 1].endMinute) {
        return { dayOfWeek: day.value, message: `${day.label}: hay franjas que se solapan` }
      }
    }
  }
  return null
}
