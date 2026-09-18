import { throwIfAborted } from './errors'

/** A heuristic, not a content classifier: photos can also have few colors. */
export function looksLikeScreenshot(image: ImageData): boolean {
  const colors = new Set<number>()
  const pixels = image.width * image.height
  const step = Math.max(1, Math.ceil(pixels / 12000))
  let visible = 0
  for (let pixel = 0; pixel < pixels; pixel += step) {
    const i = pixel * 4
    if (image.data[i + 3] === 0) continue
    visible++
    colors.add((((image.data[i] ?? 0) >> 3) << 10)
      | (((image.data[i + 1] ?? 0) >> 3) << 5) | ((image.data[i + 2] ?? 0) >> 3))
    if (colors.size > 256) return false
  }
  return visible > 0
}

/** Best-effort search; never lower quality below the caller's floor. */
export async function encodeToTarget(
  encode: (quality: number) => Promise<ArrayBuffer>,
  quality: number,
  minQuality: number,
  targetBytes: number,
  signal?: AbortSignal,
  onProgress?: (progress: number) => void,
): Promise<ArrayBuffer> {
  let attempts = 0
  const encodeAt = async (q: number) => {
    throwIfAborted(signal)
    const bytes = await encode(q)
    throwIfAborted(signal)
    onProgress?.(++attempts / 9)
    return bytes
  }
  // Avoid repeated encodes when the requested quality already meets the target.
  const initial = await encodeAt(quality)
  if (initial.byteLength <= targetBytes) return initial
  const floor = Math.min(quality, minQuality)
  if (floor === quality) return initial
  const minimum = await encodeAt(floor)
  if (minimum.byteLength > targetBytes) {
    return minimum.byteLength < initial.byteLength ? minimum : initial
  }
  let best = minimum
  let low = floor + 1
  let high = quality - 1
  for (let attempt = 0; attempt < 7 && low <= high; attempt++) {
    const candidateQuality = Math.floor((low + high) / 2)
    const candidate = await encodeAt(candidateQuality)
    if (candidate.byteLength <= targetBytes) {
      best = candidate
      low = candidateQuality + 1
    } else {
      high = candidateQuality - 1
    }
  }
  return best
}
