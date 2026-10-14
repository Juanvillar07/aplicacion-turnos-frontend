import { ArrowLeft, ArrowRight, ExternalLink, ImagePlus, Trash2, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { Textarea } from '@/components/common/Textarea'
import { CATEGORIES } from '@/constants/business'
import { useAsync } from '@/hooks/useAsync'
import { getErrorMessage } from '@/services/api'
import { businessesService } from '@/services/businesses'
import { useBusinessStore } from '@/store/businessStore'
import { toast } from '@/store/toastStore'
import type { Business, BusinessPhoto } from '@/types/business'

const MAX_BYTES = 5 * 1024 * 1024
const MAX_PHOTOS = 8
const ACCEPT = 'image/jpeg,image/png,image/webp'

/** Valida en el navegador antes de subir (el backend vuelve a validar) */
function checkImage(file: File): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return 'La imagen debe ser JPG, PNG o WebP'
  }
  if (file.size > MAX_BYTES) return 'La imagen pesa más de 5 MB'
  return null
}

/** Botón que abre el selector de archivos */
function FilePicker({
  onPick,
  children,
  disabled,
  className,
}: {
  onPick: (file: File) => void
  children: ReactNode
  disabled?: boolean
  className?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          e.target.value = '' // permite volver a elegir el mismo archivo
          if (file) onPick(file)
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className={className}
      >
        {children}
      </button>
    </>
  )
}

function LogoEditor({ business }: { business: Business }) {
  const replaceBusiness = useBusinessStore((s) => s.replaceBusiness)
  const [isBusy, setIsBusy] = useState(false)
  const Icon = CATEGORIES[business.category].icon

  const run = async (action: () => Promise<Business>, success: string) => {
    setIsBusy(true)
    try {
      replaceBusiness(await action())
      toast.success(success)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsBusy(false)
    }
  }

  const upload = (file: File) => {
    const problem = checkImage(file)
    if (problem) return toast.error(problem)
    void run(() => businessesService.uploadLogo(business.id, file), 'Logo actualizado')
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt="Logo del negocio"
            className="size-20 rounded-xl border border-line object-cover"
          />
        ) : (
          <span className="flex size-20 items-center justify-center rounded-xl border border-dashed border-line-strong text-fg-subtle">
            <Icon className="size-8" />
          </span>
        )}
        {isBusy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
            <Spinner className="size-5" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <FilePicker
            onPick={upload}
            disabled={isBusy}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-line-strong bg-surface-2 px-3 text-[13px] font-medium text-fg hover:bg-line disabled:opacity-60"
          >
            <Upload className="size-3.5" /> {business.logoUrl ? 'Cambiar logo' : 'Subir logo'}
          </FilePicker>
          {business.logoUrl && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => run(() => businessesService.removeLogo(business.id), 'Logo quitado')}
            >
              Quitar
            </Button>
          )}
        </div>
        <p className="text-xs text-fg-subtle">Cuadrado, JPG, PNG o WebP de hasta 5 MB.</p>
      </div>
    </div>
  )
}

function PhotosEditor({ businessId }: { businessId: string }) {
  const loaded = useAsync<BusinessPhoto[]>(`photos|${businessId}`, () => businessesService.photos(businessId), [])
  const [photos, setPhotos] = useState<BusinessPhoto[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const list = photos ?? loaded.data

  const run = async (id: string, action: () => Promise<BusinessPhoto[]>, success?: string) => {
    setBusy(id)
    try {
      setPhotos(await action())
      if (success) toast.success(success)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const add = (file: File) => {
    const problem = checkImage(file)
    if (problem) return toast.error(problem)
    void run('new', () => businessesService.addPhoto(businessId, file), 'Foto agregada')
  }

  const move = (index: number, delta: number) => {
    const ids = list.map((p) => p.id)
    const [moved] = ids.splice(index, 1)
    ids.splice(index + delta, 0, moved)
    void run(moved, () => businessesService.reorderPhotos(businessId, ids))
  }

  if (loaded.isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {list.map((photo, i) => (
          <div key={photo.id} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-line">
            <img src={photo.url} alt={`Foto ${i + 1}`} className="size-full object-cover" />
            {busy === photo.id ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Spinner className="size-5" />
              </span>
            ) : (
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/70 to-transparent p-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Mover a la izquierda"
                    disabled={i === 0 || busy !== null}
                    onClick={() => move(i, -1)}
                    className="cursor-pointer rounded bg-black/50 p-1 text-white hover:bg-black/70 disabled:opacity-30"
                  >
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Mover a la derecha"
                    disabled={i === list.length - 1 || busy !== null}
                    onClick={() => move(i, 1)}
                    className="cursor-pointer rounded bg-black/50 p-1 text-white hover:bg-black/70 disabled:opacity-30"
                  >
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Borrar foto"
                  disabled={busy !== null}
                  onClick={() => run(photo.id, () => businessesService.removePhoto(businessId, photo.id), 'Foto borrada')}
                  className="cursor-pointer rounded bg-black/50 p-1 text-white hover:bg-danger disabled:opacity-30"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
        {list.length < MAX_PHOTOS && (
          <FilePicker
            onPick={add}
            disabled={busy !== null}
            className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-line-strong text-sm text-fg-muted transition-colors hover:border-brand hover:text-fg disabled:opacity-60"
          >
            {busy === 'new' ? <Spinner className="size-5" /> : <ImagePlus className="size-5" />}
            Agregar foto
          </FilePicker>
        )}
      </div>
      <p className="text-xs text-fg-subtle">
        Hasta {MAX_PHOTOS} fotos (JPG, PNG o WebP, máx. 5 MB). La primera es la que se ve primero.
      </p>
    </div>
  )
}

/** Configuración → "Página pública": lo que ven los clientes en /b/:slug. */
export function PublicProfileSettings({ business }: { business: Business }) {
  const updateBusiness = useBusinessStore((s) => s.updateBusiness)
  const [description, setDescription] = useState(business.description ?? '')
  const [instagramUrl, setInstagramUrl] = useState(business.instagramUrl ?? '')
  const [facebookUrl, setFacebookUrl] = useState(business.facebookUrl ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(business.websiteUrl ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      await updateBusiness({ description, instagramUrl, facebookUrl, websiteUrl })
      toast.success('Página pública actualizada')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <LogoEditor business={business} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Textarea
            label="Descripción"
            placeholder="Cuéntales a tus clientes qué te hace especial: experiencia, especialidades, ambiente…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={600}
            rows={4}
          />
          <p className="text-right text-xs text-fg-subtle tabular-nums">{description.length}/600</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Instagram"
            type="url"
            placeholder="https://instagram.com/tunegocio"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
          <Input
            label="Facebook"
            type="url"
            placeholder="https://facebook.com/tunegocio"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
          />
          <Input
            label="Sitio web"
            type="url"
            placeholder="https://tunegocio.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <a
            href={`/b/${business.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
          >
            Ver mi página <ExternalLink className="size-3.5" />
          </a>
          <Button type="submit" isLoading={isSaving}>
            Guardar
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-2 border-t border-line pt-5">
        <p className="text-sm text-fg-muted">Fotos</p>
        <PhotosEditor businessId={business.id} />
      </div>
    </div>
  )
}
