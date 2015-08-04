
/// <reference path='../../typings/mocha/mocha.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/morgan/morgan.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>
/// <reference path='../../typings/image-diff/image-diff.d.ts'/>
/// <reference path='../../typings/rimraf/rimraf.d.ts'/>
/// <reference path='../../typings/selenium-webdriver/selenium-webdriver.d.ts'/>
/// <reference path='../component/layerDeclarations.d.ts'/>

import { CommandLineOptions, Map } from './types';
import imageDiff = require('image-diff');
import logger = require('morgan');
import { cf } from '../../conf/conf';
import { ServerComposer, PlatformDetect } from '../composer/serverComposer';
import { ModuleKind } from '../composer/webBindingsEmitter';
import { ComposerDocument } from '../component/layerComponents';
import { sync as glob } from 'glob';
import * as path from 'path';
import express = require('express');
import { createServer } from 'http';
import { parseCommandLineOptions } from './commandLineParser';
import { printDiagnostics, printDiagnostic, printError, Debug } from '../core';
import { sys } from '../sys';
import { Diagnostics } from '../diagnostics.generated';
import { sync as removeFolderOrFile } from 'rimraf';
import { BrowserDirectives } from './browserDirectives';
import { Document } from '../../test/defaultComponents/document';
import * as contentComponents from '../../test/defaultComponents/contents';
import { Layout } from '../../test/defaultComponents/layout';
import { WebdriverTest } from './webdriverTest';

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
        app.use('/src', express.static(path.join(this.root, 'built/src')));
        app.use('/test/defaultComponents', express.static(path.join(this.root, 'built/test/defaultComponents')));
        app.use('/public', express.static(path.join(this.root, 'public')));
        app.use('/' + componentFolderPath, express.static(path.join('built', folderPath, 'components')));
        app.use(logger('dev'));

        let serverComposer = new ServerComposer({
            app,
            routerOutput: 'public/scripts/router.js',
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
                    component: (contentComponents as any)[content] as new(props: any, children: any) => ComposerContent<any, any, any>,
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
            pattern = `test/cases/projects/*${this.options.tests}*/test.js`;
        }
        else {
            pattern = 'test/cases/projects/*/test.js';
        }
        removeFolderOrFile(path.join(this.root, 'test/baselines/local'));
        removeFolderOrFile(path.join(this.root, 'test/baselines/diff'));
        let filePaths = glob(pattern, { cwd: this.builtFolder });

        describe('Image diffs |', () => {
            for (var filePath of filePaths) {
                var folderPath = path.dirname(filePath);
                var jsFileName = path.basename(filePath);
                var fileName = jsFileName.replace(/\.js$/, '');

                (function(folderPath: string, fileName: string) {
                    let folderName = path.basename(folderPath);
                    it(folderName, function(done) {
                        if (self.options.interactive) {
                            this.timeout(10000000);
                        }

                        let app = express();
                        let { serverComposer, browserDirectives } = self.createComposer(app, folderPath, fileName, /*shouldEmitComposer*/false);
                        Debug.debug('Starting server.');
                        serverComposer.start(err => {
                            Debug.debug('Started server.');
                            if (err) {
                                return self.stopServerDueToError(serverComposer, err, () => done());
                            }
                            if (self.options.interactive) {
                                printDiagnostic(Diagnostics.Stop_the_server_by_exiting_the_session_CTRL_plus_C);
                            }
                            else {
                                self.testWithHeadlessWebBrowser(app, serverComposer, folderName, browserDirectives, () => {
                                    Debug.debug(`Finished testing ${folderName}.`);
                                    done();
                                });
                            }
                        });
                    });
                })(folderPath, fileName);
            }
        });
    }

    private testWithHeadlessWebBrowser(
        app: express.Express,
        serverComposer: ServerComposer,
        folderName: string,
        browserDirectives: BrowserDirectives,
        callback: () => void) {

        Debug.debug(`Testing ${folderName}.`);

        let resultFilePath = path.join(this.root, `test/baselines/local/${folderName}.png`);
        let expectedFilePath = path.join(this.root, `test/baselines/reference/${folderName}.png`);
        let diffFilePath = path.join(this.root, `test/baselines/diff/${folderName}.png`);
        let initialRoute = browserDirectives.initialRoute || '/';
        let webdriverTest = new WebdriverTest({
            browserName: 'chrome',
            os: 'OS X',
            os_version: 'Yosemite',
            resolution: `${cf.DEFAULT_SCREEN_RESOLUTION.WIDTH}x${cf.DEFAULT_SCREEN_RESOLUTION.HEIGHT}`
        });
        webdriverTest.get(`http://${cf.HOST}:${cf.PORT}${initialRoute}`)
            .wait({ css : 'html' })

        let browserActions = browserDirectives.useBrowserActions ?
            browserDirectives.useBrowserActions(webdriverTest) :
            webdriverTest;

        browserActions
            .screenshot(resultFilePath)
            .end((err) => {
                if(err) {
                    printDiagnostic(Diagnostics.Could_not_start_headless_web_browser);
                    printError(err);
                }

                if (!sys.fileExists(expectedFilePath)) {
                    expectedFilePath = resultFilePath;
                }
                imageDiff(
                    {
                        actualImage: resultFilePath,
                        expectedImage: expectedFilePath,
                        diffImage: diffFilePath,
                    },
                    (err, imagesAreSame) => {
                        Debug.debug('Stopping server.');
                        serverComposer.stop(err => {
                            Debug.debug('Stopped server.');
                            if (imagesAreSame) {
                                removeFolderOrFile(diffFilePath);
                            }
                            else {
                                throw new TypeError('Baseline image does not correspond to result image.');
                            }

                            app = undefined;
                            serverComposer = undefined;
                            callback();
                        });
                    }
                );
            });
    }
}
