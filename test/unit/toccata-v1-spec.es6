import assert from 'power-assert';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

const mock = {
  angular: {
    bootstrap: () => {},
    version: {full: '1.3.14', major: 1, minor: 3, dot: 14}
  },
  document: {
    querySelector: () => {}
  }
};

const stub = {
  angular: {
    bootstrap: sinon.stub(mock.angular, 'bootstrap')
  },
  document: {
    querySelector: sinon.stub(mock.document, 'querySelector').returns('element')
  }
};

const t = proxyquire('../../src/toccata', {
  './v1/v1': proxyquire('../../src/v1/v1', {
    '../browser-dependencies': {
      document: mock.document
    }
  })
});

const toccata = t.toccata(mock.angular);
const uuidRegExp = /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;


describe('Toccata V1', () => {
  describe('props', () => {
    it('should NOT be had "For"', () => {
      assert(!toccata.For);
    });

    it('should be set uuid', () => {
      const actual = uuidRegExp.test(toccata._uuid);
      assert(actual === true);
    });
  });

  describe('bootstrap', () => {
    it('should be set a function', () => {
      const actual = toccata.bootstrap;
      assert(typeof actual === 'function');
    });

    context('when "component" is not', () => {
      it('should be thrown an exception', () => {
        assert.throws(() => toccata.bootstrap(), /bootstrap requires the component constructor/);
      });
    });

    context('when "requires" is not', () => {
      let component;
      beforeEach(() => {
        component = {};
        component._toccataSelectorCache = 'selector';
      });

      it('should be given an element to bootstrap arg[0]', () => {
        toccata.bootstrap(component);
        assert(stub.angular.bootstrap.getCall(0).args[0] === 'element');
      });

      it('should be given an array contains uuid to bootstrap arg[1]', () => {
        toccata.bootstrap(component);
        const actual = stub.angular.bootstrap.getCall(0).args[1];
        assert(uuidRegExp.test(actual[0]));
      });
    });
  });
});