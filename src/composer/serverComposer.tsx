
/// <reference path='../../typings/node/node.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/glob/glob.d.ts'/>
/// <reference path='../../node_modules/typescript/bin/typescript.d.ts'/>
/// <reference path='../client/router.d.ts'/>

import { renderToString, Component, createElement, MouseEvent } from 'react';
import { Express, Request, Response } from 'express';
import { ComponentEmitInfo, PageEmitInfo, ContentEmitInfo, emitComposer, ModuleKind } from './webClientComposerEmitter';
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
    ComposerComponent,
    DocumentProps,
    Info,
    ProvidedContentInfos,
    StoredContentInfos,
    LayoutInfo,
    DocumentInfo,
    JsonScriptAttributes
} from '../client/components';

export interface Pages {
    [page: string]: (page: Page) => void;
}

interface LinkProps {
    to: string;
}

export class Link extends Component<LinkProps, {}> {

    public navigatTo(event: React.MouseEvent) {
        event.preventDefault();

        ComposerRouter.navigateTo(this.props.to);
    }

    public render() {
        return (
            <a href={this.props.to} onClick={this.navigatTo}></a>
        );
    }
}

export interface Contents {
    [index: string]: JSX.Element;
}

export interface PlatformDetect {
    name: string;

    /**
     * Specify a function to detect this platform.
     */
    detect(req: Request): boolean;
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
    clientRouterOutput: string,

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
        this.options.clientRouterOutput = this.options.clientRouterOutput;
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
            emitComposer(
                this.options.appName,
                this.options.clientRouterOutput,
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
        sys.writeFile(path.join(this.options.rootPath, this.options.clientRouterOutput), jsSource)
    }

    private getAllImportPaths(pageEmitInfos: PageEmitInfo[]): ComponentEmitInfo[] {
        let componentEmitInfos: ComponentEmitInfo[] = [];
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
    document?: DocumentInfo;
    documentProps?: DocumentProps;
    layout?: LayoutInfo;
    contents?: StoredContentInfos;
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
    }

    /**
     * Specify a platform with a PlatformDetect.
     */
    public onPlatform(platform: PlatformDetect): Page {
        this.platforms[platform.name] = {
            imports: [],
            importNames: [],
            detect: platform.detect
        }

        this.currentPlatform = this.platforms[platform.name];

        return this;
    }

    /**
     * Define which document this page should have along with document properties.
     */
    public hasDocument<T extends DocumentProps>(document: DocumentInfo | typeof ComposerDocument, documentProps: T): Page {
        if (!this.currentPlatform) {
            Debug.fail(Diagnostics.You_must_define_a_platform_with_onPlatform_method_before_you_call_hasDocument);
        }

        if (this.isInfo(document)) {
            this.currentPlatform.document = document;
        }
        else {
            if (!this.serverComposer.options.defaultDocumentFolder) {
                Debug.fail(Diagnostics.You_have_not_defined_a_default_document_folder);
            }
            this.currentPlatform.document = {
                component: document,
                importPath: path.join(this.serverComposer.options.defaultDocumentFolder, this.getClassName(document)),
            }
        }

        this.currentPlatform.documentProps = documentProps;

        return this;
    }

    /**
     * Define which layout this page should have.
     */
    public hasLayout<C extends ProvidedContentInfos>(layout: LayoutInfo | typeof ComposerLayout, contents: C): Page {
        if (this.isInfo(layout)) {
            this.currentPlatform.layout = layout;
        }
        else {
            if (!this.serverComposer.options.defaultLayoutFolder) {
                Debug.fail(Diagnostics.You_have_not_defined_a_default_layout_folder);
            }
            this.currentPlatform.layout = {
                component: layout,
                importPath: path.join(this.serverComposer.options.defaultLayoutFolder, this.getClassName(layout)),
            }
        }

        let newContents: StoredContentInfos = {};
        for (let region in contents) {
            let newContent = {};
            let content = contents[region];
            if (this.isInfo(content)) {
                newContents[region] = content;
            }
            else {
                if (!this.serverComposer.options.defaultContentFolder) {
                    Debug.fail(Diagnostics.You_have_not_defined_a_default_content_folder);
                }
                newContents[region] = {
                    component: content,
                    importPath: path.join(this.serverComposer.options.defaultContentFolder, this.getClassName(content)),
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

    private isInfo<T extends Info, U extends typeof ComposerComponent>(info: T | U): info is T {
        if ((info as T).importPath) {
            return true;
        }
        return false;
    }

    private getClassName(c: typeof ComposerComponent): string {
        return c.className ? c.className : c.name;
    }

    private registerPage(): void {
        let contentEmitInfos: ContentEmitInfo[] = [];
        let document = this.currentPlatform.document;
        let layout = this.currentPlatform.layout;
        let contents = this.currentPlatform.contents;

        for (let region in contents) {
            let content = contents[region];

            contentEmitInfos.push({
                className: this.getClassName(content.component),
                importPath: content.importPath,
                region: region,
            });
        }

        this.serverComposer.pageEmitInfos.push({
            route: this.route,
            document: {
                className: this.getClassName(document.component),
                importPath: document.importPath,
            },
            layout: {
                className: this.getClassName(layout.component),
                importPath: layout.importPath,
            },
            contents: contentEmitInfos,
        });
    }

    private handlePageRequest(req: Request, res: Response, next: () => void): void {
        this.getContents(req, res, (contents, jsonScriptData) => {
            this.currentPlatform.documentProps.layout = createElement(this.currentPlatform.layout.component, contents);
            this.currentPlatform.documentProps.jsonScriptData = jsonScriptData;
            let html = renderToString(createElement(this.currentPlatform.document.component, this.currentPlatform.documentProps));
            res.send(html);
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
                        id: `react-composer-json-${region}`,
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
