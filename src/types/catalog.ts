export interface Service {
  id: string
  businessId: string
  name: string
  description: string | null
  durationMinutes: number
  /** Pesos colombianos, sin decimales */
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ServicePayload {
  name: string
  description?: string | null
  durationMinutes: number
  price: number
}

export interface UpdateServicePayload extends Partial<ServicePayload> {
  isActive?: boolean
}
