
/// <reference path='./router.d.ts'/>
/// <reference path='../component/component.d.ts'/>
/// <reference path='../component/layerComponents.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>

import ReactMod = require('../component/element');
let React: typeof ReactMod = require('/src/component/element.js');

interface Map {
   [entity: string]: string;
}

interface Route {
    matcher: RegExp;
    path: string;
}

interface CurrentContents {
    [content: string]: ComposerContent<any, any, any>;
}

export class Router {
    public layoutRegion: HTMLElement;
    public currentLayoutComponent: ComposerLayout<any, any, any>;
    public currentContents: CurrentContents;
    public inInitialPageLoad = true;
    public hasPushState = window.history && !!window.history.pushState;
    public routingInfoIndex: { [index: string]: Page } = {};
    public routes: Route[] = [];
    public onPushState: (route: string) => void;

    constructor(public appName: string, pages: Page[], public pageComponents: PageComponents) {
        for (let page of pages) {
            let routePattern = '^' + page.route
                .replace(/:(\w+)\//, (match, param) => `(${param})`)
                .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$';

            let route: Route = {
                matcher: new RegExp(routePattern),
                path: page.route,
            }

            this.routes.push(route);
            this.routingInfoIndex[route.path] = page;
            this.layoutRegion = document.getElementById('LayoutRegion');
        }

        this.checkRouteAndRenderIfMatch(document.location.pathname);

        if (this.hasPushState) {
            window.onpopstate = () => {
                this.checkRouteAndRenderIfMatch(document.location.pathname);
            }
            this.onPushState = this.checkRouteAndRenderIfMatch;
        }
    }

    public navigateTo(route: string, state?: Object): void {
        if (this.hasPushState) {
            window.history.pushState(state, null, route);
        }
        else {
            window.location.pathname = route;
        }
        this.onPushState(route);
    }

    private checkRouteAndRenderIfMatch(currentRoute: string): void {
        this.routes.some(route => {
            if (route.matcher.test(currentRoute)) {
                this.renderPage(this.routingInfoIndex[route.path]);
                return true;
            }
            return false;
        });
    }

    private loadContentFromJsonScripts(placeholderContents: Contents, page: Page): void {
        for (let content of page.contents) {
            let jsonElement = document.getElementById(`composer-content-json-${content.className.toLowerCase()}`);
            if (!jsonElement) {
                console.error(
`Could not find JSON file ${content.className}. Are you sure
this component is properly named?`);
            }
            try {
                placeholderContents[content.region] = React.createElement((window as any)[this.appName].Component.Content[content.className], jsonElement.innerText !== '' ? JSON.parse(jsonElement.innerText).data : {}, null);
            }
            catch(err) {
                console.error(`Could not parse JSON for ${content.className}.`)
            }
            if (jsonElement.remove) {
                jsonElement.remove();
            }
            else {
                jsonElement.parentElement.removeChild(jsonElement);
            }
        }
    }

    private bindLayoutAndContents(page: Page, contents: Contents) {
        this.currentLayoutComponent = new (this as any).pageComponents.Layout[page.layout.className](contents);
        this.currentContents = this.currentLayoutComponent.customElements as any;
        this.currentLayoutComponent.bindDOM();
    }

    private renderLayoutAndContents(page: Page, contents: Contents) {
    }

    private showErrorDialog(err: Error): void {

    }

    private loopThroughIrrelevantCurrentContentsAndExec(nextPage: Page, method: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let currentNumberOfRemoves = 0;
            let expectedNumberOfRemoves = 0;

            if (!this.currentContents || Object.keys(this.currentContents).length === 0) {
                return reject(Error('You have not set any content for the current page.'));
            }

            for (var currentContent in this.currentContents) {
                var removeCurrentContent = true;
                for (let nextContent of nextPage.contents) {
                    if (nextContent.className === currentContent.constructor.name) {
                        removeCurrentContent = false;
                    }
                }

                if (!(this as any).currentContents[currentContent][method]) {
                    reject(Error('You have not implemented a hide or remove method for \'' + currentContent.constructor.name + '\''))
                }

                if (removeCurrentContent) {
                    expectedNumberOfRemoves++;
                    (this as any).currentContents[currentContent][method]()
                        .then(() => {
                            currentNumberOfRemoves++;
                            if (method === 'remove') {
                                delete this.currentContents[currentContent];
                            }
                            if (currentNumberOfRemoves === expectedNumberOfRemoves) {
                                resolve();
                            }
                        });
                }
            }
        });
    }

    private removeIrrelevantCurrentContents(nextPage: Page): Promise<void> {
        return this.loopThroughIrrelevantCurrentContentsAndExec(nextPage, 'remove');
    }

    private hideIrrelevantCurrentContents(nextPage: Page): Promise<void> {
        return this.loopThroughIrrelevantCurrentContentsAndExec(nextPage, 'hide');
    }

    private renderPage(page: Page): void {
        let contents: Contents = {};
        if (this.inInitialPageLoad) {
            this.loadContentFromJsonScripts(contents, page);
            this.bindLayoutAndContents(page, contents);
            this.inInitialPageLoad = false;
        }
        else {
            this.handleClientPageRequest(page);
        }
    }

    private handleClientPageRequest(page: Page) {
        let contents: Contents = {};
        let currentNumberOfNetworkRequests = 0;
        let expectedNumberOfNetworkRequest = 0;

        this.hideIrrelevantCurrentContents(page).then(() => {
            for (var content of page.contents) {
                var ContentComponent = (window as any)[this.appName].Component.Content[content.className];

                // Filter those which are not going to fetch content from network
                if (this.currentContents.hasOwnProperty(content.className)) {
                    continue;
                }

                expectedNumberOfNetworkRequest++;

                ((contentInfo: ContentComponentInfo, ContentComponent: typeof ComposerContent) => {
                    if (typeof ContentComponent.fetch !== 'function') {
                        throw Error(`You have not implemented a static fetch function on your component ${contentInfo.className}`);
                    }
                    else {
                        ContentComponent.fetch(page.route)
                            .then((result: any) => {
                                contents[contentInfo.region] = React.createElement((window as any)[this.appName].Component.Content[contentInfo.className], result, null);

                                currentNumberOfNetworkRequests++;
                                if (currentNumberOfNetworkRequests === expectedNumberOfNetworkRequest) {
                                    let LayoutComponentClass = (this as any).pageComponents.Layout[page.layout.className];
                                    if (LayoutComponentClass.id !== this.currentLayoutComponent.id) {
                                        let layoutComponent = new LayoutComponentClass(contents);
                                        this.currentLayoutComponent.remove();
                                        document.getElementById('LayoutRegion').appendChild(layoutComponent.toDOM());
                                        layoutComponent.show();
                                        this.currentLayoutComponent = layoutComponent;
                                    }
                                    else {
                                        this.loopThroughIrrelevantCurrentContentsAndExec(page, 'remove').then(() => {
                                            for (let c in contents) {
                                                let content = (contents as any)[c];
                                                let region = document.getElementById(c + 'Region');
                                                this.currentLayoutComponent.setProp(c, content);
                                                region.appendChild(content.toDOM());
                                                content.bindDOM(content.lastRenderId);
                                            }
                                        });
                                    }
                                }
                            })
                            .catch((err: Error) => {

                            });
                    }
                })(content, ContentComponent);
            }
        });
    }
}

export default Router;