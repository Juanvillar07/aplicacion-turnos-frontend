export interface User {
  id: string
  email: string
  name: string
  /** null = correo sin verificar */
  emailVerifiedAt: string | null
  /** Superadministrador de la plataforma (dueño de AgendaBarrio) */
  isSuperAdmin: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}
