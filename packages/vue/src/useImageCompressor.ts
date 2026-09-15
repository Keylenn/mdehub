import { onUnmounted, ref, type Ref } from 'vue'
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
  progress: Ref<number>
  status: Ref<CompressStatus>
  error: Ref<Error | null>
  result: Ref<CompressResult | null>
}

/**
 * Compress images from Vue. Aborts in-flight work on unmount or `abort()`.
 */
export function useImageCompressor(
  options: Omit<CompressOptions, 'signal' | 'onProgress'> = {},
): UseImageCompressorResult {
  const progress = ref(0)
  const status = ref<CompressStatus>('idle')
  const error = ref<Error | null>(null)
  const result = ref<CompressResult | null>(null)
  let controller: AbortController | undefined

  const abort = () => {
    controller?.abort()
  }

  onUnmounted(abort)

  const compress = async (input: Blob | ArrayBuffer) => {
    abort()
    controller = new AbortController()
    const current = controller
    status.value = 'running'
    progress.value = 0
    error.value = null
    result.value = null

    try {
      const next = await compressImage(input, {
        ...options,
        signal: current.signal,
        onProgress: (value) => {
          progress.value = value
        },
      })
      if (current.signal.aborted) throw new CompressAbortError()
      result.value = next
      status.value = 'success'
      progress.value = 1
      return next
    } catch (caught) {
      const nextError =
        caught instanceof Error ? caught : new Error(String(caught))
      if (current.signal.aborted || nextError instanceof CompressAbortError) {
        status.value = 'idle'
        progress.value = 0
        throw nextError
      }
      error.value = nextError
      status.value = 'error'
      throw nextError
    }
  }

  return { compress, abort, progress, status, error, result }
}
