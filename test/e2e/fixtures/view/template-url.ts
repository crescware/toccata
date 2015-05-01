/**
 * This fixture tests about @Component.selector, @View.templateUrl, bootstrap()
 */
'use strict';
import 'babel-core/polyfill';
import angular from '../take-angular';
import displayMode from '../display-mode';
import {Toccata, toccata as toccata_} from '../../../../src/toccata';

const toccata: Toccata = toccata_(angular);
const {Component, View, bootstrap} = toccata;
displayMode(toccata);

@Component({
  selector: 'templateurl'
})
@View({
  templateUrl: './template.html'
})
class TestController {
  value: number;

  constructor() {
    this.value = 0;
  }

  increment() {
    this.value++;
  }
}

bootstrap(TestController);