import type { AppointmentStatus } from './appointment'
import type { BusinessCategory } from './business'
import type { ResourceType } from './resource'
import type { PublicReviewPage, RatingSummary } from './review'

export interface PublicService {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
}

export interface PublicResource {
  id: string
  name: string
  type: ResourceType
  serviceIds: string[]
}

/** Perfil público de un negocio: lo que ve el cliente en /b/:slug */
export interface PublicBusiness {
  name: string
  slug: string
  category: BusinessCategory
  phone: string | null
  address: string | null
  city: string | null
  timezone: string
  maxDaysAhead: number
  autoConfirm: boolean
  whatsappEnabled: boolean
  description: string | null
  logoUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  websiteUrl: string | null
  photos: { id: string; url: string }[]
  rating: RatingSummary
  /** Primera página de reseñas publicadas */
  reviews: PublicReviewPage
  services: PublicService[]
  resources: PublicResource[]
}

export interface Slot {
  startsAt: string
  resourceIds: string[]
}

export interface CustomerInput {
  name: string
  email: string
  phone: string
  /** Casilla "Quiero recibir avisos por WhatsApp" */
  whatsappOptIn?: boolean
}

export interface BookPayload {
  serviceId: string
  resourceId: string | null
  startsAt: string
  customer: CustomerInput
}

/** Vista de una cita para el cliente (enlace privado /cita/:token) */
export interface PublicAppointment {
  id: string
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  price: number
  canCancel: boolean
  /** Se puede mover de horario (respeta la anticipación mínima del negocio) */
  canReschedule: boolean
  business: {
    name: string
    slug: string
    category: BusinessCategory
    phone: string | null
    address: string | null
    city: string | null
    timezone: string
  }
  service: { name: string; durationMinutes: number }
  resource: { name: string; type: ResourceType }
  customer: { name: string }
  /** Solo viene en la respuesta de la reserva */
  manageToken?: string
}
