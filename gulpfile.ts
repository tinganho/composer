
/// <reference path="typings/node/node.d.ts"/>
/// <reference path='typings/gulp/gulp.d.ts'/>
/// <reference path='typings/gulp-generate-ts-diagnostics/gulp-generate-ts-diagnostics.d.ts'/>
/// <reference path='typings/gulp-rename/gulp-rename.d.ts'/>
/// <reference path='typings/rimraf/rimraf.d.ts'/>

import gulp = require('gulp');
import rename = require('gulp-rename');
import generateTsDiagnostics = require('gulp-generate-ts-diagnostics');
import path = require('path');
import fs = require('fs');
import rimraf = require('rimraf');

var removeFolder = rimraf.sync;

var diagnosticMessageProps: generateTsDiagnostics.DiagnosticMessageProperties = [
    {
        name: 'category',
        type: 'string',
    },
];

gulp.task('generate-diagnostics', () => {
    gulp.src('src/diagnostics.json')
        .pipe(rename('diagnostics.generated.ts'))
        .pipe(generateTsDiagnostics(diagnosticMessageProps))
        .pipe(gulp.dest('src/'));
});
gulp.task('d', ['generate-diagnostics']);

gulp.task('accept-baselines', () => {
    removeFolder(path.join(__dirname, 'test/baselines/reference'));

    gulp.src('test/baselines/local/**/*', { base: 'test/baselines/local' })
        .pipe(gulp.dest('test/baselines/reference'));
});
gulp.task('ab', ['accept-baselines']);


gulp.task('default', ['generate-diagnostics']);