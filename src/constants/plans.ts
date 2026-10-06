import type { BadgeTone } from '@/constants/appointment'
import type { CardBrand, PlanCode, SubscriptionStatus } from '@/types/subscription'

/** Plan que se destaca como "Más popular" */
export const POPULAR_PLAN: PlanCode = 'PRO'

export const SUBSCRIPTION_STATUS_META: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  PENDING_PAYMENT: { label: 'Pendiente de pago', tone: 'warning' },
  ACTIVE: { label: 'Activa', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'muted' },
  EXPIRED: { label: 'Vencida', tone: 'danger' },
}

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  OTHER: 'Tarjeta',
}

/** Tarjetas del pago simulado (no se cobra nada) */
export const TEST_CARDS = [
  { number: '4242 4242 4242 4242', result: 'Pago aprobado' },
  { number: '4000 0000 0000 0002', result: 'Pago rechazado' },
]
