# @mdehub/core

Framework-agnostic WASM image compression.

```ts
import { compressImage } from '@mdehub/core'

const result = await compressImage(file, {
  mimeType: 'image/webp',
  quality: 80,
  maxWidth: 1920,
})
```
