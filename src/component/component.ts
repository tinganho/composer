
/// <reference path='../../typings/es6-promise/es6-promise.d.ts' />
/// <reference path='../../typings/express/express.d.ts' />
/// <reference path='./component.d.ts' />

import { Platform, getPlatform } from './platform';
import { unsetInstantiatedComponents, getInstantiatedComponents } from './element';
import * as u from './utils';

export abstract class Component<P extends Props, S, E extends Elements> {

    /**
     * Root element of the component view.
     */
    public root: DOMElement;

    /**
     * Properties.
     */
    public props: P;

    /**
     * Referenced elements from component.
     */
    public elements: E;

    /**
     * Current state of component.
     */
    public states: S;

    /**
     * Put your localization strings here.
     */
    public l10ns: any;

    /* @internal */
    public hasRenderedFirstElement = false;

    /* @internal */
    public children: Child[];

    /* @internal */
    public hasBoundDOM = false;

    /* @internal */
    public customElements: Components = {};

    /* @internal */
    public instantiatedComponents: Components;

    public lastRenderId: number;

    public promises: any[];

    constructor(
        props?: P,
        children?: Child[]) {

        this.props = u.extend({}, u.extend(props || {}, this.props)) as P;

        this.children = children;
        (this as any).elements = {}
    }

    /**
     * Define you render with JSX elements.
     */
    public abstract render(): JSX.Element;

    public setProps(props: P): void {
        this.props = props;
    }

    public setProp(name: string, value: any): void {
        if (this.props) {
            this.props[name] = value;
        }
        else {
            (this as any).props = {
                [name]: value
            }
        }
    }

    public unsetProp(name: string): void {
        delete this.props[name];
    }

    public get id() {
        return this.props.id ? (this as any).constructor.name + this.props.id : (this as any).constructor.name;
    }

    /**
     * The remove function is called be the router whenever we switch pages and
     * want to remove some components. This remove function is called immediately
     * after fetching of the new page is finished.
     */
    public remove(): Promise<void> {
        this.root.remove();
        return Promise.resolve(undefined);
    }

    /**
     * Hide is called immediately after a route have been matched and the current
     * component does not belong to the next page. This function is suitable to do
     * some hiding animation or display loadbars before next page is being rendered.
     */
    public hide(): Promise<void> {
        return Promise.resolve(undefined);
    }

    /**
     * Show is called during initial page load or directly after having switched to
     * a new page. If your component are hidden with styles during initial page load
     * it is now suitable to show them with this function. Show is also called whenever
     * a page request failed to unhide components.
     */
    public show(): Promise<any> {
        this.promises = [];
        this.recursivelyCallMethod(this, 'customElements', 'show');
        return Promise.all(this.promises);
    }

    public recursivelyCallMethod(target: any, repetitveAccessor: string, method: string): void {
        for (let c in target[repetitveAccessor]) {
            this.promises.push(target[repetitveAccessor][c][method]());
        }
        this.recursivelyCallMethod(target[repetitveAccessor], repetitveAccessor, method);
    }

    /**
     * Fetch is called everytime we switch to a new page. Each component on each page
     * needs to be finished loading before the new page is showned.
     */
    public fetch<R>(req: Express.Request): Promise<R> {
        return Promise.resolve(undefined);
    }

    public bindDOM(renderId?: number): void {
        if (!this.hasBoundDOM) {
            this.customElements = {};
            this.lastRenderId = this.renderAndSetComponent().bindDOM(renderId);
            this.hasBoundDOM = true;
        }
    }

    /**
     * Bind Interactions is the first function to be called during all page loads to bind the
     * component interactions with the DOM. All elements are already binded so there is no need
     * to bind them. Please bind any interactions that you find suitable.
     */
    public bindInteractions(): void {

    }

    /**
     * Get instances of components before they are rendered.
     */
    public getInstancesOf(...components: string[]): Components {
        let componentBuilder: Components = {};
        this.lastRenderId = this.renderAndSetComponent().instantiateComponents();
        let instantiatedComponents = getInstantiatedComponents(this.lastRenderId);
        for (let c of components) {
            componentBuilder[c] = instantiatedComponents[c];
        }
        return componentBuilder;
    }

    /* @internal */
    public instantiateComponents(renderId: number): void {
        this.renderAndSetComponent().instantiateComponents(renderId);
    }

    /* @internal */
    public toString(renderId?: number): string {
        let s =  this.renderAndSetComponent().toString(renderId || this.lastRenderId);
        return s;
    }

    /* @internal */
    public toDOM(renderId?: number): DocumentFragment {
        let DOMRender = this.renderAndSetComponent().toDOM(renderId || this.lastRenderId);
        this.lastRenderId = DOMRender.renderId;
        return DOMRender.frag;
    }

    /* @internal */
    public renderAndSetComponent(): JSX.Element {
        let rootElement = this.render();
        rootElement.setComponent(this);
        return rootElement;
    }
}

export default Component;