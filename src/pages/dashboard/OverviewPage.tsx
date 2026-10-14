import { ArrowRight, Check, ExternalLink, Link2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Spinner } from '@/components/common/Spinner'
import { GRID_STATUSES } from '@/constants/appointment'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useAgenda } from '@/hooks/useAgenda'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { useResources } from '@/hooks/useResources'
import { useServices } from '@/hooks/useServices'
import { reviewsService } from '@/services/reviews'
import { useAgendaStore } from '@/store/agendaStore'
import { todayIn } from '@/utils/date'

function StatCard({ label, value, to }: { label: string; value: ReactNode; to: string }) {
  return (
    <Link
      to={to}
      className="group rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong"
    >
      <p className="text-xs text-fg-subtle">{label}</p>
      <p className="mt-2 flex items-end justify-between text-2xl font-medium text-fg tabular-nums">
        {value}
        <ArrowRight className="mb-1 size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5" />
      </p>
    </Link>
  )
}

interface Step {
  done: boolean
  title: string
  description: string
  to: string
}

export function OverviewPage() {
  const { user } = useAuth()
  const { business, category } = useActiveBusiness()
  const { services, isLoading: loadingServices } = useServices(business.id)
  const { resources, isLoading: loadingResources } = useResources(business.id)
  const today = useAgenda(business.id, todayIn(business.timezone))
  const pendingCount = useAgendaStore((s) => s.pendingCount)
  const reviews = useAsync(`overview-reviews|${business.id}`, () => reviewsService.list(business.id, {}), null)
  const rating = reviews.data?.summary
  const todayCount = today.appointments.filter((a) => GRID_STATUSES.includes(a.status)).length

  const activeServices = services.filter((s) => s.isActive)
  const activeResources = resources.filter((r) => r.isActive)
  const withHours = activeResources.filter((r) => r.workingHours.length > 0)
  const isLoading = loadingServices || loadingResources

  const steps: Step[] = [
    {
      done: true,
      title: 'Crea tu negocio',
      description: `${business.name} ya está registrado.`,
      to: '/app/settings',
    },
    {
      done: activeServices.length > 0,
      title: 'Agrega tus servicios',
      description: 'Nombre, duración y precio de lo que ofreces.',
      to: '/app/services',
    },
    {
      done: activeResources.length > 0,
      title: `Registra tus ${category.resourcesLabel.toLowerCase()}`,
      description: 'Quién o qué atiende cada reserva.',
      to: '/app/team',
    },
    {
      done: withHours.length > 0,
      title: 'Configura los horarios',
      description: 'Los días y franjas en que se puede reservar.',
      to: '/app/team',
    },
  ]
  const completed = steps.filter((s) => s.done).length
  const ready = completed === steps.length

  return (
    <>
      <PageHeader
        title={`Hola, ${user?.name.split(' ')[0]}`}
        description={`Este es el resumen de ${business.name}.`}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Citas de hoy" value={todayCount} to="/app/agenda" />
            <StatCard label="Por confirmar" value={pendingCount} to="/app/agenda" />
            <StatCard label="Servicios activos" value={activeServices.length} to="/app/services" />
            <StatCard
              label={category.resourcesLabel}
              value={activeResources.length}
              to="/app/team"
            />
            <StatCard
              label="Calificación"
              value={
                rating?.average ? (
                  <span className="flex items-baseline gap-1">
                    {rating.average.toFixed(1)}
                    <span className="text-xs font-normal text-fg-subtle">({rating.count})</span>
                  </span>
                ) : (
                  '—'
                )
              }
              to="/app/reviews"
            />
          </div>

          <section className="rounded-lg border border-line bg-surface">
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="font-medium text-fg">
                  {ready ? '¡Tu negocio está listo!' : 'Prepara tu negocio para recibir reservas'}
                </h2>
                <p className="mt-0.5 text-sm text-fg-muted">
                  {completed} de {steps.length} pasos completados
                </p>
              </div>
              <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-surface-2 sm:block">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${(completed / steps.length) * 100}%` }}
                />
              </div>
            </header>
            <ol className="divide-y divide-line">
              {steps.map((step) => (
                <li key={step.title}>
                  <Link
                    to={step.to}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2/50"
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                        step.done
                          ? 'border-brand bg-brand text-white'
                          : 'border-line-strong text-transparent'
                      }`}
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm ${step.done ? 'text-fg-muted line-through decoration-fg-subtle' : 'font-medium text-fg'}`}
                      >
                        {step.title}
                      </span>
                      <span className="block text-xs text-fg-subtle">{step.description}</span>
                    </span>
                    {!step.done && <ArrowRight className="size-4 text-fg-subtle" />}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5 sm:flex-row sm:items-center">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-hover">
              <Link2 className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">Página pública de reservas</p>
              <p className="truncate text-sm text-fg-muted">agendabarrio.co/b/{business.slug}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/app/settings"
                className="text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
              >
                Personalizar
              </Link>
              <a
                href={`/b/${business.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong bg-surface-2 px-3 text-[13px] font-medium text-fg hover:bg-line"
              >
                Abrir página <ExternalLink className="size-3.5" />
              </a>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
