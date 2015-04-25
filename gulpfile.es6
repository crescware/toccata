'use strict';
import del from 'del';
import glob from 'glob';
import gulp from 'gulp';
import seq from 'run-sequence';
import shell from 'gulp-shell';
import mocha from 'gulp-mocha';

const opt = {
  lib:           './lib',
  npmbin:        './node_modules/.bin',
  src:           './src',
  test:          './test',
  testEspowered: './test-espowered'
};
opt.e2e      = `${opt.test}/e2e`;
opt.fixtures = `${opt.e2e}/fixtures`;
opt.e2eUtils = `${opt.e2e}/utils`;

const bin = {
  tsc:        `${opt.npmbin}/tsc`,
  babel:      `${opt.npmbin}/babel`,
  browserify: `${opt.npmbin}/browserify`
};

/* clean */
gulp.task('clean', del.bind(null, [
  `${opt.fixtures}/**/*.js`,
  `${opt.fixtures}/**/*.js.map`,
  `${opt.src     }/**/*.js`,
  `${opt.src     }/**/*.js.map`,
  `${opt.test    }/unit/**/*.js`,
  `${opt.test    }/unit/**/*.js.map`,
  opt.testEspowered
]));

/* ts */
const tsc = `${bin.tsc} -t es5 -m commonjs --noImplicitAny --noEmitOnError`;
gulp.task('ts:src_',      shell.task([`find ${opt.src}      -name *.ts | xargs ${tsc}`]));
gulp.task('ts:fixtures_', shell.task([`find ${opt.fixtures} -name *.ts | xargs ${tsc}`]));
gulp.task('ts:src',      (done) => seq('clean', 'ts:src_',      done));
gulp.task('ts:fixtures', (done) => seq('clean', 'ts:fixtures_', done));
gulp.task('ts',          (done) => seq('clean', ['ts:src_', 'ts:fixtures_'], done));

/* babel */
const babel = `${bin.babel} ${opt.test}/unit --plugins espower --out-dir ${opt.testEspowered}/unit`;
gulp.task('babel:test', shell.task([babel]));

/* browserify */
gulp.task('watchify_',   shell.task([`watchify`]));
gulp.task('browserify_', shell.task([`browserify`]));

gulp.task('watchify',   (done) => seq('ts', 'babel', 'watchify_', done));
gulp.task('browserify', (done) => seq('ts', 'babel', 'browserify_', done));

/* watch */
gulp.task('watch:js', (done) => seq('clean:bundle', ['ts:example_', 'ts:lib_'], ['babel:example', 'babel:lib'], done));
gulp.task('watch', ['watchify', 'watch:js'], function() {
  gulp.watch([`${opt.fixtures}/**/*.ts`, `${opt.lib}/**/*.ts`], ['watch:js']);
});

/* watch */
gulp.task('exec-watch', ['test'], function() {
  gulp
    .watch([`${opt.src}/**/*.ts`, `${opt.test}/unit/**/*.es6`], ['test'])
    .on('error', (err) => process.exit(1));
});

gulp.task('watch', function() {
  const spawn = () => {
    const proc = require('child_process').spawn('gulp', ['exec-watch'], {stdio: 'inherit'});
    proc.on('close', (c) => spawn());
  };
  spawn();
});

/* build */
gulp.task('copy:src', () => {
  gulp
    .src(`${opt.src}/**/*.js`)
    .pipe(gulp.dest(opt.lib));
});
gulp.task('build:src', (done) => seq(['clean:lib', 'ts:src'], 'copy:src', done));
gulp.task('build',     (done) => seq('build:src', done));

/* test */
function mochaTask(target) {
  return () => {
    return gulp
      .src(`${opt.testEspowered}/${target}/*.js`)
      .pipe(mocha({reporter: 'spec'}));
  };
}
gulp.task('mocha:unit', mochaTask('unit'));
gulp.task('mocha:e2e',  mochaTask('e2e'));
gulp.task('test', (done) => seq('ts:src', 'babel:test', 'mocha:unit', done));

/* e2e build */
const target = [
  '1-3-14',
  '1-3-latest',
  '1-4-latest',
  '2-0-0-alpha-20'
];

/* e2e cp */
const allE2eCp = target.map((v) => {
  const taskName = `e2e-cp:${v}`;
  const filePath = (v.slice(0, 1) === '2') ? 'angular' : 'angular2';
  const fileName = (filePath === 'angular') ? 'index' : 'angular2';
  gulp.task(taskName, shell.task([`
    cp ${opt.e2eUtils}/dummy.js ${opt.e2e}/${v}/node_modules/${filePath} &&
    mv ${opt.e2e}/${v}/node_modules/${filePath}/dummy.js ${opt.e2e}/${v}/node_modules/${filePath}/${fileName}.js
  `]));
  return taskName;
});
gulp.task('e2e-cp', allE2eCp);

/* e2e ln */
const allE2eLn = target.map((v) => {
  const name = `e2e-ln:${v}`;
  gulp.task(name, shell.task([`lndir $PWD/${opt.fixtures} ${opt.e2e}/${v}`]));
  return name;
});
gulp.task('e2e-ln', allE2eLn);

/* e2e browserify */
const allE2eBrowserify = target.map((v) => {
  const name = `e2e-browserify:${v}`;
  gulp.task(name, shell.task([`${bin.browserify} ${opt.test}/e2e/${v}/app.js -o ${opt.e2e}/${v}/bundle.js`]));
  return name;
});
gulp.task('e2e-browserify', allE2eBrowserify);

/* e2e clean */
gulp.task('clean:e2e', del.bind(null, target.map((v) => {
  return `${opt.e2e}/${v}/*.html`;
})));

gulp.task('e2e', (done) => seq('clean:e2e', 'ts:fixtures', ['e2e-cp', 'e2e-ln'], 'e2e-browserify', 'mocha:e2e', done));