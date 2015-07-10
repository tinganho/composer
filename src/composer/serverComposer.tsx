
/// <reference path='../../typings/node/node.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/glob/glob.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>

import {readFileSync as readFile} from 'fs';
import * as React from 'react';
import {Application, Request, Response} from 'express';
import * as path from 'path';

export {Request, Response};

let imports: string[] = [];
let importNames: string[] = [];
let importPaths: string[] = [];
let urlPaths: string [] = [];

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

abstract class ReactComposerComponent<P, S> extends React.Component<P, S> {
    public static name: string;
}
export class ComposerDocument<Props extends DocumentProps, States> extends ReactComposerComponent<Props, States> {}

export class ComposerLayout<Props, States> extends ReactComposerComponent<Props, States> {}

export class ComposerContent<Props, States> extends ReactComposerComponent<Props, States> {
    static name: string;
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
}

let composerOptions: ComposerOptions;

export function init(options?: ComposerOptions): void {
    composerOptions = options;
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

interface Platform {
    imports: string[];
    importNames: string[];
    document?: typeof ComposerDocument;
    documentProps?: DocumentProps;
    layout?: typeof ComposerLayout;
    contents?: any;
    detect(req: Request): boolean;
}

/**
 * The Page class builds up the whole HTML for your website.
 * You can specify document, layout, module and components to
 * customize the html you waant
 */
export class Page {

    /**
     * A flag for checking if this page have attached a URL handler.
     */
    private attachedUrlHandler: boolean = false;
    private platforms: { [index: string]: Platform } = {};
    private currentPlatform: Platform;
    private currentPlatformName: string;

    constructor(private url: string) {}

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
    public hasDocument<T extends DocumentProps>(document: typeof ComposerDocument, documentProps: T): Page {
        if (typeof this.currentPlatform === 'undefined') {
            throw new TypeError('You must define a platform with `.onPlatform()` method.');
        }

        this.currentPlatform.document = document;
        this.currentPlatform.documentProps = documentProps;

        return this;
    }

    /**
     * Define which layout this page should have.
     */
    public hasLayout<C extends Contents>(layout: typeof ComposerLayout, contents: C): Page {
        this.currentPlatform.layout = layout;
        this.currentPlatform.contents = contents;
        this.serve();

        return this;
    }

    private serve(): void {
        this.addContents();
        this.addPages();
        if(!this.attachedUrlHandler) {
            composerOptions.app.get(this.url, this.handlePageRequest.bind(this));
            this.attachedUrlHandler = true;
        }
    }

    private addContents(): void {

    }

    private addPages(): void {

    }

    private handlePageRequest(req: Request, res: Response, next: () => void): void {
        this.getContents(req, res, (contents, jsonScriptData) => {
            this.currentPlatform.documentProps.layout = React.createElement(this.currentPlatform.layout, contents);
            this.currentPlatform.documentProps.jsonScriptData = jsonScriptData;
            let html = React.renderToString(React.createElement(this.currentPlatform.document, this.currentPlatform.documentProps));
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
                }).catch(function(reason: Error) {

                });
            })(region, contents[region]);
        }
    }
}
