import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'compress.worker': 'src/compress.worker.ts',
  },
  format: ['esm'],
  dts: { entry: { index: 'src/index.ts' } },
  splitting: false,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: 'es2022',
  external: [/^@jsquash\//],
})
