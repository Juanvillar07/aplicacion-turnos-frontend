import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Select } from '@/components/common/Select'
import { Switch } from '@/components/common/Switch'
import { getErrorMessage } from '@/services/api'
import type { BookingSettings } from '@/types/business'
import { formatDuration } from '@/utils/format'

interface BookingSettingsFormProps {
  initial: BookingSettings
  onSubmit: (settings: BookingSettings) => Promise<unknown>
  readOnly?: boolean
}

const STEP_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120].map((m) => ({
  value: String(m),
  label: `Cada ${formatDuration(m)}`,
}))

const NOTICE_OPTIONS = [
  { value: '0', label: 'Sin anticipación' },
  ...[30, 60, 120, 180, 360, 720, 1440, 2880].map((m) => ({
    value: String(m),
    label: m >= 1440 ? `${m / 1440} día${m > 1440 ? 's' : ''} antes` : `${formatDuration(m)} antes`,
  })),
]

const HORIZON_OPTIONS = [7, 14, 30, 60, 90, 180].map((d) => ({
  value: String(d),
  label: `${d} días`,
}))

export function BookingSettingsForm({ initial, onSubmit, readOnly }: BookingSettingsFormProps) {
  const [settings, setSettings] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const set = (patch: Partial<BookingSettings>) => {
    setSettings((s) => ({ ...s, ...patch }))
    setSaved(false)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      await onSubmit(settings)
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Switch
          checked={settings.autoConfirm}
          onChange={(autoConfirm) => set({ autoConfirm })}
          label="Confirmar reservas automáticamente"
          disabled={readOnly}
        />
        <p className="pl-[46px] text-xs text-fg-subtle">
          {settings.autoConfirm
            ? 'Las reservas web quedan confirmadas al instante.'
            : 'Las reservas web quedan pendientes hasta que las confirmes en la agenda.'}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Turnos"
          value={String(settings.slotStepMinutes)}
          onChange={(e) => set({ slotStepMinutes: Number(e.target.value) })}
          options={STEP_OPTIONS}
          disabled={readOnly}
        />
        <Select
          label="Anticipación mínima"
          value={String(settings.minNoticeMinutes)}
          onChange={(e) => set({ minNoticeMinutes: Number(e.target.value) })}
          options={NOTICE_OPTIONS}
          disabled={readOnly}
        />
        <Select
          label="Reservar hasta"
          value={String(settings.maxDaysAhead)}
          onChange={(e) => set({ maxDaysAhead: Number(e.target.value) })}
          options={HORIZON_OPTIONS}
          disabled={readOnly}
        />
      </div>
      {error && <Alert message={error} />}
      {!readOnly && (
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving}>
            {saved && !isSaving ? 'Guardado ✓' : 'Guardar ajustes'}
          </Button>
        </div>
      )}
    </form>
  )
}
