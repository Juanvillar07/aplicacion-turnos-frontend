import { Box, ChevronRight, Shuffle, User } from 'lucide-react'
import type { PublicResource } from '@/types/booking'

interface ResourcePickerProps {
  resources: PublicResource[]
  onSelect: (resourceId: string | null) => void
}

function Option({
  icon: Icon,
  title,
  subtitle,
  onClick,
  highlight = false,
}: {
  icon: typeof User
  title: string
  subtitle?: string
  onClick: () => void
  highlight?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-lg border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-brand/60 hover:bg-surface-2"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
          highlight ? 'bg-brand-soft text-brand-hover' : 'bg-surface-2 text-fg-muted'
        }`}
      >
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-fg">{title}</span>
        {subtitle && <span className="block text-sm text-fg-subtle">{subtitle}</span>}
      </span>
      <ChevronRight className="size-5 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
    </button>
  )
}

export function ResourcePicker({ resources, onSelect }: ResourcePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <Option
        icon={Shuffle}
        title="Cualquiera disponible"
        subtitle="Te mostramos todos los horarios libres"
        onClick={() => onSelect(null)}
        highlight
      />
      {resources.map((resource) => (
        <Option
          key={resource.id}
          icon={resource.type === 'PERSON' ? User : Box}
          title={resource.name}
          onClick={() => onSelect(resource.id)}
        />
      ))}
    </div>
  )
}
