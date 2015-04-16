'use strict';
import './app';

var angular = (() => {
  var pkg: any = require('angular');
  return (pkg === 'dummy')
    ? require('angular2/angular2')
    : pkg;
})();

export default angular;