import { expect } from 'chai';

import * as index from './index';
import { version } from './index';

import { readFile } from 'node:fs/promises';

let pkg: { version: string };

describe('The esm/cjs module entry point', function () {
  before(async function () {
    const json = await readFile('package.json', 'utf8');
    pkg = JSON.parse(json);
  });

  it('should have the right version', function () {
    expect(version).to.equal(pkg.version);
  });

  it('should only expose the public API', function () {
    expect(Object.keys(index).sort()).to.eql(['drawMeasureWidget', 'version']);
  });
});
