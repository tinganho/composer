
import {PageEmitInfo} from '../../../src/composer/webClientComposerEmitter';

export var pages: PageEmitInfo[] = [
    {
        route: '/',
        layout: {
            className: 'TestLayout',
            importPath: 'layouts/TestLayout',
            route: '/',
        },
        contents: [
            {
                className: 'NavigationBar',
                region: 'TopBar',
                importPath: 'contents/NavigationBar/NavigationBar',
                route: '/',
            },
            {
                className: 'Feed',
                region: 'Body',
                importPath: 'contents/Feed/Feed',
                route: '/',
            }
        ]
    }
];