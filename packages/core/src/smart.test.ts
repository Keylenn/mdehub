import { describe, expect, it, vi } from 'vitest'
import { encodeToTarget, looksLikeScreenshot } from './smart'
import { resolveOptions } from './dimensions'
import { CompressAbortError } from './errors'

function image(colors: number, alpha = 255): ImageData {
  const data = new Uint8ClampedArray(colors * 4)
  for (let i = 0; i < colors; i++) {
    data.set([(i >> 10) << 3, ((i >> 5) & 31) << 3, (i & 31) << 3, alpha], i * 4)
  }
  return { data, width: colors, height: 1, colorSpace: 'srgb' }
}

describe('screenshot heuristic', () => {
  it('accepts low-color images but rejects rich colors and invisible images', () => {
    expect(looksLikeScreenshot(image(256))).toBe(true)
    expect(looksLikeScreenshot(image(257))).toBe(false)
    expect(looksLikeScreenshot(image(10, 0))).toBe(false)
  })
})

describe('smart options', () => {
  it('is opt-in and normalizes invalid values', () => {
    expect(resolveOptions({}).smart).toBe(false)
    expect(resolveOptions({ smart: true }).smart).toEqual({ targetRatio: 0.14, minQuality: 40 })
    expect(resolveOptions({ smart: { targetRatio: NaN, minQuality: Infinity } }).smart)
      .toEqual({ targetRatio: 0.14, minQuality: 40 })
    expect(resolveOptions({ smart: { targetRatio: 0.3, minQuality: 60 } }).smart)
      .toEqual({ targetRatio: 0.3, minQuality: 60 })
  })
})

describe('target-size encoding', () => {
  it('finds the highest fitting integer quality with bounded attempts', async () => {
    const encode = vi.fn(async (quality: number) => new ArrayBuffer(quality * 100))
    const result = await encodeToTarget(encode, 80, 40, 6350)
    expect(result.byteLength).toBe(6300)
    expect(encode.mock.calls.length).toBeLessThanOrEqual(9)
  })

  it('only encodes once if requested quality already fits', async () => {
    const encode = vi.fn(async () => new ArrayBuffer(1000))
    await encodeToTarget(encode, 80, 40, 2048)
    expect(encode).toHaveBeenCalledTimes(1)
  })

  it('respects the floor when the target is impossible', async () => {
    const encode = vi.fn(async (quality: number) => new ArrayBuffer(quality * 100))
    expect((await encodeToTarget(encode, 80, 40, 1000)).byteLength).toBe(4000)
    expect(encode.mock.calls.map(([q]) => q)).toEqual([80, 40])
  })

  it('does not increase quality when the requested quality is below the floor', async () => {
    const encode = vi.fn(async (quality: number) => new ArrayBuffer(quality * 100))
    await encodeToTarget(encode, 20, 40, 1000)
    expect(encode.mock.calls.map(([q]) => q)).toEqual([20])
  })

  it('checks cancellation after each encode', async () => {
    const controller = new AbortController()
    const encode = vi.fn(async () => {
      controller.abort()
      return new ArrayBuffer(10000)
    })
    await expect(encodeToTarget(encode, 80, 40, 2048, controller.signal))
      .rejects.toBeInstanceOf(CompressAbortError)
    expect(encode).toHaveBeenCalledTimes(1)
  })
})
