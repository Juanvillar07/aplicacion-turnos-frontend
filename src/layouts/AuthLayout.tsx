import { Outlet } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'

interface AuthLayoutProps {
  /** `wide`: onboarding y pago · `xl`: comparación de planes */
  width?: 'narrow' | 'wide' | 'xl'
}

const WIDTHS = { narrow: 'max-w-[400px]', wide: 'max-w-[560px]', xl: 'max-w-5xl' }

/** Contenedor centrado y minimalista para autenticación y onboarding. */
export function AuthLayout({ width = 'narrow' }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      {/* Halo sutil del color de marca */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,var(--color-brand-soft),transparent_70%)]"
      />
      <div className={`relative w-full ${WIDTHS[width]}`}>
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Outlet />
      </div>
    </div>
  )
}
