
/// <reference path='../../typings/node/node.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/react/react-dom.d.ts'/>
/// <reference path='../../typings/glob/glob.d.ts'/>
/// <reference path='../../node_modules/typescript/bin/typescript.d.ts'/>
/// <reference path='../client/router.d.ts'/>
/// <reference path='../client/declarations.d.ts'/>
/// <reference path='../client/components.d.ts'/>


import { Component, createElement, MouseEvent } from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { Express, Request, Response } from 'express';
import { PageEmitInfo, emitBindings, ModuleKind } from './webBindingsEmitter';
import { Debug, createTextWriter, printError } from '../core';
import { Diagnostics } from '../diagnostics.generated';
import { sys } from '../sys';
import * as path from 'path'
import { createServer, Server } from 'http';
import { cf } from '../../conf/conf';
import * as ts from 'typescript';
import connectModrewrite = require('connect-modrewrite');
import {
    ComposerLayout,
    ComposerDocument,
    ComposerContent,
    ComposerComponent
} from '../client/components';

export interface Pages {
    [page: string]: (page: Page) => void;
}

export interface PlatformDetect {
    name: string;

    /**
     * Specify a function to detect this platform.
     */
    detect(req: Request): boolean;
}

export function isDeclaration<T extends PageLayerDeclaration, U extends typeof ComposerComponent>(decl: T | U): decl is T {
    if ((decl as T).importPath) {
        return true;
    }
    return false;
}

export function getClassName(c: typeof ComposerComponent): string {
    return c.name === 'RadiumEnhancer' ? (c as any).__proto__.name : c.name;
}

interface ComposerOptions {

    /**
     * App name.
     */
    appName?: string;

    /**
     * Module kind.
     */
    moduleKind?: ModuleKind;

    /**
     * Define the output file for client router.
     */
    routerOutput: string,

    /**
     * Path to client configuration path.
     */
    clientConfigurationPath: string;

    /**
     * Define the output file for your bingings.
     */
    bindingsOutput: string,

    /**
     * If you have set the flag `inProduction` to true. You would need to provide
     * a development to production client configuration path mapping for your
     * configuration files.
     */
    devToProdClientConfPath?: { [index: string]: string };

    /**
     * Set this flag to true if you are in production mode. Each page will use
     * production document properties instead of developement document properties.
     */
    inProduction?: boolean;

    /**
     * Add a namespace to your resource URL:s.
     */
    resourceNamespace?: string;

    /**
     * Specify the root path. All you URI:s defined in all your pages will reference
     * this root path.
     */
    rootPath: string;

    /**
     * Set express application.
     */
    app: Express;

    /**
     * Set default document folder. The composer will automatically look for
     * `{folder}/{component}.tsx` and you don't need to provide `importPath`:
     *
     * `.hasDocument({ component: Document, importPath: 'component/path' }, defaultConfigs)`
     *
     * You can simply do:
     *
     * `.hasDocument(Document, defaultConfigs)`
     *
     */
    defaultDocumentFolder?: string;

    /**
     * Set default layout folder. The composer will automatically look for
     * `{folder}/{component}.tsx` and you don't need to provide `importPath`:
     *
     * `.hasLayout({ component: Body_withTopBar_withFooter, importPath: 'component/path' }, contents)`
     *
     * You can simply do:
     *
     * `.hasLayout(Body_withTopBar_withFooter, contents)`
     *
     */
    defaultLayoutFolder?: string;

    /**
     * Set default content folder. The composer will automatically look for
     * `{folder}/{component}.tsx` and you don't need to provide `importPath`:
     *
     * `.hasLayout(Body_withTopBar_withFooter, {
     *     topBar: { component: NavigationBar, importPath: 'component/path' },
     *     body: { component: Feed, importPath: 'component/path' },
     * })`
     *
     * You can simply do:
     *
     * `.hasLayout(Body_withTopBar_withFooter, {
     *     topBar: NavigationBar,
     *     body: Feed,
     * })`
     *
     */
    defaultContentFolder?: string;

    [index: string]: any;
}

let serverComposer: ServerComposer;
export class ServerComposer {
    public commandLineOptions: any;
    public options: ComposerOptions;
    public pageCount: number;
    public server: Server;
    public defaultDocument: DocumentDeclaration;
    public defaultPlatform: PlatformDetect;
    public defaultDocumentProps: DocumentProps;

    /**
     * Storage for all page emit infos.
     */
    public pageEmitInfos: PageEmitInfo[] = [];

    /**
     * Page emit info output file.
     */
    public pageEmitInfoOutput: string;

    /**
     * A flag for not open the server.
     */
    public noServer: boolean = false;

    /**
     * Output file for client composer.
     */
    public clientComposerOutput: string;

    constructor(options: ComposerOptions, commandLineOptions?: any) {
        if (serverComposer) {
            Debug.fail(Diagnostics.Only_one_instance_of_Composer_is_allowed);
        }
        if (!options.appName) {
            options.appName = cf.DEFAULT_APP_NAME;
        }
        if (!options.moduleKind) {
            options.moduleKind = ModuleKind.Amd;
        }
        if (commandLineOptions) {
            this.commandLineOptions = commandLineOptions;
        }
        this.options = options;
        this.options.routerOutput = this.options.routerOutput;
        this.options.bindingsOutput =this.options.bindingsOutput;
    }

