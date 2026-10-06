import type { BusinessCategory, MemberRole } from './business'

export interface TeamMember {
  /** id de la membresía */
  id: string
  role: MemberRole
  joinedAt: string
  user: { id: string; name: string; email: string }
  /** Columna de la agenda vinculada a la persona */
  resource: { id: string; name: string } | null
}

export interface PendingInvitation {
  id: string
  email: string
  role: MemberRole
  expiresAt: string
  createdAt: string
  resource: { id: string; name: string } | null
  invitedBy: { name: string }
}

export interface Team {
  members: TeamMember[]
  invitations: PendingInvitation[]
}

export interface InvitePayload {
  email: string
  role: MemberRole
  resourceId?: string
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED'

/** Lo que ve el invitado al abrir el enlace */
export interface InvitationInfo {
  email: string
  role: MemberRole
  status: InvitationStatus
  expiresAt: string
  business: { name: string; category: BusinessCategory }
  invitedBy: string
  hasAccount: boolean
}
