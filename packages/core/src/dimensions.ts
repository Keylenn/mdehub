import type { CompressOptions, ResolvedCompressOptions } from './types'

export function clampQuality(quality: number): number {
  if (!Number.isFinite(quality)) return 80
  return Math.min(100, Math.max(1, Math.round(quality)))
}

export function computeTargetSize(
  width: number,
  height: number,
  maxWidth: number | undefined,
  maxHeight: number | undefined,
): { width: number; height: number } {
  const scale = Math.min(
    maxWidth !== undefined ? maxWidth / width : 1,
    maxHeight !== undefined ? maxHeight / height : 1,
    1,
  )
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export function resolveOptions(options: CompressOptions): ResolvedCompressOptions {
  const smart = typeof options.smart === 'object' ? options.smart : {}
  const ratio = smart.targetRatio ?? 0.14
  return {
    smart: options.smart ? {
      targetRatio: Number.isFinite(ratio) && ratio > 0 && ratio <= 1 ? ratio : 0.14,
      minQuality: Number.isFinite(smart.minQuality ?? 40)
        ? clampQuality(smart.minQuality ?? 40) : 40,
    } : false,
    mimeType: options.mimeType ?? 'image/webp',
    quality: clampQuality(options.quality ?? 80),
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight,
    signal: options.signal,
    onProgress: options.onProgress,
    preferWorker: options.preferWorker ?? true,
  }
}
