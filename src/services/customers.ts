import type { CustomerDetail, CustomerPage } from '@/types/customer'
import { api } from './api'

const base = (businessId: string) => `/businesses/${businessId}/customers`

export const customersService = {
  async list(businessId: string, search = '', page = 1): Promise<CustomerPage> {
    const { data } = await api.get<CustomerPage>(base(businessId), {
      params: { ...(search && { search }), page },
    })
    return data
  },

  async get(businessId: string, customerId: string): Promise<CustomerDetail> {
    const { data } = await api.get<CustomerDetail>(`${base(businessId)}/${customerId}`)
    return data
  },

  async updateNotes(
    businessId: string,
    customerId: string,
    notes: string,
  ): Promise<CustomerDetail> {
    const { data } = await api.patch<CustomerDetail>(`${base(businessId)}/${customerId}`, {
      notes,
    })
    return data
  },
}
