
import { WebdriverTest } from './webdriverTest';
import { Pages, PlatformDetect } from '../../src/composer/serverComposer';
import { DocumentDeclaration, LayoutDeclaration, ContentDeclaration } from '../../src/component/layerComponents';

export interface BrowserDirectives {
    componentFolderPath: string;
    initialRoute: string;
    useBrowserActions?: (webdriver: WebdriverTest) => WebdriverTest;
    pages: Pages;
    useDefaultDocument: () => DocumentDeclaration;
    useDefaultLayout: () => LayoutDeclaration;
    useDefaultContent: (content: string) => ContentDeclaration;
    defaultConfigs: DocumentProps;
    defaultPlatform: PlatformDetect;
}