import { Badge } from '@/components/common/Badge'
import { STATUS_META } from '@/constants/appointment'
import type { AppointmentStatus } from '@/types/appointment'

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const meta = STATUS_META[status]
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}
