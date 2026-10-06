import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { fieldClass, Input } from '@/components/common/Input'
import type { CustomerInput } from '@/types/booking'

interface CustomerFormProps {
  initial: CustomerInput
  onSubmit: (customer: CustomerInput) => void
  isLoading: boolean
  error: string | null
  submitLabel: string
  /** Muestra la casilla para aceptar avisos por WhatsApp */
  showWhatsappOptIn?: boolean
}

/** Celular colombiano: 10 dígitos que empiezan por 3 */
const isValidPhone = (digits: string) => /^3\d{9}$/.test(digits)

export function CustomerForm({
  initial,
  onSubmit,
  isLoading,
  error,
  submitLabel,
  showWhatsappOptIn = false,
}: CustomerFormProps) {
  const [name, setName] = useState(initial.name)
  const [email, setEmail] = useState(initial.email)
  // Se edita sin el +57; se guarda con él
  const [phone, setPhone] = useState(initial.phone.replace(/^\+57/, ''))
  const [phoneError, setPhoneError] = useState<string | null>(null)
  // Marcada por defecto; el cliente puede desmarcarla (queda registrado)
  const [whatsappOptIn, setWhatsappOptIn] = useState(initial.whatsappOptIn ?? true)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (!isValidPhone(digits)) {
      setPhoneError('Escribe un celular de 10 dígitos, por ejemplo 300 123 4567')
      return
    }
    setPhoneError(null)
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: `+57${digits}`,
      ...(showWhatsappOptIn && { whatsappOptIn }),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre completo"
        autoComplete="name"
        placeholder="Tu nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        required
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="booking-phone" className="text-sm text-fg-muted">
          Celular (WhatsApp)
        </label>
        <div className="flex">
          <span className="flex h-10 items-center gap-2 rounded-l-md border border-r-0 border-line bg-surface px-3 text-sm text-fg-muted">
            {/* Bandera de Colombia en CSS: los emoji de bandera no se ven en Windows */}
            <span
              aria-hidden="true"
              className="flex h-3 w-[18px] flex-col overflow-hidden rounded-[2px] ring-1 ring-white/10"
            >
              <span className="h-1/2 bg-[#FCD116]" />
              <span className="h-1/4 bg-[#003893]" />
              <span className="h-1/4 bg-[#CE1126]" />
            </span>
            +57
          </span>
          <input
            id="booking-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="300 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={`h-10 rounded-l-none ${fieldClass}`}
          />
        </div>
        {phoneError && <p className="text-xs text-danger">{phoneError}</p>}
      </div>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        hint="Te enviaremos la confirmación y los recordatorios."
      />
      {showWhatsappOptIn && (
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-fg">
          <input
            type="checkbox"
            checked={whatsappOptIn}
            onChange={(e) => setWhatsappOptIn(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand"
          />
          <span>
            Quiero recibir la confirmación y los avisos de mi cita por WhatsApp
            <span className="block text-xs text-fg-subtle">
              Puedes dejar de recibirlos cuando quieras escribiendo STOP.
            </span>
          </span>
        </label>
      )}
      {error && <Alert message={error} />}
      <Button type="submit" fullWidth isLoading={isLoading} className="mt-1 h-11 text-[15px]">
        {submitLabel}
      </Button>
    </form>
  )
}
