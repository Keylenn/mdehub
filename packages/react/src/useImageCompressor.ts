import { useCallback, useEffect, useRef, useState } from 'react'
import {
  compressImage,
  CompressAbortError,
  type CompressOptions,
  type CompressResult,
} from '@mdehub/core'

export type CompressStatus = 'idle' | 'running' | 'success' | 'error'

export type UseImageCompressorResult = {
  compress: (input: Blob | ArrayBuffer) => Promise<CompressResult>
  abort: () => void
  progress: number
  status: CompressStatus
  error: Error | null
  result: CompressResult | null
}

/**
 * Compress images from React. Aborts in-flight work on unmount or `abort()`.
 */
export function useImageCompressor(
  options: Omit<CompressOptions, 'signal' | 'onProgress'> = {},
): UseImageCompressorResult {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<CompressStatus>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<CompressResult | null>(null)
  const controllerRef = useRef<AbortController | undefined>(undefined)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const abort = useCallback(() => {
    controllerRef.current?.abort()
  }, [])

  useEffect(() => abort, [abort])

  const compress = useCallback(async (input: Blob | ArrayBuffer) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setStatus('running')
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const next = await compressImage(input, {
        ...optionsRef.current,
        signal: controller.signal,
        onProgress: setProgress,
      })
      if (controller.signal.aborted) throw new CompressAbortError()
      setResult(next)
      setStatus('success')
      setProgress(1)
      return next
    } catch (caught) {
      const nextError =
        caught instanceof Error ? caught : new Error(String(caught))
      if (controller.signal.aborted || nextError instanceof CompressAbortError) {
        setStatus('idle')
        setProgress(0)
        throw nextError
      }
      setError(nextError)
      setStatus('error')
      throw nextError
    }
  }, [])

  return { compress, abort, progress, status, error, result }
}
