import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** Usuario actual y botón de salir, al pie del sidebar. */
export function SidebarUserFooter({
  accountTo,
  onNavigate,
}: {
  /** Enlace a "Mi cuenta"; sin él, el usuario se muestra sin enlace */
  accountTo?: string
  onNavigate?: () => void
}) {
  const { user, logout } = useAuth()

  const content = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-fg-muted">
        {initialsOf(user?.name ?? '?')}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-fg">{user?.name}</span>
        <span className="block truncate text-xs text-fg-subtle">{user?.email}</span>
      </span>
    </>
  )

  return (
    <div className="flex items-center gap-1 border-t border-line p-2">
      {accountTo ? (
        <NavLink
          to={accountTo}
          onClick={onNavigate}
          title="Mi cuenta"
          className={({ isActive }) =>
            `flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1.5 transition-colors hover:bg-surface-2 ${isActive ? 'bg-surface-2' : ''}`
          }
        >
          {content}
        </NavLink>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2.5 p-1.5">{content}</div>
      )}
      <button
        type="button"
        onClick={logout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="cursor-pointer rounded-md p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}
