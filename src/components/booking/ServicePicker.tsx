import { ChevronRight, Clock } from 'lucide-react'
import type { PublicService } from '@/types/booking'
import { formatCOP, formatDuration } from '@/utils/format'

interface ServicePickerProps {
  services: PublicService[]
  onSelect: (service: PublicService) => void
}

export function ServicePicker({ services, onSelect }: ServicePickerProps) {
  return (
    <ul className="flex flex-col gap-2">
      {services.map((service) => (
        <li key={service.id}>
          <button
            type="button"
            onClick={() => onSelect(service)}
            className="group flex w-full cursor-pointer items-center gap-4 rounded-lg border border-line bg-surface px-4 py-3.5 text-left transition-colors hover:border-brand/60 hover:bg-surface-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-fg">{service.name}</span>
              {service.description && (
                <span className="mt-0.5 line-clamp-2 block text-sm text-fg-subtle">
                  {service.description}
                </span>
              )}
              <span className="mt-1.5 flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 text-fg-muted">
                  <Clock className="size-3.5" />
                  {formatDuration(service.durationMinutes)}
                </span>
                <span className="font-medium text-fg tabular-nums">
                  {formatCOP(service.price)}
                </span>
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
          </button>
        </li>
      ))}
    </ul>
  )
}
