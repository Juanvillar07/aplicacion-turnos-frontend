import type { MemberRole } from '@/types/business'

export const ROLE_LABELS: Record<MemberRole, string> = {
  ADMIN: 'Administrador',
  STAFF: 'Profesional',
}

export const ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  ADMIN: 'Dueño o encargado: gestiona agenda, servicios, equipo y configuración.',
  STAFF: 'Atiende clientes: ve y gestiona solo su propia agenda y los clientes.',
}

export const isManagerRole = (role: MemberRole) => role === 'ADMIN'
