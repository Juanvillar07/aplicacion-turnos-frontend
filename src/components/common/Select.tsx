import { ChevronDown } from 'lucide-react'
import { useId, type SelectHTMLAttributes } from 'react'
import { fieldClass } from './Input'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, id, className = '', ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={selectId} className="text-sm text-fg-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={`h-9 cursor-pointer appearance-none pr-9 ${fieldClass} ${className}`}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-subtle" />
      </div>
    </div>
  )
}
