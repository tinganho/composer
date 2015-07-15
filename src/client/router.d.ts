
interface RoutingInfo {
    route: string;
    document: EmitInfo;
    layout: EmitInfo;
    contents: EmitInfo[];
}

interface EmitInfo {
    className: string;
    importPath: string;
}

declare module ComposerRouter {
    export function init(table: RoutingInfo[]): void;
    export function navigateTo(route: string): void;
}