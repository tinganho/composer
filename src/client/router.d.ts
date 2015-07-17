
interface Page {
    route: string;
    document: ComponentInfo;
    layout: ComponentInfo;
    contents: ComponentInfo[];
}

interface ComponentInfo {
    className: string;
    importPath: string;
}

declare module ComposerRouter {
    export function init(table: Page[]): void;
    export function navigateTo(route: string): void;
}