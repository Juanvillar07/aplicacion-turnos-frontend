import { Check } from 'lucide-react'

export type SignupStep = 'plan' | 'account' | 'payment' | 'business'

const STEPS: { id: SignupStep; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'account', label: 'Cuenta' },
  { id: 'payment', label: 'Pago' },
  { id: 'business', label: 'Negocio' },
]

/** Indicador "1 Plan · 2 Cuenta · 3 Pago · 4 Negocio" del asistente. */
export function SignupSteps({ current }: { current: SignupStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current)
  return (
    <ol className="mx-auto mb-8 flex max-w-md items-center justify-between gap-2" aria-label="Pasos">
      {STEPS.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2 last:flex-none">
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
            <span className={`text-sm ${active ? 'text-fg' : 'text-fg-subtle'}`}>{step.label}</span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`mx-1 hidden h-px flex-1 sm:block ${done ? 'bg-brand' : 'bg-line'}`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
