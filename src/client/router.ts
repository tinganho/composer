
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
                this.renderPage(this.routingInfoIndex[route.path]);
                return true;
            }
            return false;
        });
    }

    private setContentJsonScripts(contents: Contents, page: Page): Contents {
        for (let content of page.contents) {
            let jsonElement = document.getElementById(`react-composer-content-json-${content.className.toLowerCase()}`);
            if (!jsonElement) {
                console.error(`
Could not find JSON file ${content.className}. Are you sure
this component is properly named?`)
            }
            contents[content.className] = React.createElement(
                (window as any)[this.appName].Component.Content[content.className],
                JSON.parse(jsonElement.innerText)
            );
            if (jsonElement.remove) {
                jsonElement.remove();
            }
            else {
                jsonElement.parentElement.removeChild(jsonElement);
            }
        }

        return contents;
    }

    private renderPage(page: Page): void {
        let contents: Contents = {};
        if (this.inInitialPageLoad) {
            this.setContentJsonScripts(contents, page);
        }
        else {

        }

        let layoutElement = React.createElement(this.pageComponents.Layout[page.layout.className], contents);
        React.render(
            layoutElement,
            document.body
        );
        this.inInitialPageLoad = false;
    }
}

export default Router;