import assert from 'power-assert';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

const mock = {
  angular: {
    bootstrap: () => {},
    module: () => {},
    version: {full: '1.3.14', major: 1, minor: 3, dot: 14}
  },
  angularModule: {
    directive: () => {}
  },
  document: {
    body: 'body'
  }
};

const stub = {
  angular: {
    bootstrap: sinon.stub(mock.angular, 'bootstrap'),
    module:    sinon.stub(mock.angular, 'module').returns(mock.angularModule)
  },
  angularModule: {
    directive: sinon.stub(mock.angularModule, 'directive')
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

class DummyComponent {
  //
}

describe('Toccata V1', () => {
  beforeEach(() => {
    Object.keys(stub).forEach(stubName => {
      Object.keys(stub[stubName]).forEach(method => stub[stubName][method].reset());
    });
  });

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
    let component;
    beforeEach(() => {
      component = {};
      component._toccataSelectorCache = 'selector';
    });

    it('should be set a function', () => {
      const actual = toccata.bootstrap;
      assert(typeof actual === 'function');
    });

    context('when "component" is not', () => {
      it('should be thrown an exception', () => {
        assert.throws(() => toccata.bootstrap(), /bootstrap requires the component constructor/);
      });
    });

    context('when "_toccataSelectorCache" is not', () => {
      beforeEach(() => {
        delete component._toccataSelectorCache;
      });

      it('should be thrown an exception', () => {
        assert.throws(() => toccata.bootstrap(component), /bootstrap requires the selector of component/);
      });
    });

    context('when "requires" is not', () => {
      it('should be given an element to bootstrap arg[0]', () => {
        toccata.bootstrap(component);
        assert(stub.angular.bootstrap.getCall(0).args[0] === 'body');
      });

      it('should be given an array contains uuid to bootstrap arg[1]', () => {
        toccata.bootstrap(component);
        const actual = stub.angular.bootstrap.getCall(0).args[1];
        assert(uuidRegExp.test(actual[0]));
      });
    });

    context('when "requires" is exists', () => {
      let requires;
      beforeEach(() => {
        requires = ['some-module'];
      });

      it('should be given an array contains module to bootstrap arg[1]', () => {
        toccata.bootstrap(component, requires);
        const actual = stub.angular.bootstrap.getCall(0).args[1];
        assert(actual[0] === 'some-module');
      });

      it('should be given an array contains uuid to bootstrap arg[1]', () => {
        toccata.bootstrap(component, requires);
        const actual = stub.angular.bootstrap.getCall(0).args[1];
        assert(uuidRegExp.test(actual[1]));
      });
    });
  });

  describe('Component', () => {
    it('should be set a function', () => {
      const actual = toccata.Component;
      assert(typeof actual === 'function');
    });

    it('should be returned a decorating function', () => {
      const actual = toccata.Component({});
      assert(typeof actual === 'function');
    });

    context('if it does not yet use @View', () => {
      it('should be thrown an exception', () => {
        DummyComponent._toccataDdoCache = void 0;
        assert.throws(
          () => toccata.Component({})(DummyComponent),
          /You must first use the @View annotation/
        );
      });
    });

    context('the common usage', () => {
      let ddo, decorated;
      beforeEach(() => {
        DummyComponent._toccataDdoCache = {};
        decorated = toccata.Component({
          selector: 'tag'
        })(DummyComponent);

        ddo = stub.angularModule.directive.getCall(0).args[1]();
      });

      it('should be returned component', () => {
        assert(decorated.name === DummyComponent.name);
      });

      it('should be given selector to directive() args[0]', () => {
        assert(stub.angularModule.directive.getCall(0).args[0] === 'tag');
      });

      it('should be set to ddo.restrict', () => {
        assert(ddo.restrict === 'E');
      });

      it('should be set to ddo.controller', () => {
        assert(ddo.controller === DummyComponent);
      });

      it('should be set to ddo.controllerAs', () => {
        assert(ddo.controllerAs === 'DummyComponent');
      });
    });

    describe('selector needs camelize', () => {
      it('selector is foo', () => {
        DummyComponent._toccataDdoCache = {};
        toccata.Component({
          selector: 'foo'
        })(DummyComponent);

        assert(stub.angularModule.directive.getCall(0).args[0] === 'foo');
      });

      it('selector is foo-bar', () => {
        DummyComponent._toccataDdoCache = {};
        toccata.Component({
          selector: 'foo-bar'
        })(DummyComponent);

        assert(stub.angularModule.directive.getCall(0).args[0] === 'fooBar');
      });
    });
  });

  describe('View', () => {
    it('should be set a function', () => {
      const actual = toccata.View;
      assert(typeof actual === 'function');
    });

    context('when template is set', () => {
      let ddo, decorated;
      beforeEach(() => {
        decorated = toccata.View({
          template: '<tag></tag>'
        })(DummyComponent);

        ddo = decorated._toccataDdoCache;
      });

      it('should be returned component', () => {
        assert(decorated.name === DummyComponent.name);
      });

      it('should be set to ddo.template', () => {
        assert(ddo.template === '<tag></tag>');
      });

      it('should be NOT set to ddo.templateUrl', () => {
        assert(!ddo.templateUrl);
      });
    });

    context('when templateUrl is set', () => {
      let ddo, decorated;
      beforeEach(() => {
        decorated = toccata.View({
          templateUrl: 'template.html'
        })(DummyComponent);

        ddo = decorated._toccataDdoCache;
      });

      it('should be NOT set to ddo.template', () => {
        assert(!ddo.template);
      });

      it('should be set to ddo.templateUrl', () => {
        assert(ddo.templateUrl === 'template.html');
      });
    });
  });
});