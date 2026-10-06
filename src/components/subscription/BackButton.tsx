import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const className =
  'mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm text-fg-muted hover:text-fg'

/** "← Atrás" de cada paso del asistente: botón (`onClick`) o enlace (`to`). */
export function BackButton({
  onClick,
  to,
  label = 'Atrás',
}: {
  onClick?: () => void
  to?: string
  label?: string
}) {
  const content = (
    <>
      <ArrowLeft className="size-4" /> {label}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}
