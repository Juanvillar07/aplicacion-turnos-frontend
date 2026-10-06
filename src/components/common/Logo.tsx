import { CalendarCheck } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand text-white">
        <CalendarCheck className="size-[18px]" strokeWidth={2.25} />
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight text-fg">
          Agenda<span className="text-brand-hover">Barrio</span>
        </span>
      )}
    </div>
  )
}
