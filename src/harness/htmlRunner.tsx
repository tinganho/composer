
/// <reference path='../../typings/mocha/mocha.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/sinon/sinon.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/nightmare/nightmare.d.ts'/>
/// <reference path='../../typings/morgan/morgan.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>
/// <reference path='../../typings/image-diff/image-diff.d.ts'/>
/// <reference path='../../typings/rimraf/rimraf.d.ts'/>
/// <reference path='../client/declarations.d.ts'/>

import { CommandLineOptions, Map } from './types';
import imageDiff = require('image-diff');
import logger = require('morgan');
import { cf } from '../../conf/conf';
import { ServerComposer, PlatformDetect } from '../composer/serverComposer';
import { ModuleKind } from '../composer/webClientComposerEmitter';
import { ComposerDocument } from '../client/components';
import React = require('react');
import { sync as glob } from 'glob';
import * as path from 'path';
import express = require('express');
import { createServer } from 'http';
import HeadlessWebBrowser = require('nightmare');
import { parseCommandLineOptions } from './commandLineParser';
import { printDiagnostics, printDiagnostic, printError, Debug } from '../core';
import { sys } from '../sys';
import { Diagnostics } from '../diagnostics.generated';
import { sync as removeFolderOrFile } from 'rimraf';
import { expect } from 'chai';
import { BrowserDirectives } from './browserDirectives';
import { Document } from '../../test/defaultComponents/document';
import * as contentComponents from '../../test/defaultComponents/contents';
import { Layout } from '../../test/defaultComponents/layout';

declare function require(path: string): any;
require('source-map-support').install();

interface ProjectFile {
    route: string;
}

let defaultPlatform: PlatformDetect = { name: 'all', detect: (req: express.Request) => true };

function useDefaultDocument(): DocumentDeclaration {
    return {
        component: Document,
        importPath: '/test/defaultComponents/document',
    }
}

export default class HtmlRunner {
    public options: CommandLineOptions;
    public builtFolder = path.join(__dirname, '../../');
    public directives: BrowserDirectives;
    public root = path.join(this.builtFolder, '../');

    constructor(args: string[]) {
        let { options, errors } = parseCommandLineOptions(args);
        if (errors.length > 0) {
            printDiagnostics(errors);
            process.exit();
        }
        this.options = options;
    }

    public createComposer(app: express.Express, folderPath: string, fileName: string, shouldEmitComposer: boolean): { serverComposer: ServerComposer, browserDirectives: BrowserDirectives } {
        let componentFolderPath = path.join(folderPath, 'components');
        let folderName = path.basename(folderPath);
        if (!folderName) {
            Debug.fail(Diagnostics.Could_not_get_folder_name_from_0, folderPath);
        }
        app.use('/src/client', express.static(path.join(this.root, 'built/src/client')));
        app.use('/test/defaultComponents', express.static(path.join(this.root, 'built/test/defaultComponents')));
        app.use('/public', express.static(path.join(this.root, 'public')));
        app.use('/' + componentFolderPath, express.static(path.join('built', folderPath, 'components')));
        app.use(logger('dev'));

        let serverComposer = new ServerComposer({
            app,
            clientComposerOutput: 'public/scripts/composer.js',
            bindingsOutput: 'public/scripts/bindings.js',
            clientConfigurationPath: './client/*.js',
            rootPath: this.root,
            moduleKind: ModuleKind.CommonJs,
        }, this.options);

        let directives = require(path.join(this.root, 'built', folderPath, 'test.js')).test({
            componentFolderPath,
            useDefaultDocument,
            useDefaultLayout: function(): LayoutDeclaration {
                return {
                    component: Layout,
                    importPath: '/test/defaultComponents/layout',
                }
            },
            useDefaultContent: function(content: string): ContentDeclaration {
                return {
                    component: (contentComponents as any)[content] as typeof ComposerContent,
                    importPath: 'test/defaultComponents/contents',
                }
            },
            defaultPlatform: defaultPlatform
        });

        serverComposer.setDefaultDocument(useDefaultDocument(), { configs: ['default'] });
        serverComposer.setDefaultPlatform(defaultPlatform);

        serverComposer.setPages(directives.pages);

        return { serverComposer, browserDirectives: directives };
    }

