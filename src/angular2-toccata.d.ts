/**
 * @see https://angular.io/docs/js/latest/api/annotations/Component-class.html
 */
export interface ComponentDefinition {
  selector: string;
  properties: any;          // Does not support in Toccata 0.1.0 V1 mode
  events: any[];            // ditto
  hostListeners: any;       // ditto
  hostProperties: any;      // ditto
  injectables: any[];       // ditto
  lifecycle: any[];         // ditto
  changeDetection: string;  // ditto
  compileChildren: boolean; // ditto
}
