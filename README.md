# river-data-widget

A web widget to display river flow and other data.

## Development

```console
$ npm init -y
$ npm i -D typescript ts-node mocha chai @types/mocha @types/chai eslint-plugin-mocha prettier cross-env
$ npm i -D rollup rollup-plugin-terser @rollup/plugin-json @rollup/plugin-node-resolve @rollup/plugin-typescript camelcase rimraf
$ npx eslint --init

```

```json
"test": "cross-env TS_NODE_COMPILER_OPTIONS='{ \"module\": \"commonjs\" }' mocha -r ts-node/register src/**/*.spec.ts"
```
