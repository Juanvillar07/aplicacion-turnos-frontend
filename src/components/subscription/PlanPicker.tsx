import { Check } from 'lucide-react'
import { Alert } from '@/components/common/Alert'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { POPULAR_PLAN } from '@/constants/plans'
import { useAsync } from '@/hooks/useAsync'
import { subscriptionsService } from '@/services/subscriptions'
import type { Plan, PlanCode } from '@/types/subscription'
import { formatCOP } from '@/utils/format'

interface PlanPickerProps {
  onSelect: (plan: Plan) => void
  /** Plan elegido antes (se marca como actual) */
  selected?: PlanCode | null
  /** Plan cuya selección se está guardando */
  loadingCode?: PlanCode | null
}

function PlanCard({
  plan,
  popular,
  selected,
  isLoading,
  disabled,
  onSelect,
}: {
  plan: Plan
  popular: boolean
  selected: boolean
  isLoading: boolean
  disabled: boolean
  onSelect: () => void
}) {
  return (
    <article
      className={`relative flex flex-col rounded-xl border bg-surface p-6 ${
        popular ? 'border-brand shadow-lg shadow-brand/10' : 'border-line'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-6">
          <Badge tone="brand">Más popular</Badge>
        </span>
      )}
      <h2 className="text-lg font-medium text-fg">{plan.name}</h2>
      <p className="mt-1 min-h-10 text-sm text-fg-muted">{plan.description}</p>
      <p className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-medium tracking-tight text-fg tabular-nums">
          {formatCOP(plan.priceMonthly)}
        </span>
        <span className="text-sm text-fg-subtle">/mes</span>
      </p>
      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-fg-muted">
            <Check className="mt-0.5 size-4 shrink-0 text-brand-hover" />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        className="mt-6"
        fullWidth
        variant={popular ? 'primary' : 'secondary'}
        isLoading={isLoading}
        disabled={disabled}
        onClick={onSelect}
      >
        {selected ? 'Continuar con este plan' : `Elegir ${plan.name}`}
      </Button>
    </article>
  )
}

/** Las tarjetas de los planes, de la más barata a la más completa. */
export function PlanPicker({ onSelect, selected = null, loadingCode = null }: PlanPickerProps) {
  const { data: plans, isLoading, error } = useAsync('plans', () => subscriptionsService.plans(), [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }
  if (error) return <Alert message={error} />

  return (
    <div className="grid gap-6 pt-3 md:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard
          key={plan.code}
          plan={plan}
          popular={plan.code === POPULAR_PLAN}
          selected={plan.code === selected}
          isLoading={loadingCode === plan.code}
          disabled={loadingCode !== null && loadingCode !== plan.code}
          onSelect={() => onSelect(plan)}
        />
      ))}
    </div>
  )
}
