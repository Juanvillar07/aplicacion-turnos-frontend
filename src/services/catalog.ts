import type { Service, ServicePayload, UpdateServicePayload } from '@/types/catalog'
import { api } from './api'

const base = (businessId: string) => `/businesses/${businessId}/services`

export const catalogService = {
  async list(businessId: string, includeInactive = false): Promise<Service[]> {
    const { data } = await api.get<Service[]>(base(businessId), {
      params: includeInactive ? { includeInactive: true } : undefined,
    })
    return data
  },

  async create(businessId: string, payload: ServicePayload): Promise<Service> {
    const { data } = await api.post<Service>(base(businessId), payload)
    return data
  },

  async update(
    businessId: string,
    serviceId: string,
    payload: UpdateServicePayload,
  ): Promise<Service> {
    const { data } = await api.patch<Service>(`${base(businessId)}/${serviceId}`, payload)
    return data
  },
}
