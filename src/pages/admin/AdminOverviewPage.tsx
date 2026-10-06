import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  DeliveryStats,
  MetricCard,
  MonthBars,
  Panel,
  ShareBars,
} from '@/components/admin/charts'
import { Alert } from '@/components/common/Alert'
import { PageHeader } from '@/components/common/PageHeader'
import { Spinner } from '@/components/common/Spinner'
import { SOURCE_LABELS } from '@/constants/appointment'
import { CATEGORIES } from '@/constants/business'
import { useAsync } from '@/hooks/useAsync'
import { adminService } from '@/services/admin'
import type { PlatformMetrics } from '@/types/admin'
import { formatCOP } from '@/utils/format'

/** "+25 % vs. mes pasado" */
function trend(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 'Sin datos del mes pasado' : 'Igual que el mes pasado'
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return 'Igual que el mes pasado'
  return `${pct > 0 ? '+' : ''}${pct} % vs. mes pasado (${previous})`
}

export function AdminOverviewPage() {
  const { data, isLoading, error } = useAsync<PlatformMetrics | null>(
    'admin-metrics',
    () => adminService.metrics(),
    null,
  )

  return (
    <>
      <PageHeader
        title="Plataforma"
        description="Cómo va AgendaBarrio en todos los negocios. Cifras del mes en curso."
      />

      {error && <Alert message={error} />}

      {isLoading || !data ? (
        !error && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <MetricCard
              label="Ingresos del mes"
              value={formatCOP(data.subscriptions.revenueThisMonth)}
              hint={`${data.subscriptions.paymentsThisMonth} pago${data.subscriptions.paymentsThisMonth === 1 ? '' : 's'} · de prueba`}
            />
            <MetricCard
              label="Negocios activos"
              value={data.businesses.active}
              hint={
                data.businesses.suspended > 0
                  ? `${data.businesses.suspended} suspendido${data.businesses.suspended === 1 ? '' : 's'}`
                  : 'Ninguno suspendido'
              }
            />
            <MetricCard
              label="Negocios nuevos"
              value={data.businesses.newThisMonth}
              hint="Registrados este mes"
            />
            <MetricCard
              label="Usuarios"
              value={data.users.total}
              hint={`${data.users.newThisMonth} nuevos este mes`}
            />
            <MetricCard
              label="Citas este mes"
              value={data.appointments.thisMonth}
              hint={trend(data.appointments.thisMonth, data.appointments.lastMonth)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Citas por mes" description="Reservas creadas, por todos los canales">
              <MonthBars
                data={data.history.map((h) => ({ month: h.month, value: h.appointments }))}
              />
            </Panel>
            <Panel title="Negocios nuevos por mes">
              <MonthBars
                data={data.history.map((h) => ({ month: h.month, value: h.businesses }))}
              />
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Origen de las reservas" description="Este mes">
              <ShareBars
                emptyText="Aún no hay reservas este mes"
                rows={[
                  { label: SOURCE_LABELS.WEB, value: data.appointments.bySource.WEB },
                  {
                    label: SOURCE_LABELS.WHATSAPP,
                    value: data.appointments.bySource.WHATSAPP,
                    tone: 'bg-emerald-500',
                  },
                  {
                    label: SOURCE_LABELS.PANEL,
                    value: data.appointments.bySource.PANEL,
                    tone: 'bg-fg-subtle',
                  },
                ]}
              />
            </Panel>

            <Panel title="Mensajes" description="Este mes" className="lg:col-span-2">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-fg-muted">Correos</p>
                  <DeliveryStats
                    items={[
                      { label: 'Enviados', value: data.messages.email.sent },
                      { label: 'Fallidos', value: data.messages.email.failed, tone: 'danger' },
                      { label: 'Vista previa', value: data.messages.email.preview, tone: 'muted' },
                    ]}
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-fg-muted">WhatsApp</p>
                  <DeliveryStats
                    items={[
                      { label: 'Enviados', value: data.messages.whatsapp.sent },
                      { label: 'Fallidos', value: data.messages.whatsapp.failed, tone: 'danger' },
                      { label: 'Recibidos', value: data.messages.whatsapp.inbound },
                    ]}
                  />
                </div>
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel
              title="Negocios por plan"
              description={
                data.subscriptions.complimentary > 0
                  ? `Suscripciones activas · ${data.subscriptions.complimentary} de cortesía`
                  : 'Suscripciones activas'
              }
            >
              <ShareBars
                emptyText="Aún no hay suscripciones activas"
                rows={data.subscriptions.byPlan.map((p) => ({ label: p.name, value: p.count }))}
              />
            </Panel>

            <Panel title="Negocios por categoría">
              <ShareBars
                rows={data.byCategory.map((c) => ({
                  label: CATEGORIES[c.category].label,
                  value: c.count,
                }))}
              />
            </Panel>

            <Panel title="Más activos" description="Negocios con más reservas este mes">
              {data.topBusinesses.length === 0 ? (
                <p className="text-sm text-fg-subtle">Aún no hay reservas este mes</p>
              ) : (
                <ol className="-mx-2 flex flex-col">
                  {data.topBusinesses.map((b, i) => (
                    <li key={b.id}>
                      <Link
                        to={`/admin/businesses/${b.id}`}
                        className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-surface-2/60"
                      >
                        <span className="w-4 text-xs text-fg-subtle tabular-nums">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-fg">{b.name}</span>
                          <span className="block truncate text-xs text-fg-subtle">/b/{b.slug}</span>
                        </span>
                        <span className="text-sm text-fg-muted tabular-nums">
                          {b.appointments} citas
                        </span>
                        <ArrowRight className="size-3.5 text-fg-subtle transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  )
}
