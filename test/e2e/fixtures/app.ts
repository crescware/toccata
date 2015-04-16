/// <reference path="../../../typings/node/node.d.ts" />

import angular from './take-angular';
import {ToccataStatic, default as toccata_} from '../../../src/toccata';
var toccata: ToccataStatic = toccata_(angular);

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('toccata-mode').innerText = toccata.operatingMode;
});