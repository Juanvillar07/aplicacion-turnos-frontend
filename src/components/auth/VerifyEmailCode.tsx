import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'
import { toast } from '@/store/toastStore'
import type { User } from '@/types/auth'

const LENGTH = 6
const RESEND_SECONDS = 60

interface VerifyEmailCodeProps {
  email: string
  onVerified: (user: User) => void
  /** Segundos antes de poder reenviar (el código se acaba de enviar) */
  initialCooldown?: number
}

/**
 * Seis casillas para el código que llegó al correo: avanzan solas, aceptan
 * pegar el código completo y lo envían al llenarse. Incluye "Reenviar código"
 * con cuenta regresiva.
 */
export function VerifyEmailCode({
  email,
  onVerified,
  initialCooldown = RESEND_SECONDS,
}: VerifyEmailCodeProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(LENGTH).fill(''))
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(initialCooldown)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  // Cuenta regresiva para reenviar
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const focus = (index: number) => inputs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus()

  const submit = async (code: string) => {
    setIsVerifying(true)
    try {
      const user = await authService.verifyEmail(code)
      onVerified(user)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setDigits(Array(LENGTH).fill(''))
      focus(0)
    } finally {
      setIsVerifying(false)
    }
  }

  /** Escribe dígitos desde `index` (uno tecleado o varios pegados) */
  const fill = (index: number, value: string) => {
    const incoming = value.replace(/\D/g, '')
    if (!incoming) return
    const next = [...digits]
    for (let i = 0; i < incoming.length && index + i < LENGTH; i++) next[index + i] = incoming[i]
    setDigits(next)
    const filled = next.join('')
    if (filled.length === LENGTH && !next.includes('')) void submit(filled)
    else focus(index + incoming.length)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index]) {
      event.preventDefault()
      const next = [...digits]
      next[index - 1] = ''
      setDigits(next)
      focus(index - 1)
    } else if (event.key === 'ArrowLeft') focus(index - 1)
    else if (event.key === 'ArrowRight') focus(index + 1)
  }

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    fill(index, event.clipboardData.getData('text'))
  }

  const resend = async () => {
    setIsResending(true)
    try {
      const { message } = await authService.resendVerification()
      toast.success(message)
      setCooldown(RESEND_SECONDS)
      setDigits(Array(LENGTH).fill(''))
      focus(0)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-center text-sm text-fg-muted">
        Escribe el código de 6 dígitos que enviamos a{' '}
        <span className="font-medium text-fg">{email}</span>. Vence en 10 minutos.
      </p>

      <div className="flex gap-2" role="group" aria-label="Código de verificación">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el
            }}
            value={digit}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              if (!value) {
                const next = [...digits]
                next[i] = ''
                setDigits(next)
              } else if (value.length > 2) {
                // Autocompletado del código completo (p. ej. desde el teclado del celular)
                fill(i, value)
              } else {
                // Lo último tecleado reemplaza al dígito que había
                fill(i, value.slice(-1))
              }
            }}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={LENGTH}
            autoFocus={i === 0}
            disabled={isVerifying}
            aria-label={`Dígito ${i + 1}`}
            className="h-12 w-10 rounded-md border border-line bg-surface-2 text-center text-xl font-medium text-fg tabular-nums transition-colors focus:border-brand focus:ring-2 focus:ring-brand-soft focus:outline-none disabled:opacity-60 sm:w-12"
          />
        ))}
      </div>

      <div className="flex h-8 items-center">
        {isVerifying ? (
          <span className="flex items-center gap-2 text-sm text-fg-muted">
            <Spinner className="size-4" /> Verificando…
          </span>
        ) : (
          <Button variant="ghost" size="sm" onClick={resend} disabled={cooldown > 0} isLoading={isResending}>
            {cooldown > 0 ? `Reenviar código en ${cooldown} s` : 'Reenviar código'}
          </Button>
        )}
      </div>
      <p className="text-center text-xs text-fg-subtle">
        ¿No lo ves? Revisa la carpeta de spam o correo no deseado.
      </p>
    </div>
  )
}
