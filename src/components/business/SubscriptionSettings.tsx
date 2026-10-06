import { CreditCard } from 'lucide-react'
import { Alert } from '@/components/common/Alert'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'
import { CARD_BRAND_LABELS, SUBSCRIPTION_STATUS_META } from '@/constants/plans'
import { useAsync } from '@/hooks/useAsync'
import { subscriptionsService } from '@/services/subscriptions'
import type { BusinessSubscription } from '@/types/subscription'
import { formatInTz } from '@/utils/date'
import { formatCOP } from '@/utils/format'

/** Plan del negocio, próxima renovación e historial de pagos (solo lectura). */
export function SubscriptionSettings({ businessId, timezone }: { businessId: string; timezone: string }) {
  const { data, isLoading, error } = useAsync<BusinessSubscription | null>(
    `subscription|${businessId}`,
    () => subscriptionsService.forBusiness(businessId),
    null,
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    )
  }
  if (error) return <Alert message={error} />
  if (!data) return <p className="text-sm text-fg-muted">Este negocio no tiene una suscripción registrada.</p>

  const status = SUBSCRIPTION_STATUS_META[data.status]
  const day = (iso: string) => formatInTz(iso, timezone, "d 'de' MMMM yyyy")

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-base font-medium text-fg">
            Plan {data.plan.name}
            <Badge tone={status.tone}>{status.label}</Badge>
            {data.isComplimentary && <Badge tone="brand">Cortesía</Badge>}
          </p>
          <p className="mt-0.5 text-sm text-fg-muted">
            {data.isComplimentary ? 'Sin costo' : `${formatCOP(data.plan.priceMonthly)} al mes`}
          </p>
        </div>
        {data.currentPeriodEnd && (
          <div className="text-right text-sm">
            <p className="text-fg-subtle">
              {data.isComplimentary ? 'Vigente hasta' : 'Próxima renovación'}
            </p>
            <p className="text-fg">{day(data.currentPeriodEnd)}</p>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-fg-subtle">Historial de pagos</p>
        {data.payments.length === 0 ? (
          <p className="text-sm text-fg-subtle">Sin pagos registrados.</p>
        ) : (
          <ul className="divide-y divide-line rounded-md border border-line">
            {data.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2.5 text-sm">
                <span className="w-28 text-fg-muted">{formatInTz(p.createdAt, timezone, 'd MMM yyyy')}</span>
                <span className="flex flex-1 items-center gap-1.5 text-fg-muted">
                  <CreditCard className="size-3.5 text-fg-subtle" />
                  {p.cardBrand ? CARD_BRAND_LABELS[p.cardBrand] : 'Tarjeta'}
                  {p.cardLast4 && ` •••• ${p.cardLast4}`}
                  {p.provider === 'SIMULATED' && <Badge tone="muted">Prueba</Badge>}
                </span>
                <span className="text-fg tabular-nums">{formatCOP(p.amount)}</span>
                <Badge tone={p.status === 'APPROVED' ? 'success' : 'danger'}>
                  {p.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-fg-subtle">
        Cambiar de plan o cancelar estará disponible cuando conectemos la pasarela de pagos.
      </p>
    </div>
  )
}
