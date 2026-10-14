import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Stars } from '@/components/common/StarRating'
import { getErrorMessage } from '@/services/api'
import { reviewsService } from '@/services/reviews'
import { toast } from '@/store/toastStore'
import type { PublicReview, PublicReviewPage, RatingSummary } from '@/types/review'
import { formatInTz } from '@/utils/date'

/** Promedio, reparto por estrellas y reseñas publicadas, con "Ver más". */
export function ReviewsSection({
  slug,
  businessName,
  timezone,
  rating,
  firstPage,
}: {
  slug: string
  businessName: string
  timezone: string
  rating: RatingSummary
  firstPage: PublicReviewPage
}) {
  const [items, setItems] = useState<PublicReview[]>(firstPage.items)
  const [page, setPage] = useState(firstPage.page)
  const [isLoading, setIsLoading] = useState(false)

  if (rating.count === 0) return null
  const hasMore = items.length < firstPage.total

  const loadMore = async () => {
    setIsLoading(true)
    try {
      const next = await reviewsService.publicPage(slug, page + 1)
      setItems((prev) => [...prev, ...next.items])
      setPage(next.page)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-medium text-fg">Lo que dicen los clientes</h2>

      <div className="flex items-center gap-5 rounded-lg border border-line bg-surface p-4">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-semibold text-fg tabular-nums">{rating.average?.toFixed(1)}</span>
          <Stars value={rating.average ?? 0} />
          <span className="mt-1 text-xs text-fg-subtle">
            {rating.count} reseña{rating.count === 1 ? '' : 's'}
          </span>
        </div>
        <ul className="flex flex-1 flex-col gap-1">
          {rating.byStars.map((row) => (
            <li key={row.stars} className="flex items-center gap-2 text-xs text-fg-subtle">
              <span className="w-2 tabular-nums">{row.stars}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full bg-amber-400"
                  style={{ width: `${(row.count / rating.count) * 100}%` }}
                />
              </span>
              <span className="w-5 text-right tabular-nums">{row.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex flex-col divide-y divide-line">
        {items.map((review) => (
          <li key={review.id} className="flex flex-col gap-1.5 py-4 first:pt-0">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-fg">{review.author}</span>
              <span className="text-xs text-fg-subtle">
                {formatInTz(review.createdAt, timezone, "d 'de' MMM yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Stars value={review.rating} />
              <span className="text-xs text-fg-subtle">{review.serviceName}</span>
            </div>
            {review.comment && <p className="text-sm whitespace-pre-line text-fg-muted">{review.comment}</p>}
            {review.reply && (
              <div className="mt-1 rounded-md border-l-2 border-brand/50 bg-surface px-3 py-2">
                <p className="text-xs font-medium text-fg">Respuesta de {businessName}</p>
                <p className="mt-0.5 text-sm whitespace-pre-line text-fg-muted">{review.reply}</p>
              </div>
            )}
          </li>
        ))}
      </ul>

      {hasMore && (
        <Button variant="secondary" onClick={loadMore} isLoading={isLoading}>
          Ver más reseñas
        </Button>
      )}
    </section>
  )
}
