import { Box, Clock, MailPlus, Pencil, RotateCw, User, UserCheck, X } from 'lucide-react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import type { Service } from '@/types/catalog'
import type { Resource } from '@/types/resource'
import type { PendingInvitation } from '@/types/team'
import { summarizeSchedule } from '@/utils/schedule'

interface ResourceCardProps {
  resource: Resource
  servicesById: Map<string, Service>
  canEdit: boolean
  onEdit: () => void
  onEditHours: () => void
  /** Invitación vigente para vincular esta columna a una cuenta */
  invitation?: PendingInvitation
  onInvite?: () => void
  onResendInvitation?: () => void
  onRevokeInvitation?: () => void
}

export function ResourceCard({
  resource,
  servicesById,
  canEdit,
  onEdit,
  onEditHours,
  invitation,
  onInvite,
  onResendInvitation,
  onRevokeInvitation,
}: ResourceCardProps) {
  const Icon = resource.type === 'PERSON' ? User : Box
  const schedule = summarizeSchedule(resource.workingHours)
  const serviceNames = resource.serviceIds
    .map((id) => servicesById.get(id))
    .filter((s): s is Service => Boolean(s?.isActive))
    .map((s) => s.name)

  return (
    <article
      className={`flex flex-col rounded-lg border border-line bg-surface ${
        resource.isActive ? '' : 'opacity-55'
      }`}
    >
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-fg-muted">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-fg">{resource.name}</h3>
          <p className="truncate text-xs text-fg-subtle">
            {resource.type === 'SPACE' ? 'Espacio' : (resource.user?.email ?? 'Profesional')}
          </p>
        </div>
        {!resource.isActive && <Badge tone="muted">Inactivo</Badge>}
        {resource.type === 'PERSON' && !resource.user && (
          <Badge tone="warning">Sin cuenta</Badge>
        )}
        {canEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${resource.name}`}
            className="cursor-pointer rounded-md p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
          >
            <Pencil className="size-4" />
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        {resource.type === 'PERSON' && canEdit && !resource.user && (
          <div className="rounded-md border border-dashed border-line-strong px-3 py-2.5">
            {invitation ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="min-w-0 flex-1 text-xs text-fg-muted">
                  <MailPlus className="mr-1 inline size-3.5 align-[-3px]" />
                  Invitación enviada a <span className="text-fg">{invitation.email}</span>
                </p>
                <span className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={onResendInvitation}>
                    <RotateCw className="size-3.5" /> Reenviar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onRevokeInvitation}>
                    <X className="size-3.5" /> Cancelar
                  </Button>
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <p className="min-w-0 flex-1 text-xs text-fg-muted">
                  No tiene cuenta: no puede ver su agenda en el panel.
                </p>
                <Button variant="secondary" size="sm" onClick={onInvite}>
                  <MailPlus className="size-3.5" /> Invitar
                </Button>
              </div>
            )}
          </div>
        )}
        {resource.type === 'PERSON' && resource.user && (
          <p className="-mb-1 flex items-center gap-1.5 text-xs text-fg-subtle">
            <UserCheck className="size-3.5 text-emerald-400" /> Cuenta de {resource.user.name}
          </p>
        )}
        <div>
          <p className="mb-1.5 text-xs font-medium text-fg-subtle">Servicios</p>
          {serviceNames.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {serviceNames.map((name) => (
                <Badge key={name}>{name}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-fg-subtle">Sin servicios asignados</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-fg-subtle">Horario</p>
          {schedule.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {schedule.map((line) => (
                <li key={line.days} className="flex gap-3">
                  <span className="w-20 shrink-0 text-fg-muted">{line.days}</span>
                  <span className="text-fg">{line.hours}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-400/90">Sin horario: no recibirá reservas</p>
          )}
        </div>
      </div>

      {canEdit && (
        <footer className="border-t border-line px-4 py-3">
          <Button variant="secondary" size="sm" onClick={onEditHours}>
            <Clock className="size-3.5" /> Editar horario
          </Button>
        </footer>
      )}
    </article>
  )
}
