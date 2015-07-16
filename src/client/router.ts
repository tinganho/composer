
/// <reference path='./router.d.ts'/>

let RoutingInfo: RoutingInfo;
let indexedRoutingInfo: { [index: string]: RoutingInfo } = {};
let routes: Route[] = [];
let hasPushstate = window.history && !!window.history.pushState;
let Components: RoutingInfo;

export function init(RoutingInfo: RoutingInfo[], Components: RoutingInfo): void {
    RoutingInfo = RoutingInfo;

    for (let emitInfo of RoutingInfo) {
        let routePattern = '^' + emitInfo.route
            .replace(/:(\w+)\//, (match, param) => `(${param})`)
            .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        let route: Route = {
            matcher: new RegExp(routePattern),
            path: emitInfo.route,
        }

        routes.push(route);
    }

    checkRouteAndRenderIfMatch();

    if(hasPushstate) {
        window.onpopstate = function(event: PopStateEvent) {
            checkRouteAndRenderIfMatch();
        }
    }
}

export function navigateTo(route: string, state?: Object): void {
    if (hasPushstate) {
        window.history.pushState(state, null, route);
    }
    else {
        window.location.pathname = route;
    }
}

interface Route {
    matcher: RegExp;
    path: string;
}

function checkRouteAndRenderIfMatch(): void {
    routes.some(route => {
        if (route.matcher.test(document.location.pathname)) {
            renderComponents(indexedRoutingInfo[route.path]);
            return true;
        }
        return false;
    });
}

function renderComponents(emitInfo: RoutingInfo) {
    alert('hej')
}