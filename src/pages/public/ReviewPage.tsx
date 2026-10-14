import { CheckCircle2, Clock3 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { FullPageSpinner } from '@/components/common/Spinner'
import { StarInput, Stars } from '@/components/common/StarRating'
import { Textarea } from '@/components/common/Textarea'
import { useAsync } from '@/hooks/useAsync'
import { PublicLayout } from '@/layouts/PublicLayout'
import { getErrorMessage } from '@/services/api'
import { reviewsService } from '@/services/reviews'
import { toast } from '@/store/toastStore'
import type { ReviewInvite } from '@/types/review'
import { capitalize, formatInTz } from '@/utils/date'
import { NotFoundBusinessPage } from './NotFoundBusinessPage'

/** Enlace que recibe el cliente después de su cita: calificar de 1 a 5 estrellas. */
export function ReviewPage() {
  const { token = '' } = useParams()
  const loaded = useAsync<ReviewInvite | null>(`review|${token}`, () => reviewsService.getInvite(token), null)
  const [submitted, setSubmitted] = useState<ReviewInvite | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSending, setIsSending] = useState(false)

  const invite = submitted ?? loaded.data

  if (loaded.isLoading) return <FullPageSpinner />
  if (!invite) {
    return (
      <NotFoundBusinessPage
        title="Enlace no válido"
        description="Revisa que hayas abierto el enlace completo del correo o del mensaje."
      />
    )
  }

  const { business } = invite
  const when = capitalize(formatInTz(invite.startsAt, business.timezone, "EEEE d 'de' MMMM"))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!rating) {
      toast.error('Elige de 1 a 5 estrellas')
      return
    }
    setIsSending(true)
    try {
      setSubmitted(await reviewsService.submit(token, rating, comment))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  const layoutBusiness = {
    name: business.name,
    category: business.category,
    city: null,
    address: null,
    logoUrl: business.logoUrl,
  }

  return (
    <PublicLayout business={layoutBusiness}>
      <div className="rounded-lg border border-line bg-surface p-6">
        {invite.review ? (
          // Ya calificó (ahora o antes)
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="size-10 text-emerald-400" />
            <h2 className="text-xl font-semibold text-fg">¡Gracias por tu opinión!</h2>
            <Stars value={invite.review.rating} size="lg" />
            {invite.review.comment && (
              <p className="text-sm whitespace-pre-line text-fg-muted">“{invite.review.comment}”</p>
            )}
            <Link
              to={`/b/${business.slug}`}
              className="mt-2 text-sm text-brand-hover underline-offset-4 hover:underline"
            >
              Reservar otra cita en {business.name}
            </Link>
          </div>
        ) : invite.expired ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Clock3 className="size-10 text-fg-subtle" />
            <h2 className="text-lg font-medium text-fg">Este enlace ya venció</h2>
            <p className="text-sm text-fg-muted">
              Los enlaces para calificar duran 30 días después de la cita.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-fg">
                ¿Cómo te fue, {invite.customerName}?
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                {invite.service} con {invite.resource} · {when}
              </p>
            </div>
            <StarInput value={rating} onChange={setRating} disabled={isSending} />
            <Textarea
              label="Cuéntanos más (opcional)"
              placeholder="¿Qué te gustó? ¿Qué podríamos mejorar?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="-mt-3 text-right text-xs text-fg-subtle tabular-nums">
              {comment.length}/500
            </p>
            <Button type="submit" fullWidth isLoading={isSending} disabled={!rating}>
              Enviar calificación
            </Button>
            <p className="text-center text-xs text-fg-subtle">
              Tu calificación y tu nombre (sin apellido completo) se verán en la página de{' '}
              {business.name}.
            </p>
          </form>
        )}
      </div>
      {loaded.error && <Alert message={loaded.error} />}
    </PublicLayout>
  )
}