    public set<T>(setting: string, value: T): void {
        this.options[setting] = value;
    }

    public setPages(routes: Pages): void {
        let count = 0;
        for (let url in routes) {
            routes[url](new Page(url, this));

            count++;
        }
        this.pageCount = count;
        this.emitBindings();
        this.emitClientRouter();
    }

    public setDefaultDocument<T extends DocumentProps>(document: typeof ComposerDocument | DocumentDeclaration, documentProps: T): void {
        if (isDeclaration(document)) {
            this.defaultDocument = document;
        }
        else {
            if (!this.options.defaultDocumentFolder) {
                Debug.fail(Diagnostics.You_have_not_defined_a_default_document_folder);
            }
            this.defaultDocument = {
                component: document,
                importPath: path.join(this.options.defaultDocumentFolder, getClassName(document)),
            }
        }

        this.defaultDocumentProps = documentProps;
    }

    public setDefaultPlatform(platform: PlatformDetect): void {
        this.defaultPlatform = platform;
    }

    public start(callback?: (err?: Error) => void): void {
        this.server = createServer(this.options.app);
        this.server.on('error', (err: Error) => {
            printError(err);
        });
        this.server.listen(cf.PORT, callback);
    }

    public stop(callback?: (err?: Error) => void): void {
        this.server.close((err?: Error) => {
            callback(err);
            this.server = undefined;
            serverComposer = undefined;
        });
    }

    public emitBindings(): void {
        if (this.pageEmitInfos.length === this.pageCount) {
            let writer = createTextWriter(cf.DEFAULT_NEW_LINE);
            emitBindings(
                this.options.appName,
                this.options.routerOutput,
                this.getAllImportPaths(this.pageEmitInfos),
                this.pageEmitInfos,
                writer,
                { moduleKind: this.options.moduleKind }
            );
            let text = writer.getText();
            sys.writeFile(path.join(this.options.rootPath, this.options.bindingsOutput), text);
            if (this.commandLineOptions.showEmitBindings) {
                Debug.debug(text);
            }
        }
    }

    private moduleKindToTsModuleKind(moduleKind: ModuleKind): ts.ModuleKind {
        switch (moduleKind) {
            case ModuleKind.Amd:
                return ts.ModuleKind.AMD;
            case ModuleKind.CommonJs:
                return ts.ModuleKind.CommonJS;
            default:
                return ts.ModuleKind.None;
        }
    }

    public emitClientRouter(): void {
        let routerSource = sys.readFile(path.join(__dirname, '../client/router.ts').replace('/built', ''));
        let moduleKind = this.moduleKindToTsModuleKind(this.options.moduleKind);
        let jsSource = ts.transpile(routerSource, { module: moduleKind });
        sys.writeFile(path.join(this.options.rootPath, this.options.routerOutput), jsSource)
    }

    private getAllImportPaths(pageEmitInfos: PageEmitInfo[]): ComponentInfo[] {
        let componentEmitInfos: ComponentInfo[] = [];
        let classNames: string[] = []
        for (let pageEmitInfo of pageEmitInfos) {
            if (classNames.indexOf(pageEmitInfo.document.className) === -1) {
                componentEmitInfos.push(pageEmitInfo.document);
            }

            if (classNames.indexOf(pageEmitInfo.layout.className) === -1) {
                componentEmitInfos.push(pageEmitInfo.layout);
            }

            for (let contentEmitInfo of pageEmitInfo.contents) {
                if (classNames.indexOf(contentEmitInfo.className) === -1) {
                    componentEmitInfos.push({
                        className: contentEmitInfo.className,
                        importPath: contentEmitInfo.importPath,
                    });
                }
            }
        }

        return componentEmitInfos;
    }
}

interface Platform {
    imports: string[];
    importNames: string[];
    document?: DocumentDeclaration;
    documentProps?: DocumentProps;
    layout?: LayoutDeclaration;
    contents?: StoredContentDeclarations;
    detect(req: Request): boolean;
}

/**
 * The Page class builds up the whole HTML for your website.
 * You can specify document, layout, module and components to
 * customize the html you waant
 */
export class Page {

    /**
     * Route of this page.
     */
    public route: string;

    public serverComposer: ServerComposer;

    /**
     * A flag for checking if this page have attached a URL handler.
     */
    private attachedUrlHandler: boolean = false;
    private platforms: { [index: string]: Platform } = {};
    private currentPlatform: Platform;
    private currentPlatformName: string;

    constructor(route: string, serverComposer: ServerComposer) {
        this.route = route;
        this.serverComposer = serverComposer;

        if (this.serverComposer.defaultPlatform) {
            this.setPlatform(this.serverComposer.defaultPlatform);
        }

        if (this.serverComposer.defaultDocument) {
            this.currentPlatform.document = this.serverComposer.defaultDocument;
            this.currentPlatform.documentProps = this.serverComposer.defaultDocumentProps;
        }
    }

