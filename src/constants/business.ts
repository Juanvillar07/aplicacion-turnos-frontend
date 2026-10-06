import {
  Activity,
  Scissors,
  Sparkles,
  Stethoscope,
  Store,
  type LucideIcon,
} from 'lucide-react'
import type { BusinessCategory } from '@/types/business'

export interface CategoryMeta {
  label: string
  description: string
  icon: LucideIcon
  /** Cómo se llama al equipo/espacios en el panel para este tipo de negocio */
  resourcesLabel: string
  resourceSingular: string
}

export const CATEGORIES: Record<BusinessCategory, CategoryMeta> = {
  BARBERSHOP: {
    label: 'Barbería',
    description: 'Cortes, barba y cuidado masculino',
    icon: Scissors,
    resourcesLabel: 'Barberos',
    resourceSingular: 'barbero',
  },
  BEAUTY: {
    label: 'Estética / Spa',
    description: 'Uñas, cejas, peluquería, tratamientos',
    icon: Sparkles,
    resourcesLabel: 'Profesionales',
    resourceSingular: 'profesional',
  },
  CLINIC: {
    label: 'Consultorio',
    description: 'Odontología, psicología, fisioterapia…',
    icon: Stethoscope,
    resourcesLabel: 'Profesionales',
    resourceSingular: 'profesional',
  },
  SPORTS_COURT: {
    label: 'Canchas',
    description: 'Fútbol 5, sintéticas, pádel, tenis',
    icon: Activity,
    resourcesLabel: 'Canchas',
    resourceSingular: 'cancha',
  },
  OTHER: {
    label: 'Otro',
    description: 'Cualquier negocio que agenda citas',
    icon: Store,
    resourcesLabel: 'Equipo y espacios',
    resourceSingular: 'recurso',
  },
}

export const CATEGORY_LIST = Object.entries(CATEGORIES) as [
  BusinessCategory,
  CategoryMeta,
][]

/** Lunes primero, como se usa en Colombia. Valores = dayOfWeek del backend. */
export const WEEK_DAYS = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 0, label: 'Domingo', short: 'Dom' },
] as const
