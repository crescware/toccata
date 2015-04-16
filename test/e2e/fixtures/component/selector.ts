import 'babel-core/polyfill';

import angular from '../take-angular';
import {ToccataStatic, default as toccata_} from '../../../../src/toccata';
let toccata: ToccataStatic = toccata_(angular);

let {Component, View, bootstrap} = toccata;

@Component({
  selector: 'hello'
})
@View({
  template: `<p>Hello!</p>`
})
class HelloController {
  constructor() {
    // noop
  }
}

bootstrap(HelloController);