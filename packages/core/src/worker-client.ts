import { CompressAbortError, CompressError } from './errors'
import type {
  CompressPayload,
  CompressPayloadResult,
  WorkerRequest,
  WorkerResponse,
} from './types'

let worker: Worker | undefined
let nextId = 1

function canUseWorker(): boolean {
  return typeof Worker !== 'undefined' && typeof document !== 'undefined'
}

function getWorker(): Worker {
  if (worker) return worker
  worker = new Worker(new URL('./compress.worker.js', import.meta.url), {
    type: 'module',
  })
  return worker
}

export function resetWorker(): void {
  worker?.terminate()
  worker = undefined
}

export function compressInWorker(
  payload: CompressPayload,
): Promise<CompressPayloadResult> {
  if (!canUseWorker()) {
    return Promise.reject(new CompressError('Workers are unavailable'))
  }

  const id = nextId++
  const buffer = payload.buffer.slice(0)
  const request: WorkerRequest = {
    id,
    buffer,
    hintMime: payload.hintMime,
    mimeType: payload.mimeType,
    quality: payload.quality,
    maxWidth: payload.maxWidth,
    maxHeight: payload.maxHeight,
  }

  return new Promise((resolve, reject) => {
    const current = getWorker()

    const cleanup = () => {
      current.removeEventListener('message', onMessage)
      current.removeEventListener('error', onError)
      payload.signal?.removeEventListener('abort', onAbort)
    }

    const onAbort = () => {
      cleanup()
      resetWorker()
      reject(new CompressAbortError())
    }

    const onError = (event: ErrorEvent) => {
      cleanup()
      resetWorker()
      reject(new CompressError(event.message || 'Compression worker failed'))
    }

    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data
      if (data.id !== id) return
      if (data.type === 'progress') {
        payload.onProgress?.(data.progress)
        return
      }
      cleanup()
      if (data.type === 'success') {
        resolve(data.result)
        return
      }
      reject(new CompressError(data.message))
    }

    if (payload.signal?.aborted) {
      onAbort()
      return
    }

    current.addEventListener('message', onMessage)
    current.addEventListener('error', onError)
    payload.signal?.addEventListener('abort', onAbort, { once: true })
    current.postMessage(request, [buffer])
  })
}
