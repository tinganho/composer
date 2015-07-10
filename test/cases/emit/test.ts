
import {EmitPageInfo} from '../../../src/composer/webClientComposerEmitter';

export var pages: EmitPageInfo[] = [
    {
        route: '/',
        layout: {
            className: 'TestLayout',
            path: 'layouts/TestLayout',
            route: '/',
        },
        contents: [
            {
                className: 'NavigationBar',
                region: 'TopBar',
                path: 'contents/NavigationBar/NavigationBar',
                route: '/',
            },
            {
                className: 'Feed',
                region: 'Body',
                path: 'contents/Feed/Feed',
                route: '/',
            }
        ]
    }
];