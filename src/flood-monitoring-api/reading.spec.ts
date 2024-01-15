import { expect } from 'chai';

import { mergeReadings, parseReadings } from './reading';
import type { Reading, ReadingDTO } from './reading';

describe('Flood monitoring API readings', function () {
  describe('parseReadings', function () {
    it('should parse a response with an undocumented value', function () {
      // xprettier-ignore
      const items = [
        {
          '@id': 'ignored',
          dateTime: '2024-01-08T13:00:00Z',
          measure: 'can/be/any/name',
          value: [355.858, 371.289],
        },
        {
          '@id': 'ignored',
          dateTime: '2024-01-08T12:45:00Z',
          measure: 'can/be/any/name',
          value: 372.456,
        },
      ] as unknown as ReadingDTO[];
      const parsed = parseReadings(items);
      expect(parsed.name).to.eql([[1704717900, 372.456]]);
    });
  });

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
