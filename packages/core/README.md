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

## Smart screenshot compression

Opt in to target-size WebP compression for low-color PNG screenshots:

```ts
const result = await compressImage(file, {
  mimeType: 'image/webp',
  quality: 80,
  smart: { targetRatio: 0.14, minQuality: 40 },
})
console.log(result.smart, result.bytesAfter)
```

`smart: true` uses the same defaults; smart compression is disabled by default.
The color heuristic is approximate and runs after resizing. Other inputs and
output formats use single-pass encoding. The target is at least 2 KiB and is
best-effort: the encoder never goes below `minQuality` (or the requested quality,
if lower), so the target may not be reached. Invalid ratios fall back to 0.14.

Smart mode performs up to nine encodes, with progress and abort checks between
encodes, and works in both Worker and main-thread paths. WebP uses method 6,
alpha quality 100, and sharp YUV; these settings favor compression over speed.
The existing WASM decoders and Lanczos resizing remain unchanged.

The library always returns the requested format and dimensions, even when the
result is larger. Applications may choose to retain the original if format
conversion and resizing are not required.