    private stopServerDueToError(serverComposer: ServerComposer, err: Error, callback: () => void) {
        printError(err);
        serverComposer.stop(callback);
    }

    public runTests(): void {
        let self = this;
        let pattern: string;
        if (this.options.tests) {
            pattern = `test/cases/*${this.options.tests}*/test.js`;
        }
        else {
            pattern = 'test/cases/projects/*/test.js';
        }
        removeFolderOrFile(path.join(this.root, 'test/baselines/local'));
        removeFolderOrFile(path.join(this.root, 'test/baselines/diff'));
        let filePaths = glob(pattern, { cwd: this.builtFolder });

        for (var filePath of filePaths) {
            var folderPath = path.dirname(filePath);
            var jsFileName = path.basename(filePath);
            var fileName = jsFileName.replace(/\.js$/, '');

            (function(folderPath: string, fileName: string) {
                let folderName = path.basename(folderPath);

                describe('Image diffs |', () => {
                    it(folderName, function(done) {
                        if (self.options.interactive) {
                            this.timeout(10000000);
                        }

                        let app = express();
                        let { serverComposer, browserDirectives } = self.createComposer(app, folderPath, fileName, /*shouldEmitComposer*/false);
                        serverComposer.start(err => {
                            if (err) {
                                return self.stopServerDueToError(serverComposer, err, () => done());
                            }

                            self.testWithHeadlessWebBrowser(app, serverComposer, fileName, browserDirectives, () =>{
                                done();
                            });
                        });
                    });
                });
            })(folderPath, fileName);
        }
    }

    private testWithHeadlessWebBrowser(
        app: express.Express,
        serverComposer: ServerComposer,
        folderName: string,
        browserDirectives: BrowserDirectives,
        callback: () => void) {

        let resultFilePath = path.join(this.root, `test/baselines/local/${folderName}.jpg`);
        let expectedFilePath = path.join(this.root, `test/baselines/reference/${folderName}.jpg`);
        let diffFilePath = path.join(this.root, `test/baselines/diff/${folderName}.jpg`);
        let initialRoute = browserDirectives.initialRoute || '/';
        let headlessWebBrowser = new HeadlessWebBrowser({ port: 7000 })
            .viewport(cf.TEST_PAGE_VIEW_PORT.WIDTH, cf.TEST_PAGE_VIEW_PORT.HEIGHT)
            .goto(`http://${cf.HOST}:${cf.PORT}${initialRoute}`)
            .wait();

        let browserActions = browserDirectives.useBrowserActions ?
            browserDirectives.useBrowserActions(headlessWebBrowser) :
            headlessWebBrowser;

        browserActions
            .screenshot(resultFilePath)
            .run((err, headlessWebBrowser) => {
                if(err) {
                    printDiagnostic(Diagnostics.Could_not_start_headless_web_browser);
                    printError(err);
                }

                if (this.options.interactive) {
                    printDiagnostic(Diagnostics.Stop_the_server_by_exiting_the_session_CTRL_plus_C);
                }
                else {
                    if (!sys.fileExists(expectedFilePath)) {
                        throw new TypeError('There is no expected image file.');
                    }
                    imageDiff({
                        actualImage: resultFilePath,
                        expectedImage: expectedFilePath,
                        diffImage: diffFilePath,
                    }, (err, imagesAreSame) => {
                        if (imagesAreSame) {
                            removeFolderOrFile(diffFilePath);
                        }
                        else {
                            throw new TypeError('Baseline image does not correspond to result image.');
                        }
                        serverComposer.stop(err => {
                            app = undefined;
                            serverComposer = undefined;
                            callback();
                        });
                    });
                }
            });
    }
}
