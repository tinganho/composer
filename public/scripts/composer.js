/// <reference path='./router.d.ts'/>
/// <reference path='./components.d.ts'/>
var Router = (function () {
    function Router(appName, pages, pageComponents) {
        var _this = this;
        this.appName = appName;
        this.pageComponents = pageComponents;
        this.inInitialPageLoad = true;
        this.hasPushState = window.history && !!window.history.pushState;
        this.routingInfoIndex = {};
        this.routes = [];
        for (var _i = 0; _i < pages.length; _i++) {
            var page = pages[_i];
            var routePattern = '^' + page.route
                .replace(/:(\w+)\//, function (match, param) { return ("(" + param + ")"); })
                .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            var route = {
                matcher: new RegExp(routePattern),
                path: page.route
            };
            this.routes.push(route);
            this.routingInfoIndex[route.path] = page;
        }
        this.checkRouteAndRenderIfMatch();
        if (this.hasPushState) {
            window.onpopstate = function (event) {
                _this.checkRouteAndRenderIfMatch();
            };
        }
    }
    Router.prototype.navigateTo = function (route, state) {
        if (this.hasPushState) {
            window.history.pushState(state, null, route);
        }
        else {
            window.location.pathname = route;
        }
    };
    Router.prototype.checkRouteAndRenderIfMatch = function () {
        var _this = this;
        this.routes.some(function (route) {
            if (route.matcher.test(document.location.pathname)) {
                _this.renderPage(_this.routingInfoIndex[route.path]);
                return true;
            }
            return false;
        });
    };
    Router.prototype.renderPage = function (page) {
        if (this.inInitialPageLoad) {
            var contents = {};
            for (var _i = 0, _a = page.contents; _i < _a.length; _i++) {
                var content = _a[_i];
                var jsonElement = document.getElementById("react-composer-content-json-" + content.className.toLowerCase());
                if (!jsonElement) {
                    console.error("\nCould not find JSON file " + content.className + ". Are you sure\nthis component is properly named?");
                }
                contents[content.className] = React.createElement(window[this.appName].Component.Content[content.className], JSON.parse(jsonElement.innerText));
                jsonElement.remove();
            }
            var layoutElement = React.createElement(this.pageComponents.Layout[page.layout.className], contents);
            React.render(layoutElement, document.body);
        }
        else {
        }
        this.inInitialPageLoad = false;
    };
    return Router;
})();
exports.Router = Router;
exports["default"] = Router;
