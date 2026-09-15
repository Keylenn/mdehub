# @mdehub/react

React hooks for `@mdehub/core`.

```tsx
import { useImageCompressor } from '@mdehub/react'

function App() {
  const { compress, status, result } = useImageCompressor({ quality: 80 })
  return (
    <input
      type="file"
      accept="image/*"
      onChange={(event) => {
        const file = event.target.files?.[0]
        if (file) void compress(file)
      }}
    />
  )
}
```
