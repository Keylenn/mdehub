import { decodeImage, encodeImage, maybeResize } from './codecs'
import { detectMime, normalizeHintMime } from './detect'
import { computeTargetSize } from './dimensions'
import { encodeToTarget, looksLikeScreenshot } from './smart'
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
  const smart = Boolean(payload.smart && mime === 'image/png'
    && payload.mimeType === 'image/webp' && looksLikeScreenshot(resized))
  const encode = (quality: number) => encodeImage(resized, payload.mimeType, quality)
  const encoded = smart && payload.smart
    ? await encodeToTarget(
      encode,
      payload.quality,
      payload.smart.minQuality,
      Math.max(2048, Math.round(bytesBefore * payload.smart.targetRatio)),
      signal,
      (progress) => report(onProgress, 0.8 + progress * 0.19),
    )
    : await encode(payload.quality)

  throwIfAborted(signal)
  report(onProgress, 1)
  return {
    smart,
    buffer: encoded,
    mimeType: payload.mimeType,
    width: resized.width,
    height: resized.height,
    bytesBefore,
    bytesAfter: encoded.byteLength,
  }
}
