
var gulp = require('gulp');
var rename = require('gulp-rename');
var generateTsDiagnostics = require('gulp-generate-ts-diagnostics');
var path = require('path');
var fs = require('fs');
var mochaPhantomJs = require('gulp-mocha-phantomjs');
var connect = require('gulp-connect');
var open = require('open');
var cp = require('child_process');
var es = require('event-stream');
var clean = require('gulp-rimraf');

var exec = cp.exec;

gulp.task('clean', function() {
    var cleanLocalStream = gulp.src('local', { read: false })
        .pipe(clean());

    var cleanDistStream = gulp.src('dist', { read: false })
        .pipe(clean());

    return es.concat(cleanLocalStream, cleanDistStream);
});

gulp.task('server-test', function() {
    connect.server({
        root: ['local', 'local/src'],
        port: 3000
    });

    open('http://localhost:3000/test/runner.html');
});

gulp.task('compile-typescript-files', ['clean'], function(next) {
    exec('tsc', function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        next(err);
    });
});

gulp.task('copy-server-files', ['clean'], function() {
    var runnerCopyStream = gulp.src('./test/runner.html', { base: './test' })
        .pipe(gulp.dest('./local/test'));

    var vendorCopyStream = gulp.src('./test/vendor/**/*', { base: './test' })
        .pipe(gulp.dest('./local/test'));

    var mochaCopyStream = gulp.src('./node_modules/mocha/mocha.{css,js}', { base: './node_modules/mocha' })
        .pipe(gulp.dest('./local/test/vendor'));

    var chaiCopyStream = gulp.src('./node_modules/chai/chai.js', { base: './node_modules/chai' })
        .pipe(gulp.dest('./local/test/vendor'));

    return es.concat(runnerCopyStream, vendorCopyStream, mochaCopyStream, chaiCopyStream);
});

gulp.task('compile', ['copy-server-files', 'compile-typescript-files', ]);

gulp.task('dist', ['compile'], function() {
    gulp.src('local/src/component/index.js')
        .pipe(browserify({
            insertGlobals: false,
            debug: false
        }))
        .pipe(rename('composer-component.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('test', ['compile'], function() {
    return gulp
        .src('local/test/runner.html')
        .pipe(mochaPhantomJs({ reporter: 'spec', phantomjs: {
            useColors: true,
        }}));
});

var diagnosticMessageProps = [
    {
        name: 'category',
        type: 'string',
    },
];

gulp.task('generate-diagnostics', function() {
    gulp.src('src/diagnostics.json')
        .pipe(rename('diagnostics.generated.ts'))
        .pipe(generateTsDiagnostics(diagnosticMessageProps))
        .pipe(gulp.dest('src/'));
});
gulp.task('d', ['generate-diagnostics']);

gulp.task('accept-baselines', function() {
    var cleanStream = gulp.src('test/baselines/reference')
        .pipe(clean());

    var copyStream = gulp.src('test/baselines/local/**/*', { base: 'test/baselines/local' })
        .pipe(gulp.dest('test/baselines/reference'));

    return es.concat(cleanStream, copyStream);
});
gulp.task('ab', ['accept-baselines']);

gulp.task('default', ['generate-diagnostics']);