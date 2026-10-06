/** "+573001234567" → "300 123 4567" (otros países se muestran tal cual) */
export function prettyPhone(phone: string): string {
  const local = phone.replace(/^\+57/, '')
  return local.length === 10 && phone.startsWith('+57')
    ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
    : phone
}

/** Enlace para abrir un chat de WhatsApp con el número */
export function whatsappUrl(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}
