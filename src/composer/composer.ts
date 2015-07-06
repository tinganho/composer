
/// <reference path='../../typings/node/node.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/glob/glob.d.ts'/>

import {readFileSync as readFile} from 'fs';
import * as React from 'react';
import {Application, Request, Response} from 'express';
import * as path from 'path';
import * as glob from 'glob';

export {Request, Response};

let imports: string[] = [];
let importNames: string[] = [];
let importPaths: string[] = [];
let urlPaths: string [] = [];

export interface Pages {
    [page: string]: (page: Page) => void;
}

export class Layout<P, S, C> extends React.Component<P, S> {
    public static name: string;

    constructor(public contents: C) {
        super();    
    }
}

export class Document<P, S, C extends DocumentProps> extends React.Component<P, S> {
    public static name: string;

    constructor(public docProps: C) {
        super();
    }
}

export interface Contents {
    [index: string]: React.Component<any, any>;
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
    document?: new (docProps: DocumentProps) => Document<any, any, any>;
    documentProps?: DocumentProps;
    layout?: new (contents: Contents) => Layout<any, any, any>;
    contents?: Contents;
    detect(req: Request): boolean;
}

export interface DocumentProps {
    confs: string[];
    title?: string;
    styles?: string[];
    [prop: string]: string | string[];
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
    public hasDocument<P, S, C extends DocumentProps>(document: new (contents: C) => Document<P, S, C> , ...documentPropArgs: DocumentProps[]): Page {
        if (typeof this.currentPlatform === 'undefined') {
            throw new TypeError('You must define a platform with `.onPlatform()` method.');
        }

        this.currentPlatform.document = document;

        let resultProps: DocumentProps = { confs: [] };
        for (let i in documentPropArgs) {
            documentPropArgs[i].confs = documentPropArgs[i].confs.map(conf => {
                let path = '';

                if(composerOptions.resourceNamespace) {
                    path += `/${composerOptions.resourceNamespace}/`;
                }

                if(composerOptions.inProduction) {
                    return path + glob.sync(`${composerOptions.clientConfPath}/*.${composerOptions.devToProdClientConfPath[conf]}.js`, { cwd: composerOptions.rootPath })[0];
                }

                return  `${path}/${composerOptions.clientConfPath}/${conf}.js`;
            });

            for (let prop in documentPropArgs[i]) {
                resultProps[prop] = documentPropArgs[i][prop];
            }
        }

        this.currentPlatform.documentProps = resultProps;

        return this;
    }

    /**
     * Define which layout this page should have.
     */
    public hasLayout<P, S, C extends Contents>(layout: new (contents: C) => Layout<P, S, C>, contents: C): Page {
        this.currentPlatform.layout = layout;
        this.currentPlatform.contents = contents;
        this.serve();

        return this;
    }
    
    private serve(): void {
        this.addContents();
        this.addPages();
        if(!this.attachedUrlHandler) {
            composerOptions.app.get(this.url, this.next.bind(this));
            this.attachedUrlHandler = true;
        }
    }
    
    private addContents(): void {
        
    }
    
    private addPages(): void {
        
    }
    
    private next(req: Request, res: Response, next: () => void): void {
        
        this.getRegions(req, res, (regions, jsonScripts) => {
            let html = React.renderToString(React.createElement(this.currentPlatform.document));
            res.send(html);
        });
    }
    
    private getRegions(req: Request, res: Response, callback: (regions?: any, jsonScripts?: any) => void): void {
        callback();
    }
    
    private getContents(): void {
    }
}
