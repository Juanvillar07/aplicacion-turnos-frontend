import { ChevronLeft, ChevronRight, Eye, EyeOff, MessageSquareReply, Star } from 'lucide-react'
import { useState } from 'react'
import { Alert } from '@/components/common/Alert'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Spinner } from '@/components/common/Spinner'
import { Stars } from '@/components/common/StarRating'
import { Textarea } from '@/components/common/Textarea'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/services/api'
import { reviewsService } from '@/services/reviews'
import { toast } from '@/store/toastStore'
import type { PanelReview, PanelReviewPage } from '@/types/review'
import { formatInTz } from '@/utils/date'

const EMPTY: PanelReviewPage = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  summary: { average: null, count: 0, byStars: [], hidden: 0 },
}

function ReviewItem({
  review,
  timezone,
  onSave,
}: {
  review: PanelReview
  timezone: string
  onSave: (payload: { reply?: string | null; hidden?: boolean }) => Promise<boolean>
}) {
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState(review.reply ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const save = async (payload: { reply?: string | null; hidden?: boolean }) => {
    setIsSaving(true)
    const ok = await onSave(payload)
    setIsSaving(false)
    if (ok) setReplying(false)
  }

  return (
    <li className={`flex flex-col gap-2 px-4 py-4 ${review.hidden ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars value={review.rating} size="md" />
        <span className="text-sm font-medium text-fg">{review.customer.name}</span>
        {review.hidden && <Badge tone="muted">Oculta</Badge>}
        <span className="ml-auto text-xs text-fg-subtle">
          {formatInTz(review.createdAt, timezone, "d 'de' MMM yyyy")}
        </span>
      </div>
      <p className="text-xs text-fg-subtle">
        {review.serviceName} con {review.resourceName} ·{' '}
        {formatInTz(review.appointmentStartsAt, timezone, "d 'de' MMM, h:mm aaa")}
      </p>
      {review.comment ? (
        <p className="text-sm whitespace-pre-line text-fg-muted">{review.comment}</p>
      ) : (
        <p className="text-sm text-fg-subtle italic">Sin comentario</p>
      )}

      {replying ? (
        <div className="flex flex-col gap-2">
          <Textarea
            label="Tu respuesta (se verá en tu página)"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={500}
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setReplying(false)} disabled={isSaving}>
              Cancelar
            </Button>
            {review.reply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReply('')
                  void save({ reply: null })
                }}
                disabled={isSaving}
              >
                Borrar respuesta
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => save({ reply })}
              isLoading={isSaving}
              disabled={!reply.trim()}
            >
              Publicar respuesta
            </Button>
          </div>
        </div>
      ) : (
        review.reply && (
          <div className="rounded-md border-l-2 border-brand/50 bg-surface-2/60 px-3 py-2">
            <p className="text-xs font-medium text-fg">Tu respuesta</p>
            <p className="mt-0.5 text-sm whitespace-pre-line text-fg-muted">{review.reply}</p>
          </div>
        )
      )}

      {!replying && (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setReplying(true)}>
            <MessageSquareReply className="size-3.5" /> {review.reply ? 'Editar respuesta' : 'Responder'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => save({ hidden: !review.hidden })}
            disabled={isSaving}
            title={review.hidden ? 'Volver a mostrar en tu página' : 'No mostrar en tu página ni en el promedio'}
          >
            {review.hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {review.hidden ? 'Mostrar' : 'Ocultar'}
          </Button>
        </div>
      )}
    </li>
  )
}

/** Reseñas verificadas del negocio: responder u ocultar (solo administradores). */
export function ReviewsPage() {
  const { business } = useActiveBusiness()
  const [rating, setRating] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [updated, setUpdated] = useState<{ key: string; data: PanelReviewPage } | null>(null)
  const key = `${business.id}|${rating}|${page}`
  const loaded = useAsync(key, () => reviewsService.list(business.id, { rating, page }), EMPTY)
  // Tras responder u ocultar, el servidor devuelve la primera página sin filtro
  const data = updated?.key === key ? updated.data : loaded.data
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize))
  const { summary } = data

  const save = async (reviewId: string, payload: { reply?: string | null; hidden?: boolean }) => {
    try {
      await reviewsService.update(business.id, reviewId, payload)
      // Recarga la vista actual (filtro y página)
      setUpdated({ key, data: await reviewsService.list(business.id, { rating, page }) })
      toast.success(
        payload.hidden === true
          ? 'Reseña oculta'
          : payload.hidden === false
            ? 'Reseña visible de nuevo'
            : payload.reply
              ? 'Respuesta publicada'
              : 'Respuesta borrada',
      )
      return true
    } catch (err) {
      toast.error(getErrorMessage(err))
      return false
    }
  }

  return (
    <>
      <PageHeader
        title="Reseñas"
        description="Lo que opinan tus clientes después de su cita. Se publican en tu página de reservas."
      />

      {loaded.error && <Alert message={loaded.error} />}

      {loaded.isLoading && !updated ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : summary.count === 0 && summary.hidden === 0 ? (
        <EmptyState
          icon={Star}
          title="Aún no tienes reseñas"
          description="Cuando marques una cita como Completada, le pediremos al cliente que califique su visita por correo y WhatsApp."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-6 rounded-lg border border-line bg-surface p-5">
            <div>
              <p className="text-3xl font-semibold text-fg tabular-nums">
                {summary.average?.toFixed(1) ?? '—'}
              </p>
              <Stars value={summary.average ?? 0} size="md" />
              <p className="mt-1 text-xs text-fg-subtle">
                {summary.count} publicada{summary.count === 1 ? '' : 's'}
                {summary.hidden > 0 && ` · ${summary.hidden} oculta${summary.hidden === 1 ? '' : 's'}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estrellas">
              {[null, 5, 4, 3, 2, 1].map((stars) => (
                <button
                  key={stars ?? 'all'}
                  type="button"
                  aria-pressed={rating === stars}
                  onClick={() => {
                    setRating(stars)
                    setPage(1)
                  }}
                  className={`flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors ${
                    rating === stars
                      ? 'border-brand bg-brand-soft text-fg'
                      : 'border-line text-fg-muted hover:border-line-strong'
                  }`}
                >
                  {stars === null ? (
                    'Todas'
                  ) : (
                    <>
                      {stars} <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-fg-subtle">
                        {summary.byStars.find((b) => b.stars === stars)?.count ?? 0}
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {data.items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line-strong px-4 py-8 text-center text-sm text-fg-subtle">
              No hay reseñas con ese filtro.
            </p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {data.items.map((review) => (
                <ReviewItem
                  key={`${review.id}|${review.reply}|${review.hidden}`}
                  review={review}
                  timezone={business.timezone}
                  onSave={(payload) => save(review.id, payload)}
                />
              ))}
            </ul>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-end gap-2 text-sm text-fg-muted">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                aria-label="Página anterior"
                className="cursor-pointer rounded-md border border-line p-1.5 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="tabular-nums">
                {page} / {pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pages}
                aria-label="Página siguiente"
                className="cursor-pointer rounded-md border border-line p-1.5 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
