
/// <reference path='../../typings/node/node.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/glob/glob.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>

import * as React from 'react';
import { Application, Request, Response } from 'express';
import { ComponentEmitInfo, PageEmitInfo, ContentEmitInfo } from './webClientComposerEmitter';
import { Debug } from '../core';
import { Diagnostics } from '../diagnostics.generated';

export { Request, Response };

let imports: string[] = [];
let importNames: string[] = [];
let importPaths: string[] = [];
let routes: string [] = [];

export interface Pages {
    [page: string]: (page: Page) => void;
}

export interface DocumentProps {
    confs?: string[];
    title?: string;
    styles?: string[];
    jsonScriptData?: JsonScriptAttributes[];
    layout?: any;
}

abstract class ComposerComponent<P, S> extends React.Component<P, S> {
    public static name: string;
}

export class ComposerDocument<Props extends DocumentProps, States> extends ComposerComponent<Props, States> {}

export class ComposerLayout<Props, States> extends ComposerComponent<Props, States> {}

export class ComposerContent<Props, States> extends ComposerComponent<Props, States> {
    static fetch(): Promise<any> {
        return new Promise((resolve, reject) => {
           resolve();
        });
    }
}

export interface Contents {
    [index: string]: JSX.Element;
}

interface JsonScriptAttributes {
    id: string;
    data: string;
}

interface JsonScriptData {
    [index: string]: JsonScriptAttributes;
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
     * Path to client configuration path.
     */
    clientConfPath: string;

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
    app: Application;

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

let composerOptions: ComposerOptions;

export function init(options?: ComposerOptions): void {
    composerOptions = options;
}

/**
 * Set composer options.
 */
export function set<T>(setting: string, value: T): void {
    composerOptions[setting] = value;
}

export function setPages<T, U>(routes: Pages): void {
    for (let url in routes) {
        routes[url](new Page(url));
    }
}

/**
 * When all your pages is defined, call this function to generate a client composer.
 */
export function generateComposer(): void {

}

interface Info {
    importPath: string;
    component: typeof React.Component;
}

interface DocumentInfo extends Info {
    component: typeof ComposerDocument;
}

interface LayoutInfo extends Info {
    component: typeof ComposerLayout;
}

interface ContentInfo extends Info {
    component: typeof ComposerContent;
}

export interface StoredContentInfos {
    [index: string]: ContentInfo;
}

export interface ProvidedContentInfos {
    [index: string]: ContentInfo | typeof ComposerContent;
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

    /**
     * A flag for checking if this page have attached a URL handler.
     */
    private attachedUrlHandler: boolean = false;
    private platforms: { [index: string]: Platform } = {};
    private currentPlatform: Platform;
    private currentPlatformName: string;
    private pageEmitInfo: PageEmitInfo;

    // Default folders for different type of components.
    public defaultDocumentFolder: string;
    public defaultLayoutFolder: string;
    public defaultContentFolder: string;

    constructor(route: string) {
        this.route = route;
        this.defaultDocumentFolder = composerOptions.defaultDocumentFolder;
        this.defaultLayoutFolder = composerOptions.defaultLayoutFolder;
        this.defaultContentFolder = composerOptions.defaultContentFolder;
        routes.push(route);
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
        if (typeof this.currentPlatform === 'undefined') {
            throw new TypeError('You must define a platform with `.onPlatform()` method.');
        }

        if (this.isInfo(document)) {
            this.currentPlatform.document = document;
        }
        else {
            if (!this.defaultDocumentFolder) {
                Debug.fail(Diagnostics.You_have_not_defined_a_default_layout_folder);
            }
            this.currentPlatform.document = {
                component: document,
                importPath: this.defaultDocumentFolder + document.name
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
            if (!this.defaultLayoutFolder) {
                Debug.fail(Diagnostics.You_have_not_defined_a_default_layout_folder);
            }
            this.currentPlatform.layout = {
                component: layout,
                importPath: this.defaultLayoutFolder + layout.name
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
                if (!this.defaultContentFolder) {
                    Debug.fail(Diagnostics.You_have_not_defined_a_default_content_folder);
                }
                newContents[region] = {
                    component: content,
                    importPath: this.defaultContentFolder + content.name
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

        if (!this.attachedUrlHandler) {
            composerOptions.app.get(this.route, this.handlePageRequest.bind(this));
            this.attachedUrlHandler = true;
        }
    }

    private isInfo<T extends Info, U extends typeof ComposerComponent>(info: T | U): info is T {
        if ((info as T).importPath) {
            return true;
        }
        return false;
    }

    private registerPage(): void {
        let contentEmitInfos: ContentEmitInfo[] = [];
        let layout = this.currentPlatform.layout;
        let contents = this.currentPlatform.contents;

        for (let region in contents) {
            let content = contents[region];

            contentEmitInfos.push({

                // Get the class name from the constructor.
                className: content.component.name,
                importPath: content.importPath,
                route: this.route,
                region: region,
            });
        }

        this.pageEmitInfo = {
            route: this.route,
            layout: {
                className: layout.component.name,
                importPath: layout.importPath,
                route: this.route,
            },
            contents: contentEmitInfos,
        }
    }

    private handlePageRequest(req: Request, res: Response, next: () => void): void {
        this.getContents(req, res, (contents, jsonScriptData) => {
            this.currentPlatform.documentProps.layout = React.createElement(this.currentPlatform.layout.component, contents);
            this.currentPlatform.documentProps.jsonScriptData = jsonScriptData;
            let html = React.renderToString(React.createElement(this.currentPlatform.document.component, this.currentPlatform.documentProps));
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
            (function(region: string, _Content: typeof ComposerContent) {
                _Content.fetch().then(result => {
                    resultContents[region] = React.createElement(_Content, result);
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
