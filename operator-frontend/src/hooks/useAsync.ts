import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiClientError } from '@/api'

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const execute = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    fn()
      .then((result) => {
        setData(result)
        setError(null)
      })
      .catch((err: unknown) => {
        if (err instanceof ApiClientError) {
          setError(err.message)
        } else if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('予期しないエラーが発生しました')
        }
      })
      .finally(() => {
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    execute()
    return () => {
      abortRef.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute])

  return { data, loading, error, refetch: execute }
}
