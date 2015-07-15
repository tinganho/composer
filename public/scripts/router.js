/// <reference path='./router.d.ts'/>
var RoutingInfo;
var indexedRoutingInfo = {};
var routes = [];
var hasPushstate = window.history && !!window.history.pushState;
var Components;
function init(RoutingInfo, Components) {
    RoutingInfo = RoutingInfo;
    for (var _i = 0; _i < RoutingInfo.length; _i++) {
        var emitInfo = RoutingInfo[_i];
        var routePattern = '^' + emitInfo.route
            .replace(/:(\w+)\//, function (match, param) { return ("(" + param + ")"); })
            .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        var route = {
            matcher: new RegExp(routePattern),
            path: emitInfo.route
        };
        routes.push(route);
    }
    checkRouteAndRenderIfMatch();
    if (hasPushstate) {
        window.onpopstate = function (event) {
            checkRouteAndRenderIfMatch();
        };
    }
}
exports.init = init;
function navigateTo(route, state) {
    if (hasPushstate) {
        window.history.pushState(state, null, route);
    }
    else {
        window.location.pathname = route;
    }
}
exports.navigateTo = navigateTo;
function checkRouteAndRenderIfMatch() {
    routes.some(function (route) {
        if (route.matcher.test(document.location.pathname)) {
            renderComponents(indexedRoutingInfo[route.path]);
            return true;
        }
        return false;
    });
}
function renderComponents(emitInfo) {
    // Components.Layout[emitInfo.layout.className];
}
