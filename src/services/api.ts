import axios, { AxiosError } from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Permite que la capa de servicios lea el token y reaccione a un 401
 * sin depender directamente del store (evita importaciones circulares).
 */
let getToken: () => string | null = () => null
let onUnauthorized: () => void = () => {}

export function configureApiAuth(options: {
  getToken: () => string | null
  onUnauthorized: () => void
}) {
  getToken = options.getToken
  onUnauthorized = options.onUnauthorized
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Un 401 con token significa sesión expirada o inválida.
    if (error.response?.status === 401 && getToken()) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

/** Extrae un mensaje legible de los errores que devuelve NestJS. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor'
    }
    const message = error.response.data?.message
    if (Array.isArray(message)) return message[0]
    if (message) return message
  }
  return 'Ocurrió un error inesperado'
}
