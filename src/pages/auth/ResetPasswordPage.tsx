import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { NewPasswordFields } from '@/components/auth/NewPasswordFields'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'
import { toast } from '@/store/toastStore'
import { passwordProblem } from '@/utils/password'

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
    const problem = passwordProblem(password, confirm)
    if (problem) {
      setError(problem)
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
        <p className="mt-1 text-sm text-fg-muted">Elige una contraseña segura y escríbela dos veces.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <NewPasswordFields
          password={password}
          confirm={confirm}
          onPasswordChange={(value) => {
            setPassword(value)
            setError(null)
          }}
          onConfirmChange={(value) => {
            setConfirm(value)
            setError(null)
          }}
          passwordLabel="Nueva contraseña"
          autoFocus
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
