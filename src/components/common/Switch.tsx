interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label
      className={`inline-flex items-center gap-2.5 text-sm text-fg-muted select-none ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors disabled:cursor-not-allowed ${
          checked ? 'border-brand bg-brand' : 'border-line-strong bg-surface-2'
        }`}
      >
        <span
          className={`absolute top-1/2 left-0.5 size-3.5 -translate-y-1/2 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
      {label}
    </label>
  )
}
