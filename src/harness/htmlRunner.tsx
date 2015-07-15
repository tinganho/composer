
/// <reference path='../../typings/mocha/mocha.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/sinon/sinon.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/nightmare/nightmare.d.ts'/>
/// <reference path='../../typings/morgan/morgan.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>
/// <reference path='../../typings/connect-modrewrite/connect-modrewrite.d.ts'/>

import { CommandLineOptions, Map } from './types';
import logger = require('morgan');
import { cf } from '../../conf/conf';
import { ServerComposer } from '../composer/serverComposer';
import { ModuleKind } from '../composer/webClientComposerEmitter';
import { DocumentProps, ComposerDocument } from '../client/components';
import React = require('react');
import {sync as glob} from 'glob';
import * as path from 'path';
import express = require('express');
import { createServer } from 'http';
import HeadlessWebBrowser = require('nightmare');
import { parseCommandLineOptions } from './commandLineParser';
import { printDiagnostics, printDiagnostic, printError, Debug } from '../core';
import { sys } from '../sys';
import { Diagnostics } from '../diagnostics.generated';
import rewrite = require('connect-modrewrite');
import { expect } from 'chai';

declare function require(path: string): any;
require('source-map-support').install();

interface ProjectFile {
    route: string;
}

export default class HtmlRunner {
    public options: CommandLineOptions;
    public builtFolder = path.join(__dirname, '../../');
    public root = path.join(this.builtFolder, '../');

    constructor(args: string[]) {
        let { options, errors } = parseCommandLineOptions(args);
        if (errors.length > 0) {
            printDiagnostics(errors);
            process.exit();
        }
        this.options = options;
    }

    public createComposer(app: express.Express, folderPath: string, fileName: string, projectFile: ProjectFile,  shouldEmitComposer: boolean): ServerComposer {
        let componentFolderPath = path.join(folderPath, 'components');
        let folderName = path.basename(folderPath);
        if (!folderName) {
            Debug.fail(Diagnostics.Could_not_get_folder_name_from_0, folderPath);
        }
        app.use(rewrite([
            '^\\/react.js /public/scripts/vendor/react.js [L]',
            '^\\/radium.js /public/scripts/vendor/radium.js [L]'
        ]));
        app.use('/src/client', express.static(path.join(this.root, 'built/src/client')));
        app.use('/public', express.static(path.join(this.root, 'public')));
        app.use('/' + componentFolderPath, express.static(path.join('built', folderPath, 'components')));
        app.use(logger('dev'));

        let serverComposer = new ServerComposer({
            app,
            clientRouterOutput: 'public/scripts/router.js',
            bindingsOutput: 'public/scripts/bindings.js',
            clientConfigurationPath: './client/*.js',
            rootPath: this.root,
            moduleKind: ModuleKind.CommonJs,
        }, this.options);

        let documentFile = require(path.join(this.root, 'built', folderPath, 'components/Document.js'));
        let layoutFile = require(path.join(this.root, 'built', folderPath, 'components/Layout.js'));

        serverComposer.setPages({
            [projectFile.route]: page => {
                page.onPlatform({ name: 'all', detect: (req: express.Request) => true })
                    .hasDocument({ component: documentFile.Document, importPath: path.join(componentFolderPath, 'Document.js') }, documentFile.defaultConfigs)
                    .hasLayout({ component: layoutFile.Layout, importPath: path.join(componentFolderPath, 'Layout.js') }, layoutFile.contents)
                    .end();
            }
        });

        return serverComposer;
    }

    private stopServerDueToError(serverComposer: ServerComposer, err: Error, callback: () => void) {
        printError(err);
        serverComposer.stop(callback);
    }

    public runTests(): void {
        let self = this;
        let pattern: string;
        if (this.options.tests) {
            `test/cases/**/*${this.options.tests}*.json`
        }
        else {
            pattern = 'test/cases/projects/**/config.js';
        }
        let filePaths = glob(pattern, { cwd: this.builtFolder });

        for (var filePath of filePaths) {
            var folderPath = path.dirname(filePath);
            var jsFileName = path.basename(filePath);
            var fileName = jsFileName.replace(/\.js$/, '');

            (function(folderPath: string, fileName: string) {
                let projectFile = require(path.join(self.root, 'built', folderPath, 'config.js')) as ProjectFile;

                describe('Web client tests:', () => {
                    it(`image for ${fileName}`, function(done) {
                        if (self.options.interactive) {
                            this.timeout(10000000);
                        }

                        let app = express();
                        let serverComposer = self.createComposer(app, folderPath, fileName, projectFile, /*shouldEmitComposer*/false);
                        serverComposer.start(err => {
                            if (err) {
                                return self.stopServerDueToError(serverComposer, err, () => done());
                            }

                            self.testWithHeadlessWebBrowser(app, serverComposer, fileName, projectFile, done);
                        });
                    });

                    it(`web client composer for ${fileName}`, done => {
                        let app = express();
                        let serverComposer = self.createComposer(app, folderPath, fileName, projectFile, /*shouldEmitComposer*/true);
                        done();
                    });
                });
            })(folderPath, fileName);
        }
    }

    private testWithHeadlessWebBrowser(app: express.Express, serverComposer: ServerComposer, fileName: string, projectFile: ProjectFile, next: () => void) {
        let filePath = path.join(this.root, `test/baselines/local/${fileName}`);
        new HeadlessWebBrowser({ port: 7000 })
            .viewport(cf.TEST_PAGE_VIEW_PORT.WIDTH, cf.TEST_PAGE_VIEW_PORT.HEIGHT)
            .goto(`http://${cf.HOST}:${cf.PORT}${projectFile.route}`)
            .wait()
            .screenshot(`${filePath}.jpg`)
            .run((err, headlessWebBrowser) => {
                if(err) {
                    printDiagnostic(Diagnostics.Could_not_start_headless_web_browser);
                    printError(err);
                }

                if (this.options.interactive) {
                    printDiagnostic(Diagnostics.Stop_the_server_by_exiting_the_session_CTRL_plus_C);
                }
                else {
                    serverComposer.stop(err => {
                        app = undefined;
                        serverComposer = undefined;
                        next();
                    });
                }
            });
    }
}
