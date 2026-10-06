import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ExternalLink,
  Mail,
  MessageCircle,
  RotateCcw,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BusinessStatusBadge } from '@/components/admin/BusinessStatusBadge'
import { BusinessStatusModal } from '@/components/admin/BusinessStatusModal'
import {
  DeliveryStats,
  MetricCard,
  MonthBars,
  Panel,
  ShareBars,
} from '@/components/admin/charts'
import { Alert } from '@/components/common/Alert'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { SOURCE_LABELS, STATUS_META } from '@/constants/appointment'
import { CATEGORIES } from '@/constants/business'
import { CARD_BRAND_LABELS, SUBSCRIPTION_STATUS_META } from '@/constants/plans'
import { ROLE_LABELS } from '@/constants/roles'
import { useAsync } from '@/hooks/useAsync'
import { adminService } from '@/services/admin'
import type { AdminBusinessDetail } from '@/types/admin'
import type { AppointmentStatus } from '@/types/appointment'
import { formatInTz } from '@/utils/date'
import { formatCOP } from '@/utils/format'
import { prettyPhone } from '@/utils/phone'

const PLATFORM_TZ = 'America/Bogota'
const when = (iso: string) => formatInTz(iso, PLATFORM_TZ, "d MMM yyyy, h:mm aaa")

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-fg-subtle">{label}</dt>
      <dd className="min-w-0 truncate text-right text-fg">{children}</dd>
    </div>
  )
}

