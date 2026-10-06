import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong px-6 py-14 text-center">
      <span className="mb-4 flex size-10 items-center justify-center rounded-lg border border-line bg-surface-2 text-fg-muted">
        <Icon className="size-5" />
      </span>
      <h3 className="text-sm font-medium text-fg">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
