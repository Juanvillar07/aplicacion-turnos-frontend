import { Plus, Tag } from 'lucide-react'
import { useState } from 'react'
import { ServiceForm, SERVICE_FORM_ID } from '@/components/catalog/ServiceForm'
import { ServiceList } from '@/components/catalog/ServiceList'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { PageHeader } from '@/components/common/PageHeader'
import { Spinner } from '@/components/common/Spinner'
import { Switch } from '@/components/common/Switch'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useServices } from '@/hooks/useServices'
import { getErrorMessage } from '@/services/api'
import { toast } from '@/store/toastStore'
import type { Service, ServicePayload } from '@/types/catalog'

/** `null` = cerrado, `'new'` = creando, Service = editando */
type Editing = Service | 'new' | null

export function ServicesPage() {
  const { business, canManage } = useActiveBusiness()
  const { services, isLoading, error, create, update } = useServices(business.id)
  const [editing, setEditing] = useState<Editing>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const visible = showInactive ? services : services.filter((s) => s.isActive)
  const inactiveCount = services.length - services.filter((s) => s.isActive).length

  const open = (target: Editing) => setEditing(target)

  /** Ejecuta una acción del modal; los errores y confirmaciones se muestran como toast */
  const run = async (action: () => Promise<unknown>, success: string) => {
    setIsSaving(true)
    try {
      await action()
      setEditing(null)
      toast.success(success)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = (payload: ServicePayload) =>
    editing === 'new'
      ? run(() => create(payload), `Servicio "${payload.name}" creado`)
      : run(() => update((editing as Service).id, payload), 'Cambios guardados')

  const toggleActive = (service: Service) =>
    run(
      () => update(service.id, { isActive: !service.isActive }),
      service.isActive ? 'Servicio desactivado' : 'Servicio reactivado',
    )

  const newButton = canManage && (
    <Button onClick={() => open('new')}>
      <Plus className="size-4" /> Nuevo servicio
    </Button>
  )

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Lo que tus clientes pueden reservar, con su duración y precio."
        actions={services.length > 0 && newButton}
      />

      {error && <Alert message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Aún no tienes servicios"
          description="Agrega tu primer servicio para que tus clientes puedan empezar a reservar."
          action={newButton}
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
          <ServiceList services={visible} canEdit={canManage} onEdit={open} />
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nuevo servicio' : 'Editar servicio'}
        footer={
          <>
            {editing && editing !== 'new' && (
              <Button
                variant={editing.isActive ? 'danger' : 'secondary'}
                className="mr-auto"
                onClick={() => toggleActive(editing)}
                disabled={isSaving}
              >
                {editing.isActive ? 'Desactivar' : 'Reactivar'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button type="submit" form={SERVICE_FORM_ID} isLoading={isSaving}>
              Guardar
            </Button>
          </>
        }
      >
        {editing && (
          <ServiceForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? undefined : editing}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>
    </>
  )
}
