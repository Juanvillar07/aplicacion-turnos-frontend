import { ArrowLeftRight, Building2, LayoutDashboard } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Logo } from '@/components/common/Logo'
import { NavItemLink, type NavItem } from '@/components/dashboard/Sidebar'
import { SidebarUserFooter } from '@/components/dashboard/SidebarUserFooter'
import { useBusinessStore } from '@/store/businessStore'

const ITEMS: NavItem[] = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/businesses', label: 'Negocios', icon: Building2 },
]

/** Menú del panel de la plataforma (superadministrador). */
export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const isLoaded = useBusinessStore((s) => s.isLoaded)
  const hasBusiness = useBusinessStore((s) => s.businesses.length > 0)
  const fetchMyBusinesses = useBusinessStore((s) => s.fetchMyBusinesses)

  // Para ofrecer "Ir a mi negocio" si además es miembro de alguno
  useEffect(() => {
    if (!isLoaded) void fetchMyBusinesses().catch(() => undefined)
  }, [isLoaded, fetchMyBusinesses])

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-line px-4">
        <Logo />
        <Badge tone="brand">Superadmin</Badge>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {ITEMS.map((item) => (
            <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
        {hasBusiness && (
          <Link
            to="/app"
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-fg-muted transition-colors hover:bg-surface-2/60 hover:text-fg"
          >
            <ArrowLeftRight className="size-4" />
            Ir a mi negocio
          </Link>
        )}
      </nav>

      <SidebarUserFooter onNavigate={onNavigate} />
    </div>
  )
}
