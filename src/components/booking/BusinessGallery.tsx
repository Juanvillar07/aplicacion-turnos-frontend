import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/** Fotos del negocio: fila deslizable y, al tocar una, vista ampliada. */
export function BusinessGallery({ photos, businessName }: { photos: { id: string; url: string }[]; businessName: string }) {
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % photos.length))
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, photos.length])

  if (photos.length === 0) return null

  return (
    <>
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpen(i)}
            className="shrink-0 cursor-zoom-in snap-start overflow-hidden rounded-lg border border-line"
            aria-label={`Ver foto ${i + 1} de ${photos.length}`}
          >
            <img
              src={photo.url}
              alt={`${businessName}, foto ${i + 1}`}
              loading="lazy"
              className={`h-40 object-cover transition-transform hover:scale-[1.03] ${photos.length === 1 ? 'w-[calc(100vw-2rem)] max-w-xl' : 'w-60'}`}
            />
          </button>
        ))}
      </div>

      {open !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Foto ${open + 1} de ${photos.length}`}
          >
            <img
              src={photos[open].url}
              alt={`${businessName}, foto ${open + 1}`}
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Cerrar"
              className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen((open - 1 + photos.length) % photos.length)
                  }}
                  className="absolute left-3 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Foto siguiente"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen((open + 1) % photos.length)
                  }}
                  className="absolute right-3 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronRight className="size-5" />
                </button>
                <span className="absolute bottom-4 text-sm text-white/70 tabular-nums">
                  {open + 1} / {photos.length}
                </span>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
