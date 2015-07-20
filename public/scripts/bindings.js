var Document = require('/test/defaultComponents/document').Document;
var Layout = require('/test/defaultComponents/layout').Layout;
var NavigationBar = require('test/defaultComponents/contents').NavigationBar;
var TodoList = require('test/defaultComponents/contents').TodoList;
var Document = require('/test/defaultComponents/document').Document;
var Layout = require('/test/defaultComponents/layout').Layout;
var TodoItem = require('test/defaultComponents/contents').TodoItem;
var Composer = require('public/scripts/composer.js');
var App = {};
window.App = App;
App.Component = { Document: {}, Layout: {}, Content: {} };
App.Component.Document.Document = Document;
App.Component.Layout.Layout = Layout;
App.Component.Content.NavigationBar = NavigationBar;
App.Component.Content.TodoList = TodoList;
App.Component.Document.Document = Document;
App.Component.Layout.Layout = Layout;
App.Component.Content.TodoItem = TodoItem;
App.RoutingTable = [
    {
        route: '/',
        document: {
            className: 'Document',
            importPath: '/test/defaultComponents/document',
        },
        layout: {
            className: 'Layout',
            importPath: '/test/defaultComponents/layout',
        },
        contents: [
            {
                className: 'NavigationBar',
                importPath: 'test/defaultComponents/contents',
                region: 'TopBar'
            },
            {
                className: 'TodoList',
                importPath: 'test/defaultComponents/contents',
                region: 'Body'
            }
        ]
    },
    {
        route: '/todo',
        document: {
            className: 'Document',
            importPath: '/test/defaultComponents/document',
        },
        layout: {
            className: 'Layout',
            importPath: '/test/defaultComponents/layout',
        },
        contents: [
            {
                className: 'TodoItem',
                importPath: 'test/defaultComponents/contents',
                region: 'Body'
            }
        ]
    }
];
App.Router = new Composer.Router('App', App.RoutingTable, App.Component);window.ComposerRouter = App.Router
