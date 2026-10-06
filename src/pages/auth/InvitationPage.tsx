import { MailX, UsersRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { ROLE_LABELS } from '@/constants/roles'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/services/api'
import { teamService } from '@/services/team'
import { useAuthStore } from '@/store/authStore'
import { useBusinessStore } from '@/store/businessStore'
import { toast } from '@/store/toastStore'
import type { InvitationInfo } from '@/types/team'

const STATUS_MESSAGES = {
  ACCEPTED: 'Esta invitación ya fue aceptada.',
  REVOKED: 'Esta invitación fue cancelada por el negocio.',
  EXPIRED: 'Esta invitación venció. Pide al negocio que te envíe una nueva.',
} as const

/** Destino del enlace de invitación al equipo: /invitations/:token */
export function InvitationPage() {
  const { token = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const setSession = useAuthStore((s) => s.setSession)
  const { fetchMyBusinesses, setActive } = useBusinessStore()
  const { data: info, isLoading, error } = useAsync<InvitationInfo | null>(
    token,
    () => teamService.getInvitation(token),
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  /** Abre el panel ya dentro del negocio al que se unió */
  const enterBusiness = async (businessId: string) => {
    await fetchMyBusinesses()
    setActive(businessId)
    toast.success(`¡Bienvenido a ${info?.business.name}!`)
    navigate('/app', { replace: true })
  }

  const accept = async () => {
    setIsSubmitting(true)
    try {
      const { businessId } = await teamService.acceptInvitation(token)
      await enterBusiness(businessId)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setIsSubmitting(false)
    }
  }

  const register = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const { accessToken, user: created, businessId } = await teamService.registerFromInvitation(
        token,
        name,
        password,
      )
      setSession(accessToken, created)
      await enterBusiness(businessId)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setIsSubmitting(false)
    }
  }

  const card = 'rounded-lg border border-line bg-surface p-8 shadow-xl shadow-black/20'

  if (isLoading) {
    return (
      <div className={`${card} flex justify-center`}>
        <Spinner />
      </div>
    )
  }

  if (error || !info || info.status !== 'PENDING') {
    return (
      <div className={`${card} flex flex-col items-center text-center`}>
        <MailX className="size-10 text-fg-subtle" />
        <h1 className="mt-4 text-xl font-medium text-fg">Invitación no disponible</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {info && info.status !== 'PENDING'
            ? STATUS_MESSAGES[info.status]
            : (error ?? 'El enlace no es válido.')}
        </p>
        <Link
          to={isAuthenticated ? '/app' : '/login'}
          className="mt-6 text-sm text-fg underline underline-offset-4 hover:text-brand-hover"
        >
          {isAuthenticated ? 'Ir a mi panel' : 'Iniciar sesión'}
        </Link>
      </div>
    )
  }

  const emailMatches = user?.email.toLowerCase() === info.email

  return (
    <div className={card}>
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-hover">
          <UsersRound className="size-6" />
        </span>
        <h1 className="text-xl font-medium text-fg">Únete a {info.business.name}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {info.invitedBy} te invitó como{' '}
          <span className="font-medium text-fg">{ROLE_LABELS[info.role].toLowerCase()}</span>.
        </p>
      </div>

      {isAuthenticated && emailMatches && (
        <Button fullWidth onClick={accept} isLoading={isSubmitting}>
          Aceptar invitación
        </Button>
      )}

      {isAuthenticated && !emailMatches && (
        <div className="flex flex-col gap-4">
          <Alert
            message={`Esta invitación es para ${info.email}, pero iniciaste sesión como ${user?.email}.`}
          />
          <Button variant="secondary" fullWidth onClick={logout}>
            Cerrar sesión y continuar
          </Button>
        </div>
      )}

      {!isAuthenticated && info.hasAccount && (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-fg-muted">
            Ya tienes una cuenta con <span className="text-fg">{info.email}</span>. Inicia sesión
            para aceptar.
          </p>
          <Link
            to="/login"
            state={{ from: location }}
            className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Iniciar sesión
          </Link>
        </div>
      )}

      {!isAuthenticated && !info.hasAccount && (
        <form onSubmit={register} className="flex flex-col gap-5">
          <Input label="Email" value={info.email} disabled />
          <Input
            label="Tu nombre"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            autoFocus
          />
          <Input
            label="Crea una contraseña"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            hint="Mínimo 8 caracteres."
          />
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Crear cuenta y unirme
          </Button>
        </form>
      )}
    </div>
  )
}
