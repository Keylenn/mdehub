import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'mdehub',
  description: 'Cross-framework frontend utilities',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [{ text: 'Getting started', link: '/guide/getting-started' }],
      },
      {
        text: 'API',
        items: [
          { text: '@mdehub/core', link: '/api/core' },
          { text: '@mdehub/react', link: '/api/react' },
          { text: '@mdehub/vue', link: '/api/vue' },
        ],
      },
    ],
  },
})
