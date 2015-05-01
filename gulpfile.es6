'use strict';
import del from 'del';
import glob from 'glob';
import gulp from 'gulp';
import seq from 'run-sequence';
import shell from 'gulp-shell';
import mocha from 'gulp-mocha';
import path from 'path';

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
gulp.task('clean:lib', del.bind(null, [
  `${opt.lib}`
]));

/* ts */
const tsc = `${bin.tsc} -t es5 -m commonjs --noImplicitAny --noEmitOnError`;
gulp.task('ts:src_',      shell.task([`find ${opt.src}      -name *.ts | xargs ${tsc}`]));
gulp.task('ts:fixtures_', shell.task([`find ${opt.fixtures} -name *.ts | xargs ${tsc}`]));
gulp.task('ts:src',      (done) => seq('clean', 'ts:src_',      done));
gulp.task('ts:fixtures', (done) => seq('clean', 'ts:fixtures_', done));
gulp.task('ts',          (done) => seq('clean', ['ts:src_', 'ts:fixtures_'], done));

/* babel */
function babelForTest(target) {
  return `${bin.babel} ${opt.test}/${target} --plugins espower --out-dir ${opt.testEspowered}/${target}`;
}
gulp.task('babel:unit', shell.task([babelForTest('unit')]));
gulp.task('babel:e2e',  shell.task([babelForTest('e2e/specs')]));

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
      .pipe(mocha({reporter: 'spec'}))
      .on('error', (err) => process.exit(1));
  };
}
gulp.task('mocha:unit', mochaTask('unit'));
gulp.task('mocha:e2e',  mochaTask('e2e/specs'));
gulp.task('test', (done) => seq('ts:src', 'babel:unit', 'mocha:unit', done));

/* e2e build */
const angularVersion = {
  '1-3-14':         'angular@1.3.14',
  '1-3-latest':     'angular@1.3.15',
  '1-4-latest':     'angular@1.4.0-rc.1',
  '2-0-0-alpha-21': 'angular2@2.0.0-alpha.21'
};
const target = Object.keys(angularVersion);

// The fixturesEntryPaths root is ./test/e2e/fixtures/
const fixturesEntryPaths = [
  'component/selector.js',
  'ng2do/ng2do.js',
  'view/template-url.js'
];

/* e2e mkdir */
const allE2eMkdir = target.map((v) => {
  const taskName = `e2e-mkdir:${v}`;
  gulp.task(taskName, shell.task([`
    mkdir -p ${opt.e2e}/${v}/node_modules &&
    mkdir ${opt.e2e}/${v}/node_modules/angular
    mkdir ${opt.e2e}/${v}/node_modules/angular2
  `]));
  return taskName;
});
gulp.task('e2e-mkdir', allE2eMkdir);

/* e2e install long-stack-trace-zone */
const allE2eZoneJs = target.map((v) => {
  const taskName = `e2e-zone-js:${v}`;

  const zoneJsName     = `zone.js`;
  const stackTraceName = `long-stack-trace-zone.js`;
  const repo           = `https://raw.githubusercontent.com/angular/zone.js/master`
  const zoneJs         = `${repo}/${zoneJsName}`;
  const stackTrace     = `${repo}/${stackTraceName}`;

  if (v.slice(0, 1) !== '2' /* if !angular2 */) {
    gulp.task(taskName, shell.task([`
      cd ${opt.e2e}/${v} &&
      echo void 0\\; >> ${zoneJsName}
      echo void 0\\; >> ${stackTraceName}
    `]));
    return taskName;
  }

  gulp.task(taskName, shell.task([`
    cd ${opt.e2e}/${v} &&
    curl ${zoneJs} -O &&
    curl ${stackTrace} -O
  `]));
  return taskName;
});
gulp.task('e2e-zone-js', allE2eZoneJs);

/* e2e install angular */
let allE2eInstallAngularAfter = [];
const allE2eInstallAngular = target.map((v) => {
  const taskName = `e2e-install-angular:${v}`;
  if (v.slice(0, 1) !== '2' /* if !angular2 */) {
    gulp.task(taskName, shell.task([`
      cd ${opt.e2e}/${v}/node_modules &&
      npm i ${angularVersion[v]}
    `]));
    return taskName;
  }

  const builder  = `commonjs-friendly-angular2`;
  const products = `${opt.e2e}/${v}/node_modules/${builder}/products`;
  gulp.task(taskName, shell.task([`
    cd ${opt.e2e}/${v}/node_modules &&
    npm i ${builder}
  `]));
  gulp.task(`${taskName}-after`, shell.task([`
    mv -f ${products}/angular2    ${opt.e2e}/${v}/node_modules &&
    mv -f ${products}/rtts_assert ${opt.e2e}/${v}/node_modules
  `]));
  allE2eInstallAngularAfter.push(`${taskName}-after`);
  return taskName;
});
gulp.task('e2e-install-angular',       allE2eInstallAngular);
gulp.task('e2e-install-angular-after', allE2eInstallAngularAfter);

/* e2e cp */
const allE2eCp = target.map((v) => {
  const taskName = `e2e-cp:${v}`;
  // For the passage of the build, the other versions Angular it is necessary to dummy
  const dummyDest = (v.slice(0, 1) === '2' /* if angular2 */) ? 'angular' : 'angular2';
  const dummyPath = `${opt.e2e}/${v}/node_modules/${dummyDest}`;
  const original  = 'dummy.js';
  const dummyName = (dummyDest === 'angular') ? 'index.js' : 'angular2.js';
  gulp.task(taskName, shell.task([`
    cp ${opt.e2eUtils}/${original} ${dummyPath} &&
    mv ${dummyPath}/${original} ${dummyPath}/${dummyName}
  `]));
  return taskName;
});
gulp.task('e2e-cp', allE2eCp);

/* e2e ln */
const allE2eLn = target.map((v) => {
  const taskName = `e2e-ln:${v}`;
  // Create a link to all of the directory
  gulp.task(taskName, shell.task([
    `lndir $PWD/${opt.fixtures} ${opt.e2e}/${v}`
  ]));
  return taskName;
});
gulp.task('e2e-ln', allE2eLn);

/* e2e browserify */
const allE2eBrowserify = target.map((v) => {
  const taskNameOfEachVer = fixturesEntryPaths.map((entry) => {
    const bundleName = path.basename(entry, '.js');
    const taskName = `e2e-browserify:${v}:${entry}`;
    gulp.task(taskName, shell.task([
      `${bin.browserify} ${opt.test}/e2e/${v}/${entry} -o ${opt.e2e}/${v}/bundle-${bundleName}.js`
    ]));
    return taskName;
  });

  return taskNameOfEachVer;
});
// allE2eBrowserify needs flatten
gulp.task('e2e-browserify', Array.prototype.concat.apply([], allE2eBrowserify));

/* e2e clean */
gulp.task('clean:init-e2e', del.bind(null, target.map((v) => {
  return `${opt.e2e}/${v}/`;
})));
gulp.task('clean:e2e', del.bind(null, target.map((v) => {
  return `${opt.e2e}/${v}/*.html`;
})));

gulp.task('e2e:init', (done) => seq('clean:init-e2e', 'e2e-mkdir', ['e2e-install-angular', 'e2e-zone-js'], 'e2e-install-angular-after', done));
gulp.task('build:fixtures', (done) => seq('clean:e2e', 'ts:fixtures', ['e2e-cp', 'e2e-ln'], 'e2e-browserify', done));
gulp.task('e2e', (done) => seq(['build:fixtures', 'babel:e2e'], 'mocha:e2e', done));