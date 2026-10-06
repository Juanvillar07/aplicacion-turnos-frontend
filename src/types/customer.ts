import type { AppointmentSource, AppointmentStatus, Customer } from './appointment'

export interface CustomerStats {
  /** Citas no canceladas */
  appointmentsCount: number
  completedCount: number
  noShowCount: number
  /** Suma de citas completadas (COP) */
  totalSpent: number
  lastVisitAt: string | null
  nextAppointmentAt: string | null
}

export interface CustomerSummary extends Customer, CustomerStats {
  notes: string | null
  createdAt: string
}

export interface CustomerPage {
  items: CustomerSummary[]
  total: number
  page: number
  pageSize: number
}

export interface CustomerHistoryItem {
  id: string
  startsAt: string
  status: AppointmentStatus
  price: number
  source: AppointmentSource
  service: { name: string }
  resource: { name: string }
}

export interface CustomerDetail extends CustomerSummary {
  appointments: CustomerHistoryItem[]
}
