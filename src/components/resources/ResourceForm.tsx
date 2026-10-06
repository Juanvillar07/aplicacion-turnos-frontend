import { useState, type FormEvent } from 'react'
import { Input } from '@/components/common/Input'
import type { CategoryMeta } from '@/constants/business'
import type { Service } from '@/types/catalog'
import type { Resource, ResourceType } from '@/types/resource'
import { formatDuration } from '@/utils/format'

export const RESOURCE_FORM_ID = 'resource-form'

export interface ResourceFormValues {
  name: string
  type: ResourceType
  serviceIds: string[]
}

interface ResourceFormProps {
  initial?: Resource
  /** Tipo de un recurso nuevo (los profesionales llegan por invitación) */
  defaultType: ResourceType
  category: CategoryMeta
  services: Service[]
  onSubmit: (values: ResourceFormValues) => void
}

export function ResourceForm({
  initial,
  defaultType,
  category,
  services,
  onSubmit,
}: ResourceFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const type = initial?.type ?? defaultType
  const [serviceIds, setServiceIds] = useState<string[]>(
    // Al crear, por defecto presta todos los servicios activos
    initial?.serviceIds ?? services.filter((s) => s.isActive).map((s) => s.id),
  )

  const toggleService = (id: string) =>
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ name, type, serviceIds })
  }

  const selectable = services.filter((s) => s.isActive || serviceIds.includes(s.id))

  return (
    <form id={RESOURCE_FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Nombre"
        placeholder={type === 'PERSON' ? 'Ej: Carlos' : 'Ej: Cancha 1'}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        required
        autoFocus
      />

      <fieldset>
        <legend className="mb-2 text-sm text-fg-muted">
          Servicios que ofrece este {category.resourceSingular}
        </legend>
        {selectable.length === 0 ? (
          <p className="rounded-md border border-dashed border-line-strong p-3 text-sm text-fg-subtle">
            Primero crea servicios en la sección Servicios.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-line rounded-md border border-line">
            {selectable.map((service) => (
              <label
                key={service.id}
                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-surface-2/60"
              >
                <input
                  type="checkbox"
                  checked={serviceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="size-4 cursor-pointer accent-brand"
                />
                <span className="flex-1 text-sm text-fg">{service.name}</span>
                <span className="text-xs text-fg-subtle">
                  {formatDuration(service.durationMinutes)}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

    </form>
  )
}
