export class CompressAbortError extends Error {
  constructor(message = 'Image compression aborted') {
    super(message)
    this.name = 'CompressAbortError'
  }
}

export class CompressError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'CompressError'
  }
}

export function throwIfAborted(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) return
  throw new CompressAbortError()
}
