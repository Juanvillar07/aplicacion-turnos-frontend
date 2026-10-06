import { api } from './api'

export interface WhatsappInfo {
  /** El backend tiene token y número de Meta configurados */
  configured: boolean
  /** Número del bot para los enlaces wa.me (solo dígitos) */
  displayNumber: string | null
  /** El simulador de chat está disponible (desarrollo) */
  simulator: boolean
}

/** Mensaje que envía el bot (mismo formato que el backend) */
export type BotMessage =
  | { kind: 'text'; text: string }
  | { kind: 'buttons'; text: string; buttons: { id: string; title: string }[] }
  | {
      kind: 'list'
      text: string
      button: string
      rows: { id: string; title: string; description?: string }[]
    }
  | { kind: 'template'; name: string; params: string[]; text: string }

let infoCache: Promise<WhatsappInfo> | null = null

export const whatsappService = {
  /** Se pide una sola vez por carga de la app */
  info(): Promise<WhatsappInfo> {
    infoCache ??= api.get<WhatsappInfo>('/whatsapp/info').then((r) => r.data)
    return infoCache
  },

  async simulate(payload: {
    phone: string
    text?: string
    replyId?: string
    profileName?: string
  }): Promise<BotMessage[]> {
    const { data } = await api.post<{ messages: BotMessage[] }>('/whatsapp/simulate', payload)
    return data.messages
  },
}

/** Enlace que abre WhatsApp con el mensaje que identifica al negocio */
export function whatsappBookingUrl(displayNumber: string, slug: string): string {
  const text = `Hola, quiero reservar en ${slug}`
  return `https://wa.me/${displayNumber}?text=${encodeURIComponent(text)}`
}
