import { useState, type FormEvent, type ReactNode } from 'react'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import type { Business, BusinessCategory, CreateBusinessPayload } from '@/types/business'
import { CategoryPicker } from './CategoryPicker'

interface BusinessFormProps {
  initial?: Business
  onSubmit: (payload: CreateBusinessPayload) => void
  submitLabel: string
  isLoading: boolean
  error: string | null
  readOnly?: boolean
  /** Contenido extra bajo el nombre (p. ej. vista previa del enlace) */
  renderNameHint?: (name: string) => ReactNode
}

export function BusinessForm({
  initial,
  onSubmit,
  submitLabel,
  isLoading,
  error,
  readOnly = false,
  renderNameHint,
}: BusinessFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<BusinessCategory | null>(initial?.category ?? null)
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  // Al crear, los vacíos no se envían; al editar, se envían como null para borrarlos.
  const optional = (v: string) => v.trim() || (initial ? null : undefined)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!category) {
      setLocalError('Elige el tipo de negocio')
      return
    }
    setLocalError(null)
    onSubmit({
      name,
      category,
      phone: optional(phone),
      city: optional(city),
      address: optional(address),
    })
  }

  const shownError = localError ?? error

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Nombre del negocio"
        placeholder="Ej: Barbería Don Juan"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        required
        disabled={readOnly}
        hint={renderNameHint?.(name)}
      />
      <CategoryPicker value={category} onChange={setCategory} disabled={readOnly} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="WhatsApp / teléfono"
          type="tel"
          inputMode="tel"
          placeholder="300 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={readOnly}
        />
        <Input
          label="Ciudad"
          placeholder="Medellín"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={60}
          disabled={readOnly}
        />
      </div>
      <Input
        label="Dirección (opcional)"
        placeholder="Cra 45 # 23-10, barrio Laureles"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        maxLength={120}
        disabled={readOnly}
      />
      {shownError && <Alert message={shownError} />}
      {!readOnly && (
        <div className="flex justify-end">
          <Button type="submit" isLoading={isLoading}>
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  )
}
