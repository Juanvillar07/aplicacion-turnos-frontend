import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/** Fecha local del negocio, `YYYY-MM-DD` */
export type DateString = string

/** Hoy en la zona horaria del negocio. */
export function todayIn(timezone: string): DateString {
  return format(TZDate.tz(timezone), 'yyyy-MM-dd')
}

export function addDays(date: DateString, days: number): DateString {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** Días entre dos fechas `YYYY-MM-DD` (b - a) */
export function daysBetween(a: DateString, b: DateString): number {
  const toUtc = (d: DateString) => {
    const [y, m, day] = d.split('-').map(Number)
    return Date.UTC(y, m - 1, day)
  }
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000)
}

/** 0 = domingo … 6 = sábado */
export function dayOfWeek(date: DateString): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** Formatea un instante en la zona del negocio: `formatInTz(iso, tz, 'HH:mm')` */
export function formatInTz(instant: string | Date, timezone: string, pattern: string): string {
  return format(new TZDate(new Date(instant).getTime(), timezone), pattern, { locale: es })
}

/** "9:30 a. m." en la zona del negocio */
export function formatClock(instant: string | Date, timezone: string): string {
  return formatInTz(instant, timezone, 'h:mm aaa')
}

/** Fecha local de un instante en la zona del negocio */
export function toLocalDate(instant: string | Date, timezone: string): DateString {
  return formatInTz(instant, timezone, 'yyyy-MM-dd')
}

/** Minutos desde las 00:00 locales de un instante */
export function minutesOfDay(instant: string | Date, timezone: string): number {
  const d = new TZDate(new Date(instant).getTime(), timezone)
  return d.getHours() * 60 + d.getMinutes()
}

/** Fecha (YYYY-MM-DD) + hora (HH:mm) locales del negocio → ISO UTC */
export function localToIso(date: DateString, time: string, timezone: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(new TZDate(y, m - 1, d, hh, mm, 0, timezone).getTime()).toISOString()
}

/** Para mostrar una fecha sin hora (no depende de zona): "martes, 6 de octubre" */
export function formatDate(date: DateString, pattern = "EEEE, d 'de' MMMM"): string {
  const [y, m, d] = date.split('-').map(Number)
  return format(new Date(y, m - 1, d), pattern, { locale: es })
}

/** ¿Es una fecha `YYYY-MM-DD` real? */
export function isValidDate(value: string | null): value is DateString {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
