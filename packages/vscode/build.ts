import { context } from 'esbuild'

const watch = process.argv.includes('--watch')
const metafile = process.argv.includes('--metafile')

context({
  entryPoints: ['src/extension.ts'],
  outdir: 'dist',
  bundle: true,
  sourcemap: true,
  metafile,
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'esnext',
}).then(async (ctx) => {
  if (watch) {
    await ctx.watch()
  } else {
    await ctx.rebuild()
    await ctx.dispose()
  }
})
