import type { CardBrand } from '@/types/subscription'

export const cardDigits = (value: string) => value.replace(/\D/g, '')

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return 'VISA'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD'
  if (/^3[47]/.test(digits)) return 'AMEX'
  return 'OTHER'
}

/** "4242424242424242" → "4242 4242 4242 4242" (Amex: 4-6-5) */
export function formatCardNumber(value: string): string {
  const digits = cardDigits(value).slice(0, 19)
  if (detectBrand(digits) === 'AMEX') {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(' ')
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/** Algoritmo de Luhn: detecta números de tarjeta mal escritos */
export function isValidCardNumber(value: string): boolean {
  const digits = cardDigits(value)
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

/** "0429" → "04/29" mientras se escribe */
export function formatExpiry(value: string): string {
  const digits = cardDigits(value).slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

/** MM/AA válido y no vencido */
export function isValidExpiry(value: string, now = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  // Válida hasta el último día de su mes
  return new Date(year, month, 1) > now
}
