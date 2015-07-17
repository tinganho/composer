var Document = require('test/cases/projects/test/components/Document.js').Document;
var Layout = require('test/cases/projects/test/components/Layout.js').Layout;
var NavigationBar = require('test/cases/projects/test/components/Contents.js').NavigationBar;
var TodoList = require('test/cases/projects/test/components/Contents.js').TodoList;
var Document = require('test/cases/projects/test/components/Document.js').Document;
var Layout = require('test/cases/projects/test/components/Layout.js').Layout;
var TodoItem = require('test/cases/projects/test/components/Contents.js').TodoItem;
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
            importPath: 'test/cases/projects/test/components/Document.js'
        },
        layout: {
            className: 'Layout',
            importPath: 'test/cases/projects/test/components/Layout.js'
        },
        contents: [
            {
                className: 'NavigationBar',
                importPath: 'test/cases/projects/test/components/Contents.js'
            },
            {
                className: 'TodoList',
                importPath: 'test/cases/projects/test/components/Contents.js'
            }
        ]
    },
    {
        route: '/todo',
        document: {
            className: 'Document',
            importPath: 'test/cases/projects/test/components/Document.js'
        },
        layout: {
            className: 'Layout',
            importPath: 'test/cases/projects/test/components/Layout.js'
        },
        contents: [
            {
                className: 'TodoItem',
                importPath: 'test/cases/projects/test/components/Contents.js'
            }
        ]
    }
];
App.Router = new Composer.Router('App', App.RoutingTable, App.Component);
