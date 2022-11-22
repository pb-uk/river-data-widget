// import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { readFileSync } from 'node:fs';
import camelCase from 'camelcase';
import json from '@rollup/plugin-json';

const pkg = JSON.parse(readFileSync('package.json'));

// Human timestamp for banner.
const datetime = new Date().toISOString().substring(0, 19).replace('T', ' ');

// Remove npm namespace from the package name.
const pkgName = pkg.name.replace(/@.*\//, '');
const name = camelCase(pkgName, { pascalCase: true });

// Main banner.
const banner = `/*! ${name} v${pkg.version} ${datetime}
 *! ${pkg.homepage}
 *! Copyright ${pkg.author} ${pkg.license} license.
 */
`;

export default {
  input: './src/index.ts',
  output: {
    name,
    file: './dist/index.min.js',
    format: 'iife',
    banner,
    sourcemap: true,
  },
  plugins: [
    // nodeResolve(),
    json(),

    typescript({
      compilerOptions: {
        target: 'es2017',
      },
    }),

    terser({ output: { comments: /^!/ } }),
  ],
};
