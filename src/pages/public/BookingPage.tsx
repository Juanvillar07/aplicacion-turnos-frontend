import { CalendarX2, MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookingConfirmation } from '@/components/booking/BookingConfirmation'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { CustomerForm } from '@/components/booking/CustomerForm'
import { DateStrip } from '@/components/booking/DateStrip'
import { ResourcePicker } from '@/components/booking/ResourcePicker'
import { ServicePicker } from '@/components/booking/ServicePicker'
import { SlotGrid } from '@/components/booking/SlotGrid'
import { StepHeader } from '@/components/booking/StepHeader'
import { Alert } from '@/components/common/Alert'
import { EmptyState } from '@/components/common/EmptyState'
import { FullPageSpinner, Spinner } from '@/components/common/Spinner'
import { useAsync } from '@/hooks/useAsync'
import { useAvailableDays, useSlots } from '@/hooks/usePublicAvailability'
import { PublicLayout } from '@/layouts/PublicLayout'
import { getErrorMessage } from '@/services/api'
import { publicBookingService } from '@/services/publicBooking'
import { whatsappBookingUrl, whatsappService } from '@/services/whatsapp'
import { useBookingStore } from '@/store/bookingStore'
import type { CustomerInput, PublicBusiness } from '@/types/booking'
import { capitalize, formatDate, todayIn } from '@/utils/date'
import { NotFoundBusinessPage } from './NotFoundBusinessPage'
import axios from 'axios'

