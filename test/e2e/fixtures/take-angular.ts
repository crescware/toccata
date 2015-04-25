/// <reference path="../../../typings/node/node.d.ts" />
'use strict';

const angular = (() => {
  const pkg: any = require('angular');
  return (pkg === 'dummy')
    ? require('angular2/angular2')
    : pkg;
})();

export default angular;