import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import type { RegisterPayload } from '@/types/auth'

interface RegisterFormProps {
  onSubmit: (payload: RegisterPayload) => void
  isLoading: boolean
  error: string | null
  submitLabel?: string
}

export function RegisterForm({
  onSubmit,
  isLoading,
  error,
  submitLabel = 'Crear cuenta',
}: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ name, email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Nombre"
        autoComplete="name"
        placeholder="Tu nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <Alert message={error} />}
      <Button type="submit" fullWidth isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  )
}
