import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useToastStore, type ToastType } from '@/store/toastStore'

const STYLES: Record<ToastType, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-emerald-400' },
  error: { icon: TriangleAlert, className: 'text-danger' },
  info: { icon: Info, className: 'text-brand-hover' },
}

/**
 * Notificaciones flotantes. Se montan una vez en la app y quedan por encima
 * de los modales, así un error siempre es visible sin tener que hacer scroll.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((t) => {
        const { icon: Icon, className } = STYLES[t.type]
        return (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line-strong bg-surface px-4 py-3 shadow-2xl shadow-black/50"
          >
            <Icon className={`mt-0.5 size-4 shrink-0 ${className}`} />
            <p className="flex-1 text-sm text-fg">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar notificación"
              className="-m-1 cursor-pointer rounded p-1 text-fg-subtle hover:bg-surface-2 hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
