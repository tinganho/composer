/// <reference path='./router.d.ts'/>
/// <reference path='../component/component.d.ts'/>
/// <reference path='../component/layerComponents.d.ts'/>
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
            this.layoutRegion = document.getElementById('LayoutRegion');
        }
        this.checkRouteAndRenderIfMatch(document.location.pathname);
        if (this.hasPushState) {
            window.onpopstate = function () {
                _this.checkRouteAndRenderIfMatch(document.location.pathname);
            };
            this.onPushState = this.checkRouteAndRenderIfMatch;
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
    Router.prototype.checkRouteAndRenderIfMatch = function (currentRoute) {
        var _this = this;
        this.routes.some(function (route) {
            if (route.matcher.test(currentRoute)) {
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
        var promise = new Promise(function (resolve, reject) {
        });
        return promise;
    };
    Router.prototype.bindLayoutAndContents = function (page, contents) {
        this.currentLayoutComponent = new this.pageComponents.Layout[page.layout.className](contents);
        this.currentContents = this.currentLayoutComponent.customElements;
        this.currentLayoutComponent.bindDOM();
    };
    Router.prototype.renderLayoutAndContents = function (page, contents) {
    };
    Router.prototype.showErrorDialog = function (err) {
    };
    Router.prototype.loopThroughIrrelevantCurrentContentsAndExec = function (nextPage, method) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var currentNumberOfRemoves = 0;
            var expectedNumberOfRemoves = 0;
            if (!_this.currentContents || Object.keys(_this.currentContents).length === 0) {
                return reject(Error('You have not set any content for the current page.'));
            }
            for (var currentContent in _this.currentContents) {
                var removeCurrentContent = true;
                for (var _i = 0, _a = nextPage.contents; _i < _a.length; _i++) {
                    var nextContent = _a[_i];
                    if (nextContent.className === currentContent.constructor.name) {
                        removeCurrentContent = false;
                    }
                }
                if (!_this.currentContents[currentContent][method]) {
                    reject(Error('You have not implemented a hide or remove method for \'' + currentContent.constructor.name + '\''));
                }
                if (removeCurrentContent) {
                    expectedNumberOfRemoves++;
                    _this.currentContents[currentContent][method]()
                        .then(function () {
                        currentNumberOfRemoves++;
                        if (method === 'remove') {
                            delete _this.currentContents[currentContent];
                        }
                        if (currentNumberOfRemoves === expectedNumberOfRemoves) {
                            resolve();
                        }
                    });
                }
            }
        });
    };
    Router.prototype.removeIrrelevantCurrentContents = function (nextPage) {
        return this.loopThroughIrrelevantCurrentContentsAndExec(nextPage, 'remove');
    };
    Router.prototype.hideIrrelevantCurrentContents = function (nextPage) {
        return this.loopThroughIrrelevantCurrentContentsAndExec(nextPage, 'hide');
    };
    Router.prototype.renderPage = function (page) {
        var contents = {};
        if (this.inInitialPageLoad) {
            this.loadContentFromJsonScripts(contents, page);
            this.bindLayoutAndContents(page, contents);
            this.inInitialPageLoad = false;
        }
        else {
            this.handleClientPageRequest(page);
        }
    };
    Router.prototype.handleClientPageRequest = function (page) {
        var _this = this;
        var contents = {};
        var currentNumberOfNetworkRequests = 0;
        var expectedNumberOfNetworkRequest = 0;
        this.hideIrrelevantCurrentContents(page).then(function () {
            for (var _i = 0, _a = page.contents; _i < _a.length; _i++) {
                var content = _a[_i];
                var ContentComponent = window[_this.appName].Component.Content[content.className];
                // Filter those which are not going to fetch content from network
                if (_this.currentContents.hasOwnProperty(content.className)) {
                    continue;
                }
                expectedNumberOfNetworkRequest++;
                (function (contentInfo, ContentComponent) {
                    if (typeof ContentComponent.fetch !== 'function') {
                        throw Error("You have not implemented a static fetch function on your component " + contentInfo.className);
                    }
                    else {
                        ContentComponent.fetch(page.route)
                            .then(function (result) {
                            contents[contentInfo.region] = React.createElement(window[_this.appName].Component.Content[contentInfo.className], result, null);
                            currentNumberOfNetworkRequests++;
                            if (currentNumberOfNetworkRequests === expectedNumberOfNetworkRequest) {
                                var LayoutComponentClass = _this.pageComponents.Layout[page.layout.className];
                                if (LayoutComponentClass.id !== _this.currentLayoutComponent.id) {
                                    var layoutComponent = new LayoutComponentClass(contents);
                                    _this.currentLayoutComponent.remove();
                                    document.getElementById('LayoutRegion').appendChild(layoutComponent.toDOM());
                                    layoutComponent.show();
                                    _this.currentLayoutComponent = layoutComponent;
                                }
                                else {
                                    for (var c in contents) {
                                        var region = document.getElementById(c + 'Region');
                                        region.replaceChild(contents[c].toDOM(), region.firstElementChild);
                                        _this.currentLayoutComponent.setProp(c, content[c]);
                                    }
                                }
                            }
                        })
                            .catch(function (err) {
                        });
                    }
                })(content, ContentComponent);
            }
        });
    };
    return Router;
})();
exports.Router = Router;
exports["default"] = Router;
