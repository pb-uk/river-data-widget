import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { readFileSync } from 'node:fs';
import camelCase from 'camelcase';
import json from '@rollup/plugin-json';

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

export default [
  {
    input: './src/index.ts',
    output: {
      name,
      file: `./dist/${pkgName}.min.js`,
      format: 'iife',
      banner,
      sourcemap: true,
    },
    plugins: [
      json(),

      typescript({
        compilerOptions: {
          module: 'esnext',
          target: 'es2017',
        },
      }),

      terser({ output: { comments: /^!/ } }),
    ],
  },
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.js',
      format: 'esm',
      banner,
      sourcemap: true,
    },
    plugins: [
      json(),

      typescript({
        compilerOptions: {
          module: 'esnext',
          target: 'es2017',
        },
      }),
    ],
  },
];
