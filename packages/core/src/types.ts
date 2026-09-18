export type OutputMimeType = 'image/webp' | 'image/jpeg' | 'image/png'

export type InputMimeType =
  | OutputMimeType
  | 'image/gif'
  | 'image/bmp'
  | 'image/avif'

export type SmartCompressOptions = {
  /** Target fraction of the input size, defaults to 0.14. Best effort. */
  targetRatio?: number
  /** Quality floor, defaults to 40 (never exceeds the requested quality). */
  minQuality?: number
}

export type CompressOptions = {
  /** Opt-in target-size compression for low-color PNG screenshots to WebP. */
  smart?: boolean | SmartCompressOptions
  mimeType?: OutputMimeType
  quality?: number
  maxWidth?: number
  maxHeight?: number
  signal?: AbortSignal
  onProgress?: (progress: number) => void
  preferWorker?: boolean
}

export type CompressResult = {
  /** Whether screenshot target-size compression was used. */
  smart?: boolean
  blob: Blob
  width: number
  height: number
  bytesBefore: number
  bytesAfter: number
}

export type ResolvedCompressOptions = {
  smart: Required<SmartCompressOptions> | false
  mimeType: OutputMimeType
  quality: number
  maxWidth: number | undefined
  maxHeight: number | undefined
  signal: AbortSignal | undefined
  onProgress: ((progress: number) => void) | undefined
  preferWorker: boolean
}

export type CompressPayload = {
  smart?: Required<SmartCompressOptions> | false
  buffer: ArrayBuffer
  hintMime: string | undefined
  mimeType: OutputMimeType
  quality: number
  maxWidth: number | undefined
  maxHeight: number | undefined
  signal: AbortSignal | undefined
  onProgress: ((progress: number) => void) | undefined
}

export type CompressPayloadResult = {
  smart?: boolean
  buffer: ArrayBuffer
  mimeType: OutputMimeType
  width: number
  height: number
  bytesBefore: number
  bytesAfter: number
}

export type WorkerRequest = {
  smart?: Required<SmartCompressOptions> | false
  id: number
  buffer: ArrayBuffer
  hintMime: string | undefined
  mimeType: OutputMimeType
  quality: number
  maxWidth: number | undefined
  maxHeight: number | undefined
}

export type WorkerResponse =
  | { id: number; type: 'progress'; progress: number }
  | { id: number; type: 'success'; result: CompressPayloadResult }
  | { id: number; type: 'error'; message: string }
