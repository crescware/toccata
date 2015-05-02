import assert from 'power-assert';
import {toccata as toccata_} from '../../src/toccata';

const angular = {
  bootstrap: () => {},
  version: {full: '1.3.14', major: 1, minor: 3, dot: 14}
};
const toccata = toccata_(angular);

describe('Toccata V1', () => {
  describe('props', () => {
    it('should NOT be had "For"', () => {
      assert(!toccata.For);
    });

    it('should be set uuid', () => {
      const actual = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/.test(toccata._uuid);
      assert(actual === true);
    });
  });
});