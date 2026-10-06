import { useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'

const FORM_ID = 'invite-member-form'

interface InviteMemberModalProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  /** Texto bajo el campo de correo (qué pasa al aceptar) */
  note?: ReactNode
  onSubmit: (email: string) => Promise<boolean>
}

/** Pide el correo de la persona invitada; el rol lo decide quien lo abre. */
export function InviteMemberModal(props: InviteMemberModalProps) {
  if (!props.open) return null
  return <InviteForm {...props} />
}

function InviteForm({ onClose, title, description, note, onSubmit }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    const ok = await onSubmit(email.trim())
    setIsSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={isSaving}>
            Enviar invitación
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Email"
          type="email"
          placeholder="persona@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        {note && <p className="text-xs text-fg-subtle">{note}</p>}
      </form>
    </Modal>
  )
}
