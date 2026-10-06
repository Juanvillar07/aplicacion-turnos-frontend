import { MailPlus, Plus, RotateCw, UserPlus, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Spinner } from '@/components/common/Spinner'
import { Switch } from '@/components/common/Switch'
import { ResourceCard } from '@/components/resources/ResourceCard'
import {
  RESOURCE_FORM_ID,
  ResourceForm,
  type ResourceFormValues,
} from '@/components/resources/ResourceForm'
import {
  WORKING_HOURS_FORM_ID,
  WorkingHoursEditor,
} from '@/components/resources/WorkingHoursEditor'
import { InviteMemberModal } from '@/components/team/InviteMemberModal'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useResources } from '@/hooks/useResources'
import { useServices } from '@/hooks/useServices'
import { useTeam } from '@/hooks/useTeam'
import { getErrorMessage } from '@/services/api'
import { teamService } from '@/services/team'
import { toast } from '@/store/toastStore'
import type { Resource, WorkingHoursSlot } from '@/types/resource'
import type { PendingInvitation, Team } from '@/types/team'
import { formatInTz } from '@/utils/date'

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; resource: Resource }
  | { kind: 'hours'; resource: Resource }
  /** Invitar a un profesional nuevo, o a uno existente "sin cuenta" */
  | { kind: 'invite'; resource?: Resource }
  | null

/**
 * Profesionales y espacios. Los profesionales (personas) entran solo por
 * invitación: aparecen aquí cuando aceptan, listos para asignarles horario.
 * Los espacios (canchas) se crean directamente.
 */
