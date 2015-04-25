/// <reference path="../../../typings/node/node.d.ts" />
'use strict';
import angular from './take-angular';
import {Toccata, default as toccata_} from '../../../src/toccata';
const toccata: Toccata = toccata_(angular);

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('toccata-mode')) {
    document.getElementById('toccata-mode').innerText = toccata.operatingMode;
  }
});

//import './component/selector';
import './ng2do/ng2do';
//import './view/template-url';