    /**
     * Specify a platform with a PlatformDetect.
     */
    public onPlatform(platform: PlatformDetect): Page {
        this.setPlatform(platform);

        return this;
    }

    private setPlatform(platform: PlatformDetect): void {
        this.platforms[platform.name] = {
            imports: [],
            importNames: [],
            detect: platform.detect
        }
        this.currentPlatform = this.platforms[platform.name];
    }

    /**
     * Define which document this page should have along with document properties.
     */
    public hasDocument<T extends DocumentProps>(document: DocumentDeclaration | typeof ComposerDocument, documentProps: T): Page {
        if (!this.currentPlatform) {
            Debug.fail(Diagnostics.You_must_define_a_platform_with_onPlatform_method_before_you_call_hasDocument);
        }

        if (isDeclaration(document)) {
            this.currentPlatform.document = document;
        }
        else {
            if (!this.serverComposer.options.defaultDocumentFolder) {
                Debug.fail(Diagnostics.You_have_not_defined_a_default_document_folder);
            }
            this.currentPlatform.document = {
                component: document,
                importPath: path.join(this.serverComposer.options.defaultDocumentFolder, getClassName(document)),
            }
        }

        this.currentPlatform.documentProps = documentProps;

        return this;
    }

    /**
     * Define which layout this page should have.
     */
    public hasLayout<C extends ProvidedContentDeclarations>(layout: LayoutDeclaration | typeof ComposerLayout, providedContentDeclarations: C): Page {
        if (isDeclaration(layout)) {
            this.currentPlatform.layout = layout;
        }
        else {
            if (!this.serverComposer.options.defaultLayoutFolder) {
                Debug.fail(Diagnostics.You_have_not_defined_a_default_layout_folder);
            }
            this.currentPlatform.layout = {
                component: layout,
                importPath: path.join(this.serverComposer.options.defaultLayoutFolder, getClassName(layout)),
            }
        }

        let newContents: StoredContentDeclarations = {};
        for (let region in providedContentDeclarations) {
            let newContent = {};
            let content = providedContentDeclarations[region];
            if (isDeclaration(content)) {
                newContents[region] = content;
            }
            else {
                if (!this.serverComposer.options.defaultContentFolder) {
                    Debug.fail(Diagnostics.You_have_not_defined_a_default_content_folder);
                }
                newContents[region] = {
                    component: content,
                    importPath: path.join(this.serverComposer.options.defaultContentFolder, getClassName(content)),
                }
            }
        }
        this.currentPlatform.contents = newContents;

        return this;
    }

    /**
     * Call this method to mark the end of your page declaration.
     */
    public end(): void {
        this.registerPage();

        if (!this.attachedUrlHandler && !this.serverComposer.noServer) {
            this.serverComposer.options.app.get(this.route, this.handlePageRequest.bind(this));
            this.attachedUrlHandler = true;
        }
    }

    private registerPage(): void {
        let contentEmitInfos: ContentComponentInfo[] = [];
        let document = this.currentPlatform.document;
        let layout = this.currentPlatform.layout;
        let contents = this.currentPlatform.contents;

        for (let region in contents) {
            let content = contents[region];

            contentEmitInfos.push({
                className: getClassName(content.component),
                importPath: content.importPath,
                region: region,
            });
        }

        this.serverComposer.pageEmitInfos.push({
            route: this.route,
            document: {
                className: getClassName(document.component),
                importPath: document.importPath,
            },
            layout: {
                className: getClassName(layout.component),
                importPath: layout.importPath,
            },
            contents: contentEmitInfos,
        });
    }

    private handlePageRequest(req: Request, res: Response, next: () => void): void {
        this.getContents(req, res, (contents, jsonScriptData) => {
            this.currentPlatform.documentProps.jsonScriptData = jsonScriptData;
            let layoutHtml = renderToString(createElement(this.currentPlatform.layout.component, contents));
            let documentHtml = renderToStaticMarkup(createElement(this.currentPlatform.document.component, this.currentPlatform.documentProps));
            documentHtml = '<!DOCTYPE html>' + documentHtml.replace('{{layout}}', layoutHtml);
            res.send(documentHtml);
        });
    }

    private getContents(req: Request, res: Response, next: (contents: Contents, jsonScriptData: JsonScriptAttributes[]) => void): void {
        let contents = this.currentPlatform.contents;
        let resultContents: Contents = {};
        let resultJsonScriptData: JsonScriptAttributes[] = [];
        let numberOfContents = 0;
        let finishedContentFetchings = 0;

        for (let region in contents) {
            numberOfContents++;
            (function(region: string, ContentComponent: typeof ComposerContent) {
                ContentComponent.fetch().then(result => {
                    resultContents[region] = createElement(ContentComponent, result);
                    resultJsonScriptData.push({
                        id: `react-composer-content-json-${getClassName(contents[region].component).toLowerCase()}`,
                        data: JSON.stringify(result)
                    });

                    finishedContentFetchings++;

                    if (numberOfContents === finishedContentFetchings) {
                        next(resultContents, resultJsonScriptData);
                    }
                }).catch(reason => {
                    console.log(reason)
                });
            })(region, contents[region].component);
        }
    }
}
