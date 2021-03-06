/**
 * Cresc Toccata
 * @copyright © 2015 Crescware
 */
/// <reference path="../typings/node/node.d.ts" />
'use strict';
import operatingMode from './operating-mode';
import {ToccataProps, Decoratable} from './toccata-props';
import V1 from './v1/v1';
import V2 from './v2/v2';

const pkg = require('../package.json');

interface ToccataStatic {
  (angular: any): Toccata;
  version: string;
}

export function toccata(angular: any): Toccata {
  if (!angular) {throw new Error('AngularJS or Angular 2 is required')}
  return new Toccata(angular);
}
(<ToccataStatic>toccata).version = pkg.version;

export class Toccata implements ToccataProps {
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

    if (this.isV2()) {
      this.For = this.core.For || console.warn('angular2.For not found');
    }
    if (this.isV1()) {
      this.NgController = this.NgControllerBase.bind(this);
      this.NgDirective  = this.NgDirectiveBase.bind(this);
      this._uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }

  /**
   * Only V1
   * Set AngularJS 1.x angular.module('name', ['requires'])
   *
   * @param {any} mod
   */
  setModule(mod: any) {
    if (this.isV2()) {return} // noop when v2

    this.coreModule = this.coreModule || [];
    this.coreModule.push(mod);
  }

  /**
   * Only V1
   * @param {string} name
   * @returns {*} angular.module
   */
  module(name: string): any {
    if (this.isV2()) {throw new Error('toccata.module is available only when the mode is v1')}

    let corresponding: number;
    const exists = this.coreModule.some((mod, i) => {
      corresponding = i;
      return mod.name === name;
    });
    if (!exists) {throw new Error(`Toccata has not a module "${name}". you can do toccata.setModule(angular.module("${name}", []))`)}

    return this.coreModule[corresponding];
  }

  /**
   * Only V1
   *
   * usage
   * @NgController({
   *   name: 'ControllerName'
   * })
   * class Controller{
   *   //...
   * }
   *
   * @param {*} [def]
   * @returns {Function}
   */
  private NgControllerBase(def?: any): (controller: any) => any {
    const funcName = 'NgController';
    def = def || {};
    return (controller: any) => {
      const ctrlName = def.name || controller.name || '';
      if (!ctrlName) {throw new Error(`name is required. @${funcName}({name: "controllerName"})`)}
      if (1 < this.coreModule.length && !def.module) {
        throw new Error(`Toccata has some angular.module. You must specify the module name. @${funcName}({module: "moduleName", name: "${def.name}"})`)
      }

      if (this.coreModule.length === 1) {
        this.coreModule[0].controller(ctrlName, controller);
        return controller;
      }

      this.module(def.module).controller(ctrlName, controller);
      return controller;
    };
  }

  /**
   * Only V1
   *
   * usage
   * @NgDirective({
   *   name: 'directiveName' // and set also as 'controllerAs'
   * })
   * class Controller{
   *   //...
   * }
   *
   * @param {*} [def]
   */
  private NgDirectiveBase(def?: any): (controller: any) => any {
    const funcName = 'NgDirective';
    def = def || {};
    return (controller: any) => {
      const dirName = def.name || '';
      if (!dirName) {throw new Error(`name is required. @${funcName}({name: "directiveName"})`)}
      if (1 < this.coreModule.length && !def.module) {
        throw new Error(`Toccata has some angular.module. You must specify the module name. @${funcName}({module: "moduleName", name: "${def.name}"})`)
      }

      const ddo = {
        restrict:     def.restrict || 'E',
        controller:   controller,
        controllerAs: dirName,
      };

      // All of the property is not supported yet
      // The support is also undecided
      // Does everyone use all?
      const availableProps = [
        'compile',
        'link',
        'require',
        'scope',
        'template',
        'templateUrl'
      ];

      availableProps.forEach((prop) => {
        if (def[prop]) {(<any>ddo)[prop] = def[prop]}
      });

      if (this.coreModule.length === 1) {
        this.coreModule[0].directive(dirName, () => ddo);
        return controller;
      }

      this.module(def.module).directive(dirName, () => ddo);
      return controller;
    };
  }

  /**
   * @returns {boolean}
   */
  isV1(): boolean {
    return this.operatingMode === 'v1';
  }

  /**
   * @returns {boolean}
   */
  isV2(): boolean {
    return this.operatingMode === 'v2';
  }
  
  /**
   * @returns {Function}
   */
  private bootstrapFactory(): Function {
    return (this.isV2())
      ? V2.prototype._bootstrapFactory.call(this)
      : V1.prototype._bootstrapFactory.call(this);
  }

  /**
   * @returns {Decoratable}
   */
  private ComponentFactory(): Decoratable {
    return (this.isV2())
      ? V2.prototype._ComponentFactory.call(this)
      : V1.prototype._ComponentFactory.call(this);
  }

  /**
   * @returns {Decoratable}
   */
  private ViewFactory(): Decoratable {
    return (this.isV2())
      ? V2.prototype._ViewFactory.call(this)
      : V1.prototype._ViewFactory.call(this);
  }

  /**
   * @returns {Decoratable}
   */
  private ParentFactory(): Decoratable {
    return (this.isV2())
      ? V2.prototype._ParentFactory.call(this)
      : V1.prototype._ParentFactory.call(this);
  }

  /**
   * @returns {Decoratable}
   */
  private AncestorFactory(): Decoratable {
    return (this.isV2())
      ? V2.prototype._AncestorFactory.call(this)
      : V1.prototype._AncestorFactory.call(this);
  }
}