import { processCompress } from './pipeline'
import { resolveOptions } from './dimensions'
import { CompressAbortError, CompressError } from './errors'
import { compressInWorker } from './worker-client'
import type {
  CompressOptions,
  CompressPayload,
  CompressPayloadResult,
  CompressResult,
} from './types'

function isBlob(input: Blob | ArrayBuffer): input is Blob {
  return typeof Blob !== 'undefined' && input instanceof Blob
}

async function toPayload(
  input: Blob | ArrayBuffer,
  options: ReturnType<typeof resolveOptions>,
): Promise<CompressPayload> {
  if (isBlob(input)) {
    return {
      smart: options.smart,
      buffer: await input.arrayBuffer(),
      hintMime: input.type || undefined,
      mimeType: options.mimeType,
      quality: options.quality,
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      signal: options.signal,
      onProgress: options.onProgress,
    }
  }
  return {
    smart: options.smart,
    buffer: input,
    hintMime: undefined,
    mimeType: options.mimeType,
    quality: options.quality,
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight,
    signal: options.signal,
    onProgress: options.onProgress,
  }
}

function toResult(payloadResult: CompressPayloadResult): CompressResult {
  return {
    smart: payloadResult.smart ?? false,
    blob: new Blob([payloadResult.buffer], { type: payloadResult.mimeType }),
    width: payloadResult.width,
    height: payloadResult.height,
    bytesBefore: payloadResult.bytesBefore,
    bytesAfter: payloadResult.bytesAfter,
  }
}

/**
 * Compress an image with Squoosh-derived WASM codecs.
 *
 * @param input - Image bytes or a Blob/File
 * @param options - Output type, quality, max dimensions, abort, worker
 */
export async function compressImage(
  input: Blob | ArrayBuffer,
  options: CompressOptions = {},
): Promise<CompressResult> {
  const resolved = resolveOptions(options)
  const payload = await toPayload(input, resolved)

  if (!resolved.preferWorker) {
    return toResult(await processCompress(payload))
  }

  try {
    return toResult(await compressInWorker(payload))
  } catch (error) {
    if (error instanceof CompressAbortError) throw error
    if (error instanceof CompressError && error.message === 'Workers are unavailable') {
      return toResult(await processCompress(payload))
    }
    throw error
  }
}
