import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
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

  it('stores a successful result', async () => {
    const payload = {
      blob: new Blob(['ok'], { type: 'image/webp' }),
      width: 10,
      height: 10,
      bytesBefore: 20,
      bytesAfter: 4,
    }
    compressImage.mockResolvedValue(payload)

    let api: ReturnType<typeof useImageCompressor> | undefined
    const Comp = defineComponent({
      setup() {
        api = useImageCompressor()
        return () => null
      },
    })
    mount(Comp)
    if (!api) throw new Error('hook missing')
    await api.compress(new ArrayBuffer(8))
    expect(api.status.value).toBe('success')
    expect(api.result.value).toEqual(payload)
  })
})
