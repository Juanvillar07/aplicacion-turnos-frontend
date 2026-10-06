export type ResourceType = 'PERSON' | 'SPACE'

export interface WorkingHoursSlot {
  /** 0 = domingo … 6 = sábado */
  dayOfWeek: number
  /** Minutos desde las 00:00 */
  startMinute: number
  endMinute: number
}

export interface Resource {
  id: string
  businessId: string
  name: string
  type: ResourceType
  userId: string | null
  /** Cuenta del profesional; null = "sin cuenta" (no entra al panel) */
  user: { id: string; name: string; email: string } | null
  isActive: boolean
  serviceIds: string[]
  workingHours: WorkingHoursSlot[]
  createdAt: string
  updatedAt: string
}

export interface CreateResourcePayload {
  name: string
  type: ResourceType
  serviceIds?: string[]
}

export interface UpdateResourcePayload {
  name?: string
  isActive?: boolean
}
