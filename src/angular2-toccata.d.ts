/**
 * @see https://angular.io/docs/js/latest/api/annotations/Component-class.html
 */
export interface ComponentDefinition {
  selector: string;
  properties: any;          // Does not support in Toccata 0.2.x V1 mode
  events: any[];            // ditto
  hostListeners: any;       // ditto
  hostProperties: any;      // ditto
  injectables: any[];       // ditto
  lifecycle: any[];         // ditto
  changeDetection: string;  // ditto
  compileChildren: boolean; // ditto
}

/**
 * @see https://angular.io/docs/js/latest/api/annotations/View-class.html
 */
export interface ViewDefinition {
  templateUrl: string;
  template: string;
  directives: any[]; // Does not support in Toccata 0.2.x V1 mode
  renderer: string;  // ditto
}
