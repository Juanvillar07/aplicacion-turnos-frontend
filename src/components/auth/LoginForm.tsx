import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import type { LoginPayload } from '@/types/auth'

interface LoginFormProps {
  onSubmit: (payload: LoginPayload) => void
  isLoading: boolean
  error: string | null
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Link
        to="/forgot-password"
        className="-mt-2 self-end text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </Link>
      {error && <Alert message={error} />}
      <Button type="submit" fullWidth isLoading={isLoading}>
        Iniciar sesión
      </Button>
    </form>
  )
}
