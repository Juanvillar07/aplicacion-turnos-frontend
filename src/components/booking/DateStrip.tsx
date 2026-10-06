import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { addDays, formatDate } from '@/utils/date'

interface DateStripProps {
  /** Primer día a mostrar (hoy en la zona del negocio) */
  from: string
  days: number
  available: Set<string>
  selected: string | null
  onSelect: (date: string) => void
}

/** Tira horizontal de días; solo se pueden elegir los que tienen turnos. */
export function DateStrip({ from, days, available, selected, onSelect }: DateStripProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const dates = Array.from({ length: days + 1 }, (_, i) => addDays(from, i))

  // Mantiene visible el día seleccionado
  useEffect(() => {
    if (!selected) return
    scroller.current
      ?.querySelector(`[data-date="${selected}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [selected])

  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * 240, behavior: 'smooth' })

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="flex snap-x gap-2 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] sm:mx-9"
      >
        {dates.map((date) => {
          const enabled = available.has(date)
          const isSelected = date === selected
          return (
            <button
              key={date}
              type="button"
              data-date={date}
              disabled={!enabled}
              onClick={() => onSelect(date)}
              className={`flex w-14 shrink-0 snap-start cursor-pointer flex-col items-center gap-0.5 rounded-lg border py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                isSelected
                  ? 'border-brand bg-brand text-white'
                  : 'border-line bg-surface text-fg enabled:hover:border-brand/60'
              }`}
            >
              <span
                className={`text-[11px] uppercase ${isSelected ? 'text-white/80' : 'text-fg-subtle'}`}
              >
                {formatDate(date, 'EEE').replace('.', '')}
              </span>
              <span className="text-lg leading-tight font-semibold tabular-nums">
                {formatDate(date, 'd')}
              </span>
              <span
                className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-fg-subtle'}`}
              >
                {formatDate(date, 'MMM').replace('.', '')}
              </span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Días anteriores"
        className="absolute top-1/2 left-0 hidden -translate-y-[60%] cursor-pointer rounded-full border border-line bg-surface p-1.5 text-fg-muted hover:text-fg sm:block"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Días siguientes"
        className="absolute top-1/2 right-0 hidden -translate-y-[60%] cursor-pointer rounded-full border border-line bg-surface p-1.5 text-fg-muted hover:text-fg sm:block"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
