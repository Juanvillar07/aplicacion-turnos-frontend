import type { ReactNode } from 'react'
import type { BadgeTone } from '@/constants/appointment'

const tones: Record<BadgeTone, string> = {
  neutral: 'border-line-strong bg-surface-2 text-fg-muted',
  brand: 'border-brand/30 bg-brand-soft text-brand-hover',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  muted: 'border-line bg-transparent text-fg-subtle',
  warning: 'border-amber-400/30 bg-amber-500/10 text-amber-400',
  danger: 'border-danger/30 bg-danger-soft text-danger',
}

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
