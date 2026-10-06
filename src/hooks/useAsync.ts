import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/services/api'

export interface AsyncState<T> {
  data: T
  isLoading: boolean
  error: string | null
}

/**
 * Carga datos asíncronos ignorando respuestas viejas si cambian los parámetros.
 * `key` resume los parámetros de la carga; `null` la desactiva.
 */
export function useAsync<T>(key: string | null, load: () => Promise<T>, initial: T): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T> & { key: string | null }>({
    data: initial,
    isLoading: key !== null,
    error: null,
    key,
  })

  // Si cambian los parámetros se vuelve a "cargando" durante el render
  if (state.key !== key) {
    setState({ data: initial, isLoading: key !== null, error: null, key })
  }

  useEffect(() => {
    if (key === null) return
    let cancelled = false
    load()
      .then((data) => !cancelled && setState({ data, isLoading: false, error: null, key }))
      .catch(
        (err) =>
          !cancelled &&
          setState({ data: initial, isLoading: false, error: getErrorMessage(err), key }),
      )
    return () => {
      cancelled = true
    }
    // `load` e `initial` dependen solo de `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { data: state.data, isLoading: state.isLoading, error: state.error }
}
