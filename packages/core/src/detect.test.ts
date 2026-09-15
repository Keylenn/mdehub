import { describe, expect, it } from 'vitest'
import { detectMime, normalizeHintMime } from './detect'

function bufferFrom(bytes: number[]): ArrayBuffer {
  return new Uint8Array(bytes).buffer
}

describe('detectMime', () => {
  it('detects jpeg', () => {
    const bytes = new Array(12).fill(0)
    bytes[0] = 0xff
    bytes[1] = 0xd8
    bytes[2] = 0xff
    expect(detectMime(bufferFrom(bytes))).toBe('image/jpeg')
  })

  it('detects png', () => {
    expect(
      detectMime(
        bufferFrom([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]),
      ),
    ).toBe('image/png')
  })

  it('detects webp', () => {
    const bytes = Array.from('RIFF....WEBP').map((c) => c.charCodeAt(0))
    expect(detectMime(bufferFrom(bytes))).toBe('image/webp')
  })

  it('returns undefined for short buffers', () => {
    expect(detectMime(bufferFrom([1, 2, 3]))).toBeUndefined()
  })
})

describe('normalizeHintMime', () => {
  it('maps image/jpg to jpeg', () => {
    expect(normalizeHintMime('image/jpg; charset=binary')).toBe('image/jpeg')
  })
})
