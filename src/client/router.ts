
/// <reference path='./router.d.ts'/>
/// <reference path='./components.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>


interface Map {
   [entity: string]: string;
}

interface Route {
    matcher: RegExp;
    path: string;
}

export class Router {
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
        }

        this.checkRouteAndRenderIfMatch();

        if(this.hasPushState) {
            window.onpopstate = () => {
                this.checkRouteAndRenderIfMatch();
            }
            this.onPushState = route => {
                this.checkRouteAndRenderIfMatch();
            }
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

    private checkRouteAndRenderIfMatch(): void {
        this.routes.some(route => {
            if (route.matcher.test(document.location.pathname)) {
                this.renderPage(this.routingInfoIndex[route.path]);
                return true;
            }
            return false;
        });
    }

    private loadContentFromJsonScripts(placeholderContents: Contents, page: Page): void {
        for (let content of page.contents) {
            let jsonElement = document.getElementById(`react-composer-content-json-${content.className.toLowerCase()}`);
            if (!jsonElement) {
                console.error(
`Could not find JSON file ${content.className}. Are you sure
this component is properly named?`)
            }
            try {
                placeholderContents[content.region] = React.createElement(
                    (window as any)[this.appName].Component.Content[content.className],
                    jsonElement.innerText !== '' ? JSON.parse(jsonElement.innerText) : {}
                );
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

    private loadContentsFromNetwork(placeholderContents: Contents, page: Page): Promise<void> {
        let promise = new Promise<void>((resolve, reject) => {
            let networkRequests = 0;
            for (var content of page.contents) {
                ((content: ContentComponentInfo) => {
                    let component = (window as any)[this.appName].Component.Content[content.className];
                    if (typeof component.fetch !== 'function') {
                        console.error(`You have not implemented a static fetch function on your component ${content.className}`);
                    }
                    else {
                        component.fetch()
                            .then((result: any) => {
                                try {
                                    placeholderContents[content.region] = React.createElement(
                                        (window as any)[this.appName].Component.Content[content.className],
                                        result
                                    );
                                }
                                catch(err) {
                                    console.error(`Could not parse JSON for ${content.className}.`)
                                }
                            })
                            .catch(reject)
                            .finally(() => {
                                networkRequests++;
                                if (networkRequests === page.contents.length) {
                                    resolve();
                                }
                            });
                    }
                })(content);
            }
        });

        return promise;
    }

    private renderLayoutAndContents(page: Page, contents: Contents) {
        let layoutElement = React.createElement(this.pageComponents.Layout[page.layout.className], contents);
        React.render(
            layoutElement,
            document.body
        );
    }

    private renderPage(page: Page): void {
        let contents: Contents = {};
        if (this.inInitialPageLoad) {
            this.loadContentFromJsonScripts(contents, page);
            this.renderLayoutAndContents(page, contents);
        }
        else {
            this.loadContentsFromNetwork(contents, page)
                .then(() => {
                     this.renderLayoutAndContents(page, contents);
                })
                .catch((err: Error) => {
                    console.warn('Could not load contents from network.')
                });
        }

        this.inInitialPageLoad = false;
    }
}

export default Router;