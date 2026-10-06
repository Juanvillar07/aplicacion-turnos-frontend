/**
 * Política de contraseñas. Es la misma que valida el backend
 * (`common/validation/strong-password.decorator.ts`).
 */
export const PASSWORD_RULES = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 && p.length <= 72 },
  { id: 'upper', label: 'Una letra mayúscula', test: (p: string) => /\p{Lu}/u.test(p) },
  {
    id: 'special',
    label: 'Un carácter especial (! @ # $ % . -)',
    // Cualquier cosa que no sea letra, número ni espacio
    test: (p: string) => /[^\p{L}\p{N}\s]/u.test(p),
  },
] as const

export const meetsPasswordRules = (password: string) =>
  PASSWORD_RULES.every((rule) => rule.test(password))

/** Primer problema para mostrar al enviar, o `null` si está todo bien. */
export function passwordProblem(password: string, confirm: string): string | null {
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password))
  if (failed) return `La contraseña necesita: ${failed.label.toLowerCase()}`
  if (password !== confirm) return 'Las contraseñas no coinciden'
  return null
}
