const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/bundle.js',
  external: ['mysql2', 'bcrypt'],
  format: 'cjs',
  minify: true,
  sourcemap: true,
}).catch(() => process.exit(1));