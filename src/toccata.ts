/**
 * Cresc Toccata
 * @copyright © 2015 Crescware
 */
'use strict';
import operatingMode from './operating-mode';
import {ToccataProps, Decoratable} from './toccata-props';
import V1 from './v1/v1';
import V2 from './v2/v2';

export default function toccata(angular: any): Toccata {
  return new Toccata(angular);
}

export class Toccata implements ToccataProps {
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
   * @constructor
   */
  constructor(core: any) {
    this.operatingMode = operatingMode(core);
    this.core = core;
    this.bootstrap = this.bootstrapFactory();
    this.Component = this.ComponentFactory();
    this.View      = this.ViewFactory();

    // WIP, not working
    /*
    this.Ancestor = this.AncestorFactory();
    this.Parent   = this.ParentFactory();
    */

    if (this.operatingMode === 'v2') {
      this.For = this.core.For || console.warn('angular2.For not found');
    }
    if (this.operatingMode === 'v1') {
      this._uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  /**
   * AngularJS 1.x angular.module('name', ['requires'])
   * NOTICE: We have plans to rename initModule() to a something better name
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
      ? V2.prototype._bootstrapFactory.call(this)
      : V1.prototype._bootstrapFactory.call(this);
  }

  /**
   * @returns {Decoratable}
   */
  private ComponentFactory(): Decoratable {
    return (this.operatingMode === 'v2')
      ? V2.prototype._ComponentFactory.call(this)
      : V1.prototype._ComponentFactory.call(this);
  }

  /**
   * @returns {Decoratable}
   */
  private ViewFactory(): Decoratable {
    return (this.operatingMode === 'v2')
      ? V2.prototype._ViewFactory.call(this)
      : V1.prototype._ViewFactory.call(this);
  }

  /**
   * @returns {Decoratable}
   */
  private ParentFactory(): Decoratable {
    return (this.operatingMode === 'v2')
      ? V2.prototype._ParentFactory.call(this)
      : V1.prototype._ParentFactory.call(this);
  }

  /**
   * @returns {Decoratable}
   */
  private AncestorFactory(): Decoratable {
    return (this.operatingMode === 'v2')
      ? V2.prototype._AncestorFactory.call(this)
      : V1.prototype._AncestorFactory.call(this);
  }
}