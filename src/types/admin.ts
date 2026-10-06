import type { AppointmentSource, AppointmentStatus } from './appointment'
import type { BusinessCategory, BusinessStatus, MemberRole } from './business'
import type { PlanCode, SubscriptionPayment, SubscriptionStatus } from './subscription'

/** Suscripción de un negocio vista por el superadministrador */
export interface AdminSubscriptionSummary {
  status: SubscriptionStatus
  isComplimentary: boolean
  currentPeriodEnd: string | null
  plan: { code: PlanCode; name: string; priceMonthly: number }
}

export interface DeliverySummary {
  sent: number
  failed: number
  preview: number
}

export interface PlatformMetrics {
  businesses: { total: number; active: number; suspended: number; newThisMonth: number }
  users: { total: number; newThisMonth: number }
  subscriptions: {
    /** COP cobrados (pagos aprobados) */
    revenueThisMonth: number
    revenueLastMonth: number
    paymentsThisMonth: number
    complimentary: number
    byPlan: { code: PlanCode; name: string; count: number }[]
  }
  appointments: {
    thisMonth: number
    lastMonth: number
    bySource: Record<AppointmentSource, number>
  }
  messages: {
    email: DeliverySummary
    whatsapp: DeliverySummary & { inbound: number }
  }
  byCategory: { category: BusinessCategory; count: number }[]
  topBusinesses: { id: string; name: string; slug: string; appointments: number }[]
  /** Últimos 6 meses, del más antiguo al actual ("2026-10") */
  history: { month: string; appointments: number; businesses: number }[]
}

export interface AdminBusinessRow {
  id: string
  name: string
  slug: string
  category: BusinessCategory
  city: string | null
  status: BusinessStatus
  whatsappEnabled: boolean
  createdAt: string
  owner: { name: string; email: string } | null
  membersCount: number
  appointmentsThisMonth: number
  subscription: AdminSubscriptionSummary | null
}

export interface AdminBusinessPage {
  items: AdminBusinessRow[]
  total: number
  page: number
  pageSize: number
}

export type AdminActionType = 'SUSPEND_BUSINESS' | 'REACTIVATE_BUSINESS'

export interface AdminBusinessDetail {
  id: string
  name: string
  slug: string
  category: BusinessCategory
  phone: string | null
  address: string | null
  city: string | null
  timezone: string
  autoConfirm: boolean
  whatsappEnabled: boolean
  status: BusinessStatus
  suspendedAt: string | null
  suspendedReason: string | null
  createdAt: string
  subscription:
    | (AdminSubscriptionSummary & {
        currentPeriodStart: string | null
        payments: Omit<SubscriptionPayment, 'reference'>[]
      })
    | null
  members: {
    id: string
    name: string
    email: string
    emailVerifiedAt: string | null
    role: MemberRole
    joinedAt: string
  }[]
  counts: { services: number; resources: number; customers: number; appointments: number }
  lastAppointmentAt: string | null
  usage: {
    thisMonth: number
    bySource: Record<AppointmentSource, number>
    byStatus: Partial<Record<AppointmentStatus, number>>
    email: DeliverySummary
    whatsapp: DeliverySummary
    history: { month: string; appointments: number }[]
  }
  recentFailures: {
    id: string
    channel: 'email' | 'whatsapp'
    kind: string
    error: string | null
    createdAt: string
  }[]
  actions: {
    id: string
    type: AdminActionType
    reason: string | null
    createdAt: string
    admin: { name: string; email: string }
  }[]
}