export function ResourcesPage() {
  const { business, canManage, category } = useActiveBusiness()
  const { resources, isLoading, error, create, update, setWorkingHours } = useResources(
    business.id,
  )
  const { services } = useServices(business.id)
  const { team, setTeam } = useTeam(business.id)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const servicesById = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])
  const visible = showInactive ? resources : resources.filter((r) => r.isActive)
  const inactiveCount = resources.filter((r) => !r.isActive).length
  const singular = category.resourceSingular

  // Canchas: solo espacios. "Otro": personas y espacios. El resto: personas.
  const usesPeople = business.category !== 'SPORTS_COURT'
  const usesSpaces = business.category === 'SPORTS_COURT' || business.category === 'OTHER'
  const spaceLabel = business.category === 'SPORTS_COURT' ? singular : 'espacio'
  const personLabel = business.category === 'OTHER' ? 'profesional' : singular

  const staffInvitations = team.invitations.filter((inv) => inv.role === 'STAFF')
  const newInvitations = staffInvitations.filter((inv) => !inv.resource)
  const invitationFor = (resourceId: string) =>
    staffInvitations.find((inv) => inv.resource?.id === resourceId)

  /** Ejecuta una acción del modal; los errores y confirmaciones se muestran como toast */
  const run = async (
    action: () => Promise<unknown>,
    { success, keepOpen = false }: { success?: string; keepOpen?: boolean } = {},
  ) => {
    setIsSaving(true)
    try {
      const result = await action()
      if (!keepOpen) setDialog(null)
      if (success) toast.success(success)
      return result
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  /** Acciones de invitación: el backend devuelve el equipo actualizado */
  const mutateTeam = async (action: () => Promise<Team>, success: string) => {
    try {
      setTeam(await action())
      toast.success(success)
      return true
    } catch (err) {
      toast.error(getErrorMessage(err))
      return false
    }
  }

  const resend = (inv: PendingInvitation) =>
    mutateTeam(
      () => teamService.resendInvitation(business.id, inv.id),
      `Invitación reenviada a ${inv.email}`,
    )
  const revoke = (inv: PendingInvitation) =>
    mutateTeam(() => teamService.revokeInvitation(business.id, inv.id), 'Invitación cancelada')

  const handleResourceSubmit = async ({ name, type, serviceIds }: ResourceFormValues) => {
    if (dialog?.kind === 'edit') {
      await run(() => update(dialog.resource.id, { name }, serviceIds), {
        success: 'Cambios guardados',
      })
      return
    }
    // Tras crear, se abre directamente el editor de horario
    const created = (await run(() => create({ name, type, serviceIds }), {
      success: `${name} agregado. Ahora define su horario.`,
      keepOpen: true,
    })) as Resource | undefined
    if (created) setDialog({ kind: 'hours', resource: created })
  }

  const handleHoursSubmit = (hours: WorkingHoursSlot[]) =>
    dialog?.kind === 'hours' &&
    run(() => setWorkingHours(dialog.resource.id, hours), { success: 'Horario guardado' })

  const invitingResource = dialog?.kind === 'invite' ? dialog.resource : undefined

  const actions = canManage && (
    <>
      {usesSpaces && (
        <Button
          variant={usesPeople ? 'secondary' : 'primary'}
          onClick={() => setDialog({ kind: 'create' })}
        >
          <Plus className="size-4" /> Agregar {spaceLabel}
        </Button>
      )}
      {usesPeople && (
        <Button onClick={() => setDialog({ kind: 'invite' })}>
          <UserPlus className="size-4" /> Agregar {personLabel}
        </Button>
      )}
    </>
  )

  const isEmpty = resources.length === 0 && newInvitations.length === 0

  return (
    <>
      <PageHeader
        title={category.resourcesLabel}
        description={
          usesPeople
            ? 'Invita a tu equipo: cuando acepten aparecen aquí para asignarles servicios y horario.'
            : 'Tus espacios, qué servicios ofrecen y en qué horario.'
        }
        actions={!isEmpty && actions}
      />

      {error && <Alert message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={Users}
          title={`Aún no tienes ${category.resourcesLabel.toLowerCase()}`}
          description={
            usesPeople
              ? 'Invita a cada persona que atiende: recibirá un correo para crear su cuenta y ver su agenda.'
              : 'Cada reserva se asigna a un espacio con su propio horario.'
          }
          action={actions}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {inactiveCount > 0 && (
            <div className="flex justify-end">
              <Switch
                checked={showInactive}
                onChange={setShowInactive}
                label={`Mostrar inactivos (${inactiveCount})`}
              />
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((resource) => {
              const invitation = invitationFor(resource.id)
              return (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  servicesById={servicesById}
                  canEdit={canManage}
                  onEdit={() => setDialog({ kind: 'edit', resource })}
                  onEditHours={() => setDialog({ kind: 'hours', resource })}
                  invitation={invitation}
                  onInvite={() => setDialog({ kind: 'invite', resource })}
                  onResendInvitation={invitation && (() => void resend(invitation))}
                  onRevokeInvitation={invitation && (() => void revoke(invitation))}
                />
              )
            })}

            {/* Invitados que aún no aceptan: aparecerán como tarjeta al registrarse */}
            {newInvitations.map((inv) => (
              <article
                key={inv.id}
                className="flex flex-col justify-between gap-4 rounded-lg border border-dashed border-line-strong p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong text-fg-subtle">
                    <MailPlus className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-fg">{inv.email}</p>
                    <p className="text-xs text-fg-subtle">
                      Invitación pendiente · vence el{' '}
                      {formatInTz(inv.expiresAt, business.timezone, "d 'de' MMM")}
                    </p>
                    <p className="mt-2 text-sm text-fg-muted">
                      Aparecerá aquí cuando cree su cuenta; ahí podrás asignarle servicios y
                      horario.
                    </p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => void resend(inv)}>
                      <RotateCw className="size-3.5" /> Reenviar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => void revoke(inv)}>
                      <X className="size-3.5" /> Cancelar
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Invitar profesional (nuevo o vinculando una columna "sin cuenta") */}
      <InviteMemberModal
        open={dialog?.kind === 'invite'}
        onClose={() => setDialog(null)}
        title={invitingResource ? `Invitar a ${invitingResource.name}` : `Agregar ${personLabel}`}
        description="Le enviaremos un correo con un enlace para crear su cuenta."
        note={
          invitingResource
            ? `Al aceptar, ${invitingResource.name} conserva su horario y sus citas, y podrá ver su agenda desde el panel.`
            : 'Al aceptar aparecerá aquí con su nombre y todos los servicios activos; luego le defines el horario. Podrá ver y gestionar su propia agenda.'
        }
        onSubmit={(email) =>
          mutateTeam(
            () =>
              teamService.invite(business.id, {
                email,
                role: 'STAFF',
                ...(invitingResource && { resourceId: invitingResource.id }),
              }),
            `Invitación enviada a ${email}`,
          )
        }
      />

      {/* Crear espacio / editar */}
      <Modal
        open={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        onClose={() => setDialog(null)}
        title={dialog?.kind === 'edit' ? `Editar ${dialog.resource.name}` : `Agregar ${spaceLabel}`}
        footer={
          <>
            {dialog?.kind === 'edit' && (
              <Button
                variant={dialog.resource.isActive ? 'danger' : 'secondary'}
                className="mr-auto"
                disabled={isSaving}
                onClick={() =>
                  run(
                    () => update(dialog.resource.id, { isActive: !dialog.resource.isActive }),
                    {
                      success: dialog.resource.isActive
                        ? `${dialog.resource.name} desactivado`
                        : `${dialog.resource.name} reactivado`,
                    },
                  )
                }
              >
                {dialog.resource.isActive ? 'Desactivar' : 'Reactivar'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button type="submit" form={RESOURCE_FORM_ID} isLoading={isSaving}>
              {dialog?.kind === 'edit' ? 'Guardar' : 'Continuar'}
            </Button>
          </>
        }
      >
        {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
          <ResourceForm
            key={dialog.kind === 'edit' ? dialog.resource.id : 'new'}
            initial={dialog.kind === 'edit' ? dialog.resource : undefined}
            defaultType="SPACE"
            category={category}
            services={services}
            onSubmit={handleResourceSubmit}
          />
        )}
      </Modal>

      {/* Horario semanal */}
      <Modal
        open={dialog?.kind === 'hours'}
        onClose={() => setDialog(null)}
        size="lg"
        title={dialog?.kind === 'hours' ? `Horario de ${dialog.resource.name}` : ''}
        description="Define los días y franjas en que se pueden agendar citas."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button type="submit" form={WORKING_HOURS_FORM_ID} isLoading={isSaving}>
              Guardar horario
            </Button>
          </>
        }
      >
        {dialog?.kind === 'hours' && (
          <WorkingHoursEditor
            key={dialog.resource.id}
            initial={dialog.resource.workingHours}
            onSubmit={handleHoursSubmit}
          />
        )}
      </Modal>
    </>
  )
}
