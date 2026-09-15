# Getting started

```bash
pnpm add @mdehub/core
# optional
pnpm add @mdehub/react
pnpm add @mdehub/vue
```

```ts
import { compressImage } from '@mdehub/core'

const result = await compressImage(file, {
  mimeType: 'image/webp',
  quality: 80,
  maxWidth: 1920,
})
```

Vite / Nuxt should exclude jsquash from dependency optimization:

```ts
optimizeDeps: {
  exclude: ['@jsquash/jpeg', '@jsquash/png', '@jsquash/webp', '@jsquash/resize']
}
```

Local playground: `pnpm playground`.
