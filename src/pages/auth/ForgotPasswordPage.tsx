import { MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentMessage, setSentMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      setSentMessage(await authService.forgotPassword(email))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-8 shadow-xl shadow-black/20">
      {sentMessage ? (
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-hover">
            <MailCheck className="size-6" />
          </span>
          <h1 className="text-xl font-medium text-fg">Revisa tu correo</h1>
          <p className="mt-2 text-sm text-fg-muted">{sentMessage}</p>
          <p className="mt-2 text-xs text-fg-subtle">
            El enlace vence en 1 hora. Si no lo ves, revisa la carpeta de spam.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-fg">Recuperar contraseña</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Te enviaremos un enlace para crear una nueva.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            {error && <Alert message={error} />}
            <Button type="submit" fullWidth isLoading={isLoading}>
              Enviar enlace
            </Button>
          </form>
        </>
      )}
      <p className="mt-6 text-center text-sm text-fg-muted">
        <Link to="/login" className="text-fg underline underline-offset-4 hover:text-brand-hover">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  )
}
