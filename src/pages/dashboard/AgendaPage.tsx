import { Ban, CalendarPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AgendaList } from '@/components/agenda/AgendaList'
import { AppointmentDetailsModal } from '@/components/agenda/AppointmentDetailsModal'
import { AppointmentStatusBadge } from '@/components/agenda/AppointmentStatusBadge'
import { DateNavigator } from '@/components/agenda/DateNavigator'
import { DayGrid } from '@/components/agenda/DayGrid'
import { NewAppointmentModal } from '@/components/agenda/NewAppointmentModal'
import { TimeOffModal } from '@/components/agenda/TimeOffModal'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Modal } from '@/components/common/Modal'
import { Spinner } from '@/components/common/Spinner'
import { GRID_STATUSES } from '@/constants/appointment'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useAgenda } from '@/hooks/useAgenda'
import { useAuth } from '@/hooks/useAuth'
import { useResources } from '@/hooks/useResources'
import { useServices } from '@/hooks/useServices'
import { getErrorMessage } from '@/services/api'
import { appointmentsService } from '@/services/appointments'
import { useAgendaStore } from '@/store/agendaStore'
import { toast } from '@/store/toastStore'
import type { Appointment, AppointmentStatus, TimeOff } from '@/types/appointment'
import { formatClock, formatInTz, isValidDate, todayIn } from '@/utils/date'

export function AgendaPage() {
  const { business, canManage, isStaff } = useActiveBusiness()
  const { user } = useAuth()
  const tz = business.timezone
  const today = todayIn(tz)
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const date = isValidDate(params.get('date')) ? params.get('date')! : today

  const { resources: allResources, isLoading: loadingResources } = useResources(business.id)
  const { services } = useServices(business.id)
  const { appointments, timeOffs, isLoading, error, reload } = useAgenda(business.id, date)
  const refreshPending = useAgendaStore((s) => s.refreshPending)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedTimeOff, setSelectedTimeOff] = useState<TimeOff | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [timeOffOpen, setTimeOffOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Un profesional solo ve la(s) columna(s) vinculada(s) a su cuenta
  const resources = allResources.filter(
    (r) => r.isActive && (!isStaff || r.userId === user?.id),
  )
  const selected = appointments.find((a) => a.id === selectedId) ?? null
  const inactive = appointments.filter((a) => !GRID_STATUSES.includes(a.status))

  const setDate = (next: string) =>
    setParams(next === today ? {} : { date: next }, { replace: true })

  const changeStatus = async (a: Appointment, status: AppointmentStatus) => {
    await appointmentsService.updateStatus(business.id, a.id, status)
    reload()
    void refreshPending(business.id)
    if (status === 'CANCELLED') setSelectedId(null)
  }

  const deleteTimeOff = async () => {
    if (!selectedTimeOff) return
    setDeleting(true)
    try {
      await appointmentsService.deleteTimeOff(business.id, selectedTimeOff.id)
      setSelectedTimeOff(null)
      reload()
      toast.success('Bloqueo eliminado')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const viewProps = {
    timezone: tz,
    resources,
    appointments,
    timeOffs,
    onSelectAppointment: (a: Appointment) => setSelectedId(a.id),
    onSelectTimeOff: (t: TimeOff) => setSelectedTimeOff(t),
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <DateNavigator date={date} today={today} onChange={setDate} />
        <div className="flex gap-2">
          {canManage && (
            <Button variant="secondary" onClick={() => setTimeOffOpen(true)} disabled={resources.length === 0}>
              <Ban className="size-4" /> Bloquear horario
            </Button>
          )}
          <Button onClick={() => setNewOpen(true)} disabled={resources.length === 0}>
            <CalendarPlus className="size-4" /> Nueva cita
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert message={error} />
        </div>
      )}

      {loadingResources || isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : resources.length === 0 ? (
        isStaff ? (
          <EmptyState
            icon={Users}
            title="Aún no tienes una agenda asignada"
            description={`Pídele a un administrador de ${business.name} que vincule tu cuenta a tu columna de la agenda en Miembros.`}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Aún no hay a quién agendar"
            description="Agrega profesionales o espacios con su horario para empezar a recibir citas."
            action={<Button onClick={() => navigate('/app/team')}>Configurar equipo</Button>}
          />
        )
      ) : (
        <>
          <div className="hidden md:block">
            <DayGrid date={date} {...viewProps} />
          </div>
          <div className="md:hidden">
            <AgendaList {...viewProps} />
          </div>

          {inactive.length > 0 && (
            <details className="mt-6 rounded-lg border border-line bg-surface">
              <summary className="cursor-pointer px-4 py-3 text-sm text-fg-muted select-none hover:text-fg">
                Canceladas y no asistió ({inactive.length})
              </summary>
              <ul className="divide-y divide-line border-t border-line">
                {inactive.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-2"
                    >
                      <span className="w-20 shrink-0 text-fg-muted tabular-nums">
                        {formatClock(a.startsAt, tz)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-fg">
                        {a.customer.name} · <span className="text-fg-muted">{a.resource.name}</span>
                      </span>
                      <AppointmentStatusBadge status={a.status} />
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}

      <AppointmentDetailsModal
        key={selected?.id}
        appointment={selected}
        timezone={tz}
        onClose={() => setSelectedId(null)}
        onChangeStatus={changeStatus}
      />

      <NewAppointmentModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        businessId={business.id}
        timezone={tz}
        defaultDate={date}
        services={services}
        resources={resources}
        onCreated={(a) => {
          setNewOpen(false)
          // Lleva la agenda al día de la nueva cita
          setDate(formatInTz(a.startsAt, tz, 'yyyy-MM-dd'))
          reload()
        }}
      />

      <TimeOffModal
        open={timeOffOpen}
        onClose={() => setTimeOffOpen(false)}
        businessId={business.id}
        timezone={tz}
        defaultDate={date}
        resources={resources}
        onCreated={reload}
      />

      <Modal
        open={selectedTimeOff !== null}
        onClose={() => setSelectedTimeOff(null)}
        title={selectedTimeOff?.reason || 'Horario bloqueado'}
        footer={
          canManage ? (
            <>
              <Button variant="secondary" onClick={() => setSelectedTimeOff(null)}>
                Cerrar
              </Button>
              <Button variant="danger" onClick={deleteTimeOff} isLoading={deleting}>
                Eliminar bloqueo
              </Button>
            </>
          ) : undefined
        }
      >
        {selectedTimeOff && (
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-fg">{selectedTimeOff.resource.name}</p>
            <p className="text-fg-muted">
              {formatInTz(selectedTimeOff.startsAt, tz, "EEE d 'de' MMM, h:mm aaa")} –{' '}
              {formatInTz(selectedTimeOff.endsAt, tz, "EEE d 'de' MMM, h:mm aaa")}
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}
