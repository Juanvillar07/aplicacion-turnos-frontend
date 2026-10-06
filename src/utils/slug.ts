/** Misma regla que el backend: "Barbería Don Juan" → "barberia-don-juan" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '')
}

/** URL pública de reservas del negocio (página disponible en la Fase 2). */
export function publicBookingUrl(slug: string): string {
  return `${window.location.origin}/b/${slug}`
}
