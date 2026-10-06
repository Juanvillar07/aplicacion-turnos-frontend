import type { AppointmentSource, AppointmentStatus } from '@/types/appointment'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'muted' | 'warning' | 'danger'

export const STATUS_META: Record<
  AppointmentStatus,
  { label: string; tone: BadgeTone; block: string }
> = {
  PENDING: {
    label: 'Pendiente',
    tone: 'warning',
    block: 'border-amber-400/60 border-dashed bg-amber-500/10 hover:bg-amber-500/15',
  },
  CONFIRMED: {
    label: 'Confirmada',
    tone: 'brand',
    block: 'border-brand/50 bg-brand/20 hover:bg-brand/30',
  },
  COMPLETED: {
    label: 'Completada',
    tone: 'success',
    block: 'border-line-strong bg-surface-2 text-fg-muted hover:bg-line',
  },
  NO_SHOW: { label: 'No asistió', tone: 'danger', block: '' },
  CANCELLED: { label: 'Cancelada', tone: 'muted', block: '' },
}

/** Las que ocupan espacio en la grilla de la agenda */
export const GRID_STATUSES: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED']

export const SOURCE_LABELS: Record<AppointmentSource, string> = {
  WEB: 'Reserva web',
  PANEL: 'Creada en el panel',
  WHATSAPP: 'Reserva por WhatsApp',
}
