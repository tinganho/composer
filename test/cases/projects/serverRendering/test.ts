
import { BrowserDirectives } from '../../../../src/harness/browserDirectives';

export function test(d: BrowserDirectives): BrowserDirectives {
    d.pages = {
        '/': page => {
            page.hasLayout(d.useDefaultLayout(), {
                TopBar: d.useDefaultContent('NavigationBar'),
                Body: d.useDefaultContent('TodoList'),
            })
            .end();
        },
        '/todo': page => {
            page.hasLayout(d.useDefaultLayout(), {
                Body: d.useDefaultContent('TodoItem'),
            })
            .end();
        }
    }

    d.useBrowserActions = webdriver => {
        return webdriver;
    }

    return d;
}