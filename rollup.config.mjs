import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'node:fs';
import camelCase from 'camelcase';

const pkg = JSON.parse(readFileSync('package.json'));

// Human timestamp for banner.
const datetime = new Date().toISOString().substring(0, 19).replace('T', ' ');
const year = datetime.substring(0, 4);

// Remove npm namespace from the package name.
const pkgName = pkg.name.replace(/@.*\//, '');
const name = camelCase(pkgName, { pascalCase: true });

// Main banner.
const banner = `/*! ${name} v${pkg.version} ${datetime}
 *! ${pkg.homepage}
 *! Copyright (C) ${year} ${pkg.author}.
 *! License ${pkg.license}.
 */
`;

// Target ECMAScript version (es2017 is good for all modern browsers in 2022).
const target = 'es2017';

export default [
  {
    input: './src/autoload.ts',
    output: {
      name,
      file: 'index.min.js',
      format: 'iife',
      banner,
      sourcemap: true,
    },
    plugins: [
      typescript({
        compilerOptions: {
          target,
        },
      }),

      terser({ output: { comments: /^!/ } }),
    ],
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: './index.mjs',
        format: 'esm',
        banner,
        sourcemap: true,
      },
      {
        file: './index.cjs',
        format: 'commonjs',
        banner,
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        compilerOptions: {
          target,
        },
      }),
    ],
  },
];
