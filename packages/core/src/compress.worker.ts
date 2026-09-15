import { processCompress } from './pipeline'
import type { WorkerRequest, WorkerResponse } from './types'

type WorkerScope = {
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<WorkerRequest>) => void,
  ) => void
  postMessage: (message: WorkerResponse, transfer?: Transferable[]) => void
}

const scope = globalThis as unknown as WorkerScope

scope.addEventListener('message', async (event) => {
  const { id, ...rest } = event.data
  try {
    const result = await processCompress({
      buffer: rest.buffer,
      hintMime: rest.hintMime,
      mimeType: rest.mimeType,
      quality: rest.quality,
      maxWidth: rest.maxWidth,
      maxHeight: rest.maxHeight,
      signal: undefined,
      onProgress: (progress) => {
        scope.postMessage({ id, type: 'progress', progress })
      },
    })
    scope.postMessage({ id, type: 'success', result }, [result.buffer])
  } catch (error) {
    scope.postMessage({
      id,
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    })
  }
})
