import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/types/auth'
import { api } from './api'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  /** Ruta protegida: valida el token y devuelve el usuario actual. */
  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email })
    return data.message
  },

  async resetPassword(token: string, password: string): Promise<string> {
    const { data } = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    })
    return data.message
  },

  async verifyEmail(token: string): Promise<User> {
    const { data } = await api.post<User>('/auth/verify-email', { token })
    return data
  },

  async resendVerification(): Promise<string> {
    const { data } = await api.post<{ message: string }>('/auth/resend-verification')
    return data.message
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/auth/password', { currentPassword, newPassword })
  },

  async updateProfile(name: string): Promise<User> {
    const { data } = await api.patch<User>('/auth/profile', { name })
    return data
  },
}
