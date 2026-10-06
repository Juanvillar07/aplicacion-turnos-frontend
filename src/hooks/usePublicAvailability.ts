import { publicBookingService } from '@/services/publicBooking'
import type { Slot } from '@/types/booking'
import { useAsync } from './useAsync'

const NO_DAYS: string[] = []
const NO_SLOTS: Slot[] = []

/** Días con turnos libres para un servicio (y opcionalmente un profesional). */
export function useAvailableDays(
  slug: string,
  serviceId: string | null,
  resourceId: string | null,
  reloadKey = 0,
) {
  const key = serviceId ? `${slug}|${serviceId}|${resourceId}|${reloadKey}` : null
  return useAsync(
    key,
    () => publicBookingService.availableDays(slug, serviceId!, resourceId),
    NO_DAYS,
  )
}

/** Turnos libres de un día. */
export function useSlots(
  slug: string,
  serviceId: string | null,
  date: string | null,
  resourceId: string | null,
  reloadKey = 0,
) {
  const key =
    serviceId && date ? `${slug}|${serviceId}|${date}|${resourceId}|${reloadKey}` : null
  return useAsync(
    key,
    () => publicBookingService.slots(slug, serviceId!, date!, resourceId),
    NO_SLOTS,
  )
}
