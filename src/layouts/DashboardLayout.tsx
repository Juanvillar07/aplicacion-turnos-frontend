import { Menu, X } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'
import { Spinner } from '@/components/common/Spinner'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SuspendedBanner } from '@/components/dashboard/SuspendedBanner'
import { VerifyEmailBanner } from '@/components/dashboard/VerifyEmailBanner'
import { useAuthStore } from '@/store/authStore'

/**
 * Panel estilo Supabase: sidebar fijo en escritorio, drawer en móvil.
 * `variant="admin"` es el panel de la plataforma (superadministrador).
 */
export function DashboardLayout({ variant = 'business' }: { variant?: 'business' | 'admin' }) {
  const Nav = variant === 'admin' ? AdminSidebar : Sidebar
  const [drawerOpen, setDrawerOpen] = useState(false)
  const fetchMe = useAuthStore((s) => s.fetchMe)

  // Refresca el usuario guardado (p. ej. si verificó su correo en otra pestaña)
  useEffect(() => {
    void fetchMe()
  }, [fetchMe])
  const { pathname } = useLocation()

  const [lastPathname, setLastPathname] = useState(pathname)

  // Cierra el drawer al cambiar de página (ajuste de estado durante el render)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setDrawerOpen(false)
  }

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-sidebar lg:block">
        <Nav />
      </aside>

      {/* Barra superior móvil */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
          className="cursor-pointer rounded-md p-2 text-fg-muted hover:bg-surface-2 hover:text-fg"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-sidebar">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Cerrar menú"
              className="absolute top-3 right-3 z-10 cursor-pointer rounded-md p-1.5 text-fg-muted hover:bg-surface-2"
            >
              <X className="size-4" />
            </button>
            <Nav onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        {variant === 'business' && <SuspendedBanner />}
        <VerifyEmailBanner />
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:py-12">
          <Suspense
            fallback={
              <div className="flex justify-center py-20">
                <Spinner />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
