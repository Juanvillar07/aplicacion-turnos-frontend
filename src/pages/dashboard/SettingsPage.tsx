import { useState, type ReactNode } from 'react'
import { BookingSettingsForm } from '@/components/business/BookingSettingsForm'
import { BusinessForm } from '@/components/business/BusinessForm'
import { SlugEditor } from '@/components/business/SlugEditor'
import { SubscriptionSettings } from '@/components/business/SubscriptionSettings'
import { WhatsappSettings } from '@/components/business/WhatsappSettings'
import { PageHeader } from '@/components/common/PageHeader'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { getErrorMessage } from '@/services/api'
import { useBusinessStore } from '@/store/businessStore'
import type { CreateBusinessPayload } from '@/types/business'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-6 border-b border-line py-8 first:pt-0 last:border-0 md:grid-cols-[220px_1fr]">
      <div>
        <h2 className="text-sm font-medium text-fg">{title}</h2>
        <p className="mt-1 text-sm text-fg-muted">{description}</p>
      </div>
      <div className="rounded-lg border border-line bg-surface p-5">{children}</div>
    </section>
  )
}

export function SettingsPage() {
  const { business, canManage } = useActiveBusiness()
  const updateBusiness = useBusinessStore((s) => s.updateBusiness)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (payload: CreateBusinessPayload) => {
    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      await updateBusiness(payload)
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Configuración"
        description={
          canManage
            ? 'Datos generales de tu negocio.'
            : 'Solo los administradores pueden modificar estos datos.'
        }
      />

      <Section
        title="Enlace de reservas"
        description="La dirección pública donde tus clientes agendan."
      >
        <SlugEditor
          key={business.id}
          currentSlug={business.slug}
          onSave={(slug) => updateBusiness({ slug })}
          readOnly={!canManage}
        />
      </Section>

      <Section
        title="Reservas"
        description="Cómo y con cuánta anticipación pueden reservar tus clientes."
      >
        <BookingSettingsForm
          key={business.id}
          initial={{
            autoConfirm: business.autoConfirm,
            slotStepMinutes: business.slotStepMinutes,
            minNoticeMinutes: business.minNoticeMinutes,
            maxDaysAhead: business.maxDaysAhead,
          }}
          onSubmit={(settings) => updateBusiness(settings)}
          readOnly={!canManage}
        />
      </Section>

      <Section
        title="WhatsApp"
        description="Avisos y reservas por chat con tus clientes."
      >
        <WhatsappSettings
          business={business}
          readOnly={!canManage}
          onToggle={(whatsappEnabled) => updateBusiness({ whatsappEnabled })}
        />
      </Section>

      <Section title="Información general" description="Nombre, tipo y datos de contacto.">
        {/* key: reinicia el formulario al cambiar de negocio */}
        <BusinessForm
          key={business.id}
          initial={business}
          onSubmit={handleSubmit}
          submitLabel={saved && !isSaving ? 'Guardado ✓' : 'Guardar cambios'}
          isLoading={isSaving}
          error={error}
          readOnly={!canManage}
        />
      </Section>

      {canManage && (
        <Section title="Suscripción" description="Tu plan de AgendaBarrio y los pagos.">
          <SubscriptionSettings businessId={business.id} timezone={business.timezone} />
        </Section>
      )}

      <Section title="Zona horaria" description="Se usa para calcular la disponibilidad.">
        <p className="text-sm text-fg">Colombia (GMT-5) · {business.timezone}</p>
      </Section>
    </>
  )
}
