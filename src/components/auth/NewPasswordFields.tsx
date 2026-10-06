import { Check, Eye, EyeOff, X } from 'lucide-react'
import { useId, useState } from 'react'
import { fieldClass } from '@/components/common/Input'
import { PASSWORD_RULES } from '@/utils/password'

interface NewPasswordFieldsProps {
  password: string
  confirm: string
  onPasswordChange: (value: string) => void
  onConfirmChange: (value: string) => void
  passwordLabel?: string
  confirmLabel?: string
  autoFocus?: boolean
  /** `grid`: los dos campos lado a lado en pantallas anchas */
  layout?: 'stack' | 'grid'
}

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoFocus,
  invalid,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  visible: boolean
  onToggle: () => void
  autoFocus?: boolean
  invalid?: boolean
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-fg-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={72}
          required
          autoFocus={autoFocus}
          aria-invalid={invalid || undefined}
          className={`h-9 pr-10 ${fieldClass} ${invalid ? 'border-danger/60' : ''}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 text-fg-subtle hover:text-fg"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}

/**
 * Contraseña nueva + confirmación, con la lista de requisitos en vivo
 * (8 caracteres, una mayúscula, un carácter especial y que coincidan).
 */
export function NewPasswordFields({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  passwordLabel = 'Contraseña',
  confirmLabel = 'Repite la contraseña',
  autoFocus,
  layout = 'stack',
}: NewPasswordFieldsProps) {
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible((v) => !v)
  const mismatch = confirm.length > 0 && confirm !== password

  const checks = [
    ...PASSWORD_RULES.map((rule) => ({ label: rule.label, ok: rule.test(password) })),
    { label: 'Las dos contraseñas coinciden', ok: confirm.length > 0 && confirm === password },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className={layout === 'grid' ? 'grid gap-5 sm:grid-cols-2' : 'flex flex-col gap-5'}>
        <PasswordInput
          label={passwordLabel}
          value={password}
          onChange={onPasswordChange}
          visible={visible}
          onToggle={toggle}
          autoFocus={autoFocus}
        />
        <PasswordInput
          label={confirmLabel}
          value={confirm}
          onChange={onConfirmChange}
          visible={visible}
          onToggle={toggle}
          invalid={mismatch}
        />
      </div>
      <ul className="grid gap-1 text-xs sm:grid-cols-2" aria-label="Requisitos de la contraseña">
        {checks.map((check) => (
          <li
            key={check.label}
            className={`flex items-center gap-1.5 ${check.ok ? 'text-emerald-400' : 'text-fg-subtle'}`}
          >
            {check.ok ? <Check className="size-3.5" /> : <X className="size-3.5 opacity-60" />}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
