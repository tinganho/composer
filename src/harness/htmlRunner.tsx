
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
import { cf } from '../../conf/conf';
import { ServerComposer, DocumentProps, ComposerDocument } from '../composer/serverComposer';
import React = require('react');
import {sync as glob} from 'glob';
import * as path from 'path';
import express = require('express');
import { createServer } from 'http';
import HeadlessWebBrowser = require('nightmare');
import { parseCommandLineOptions } from './commandLineParser';
import { printDiagnostics, printDiagnostic } from '../core';
import { Diagnostics } from '../diagnostics.generated';
import { expect } from 'chai';

declare function require(path: string): any;
require('source-map-support').install();

interface Props extends DocumentProps {
    layout: string;
}

class Document extends ComposerDocument<Props, {}> {
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

let defaultConfigs: DocumentProps = {
    confs: ['default']
}

export default class HtmlRunner {
    public options: CommandLineOptions;
    public builtFolder = path.join(__dirname, '../../');
    public root = path.join(this.builtFolder, '../');

    constructor(args: string[]) {
        let {options, errors} = parseCommandLineOptions(args);
        if (errors.length > 0) {
            printDiagnostics(errors);
            process.exit();
        }
        this.options = options;
    }

    public createComposer(app: express.Express, fileName: string, shouldEmitComposer: boolean): ServerComposer {
        app.use('/public', express.static('public'));
        app.use(logger('dev'));

        let serverComposer = new ServerComposer({
            app,
            clientConfPath: './client/*.js',
            rootPath: __dirname,
            defaultDocumentFolder: 'documents',
            defaultLayoutFolder: 'layouts',
            defaultContentFolder: 'contents',
        });

        if (shouldEmitComposer) {
            serverComposer.shouldEmitWebClientComposer(`test/baselines/local/${fileName}.js`);
        }

        let testModule = require(path.join(this.builtFolder, `test/cases/${fileName}.js`));
        serverComposer.setPages({
            [testModule.route]: page => {
                page.onPlatform({ name: 'all', detect: (req: express.Request) => true })
                    .hasDocument(Document, defaultConfigs)
                    .hasLayout(testModule.TestLayout, testModule.contents)
                    .end();
            }
        });

        return serverComposer;
    }

    public runTests(): void {
        let self = this;
        let pattern: string;
        if (this.options.tests) {
            `test/cases/*${this.options.tests}*.js`
        }
        else {
            pattern = `test/cases/*.js`;
        }
        let files = glob(pattern, { cwd: this.builtFolder });
        for (var file of files) {
            var jsFileName = path.basename(file);
            var fileName = jsFileName.replace(/\.js$/, '');

            (function(fileName: string) {
                describe('Web client tests:', () => {
                    it(`image for ${fileName}`, function(done) {
                        if (self.options.interactive) {
                            this.timeout(10000000);
                        }

                        let app = express();
                        let serverComposer = self.createComposer(app, fileName, /*shouldEmitComposer*/false);
                        serverComposer.start(err => {
                            let filePath = path.join(this.root, `test/baselines/local/${fileName}`);
                            new HeadlessWebBrowser()
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
                                        serverComposer.stop(err => {
                                            app = undefined;
                                            serverComposer = undefined;
                                            done();
                                        });
                                    }
                                });
                        });
                    });

                    it(`web client composer for ${fileName}`, done => {
                        let app = express();
                        let serverComposer = self.createComposer(app, fileName, /*shouldEmitComposer*/true);
                    });
                });
            })(fileName);

        }
    }
}
