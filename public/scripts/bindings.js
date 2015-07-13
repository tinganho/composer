define(['documents/Document', 'layouts/TestLayout', 'contents/NavigationBar', 'contents/Feed', '/Users/tinganho/Development/react-composer/public/scripts/router.js'], function(Document, TestLayout, NavigationBar, Feed, ComposerRouter) {
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
                importPath: 'documents/Document'
            },
            layout: {
                className: 'TestLayout',
                importPath: 'layouts/TestLayout'
            },
            contents: [
                {
                    className: 'NavigationBar',
                    importPath: 'contents/NavigationBar'
                },
                {
                    className: 'Feed',
                    importPath: 'contents/Feed'
                }
            ]
        }
    ];
    ComposerRouter.init(App.RoutingTable);
});
