import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useImageCompressor } from '@mdehub/react'
import type { OutputMimeType } from '@mdehub/core'
import { formatBytes, previewUrl } from './format'
import './styles.css'

function App() {
  const [mimeType, setMimeType] = useState<OutputMimeType>('image/webp')
  const [quality, setQuality] = useState(80)
  const { compress, status, progress, result, error } = useImageCompressor({
    mimeType,
    quality,
    maxWidth: 1920,
  })

  return (
    <main>
      <nav>
        <a href="./">Vanilla</a>
        <a href="./react.html">React</a>
        <a href="./vue.html">Vue</a>
      </nav>
      <h1>@mdehub/react</h1>
      <p>useImageCompressor</p>
      <div className="panel">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void compress(file)
          }}
        />
        <select
          value={mimeType}
          onChange={(event) => setMimeType(event.target.value as OutputMimeType)}
        >
          <option value="image/webp">webp</option>
          <option value="image/jpeg">jpeg</option>
          <option value="image/png">png</option>
        </select>
        <input
          type="number"
          min={1}
          max={100}
          value={quality}
          onChange={(event) => setQuality(Number(event.target.value))}
        />
        <p className="status">
          {status} · {Math.round(progress * 100)}%
          {result
            ? ` · ${formatBytes(result.bytesBefore)} → ${formatBytes(result.bytesAfter)}`
            : ''}
          {error ? ` · ${error.message}` : ''}
        </p>
        {result ? <img src={previewUrl(result.blob)} alt="compressed" /> : null}
      </div>
    </main>
  )
}

const root = document.querySelector('#app')
if (!root) throw new Error('missing #app')
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
