import { beforeEach, describe, expect, it, vi } from 'vitest'
import { decodeImage, encodeImage, maybeResize } from './codecs'
import { processCompress } from './pipeline'
import { resolveOptions } from './dimensions'

vi.mock('./codecs', () => ({
  decodeImage: vi.fn(),
  encodeImage: vi.fn(),
  maybeResize: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  const image = { width: 1, height: 1, data: new Uint8ClampedArray([0, 0, 0, 255]), colorSpace: 'srgb' } as ImageData
  vi.mocked(decodeImage).mockResolvedValue(image)
  vi.mocked(maybeResize).mockResolvedValue(image)
  vi.mocked(encodeImage).mockImplementation(async (_, __, quality) => new ArrayBuffer(quality * 100))
})

describe('smart compression pipeline', () => {
  it('searches only for opted-in PNG to WebP and reports monotonic progress', async () => {
    const progress: number[] = []
    const result = await processCompress({
      ...resolveOptions({ smart: { targetRatio: 0.5 }, onProgress: p => progress.push(p) }),
      buffer: new ArrayBuffer(10000),
      hintMime: 'image/png',
    })
    expect(result.smart).toBe(true)
    expect(result.bytesAfter).toBe(5000)
    expect(result.bytesBefore).toBe(10000)
    expect(progress.at(-1)).toBe(1)
    expect(progress).toEqual([...progress].sort((a, b) => a - b))
  })

  it.each([
    [false, 'image/png', 'image/webp'],
    [true, 'image/jpeg', 'image/webp'],
    [true, 'image/png', 'image/png'],
  ] as const)('keeps single-pass encoding for smart=%s, %s to %s', async (smart, hintMime, mimeType) => {
    const result = await processCompress({
      ...resolveOptions({ smart, mimeType }), buffer: new ArrayBuffer(10000), hintMime,
    })
    expect(result.smart).toBe(false)
    expect(encodeImage).toHaveBeenCalledTimes(1)
  })
})
