import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReactNode } from 'react'

/** "2026-10" → "oct" */
const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number)
  return format(new Date(y, m - 1, 1), 'MMM', { locale: es }).replace('.', '')
}

/** Tarjeta de cifra con texto secundario opcional. */
export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs text-fg-subtle">{label}</p>
      <p className="mt-2 text-2xl font-medium text-fg tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
    </div>
  )
}

/** Recuadro con título para agrupar gráficas y listas. */
export function Panel({
  title,
  description,
  children,
  className = '',
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-lg border border-line bg-surface p-5 ${className}`}>
      <h2 className="text-sm font-medium text-fg">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-fg-subtle">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Barras verticales por mes; el mes actual se resalta. */
export function MonthBars({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex h-40 items-end gap-2 sm:gap-3">
      {data.map((d, i) => {
        const current = i === data.length - 1
        return (
          <div key={d.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-xs text-fg-muted tabular-nums">{d.value}</span>
            <div
              className={`w-full max-w-10 rounded-t ${current ? 'bg-brand' : 'bg-brand/35'}`}
              style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
              title={`${monthLabel(d.month)}: ${d.value}`}
            />
            <span className={`text-xs ${current ? 'text-fg' : 'text-fg-subtle'}`}>
              {monthLabel(d.month)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** Barras horizontales con el porcentaje de cada parte sobre el total. */
export function ShareBars({
  rows,
  emptyText = 'Sin datos todavía',
}: {
  rows: { label: string; value: number; tone?: string }[]
  emptyText?: string
}) {
  const total = rows.reduce((n, r) => n + r.value, 0)
  if (total === 0) return <p className="text-sm text-fg-subtle">{emptyText}</p>
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => {
        const pct = Math.round((r.value / total) * 100)
        return (
          <li key={r.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-fg-muted">{r.label}</span>
              <span className="text-fg tabular-nums">
                {r.value} <span className="text-xs text-fg-subtle">· {pct}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full ${r.tone ?? 'bg-brand'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Fila "enviados / fallidos / …" de un canal de mensajes. */
export function DeliveryStats({
  items,
}: {
  items: { label: string; value: number; tone?: 'danger' | 'muted' }[]
}) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.label} className="rounded-md bg-surface-2/60 px-3 py-2">
          <dt className="text-xs text-fg-subtle">{it.label}</dt>
          <dd
            className={`mt-0.5 text-lg font-medium tabular-nums ${
              it.tone === 'danger' && it.value > 0
                ? 'text-danger'
                : it.tone === 'muted'
                  ? 'text-fg-muted'
                  : 'text-fg'
            }`}
          >
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
