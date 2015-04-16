/// <reference path="../../../typings/node/node.d.ts" />
'use strict';

import angular from './take-angular';
import {ToccataStatic, default as toccata_} from '../../../src/toccata';
let toccata: ToccataStatic = toccata_(angular);

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('toccata-mode')) {
    document.getElementById('toccata-mode').innerText = toccata.operatingMode;
  }
});

import './component/selector';