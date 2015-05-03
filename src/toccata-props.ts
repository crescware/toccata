export type Decoratable = (def: any) => (decoratee: any) => any;

export interface ToccataProps {
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
}