export function AdminBusinessDetailPage() {
  const { businessId = '' } = useParams()
  const loaded = useAsync<AdminBusinessDetail | null>(
    `admin-business|${businessId}`,
    () => adminService.getBusiness(businessId),
    null,
  )
  // Tras suspender/reactivar se muestra la versión devuelta por el servidor
  const [updated, setUpdated] = useState<AdminBusinessDetail | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const business = updated?.id === businessId ? updated : loaded.data

  const back = (
    <Link
      to="/admin/businesses"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
    >
      <ArrowLeft className="size-4" /> Negocios
    </Link>
  )

  if (loaded.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }
  if (!business) {
    return (
      <>
        {back}
        <Alert message={loaded.error ?? 'Negocio no encontrado'} />
      </>
    )
  }

  const category = CATEGORIES[business.category]
  const suspended = business.status === 'SUSPENDED'
  const statusRows = (Object.keys(STATUS_META) as AppointmentStatus[])
    .map((s) => ({ label: STATUS_META[s].label, value: business.usage.byStatus[s] ?? 0 }))
    .filter((r) => r.value > 0)

  return (
    <>
      {back}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-medium tracking-tight text-fg">
            {business.name}
            <BusinessStatusBadge status={business.status} />
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {category.label}
            {business.city && ` · ${business.city}`} · Registrado el{' '}
            {formatInTz(business.createdAt, PLATFORM_TZ, "d 'de' MMMM yyyy")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {!suspended && (
            <a
              href={`/b/${business.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong bg-surface-2 px-4 text-sm font-medium text-fg hover:bg-line"
            >
              Página pública <ExternalLink className="size-3.5" />
            </a>
          )}
          <Button variant={suspended ? 'primary' : 'danger'} onClick={() => setModalOpen(true)}>
            {suspended ? <RotateCcw className="size-4" /> : <Ban className="size-4" />}
            {suspended ? 'Reactivar' : 'Suspender'}
          </Button>
        </div>
      </div>

      {suspended && (
        <div className="mb-6 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm">
          <p className="font-medium text-fg">
            Suspendido{business.suspendedAt && ` el ${when(business.suspendedAt)}`}
          </p>
          {business.suspendedReason && (
            <p className="mt-0.5 text-fg-muted">Motivo: {business.suspendedReason}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Citas este mes" value={business.usage.thisMonth} />
          <MetricCard
            label="Citas en total"
            value={business.counts.appointments}
            hint={
              business.lastAppointmentAt
                ? `Última: ${formatInTz(business.lastAppointmentAt, PLATFORM_TZ, 'd MMM yyyy')}`
                : 'Aún sin reservas'
            }
          />
          <MetricCard label="Clientes" value={business.counts.customers} />
          <MetricCard
            label="Servicios"
            value={business.counts.services}
            hint={`${business.counts.resources} ${category.resourcesLabel.toLowerCase()}`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Citas por mes" className="lg:col-span-2">
            <MonthBars
              data={business.usage.history.map((h) => ({
                month: h.month,
                value: h.appointments,
              }))}
            />
          </Panel>
          <Panel title="Datos del negocio">
            <dl className="-my-2 divide-y divide-line">
              <InfoRow label="Enlace">/b/{business.slug}</InfoRow>
              <InfoRow label="Teléfono">
                {business.phone ? prettyPhone(business.phone) : '—'}
              </InfoRow>
              <InfoRow label="Dirección">{business.address ?? '—'}</InfoRow>
              <InfoRow label="Zona horaria">{business.timezone}</InfoRow>
              <InfoRow label="Confirmación">
                {business.autoConfirm ? 'Automática' : 'Manual'}
              </InfoRow>
              <InfoRow label="WhatsApp">
                {business.whatsappEnabled ? 'Activado' : 'Desactivado'}
              </InfoRow>
            </dl>
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Origen de las reservas" description="Este mes">
            <ShareBars
              emptyText="Sin reservas este mes"
              rows={[
                { label: SOURCE_LABELS.WEB, value: business.usage.bySource.WEB },
                {
                  label: SOURCE_LABELS.WHATSAPP,
                  value: business.usage.bySource.WHATSAPP,
                  tone: 'bg-emerald-500',
                },
                {
                  label: SOURCE_LABELS.PANEL,
                  value: business.usage.bySource.PANEL,
                  tone: 'bg-fg-subtle',
                },
              ]}
            />
          </Panel>
          <Panel title="Estado de las citas" description="Este mes">
            <ShareBars emptyText="Sin reservas este mes" rows={statusRows} />
          </Panel>
          <Panel title="Mensajes" description="Este mes">
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-xs font-medium text-fg-muted">Correos</p>
                <DeliveryStats
                  items={[
                    { label: 'Enviados', value: business.usage.email.sent },
                    { label: 'Fallidos', value: business.usage.email.failed, tone: 'danger' },
                    { label: 'Vista previa', value: business.usage.email.preview, tone: 'muted' },
                  ]}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-fg-muted">WhatsApp</p>
                <DeliveryStats
                  items={[
                    { label: 'Enviados', value: business.usage.whatsapp.sent },
                    { label: 'Fallidos', value: business.usage.whatsapp.failed, tone: 'danger' },
                    {
                      label: 'Vista previa',
                      value: business.usage.whatsapp.preview,
                      tone: 'muted',
                    },
                  ]}
                />
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Suscripción">
          {business.subscription ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex flex-wrap items-center gap-2 text-sm text-fg">
                  Plan {business.subscription.plan.name}
                  <Badge tone={SUBSCRIPTION_STATUS_META[business.subscription.status].tone}>
                    {SUBSCRIPTION_STATUS_META[business.subscription.status].label}
                  </Badge>
                  {business.subscription.isComplimentary && <Badge tone="brand">Cortesía</Badge>}
                </p>
                <p className="text-sm text-fg-muted">
                  {business.subscription.isComplimentary
                    ? 'Sin costo'
                    : `${formatCOP(business.subscription.plan.priceMonthly)}/mes`}
                  {business.subscription.currentPeriodEnd &&
                    ` · vence el ${formatInTz(business.subscription.currentPeriodEnd, PLATFORM_TZ, 'd MMM yyyy')}`}
                </p>
              </div>
              {business.subscription.payments.length > 0 && (
                <ul className="divide-y divide-line rounded-md border border-line">
                  {business.subscription.payments.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-sm">
                      <span className="w-40 text-fg-muted">{when(p.createdAt)}</span>
                      <span className="flex-1 text-fg-muted">
                        {p.cardBrand ? CARD_BRAND_LABELS[p.cardBrand] : 'Tarjeta'}
                        {p.cardLast4 && ` •••• ${p.cardLast4}`}
                        {p.provider === 'SIMULATED' && ' · prueba'}
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
          ) : (
            <p className="text-sm text-fg-subtle">Este negocio no tiene suscripción.</p>
          )}
        </Panel>

        <Panel title={`Equipo (${business.members.length})`}>
          <ul className="-my-2 divide-y divide-line">
            {business.members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-fg">{m.name}</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="block truncate text-xs text-fg-subtle hover:text-fg-muted"
                  >
                    {m.email}
                  </a>
                </span>
                {!m.emailVerifiedAt && <Badge tone="warning">Correo sin verificar</Badge>}
                <Badge tone={m.role === 'ADMIN' ? 'brand' : 'neutral'}>{ROLE_LABELS[m.role]}</Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Fallos recientes" description="Correos y WhatsApp que no se pudieron enviar">
            {business.recentFailures.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-fg-muted">
                <CheckCircle2 className="size-4 text-emerald-400" /> Sin fallos de envío
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {business.recentFailures.map((f) => (
                  <li key={f.id} className="flex gap-3 text-sm">
                    {f.channel === 'email' ? (
                      <Mail className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                    ) : (
                      <MessageCircle className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                    )}
                    <div className="min-w-0">
                      <p className="text-fg">
                        {f.kind} <span className="text-xs text-fg-subtle">· {when(f.createdAt)}</span>
                      </p>
                      <p className="text-xs break-words text-danger">{f.error ?? 'Sin detalle'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Historial de la plataforma" description="Suspensiones y reactivaciones">
            {business.actions.length === 0 ? (
              <p className="text-sm text-fg-subtle">Sin acciones registradas</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {business.actions.map((a) => (
                  <li key={a.id} className="text-sm">
                    <p className="text-fg">
                      {a.type === 'SUSPEND_BUSINESS' ? 'Suspendido' : 'Reactivado'}{' '}
                      <span className="text-fg-subtle">por {a.admin.name}</span>
                    </p>
                    <p className="text-xs text-fg-subtle">{when(a.createdAt)}</p>
                    {a.reason && <p className="mt-0.5 text-xs text-fg-muted">“{a.reason}”</p>}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>

      <BusinessStatusModal
        business={business}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onChanged={setUpdated}
      />
    </>
  )
}
