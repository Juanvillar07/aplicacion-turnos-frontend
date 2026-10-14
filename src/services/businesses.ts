import type {
  Business,
  BusinessPhoto,
  CreateBusinessPayload,
  UpdateBusinessPayload,
} from '@/types/business'
import { api } from './api'

export const businessesService = {
  async listMine(): Promise<Business[]> {
    const { data } = await api.get<Business[]>('/businesses')
    return data
  },

  async create(payload: CreateBusinessPayload): Promise<Business> {
    const { data } = await api.post<Business>('/businesses', payload)
    return data
  },

  async update(businessId: string, payload: UpdateBusinessPayload): Promise<Business> {
    const { data } = await api.patch<Business>(`/businesses/${businessId}`, payload)
    return data
  },

  async checkSlug(slug: string): Promise<{ slug: string; available: boolean }> {
    const { data } = await api.get('/businesses/slug-available', { params: { slug } })
    return data
  },

  // ─── Página pública: logo y fotos ───

  async uploadLogo(businessId: string, file: File): Promise<Business> {
    const { data } = await api.post<Business>(
      `/businesses/${businessId}/logo`,
      toForm(file),
      MULTIPART,
    )
    return data
  },

  async removeLogo(businessId: string): Promise<Business> {
    const { data } = await api.delete<Business>(`/businesses/${businessId}/logo`)
    return data
  },

  async photos(businessId: string): Promise<BusinessPhoto[]> {
    const { data } = await api.get<BusinessPhoto[]>(`/businesses/${businessId}/photos`)
    return data
  },

  async addPhoto(businessId: string, file: File): Promise<BusinessPhoto[]> {
    const { data } = await api.post<BusinessPhoto[]>(
      `/businesses/${businessId}/photos`,
      toForm(file),
      MULTIPART,
    )
    return data
  },

  async removePhoto(businessId: string, photoId: string): Promise<BusinessPhoto[]> {
    const { data } = await api.delete<BusinessPhoto[]>(
      `/businesses/${businessId}/photos/${photoId}`,
    )
    return data
  },

  async reorderPhotos(businessId: string, ids: string[]): Promise<BusinessPhoto[]> {
    const { data } = await api.put<BusinessPhoto[]>(`/businesses/${businessId}/photos/order`, {
      ids,
    })
    return data
  },
}

/**
 * Sin esto Axios convertiría el FormData a JSON (el cliente usa JSON por
 * defecto). El navegador completa el encabezado con el "boundary".
 */
const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } }

/** Archivo en el campo "file" (multipart/form-data) */
function toForm(file: File) {
  const form = new FormData()
  form.append('file', file)
  return form
}
