import {
  CalendarDays,
  Contact,
  LayoutDashboard,
  MessageCircle,
  Settings,
  ShieldCheck,
  Star,
  Tag,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { Logo } from '@/components/common/Logo'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useAuth } from '@/hooks/useAuth'
import { useAgendaStore } from '@/store/agendaStore'
import { BusinessSwitcher } from './BusinessSwitcher'
import { SidebarUserFooter } from './SidebarUserFooter'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: number
}

export function NavItemLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
          isActive
            ? 'bg-surface-2 text-fg'
            : 'text-fg-muted hover:bg-surface-2/60 hover:text-fg'
        }`
      }
    >
      <Icon className="size-4" />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span className="min-w-5 rounded-full bg-amber-500/15 px-1.5 text-center text-xs font-medium text-amber-400 tabular-nums">
          {item.badge}
        </span>
      ) : null}
    </NavLink>
  )
}

/** Funcionalidades de la hoja de ruta, visibles pero aún no disponibles. */
function UpcomingItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="flex cursor-default items-center gap-2.5 px-2.5 py-1.5 text-sm text-fg-subtle">
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
      <Badge tone="muted">Pronto</Badge>
    </span>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const { business, category, isStaff } = useActiveBusiness()
  const pendingCount = useAgendaStore((s) => s.pendingCount)
  const refreshPending = useAgendaStore((s) => s.refreshPending)

  // Insignia de reservas pendientes: al cambiar de negocio y cada minuto
  useEffect(() => {
    void refreshPending(business.id)
    const timer = setInterval(() => void refreshPending(business.id), 60_000)
    return () => clearInterval(timer)
  }, [business.id, refreshPending])

  const agenda: NavItem = { to: '/app/agenda', label: 'Agenda', icon: CalendarDays, badge: pendingCount }
  const customers: NavItem = { to: '/app/customers', label: 'Clientes', icon: Contact }

  // Un profesional solo trabaja con su agenda y los clientes
  const items: NavItem[] = isStaff
    ? [{ ...agenda, label: 'Mi agenda' }, customers]
    : [
        { to: '/app', label: 'Resumen', icon: LayoutDashboard, end: true },
        agenda,
        customers,
        { to: '/app/services', label: 'Servicios', icon: Tag },
        { to: '/app/team', label: category.resourcesLabel, icon: Users },
        { to: '/app/members', label: 'Miembros', icon: UserCog },
        { to: '/app/reviews', label: 'Reseñas', icon: Star },
        { to: '/app/settings', label: 'Configuración', icon: Settings },
        // Solo en desarrollo (npm run dev)
        ...(import.meta.env.DEV
          ? [{ to: '/app/whatsapp', label: 'Simulador WhatsApp', icon: MessageCircle }]
          : []),
      ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-line px-4">
        <Logo />
      </div>

      <div className="p-3">
        <BusinessSwitcher />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div className="space-y-0.5">
          {items.map((item) => (
            <NavItemLink key={item.to} item={item} onNavigate={onNavigate} />
          ))}
        </div>
        {!isStaff && (
          <div className="space-y-0.5">
            <p className="px-2.5 pb-1 text-xs font-medium text-fg-subtle">Próximamente</p>
            <UpcomingItem icon={Wallet} label="Pagos" />
          </div>
        )}
        {user?.isSuperAdmin && (
          <div className="space-y-0.5">
            <p className="px-2.5 pb-1 text-xs font-medium text-fg-subtle">Plataforma</p>
            <NavItemLink
              item={{ to: '/admin', label: 'Superadmin', icon: ShieldCheck }}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </nav>

      <SidebarUserFooter accountTo="/app/account" onNavigate={onNavigate} />
    </div>
  )
}
