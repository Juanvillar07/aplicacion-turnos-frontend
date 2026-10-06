import { CATEGORIES } from '@/constants/business'
import { isManagerRole } from '@/constants/roles'
import { useBusinessStore } from '@/store/businessStore'
import type { Business } from '@/types/business'

/**
 * Negocio activo del panel. Solo debe usarse dentro de rutas protegidas por
 * `RequireBusiness`, que garantiza que existe.
 */
export function useActiveBusiness() {
  const business = useBusinessStore(
    (s) => s.businesses.find((b) => b.id === s.activeBusinessId) ?? null,
  ) as Business

  return {
    business,
    /** Administrador: gestiona todo el negocio */
    canManage: business ? isManagerRole(business.role) : false,
    /** Profesional: solo su agenda y los clientes */
    isStaff: business?.role === 'STAFF',
    category: CATEGORIES[business?.category ?? 'OTHER'],
  }
}
