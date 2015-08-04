/// <reference path='./router.d.ts'/>
/// <reference path='../component/component.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>
var React = require('/src/component/element.js');
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
                .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$';
            var route = {
                matcher: new RegExp(routePattern),
                path: page.route
            };
            this.routes.push(route);
            this.routingInfoIndex[route.path] = page;
        }
        this.checkRouteAndRenderIfMatch();
        if (this.hasPushState) {
            window.onpopstate = function () {
                _this.checkRouteAndRenderIfMatch();
            };
            this.onPushState = function (route) {
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
        this.onPushState(route);
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
    Router.prototype.loadContentFromJsonScripts = function (placeholderContents, page) {
        for (var _i = 0, _a = page.contents; _i < _a.length; _i++) {
            var content = _a[_i];
            var jsonElement = document.getElementById("composer-content-json-" + content.className.toLowerCase());
            if (!jsonElement) {
                console.error("Could not find JSON file " + content.className + ". Are you sure\nthis component is properly named?");
            }
            try {
                placeholderContents[content.region] = React.createElement(window[this.appName].Component.Content[content.className], jsonElement.innerText !== '' ? JSON.parse(jsonElement.innerText).data : {}, null);
            }
            catch (err) {
                console.error("Could not parse JSON for " + content.className + ".");
            }
            if (jsonElement.remove) {
                jsonElement.remove();
            }
            else {
                jsonElement.parentElement.removeChild(jsonElement);
            }
        }
    };
    Router.prototype.loadContentsFromNetwork = function (placeholderContents, page) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var networkRequests = 0;
            for (var _i = 0, _a = page.contents; _i < _a.length; _i++) {
                var content = _a[_i];
                (function (content) {
                    var component = window[_this.appName].Component.Content[content.className];
                    if (typeof component.fetch !== 'function') {
                        console.error("You have not implemented a static fetch function on your component " + content.className);
                    }
                    else {
                        component.fetch()
                            .then(function (result) {
                            try {
                                placeholderContents[content.region] = React.createElement(window[_this.appName].Component.Content[content.className], result, null);
                            }
                            catch (err) {
                                console.error("Could not parse JSON for " + content.className + ".");
                            }
                        })
                            .catch(reject)
                            .finally(function () {
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
    };
    Router.prototype.renderLayoutAndContents = function (page, contents) {
        var layoutElement = new this.pageComponents.Layout[page.layout.className](contents);
        layoutElement.bindDOM();
    };
    Router.prototype.renderPage = function (page) {
        var _this = this;
        var contents = {};
        if (this.inInitialPageLoad) {
            this.loadContentFromJsonScripts(contents, page);
            this.renderLayoutAndContents(page, contents);
        }
        else {
            // `contents` are passed and set by reference.
            this.loadContentsFromNetwork(contents, page)
                .then(function () {
                _this.renderLayoutAndContents(page, contents);
            })
                .catch(function (err) {
                console.warn('Could not load contents from network.');
            });
        }
        this.inInitialPageLoad = false;
    };
    return Router;
})();
exports.Router = Router;
exports["default"] = Router;
