/// <reference path='./router.d.ts'/>
var RoutingInfo;
var routes = [];
var Html;
(function (Html) {
    var charToEntityRegex;
    var entityToCharRegex;
    var charToEntity = {};
    var entityToChar = {
        '&amp;': '&',
        '&gt;': '>',
        '&lt;': '<',
        '&quot;': '"',
        '&#39;': '\''
    };
    addEntityToCharacterMappings(entityToChar);
    function addEntityToCharacterMappings(entityToChar) {
        var charKeys = [];
        var entityKeys = [];
        for (var entity in entityToChar) {
            var char = entityToChar[entity];
            charToEntity[char] = entity;
            charKeys.push(char);
            entityKeys.push(entity);
        }
        charToEntityRegex = new RegExp("(" + charKeys.join('|') + ")", 'g');
        entityToCharRegex = new RegExp("(" + entityKeys.join('|') + "|&#[0-9]{1,5};)", 'g');
    }
    function encode(value) {
        return (!value) ? null : String(value).replace(charToEntityRegex, function (match, capture) {
            return charToEntity[capture];
        });
    }
    Html.encode = encode;
    function decode(value) {
        return (!value) ? null : String(value).replace(entityToCharRegex, function (match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        });
    }
    Html.decode = decode;
})(Html = exports.Html || (exports.Html = {}));
var Router = (function () {
    function Router(pages, components) {
        var _this = this;
        this.hasPushState = window.history && !!window.history.pushState;
        this.routingInfoIndex = {};
        for (var _i = 0; _i < pages.length; _i++) {
            var page = pages[_i];
            var routePattern = '^' + page.route
                .replace(/:(\w+)\//, function (match, param) { return ("(" + param + ")"); })
                .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            var route = {
                matcher: new RegExp(routePattern),
                path: page.route
            };
            routes.push(route);
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
        routes.some(function (route) {
            if (route.matcher.test(document.location.pathname)) {
                _this.renderComponents(_this.routingInfoIndex[route.path]);
                return true;
            }
            return false;
        });
    };
    Router.prototype.renderComponents = function (emitInfo) {
        console.log(emitInfo);
    };
    return Router;
})();
exports.Router = Router;
exports["default"] = Router;
