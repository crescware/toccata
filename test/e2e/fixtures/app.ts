/// <reference path="../../../typings/node/node.d.ts" />

import angular from './take-angular';
import toccata from '../../../src/toccata';

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('toccata-mode').innerText = toccata(angular).operatingMode;
});