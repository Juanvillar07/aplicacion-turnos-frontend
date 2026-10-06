import { useId, type TextareaHTMLAttributes } from 'react'
import { fieldClass } from './Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function Textarea({ label, id, className = '', ...props }: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={textareaId} className="text-sm text-fg-muted">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={3}
        className={`resize-none py-2 ${fieldClass} ${className}`}
        {...props}
      />
    </div>
  )
}
