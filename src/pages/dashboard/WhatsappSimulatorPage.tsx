import { ChevronDown, List, RotateCcw, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { fieldClass } from '@/components/common/Input'
import { PageHeader } from '@/components/common/PageHeader'
import { Spinner } from '@/components/common/Spinner'
import { useActiveBusiness } from '@/hooks/useActiveBusiness'
import { getErrorMessage } from '@/services/api'
import { whatsappService, type BotMessage } from '@/services/whatsapp'

type ChatItem =
  | { id: number; from: 'user'; text: string }
  | { id: number; from: 'bot'; message: BotMessage }

let nextId = 1

/** Convierte el *negrita* de WhatsApp en <strong> y respeta los saltos de línea */
function WhatsappText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*\n]+\*)/g)
  return (
    <p className="text-sm whitespace-pre-wrap text-fg">
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <strong key={i}>{part.slice(1, -1)}</strong>
        ) : (
          part
        ),
      )}
    </p>
  )
}

function Bubble({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
          side === 'right' ? 'rounded-tr-none bg-[#144d37]' : 'rounded-tl-none bg-surface-2'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

function BotBubble({
  message,
  onReply,
}: {
  message: BotMessage
  onReply: (id: string, title: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <Bubble side="left">
        {message.kind === 'template' && (
          <p className="mb-1 text-[11px] text-amber-400">Plantilla: {message.name}</p>
        )}
        <WhatsappText text={message.text} />
      </Bubble>

      {message.kind === 'buttons' && (
        <div className="flex max-w-[85%] flex-col gap-1">
          {message.buttons.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onReply(b.id, b.title)}
              className="cursor-pointer rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-sky-400 hover:bg-line"
            >
              {b.title}
            </button>
          ))}
        </div>
      )}

      {message.kind === 'list' && (
        <div className="max-w-[85%]">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-sky-400 hover:bg-line"
          >
            <List className="size-4" /> {message.button}
            <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <ul className="mt-1 divide-y divide-line overflow-hidden rounded-lg bg-surface-2">
              {message.rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      onReply(r.id, r.title)
                    }}
                    className="w-full cursor-pointer px-3 py-2 text-left hover:bg-line"
                  >
                    <span className="block text-sm text-fg">{r.title}</span>
                    {r.description && (
                      <span className="block text-xs text-fg-subtle">{r.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/** Conversa con el bot de WhatsApp sin la API de Meta (solo en desarrollo). */
export function WhatsappSimulatorPage() {
  const { business } = useActiveBusiness()
  const [phone, setPhone] = useState('+573000000001')
  const [profileName, setProfileName] = useState('Cliente de prueba')
  const [items, setItems] = useState<ChatItem[]>([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [items, isSending])

  const send = async (payload: { text?: string; replyId?: string }, shown: string) => {
    setItems((prev) => [...prev, { id: nextId++, from: 'user', text: shown }])
    setIsSending(true)
    setError(null)
    try {
      const messages = await whatsappService.simulate({ phone, profileName, ...payload })
      setItems((prev) => [
        ...prev,
        ...messages.map((message) => ({ id: nextId++, from: 'bot' as const, message })),
      ])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || isSending) return
    setDraft('')
    void send({ text }, text)
  }

  const startWithLink = () => {
    setItems([])
    const text = `Hola, quiero reservar en ${business.slug}`
    void send({ text }, text)
  }

  return (
    <>
      <PageHeader
        title="Simulador de WhatsApp"
        description="Prueba el asistente de reservas como si fueras un cliente. Solo disponible en desarrollo: no se envían mensajes reales."
      />

      {!business.whatsappEnabled && (
        <div className="mb-4">
          <Alert message="WhatsApp está desactivado para este negocio: actívalo en Configuración para que el asistente lo encuentre." />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="flex h-[620px] flex-col overflow-hidden rounded-xl border border-line bg-[#0b141a]">
          <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
              AB
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">AgendaBarrio</p>
              <p className="text-xs text-fg-subtle">{isSending ? 'escribiendo…' : 'en línea'}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setItems([])} title="Limpiar pantalla">
              <RotateCcw className="size-3.5" />
            </Button>
          </header>

          <div ref={scroller} className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
            {items.length === 0 && (
              <p className="m-auto max-w-xs text-center text-sm text-fg-subtle">
                Escribe "hola" o usa "Empezar con el enlace del negocio" para simular que el
                cliente llega desde tu enlace de WhatsApp.
              </p>
            )}
            {items.map((item) =>
              item.from === 'user' ? (
                <Bubble key={item.id} side="right">
                  <WhatsappText text={item.text} />
                </Bubble>
              ) : (
                <BotBubble
                  key={item.id}
                  message={item.message}
                  onReply={(replyId, title) => void send({ replyId }, title)}
                />
              ),
            )}
            {isSending && (
              <div className="flex justify-start">
                <Spinner className="size-4" />
              </div>
            )}
          </div>

          {error && (
            <div className="px-4 pb-2">
              <Alert message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-line bg-surface p-3">
            <input
              aria-label="Mensaje"
              placeholder="Escribe un mensaje"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={`h-10 ${fieldClass}`}
            />
            <Button type="submit" disabled={!draft.trim() || isSending} className="h-10">
              <SendHorizontal className="size-4" />
            </Button>
          </form>
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="sim-phone" className="text-sm text-fg-muted">
              Celular del cliente
            </label>
            <input
              id="sim-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`h-9 ${fieldClass}`}
            />
            <p className="text-xs text-fg-subtle">
              Cambiarlo simula a otro cliente. Las reservas que hagas aquí son reales en tu agenda.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="sim-name" className="text-sm text-fg-muted">
              Nombre del perfil de WhatsApp
            </label>
            <input
              id="sim-name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className={`h-9 ${fieldClass}`}
            />
          </div>
          <Button variant="secondary" onClick={startWithLink} disabled={isSending}>
            Empezar con el enlace del negocio
          </Button>
        </aside>
      </div>
    </>
  )
}
