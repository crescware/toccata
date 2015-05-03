'use strict';
import {ToccataProps, Decoratable} from '../toccata-props';

class ToccataForV2 implements ToccataProps {
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
  _uuid: string;

  /**
   * Return Angular 2 bootstrap()
   *
   * @private
   * @returns {function(*, ?*=, ?Function=): void}
   */
  _bootstrapFactory(): (appComponentType: any, componentInjectableBindings?: any, errorReporter?: Function) => void {
    return this.core.bootstrap;
  }

  /**
   * @private
   * @returns {Decoratable}
   */
  _ComponentFactory(): Decoratable {
    const Component = (def: any) => {
      var annotation = new this.core.Component(def);
      return function(decoratee: any) {
        decoratee.annotations = decoratee.annotations || [];
        if (def.injectables) {
          decoratee.parameters = decoratee.parameters || [def.injectables];
        }
        decoratee.annotations.push(annotation);
        return decoratee;
      };
    };
    return Component;
  }

  /**
   * @private
   * @returns {Decoratable}
   */
  _ViewFactory(): Decoratable {
    const View = (def: any) => {
      var annotation = new this.core.View(def);
      return function(decoratee: any) {
        decoratee.annotations = decoratee.annotations || [];
        decoratee.annotations.push(annotation);
        return decoratee;
      };
    };
    return View;
  }

  /**
   * Parent support is currently WIP
   *
   * @private
   * @returns {Decoratable}
   */
  _ParentFactory(): Decoratable {
    const Parent = (def: any) => {
      return (decoratee: any) => {
        return new this.core.Parent(decoratee);
      };
    };
    return Parent;
  }

  /**
   * Ancestor support is currently WIP
   *
   * @private
   * @returns {Decoratable}
   */
  _AncestorFactory(): Decoratable {
    const Ancestor = (def: any) => {
      return (decoratee: any) => {
        return new this.core.Ancestor(decoratee);
      };
    };
    return Ancestor;
  }
}

export default ToccataForV2;