import { Badge } from '@/components/common/Badge'
import type { BusinessStatus } from '@/types/business'

const BUSINESS_STATUS_LABELS: Record<BusinessStatus, string> = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspendido',
}

export function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  return (
    <Badge tone={status === 'ACTIVE' ? 'success' : 'danger'}>
      {BUSINESS_STATUS_LABELS[status]}
    </Badge>
  )
}
