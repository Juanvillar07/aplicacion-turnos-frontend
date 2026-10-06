import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/services/api'
import { catalogService } from '@/services/catalog'
import type { Service, ServicePayload, UpdateServicePayload } from '@/types/catalog'

/** Servicios del negocio, incluidos los inactivos (la UI decide qué mostrar). */
export function useServices(businessId: string) {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Evita aplicar respuestas de un negocio anterior si cambia el negocio activo
    let cancelled = false
    catalogService
      .list(businessId, true)
      .then((data) => {
        if (cancelled) return
        setServices(data)
        setError(null)
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [businessId])

  const create = async (payload: ServicePayload) => {
    const created = await catalogService.create(businessId, payload)
    setServices((prev) => [...prev, created])
    return created
  }

  const update = async (serviceId: string, payload: UpdateServicePayload) => {
    const updated = await catalogService.update(businessId, serviceId, payload)
    setServices((prev) => prev.map((s) => (s.id === serviceId ? updated : s)))
    return updated
  }

  return { services, isLoading, error, create, update }
}
