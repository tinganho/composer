/// <reference path="typings/node/node.d.ts"/>

var gulp = require('gulp');
var rename = require('gulp-rename');
var generateTsDiagnostics = require('gulp-generate-ts-diagnostics');
var path = require('path');
var fs = require('fs');
var mochaPhantomJs = require('gulp-mocha-phantomjs');
var open = require('open');
var cp = require('child_process');
var es = require('event-stream');
var clean = require('gulp-rimraf');
var sass = require('gulp-sass');

var exec = cp.exec;

gulp.task('clean', function() {
    var cleanLocalStream = gulp.src('local', { read: false })
        .pipe(clean());

    var cleanDistStream = gulp.src('dist', { read: false })
        .pipe(clean());

    return es.concat(cleanLocalStream, cleanDistStream);
});

gulp.task('sass', function () {
  gulp.src('test/imageTests/defaultComponents/**/*.scss', { base: 'test/imageTests/defaultComponents' })
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('public/styles'));
});

gulp.task('compile-typescript-files', ['clean'], function(next) {
    exec('tsc', function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        next(err);
    });
});

gulp.task('copy-server-files', ['clean'], function() {
    var runnerCopyStream = gulp.src('test/cases/unitTests/runner.html', { base: 'test/cases/unitTests' })
        .pipe(gulp.dest('built/test/cases/unitTests'));

    var vendorCopyStream = gulp.src('public/scripts/vendor/**/*', { base: 'public/scripts' })
        .pipe(gulp.dest('built/test/cases/unitTests'));

    var mochaCopyStream = gulp.src('node_modules/mocha/mocha.{css,js}', { base: 'node_modules/mocha' })
        .pipe(gulp.dest('built/test/cases/unitTests/vendor'));

    var chaiCopyStream = gulp.src('node_modules/chai/chai.js', { base: 'node_modules/chai' })
        .pipe(gulp.dest('built/test/cases/unitTests/vendor'));

    return es.concat(runnerCopyStream, vendorCopyStream, mochaCopyStream, chaiCopyStream);
});

gulp.task('compile', ['copy-server-files', 'compile-typescript-files', ]);

gulp.task('unit-tests', ['compile'], function() {
    return gulp
        .src('built/test/unitTests/runner.html')
        .pipe(mochaPhantomJs({ reporter: 'spec', phantomjs: {
            useColors: true,
        }}));
});

gulp.task('image-tests', ['compile'], function(next) {
    exec('node_modules/mocha/bin/mocha built/src/harness/runner.js --reporter spec --timeout 10000 ' + process.argv.slice(3).join(' '), function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        next(err);
    });
});

gulp.task('selenium', function(next) {
    exec('java -jar bin/selenium-server-standalone-2.46.0.jar');
    console.log('Selenium server started. Press CTRL + C to close it.');
});

gulp.task('accept-baselines', function() {
    var cleanStream = gulp.src('test/baselines/reference')
        .pipe(clean());

    var copyStream = gulp.src('test/baselines/local/**/*', { base: 'test/baselines/local' })
        .pipe(gulp.dest('test/baselines/reference'));

    return es.concat(cleanStream, copyStream);
});
gulp.task('ab', ['accept-baselines']);

gulp.task('default', ['generate-diagnostics']);