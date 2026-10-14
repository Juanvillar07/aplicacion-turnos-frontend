import type { BookPayload, PublicAppointment, PublicBusiness, Slot } from '@/types/booking'
import { api } from './api'

/** URL del .ics para "Agregar a mi calendario" (Apple, Outlook…) */
export const calendarFileUrl = (token: string) =>
  `${api.defaults.baseURL}/public/appointments/${token}/calendar.ics`

export const publicBookingService = {
  async getBusiness(slug: string): Promise<PublicBusiness> {
    const { data } = await api.get<PublicBusiness>(`/public/b/${slug}`)
    return data
  },

  async availableDays(
    slug: string,
    serviceId: string,
    resourceId: string | null,
  ): Promise<string[]> {
    const { data } = await api.get<string[]>(`/public/b/${slug}/availability/days`, {
      params: { serviceId, ...(resourceId && { resourceId }) },
    })
    return data
  },

  async slots(
    slug: string,
    serviceId: string,
    date: string,
    resourceId: string | null,
  ): Promise<Slot[]> {
    const { data } = await api.get<Slot[]>(`/public/b/${slug}/availability`, {
      params: { serviceId, date, ...(resourceId && { resourceId }) },
    })
    return data
  },

  async book(slug: string, payload: BookPayload): Promise<PublicAppointment> {
    const { data } = await api.post<PublicAppointment>(`/public/b/${slug}/appointments`, payload)
    return data
  },

  async getAppointment(token: string): Promise<PublicAppointment> {
    const { data } = await api.get<PublicAppointment>(`/public/appointments/${token}`)
    return data
  },

  // ─── Reprogramar (mismo servicio y profesional) ───

  async rescheduleDays(token: string): Promise<string[]> {
    const { data } = await api.get<string[]>(`/public/appointments/${token}/reschedule/days`)
    return data
  },

  async rescheduleSlots(token: string, date: string): Promise<Slot[]> {
    const { data } = await api.get<Slot[]>(`/public/appointments/${token}/reschedule/slots`, {
      params: { date },
    })
    return data
  },

  async reschedule(token: string, startsAt: string): Promise<PublicAppointment> {
    const { data } = await api.post<PublicAppointment>(
      `/public/appointments/${token}/reschedule`,
      { startsAt },
    )
    return data
  },

  async cancelAppointment(token: string): Promise<PublicAppointment> {
    const { data } = await api.post<PublicAppointment>(`/public/appointments/${token}/cancel`)
    return data
  },
}
