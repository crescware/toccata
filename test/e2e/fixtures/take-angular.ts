/// <reference path="../../../typings/node/node.d.ts" />
'use strict';
var angular1 = require('angular');
var angular2 = require('angular2/angular2');

const angular = (() => {
  return (angular1 === 'dummy') ? angular2 : angular1;
})();

export default angular;