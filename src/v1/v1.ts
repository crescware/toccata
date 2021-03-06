'use strict';
import {camelize} from '../string-utils';
import {ComponentDefinition, ViewDefinition} from '../angular2-toccata';
import {document} from '../browser-dependencies';
import {ToccataProps, Decoratable} from '../toccata-props';

class ToccataForV1 implements ToccataProps {
  bootstrap: Function;
  Component: Decoratable;
  View: Decoratable;
  core: any; // angular
  coreModule: any[]; // angular.module
  operatingMode: string;
  For: Function;

  // @see http://git.io/vvS8W angular2/src/core/annotations/visibility.js
  Ancestor: Function;
  Parent: Function;

  NgController: Decoratable;
  NgDirective: Decoratable;
  _uuid: string;

  /**
   * Return AngularJS 1.x bootstrap()
   * If you are already doing Toccata#initModule(), it is not nothing
   *
   * @private
   * @returns {function(*, string[]): void}
   */
  _bootstrapFactory(): (component: any, requires?: string[]) => void {
    return (component: any, requires?: string[]) => {
      if (!component) {throw new TypeError('bootstrap requires the component constructor')}

      const selector = component._toccataSelectorCache;
      if (!selector) {throw new TypeError('bootstrap requires the selector of component, you can use annotation')}

      requires = requires || [];
      requires.push(this._uuid);
      this.core.bootstrap(document.body, requires);
    };
  }

  /**
   * @private
   * @returns {Decoratable}
   */
  _ComponentFactory(): Decoratable {
    return (def: ComponentDefinition) => {
      return (component: any) => {
        if (!component._toccataDdoCache) {throw new Error('You must first use the @View annotation')}
        
        component._toccataSelectorCache = camelize(def.selector);

        const ddo = component._toccataDdoCache;
        ddo.restrict     = 'E';
        ddo.controller   = component;
        ddo.controllerAs = component.name || 'Component';

        try {
          this.core.module(this._uuid);
        } catch (e) {
          // Initialize a module if cannot take it
          this.core.module(this._uuid, []);
        }

        this.core.module(this._uuid)
          .directive(component._toccataSelectorCache, () => ddo);

        return component;
      };
    };
  }

  /**
   * @private
   * @returns {Decoratable}
   */
  _ViewFactory(): Decoratable {
    return (def: ViewDefinition) => {
      return (component: any) => {
        if (!def.template && !def.templateUrl) {throw new Error('template or templateUrl is required')}
        component._toccataDdoCache = {
          template: def.template,
          templateUrl: def.templateUrl
        };
        return component;
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