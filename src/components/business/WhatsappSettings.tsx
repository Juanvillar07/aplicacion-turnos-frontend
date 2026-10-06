import { Check, Copy, Info } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Switch } from '@/components/common/Switch'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/services/api'
import { whatsappBookingUrl, whatsappService } from '@/services/whatsapp'
import { toast } from '@/store/toastStore'
import type { Business } from '@/types/business'

interface WhatsappSettingsProps {
  business: Business
  readOnly: boolean
  onToggle: (enabled: boolean) => Promise<unknown>
}

/** Activa los avisos y el bot de WhatsApp, y muestra el enlace para compartir. */
export function WhatsappSettings({ business, readOnly, onToggle }: WhatsappSettingsProps) {
  const { data: info } = useAsync('whatsapp-info', () => whatsappService.info(), null)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const link = info?.displayNumber ? whatsappBookingUrl(info.displayNumber, business.slug) : null

  const toggle = async (enabled: boolean) => {
    setIsSaving(true)
    try {
      await onToggle(enabled)
      toast.success(enabled ? 'WhatsApp activado' : 'WhatsApp desactivado')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const copy = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Switch
          checked={business.whatsappEnabled}
          onChange={toggle}
          label="Usar WhatsApp con mis clientes"
          disabled={readOnly || isSaving}
        />
        <p className="pl-[46px] text-xs text-fg-subtle">
          Avisos de confirmación, cambios y cancelaciones a quienes lo acepten al reservar, y
          reservas por chat con el asistente.
        </p>
      </div>

      {business.whatsappEnabled && link && (
        <div className="rounded-md border border-line bg-surface-2/50 p-3">
          <p className="mb-2 text-xs font-medium text-fg-subtle">
            Enlace para reservar por WhatsApp
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate text-xs text-fg-muted">{link}</code>
            <Button variant="secondary" size="sm" onClick={copy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-fg-subtle">
            Compártelo en tu Instagram, Google o estados: abre el chat ya conectado con tu
            negocio.
          </p>
        </div>
      )}

      {info && !info.configured && (
        <p className="flex items-start gap-2 text-xs text-amber-400/90">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          El servidor aún no tiene conectada la cuenta de WhatsApp de Meta: los mensajes se
          guardan como vista previa y no se envían.
        </p>
      )}
    </div>
  )
}
