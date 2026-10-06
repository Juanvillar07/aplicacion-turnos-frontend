import { CreditCard, FlaskConical, Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/common/Button'
import { fieldClass, Input } from '@/components/common/Input'
import { CARD_BRAND_LABELS, TEST_CARDS } from '@/constants/plans'
import type { PayPayload, Plan } from '@/types/subscription'
import {
  cardDigits,
  detectBrand,
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidExpiry,
} from '@/utils/card'
import { formatCOP } from '@/utils/format'

interface CheckoutFormProps {
  plan: Plan
  onPay: (payload: PayPayload) => Promise<void>
  onChangePlan: () => void
}

type Errors = Partial<Record<'holder' | 'number' | 'expiry' | 'cvc', string>>

/**
 * Pago de la suscripción con tarjeta (simulado: no se cobra nada). Los datos
 * de la tarjeta solo se validan aquí; al backend llegan la marca y los
 * últimos 4 dígitos.
 */
export function CheckoutForm({ plan, onPay, onChangePlan }: CheckoutFormProps) {
  const [holder, setHolder] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [isPaying, setIsPaying] = useState(false)

  const digits = cardDigits(number)
  const brand = detectBrand(digits)
  const cvcLength = brand === 'AMEX' ? 4 : 3

  const validate = (): Errors => {
    const next: Errors = {}
    if (holder.trim().length < 3) next.holder = 'Escribe el nombre como aparece en la tarjeta'
    if (!isValidCardNumber(digits)) next.number = 'Revisa el número de la tarjeta'
    if (!isValidExpiry(expiry)) next.expiry = 'Fecha no válida o vencida'
    if (cardDigits(cvc).length !== cvcLength) next.cvc = `${cvcLength} dígitos`
    return next
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setIsPaying(true)
    try {
      await onPay({ cardBrand: brand, cardLast4: digits.slice(-4), holderName: holder.trim() })
    } finally {
      setIsPaying(false)
    }
  }

  const error = (key: keyof Errors) =>
    errors[key] && <p className="text-xs text-danger">{errors[key]}</p>

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_260px]">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6"
      >
        <div className="flex items-center gap-2 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          <FlaskConical className="size-4 shrink-0" />
          Pago de prueba: no se hará ningún cobro.
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            label="Nombre del titular"
            autoComplete="cc-name"
            placeholder="Como aparece en la tarjeta"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
          />
          {error('holder')}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="card-number" className="text-sm text-fg-muted">
            Número de la tarjeta
          </label>
          <div className="relative">
            <input
              id="card-number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={number}
              onChange={(e) => setNumber(formatCardNumber(e.target.value))}
              className={`h-10 pr-28 tabular-nums ${fieldClass}`}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5 text-xs text-fg-subtle">
              <CreditCard className="size-4" />
              {digits.length > 0 && CARD_BRAND_LABELS[brand]}
            </span>
          </div>
          {error('number')}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="card-expiry" className="text-sm text-fg-muted">
              Vencimiento
            </label>
            <input
              id="card-expiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className={`h-10 tabular-nums ${fieldClass}`}
            />
            {error('expiry')}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="card-cvc" className="text-sm text-fg-muted">
              CVC
            </label>
            <input
              id="card-cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder={brand === 'AMEX' ? '1234' : '123'}
              value={cvc}
              onChange={(e) => setCvc(cardDigits(e.target.value).slice(0, cvcLength))}
              className={`h-10 tabular-nums ${fieldClass}`}
            />
            {error('cvc')}
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={isPaying} className="mt-2 h-11 text-[15px]">
          <Lock className="size-4" /> Pagar {formatCOP(plan.priceMonthly)}
        </Button>

        <div className="rounded-md bg-surface-2/60 px-3 py-2.5 text-xs text-fg-subtle">
          <p className="mb-1 font-medium text-fg-muted">Tarjetas de prueba</p>
          <ul className="space-y-0.5">
            {TEST_CARDS.map((card) => (
              <li key={card.number}>
                <button
                  type="button"
                  onClick={() => setNumber(card.number)}
                  className="cursor-pointer tabular-nums underline-offset-2 hover:text-fg hover:underline"
                >
                  {card.number}
                </button>{' '}
                · {card.result}
              </li>
            ))}
            <li>Cualquier fecha futura y cualquier CVC.</li>
          </ul>
        </div>
      </form>

      <aside className="flex h-fit flex-col gap-3 rounded-xl border border-line bg-surface p-5">
        <p className="text-xs font-medium text-fg-subtle">Resumen</p>
        <div>
          <p className="font-medium text-fg">Plan {plan.name}</p>
          <p className="text-sm text-fg-muted">Suscripción mensual</p>
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-sm text-fg-muted">Total hoy</span>
          <span className="text-lg font-medium text-fg tabular-nums">
            {formatCOP(plan.priceMonthly)}
          </span>
        </div>
        <p className="text-xs text-fg-subtle">Se renueva cada mes. Puedes cancelar cuando quieras.</p>
        <button
          type="button"
          onClick={onChangePlan}
          className="cursor-pointer self-start text-sm text-fg-muted underline underline-offset-4 hover:text-fg"
        >
          Cambiar de plan
        </button>
      </aside>
    </div>
  )
}
