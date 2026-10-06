import type {
  Business,
  CreateBusinessPayload,
  UpdateBusinessPayload,
} from '@/types/business'
import { api } from './api'

export const businessesService = {
  async listMine(): Promise<Business[]> {
    const { data } = await api.get<Business[]>('/businesses')
    return data
  },

  async create(payload: CreateBusinessPayload): Promise<Business> {
    const { data } = await api.post<Business>('/businesses', payload)
    return data
  },

  async update(businessId: string, payload: UpdateBusinessPayload): Promise<Business> {
    const { data } = await api.patch<Business>(`/businesses/${businessId}`, payload)
    return data
  },

  async checkSlug(slug: string): Promise<{ slug: string; available: boolean }> {
    const { data } = await api.get('/businesses/slug-available', { params: { slug } })
    return data
  },
}
