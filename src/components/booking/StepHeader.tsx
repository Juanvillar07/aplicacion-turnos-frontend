import { ArrowLeft } from 'lucide-react'

interface StepHeaderProps {
  title: string
  subtitle?: string
  current: number
  total: number
  onBack?: () => void
}

export function StepHeader({ title, subtitle, current, total, onBack }: StepHeaderProps) {
  return (
    <div className="mb-5">
      <div className="mb-4 flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="-ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" /> Atrás
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-1.5" aria-label={`Paso ${current} de ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < current ? 'w-5 bg-brand' : 'w-1.5 bg-line-strong'
              }`}
            />
          ))}
        </div>
      </div>
      <h2 className="text-lg font-medium text-fg">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-fg-muted">{subtitle}</p>}
    </div>
  )
}
