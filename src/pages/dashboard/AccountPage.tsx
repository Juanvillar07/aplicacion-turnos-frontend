import { CheckCircle2, MailWarning } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { NewPasswordFields } from '@/components/auth/NewPasswordFields'
import { VerifyEmailModal } from '@/components/auth/VerifyEmailModal'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { PageHeader } from '@/components/common/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { passwordProblem } from '@/utils/password'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-6 border-b border-line py-8 first:pt-0 last:border-0 md:grid-cols-[220px_1fr]">
      <div>
        <h2 className="text-sm font-medium text-fg">{title}</h2>
        <p className="mt-1 text-sm text-fg-muted">{description}</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-5">{children}</div>
    </section>
  )
}

function ProfileForm() {
  const { user } = useAuth()
  const setUser = useAuthStore((s) => s.setUser)
  const [name, setName] = useState(user?.name ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      setUser(await authService.updateProfile(name))
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        required
      />
      <Input label="Email" value={user?.email ?? ''} disabled hint="El email no se puede cambiar por ahora." />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving} disabled={name.trim() === user?.name}>
          Guardar
        </Button>
      </div>
    </form>
  )
}

function PasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const problem = passwordProblem(next, confirm)
    if (problem) {
      setError(problem)
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      await authService.changePassword(current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      toast.success('Contraseña actualizada')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Contraseña actual"
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        required
      />
      <NewPasswordFields
        password={next}
        confirm={confirm}
        onPasswordChange={(value) => {
          setNext(value)
          setError(null)
        }}
        onConfirmChange={(value) => {
          setConfirm(value)
          setError(null)
        }}
        passwordLabel="Nueva contraseña"
        confirmLabel="Repite la nueva"
        layout="grid"
      />
      {error && <Alert message={error} />}
      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving}>
          Cambiar contraseña
        </Button>
      </div>
    </form>
  )
}

function EmailStatus() {
  const { user } = useAuth()
  const [verifying, setVerifying] = useState(false)

  if (user?.emailVerifiedAt) {
    return (
      <p className="flex items-center gap-2 text-sm text-fg">
        <CheckCircle2 className="size-4 text-emerald-400" /> {user.email} está verificado.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm text-fg">
        <MailWarning className="size-4 text-amber-400" /> {user?.email} aún no está verificado.
      </p>
      <Button variant="secondary" size="sm" onClick={() => setVerifying(true)}>
        Verificar ahora
      </Button>
      <VerifyEmailModal open={verifying} onClose={() => setVerifying(false)} />
    </div>
  )
}

export function AccountPage() {
  return (
    <>
      <PageHeader title="Mi cuenta" description="Tus datos personales y de acceso." />
      <Section title="Perfil" description="Cómo te ven tu equipo y tus clientes.">
        <ProfileForm />
      </Section>
      <Section title="Correo" description="Lo usamos para avisarte de reservas y recuperar tu cuenta.">
        <EmailStatus />
      </Section>
      <Section title="Contraseña" description="Usa al menos 8 caracteres.">
        <PasswordForm />
      </Section>
    </>
  )
}
