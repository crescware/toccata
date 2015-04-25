'use strict';
import 'babel-core/polyfill';
import angular from '../take-angular';
import displayMode from '../display-mode';
import {Toccata, default as toccata_} from '../../../../src/toccata';

const toccata: Toccata = toccata_(angular);
const {Component, View, bootstrap} = toccata;
displayMode(toccata);

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