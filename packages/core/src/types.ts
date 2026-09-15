export type OutputMimeType = 'image/webp' | 'image/jpeg' | 'image/png'

export type InputMimeType =
  | OutputMimeType
  | 'image/gif'
  | 'image/bmp'
  | 'image/avif'

export type CompressOptions = {
  mimeType?: OutputMimeType
  quality?: number
  maxWidth?: number
  maxHeight?: number
  signal?: AbortSignal
  onProgress?: (progress: number) => void
  preferWorker?: boolean
}

export type CompressResult = {
  blob: Blob
  width: number
  height: number
  bytesBefore: number
  bytesAfter: number
}

export type ResolvedCompressOptions = {
  mimeType: OutputMimeType
  quality: number
  maxWidth: number | undefined
  maxHeight: number | undefined
  signal: AbortSignal | undefined
  onProgress: ((progress: number) => void) | undefined
  preferWorker: boolean
}

export type CompressPayload = {
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
  buffer: ArrayBuffer
  mimeType: OutputMimeType
  width: number
  height: number
  bytesBefore: number
  bytesAfter: number
}

export type WorkerRequest = {
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
