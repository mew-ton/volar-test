import { context } from 'esbuild'

const watch = process.argv.includes('--watch')
const metafile = process.argv.includes('--metafile')

async function build() {
  const ctx = await context({
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
    plugins: [
      {
        name: 'umd2esm',
        setup(build) {
          build.onResolve({ filter: /^(vscode-.*-languageservice|jsonc-parser)/ }, args => {
            const pathUmdMay = require.resolve(args.path, { paths: [args.resolveDir] });
            // Call twice the replace is to solve the problem of the path in Windows
            const pathEsm = pathUmdMay.replace('/umd/', '/esm/').replace('\\umd\\', '\\esm\\');
            return { path: pathEsm };
          });
        },
      },
    ],
  })

  if (watch) {
    await ctx.watch()
  } else {
    await ctx.rebuild()
    await ctx.dispose()
  }
}

build()
