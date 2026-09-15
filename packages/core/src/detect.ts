import type { InputMimeType } from './types'

function bytes(buffer: ArrayBuffer, length: number): Uint8Array {
  return new Uint8Array(buffer.slice(0, length))
}

function ascii(view: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...view.subarray(start, start + length))
}

export function detectMime(buffer: ArrayBuffer): InputMimeType | undefined {
  if (buffer.byteLength < 12) return undefined
  const b = bytes(buffer, 12)

  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') return 'image/webp'
  if (ascii(b, 0, 6) === 'GIF87a' || ascii(b, 0, 6) === 'GIF89a') return 'image/gif'
  if (b[0] === 0x42 && b[1] === 0x4d) return 'image/bmp'
  if (ascii(b, 4, 4) === 'ftyp') {
    const brand = ascii(b, 8, 4)
    if (brand.startsWith('avif') || brand.startsWith('avis')) return 'image/avif'
  }
  return undefined
}

export function normalizeHintMime(hint: string | undefined): string | undefined {
  if (!hint) return undefined
  const value = hint.toLowerCase().split(';')[0]?.trim()
  if (value === 'image/jpg') return 'image/jpeg'
  return value
}
