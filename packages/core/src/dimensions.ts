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

export function resolveOptions(options: {
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png'
  quality?: number
  maxWidth?: number
  maxHeight?: number
  signal?: AbortSignal
  onProgress?: (progress: number) => void
  preferWorker?: boolean
}): {
  mimeType: 'image/webp' | 'image/jpeg' | 'image/png'
  quality: number
  maxWidth: number | undefined
  maxHeight: number | undefined
  signal: AbortSignal | undefined
  onProgress: ((progress: number) => void) | undefined
  preferWorker: boolean
} {
  return {
    mimeType: options.mimeType ?? 'image/webp',
    quality: clampQuality(options.quality ?? 80),
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight,
    signal: options.signal,
    onProgress: options.onProgress,
    preferWorker: options.preferWorker ?? true,
  }
}
