# mdehub

Cross-framework frontend utilities. pnpm + Turborepo.

| Package | Description |
| --- | --- |
| [`@mdehub/core`](packages/core) | Framework-agnostic WASM image compression |
| [`@mdehub/react`](packages/react) | React hooks |
| [`@mdehub/vue`](packages/vue) | Vue composables |

## Setup

```bash
pnpm install
pnpm build
pnpm playground
pnpm docs:dev
```

## Usage

```ts
import { compressImage } from '@mdehub/core'

const result = await compressImage(file, {
  mimeType: 'image/webp',
  quality: 80,
  maxWidth: 1920,
})
```

React: `useImageCompressor` from `@mdehub/react`. Vue: `useImageCompressor` from `@mdehub/vue`.

Vite / Nuxt consumers should exclude jsquash from dependency optimization:

```ts
optimizeDeps: {
  exclude: ['@jsquash/jpeg', '@jsquash/png', '@jsquash/webp', '@jsquash/resize']
}
```
