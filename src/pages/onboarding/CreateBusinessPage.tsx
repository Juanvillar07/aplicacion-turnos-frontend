import { BadgeCheck, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { BusinessForm } from '@/components/business/BusinessForm'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { BackButton } from '@/components/subscription/BackButton'
import { CheckoutForm } from '@/components/subscription/CheckoutForm'
import { PlanPicker } from '@/components/subscription/PlanPicker'
import { SignupSteps } from '@/components/subscription/SignupSteps'
import { VerifyEmailStep } from '@/components/subscription/VerifyEmailStep'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { subscriptionsService } from '@/services/subscriptions'
import { useBusinessStore } from '@/store/businessStore'
import { toast } from '@/store/toastStore'
import type { CreateBusinessPayload } from '@/types/business'
import type { Plan, PayPayload, Subscription } from '@/types/subscription'
import { formatInTz } from '@/utils/date'
import { formatCOP } from '@/utils/format'
import { slugify } from '@/utils/slug'

type Load = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready' }

/** Paso al que se volvió con "Atrás" (va en la URL para que funcione el atrás del navegador) */
type BackView = 'plan' | 'pago'

const day = (iso: string) => formatInTz(iso, 'America/Bogota', "d 'de' MMMM")

/**
 * Asistente para un usuario con sesión que va a crear un negocio. Retoma
 * donde quedó: correo sin verificar → código · y según su suscripción
 * "suelta" (sin negocio): sin suscripción → elegir plan · pendiente → pagar ·
 * activa → datos del negocio.
 * "Atrás" abre el paso anterior con `?paso=plan|pago`: cambiar de plan antes de
 * pagar, o ver el comprobante si ya pagó.
 */
export function CreateBusinessPage() {
  const { user, logout } = useAuth()
  const createBusiness = useBusinessStore((s) => s.createBusiness)
  const hasBusinesses = useBusinessStore((s) => s.businesses.length > 0)
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const view = params.get('paso') as BackView | null

  const [load, setLoad] = useState<Load>({ status: 'loading' })
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [choosingCode, setChoosingCode] = useState<Plan['code'] | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    subscriptionsService
      .current()
      .then((sub) => {
        if (cancelled) return
        setSubscription(sub)
        setLoad({ status: 'ready' })
      })
      .catch((err) => !cancelled && setLoad({ status: 'error', message: getErrorMessage(err) }))
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  /** Va a un paso anterior dejando rastro en el historial */
  const goBackTo = (next: BackView) => setParams({ paso: next }, { state: { wizard: true } })
  /** Vuelve al paso actual: deshace la entrada del historial si la creamos nosotros */
  const returnToCurrent = () => {
    if ((location.state as { wizard?: boolean } | null)?.wizard) navigate(-1)
    else setParams({}, { replace: true })
  }

  const choosePlan = async (plan: Plan) => {
    setChoosingCode(plan.code)
    try {
      setSubscription(await subscriptionsService.choose(plan.code))
      if (view === 'plan') returnToCurrent()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setChoosingCode(null)
    }
  }

  const pay = async (payload: PayPayload) => {
    if (!subscription) return
    try {
      setSubscription(await subscriptionsService.pay(subscription.id, payload))
      toast.success('¡Pago aprobado! Ahora cuéntanos de tu negocio.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleCreate = async (payload: CreateBusinessPayload) => {
    setIsCreating(true)
    setCreateError(null)
    try {
      await createBusiness(payload)
      navigate('/app', { replace: true })
    } catch (err) {
      setCreateError(getErrorMessage(err))
      setIsCreating(false)
    }
  }

  // Salida del asistente: al panel si ya tiene negocios; si no, cerrar sesión
  const exit = hasBusinesses ? (
    <p className="mt-8 text-center text-xs text-fg-subtle">
      <Link to="/app" className="underline underline-offset-4 hover:text-fg">
        Salir y volver al panel
      </Link>
    </p>
  ) : (
    <p className="mt-8 text-center text-xs text-fg-subtle">
      ¿No eres tú?{' '}
      <button
        type="button"
        onClick={logout}
        className="cursor-pointer underline underline-offset-4 hover:text-fg"
      >
        Cerrar sesión
      </button>
    </p>
  )

  if (load.status === 'loading') {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }
  if (load.status === 'error') {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-4">
        <Alert message={load.message} />
        <Button variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
          Reintentar
        </Button>
      </div>
    )
  }

  // 0. Verificar el correo (llega un código al crear la cuenta). El backend
  //    tampoco deja pagar ni crear el negocio sin esto.
  if (user && !user.emailVerifiedAt) return <VerifyEmailStep footer={exit} />

  const isPending = subscription?.status === 'PENDING_PAYMENT'

  // 1. Elegir plan (o cambiarlo antes de pagar)
  if (!subscription || (view === 'plan' && isPending)) {
    return (
      <>
        <SignupSteps current="plan" />
        {subscription ? (
          <BackButton onClick={returnToCurrent} label="Atrás al pago" />
        ) : (
          hasBusinesses && <BackButton to="/app" label="Volver al panel" />
        )}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium tracking-tight text-fg">
            {hasBusinesses ? 'Plan de tu nuevo negocio' : 'Elige tu plan'}
          </h1>
          <p className="mt-2 text-fg-muted">Cada negocio tiene su propia suscripción mensual.</p>
        </div>
        <PlanPicker
          onSelect={choosePlan}
          selected={subscription?.plan.code}
          loadingCode={choosingCode}
        />
        {exit}
      </>
    )
  }

  // 2. Pagar
  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl">
        <SignupSteps current="payment" />
        <BackButton onClick={() => goBackTo('plan')} />
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-fg">Activa tu suscripción</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Paga el primer mes para crear tu negocio y publicar tu página de reservas.
          </p>
        </div>
        <CheckoutForm
          plan={subscription.plan}
          onPay={pay}
          onChangePlan={() => goBackTo('plan')}
        />
        {exit}
      </div>
    )
  }

  // 2b. Ya pagó y volvió atrás: comprobante (no se puede pagar dos veces)
  if (view === 'pago') {
    return (
      <div className="mx-auto max-w-[460px]">
        <SignupSteps current="payment" />
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-surface p-8 text-center shadow-xl shadow-black/20">
          <CheckCircle2 className="size-10 text-emerald-400" />
          <div>
            <h1 className="text-xl font-medium text-fg">Pago aprobado</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Tu suscripción ya está activa; solo falta crear el negocio.
            </p>
          </div>
          <dl className="w-full divide-y divide-line rounded-md border border-line text-sm">
            <div className="flex justify-between px-4 py-2.5">
              <dt className="text-fg-subtle">Plan</dt>
              <dd className="text-fg">{subscription.plan.name}</dd>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <dt className="text-fg-subtle">Valor</dt>
              <dd className="text-fg tabular-nums">{formatCOP(subscription.plan.priceMonthly)}/mes</dd>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex justify-between px-4 py-2.5">
                <dt className="text-fg-subtle">Activo hasta</dt>
                <dd className="text-fg">{day(subscription.currentPeriodEnd)}</dd>
              </div>
            )}
          </dl>
          <Button fullWidth onClick={returnToCurrent}>
            Continuar con mi negocio
          </Button>
        </div>
        {exit}
      </div>
    )
  }

  // 3. Datos del negocio (suscripción activa)
  const firstName = user?.name.split(' ')[0]
  return (
    <div className="mx-auto max-w-[560px]">
      <SignupSteps current="business" />
      <div className="rounded-lg border border-line bg-surface p-6 shadow-xl shadow-black/20 sm:p-8">
        <BackButton onClick={() => goBackTo('pago')} />
        <div className="mb-5 flex items-start gap-3 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-sm">
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
          <p className="text-fg-muted">
            Plan <span className="text-fg">{subscription.plan.name}</span> activo
            {subscription.currentPeriodEnd && ` hasta el ${day(subscription.currentPeriodEnd)}`}
            .
          </p>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-fg">
            {hasBusinesses ? 'Nuevo negocio' : `¡Listo, ${firstName}! Ahora tu negocio`}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            Con esto armamos tu página de reservas. Podrás cambiarlo después.
          </p>
        </div>
        <BusinessForm
          onSubmit={handleCreate}
          submitLabel="Crear negocio"
          isLoading={isCreating}
          error={createError}
          renderNameHint={(name) =>
            slugify(name) ? (
              <>
                Tu enlace: <span className="text-fg-muted">agendabarrio.co/b/</span>
                <span className="text-brand-hover">{slugify(name)}</span>
              </>
            ) : null
          }
        />
      </div>
      {exit}
    </div>
  )
}
