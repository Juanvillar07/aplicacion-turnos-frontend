import { SearchX } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PublicLayout } from '@/layouts/PublicLayout'

export function NotFoundBusinessPage({
  title = 'No encontramos este negocio',
  description = 'Revisa que el enlace esté bien escrito o pídele al negocio su enlace de reservas.',
}: {
  title?: string
  description?: string
}) {
  return (
    <PublicLayout>
      <div className="pt-10">
        <EmptyState icon={SearchX} title={title} description={description} />
      </div>
    </PublicLayout>
  )
}
