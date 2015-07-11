
/// <reference path='../../typings/mocha/mocha.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/sinon/sinon.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/nightmare/nightmare.d.ts'/>
/// <reference path='../../typings/morgan/morgan.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>

import { CommandLineOptions, Map } from './types';
import logger = require('morgan');
import cf from '../../conf/conf';
import * as composer from '../composer/serverComposer';
import {sync as glob} from 'glob';
import * as path from 'path';
import express = require('express');
import * as sinon from 'sinon';
import * as React from 'react';
import * as http from 'http';
import Nightmare = require('nightmare');
import { parseCommandLineOptions } from './commandLineParser';
import { printDiagnostics, printDiagnostic } from '../core';
import { Diagnostics } from '../diagnostics.generated';

declare function require(path: string): any;
require('source-map-support').install();

interface Props extends composer.DocumentProps {
    layout: string;
}

class Document extends composer.ComposerDocument<Props, {}> {
    public render() {
        return (
            <html lang='en'>
                <head>
                    <link rel='stylesheet' href='/public/styles/styles.css'/>
                    <script src='/public/scripts/html.js'/>

                    {this.props.jsonScriptData.map(attr => {
                        <script id={attr.id}>{attr.data}</script>
                    })}
                </head>
                <body>
                    {this.props.layout}
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

export default class HtmlRunner {
    public options: CommandLineOptions;

    constructor(args: string[]) {
        let {options, errors} = parseCommandLineOptions(args);
        if (errors.length > 0) {
            printDiagnostics(errors);
            process.exit();
        }
        this.options = options;
    }

    public runTests() {
        let self = this;
        let builtFolder = path.join(__dirname, '../../');
        let root = path.join(builtFolder, '../');
        let pattern: string;
        if (this.options.tests) {
            `test/cases/*${this.options.tests}*.js`
        }
        else {
            pattern = `test/cases/*.js`;
        }
        let files = glob(pattern, { cwd: builtFolder });
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
                        rootPath: __dirname,
                        defaultDocumentFolder: 'documents',
                        defaultLayoutFolder: 'layouts',
                        defaultContentFolder: 'contents',
                    });
                });

                afterEach(() => {
                    app = null;
                });

                it(`image diff of ${fileName}`, function(done) {
                    if (self.options.interactive) {
                        this.timeout(10000000);
                    }

                    let testModule = require(path.join(builtFolder, file.replace(/\.tsx$/, '.js')));
                    composer.setPages({
                        [testModule.route]: function(page) {
                            page.onPlatform({ name: 'all', detect: (req: express.Request) => true })
                                .hasDocument(Document, defaultConfigs)
                                .hasLayout(testModule.TestLayout, testModule.contents)
                                .end()
                        }
                    });

                    let server = http.createServer(app);
                    server.listen(cf.PORT, (err: any) => {
                        let filePath = path.join(root, `test/baselines/local/${fileName.replace(/\.js$/, '')}`);
                        new Nightmare()
                            .viewport(cf.TEST_PAGE_VIEW_PORT.WIDTH, cf.TEST_PAGE_VIEW_PORT.HEIGHT)
                            .goto(`http://${cf.HOST}:${cf.PORT}/`)
                            .wait()
                            .screenshot(`${filePath}.jpg`)
                            .run((err, nightmare) => {
                                if(err) {
                                    printDiagnostic(Diagnostics.Could_not_start_headless_web_browser);
                                }

                                if (self.options.interactive) {
                                    printDiagnostic(Diagnostics.Stop_the_server_by_exiting_the_session_CTRL_plus_C);
                                }
                                else {
                                    server.close((err: any) => {
                                        done();
                                    });
                                }
                            });
                    });
                });
            });
        }
    }
}
