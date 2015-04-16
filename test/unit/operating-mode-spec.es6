import * as assert_ from 'power-assert';
let assert = assert_.default;
import operatingMode_ from '../../src/operating-mode'
let operatingMode = operatingMode_.default; // HACK for default by TypeScript 1.5 Alpha

describe('operating-mode', () => {
  describe('not angular', () => {
    it('should be failed if given not angular', () => {
      let mockAngular = {};
      assert.throws(() => {
        operatingMode(mockAngular);
      });
    });
  });

  describe('Angular 2', () => {
    it('should be returned the v2 mode if given Angular 2', () => {
      let mockAngular = {bootstrap: () => {}};
      let actual = operatingMode(mockAngular);
      assert(actual === 'v2');
    });
  });

  describe('Angular 1.4.x', () => {
    it('should be failed if given AngularJS 1.4.0-beta.4', () => {
      let mockAngular = {
        bootstrap: () => {},
        version: {
          full: '1.4.0-beta.4', major: 1, minor: 4, dot: 0
        }
      };
      assert.throws(() => {
        operatingMode(mockAngular);
      });
    });

    it('should be returned the v1 mode if given Angular 1.4.0-beta.5', () => {
      let mockAngular = {
        bootstrap: () => {},
        version: {
          full: '1.4.0-beta.5', major: 1, minor: 4, dot: 0
        }
      };
      let actual = operatingMode(mockAngular);
      assert(actual === 'v1');
    });

    it('should be returned the v1 mode if given Angular 1.4.0-rc.0', () => {
      let mockAngular = {
        bootstrap: () => {},
        version: {
          full: '1.4.0-rc.0', major: 1, minor: 4, dot: 0
        }
      };
      let actual = operatingMode(mockAngular);
      assert(actual === 'v1');
    });

    it('should be returned the v1 mode if given Angular 1.4.0', () => {
      let mockAngular = {
        bootstrap: () => {},
        version: {
          full: '1.4.0', major: 1, minor: 4, dot: 0
        }
      };
      let actual = operatingMode(mockAngular);
      assert(actual === 'v1');
    });
  });

  describe('Angular 1.3.x', () => {
    it('should be failed if given AngularJS 1.3.13', () => {
      let mockAngular = {
        bootstrap: () => {},
        version: {
          full: '1.3.13', major: 1, minor: 3, dot: 13
        }
      };
      assert.throws(() => {
        operatingMode(mockAngular);
      });
    });

    it('should be returned the v1 mode if given Angular 1.3.14', () => {
      let mockAngular = {
        bootstrap: () => {},
        version: {
          full: '1.3.14', major: 1, minor: 3, dot: 14
        }
      };
      let actual = operatingMode(mockAngular);
      assert(actual === 'v1');
    });
  });

  describe('Angular <=1.2.x', () => {
    it('should be failed if given AngularJS 1.2.0', () => {
      let mockAngular = {
        bootstrap: () => {},
        version: {
          full: '1.2.0', major: 1, minor: 2, dot: 0
        }
      };
      assert.throws(() => {
        operatingMode(mockAngular);
      });
    });
  });
});