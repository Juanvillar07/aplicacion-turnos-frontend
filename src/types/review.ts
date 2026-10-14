import type { BusinessCategory } from './business'

export interface RatingSummary {
  /** null = aún sin reseñas */
  average: number | null
  count: number
  byStars: { stars: number; count: number }[]
}

/** Reseña tal como se ve en la página pública */
export interface PublicReview {
  id: string
  rating: number
  comment: string | null
  reply: string | null
  repliedAt: string | null
  createdAt: string
  /** "Laura G." */
  author: string
  serviceName: string
}

export interface PublicReviewPage {
  items: PublicReview[]
  total: number
  page: number
  pageSize: number
}

/** Lo que ve el cliente al abrir el enlace /resena/:token */
export interface ReviewInvite {
  business: {
    name: string
    slug: string
    category: BusinessCategory
    logoUrl: string | null
    timezone: string
  }
  service: string
  resource: string
  startsAt: string
  customerName: string
  expired: boolean
  review: { rating: number; comment: string | null; createdAt: string } | null
}

/** Reseña en el panel del negocio */
export interface PanelReview {
  id: string
  rating: number
  comment: string | null
  reply: string | null
  repliedAt: string | null
  hidden: boolean
  createdAt: string
  customer: { id: string; name: string }
  serviceName: string
  resourceName: string
  appointmentStartsAt: string
}

export interface PanelReviewPage {
  items: PanelReview[]
  total: number
  page: number
  pageSize: number
  summary: RatingSummary & { hidden: number }
}
