import { decodeImage, encodeImage, maybeResize } from './codecs'
import { detectMime, normalizeHintMime } from './detect'
import { computeTargetSize } from './dimensions'
import { CompressError, throwIfAborted } from './errors'
import type { CompressPayload, CompressPayloadResult, InputMimeType } from './types'

function report(
  onProgress: ((progress: number) => void) | undefined,
  progress: number,
): void {
  onProgress?.(progress)
}

export async function processCompress(
  payload: CompressPayload,
): Promise<CompressPayloadResult> {
  const { buffer, signal, onProgress } = payload
  const bytesBefore = buffer.byteLength
  if (bytesBefore === 0) throw new CompressError('Empty image buffer')

  throwIfAborted(signal)
  report(onProgress, 0.1)

  const mime = (detectMime(buffer) ??
    normalizeHintMime(payload.hintMime)) as InputMimeType | undefined

  throwIfAborted(signal)
  report(onProgress, 0.25)
  const decoded = await decodeImage(buffer, mime)

  throwIfAborted(signal)
  const target = computeTargetSize(
    decoded.width,
    decoded.height,
    payload.maxWidth,
    payload.maxHeight,
  )
  report(onProgress, 0.55)
  const resized = await maybeResize(decoded, target.width, target.height)

  throwIfAborted(signal)
  report(onProgress, 0.8)
  const encoded = await encodeImage(resized, payload.mimeType, payload.quality)

  report(onProgress, 1)
  return {
    buffer: encoded,
    mimeType: payload.mimeType,
    width: resized.width,
    height: resized.height,
    bytesBefore,
    bytesAfter: encoded.byteLength,
  }
}
