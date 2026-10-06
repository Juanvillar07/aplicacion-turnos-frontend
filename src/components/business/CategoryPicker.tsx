import { CATEGORY_LIST } from '@/constants/business'
import type { BusinessCategory } from '@/types/business'

interface CategoryPickerProps {
  value: BusinessCategory | null
  onChange: (value: BusinessCategory) => void
  disabled?: boolean
}

export function CategoryPicker({ value, onChange, disabled }: CategoryPickerProps) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-2 text-sm text-fg-muted">Tipo de negocio</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CATEGORY_LIST.map(([key, meta]) => {
          const selected = value === key
          const Icon = meta.icon
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(key)}
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-left transition-colors disabled:cursor-not-allowed ${
                selected
                  ? 'border-brand bg-brand-soft'
                  : 'border-line bg-surface-2 hover:border-line-strong'
              }`}
            >
              <Icon
                className={`mt-0.5 size-4 shrink-0 ${selected ? 'text-brand-hover' : 'text-fg-muted'}`}
              />
              <span>
                <span className="block text-sm font-medium text-fg">{meta.label}</span>
                <span className="block text-xs text-fg-subtle">{meta.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
