import type {
  BusinessSubscription,
  PayPayload,
  Plan,
  PlanCode,
  Subscription,
} from '@/types/subscription'
import { api } from './api'

export const subscriptionsService = {
  async plans(): Promise<Plan[]> {
    const { data } = await api.get<Plan[]>('/plans')
    return data
  },

  /** Suscripción del próximo negocio (sin negocio aún); `null` = no ha elegido plan */
  async current(): Promise<Subscription | null> {
    const { data } = await api.get<Subscription | null>('/subscriptions/current')
    return data || null
  },

  /** Elige el plan (o lo cambia mientras no haya pagado) */
  async choose(planCode: PlanCode): Promise<Subscription> {
    const { data } = await api.post<Subscription>('/subscriptions', { planCode })
    return data
  },

  async pay(subscriptionId: string, payload: PayPayload): Promise<Subscription> {
    const { data } = await api.post<Subscription>(`/subscriptions/${subscriptionId}/pay`, payload)
    return data
  },

  async forBusiness(businessId: string): Promise<BusinessSubscription | null> {
    const { data } = await api.get<BusinessSubscription | null>(
      `/businesses/${businessId}/subscription`,
    )
    return data || null
  },
}
