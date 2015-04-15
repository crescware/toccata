'use strict';
var del = require('del');
var espower = require('gulp-espower');
var glob = require('glob');
var gulp = require('gulp');
var seq = require('run-sequence');
var shell = require('gulp-shell');
var mocha = require('gulp-mocha');

var opt = {
  lib:           './lib',
  src:           './src',
  test:          './test',
  testEs5:       './test-es5',
  testEspowered: './test-espowered'
};
opt.e2e      = `${opt.test}/e2e`;
opt.fixtures = `${opt.e2e}/fixtures`;
opt.e2eUtils = `${opt.e2e}/utils`;

/* clean */
gulp.task('clean', del.bind(null, [
  opt.src + '/**/*.js',
  opt.src + '/**/*.js.map',
  opt.test + '/unit/**/*.js',
  opt.test + '/unit/**/*.js.map',
  opt.fixtures + '/**/*.js',
  opt.fixtures + '/**/*.js.map',
  opt.testEs5,
  opt.testEspowered
]));

/* ts */
var tsc = 'tsc -t es5 -m commonjs --noImplicitAny';
gulp.task('ts:src_',      shell.task([`find ${opt.src}      -name *.ts | xargs ${tsc}`]));
gulp.task('ts:fixtures_', shell.task([`find ${opt.fixtures} -name *.ts | xargs ${tsc}`]));
gulp.task('ts:src',      function(done) {seq('clean', 'ts:src_',      done)});
gulp.task('ts:fixtures', function(done) {seq('clean', 'ts:fixtures_', done)});
gulp.task('ts',          function(done) {seq('clean', ['ts:src_', 'ts:fixtures_'], done)});

/* babel */
gulp.task('babel:test', shell.task([`babel ${opt.test}/unit --out-dir ${opt.testEs5}/unit`]));

/* browserify */
gulp.task('watchify_',   shell.task([`watchify`]));
gulp.task('browserify_', shell.task([`browserify`]));

gulp.task('watchify',   function(done) {seq('ts', 'babel', 'watchify_', done)});
gulp.task('browserify', function(done) {seq('ts', 'babel', 'browserify_', done)});

/* watch */
gulp.task('watch:js', function(done) {seq('clean:bundle', ['ts:example_', 'ts:lib_'], ['babel:example', 'babel:lib'], done)});
gulp.task('watch', ['watchify', 'watch:js'], function() {
  gulp.watch([`${opt.example}/**/*.ts`, `${opt.lib}/**/*.ts`], ['watch:js']);
});

/* watch */
gulp.task('exec-watch', ['test'], function() {
  gulp.watch([`${opt.src}/**/*.ts`, `${opt.test}/**/*.es6`], ['test'])
    .on('error', function(err) {
      process.exit(1);
    });
});

gulp.task('watch', function() {
  var spawn = function() {
    var proc = require('child_process').spawn('gulp', ['exec-watch'], {stdio: 'inherit'});
    proc.on('close', function(c) {
      spawn();
    });
  };
  spawn();
});

/* build */
gulp.task('copy:src', function() {
  gulp.src(`${opt.src}/**/*.js`)
    .pipe(gulp.dest(opt.lib));
});
gulp.task('build:src', function(done) {seq(['clean:lib', 'ts:src'], 'copy:src', done)});
gulp.task('build',     function(done) {seq('build:src', done)});

/* test */
gulp.task('espower', function() {
  return gulp.src(`${opt.testEs5}/**/*.js`)
    .pipe(espower())
    .pipe(gulp.dest(opt.testEspowered));
});

function mochaTask(target) {
  return function() {
    return gulp.src(`${opt.testEspowered}/${target}/*.js`)
      .pipe(mocha({reporter: 'spec'}));
  };
}
gulp.task('mocha:unit', mochaTask('unit'));
gulp.task('mocha:e2e',  mochaTask('e2e'));
gulp.task('test', function(done) {seq('ts:src_', ['babel:src', 'babel:test'], 'espower', 'mocha:unit', done)});

/* e2e build */
var target = [
  '1-3-14',
  '1-3-latest',
  '1-4-latest',
  '2-0-0-alpha-19'
];

var allE2eCp = target.map(function(v) {
  var taskName = `e2e-cp:${v}`;
  var filePath = (v.slice(0, 1) === '2') ? 'angular' : 'angular2';
  var fileName = (filePath === 'angular') ? 'index' : 'angular2';
  gulp.task(taskName, shell.task([`
    cp ${opt.e2eUtils}/dummy.js ${opt.e2e}/${v}/node_modules/${filePath} &&
    mv ${opt.e2e}/${v}/node_modules/${filePath}/dummy.js ${opt.e2e}/${v}/node_modules/${filePath}/${fileName}.js
  `]));
  return taskName;
});
gulp.task('e2e-Cp', allE2eCp);

var allE2eLn = target.map(function(v) {
  var name = `e2e-ln:${v}`;
  gulp.task(name, shell.task([`lndir $PWD/${opt.fixtures} ${opt.e2e}/${v}`]));
  return name;
});
gulp.task('e2e-ln', allE2eLn);

var allE2eBrowserify = target.map(function(v) {
  var name = `e2e-browserify:${v}`;
  gulp.task(name, shell.task([`browserify ${opt.test}/e2e/${v}/app.js -o ${opt.e2e}/${v}/bundle.js`]));
  return name;
});
gulp.task('e2e-browserify', allE2eBrowserify);

gulp.task('clean:e2e', del.bind(null, target.map(function(v) {
  return `${opt.e2e}/${v}/*.html`;
})));

gulp.task('e2e', function(done) {seq('clean:e2e', 'ts:fixtures', ['e2e-Cp', 'e2e-ln'], 'e2e-browserify', 'mocha:e2e', done)});