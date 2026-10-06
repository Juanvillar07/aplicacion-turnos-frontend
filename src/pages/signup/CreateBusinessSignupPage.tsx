import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { BackButton } from '@/components/subscription/BackButton'
import { PlanPicker } from '@/components/subscription/PlanPicker'
import { SignupSteps } from '@/components/subscription/SignupSteps'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/services/api'
import { subscriptionsService } from '@/services/subscriptions'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import type { RegisterPayload } from '@/types/auth'
import type { PlanCode } from '@/types/subscription'
import { formatCOP } from '@/utils/format'

const PLAN_CODES: PlanCode[] = ['BASIC', 'PRO', 'PREMIUM']

/**
 * "Crear tu negocio" (sin sesión): 1) elegir plan y 2) crear la cuenta. Luego
 * sigue en /onboarding con el pago y los datos del negocio. El plan elegido
 * va en la URL (?plan=PRO) para que "atrás" funcione.
 */
export function CreateBusinessSignupPage() {
  const [params, setParams] = useSearchParams()
  const planParam = params.get('plan') as PlanCode | null
  const planCode = planParam && PLAN_CODES.includes(planParam) ? planParam : null

  const register = useAuthStore((s) => s.register)
  const isLoading = useAuthStore((s) => s.isLoading)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)
  const isAuthenticated = useAuthStore((s) => Boolean(s.token))
  const navigate = useNavigate()
  const [isChoosing, setIsChoosing] = useState(false)
  /** Se está creando la cuenta aquí: no redirigir al obtener la sesión */
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => clearError, [clearError])

  const { data: plans } = useAsync('plans', () => subscriptionsService.plans(), [])
  const plan = plans.find((p) => p.code === planCode)

  const handleRegister = async (payload: RegisterPayload) => {
    if (!planCode) return
    setSubmitted(true)
    if (!(await register(payload))) {
      setSubmitted(false)
      return
    }
    // La cuenta ya existe: se guarda el plan y se sigue con el pago
    setIsChoosing(true)
    try {
      await subscriptionsService.choose(planCode)
    } catch (err) {
      // Si falla, en /onboarding podrá elegirlo de nuevo
      toast.error(getErrorMessage(err))
    }
    navigate('/onboarding', { replace: true })
  }

  // Con sesión iniciada, el resto del asistente vive en /onboarding
  if (isAuthenticated && !submitted) return <Navigate to="/onboarding" replace />

  if (!planCode) {
    return (
      <>
        <SignupSteps current="plan" />
        <BackButton to="/login" label="Volver a iniciar sesión" />
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium tracking-tight text-fg">Crea tu negocio</h1>
          <p className="mt-2 text-fg-muted">
            Elige tu plan. Tu página de reservas queda lista en minutos.
          </p>
        </div>
        <PlanPicker onSelect={(p) => setParams({ plan: p.code })} />
        <p className="mt-8 text-center text-sm text-fg-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-fg underline underline-offset-4 hover:text-brand-hover">
            Inicia sesión
          </Link>
        </p>
      </>
    )
  }

  return (
    <div className="mx-auto max-w-[420px]">
      <SignupSteps current="account" />
      <div className="rounded-lg border border-line bg-surface p-8 shadow-xl shadow-black/20">
        {/* Quita ?plan= y vuelve a los planes (el botón atrás del navegador hace lo mismo) */}
        <BackButton onClick={() => setParams({})} />
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-fg">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {plan ? (
              <>
                Plan <span className="text-fg">{plan.name}</span> ·{' '}
                {formatCOP(plan.priceMonthly)}/mes. Con esta cuenta entrarás a tu panel.
              </>
            ) : (
              'Con esta cuenta entrarás a tu panel.'
            )}
          </p>
        </div>
        <RegisterForm
          onSubmit={handleRegister}
          isLoading={isLoading || isChoosing}
          error={error}
          submitLabel="Continuar al pago"
        />
        <p className="mt-6 text-center text-sm text-fg-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-fg underline underline-offset-4 hover:text-brand-hover">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
