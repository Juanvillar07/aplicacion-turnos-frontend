import type { AuthResponse } from '@/types/auth'
import type { MemberRole } from '@/types/business'
import type { InvitationInfo, InvitePayload, Team } from '@/types/team'
import { api } from './api'

const base = (businessId: string) => `/businesses/${businessId}/team`

export const teamService = {
  async get(businessId: string): Promise<Team> {
    const { data } = await api.get<Team>(base(businessId))
    return data
  },

  async invite(businessId: string, payload: InvitePayload): Promise<Team> {
    const { data } = await api.post<Team>(`${base(businessId)}/invitations`, payload)
    return data
  },

  async resendInvitation(businessId: string, invitationId: string): Promise<Team> {
    const { data } = await api.post<Team>(`${base(businessId)}/invitations/${invitationId}/resend`)
    return data
  },

  async revokeInvitation(businessId: string, invitationId: string): Promise<Team> {
    const { data } = await api.delete<Team>(`${base(businessId)}/invitations/${invitationId}`)
    return data
  },

  /** `resourceId: null` desvincula de la agenda */
  async updateMember(
    businessId: string,
    membershipId: string,
    payload: { role?: MemberRole; resourceId?: string | null },
  ): Promise<Team> {
    const { data } = await api.patch<Team>(`${base(businessId)}/members/${membershipId}`, payload)
    return data
  },

  async removeMember(businessId: string, membershipId: string): Promise<void> {
    await api.delete(`${base(businessId)}/members/${membershipId}`)
  },

  // ─── Enlace del invitado ───

  async getInvitation(token: string): Promise<InvitationInfo> {
    const { data } = await api.get<InvitationInfo>(`/invitations/${token}`)
    return data
  },

  async acceptInvitation(token: string): Promise<{ businessId: string }> {
    const { data } = await api.post<{ businessId: string }>(`/invitations/${token}/accept`)
    return data
  },

  async registerFromInvitation(
    token: string,
    name: string,
    password: string,
  ): Promise<AuthResponse & { businessId: string }> {
    const { data } = await api.post(`/invitations/${token}/register`, { name, password })
    return data
  },
}
