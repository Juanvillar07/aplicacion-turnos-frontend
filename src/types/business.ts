export type BusinessCategory =
  | 'BARBERSHOP'
  | 'BEAUTY'
  | 'CLINIC'
  | 'SPORTS_COURT'
  | 'OTHER'

/** ADMIN = administrador (gestiona, no atiende) · STAFF = profesional (atiende) */
export type MemberRole = 'ADMIN' | 'STAFF'

/** SUSPENDED = suspendido por la plataforma: sin reservas y panel en solo lectura */
export type BusinessStatus = 'ACTIVE' | 'SUSPENDED'

export interface Business {
  id: string
  name: string
  slug: string
  category: BusinessCategory
  phone: string | null
  address: string | null
  city: string | null
  timezone: string
  autoConfirm: boolean
  slotStepMinutes: number
  minNoticeMinutes: number
  maxDaysAhead: number
  whatsappEnabled: boolean
  status: BusinessStatus
  suspendedAt: string | null
  suspendedReason: string | null
  description: string | null
  logoUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  websiteUrl: string | null
  role: MemberRole
  createdAt: string
  updatedAt: string
}

export interface CreateBusinessPayload {
  name: string
  category: BusinessCategory
  phone?: string | null
  address?: string | null
  city?: string | null
}

export interface BookingSettings {
  autoConfirm: boolean
  slotStepMinutes: number
  minNoticeMinutes: number
  maxDaysAhead: number
}

/** Datos de la página pública (`null` borra el valor) */
export interface PublicProfilePayload {
  description?: string | null
  instagramUrl?: string | null
  facebookUrl?: string | null
  websiteUrl?: string | null
}

export interface UpdateBusinessPayload
  extends Partial<CreateBusinessPayload>, Partial<BookingSettings>, PublicProfilePayload {
  slug?: string
  whatsappEnabled?: boolean
}

export interface BusinessPhoto {
  id: string
  url: string
  sortOrder: number
}
