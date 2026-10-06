export type PlanCode = 'BASIC' | 'PRO' | 'PREMIUM'

export interface Plan {
  code: PlanCode
  name: string
  description: string
  /** COP por mes */
  priceMonthly: number
  features: string[]
}

export type SubscriptionStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED'

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'OTHER'

export interface Subscription {
  id: string
  status: SubscriptionStatus
  businessId: string | null
  isComplimentary: boolean
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  createdAt: string
  plan: Plan
}

export interface SubscriptionPayment {
  id: string
  /** COP */
  amount: number
  status: 'APPROVED' | 'DECLINED'
  provider: 'SIMULATED' | 'WOMPI'
  reference: string
  cardBrand: CardBrand | null
  cardLast4: string | null
  failureReason: string | null
  createdAt: string
}

export interface BusinessSubscription extends Subscription {
  payments: SubscriptionPayment[]
}

/** Lo único que viaja al backend: nunca el número completo ni el CVC */
export interface PayPayload {
  cardBrand: CardBrand
  cardLast4: string
  holderName: string
}
