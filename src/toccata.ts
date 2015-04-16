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
  operatingMode: string;

  /**
   * @constructor
   */
  constructor(core: any) {
    this.operatingMode = operatingMode(core);
    this.core = core;
    this.bootstrap = this.bootstrapFactory();
    this.Component = this.ComponentFactory();
    this.View      = this.ViewFactory();
  }

  /**
   * @returns {Function}
   */
  private bootstrapFactory(): Function {
    if (this.operatingMode === 'v2') {
      return this.core.bootstrap;
    }
    return () => {};
  }

  /**
   * @param {*} angular
   * @param {string} mode
   * @returns {Decoratable}
   */
  private ComponentFactory(): Decoratable {
    if (this.operatingMode === 'v2') {
      return function Component(def: any) {
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
    }
    return (def: any) => {
      return (decoratee: any) => {
        return decoratee;
      };
    };
  }

  /**
   * @param {*} angular
   * @param {string} mode
   * @returns {Decoratable}
   */
  private ViewFactory(): Decoratable {
    if (this.operatingMode === 'v2') {
      return function View(def: any) {
        var annotation = new this.core.View(def);
        return function(decoratee: any) {
          decoratee.annotations = decoratee.annotations || [];
          decoratee.annotations.push(annotation);
          return decoratee;
        };
      };
    }
    return (def: any) => {
      return (decoratee: any) => {
        return decoratee;
      };
    };
  }
}