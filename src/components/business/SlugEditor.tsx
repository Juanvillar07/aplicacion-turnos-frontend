import { Check, Copy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { fieldClass } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { businessesService } from '@/services/businesses'
import { getErrorMessage } from '@/services/api'
import { publicBookingUrl, slugify } from '@/utils/slug'

interface SlugEditorProps {
  currentSlug: string
  onSave: (slug: string) => Promise<unknown>
  readOnly?: boolean
}

type Availability = 'idle' | 'checking' | 'available' | 'taken'

export function SlugEditor({ currentSlug, onSave, readOnly }: SlugEditorProps) {
  const [value, setValue] = useState(currentSlug)
  /** Último resultado de disponibilidad recibido del servidor */
  const [checked, setChecked] = useState<{ slug: string; available: boolean } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const normalized = slugify(value)
  const changed = normalized !== currentSlug

  const availability: Availability =
    !changed || !normalized
      ? 'idle'
      : checked?.slug !== normalized
        ? 'checking'
        : checked.available
          ? 'available'
          : 'taken'

  // Consulta de disponibilidad con debounce
  useEffect(() => {
    if (!changed || !normalized) return
    const timer = setTimeout(() => {
      businessesService
        .checkSlug(normalized)
        .then((res) => setChecked({ slug: normalized, available: res.available }))
        .catch(() => setChecked({ slug: normalized, available: false }))
    }, 400)
    return () => clearTimeout(timer)
  }, [normalized, changed])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await onSave(normalized)
      setValue(normalized)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(publicBookingUrl(currentSlug))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center overflow-hidden rounded-md border border-line bg-surface-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft">
          <span className="border-r border-line px-3 text-sm whitespace-nowrap text-fg-subtle">
            agendabarrio.co/b/
          </span>
          <input
            aria-label="Enlace público"
            value={value}
            onChange={(e) => setValue(e.target.value.toLowerCase())}
            disabled={readOnly}
            maxLength={50}
            className={`h-9 min-w-0 flex-1 border-0 hover:border-0 focus:ring-0 ${fieldClass}`}
          />
          <span className="px-3">
            {availability === 'checking' && <Spinner className="size-4" />}
            {availability === 'available' && <Check className="size-4 text-emerald-400" />}
            {availability === 'taken' && <X className="size-4 text-danger" />}
          </span>
        </div>
        {!readOnly && (
          <Button
            variant="secondary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!changed || availability !== 'available'}
          >
            Guardar enlace
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 text-xs text-fg-subtle">
        <span>
          {availability === 'taken'
            ? 'Ese enlace ya está en uso'
            : changed && normalized
              ? `Quedará como: ${normalized}`
              : 'Comparte este enlace para que tus clientes reserven.'}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap hover:text-fg"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copiado' : 'Copiar enlace'}
        </button>
      </div>
      {error && <Alert message={error} />}
    </div>
  )
}
