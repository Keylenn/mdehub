import { compressImage, type OutputMimeType } from '@mdehub/core'
import { formatBytes, previewUrl } from './format'
import './styles.css'

const form = document.querySelector<HTMLFormElement>('#form')
const status = document.querySelector<HTMLParagraphElement>('#status')
const preview = document.querySelector<HTMLImageElement>('#preview')

if (!form || !status || !preview) throw new Error('playground markup missing')

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const data = new FormData(form)
  const file = data.get('file')
  if (!(file instanceof File) || file.size === 0) {
    status.textContent = 'Choose an image first'
    return
  }
  const mimeType = String(data.get('mimeType')) as OutputMimeType
  const quality = Number(data.get('quality'))
  const maxWidth = Number(data.get('maxWidth')) || undefined
  status.textContent = 'Compressing…'
  preview.removeAttribute('src')
  try {
    const result = await compressImage(file, {
      mimeType,
      quality,
      ...(maxWidth !== undefined ? { maxWidth } : {}),
      onProgress: (value) => {
        status.textContent = `Compressing… ${Math.round(value * 100)}%`
      },
    })
    preview.src = previewUrl(result.blob)
    status.textContent = `${result.width}×${result.height} · ${formatBytes(result.bytesBefore)} → ${formatBytes(result.bytesAfter)}`
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error)
  }
})
