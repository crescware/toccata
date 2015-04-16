/**
 * Cresc Toccata
 * @copyright © 2015 Crescware
 */
import operatingMode from './operating-mode';

export interface ToccataStatic {
  bootstrap: Function;
  Component: (def: any) => (decoratee: any) => any;
  View: (def: any) => (decoratee: any) => any;
  core: any;
  operatingMode: string;
}

function bootstrapFactory(angular: any, mode: string) {
  if (mode === 'v2') {
    return angular.bootstrap;
  }
  return () => {};
}

function ComponentFactory(angular: any, mode: string) {
  if (mode === 'v2') {
    return function Component(def: any) {
      var annotation = new angular.Component(def);
      return function (decoratee: any) {
        decoratee.annotations = decoratee.annotations || [];
        if (def.injectables) {
          decoratee.parameters  = decoratee.parameters || [def.injectables];
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

function ViewFactory(angular: any, mode: string) {
  if (mode === 'v2') {
    return function View(def: any) {
      var annotation = new angular.View(def);
      return function (decoratee: any) {
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

export default function toccata(angular: any): ToccataStatic {
  let mode = operatingMode(angular);
  let bootstrap = bootstrapFactory(angular, mode);
  let Component = ComponentFactory(angular, mode);
  let View = ViewFactory(angular, mode);

  return {
    bootstrap: bootstrap,
    Component: Component,
    View: View,
    core: angular,
    operatingMode: mode
  };
}