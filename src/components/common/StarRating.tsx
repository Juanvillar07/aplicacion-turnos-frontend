import { Star } from 'lucide-react'
import { useState } from 'react'

const LABELS = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente']

/** Estrellas de solo lectura; admite promedios (4.5 rellena media estrella). */
export function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const px = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' }[size]
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)))
        return (
          <span key={n} className={`relative inline-block ${px}`}>
            <Star className={`absolute inset-0 ${px} text-line-strong`} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={`${px} fill-amber-400 text-amber-400`} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

/** Selector de 1 a 5 estrellas (clic o flechas del teclado). */
export function StarInput({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="radiogroup"
        aria-label="Calificación"
        className="flex gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} estrella${n === 1 ? '' : 's'}: ${LABELS[n]}`}
            disabled={disabled}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(5, (value || 0) + 1))
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(1, (value || 2) - 1))
            }}
            className="cursor-pointer rounded-md p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:outline-none disabled:cursor-default"
          >
            <Star
              className={`size-9 ${n <= shown ? 'fill-amber-400 text-amber-400' : 'text-line-strong'}`}
            />
          </button>
        ))}
      </div>
      <p className="h-5 text-sm text-fg-muted">{LABELS[shown]}</p>
    </div>
  )
}