export function BookingPage() {
  const { slug = '' } = useParams()
  const [business, setBusiness] = useState<PublicBusiness | null>(null)
  const [loadError, setLoadError] = useState<'not-found' | 'suspended' | string | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  /** Mensaje cuando el turno elegido se ocupó mientras el cliente llenaba sus datos */
  const [slotTakenMessage, setSlotTakenMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const booking = useBookingStore()
  const { step, serviceId, resourceId, date, slot, reset } = booking

  // Perfil del negocio
  useEffect(() => {
    let cancelled = false
    reset()
    publicBookingService
      .getBusiness(slug)
      .then((data) => !cancelled && setBusiness(data))
      .catch((err) => {
        if (cancelled) return
        const status = axios.isAxiosError(err) ? err.response?.status : undefined
        setLoadError(
          status === 404 ? 'not-found' : status === 403 ? 'suspended' : getErrorMessage(err),
        )
      })
    return () => {
      cancelled = true
    }
  }, [slug, reset])

  const service = business?.services.find((s) => s.id === serviceId) ?? null
  const resourcesForService = useMemo(
    () => business?.resources.filter((r) => serviceId && r.serviceIds.includes(serviceId)) ?? [],
    [business, serviceId],
  )
  const hasResourceStep = resourcesForService.length > 1
  const totalSteps = hasResourceStep ? 4 : 3
  const stepNumber = { service: 1, resource: 2, datetime: hasResourceStep ? 3 : 2, details: totalSteps, done: totalSteps }[step]

  const days = useAvailableDays(slug, step === 'datetime' ? serviceId : null, resourceId, reloadKey)
  const availableDays = useMemo(() => new Set(days.data), [days.data])
  const slots = useSlots(slug, step === 'datetime' ? serviceId : null, date, resourceId, reloadKey)
  const waInfo = useAsync('whatsapp-info', () => whatsappService.info(), null)
  const waNumber = business?.whatsappEnabled ? waInfo.data?.displayNumber : null

  // Al cargar los días, selecciona el primero disponible
  useEffect(() => {
    if (step === 'datetime' && !date && days.data.length > 0) booking.setDate(days.data[0])
  }, [step, date, days.data, booking])

  if (loadError === 'not-found') return <NotFoundBusinessPage />
  if (loadError === 'suspended') {
    return (
      <NotFoundBusinessPage
        title="Reservas en línea no disponibles"
        description="Este negocio no está recibiendo reservas en línea por ahora. Comunícate directamente con él."
      />
    )
  }
  if (loadError) {
    return (
      <PublicLayout>
        <Alert message={loadError} />
      </PublicLayout>
    )
  }
  if (!business) return <FullPageSpinner />

  const tz = business.timezone
  const resourceName =
    resourceId
      ? business.resources.find((r) => r.id === resourceId)?.name
      : slot?.resourceIds.length === 1
        ? business.resources.find((r) => r.id === slot.resourceIds[0])?.name
        : 'Cualquiera disponible'

  const handleBook = async (customer: CustomerInput) => {
    if (!service || !slot) return
    booking.setCustomer(customer)
    setIsBooking(true)
    setBookingError(null)
    try {
      const result = await publicBookingService.book(slug, {
        serviceId: service.id,
        resourceId,
        startsAt: slot.startsAt,
        customer,
      })
      booking.finish(result)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        // El turno se ocupó: volver a elegir hora con la disponibilidad actualizada
        setSlotTakenMessage(getErrorMessage(err))
        setReloadKey((k) => k + 1)
        booking.goTo('datetime')
      } else {
        setBookingError(getErrorMessage(err))
      }
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <PublicLayout business={business}>
      {step === 'service' && (
        <>
          <StepHeader title="¿Qué te quieres hacer?" subtitle="Elige un servicio" current={1} total={totalSteps} />
          {business.services.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              title="Aún no hay servicios disponibles"
              description="Este negocio todavía está configurando sus reservas en línea."
            />
          ) : (
            <ServicePicker
              services={business.services.filter((s) =>
                business.resources.some((r) => r.serviceIds.includes(s.id)),
              )}
              onSelect={(s) => {
                setSlotTakenMessage(null)
                const providers = business.resources.filter((r) => r.serviceIds.includes(s.id))
                booking.selectService(s.id, providers.length <= 1)
              }}
            />
          )}
          {waNumber && (
            <a
              href={whatsappBookingUrl(waNumber, business.slug)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 hover:bg-emerald-500/15"
            >
              <MessageCircle className="size-4" /> ¿Prefieres reservar por WhatsApp?
            </a>
          )}
        </>
      )}

      {step === 'resource' && (
        <>
          <StepHeader
            title="¿Con quién?"
            subtitle={service?.name}
            current={stepNumber}
            total={totalSteps}
            onBack={() => booking.goTo('service')}
          />
          <ResourcePicker resources={resourcesForService} onSelect={booking.selectResource} />
        </>
      )}

      {step === 'datetime' && (
        <>
          <StepHeader
            title="Elige día y hora"
            subtitle={[service?.name, resourceId ? resourceName : null].filter(Boolean).join(' · ')}
            current={stepNumber}
            total={totalSteps}
            onBack={() => booking.goTo(hasResourceStep ? 'resource' : 'service')}
          />
          {slotTakenMessage && (
            <div className="mb-4">
              <Alert message={slotTakenMessage} />
            </div>
          )}
          {days.isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : days.error ? (
            <Alert message={days.error} />
          ) : days.data.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              title="No hay horarios disponibles"
              description={`No encontramos turnos libres en los próximos ${business.maxDaysAhead} días. Prueba con otro servicio o profesional.`}
            />
          ) : (
            <div className="flex flex-col gap-6">
              <DateStrip
                from={todayIn(tz)}
                days={business.maxDaysAhead}
                available={availableDays}
                selected={date}
                onSelect={booking.setDate}
              />
              {date && (
                <div>
                  <p className="mb-3 text-sm font-medium text-fg">
                    {capitalize(formatDate(date))}
                  </p>
                  {slots.isLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : slots.error ? (
                    <Alert message={slots.error} />
                  ) : slots.data.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-line-strong p-4 text-center text-sm text-fg-muted">
                      Ya no quedan turnos este día. Elige otra fecha.
                    </p>
                  ) : (
                    <SlotGrid
                      slots={slots.data}
                      timezone={tz}
                      selected={slot?.startsAt ?? null}
                      onSelect={(s) => {
                        setSlotTakenMessage(null)
                        setBookingError(null)
                        booking.selectSlot(s)
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {step === 'details' && service && slot && (
        <>
          <StepHeader
            title="Tus datos"
            subtitle="Para confirmarte la cita y recordártela"
            current={stepNumber}
            total={totalSteps}
            onBack={() => booking.goTo('datetime')}
          />
          <div className="flex flex-col gap-5">
            <BookingSummary
              serviceName={service.name}
              durationMinutes={service.durationMinutes}
              price={service.price}
              resourceName={resourceName ?? ''}
              startsAt={slot.startsAt}
              timezone={tz}
            />
            <CustomerForm
              initial={booking.customer}
              onSubmit={handleBook}
              isLoading={isBooking}
              error={bookingError}
              submitLabel={business.autoConfirm ? 'Confirmar reserva' : 'Solicitar reserva'}
              showWhatsappOptIn={business.whatsappEnabled}
            />
          </div>
        </>
      )}

      {step === 'done' && booking.result && (
        <BookingConfirmation appointment={booking.result} onBookAnother={reset} />
      )}
    </PublicLayout>
  )
}
