import { MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '@/components/common/Logo'
import { Stars } from '@/components/common/StarRating'
import { CATEGORIES } from '@/constants/business'
import type { BusinessCategory } from '@/types/business'

interface PublicLayoutProps {
  business?: {
    name: string
    category: BusinessCategory
    city: string | null
    address: string | null
    logoUrl?: string | null
    rating?: { average: number | null; count: number }
  }
  children: ReactNode
}

/** Marco de las páginas que ven los clientes finales (sin sesión). */
export function PublicLayout({ business, children }: PublicLayoutProps) {
  const Icon = business ? CATEGORIES[business.category].icon : null
  const location = [business?.address, business?.city].filter(Boolean).join(', ')

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,var(--color-brand-soft),transparent_70%)]"
      />

      <header className="relative mx-auto w-full max-w-xl px-4 pt-8 pb-6">
        {business && Icon && (
          <div className="flex items-center gap-3.5">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={`Logo de ${business.name}`}
                className="size-14 shrink-0 rounded-xl border border-line bg-surface object-cover"
              />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-brand-hover">
                <Icon className="size-6" />
              </span>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-fg">
                {business.name}
              </h1>
              <p className="flex items-center gap-1 truncate text-sm text-fg-muted">
                {location && <MapPin className="size-3.5 shrink-0" />}
                {location || CATEGORIES[business.category].label}
              </p>
              {business.rating && business.rating.count > 0 && (
                <a href="#resenas" className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg">
                  <Stars value={business.rating.average ?? 0} />
                  <span className="font-medium text-fg">{business.rating.average?.toFixed(1)}</span>
                  ({business.rating.count} reseña{business.rating.count === 1 ? '' : 's'})
                </a>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="relative mx-auto w-full max-w-xl flex-1 px-4 pb-10">{children}</main>

      <footer className="relative flex items-center justify-center gap-2 border-t border-line py-5 text-xs text-fg-subtle">
        Reservas con
        <span className="scale-90">
          <Logo />
        </span>
      </footer>
    </div>
  )
}
