
/// <reference path='./router.d.ts'/>
/// <reference path='./components.d.ts'/>

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

    constructor(public appName: string, pages: Page[], public pageComponents: PageComponents) {
        for (let page of pages) {
            let routePattern = '^' + page.route
                .replace(/:(\w+)\//, (match, param) => `(${param})`)
                .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

            let route: Route = {
                matcher: new RegExp(routePattern),
                path: page.route,
            }

            this.routes.push(route);

            this.routingInfoIndex[route.path] = page;
        }

        this.checkRouteAndRenderIfMatch();

        if(this.hasPushState) {
            window.onpopstate = (event: PopStateEvent) => {
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
    }

    private checkRouteAndRenderIfMatch(): void {
        this.routes.some(route => {
            if (route.matcher.test(document.location.pathname)) {
                this.renderComponents(this.routingInfoIndex[route.path]);
                return true;
            }
            return false;
        });
    }

    private renderComponents(page: Page) {
        if (this.inInitialPageLoad) {
            let documentProps = JSON.parse(document.getElementById('react-composer-document-json').innerText);
            let contents: Contents = {};
            for (let content of page.contents) {
                contents[content.className] = React.createElement(
                    (window as any)[this.appName].Component.Content[content.className],
                    JSON.parse(document.getElementById(`react-composer-content-json-${content.className.toLowerCase()}`).innerText)
                );
            }
            documentProps.layout = React.createElement(this.pageComponents.Layout[page.layout.className], contents);
            React.render(
                documentProps.layout,
                document.body
            );
        }
        else {

        }
        this.inInitialPageLoad = false;
    }
}

export default Router;