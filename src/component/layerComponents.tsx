
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>
/// <reference path='./layerComponents.d.ts' />
/// <reference path='./component.d.ts' />

import React = require('./element');
import { Component } from './component';

export interface PageLayerDeclaration {
    importPath: string;
    component: new<P extends Props, S, E extends Elements>(props?: P, children?: Child[]) => Component<P, S, E>;
}

export interface DocumentDeclaration extends PageLayerDeclaration {
    component: new<P extends Props, S, E extends Elements>(props?: P, children?: Child[]) => ComposerDocument<P, S, E>;
}

export interface LayoutDeclaration extends PageLayerDeclaration {
    component: new<P extends Props, S, E extends Elements>(props?: P, children?: Child[]) => ComposerLayout<P, S, E>;
}

export interface ContentDeclaration extends PageLayerDeclaration {
    component: new<P extends Props, S, E extends Elements>(props?: P, children?: Child[]) => ComposerContent<P, S, E>;
}

export interface StoredContentDeclarations {
    [index: string]: ContentDeclaration;
}

export interface ProvidedContentDeclarations {
    [index: string]: ContentDeclaration | (new<P extends Props, S, E extends Elements>(props?:P, children?: Child[]) => ComposerContent<P, S, E>);
}

export abstract class ComposerComponent<P extends Props, S, E extends Elements> extends Component<P, S, E> {

    /**
     * This static property is a native readonly JS property and it is automatically set to the
     * constructor's name.
     */
    public static name: string;
    public remove(): Promise<void> { return }
    public hide(): Promise<void> { return }
}

export abstract class ComposerDocument<P extends DocumentProps, S, E extends Elements> extends ComposerComponent<P, S, E> {}
export abstract class ComposerLayout<P extends Props, S, E extends Elements> extends ComposerComponent<P, S, E> {}
export abstract class ComposerContent<P extends Props, S, E extends Elements> extends ComposerComponent<P, S, E> {
    public static fetch<TRequest, TResult>(request: TRequest): Promise<TResult> { return }

    public hide(): Promise<void> {
        return Promise.resolve(undefined);
    }
    public remove(): Promise<void> {
        this.root.remove();
        return Promise.resolve(undefined);
    }
}

interface LinkProps extends Props {
    to: string;
    class: string;
}

interface E extends Elements {
    anchor: DOMElement;
}

declare let __Router: any;

export class Link extends Component<LinkProps, any, any> {
    public navigateTo(event: Event) {
        event.preventDefault();

        __Router.navigateTo(this.props.to);
    }

    public bindDOM() {
        super.bindDOM();
        this.root.onClick(this.navigateTo.bind(this));
    }

    public render() {
        return (
            <a class={this.props.class}>{this.children}</a>
        );
    }
}
