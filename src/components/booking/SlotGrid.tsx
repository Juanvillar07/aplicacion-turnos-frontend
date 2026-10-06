import { Moon, Sun, Sunset } from 'lucide-react'
import type { Slot } from '@/types/booking'
import { formatClock, minutesOfDay } from '@/utils/date'

interface SlotGridProps {
  slots: Slot[]
  timezone: string
  selected: string | null
  onSelect: (slot: Slot) => void
}

const GROUPS = [
  { label: 'Mañana', icon: Sun, test: (m: number) => m < 12 * 60 },
  { label: 'Tarde', icon: Sunset, test: (m: number) => m >= 12 * 60 && m < 18 * 60 },
  { label: 'Noche', icon: Moon, test: (m: number) => m >= 18 * 60 },
]

export function SlotGrid({ slots, timezone, selected, onSelect }: SlotGridProps) {
  return (
    <div className="flex flex-col gap-5">
      {GROUPS.map((group) => {
        const groupSlots = slots.filter((s) => group.test(minutesOfDay(s.startsAt, timezone)))
        if (groupSlots.length === 0) return null
        const Icon = group.icon
        return (
          <section key={group.label}>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
              <Icon className="size-3.5" /> {group.label}
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {groupSlots.map((slot) => {
                const isSelected = slot.startsAt === selected
                return (
                  <button
                    key={slot.startsAt}
                    type="button"
                    onClick={() => onSelect(slot)}
                    className={`h-10 cursor-pointer rounded-md border text-sm font-medium tabular-nums transition-colors ${
                      isSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-line bg-surface text-fg hover:border-brand/60 hover:bg-surface-2'
                    }`}
                  >
                    {formatClock(slot.startsAt, timezone)}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
