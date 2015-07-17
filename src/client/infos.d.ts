
/// <reference path='./components.d.ts' />

declare interface PageLayerDeclaration {
    importPath: string;
    component: typeof React.Component;
}

declare interface DocumentDeclaration extends PageLayerDeclaration {
    component: typeof ComposerDocument;
}

declare interface LayoutDeclaration extends PageLayerDeclaration {
    component: typeof ComposerLayout;
}

declare interface ContentDeclaration extends PageLayerDeclaration {
    component: typeof ComposerContent;
}

declare interface StoredContentDeclarations {
    [index: string]: ContentDeclaration;
}

declare interface ProvidiedContentDeclarations {
    [index: string]: ContentDeclaration | typeof ComposerContent;
}