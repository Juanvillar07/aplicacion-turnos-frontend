import type { CustomerInput } from './booking'
import type { ResourceType } from './resource'

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'

export type AppointmentSource = 'WEB' | 'PANEL' | 'WHATSAPP'

export interface Customer {
  id: string
  name: string
  /** Las reservas por WhatsApp pueden no traer correo */
  email: string | null
  phone: string
  whatsappOptIn?: boolean
}

/** Cita tal como la ve el panel del negocio */
export interface Appointment {
  id: string
  businessId: string
  resourceId: string
  serviceId: string
  customerId: string
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  price: number
  source: AppointmentSource
  notes: string | null
  createdAt: string
  customer: Customer
  service: { id: string; name: string; durationMinutes: number }
  resource: { id: string; name: string; type: ResourceType }
}

export interface PanelBookPayload {
  serviceId: string
  resourceId: string | null
  startsAt: string
  customer: CustomerInput
  notes?: string
}

export interface TimeOff {
  id: string
  resourceId: string
  startsAt: string
  endsAt: string
  reason: string | null
  resource: { id: string; name: string }
}

export interface CreateTimeOffPayload {
  resourceId: string
  startsAt: string
  endsAt: string
  reason?: string
}
