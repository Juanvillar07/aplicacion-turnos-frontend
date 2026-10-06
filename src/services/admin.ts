import type {
  AdminBusinessDetail,
  AdminBusinessPage,
  PlatformMetrics,
} from '@/types/admin'
import type { BusinessStatus } from '@/types/business'
import { api } from './api'

export interface BusinessFilters {
  search?: string
  status?: BusinessStatus | ''
  page?: number
}

export const adminService = {
  async metrics(): Promise<PlatformMetrics> {
    const { data } = await api.get<PlatformMetrics>('/admin/metrics')
    return data
  },

  async listBusinesses({ search, status, page = 1 }: BusinessFilters): Promise<AdminBusinessPage> {
    const { data } = await api.get<AdminBusinessPage>('/admin/businesses', {
      params: { ...(search && { search }), ...(status && { status }), page },
    })
    return data
  },

  async getBusiness(id: string): Promise<AdminBusinessDetail> {
    const { data } = await api.get<AdminBusinessDetail>(`/admin/businesses/${id}`)
    return data
  },

  async suspend(id: string, reason: string): Promise<AdminBusinessDetail> {
    const { data } = await api.post<AdminBusinessDetail>(`/admin/businesses/${id}/suspend`, {
      reason,
    })
    return data
  },

  async reactivate(id: string): Promise<AdminBusinessDetail> {
    const { data } = await api.post<AdminBusinessDetail>(`/admin/businesses/${id}/reactivate`)
    return data
  },
}
