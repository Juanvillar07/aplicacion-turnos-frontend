import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

/** Estilo compartido por Input, Select y Textarea. */
export const fieldClass =
  'w-full rounded-md border border-line bg-surface-2 px-3 text-sm text-fg placeholder:text-fg-subtle transition-colors hover:border-line-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-60'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
}

export function Input({ label, hint, id, className = '', ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm text-fg-muted">
        {label}
      </label>
      <input id={inputId} className={`h-9 ${fieldClass} ${className}`} {...props} />
      {hint && <p className="text-xs text-fg-subtle">{hint}</p>}
    </div>
  )
}
