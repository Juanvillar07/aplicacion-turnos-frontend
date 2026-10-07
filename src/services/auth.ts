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

  /** Código de 6 dígitos que llegó al correo → usuario ya verificado */
  async verifyEmail(code: string): Promise<User> {
    const { data } = await api.post<User>('/auth/verify-email', { code })
    return data
  },

  /** ¿Hay un código vigente? No envía nada */
  async verificationStatus(): Promise<{ hasActiveCode: boolean; resendAvailableAt: string }> {
    const { data } = await api.get<{ hasActiveCode: boolean; resendAvailableAt: string }>(
      '/auth/verification-status',
    )
    return data
  },

  /** Envía un código nuevo (uno por minuto) */
  async resendVerification(): Promise<{ message: string; resendAvailableAt: string }> {
    const { data } = await api.post<{ message: string; resendAvailableAt: string }>(
      '/auth/resend-verification',
    )
    return data
  },

  /** Corrige el correo de una cuenta aún sin verificar; devuelve una sesión nueva */
  async changeEmail(email: string): Promise<AuthResponse> {
    const { data } = await api.patch<AuthResponse>('/auth/email', { email })
    return data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/auth/password', { currentPassword, newPassword })
  },

  async updateProfile(name: string): Promise<User> {
    const { data } = await api.patch<User>('/auth/profile', { name })
    return data
  },
}
