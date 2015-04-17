/**
 * Cresc Toccata
 * @copyright © 2015 Crescware
 */
'use strict';
import operatingMode from './operating-mode';

type Decoratable = (def: any) => (decoratee: any) => any;

export default function toccata(angular: any): Toccata {
  return new Toccata(angular);
}

export class Toccata {
  bootstrap: Function;
  Component: Decoratable;
  View: Decoratable;
  core: any; // angular
  coreName: string; // module name, AngularJS 1.x only
  operatingMode: string;
  For: Function;

  /**
   * @constructor
   */
  constructor(core: any) {
    this.operatingMode = operatingMode(core);
    this.core = core;
    this.bootstrap = this.bootstrapFactory();
    this.Component = this.ComponentFactory();
    this.View      = this.ViewFactory();

    if (this.operatingMode === 'v2') {
      this.For = this.core.For || console.warn('angular2.For not found');
    }
  }

  /**
   * AngularJS 1.x angular.module('name', ['requires'])
   *
   * @param {string} moduleName
   * @param {Array<string>} requires
   */
  initModule(moduleName: string, requires: string[]) {
    if (this.operatingMode === 'v2') {
      return;
    }
    this.core.module(moduleName, requires);
    this.coreName = moduleName;
  }

  /**
   * @returns {Function}
   */
  private bootstrapFactory(): Function {
    return (this.operatingMode === 'v2')
      ? this.bootstrapFactoryForV2()
      : this.bootstrapFactoryForV1();
  }

  /**
   * Return Angular 2 bootstrap()
   *
   * @returns {function(*, ?*=, ?Function=): void}
   */
  private bootstrapFactoryForV2(): (appComponentType: any, componentInjectableBindings?: any, errorReporter?: Function) => void {
    return this.core.bootstrap;
  }

  /**
   * Return AngularJS 1.x bootstrap()
   * If you are already doing Toccata#initModule(), it is not nothing
   *
   * @returns {Function}
   */
  private bootstrapFactoryForV1(): Function {
    return this.core.bootstrap;
  }

  /**
   * @returns {Decoratable}
   */
  private ComponentFactory(): Decoratable {
    return (this.operatingMode === 'v2')
      ? this.ComponentFactoryForV2()
      : this.ComponentFactoryForV1();
  }

  /**
   * @returns {Decoratable}
   */
  private ComponentFactoryForV2(): Decoratable {
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
   * @returns {Decoratable}
   */
  private ComponentFactoryForV1(): Decoratable {
    return (def: any) => {
      return (decoratee: any) => {
        if (!decoratee._toccataDdoCache) {
          throw new Error('View annotation is required');
        }
        decoratee._toccataDdoCache.restrict = 'E';
        decoratee._toccataDdoCache.controller = decoratee;
        this.core.module(this.coreName).directive(def.selector, () => decoratee._toccataDdoCache);
        return decoratee;
      };
    };
  }

  /**
   * @returns {Decoratable}
   */
  private ViewFactory(): Decoratable {
    return (this.operatingMode === 'v2')
      ? this.ViewFactoryForV2()
      : this.ViewFactoryForV1();
  }

  /**
   * @returns {Decoratable}
   */
  private ViewFactoryForV2(): Decoratable {
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
   * @returns {Decoratable}
   */
  private ViewFactoryForV1(): Decoratable {
    return (def: any) => {
      const ddo = {
        template: def.template
      };

      return (decoratee: any) => {
        decoratee._toccataDdoCache = ddo;
        return decoratee;
      };
    };
  }
}