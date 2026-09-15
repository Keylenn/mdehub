import { createApp, defineComponent, h } from 'vue'
import { useImageCompressor } from '@mdehub/vue'
import { formatBytes, previewUrl } from './format'
import './styles.css'

const App = defineComponent({
  setup() {
    const { compress, status, progress, result, error } = useImageCompressor({
      mimeType: 'image/webp',
      quality: 80,
      maxWidth: 1920,
    })

    const onFile = (event: Event) => {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (file) void compress(file)
    }

    return () =>
      h('main', [
        h('nav', [
          h('a', { href: './' }, 'Vanilla'),
          h('a', { href: './react.html' }, 'React'),
          h('a', { href: './vue.html' }, 'Vue'),
        ]),
        h('h1', '@mdehub/vue'),
        h('p', 'useImageCompressor'),
        h('div', { class: 'panel' }, [
          h('input', { type: 'file', accept: 'image/*', onChange: onFile }),
          h(
            'p',
            { class: 'status' },
            `${status.value} · ${Math.round(progress.value * 100)}%${
              result.value
                ? ` · ${formatBytes(result.value.bytesBefore)} → ${formatBytes(result.value.bytesAfter)}`
                : ''
            }${error.value ? ` · ${error.value.message}` : ''}`,
          ),
          result.value
            ? h('img', { src: previewUrl(result.value.blob), alt: 'compressed' })
            : null,
        ]),
      ])
  },
})

const root = document.querySelector('#app')
if (!root) throw new Error('missing #app')
createApp(App).mount(root)
