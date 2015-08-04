
/// <reference path='./layerComponents.d.ts' />
/// <reference path='./component.d.ts' />

declare interface PageLayerDeclaration {
    importPath: string;
    component: new(props: any, children?: any) => Component<any, any, any>;
}

declare interface DocumentDeclaration extends PageLayerDeclaration {
    component: new(props: any, children?: any) => ComposerDocument<any, any, any>;
}

declare interface LayoutDeclaration extends PageLayerDeclaration {
    component: new(props: any, children?: any) => ComposerLayout<any, any, any>;
}

declare interface ContentDeclaration extends PageLayerDeclaration {
    component: new(props: any, children?: any) => ComposerContent<any, any, any>;
}

declare interface StoredContentDeclarations {
    [index: string]: ContentDeclaration;
}

declare interface ProvidedContentDeclarations {
    [index: string]: ContentDeclaration | (new(props: any, children?: any) => ComposerContent<any, any, any>);
}