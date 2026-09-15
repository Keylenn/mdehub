import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useImageCompressor } from './useImageCompressor'

const compressImage = vi.fn()

vi.mock('@mdehub/core', async () => {
  const actual = await vi.importActual<typeof import('@mdehub/core')>('@mdehub/core')
  return {
    ...actual,
    compressImage: (...args: unknown[]) => compressImage(...args),
  }
})

describe('useImageCompressor', () => {
  beforeEach(() => {
    compressImage.mockReset()
  })

  it('exposes idle state', () => {
    const { result } = renderHook(() => useImageCompressor())
    expect(result.current.status).toBe('idle')
    expect(result.current.progress).toBe(0)
  })

  it('stores a successful result', async () => {
    const payload = {
      blob: new Blob(['ok'], { type: 'image/webp' }),
      width: 10,
      height: 10,
      bytesBefore: 20,
      bytesAfter: 4,
    }
    compressImage.mockResolvedValue(payload)
    const { result } = renderHook(() => useImageCompressor())

    await act(async () => {
      await result.current.compress(new ArrayBuffer(8))
    })

    expect(result.current.status).toBe('success')
    expect(result.current.result).toEqual(payload)
  })
})
