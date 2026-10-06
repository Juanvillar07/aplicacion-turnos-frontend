interface AlertProps {
  message: string
}

export function Alert({ message }: AlertProps) {
  return (
    <div
      role="alert"
      className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      {message}
    </div>
  )
}
