import { CalendarPlus, Download } from 'lucide-react'
import { calendarFileUrl } from '@/services/publicBooking'

interface AddToCalendarProps {
  /** Token del enlace privado de la cita */
  token: string
  title: string
  startsAt: string
  endsAt: string
  details: string
  location?: string | null
}

/** 2026-10-06T15:00:00.000Z → 20261006T150000Z (formato de Google Calendar) */
const gcalDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** "Agregar a mi calendario": Google Calendar (enlace) o archivo .ics (Apple, Outlook). */
export function AddToCalendar({ token, title, startsAt, endsAt, details, location }: AddToCalendarProps) {
  const google = new URL('https://calendar.google.com/calendar/render')
  google.searchParams.set('action', 'TEMPLATE')
  google.searchParams.set('text', title)
  google.searchParams.set('dates', `${gcalDate(startsAt)}/${gcalDate(endsAt)}`)
  google.searchParams.set('details', details)
  if (location) google.searchParams.set('location', location)

  const button =
    'inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-line-strong bg-surface-2 px-3 text-sm font-medium text-fg hover:bg-line'

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-sm text-fg-muted">
        <CalendarPlus className="size-4" /> Agregar a mi calendario
      </p>
      <div className="flex gap-2">
        <a href={google.toString()} target="_blank" rel="noreferrer" className={button}>
          Google Calendar
        </a>
        <a href={calendarFileUrl(token)} download="cita.ics" className={button}>
          <Download className="size-3.5" /> Apple / Outlook
        </a>
      </div>
    </div>
  )
}
