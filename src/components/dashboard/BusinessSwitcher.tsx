import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '@/constants/business'
import { ROLE_LABELS } from '@/constants/roles'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { useBusinessStore } from '@/store/businessStore'

export function BusinessSwitcher() {
  const { business, category } = useActiveBusiness()
  const businesses = useBusinessStore((s) => s.businesses)
  const setActive = useBusinessStore((s) => s.setActive)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const Icon = category.icon

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-md border border-line bg-surface-2 px-2.5 py-2 text-left transition-colors hover:border-line-strong"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded bg-brand-soft text-brand-hover">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">{business.name}</span>
          <span className="block text-xs text-fg-subtle">
            {ROLE_LABELS[business.role]}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-fg-subtle" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-line-strong bg-surface shadow-xl shadow-black/40">
          <p className="px-3 pt-2.5 pb-1.5 text-xs font-medium text-fg-subtle">Tus negocios</p>
          <ul className="max-h-64 overflow-y-auto">
            {businesses.map((b) => {
              const BIcon = CATEGORIES[b.category].icon
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(b.id)
                      setOpen(false)
                      navigate('/app')
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-fg hover:bg-surface-2"
                  >
                    <BIcon className="size-4 shrink-0 text-fg-muted" />
                    <span className="flex-1 truncate">{b.name}</span>
                    {b.id === business.id && <Check className="size-4 text-brand-hover" />}
                  </button>
                </li>
              )
            })}
          </ul>
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="flex w-full cursor-pointer items-center gap-2.5 border-t border-line px-3 py-2.5 text-left text-sm text-fg-muted hover:bg-surface-2 hover:text-fg"
          >
            <Plus className="size-4" />
            Crear otro negocio
          </button>
        </div>
      )}
    </div>
  )
}
