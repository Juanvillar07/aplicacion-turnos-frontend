import { useState, type FormEvent } from 'react'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Textarea } from '@/components/common/Textarea'
import type { Service, ServicePayload } from '@/types/catalog'
import { formatDuration } from '@/utils/format'

export const SERVICE_FORM_ID = 'service-form'

const DURATION_OPTIONS = [10, 15, 20, 30, 40, 45, 50, 60, 75, 90, 120, 150, 180, 240].map(
  (m) => ({ value: String(m), label: formatDuration(m) }),
)

interface ServiceFormProps {
  initial?: Service
  onSubmit: (payload: ServicePayload) => void
}

/** El botón de envío vive en el footer del Modal (form={SERVICE_FORM_ID}). */
export function ServiceForm({ initial, onSubmit }: ServiceFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [duration, setDuration] = useState(String(initial?.durationMinutes ?? 30))
  const [price, setPrice] = useState(initial ? String(initial.price) : '')

  // Si la duración guardada no está en la lista, se agrega como opción
  const durationOptions = DURATION_OPTIONS.some((o) => o.value === duration)
    ? DURATION_OPTIONS
    : [...DURATION_OPTIONS, { value: duration, label: formatDuration(Number(duration)) }]

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      name,
      description: description.trim() || (initial ? null : undefined),
      durationMinutes: Number(duration),
      price: Number(price.replace(/\D/g, '')),
    })
  }

  return (
    <form id={SERVICE_FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Nombre"
        placeholder="Ej: Corte clásico"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        required
        autoFocus
      />
      <Textarea
        label="Descripción (opcional)"
        placeholder="Lo que incluye el servicio"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={300}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Duración"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          options={durationOptions}
        />
        <Input
          label="Precio (COP)"
          inputMode="numeric"
          placeholder="20000"
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>
    </form>
  )
}
