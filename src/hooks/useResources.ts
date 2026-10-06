import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/services/api'
import { resourcesService } from '@/services/resources'
import type {
  CreateResourcePayload,
  Resource,
  UpdateResourcePayload,
  WorkingHoursSlot,
} from '@/types/resource'

/** Profesionales y espacios del negocio, incluidos los inactivos. */
export function useResources(businessId: string) {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Evita aplicar respuestas de un negocio anterior si cambia el negocio activo
    let cancelled = false
    resourcesService
      .list(businessId, true)
      .then((data) => {
        if (cancelled) return
        setResources(data)
        setError(null)
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [businessId])

  const replace = (updated: Resource) =>
    setResources((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))

  const create = async (payload: CreateResourcePayload) => {
    const created = await resourcesService.create(businessId, payload)
    setResources((prev) => [...prev, created])
    return created
  }

  /** Actualiza datos básicos y, si se indican, los servicios que presta. */
  const update = async (
    resourceId: string,
    payload: UpdateResourcePayload,
    serviceIds?: string[],
  ) => {
    let updated = await resourcesService.update(businessId, resourceId, payload)
    if (serviceIds) {
      updated = await resourcesService.setServices(businessId, resourceId, serviceIds)
    }
    replace(updated)
    return updated
  }

  const setWorkingHours = async (resourceId: string, hours: WorkingHoursSlot[]) => {
    const updated = await resourcesService.setWorkingHours(businessId, resourceId, hours)
    replace(updated)
    return updated
  }

  return { resources, isLoading, error, create, update, setWorkingHours }
}
