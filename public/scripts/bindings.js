var Document = require('test/cases/projects/test/components/Document.js');
var TestLayout = require('test/cases/projects/test/components/Layout.js');
var NavigationBar = require('test/cases/projects/test/components/Contents.js');
var Feed = require('test/cases/projects/test/components/Contents.js');
var ComposerRouter = require('public/scripts/router.js');
var App = {};
window.App = App;
App.Component = { Document: {}, Layout: {}, Content: {} };
App.Component.Document.Document = Document;
App.Component.Layout.TestLayout = TestLayout;
App.Component.Content.NavigationBar = NavigationBar;
App.Component.Content.Feed = Feed;
App.RoutingTable = [
    {
        route: '/',
        document: {
            className: 'Document',
            importPath: 'test/cases/projects/test/components/Document.js'
        },
        layout: {
            className: 'TestLayout',
            importPath: 'test/cases/projects/test/components/Layout.js'
        },
        contents: [
            {
                className: 'NavigationBar',
                importPath: 'test/cases/projects/test/components/Contents.js'
            },
            {
                className: 'Feed',
                importPath: 'test/cases/projects/test/components/Contents.js'
            }
        ]
    }
];
ComposerRouter.init(App.RoutingTable, App.Components);
