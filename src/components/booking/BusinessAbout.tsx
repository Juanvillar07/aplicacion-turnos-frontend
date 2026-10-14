import { Globe, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { FacebookIcon, InstagramIcon } from '@/components/common/BrandIcons'
import type { PublicBusiness } from '@/types/booking'
import { prettyPhone } from '@/utils/phone'

/**
 * "Acerca de": descripción, ubicación con mapa de Google (sin clave de API, a
 * partir de la dirección) y contacto/redes. No muestra nada que no exista.
 */
export function BusinessAbout({ business }: { business: PublicBusiness }) {
  const address = [business.address, business.city].filter(Boolean).join(', ')
  // Solo dirección y ciudad: con el nombre, Google puede ubicar otro sitio
  const query = encodeURIComponent(address)
  // El teléfono del negocio se guarda sin indicativo: "3001234567"
  const digits = business.phone?.replace(/\D/g, '') ?? ''
  const e164 = digits.length === 10 ? `+57${digits}` : digits ? `+${digits}` : null
  // WhatsApp solo para celulares colombianos (empiezan por 3)
  const whatsapp = e164?.startsWith('+573') ? `https://wa.me/${e164.slice(1)}` : null

  const links = [
    e164 && { href: `tel:${e164}`, label: prettyPhone(e164), icon: <Phone className="size-4" /> },
    whatsapp && { href: whatsapp, label: 'WhatsApp', icon: <MessageCircle className="size-4" /> },
    business.instagramUrl && { href: business.instagramUrl, label: 'Instagram', icon: <InstagramIcon /> },
    business.facebookUrl && { href: business.facebookUrl, label: 'Facebook', icon: <FacebookIcon /> },
    business.websiteUrl && { href: business.websiteUrl, label: 'Sitio web', icon: <Globe className="size-4" /> },
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode }[]

  if (!business.description && !business.address && links.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-medium text-fg">Acerca de {business.name}</h2>

      {business.description && (
        <p className="text-sm leading-relaxed whitespace-pre-line text-fg-muted">{business.description}</p>
      )}

      {business.address && (
        <div className="overflow-hidden rounded-lg border border-line">
          <iframe
            title={`Mapa de ${business.name}`}
            src={`https://www.google.com/maps?q=${query}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-48 w-full border-0 bg-surface-2"
          />
          <div className="flex flex-wrap items-center gap-3 bg-surface px-3 py-2.5">
            <p className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-fg-muted">
              <MapPin className="size-4 shrink-0" /> <span className="truncate">{address}</span>
            </p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-hover hover:underline"
            >
              <Navigation className="size-3.5" /> Cómo llegar
            </a>
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('tel:') ? undefined : '_blank'}
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              {link.icon} {link.label}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
