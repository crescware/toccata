'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _del = require('del');

var _del2 = _interopRequireWildcard(_del);

var _glob = require('glob');

var _glob2 = _interopRequireWildcard(_glob);

var _gulp = require('gulp');

var _gulp2 = _interopRequireWildcard(_gulp);

var _seq = require('run-sequence');

var _seq2 = _interopRequireWildcard(_seq);

var _shell = require('gulp-shell');

var _shell2 = _interopRequireWildcard(_shell);

var _mocha = require('gulp-mocha');

var _mocha2 = _interopRequireWildcard(_mocha);

var _path = require('path');

var _path2 = _interopRequireWildcard(_path);

var opt = {
  lib: './lib',
  npmbin: './node_modules/.bin',
  src: './src',
  test: './test',
  testEspowered: './test-espowered'
};
opt.e2e = '' + opt.test + '/e2e';
opt.fixtures = '' + opt.e2e + '/fixtures';
opt.e2eUtils = '' + opt.e2e + '/utils';

var bin = {
  tsc: '' + opt.npmbin + '/tsc',
  babel: '' + opt.npmbin + '/babel',
  browserify: '' + opt.npmbin + '/browserify'
};

/* clean */
_gulp2['default'].task('clean', _del2['default'].bind(null, ['' + opt.fixtures + '/**/*.js', '' + opt.fixtures + '/**/*.js.map', '' + opt.src + '/**/*.js', '' + opt.src + '/**/*.js.map', '' + opt.test + '/unit/**/*.js', '' + opt.test + '/unit/**/*.js.map', opt.testEspowered]));
_gulp2['default'].task('clean:lib', _del2['default'].bind(null, ['' + opt.lib]));

/* ts */
var tsc = '' + bin.tsc + ' -t es5 -m commonjs --noImplicitAny --noEmitOnError';
_gulp2['default'].task('ts:src_', _shell2['default'].task(['find ' + opt.src + '      -name *.ts | xargs ' + tsc]));
_gulp2['default'].task('ts:fixtures_', _shell2['default'].task(['find ' + opt.fixtures + ' -name *.ts | xargs ' + tsc]));
_gulp2['default'].task('ts:src', function (done) {
  return _seq2['default']('clean', 'ts:src_', done);
});
_gulp2['default'].task('ts:fixtures', function (done) {
  return _seq2['default']('clean', 'ts:fixtures_', done);
});
_gulp2['default'].task('ts', function (done) {
  return _seq2['default']('clean', ['ts:src_', 'ts:fixtures_'], done);
});

/* babel */
var babel = '' + bin.babel + ' ' + opt.test + '/unit --plugins espower --out-dir ' + opt.testEspowered + '/unit';
_gulp2['default'].task('babel:test', _shell2['default'].task([babel]));

/* browserify */
_gulp2['default'].task('watchify_', _shell2['default'].task(['watchify']));
_gulp2['default'].task('browserify_', _shell2['default'].task(['browserify']));

_gulp2['default'].task('watchify', function (done) {
  return _seq2['default']('ts', 'babel', 'watchify_', done);
});
_gulp2['default'].task('browserify', function (done) {
  return _seq2['default']('ts', 'babel', 'browserify_', done);
});

/* watch */
_gulp2['default'].task('watch:js', function (done) {
  return _seq2['default']('clean:bundle', ['ts:example_', 'ts:lib_'], ['babel:example', 'babel:lib'], done);
});
_gulp2['default'].task('watch', ['watchify', 'watch:js'], function () {
  _gulp2['default'].watch(['' + opt.fixtures + '/**/*.ts', '' + opt.lib + '/**/*.ts'], ['watch:js']);
});

/* watch */
_gulp2['default'].task('exec-watch', ['test'], function () {
  _gulp2['default'].watch(['' + opt.src + '/**/*.ts', '' + opt.test + '/unit/**/*.es6'], ['test']).on('error', function (err) {
    return process.exit(1);
  });
});

