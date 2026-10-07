import { Check } from 'lucide-react'

export type SignupStep = 'plan' | 'account' | 'verify' | 'payment' | 'business'

const STEPS: { id: SignupStep; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'account', label: 'Cuenta' },
  { id: 'verify', label: 'Verificación' },
  { id: 'payment', label: 'Pago' },
  { id: 'business', label: 'Negocio' },
]

/** Indicador "1 Plan · 2 Cuenta · 3 Verificación · 4 Pago · 5 Negocio" del asistente. */
export function SignupSteps({ current }: { current: SignupStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current)
  return (
    // Centrado sobre el centro del contenedor aunque sea más ancho que él
    // (p. ej. la tarjeta angosta del paso Cuenta)
    <ol
      className="relative left-1/2 mb-8 flex w-max -translate-x-1/2 items-center gap-2 sm:gap-3"
      aria-label="Pasos"
    >
      {STEPS.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            <span
              aria-current={active ? 'step' : undefined}
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                done
                  ? 'border-brand bg-brand text-white'
                  : active
                    ? 'border-brand text-brand-hover'
                    : 'border-line-strong text-fg-subtle'
              }`}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            {/* En móvil solo se lee el nombre del paso actual */}
            <span
              className={`text-sm ${active ? 'text-fg' : 'hidden text-fg-subtle sm:inline'}`}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`h-px w-4 sm:w-8 ${done ? 'bg-brand' : 'bg-line'}`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
