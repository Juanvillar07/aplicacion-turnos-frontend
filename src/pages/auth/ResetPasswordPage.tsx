import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'
import { toast } from '@/store/toastStore'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      toast.success(await authService.resetPassword(token, password))
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-8">
        <Alert message="El enlace está incompleto. Abre de nuevo el enlace del correo o pide uno nuevo." />
        <Link to="/forgot-password" className="text-center text-sm text-fg underline underline-offset-4">
          Pedir un enlace nuevo
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-8 shadow-xl shadow-black/20">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-fg">Nueva contraseña</h1>
        <p className="mt-1 text-sm text-fg-muted">Elige una contraseña de al menos 8 caracteres.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />
        <Input
          label="Repite la contraseña"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <Alert message={error} />}
        <Button type="submit" fullWidth isLoading={isLoading}>
          Guardar contraseña
        </Button>
      </form>
      {error && (
        <p className="mt-4 text-center text-sm">
          <Link to="/forgot-password" className="text-fg-muted underline underline-offset-4 hover:text-fg">
            Pedir un enlace nuevo
          </Link>
        </p>
      )}
    </div>
  )
}
