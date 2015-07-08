
/// <reference path='../../typings/mocha/mocha.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/sinon/sinon.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/nightmare/nightmare.d.ts'/>
/// <reference path='../../typings/chai/chai.d.ts'/>
/// <reference path='../../typings/morgan/morgan.d.ts'/>

import {CommandLineOptions, Map} from './types';
import logger = require('morgan');
import cf from '../../conf/conf';
import * as composer from '../composer/composer';
import {sync as glob} from 'glob';
import * as path from 'path';
import express = require('express');
import * as sinon from 'sinon';
import * as React from 'react';
import * as http from 'http';
import {readFile, writeFileSync} from 'fs';
import {expect} from 'chai';
import Nightmare = require('nightmare');
import {parseCommandLineOptions} from './commandLineParser';
import {printDiagnostics, printDiagnostic} from './core';
import {Diagnostics} from './diagnostics.generated';

declare function require(path: string): any;
require('source-map-support').install();

interface Props {
    layout: string;
}

interface States {}


class Document extends composer.ComposerDocument<Props, States> {
    name = 'Default';

    render() {
        return (
            <html lang="en">
                <head>
                    <link rel="stylesheet" href="/public/styles/styles.css"/>
                </head>
                <body dangerouslySetInnerHTML={{__html: this.props.layout}}>
                </body>
            </html>
        );
    }
}

interface LayoutRegions {
    TopBar: string;
    Body: string;
    Footer: string;
}

let defaultConfigs: composer.DocumentProps = {
    confs: ['default']
}

let app: express.Express;

export default class Harness {
    options: CommandLineOptions;

    constructor(args: string[]) {
        let {options, errors} = parseCommandLineOptions(args);
        if (errors.length > 0) {
            printDiagnostics(errors);
            process.exit();
        }
        this.options = options;
    }

    runTests() {
        let builtFolder = path.join(__dirname, '../../');
        let root = path.join(builtFolder, '../');
        let files = glob('test/cases/*.js', { cwd: builtFolder });
        for (var file of files) {
            var fileName = path.basename(file);

            describe(fileName, () => {
                beforeEach(() => {
                    app = express();
                    app.use('/public', express.static('public'));
                    app.use(logger('dev'));
                    composer.init({
                        app,
                        clientConfPath: './client/*.js',
                        rootPath: __dirname
                    });
                });

                afterEach(() => {
                    app = null;
                });

                it('should be able to set pages', (done) => {
                    composer.setPages({
                        '/': function(page) {
                            let testModule = require(path.join(builtFolder, file.replace(/\.tsx$/, '.js')));
                            page.onPlatform({ name: 'all', detect: (req: express.Request) => true })
                                .hasDocument(Document, defaultConfigs)
                                .hasLayout(testModule.TestLayout, testModule.contents);
                        }
                    });

                    let server = http.createServer(app);
                    server.listen(cf.PORT, (err: any) => {
                        let filePath = path.join(root, `test/baselines/local/${fileName.replace(/\.js$/, '')}`);
                        new Nightmare()
                            .viewport(900, 1200)
                            .goto(`http://${cf.HOST}:${cf.PORT}/`)
                            .wait()
                            .screenshot(`${filePath}.jpg`)
                            .run((err, nightmare) => {
                                if(err) {
                                    printDiagnostic(Diagnostics.Could_not_start_headless_web_browser);
                                }

                                if (this.options.interactive) {
                                    app.get('/__next', closeServer);
                                }
                                else {
                                    closeServer();
                                }
                            });
                    });

                    function closeServer() {
                        server.close((err: any) => {
                            done();
                        });
                    }
                });
            });
        }
    }
}
