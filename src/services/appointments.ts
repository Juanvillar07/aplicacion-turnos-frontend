import type {
  Appointment,
  AppointmentStatus,
  CreateTimeOffPayload,
  Customer,
  PanelBookPayload,
  TimeOff,
} from '@/types/appointment'
import type { Slot } from '@/types/booking'
import { api } from './api'

const base = (businessId: string) => `/businesses/${businessId}`

export const appointmentsService = {
  async listByDay(businessId: string, date: string): Promise<Appointment[]> {
    const { data } = await api.get<Appointment[]>(`${base(businessId)}/appointments`, {
      params: { date },
    })
    return data
  },

  async pendingCount(businessId: string): Promise<number> {
    const { data } = await api.get<{ count: number }>(
      `${base(businessId)}/appointments/pending-count`,
    )
    return data.count
  },

  async create(businessId: string, payload: PanelBookPayload): Promise<Appointment> {
    const { data } = await api.post<Appointment>(`${base(businessId)}/appointments`, payload)
    return data
  },

  async updateStatus(
    businessId: string,
    appointmentId: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    const { data } = await api.patch<Appointment>(
      `${base(businessId)}/appointments/${appointmentId}/status`,
      { status },
    )
    return data
  },

  /** Turnos para citas manuales (sin aviso mínimo) */
  async slots(
    businessId: string,
    serviceId: string,
    date: string,
    resourceId: string | null,
  ): Promise<Slot[]> {
    const { data } = await api.get<Slot[]>(`${base(businessId)}/availability`, {
      params: { serviceId, date, ...(resourceId && { resourceId }) },
    })
    return data
  },

  /** Autocompletar en citas manuales: primera página del listado de clientes */
  async searchCustomers(businessId: string, search: string): Promise<Customer[]> {
    const { data } = await api.get<{ items: Customer[] }>(`${base(businessId)}/customers`, {
      params: { search },
    })
    return data.items.slice(0, 8)
  },

  async listTimeOffs(businessId: string, date: string): Promise<TimeOff[]> {
    const { data } = await api.get<TimeOff[]>(`${base(businessId)}/time-offs`, {
      params: { date },
    })
    return data
  },

  async createTimeOff(
    businessId: string,
    payload: CreateTimeOffPayload,
  ): Promise<{ timeOff: TimeOff; conflicts: Appointment[] }> {
    const { data } = await api.post(`${base(businessId)}/time-offs`, payload)
    return data
  },

  async deleteTimeOff(businessId: string, timeOffId: string): Promise<void> {
    await api.delete(`${base(businessId)}/time-offs/${timeOffId}`)
  },
}
