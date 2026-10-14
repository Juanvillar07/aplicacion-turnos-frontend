import type { PanelReviewPage, PublicReviewPage, ReviewInvite } from '@/types/review'
import { api } from './api'

export const reviewsService = {
  // ─── Página pública ───

  async publicPage(slug: string, page: number): Promise<PublicReviewPage> {
    const { data } = await api.get<PublicReviewPage>(`/public/b/${slug}/reviews`, {
      params: { page },
    })
    return data
  },

  // ─── Enlace del cliente ───

  async getInvite(token: string): Promise<ReviewInvite> {
    const { data } = await api.get<ReviewInvite>(`/public/reviews/${token}`)
    return data
  },

  async submit(token: string, rating: number, comment: string): Promise<ReviewInvite> {
    const { data } = await api.post<ReviewInvite>(`/public/reviews/${token}`, {
      rating,
      ...(comment.trim() && { comment: comment.trim() }),
    })
    return data
  },

  // ─── Panel ───

  async list(
    businessId: string,
    { rating, page = 1 }: { rating?: number | null; page?: number },
  ): Promise<PanelReviewPage> {
    const { data } = await api.get<PanelReviewPage>(`/businesses/${businessId}/reviews`, {
      params: { page, ...(rating && { rating }) },
    })
    return data
  },

  async update(
    businessId: string,
    reviewId: string,
    payload: { reply?: string | null; hidden?: boolean },
  ): Promise<PanelReviewPage> {
    const { data } = await api.patch<PanelReviewPage>(
      `/businesses/${businessId}/reviews/${reviewId}`,
      payload,
    )
    return data
  },
}
