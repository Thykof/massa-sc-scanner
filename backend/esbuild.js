#!/usr/bin/env node
/* eslint @typescript-eslint/no-var-requires: 0 */
const esbuildPluginTsc = require('esbuild-plugin-tsc');

require('esbuild')
  .build({
    logLevel: 'info',
    entryPoints: ['src/serverless/scanner.ts', 'src/serverless/verifier.ts'],
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: 'node',
    target: 'es2020',
    outdir: 'dist',
    plugins: [esbuildPluginTsc()],
  })
  .catch(() => process.exit(1));
