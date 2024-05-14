import { context } from 'esbuild'

const watch = process.argv.includes('--watch')
const metafile = process.argv.includes('--metafile')

context({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  bundle: true,
  sourcemap: true,
  metafile,
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'esnext',
  tsconfig: './tsconfig.json',
  define: { 'process.env.NODE_ENV': '"production"' },
  treeShaking: true,
}).then(async (ctx) => {
  if (watch) {
    await ctx.watch()
  } else {
    await ctx.rebuild()
    await ctx.dispose()
  }
})
