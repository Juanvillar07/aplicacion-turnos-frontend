import { Clock, Pencil } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import type { Service } from '@/types/catalog'
import { formatCOP, formatDuration } from '@/utils/format'

interface ServiceListProps {
  services: Service[]
  canEdit: boolean
  onEdit: (service: Service) => void
}

export function ServiceList({ services, canEdit, onEdit }: ServiceListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead className="hidden bg-surface text-left text-xs text-fg-subtle sm:table-header-group">
          <tr className="border-b border-line">
            <th className="px-4 py-2.5 font-medium">Servicio</th>
            <th className="px-4 py-2.5 font-medium">Duración</th>
            <th className="px-4 py-2.5 text-right font-medium">Precio</th>
            <th className="px-4 py-2.5 font-medium">Estado</th>
            {canEdit && <th className="w-12 px-4 py-2.5" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {services.map((service) => (
            <tr
              key={service.id}
              className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:table-row sm:p-0 ${
                service.isActive ? '' : 'opacity-55'
              }`}
            >
              <td className="w-full sm:w-auto sm:px-4 sm:py-3">
                <p className="font-medium text-fg">{service.name}</p>
                {service.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-fg-subtle">
                    {service.description}
                  </p>
                )}
              </td>
              <td className="text-fg-muted sm:px-4 sm:py-3">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="size-3.5" />
                  {formatDuration(service.durationMinutes)}
                </span>
              </td>
              <td className="font-medium whitespace-nowrap text-fg tabular-nums sm:px-4 sm:py-3 sm:text-right">
                {formatCOP(service.price)}
              </td>
              <td className="sm:px-4 sm:py-3">
                {service.isActive ? (
                  <Badge tone="success">Activo</Badge>
                ) : (
                  <Badge tone="muted">Inactivo</Badge>
                )}
              </td>
              {canEdit && (
                <td className="ml-auto sm:px-4 sm:py-3">
                  <button
                    type="button"
                    onClick={() => onEdit(service)}
                    aria-label={`Editar ${service.name}`}
                    className="cursor-pointer rounded-md p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
                  >
                    <Pencil className="size-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