_gulp2['default'].task('watch', function () {
  var spawn = (function (_spawn) {
    function spawn() {
      return _spawn.apply(this, arguments);
    }

    spawn.toString = function () {
      return _spawn.toString();
    };

    return spawn;
  })(function () {
    var proc = require('child_process').spawn('gulp', ['exec-watch'], { stdio: 'inherit' });
    proc.on('close', function (c) {
      return spawn();
    });
  });
  spawn();
});

/* build */
_gulp2['default'].task('copy:src', function () {
  _gulp2['default'].src('' + opt.src + '/**/*.js').pipe(_gulp2['default'].dest(opt.lib));
});
_gulp2['default'].task('build:src', function (done) {
  return _seq2['default'](['clean:lib', 'ts:src'], 'copy:src', done);
});
_gulp2['default'].task('build', function (done) {
  return _seq2['default']('build:src', done);
});

/* test */
function mochaTask(target) {
  return function () {
    return _gulp2['default'].src('' + opt.testEspowered + '/' + target + '/*.js').pipe(_mocha2['default']({ reporter: 'spec' }));
  };
}
_gulp2['default'].task('mocha:unit', mochaTask('unit'));
_gulp2['default'].task('mocha:e2e', mochaTask('e2e'));
_gulp2['default'].task('test', function (done) {
  return _seq2['default']('ts:src', 'babel:test', 'mocha:unit', done);
});

/* e2e build */
var angularVersion = {
  '1-3-14': 'angular@1.3.14',
  '1-3-latest': 'angular@1.3.15',
  '1-4-latest': 'angular@1.4.0-rc.1',
  '2-0-0-alpha-21': 'angular2@2.0.0-alpha.21'
};
var target = Object.keys(angularVersion);

// The fixturesEntryPaths root is ./test/e2e/fixtures/
var fixturesEntryPaths = ['component/selector.js', 'ng2do/ng2do.js', 'view/template-url.js'];

/* e2e mkdir */
var allE2eMkdir = target.map(function (v) {
  var taskName = 'e2e-mkdir:' + v;
  _gulp2['default'].task(taskName, _shell2['default'].task(['\n    mkdir -p ' + opt.e2e + '/' + v + '/node_modules &&\n    mkdir ' + opt.e2e + '/' + v + '/node_modules/angular\n    mkdir ' + opt.e2e + '/' + v + '/node_modules/angular2\n  ']));
  return taskName;
});
_gulp2['default'].task('e2e-mkdir', allE2eMkdir);

/* e2e install long-stack-trace-zone */
var allE2eZoneJs = target.map(function (v) {
  var taskName = 'e2e-zone-js:' + v;

  var zoneJsName = 'zone.js';
  var stackTraceName = 'long-stack-trace-zone.js';
  var repo = 'https://raw.githubusercontent.com/angular/zone.js/master';
  var zoneJs = '' + repo + '/' + zoneJsName;
  var stackTrace = '' + repo + '/' + stackTraceName;

  if (v.slice(0, 1) !== '2' /* if !angular2 */) {
    _gulp2['default'].task(taskName, _shell2['default'].task(['\n      cd ' + opt.e2e + '/' + v + ' &&\n      echo void 0\\; >> ' + zoneJsName + '\n      echo void 0\\; >> ' + stackTraceName + '\n    ']));
    return taskName;
  }

  _gulp2['default'].task(taskName, _shell2['default'].task(['\n    cd ' + opt.e2e + '/' + v + ' &&\n    curl ' + zoneJs + ' -O &&\n    curl ' + stackTrace + ' -O\n  ']));
  return taskName;
});
_gulp2['default'].task('e2e-zone-js', allE2eZoneJs);

