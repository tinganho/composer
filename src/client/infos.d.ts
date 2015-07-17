
/// <reference path='./components.d.ts' />

declare interface Info {
    importPath: string;
    component: typeof React.Component;
}

declare interface DocumentInfo extends Info {
    component: typeof ComposerDocument;
}

declare interface LayoutInfo extends Info {
    component: typeof ComposerLayout;
}

declare interface ContentInfo extends Info {
    component: typeof ComposerContent;
}

declare interface StoredContentDeclarations {
    [index: string]: ContentInfo;
}

declare interface ProvidiedContentDeclarations {
    [index: string]: ContentInfo | typeof ComposerContent;
}