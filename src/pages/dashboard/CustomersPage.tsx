import { ChevronLeft, ChevronRight, Contact, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '@/components/common/Alert'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { fieldClass } from '@/components/common/Input'
import { PageHeader } from '@/components/common/PageHeader'
import { Spinner } from '@/components/common/Spinner'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useAsync } from '@/hooks/useAsync'
import { customersService } from '@/services/customers'
import type { CustomerPage } from '@/types/customer'
import { formatInTz } from '@/utils/date'
import { formatCOP } from '@/utils/format'
import { prettyPhone } from '@/utils/phone'

const EMPTY: CustomerPage = { items: [], total: 0, page: 1, pageSize: 20 }

export function CustomersPage() {
  const { business } = useActiveBusiness()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, error } = useAsync(
    `${business.id}|${debounced}|${page}`,
    () => customersService.list(business.id, debounced, page),
    EMPTY,
  )
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize))
  const tz = business.timezone

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Quienes han reservado en tu negocio, con su historial."
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" />
        <input
          aria-label="Buscar clientes"
          placeholder="Buscar por nombre, celular o email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`h-9 pl-9 ${fieldClass}`}
        />
      </div>

      {error && <Alert message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Contact}
          title={debounced ? 'Sin resultados' : 'Aún no tienes clientes'}
          description={
            debounced
              ? `No encontramos clientes que coincidan con "${debounced}".`
              : 'Aparecerán aquí cuando reserven en tu página o los agendes desde el panel.'
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-sm">
              <thead className="hidden bg-surface text-left text-xs text-fg-subtle md:table-header-group">
                <tr className="border-b border-line">
                  <th className="px-4 py-2.5 font-medium">Cliente</th>
                  <th className="px-4 py-2.5 font-medium">Celular</th>
                  <th className="px-4 py-2.5 text-right font-medium">Citas</th>
                  <th className="px-4 py-2.5 font-medium">Última visita</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/app/customers/${c.id}`)}
                    className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface-2/60 md:table-row md:p-0"
                  >
                    <td className="w-full md:w-auto md:px-4 md:py-3">
                      <p className="flex items-center gap-2 font-medium text-fg">
                        {c.name}
                        {c.noShowCount > 0 && (
                          <Badge tone="danger">
                            {c.noShowCount} no asistió
                          </Badge>
                        )}
                      </p>
                      <p className="truncate text-xs text-fg-subtle">{c.email ?? 'Sin correo'}</p>
                    </td>
                    <td className="text-fg-muted tabular-nums md:px-4 md:py-3">
                      {prettyPhone(c.phone)}
                    </td>
                    <td className="text-fg-muted tabular-nums md:px-4 md:py-3 md:text-right">
                      <span className="md:hidden">Citas: </span>
                      {c.appointmentsCount}
                    </td>
                    <td className="text-fg-muted md:px-4 md:py-3">
                      {c.lastVisitAt ? formatInTz(c.lastVisitAt, tz, 'd MMM yyyy') : '—'}
                    </td>
                    <td className="ml-auto font-medium text-fg tabular-nums md:px-4 md:py-3 md:text-right">
                      {formatCOP(c.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-fg-muted">
            <span>
              {data.total} cliente{data.total === 1 ? '' : 's'}
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
