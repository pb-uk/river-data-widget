import { expect } from 'chai';

import { mergeReadings } from './reading';
import type { Reading } from './reading';

describe('Flood monitoring API readings', function () {
  describe('mergeReadings', function () {
    it('should merge two disjoint arrays', function () {
      // prettier-ignore
      const first: Reading[] = [[1, 11], [2, 22], [3, 33]];
      // prettier-ignore
      const second: Reading[] = [[4, 44], [5, 55], [6, 66]];

      mergeReadings(first, second);

      // prettier-ignore
      const ans = [[1, 11], [2, 22], [3, 33], [4, 44], [5, 55], [6, 66]];
      expect(first).to.eql(ans);
    });
  });

  it('should merge two overlapping arrays', function () {
    // prettier-ignore
    const first: Reading[] = [[1, 11], [2, 22], [3, 33]];
    // prettier-ignore
    const second: Reading[] = [[2, 222], [5, 55], [6, 66]];

    mergeReadings(first, second);

    // prettier-ignore
    const ans = [[1, 11], [2, 222], [5, 55], [6, 66]];
    expect(first).to.eql(ans);
  });

  it('should replace if the first array is later than the second', function () {
    // prettier-ignore
    const first: Reading[] = [[4, 44], [5, 55], [6, 66]];
    // prettier-ignore
    const second: Reading[] = [[1, 11], [2, 22], [3, 33]];

    mergeReadings(first, second);

    // prettier-ignore
    const ans = [[1, 11], [2, 22], [3, 33]];
    expect(first).to.eql(ans);
  });

  it('should replace if the first array is empty', function () {
    // prettier-ignore
    const first: Reading[] = [];
    // prettier-ignore
    const second: Reading[] = [[4, 44], [5, 55], [6, 66]];

    mergeReadings(first, second);

    // prettier-ignore
    const ans = [[4, 44], [5, 55], [6, 66]];
    expect(first).to.eql(ans);
  });

  it('should do nothing if the second array is empty', function () {
    // prettier-ignore
    const first: Reading[] = [[1, 11], [2, 22], [3, 33]];
    // prettier-ignore
    const second: Reading[] = [];

    mergeReadings(first, second);

    // prettier-ignore
    const ans: Reading[] = [[1, 11], [2, 22], [3, 33]];
    expect(first).to.eql(ans);
  });
});
