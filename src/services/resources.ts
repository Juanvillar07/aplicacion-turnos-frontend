import type {
  CreateResourcePayload,
  Resource,
  UpdateResourcePayload,
  WorkingHoursSlot,
} from '@/types/resource'
import { api } from './api'

const base = (businessId: string) => `/businesses/${businessId}/resources`

export const resourcesService = {
  async list(businessId: string, includeInactive = false): Promise<Resource[]> {
    const { data } = await api.get<Resource[]>(base(businessId), {
      params: includeInactive ? { includeInactive: true } : undefined,
    })
    return data
  },

  async create(businessId: string, payload: CreateResourcePayload): Promise<Resource> {
    const { data } = await api.post<Resource>(base(businessId), payload)
    return data
  },

  async update(
    businessId: string,
    resourceId: string,
    payload: UpdateResourcePayload,
  ): Promise<Resource> {
    const { data } = await api.patch<Resource>(`${base(businessId)}/${resourceId}`, payload)
    return data
  },

  async setServices(
    businessId: string,
    resourceId: string,
    serviceIds: string[],
  ): Promise<Resource> {
    const { data } = await api.put<Resource>(
      `${base(businessId)}/${resourceId}/services`,
      { serviceIds },
    )
    return data
  },

  async setWorkingHours(
    businessId: string,
    resourceId: string,
    hours: WorkingHoursSlot[],
  ): Promise<Resource> {
    const { data } = await api.put<Resource>(
      `${base(businessId)}/${resourceId}/working-hours`,
      { hours },
    )
    return data
  },
}
