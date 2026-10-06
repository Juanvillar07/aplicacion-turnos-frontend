import { CalendarDays, LogOut, MailPlus, RotateCw, Trash2, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert } from '@/components/common/Alert'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { fieldClass } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Spinner } from '@/components/common/Spinner'
import { InviteMemberModal } from '@/components/team/InviteMemberModal'
import { ROLE_LABELS } from '@/constants/roles'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useAuth } from '@/hooks/useAuth'
import { useTeam } from '@/hooks/useTeam'
import { getErrorMessage } from '@/services/api'
import { teamService } from '@/services/team'
import { useBusinessStore } from '@/store/businessStore'
import { toast } from '@/store/toastStore'
import type { MemberRole } from '@/types/business'
import type { Team, TeamMember } from '@/types/team'
import { formatInTz } from '@/utils/date'

const ROLES: MemberRole[] = ['ADMIN', 'STAFF']

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function MembersPage() {
  const { business, category } = useActiveBusiness()
  const { user } = useAuth()
  const navigate = useNavigate()
  const fetchMyBusinesses = useBusinessStore((s) => s.fetchMyBusinesses)
  const { team, setTeam, isLoading, error } = useTeam(business.id)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removing, setRemoving] = useState<TeamMember | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  /** Ejecuta una acción que devuelve el equipo actualizado */
  const mutate = async (action: () => Promise<Team>, success: string) => {
    try {
      setTeam(await action())
      toast.success(success)
      return true
    } catch (err) {
      toast.error(getErrorMessage(err))
      return false
    }
  }

  const changeRole = async (m: TeamMember, role: MemberRole) => {
    const isSelf = m.user.id === user?.id
    const ok = await mutate(
      () => teamService.updateMember(business.id, m.id, { role }),
      role === 'STAFF'
        ? `${m.user.name} ahora es profesional: ya tiene su columna en ${category.resourcesLabel}`
        : `${m.user.name} ahora es administrador`,
    )
    // Cambió su propio rol: se recargan sus permisos en el panel
    if (ok && isSelf) {
      await fetchMyBusinesses()
      if (role === 'STAFF') navigate('/app/agenda', { replace: true })
    }
  }

  const confirmRemove = async () => {
    if (!removing) return
    const isSelf = removing.user.id === user?.id
    setIsRemoving(true)
    try {
      await teamService.removeMember(business.id, removing.id)
      setRemoving(null)
      if (isSelf) {
        toast.success(`Saliste de ${business.name}`)
        await fetchMyBusinesses()
        navigate('/app', { replace: true })
        return
      }
      setTeam((t) => ({ ...t, members: t.members.filter((m) => m.id !== removing.id) }))
      toast.success(`${removing.user.name} ya no tiene acceso`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsRemoving(false)
    }
  }

  const resourcesLink = (
    <Link to="/app/team" className="text-fg-muted underline underline-offset-2 hover:text-fg">
      {category.resourcesLabel}
    </Link>
  )

  return (
    <>
      <PageHeader
        title="Miembros"
        description={`Quién tiene acceso al panel de ${business.name}.`}
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" /> Invitar administrador
          </Button>
        }
      />

      {error && <Alert message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {team.members.map((m) => {
                const isSelf = m.user.id === user?.id
                return (
                  <li key={m.id} className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-fg-muted">
                        {initials(m.user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate text-sm font-medium text-fg">
                          {m.user.name}
                          {isSelf && <Badge tone="brand">Tú</Badge>}
                        </p>
                        <p className="truncate text-xs text-fg-subtle">
                          {m.user.email}
                          {m.resource && (
                            <span className="inline-flex items-center gap-1">
                              {' · '}
                              <CalendarDays className="size-3" /> Agenda de {m.resource.name}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-12 lg:pl-0">
                      <select
                        aria-label={`Rol de ${m.user.name}`}
                        value={m.role}
                        onChange={(e) => void changeRole(m, e.target.value as MemberRole)}
                        className={`h-8 w-36 cursor-pointer text-[13px] ${fieldClass}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>

                      {isSelf ? (
                        <Button variant="ghost" size="sm" onClick={() => setRemoving(m)}>
                          <LogOut className="size-3.5" /> Salir
                        </Button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRemoving(m)}
                          aria-label={`Quitar a ${m.user.name}`}
                          className="cursor-pointer rounded-md p-2 text-fg-subtle hover:bg-surface-2 hover:text-danger"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="text-xs text-fg-subtle">
              Los profesionales se invitan desde {resourcesLink}: al aceptar quedan con su
              columna en la agenda.
            </p>
          </div>

          <section>
            <h2 className="mb-3 text-sm font-medium text-fg">
              Invitaciones pendientes{' '}
              <span className="text-fg-subtle">· {team.invitations.length}</span>
            </h2>
            {team.invitations.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-sm text-fg-subtle">
                No hay invitaciones pendientes.
              </p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
                {team.invitations.map((inv) => (
                  <li key={inv.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong text-fg-subtle">
                        <MailPlus className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-fg">{inv.email}</p>
                        <p className="truncate text-xs text-fg-subtle">
                          {ROLE_LABELS[inv.role]}
                          {inv.resource && ` · Agenda de ${inv.resource.name}`} · vence el{' '}
                          {formatInTz(inv.expiresAt, business.timezone, "d 'de' MMM")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 pl-12 sm:pl-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          mutate(
                            () => teamService.resendInvitation(business.id, inv.id),
                            `Invitación reenviada a ${inv.email}`,
                          )
                        }
                      >
                        <RotateCw className="size-3.5" /> Reenviar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          mutate(
                            () => teamService.revokeInvitation(business.id, inv.id),
                            'Invitación cancelada',
                          )
                        }
                      >
                        <X className="size-3.5" /> Cancelar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invitar administrador"
        description="Le enviaremos un correo con un enlace para unirse."
        note="Un administrador gestiona todo el negocio (agenda, servicios, equipo y configuración), pero no atiende clientes."
        onSubmit={(email) =>
          mutate(
            () => teamService.invite(business.id, { email, role: 'ADMIN' }),
            `Invitación enviada a ${email}`,
          )
        }
      />

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={
          removing?.user.id === user?.id
            ? `¿Salir de ${business.name}?`
            : `¿Quitar a ${removing?.user.name}?`
        }
        description={
          removing?.user.id === user?.id
            ? 'Perderás el acceso a este negocio. Para volver necesitarás una nueva invitación.'
            : 'Perderá el acceso al panel. Sus citas y su columna en la agenda se conservan.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmRemove} isLoading={isRemoving}>
              {removing?.user.id === user?.id ? 'Salir' : 'Quitar acceso'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">{removing?.user.email}</p>
      </Modal>
    </>
  )
}
