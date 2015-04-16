'use strict';
import 'babel-core/polyfill';

import angular from '../take-angular';
import {Toccata, default as toccata_} from '../../../../src/toccata';
let toccata: Toccata = toccata_(angular);

let {Component, View, bootstrap} = toccata;

toccata.initModule('toccataFixtures', []);

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