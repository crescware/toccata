'use strict';
import {ToccataProps, Decoratable} from '../toccata-props';

class ToccataForV1 implements ToccataProps {
  bootstrap: Function;
  Component: Decoratable;
  View: Decoratable;
  core: any; // angular
  coreName: string; // module name, AngularJS 1.x only
  operatingMode: string;
  For: Function;

  // @see http://git.io/vvS8W angular2/src/core/annotations/visibility.js
  Ancestor: Function;
  Parent: Function;

  _uuid: string;

  /**
   * Return AngularJS 1.x bootstrap()
   * If you are already doing Toccata#initModule(), it is not nothing
   *
   * @private
   * @returns {Function}
   */
  _bootstrapFactory(): Function {
    return (controller: any, requires?: any[]) => {
      requires = requires || [];
      requires.push(this._uuid);
      const selector = controller._toccataSelectorCache;
      const element = document.querySelector(selector);
      this.core.bootstrap(element, requires);
    };
  }

  /**
   * @private
   * @returns {Decoratable}
   */
  _ComponentFactory(): Decoratable {
    return (def: any) => {
      return (decoratee: any) => {
        if (!decoratee._toccataDdoCache) {
          throw new Error('View annotation is required');
        }
        decoratee._toccataSelectorCache = def.selector;
        decoratee._toccataDdoCache.restrict = 'E';
        decoratee._toccataDdoCache.controller = decoratee;
        decoratee._toccataDdoCache.controllerAs = decoratee.name || 'Controller';

        // Initialize a module if cannot take it
        try {
          this.core.module(this._uuid);
        } catch (e) {
          this.core.module(this._uuid, []);
        }

        this.core.module(this._uuid)
          .directive(def.selector, () => decoratee._toccataDdoCache);
        return decoratee;
      };
    };
  }

  /**
   * @private
   * @returns {Decoratable}
   */
  _ViewFactory(): Decoratable {
    return (def: any) => {
      const ddo = {
        template: def.template,
        templateUrl: def.templateUrl
      };

      return (decoratee: any) => {
        decoratee._toccataDdoCache = ddo;
        return decoratee;
      };
    };
  }

  /**
   * Parent support is currently WIP
   *
   * @private
   * @returns {Decoratable}
   */
  _ParentFactory(): Decoratable {
    return (def: any) => {
      // noop
      return (decoratee: any) => {
        // noop
        return decoratee;
      };
    };
  }

  /**
   * Ancestor support is currently WIP
   *
   * @private
   * @returns {Decoratable}
   */
  _AncestorFactory(): Decoratable {
    return (def: any) => {
      // noop
      return (decoratee: any) => {
        // noop
        return decoratee;
      };
    };
  }
}

export default ToccataForV1;