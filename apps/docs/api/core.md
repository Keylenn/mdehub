# @mdehub/core

## `compressImage(input, options?)`

Compress an image with Squoosh-derived WASM codecs.

| Option | Type | Default |
| --- | --- | --- |
| `mimeType` | `'image/webp' \| 'image/jpeg' \| 'image/png'` | `'image/webp'` |
| `quality` | `number` (1–100) | `80` |
| `maxWidth` | `number` | — |
| `maxHeight` | `number` | — |
| `signal` | `AbortSignal` | — |
| `onProgress` | `(n: number) => void` | — |
| `preferWorker` | `boolean` | `true` |

Returns `{ blob, width, height, bytesBefore, bytesAfter }`.

Input is `Blob | ArrayBuffer`. Images are never upscaled.

Also exported: `detectMime`, `computeTargetSize`, `CompressError`, `CompressAbortError`.
