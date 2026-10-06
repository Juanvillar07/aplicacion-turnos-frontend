import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { addDays, capitalize, formatDate } from '@/utils/date'

interface DateNavigatorProps {
  date: string
  today: string
  onChange: (date: string) => void
}

export function DateNavigator({ date, today, onChange }: DateNavigatorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-md border border-line-strong bg-surface-2">
        <button
          type="button"
          onClick={() => onChange(addDays(date, -1))}
          aria-label="Día anterior"
          className="cursor-pointer rounded-l-md p-2 text-fg-muted hover:bg-line hover:text-fg"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(addDays(date, 1))}
          aria-label="Día siguiente"
          className="cursor-pointer rounded-r-md border-l border-line-strong p-2 text-fg-muted hover:bg-line hover:text-fg"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <Button variant="secondary" size="sm" className="h-[34px]" onClick={() => onChange(today)} disabled={date === today}>
        Hoy
      </Button>
      <label className="relative cursor-pointer">
        <span className="text-base font-medium text-fg">
          {capitalize(formatDate(date))}
        </span>
        {/* Selector nativo de fecha superpuesto al texto */}
        <input
          type="date"
          aria-label="Elegir fecha"
          value={date}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  )
}