/* e2e install angular */
var allE2eInstallAngularAfter = [];
var allE2eInstallAngular = target.map(function (v) {
  var taskName = 'e2e-install-angular:' + v;
  if (v.slice(0, 1) !== '2' /* if !angular2 */) {
    _gulp2['default'].task(taskName, _shell2['default'].task(['\n      cd ' + opt.e2e + '/' + v + '/node_modules &&\n      npm i ' + angularVersion[v] + '\n    ']));
    return taskName;
  }

  var builder = 'commonjs-friendly-angular2';
  var products = '' + opt.e2e + '/' + v + '/node_modules/' + builder + '/products';
  _gulp2['default'].task(taskName, _shell2['default'].task(['\n    cd ' + opt.e2e + '/' + v + '/node_modules &&\n    npm i ' + builder + '\n  ']));
  _gulp2['default'].task('' + taskName + '-after', _shell2['default'].task(['\n    mv -f ' + products + '/angular2    ' + opt.e2e + '/' + v + '/node_modules &&\n    mv -f ' + products + '/rtts_assert ' + opt.e2e + '/' + v + '/node_modules\n  ']));
  allE2eInstallAngularAfter.push('' + taskName + '-after');
  return taskName;
});
_gulp2['default'].task('e2e-install-angular', allE2eInstallAngular);
_gulp2['default'].task('e2e-install-angular-after', allE2eInstallAngularAfter);

/* e2e cp */
var allE2eCp = target.map(function (v) {
  var taskName = 'e2e-cp:' + v;
  // For the passage of the build, the other versions Angular it is necessary to dummy
  var dummyDest = v.slice(0, 1) === '2' /* if angular2 */ ? 'angular' : 'angular2';
  var dummyPath = '' + opt.e2e + '/' + v + '/node_modules/' + dummyDest;
  var original = 'dummy.js';
  var dummyName = dummyDest === 'angular' ? 'index.js' : 'angular2.js';
  _gulp2['default'].task(taskName, _shell2['default'].task(['\n    cp ' + opt.e2eUtils + '/' + original + ' ' + dummyPath + ' &&\n    mv ' + dummyPath + '/' + original + ' ' + dummyPath + '/' + dummyName + '\n  ']));
  return taskName;
});
_gulp2['default'].task('e2e-cp', allE2eCp);

/* e2e ln */
var allE2eLn = target.map(function (v) {
  var taskName = 'e2e-ln:' + v;
  // Create a link to all of the directory
  _gulp2['default'].task(taskName, _shell2['default'].task(['lndir $PWD/' + opt.fixtures + ' ' + opt.e2e + '/' + v]));
  return taskName;
});
_gulp2['default'].task('e2e-ln', allE2eLn);

/* e2e browserify */
var allE2eBrowserify = target.map(function (v) {
  var taskNameOfEachVer = fixturesEntryPaths.map(function (entry) {
    var bundleName = _path2['default'].basename(entry, '.js');
    var taskName = 'e2e-browserify:' + v + ':' + entry;
    _gulp2['default'].task(taskName, _shell2['default'].task(['' + bin.browserify + ' ' + opt.test + '/e2e/' + v + '/' + entry + ' -o ' + opt.e2e + '/' + v + '/bundle-' + bundleName + '.js']));
    return taskName;
  });

  return taskNameOfEachVer;
});
// allE2eBrowserify needs flatten
_gulp2['default'].task('e2e-browserify', Array.prototype.concat.apply([], allE2eBrowserify));

/* e2e clean */
_gulp2['default'].task('clean:init-e2e', _del2['default'].bind(null, target.map(function (v) {
  return '' + opt.e2e + '/' + v + '/';
})));
_gulp2['default'].task('clean:e2e', _del2['default'].bind(null, target.map(function (v) {
  return '' + opt.e2e + '/' + v + '/*.html';
})));

_gulp2['default'].task('e2e:init', function (done) {
  return _seq2['default']('clean:init-e2e', 'e2e-mkdir', ['e2e-install-angular', 'e2e-zone-js'], 'e2e-install-angular-after', done);
});
_gulp2['default'].task('build:fixtures', function (done) {
  return _seq2['default']('clean:e2e', 'ts:fixtures', ['e2e-cp', 'e2e-ln'], 'e2e-browserify', done);
});
_gulp2['default'].task('e2e', function (done) {
  return _seq2['default']('build:fixtures', 'mocha:e2e', done);
});
