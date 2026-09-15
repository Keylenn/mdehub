import type { InputMimeType, OutputMimeType } from './types'
import { CompressError } from './errors'

async function decodeJpeg(buffer: ArrayBuffer): Promise<ImageData> {
  const { decode } = await import('@jsquash/jpeg')
  return decode(buffer)
}

async function decodePng(buffer: ArrayBuffer): Promise<ImageData> {
  const { decode } = await import('@jsquash/png')
  return decode(buffer)
}

async function decodeWebp(buffer: ArrayBuffer): Promise<ImageData> {
  const { decode } = await import('@jsquash/webp')
  return decode(buffer)
}

async function encodeJpeg(image: ImageData, quality: number): Promise<ArrayBuffer> {
  const { encode } = await import('@jsquash/jpeg')
  return encode(image, { quality })
}

async function encodePng(image: ImageData): Promise<ArrayBuffer> {
  const { encode } = await import('@jsquash/png')
  return encode(image)
}

async function encodeWebp(image: ImageData, quality: number): Promise<ArrayBuffer> {
  const { encode } = await import('@jsquash/webp')
  return encode(image, { quality })
}

async function resizeImage(
  image: ImageData,
  width: number,
  height: number,
): Promise<ImageData> {
  const { default: resize } = await import('@jsquash/resize')
  return resize(image, { width, height, method: 'lanczos3' })
}

function copyBuffer(buffer: ArrayBuffer): ArrayBuffer {
  return buffer.slice(0)
}

async function decodeWithBitmap(
  buffer: ArrayBuffer,
  type: string | undefined,
): Promise<ImageData> {
  if (typeof createImageBitmap !== 'function') {
    throw new CompressError('No decoder available for this image type')
  }
  const blob = type ? new Blob([buffer], { type }) : new Blob([buffer])
  const bitmap = await createImageBitmap(blob)
  try {
    return imageDataFromBitmap(bitmap)
  } finally {
    bitmap.close()
  }
}

function imageDataFromBitmap(bitmap: ImageBitmap): ImageData {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new CompressError('2D canvas context unavailable')
    ctx.drawImage(bitmap, 0, 0)
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height)
  }
  if (typeof document === 'undefined') {
    throw new CompressError('Canvas is unavailable in this environment')
  }
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new CompressError('2D canvas context unavailable')
  ctx.drawImage(bitmap, 0, 0)
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height)
}

export async function decodeImage(
  buffer: ArrayBuffer,
  mime: InputMimeType | undefined,
): Promise<ImageData> {
  try {
    if (mime === 'image/jpeg') return await decodeJpeg(buffer)
    if (mime === 'image/png') return await decodePng(buffer)
    if (mime === 'image/webp') return await decodeWebp(buffer)
  } catch {
    return decodeWithBitmap(buffer, mime)
  }
  return decodeWithBitmap(buffer, mime)
}

export async function encodeImage(
  image: ImageData,
  mimeType: OutputMimeType,
  quality: number,
): Promise<ArrayBuffer> {
  if (mimeType === 'image/jpeg') return copyBuffer(await encodeJpeg(image, quality))
  if (mimeType === 'image/png') return copyBuffer(await encodePng(image))
  return copyBuffer(await encodeWebp(image, quality))
}

export async function maybeResize(
  image: ImageData,
  width: number,
  height: number,
): Promise<ImageData> {
  if (image.width === width && image.height === height) return image
  return resizeImage(image, width, height)
}
