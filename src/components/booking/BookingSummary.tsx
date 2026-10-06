import { CalendarDays, Clock, Tag, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { capitalize, formatClock, formatInTz } from '@/utils/date'
import { formatCOP, formatDuration } from '@/utils/format'

interface BookingSummaryProps {
  serviceName: string
  durationMinutes: number
  price: number
  resourceName: string
  startsAt: string
  timezone: string
}

function Row({ icon: Icon, children }: { icon: typeof Tag; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
      <span className="text-sm text-fg">{children}</span>
    </li>
  )
}

export function BookingSummary({
  serviceName,
  durationMinutes,
  price,
  resourceName,
  startsAt,
  timezone,
}: BookingSummaryProps) {
  return (
    <ul className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-4">
      <Row icon={Tag}>
        <span className="font-medium">{serviceName}</span>
        <span className="text-fg-muted"> · {formatCOP(price)}</span>
      </Row>
      <Row icon={CalendarDays}>
        {capitalize(formatInTz(startsAt, timezone, "EEEE d 'de' MMMM"))}
      </Row>
      <Row icon={Clock}>
        {formatClock(startsAt, timezone)}{' '}
        <span className="text-fg-muted">({formatDuration(durationMinutes)})</span>
      </Row>
      <Row icon={User}>{resourceName}</Row>
    </ul>
  )
}
