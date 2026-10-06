import { Building2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BusinessStatusBadge } from '@/components/admin/BusinessStatusBadge'
import { Alert } from '@/components/common/Alert'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { fieldClass } from '@/components/common/Input'
import { PageHeader } from '@/components/common/PageHeader'
import { Spinner } from '@/components/common/Spinner'
import { CATEGORIES } from '@/constants/business'
import { SUBSCRIPTION_STATUS_META } from '@/constants/plans'
import { useAsync } from '@/hooks/useAsync'
import { adminService } from '@/services/admin'
import type { AdminBusinessPage } from '@/types/admin'
import type { BusinessStatus } from '@/types/business'
import { formatInTz } from '@/utils/date'

const EMPTY: AdminBusinessPage = { items: [], total: 0, page: 1, pageSize: 20 }
const PLATFORM_TZ = 'America/Bogota'

const STATUS_FILTERS: { value: BusinessStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'SUSPENDED', label: 'Suspendidos' },
]

export function AdminBusinessesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [status, setStatus] = useState<BusinessStatus | ''>('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, error } = useAsync(
    `${debounced}|${status}|${page}`,
    () => adminService.listBusinesses({ search: debounced, status, page }),
    EMPTY,
  )
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize))
  const filtered = Boolean(debounced || status)

  return (
    <>
      <PageHeader
        title="Negocios"
        description="Todos los negocios registrados en AgendaBarrio."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" />
          <input
            aria-label="Buscar negocios"
            placeholder="Buscar por nombre, enlace, ciudad o correo del administrador"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`h-9 pl-9 ${fieldClass}`}
          />
        </div>
        <div className="flex gap-1 rounded-md border border-line bg-surface p-0.5" role="group">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatus(f.value)
                setPage(1)
              }}
              aria-pressed={status === f.value}
              className={`cursor-pointer rounded px-3 py-1 text-sm transition-colors ${
                status === f.value ? 'bg-surface-2 text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={filtered ? 'Sin resultados' : 'Aún no hay negocios'}
          description={
            filtered
              ? 'Ningún negocio coincide con la búsqueda o el filtro.'
              : 'Aparecerán aquí cuando alguien registre su negocio.'
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-sm">
              <thead className="hidden bg-surface text-left text-xs text-fg-subtle md:table-header-group">
                <tr className="border-b border-line">
                  <th className="px-4 py-2.5 font-medium">Negocio</th>
                  <th className="px-4 py-2.5 font-medium">Administrador</th>
                  <th className="px-4 py-2.5 font-medium">Plan</th>
                  <th className="px-4 py-2.5 font-medium">Estado</th>
                  <th className="px-4 py-2.5 text-right font-medium">Citas del mes</th>
                  <th className="px-4 py-2.5 font-medium">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => navigate(`/admin/businesses/${b.id}`)}
                    className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface-2/60 md:table-row md:p-0"
                  >
                    <td className="w-full md:w-auto md:px-4 md:py-3">
                      <p className="font-medium text-fg">{b.name}</p>
                      <p className="truncate text-xs text-fg-subtle">
                        {CATEGORIES[b.category].label}
                        {b.city && ` · ${b.city}`} · /b/{b.slug}
                      </p>
                    </td>
                    <td className="min-w-0 md:px-4 md:py-3">
                      {b.owner ? (
                        <>
                          <p className="truncate text-fg-muted">{b.owner.name}</p>
                          <p className="truncate text-xs text-fg-subtle">{b.owner.email}</p>
                        </>
                      ) : (
                        <span className="text-fg-subtle">Sin administrador</span>
                      )}
                    </td>
                    <td className="text-fg-muted md:px-4 md:py-3">
                      {b.subscription ? (
                        <span className="inline-flex items-center gap-1.5">
                          {b.subscription.plan.name}
                          {b.subscription.isComplimentary && <Badge tone="brand">Cortesía</Badge>}
                          {b.subscription.status !== 'ACTIVE' && (
                            <Badge tone={SUBSCRIPTION_STATUS_META[b.subscription.status].tone}>
                              {SUBSCRIPTION_STATUS_META[b.subscription.status].label}
                            </Badge>
                          )}
                        </span>
                      ) : (
                        <span className="text-fg-subtle">Sin plan</span>
                      )}
                    </td>
                    <td className="md:px-4 md:py-3">
                      <BusinessStatusBadge status={b.status} />
                    </td>
                    <td className="text-fg-muted tabular-nums md:px-4 md:py-3 md:text-right">
                      <span className="md:hidden">Citas del mes: </span>
                      {b.appointmentsThisMonth}
                    </td>
                    <td className="text-fg-muted md:px-4 md:py-3">
                      {formatInTz(b.createdAt, PLATFORM_TZ, 'd MMM yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-fg-muted">
            <span>
              {data.total} negocio{data.total === 1 ? '' : 's'}
            </span>
            {pages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  aria-label="Página anterior"
                  className="cursor-pointer rounded-md border border-line p-1.5 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="tabular-nums">
                  {page} / {pages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pages}
                  aria-label="Página siguiente"
                  className="cursor-pointer rounded-md border border-line p-1.5 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
