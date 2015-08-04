
/// <reference path='./component.d.ts' />

import { Component } from './component';
import { ComposerDOMElement } from './DOMElement';
import Debug from '../debug';
import * as u from './utils';

let id = 0;
let instantiatedComponents: { [renderId: string]: u.Map<Component<any, any, any>> } = {};

export function getRenderId(): number {
    return id++;
}

export function resetId(): void {
    id = 0;
}

export function unsetInstantiatedComponents(renderId: number): void {
    delete instantiatedComponents[renderId];
}

export function getInstantiatedComponents(renderId: number): u.Map<Component<any, any, any>> {
    return instantiatedComponents[renderId];
}

export function createElement(
    element: string | (new(props: Props, children: Child[]) => Component<any, any, any>),
    props: any,
    ...children: Child[]): JSX.Element {

    let component: Component<any, any, any>;
    let isChildOfRootElement = false;

    function setComponent(c: Component<any, any, any>): void {
        component = c;
    }

    function markAsChildOfRootElement(): void {
        isChildOfRootElement = true;
    }

    function toDOM(renderId?: number): DocumentFragment {
        let frag = document.createDocumentFragment();
        if (typeof element === 'string') {
            let root = document.createElement(element);

            if (!component.hasRenderedFirstElement) {
                component.root = new ComposerDOMElement(root);
                root.setAttribute('id', component.props.id);
                component.hasRenderedFirstElement = true;
            }

            for (let p in props) {
                if (p === 'id') {
                    continue;
                }
                else if (p === 'ref') {
                    let ref = props[p];
                    if (ref in component.elements) {
                        Debug.warn(`You are overriding the element reference '{0}'.`, ref);
                    }
                    root.setAttribute('data-ref', ref);
                    component.elements[ref] = new ComposerDOMElement(root);
                }
                else {
                    root.setAttribute(convertCamelCasesToDashes(p), props[p]);
                }
            }

            for (let child of children) {
                if (!child) {
                    continue;
                }
                if (typeof child === 'string') {
                    root.textContent += child;
                }
                else if (u.isArray<JSX.Element[]>(child)) {
                    for (let c of child) {
                        renderChildToDOM(root, c);
                    }
                }
                else {
                    renderChildToDOM(root, child);
                }
            }

            frag.appendChild(root);

            // If the current element is root element of a component. Then we want to
            // reset the first rendered element flag. Otherwise, child of root
            // elements can cause some the next sibling child to render the id
            // attribute. And we don't want that to happen. Only the root element
            // should render an id by default.
            if (!isChildOfRootElement) {

                // Reset rendered first element flag so we can render the id again.
                component.hasRenderedFirstElement = false;
            }
        }
        else {
            let customElement: Component<any, any, any>;
            if (instantiatedComponents[renderId] &&
                instantiatedComponents[renderId][props.id]) {

                customElement = instantiatedComponents[renderId][props.id];
            }
            else {
                customElement = new element(props, children);
            }
            frag.appendChild(customElement.toDOM());

            // We want to add a root custom element too. The children custom element
            // is added above. We do a check of the component variable. There is no
            // component for children custom elements, but there are one for the a
            // root custom element, becase the component class calls `setComponent`
            // and passes the component to this closure.
            if (component) {
                component.customElements[customElement.props.id] = customElement;
            }
            else {
                component = customElement;
            }
        }

        return frag;

        function renderChildToDOM(root: HTMLElement, child: JSX.Element) {
            if (child.isIntrinsic) {
                child.setComponent(component);
                child.markAsChildOfRootElement();
                root.appendChild(child.toDOM());
            }
            else {
                root.appendChild(child.toDOM());
                console.log(child);
                let childComponent = child.getComponent();
                component.customElements[childComponent.props.id] = childComponent;
            }
        }
    }

    function convertCamelCasesToDashes(text: string) {
        return text.replace(/([A-Z])/g, (m) => {
            return '-' + m.toLowerCase();
        });
    }

    function toString(renderId?: number): string {
        let frag = '';
        if (typeof element === 'string') {
            frag = `<${element}`;

            if (!component.hasRenderedFirstElement) {
                frag += ` id="${component.props.id}"`;
            }

            for (let p in props) {
                if (typeof props[p] !== 'boolean' && typeof props[p] !== 'string') {
                    continue;
                }
                if (p === 'id' && !component.hasRenderedFirstElement) {
                    continue;
                }
                if (typeof props[p] === 'boolean') {
                    frag += ` ${convertCamelCasesToDashes(p)}`;
                }
                else if (p === 'ref') {
                    frag += ` data-ref="${props[p]}"`;
                }
                else {
                    frag += ` ${convertCamelCasesToDashes(p)}="${props[p]}"`;
                }
            }

            frag += '>';

            component.hasRenderedFirstElement = true;

            for (let child of children) {
                if (!child) {
                    continue;
                }
                if (typeof child === 'string') {
                    frag += child;
                }
                else if (u.isArray<JSX.Element[]>(child)) {
                    for (let c of child) {
                        frag += renderChildToString(c);
                    }
                }
                else {
                    frag += renderChildToString(child);
                }
            }

            frag += `</${element}>`;

            // If the current element is root element of a component. Then we want to
            // reset the first rendered element flag. Otherwise, child of root
            // elements can cause some the next sibling child to render the id
            // attribute. And we don't want that to happen. Only the root element
            // should render an id by default.
            if (!isChildOfRootElement) {

                // Reset rendered first element flag so we can render the id again.
                component.hasRenderedFirstElement = false;
            }
        }
        else {
            let customElement: Component<any, any, any>;
            if (instantiatedComponents[renderId] &&
                instantiatedComponents[renderId][props.id]) {

                customElement = instantiatedComponents[renderId][props.id]
            }
            else {
                customElement = new element(props, children);
            }
            frag += customElement.toString(renderId);
        }

        return frag;

        function renderChildToString(child: JSX.Element): string {
            if (child.isIntrinsic) {
                child.setComponent(component);
                child.markAsChildOfRootElement();
            }
            return child.toString();
        }
    }

    /**
     * Set references by binding the elements to the component. Should only
     * be called by the composer router.
     */
    function bindDOM(renderId?: number): void {
        if (typeof element === 'string') {
            let root = document.getElementById(component.props.id);
            if (!root) {
                Debug.error(`Could not bind root element '{0}'.`, component.props.id);
            }
            component.root = new ComposerDOMElement(root);

            for (let p in props) {
                if (p === 'ref') {
                    let ref = props[p];
                    if (ref in component.elements) {
                        Debug.warn(`You are overriding the element reference '{0}'.`, ref);
                    }

                    let referencedElement = component.root.findOne(`[data-ref="${ref}"]`);
                    if (!referencedElement) {
                        Debug.error(`Could not bind referenced element '{0}'.`, ref);
                    }
                    component.elements[ref] = new ComposerDOMElement(referencedElement);
                }
            }

            for (let child of children) {
                if (!child || typeof child === 'string') {
                    continue;
                }
                else if (u.isArray<JSX.Element[]>(child)) {
                    for (let c of child) {
                        if(!c) {
                            continue;
                        }
                        bindChildDOM(c);
                    }
                }
                else {
                    bindChildDOM(child);
                }
            }
        }
        else {
            let el: Component<any, any, any>;
            if (instantiatedComponents[renderId] &&
                instantiatedComponents[renderId][props.id]) {

                el = instantiatedComponents[renderId][props.id]
            }
            else {
                el = new element(props, children);
            }
            el.bindDOM(renderId);

            // We want to add a root custom element too. The children custom element
            // is added above. We do a check of the component variable. There is no
            // component for children custom elements, but there are one for the a
            // root custom element, becase the component class calls `setComponent`
            // and passes the component to this closure.
            if (component) {
                component.customElements[el.props.id] = el;
            }
            else {
                component = el;
            }
        }

        function bindChildDOM(child: JSX.Element) {
            if (child.isIntrinsic) {
                child.setComponent(component);
                child.bindDOM(renderId);
            }
            else {
                child.bindDOM(renderId);
                let childComponent = child.getComponent();
                component.customElements[childComponent.props.id] = childComponent;
            }
        }
    }

    function instantiateComponents(renderId?: number): number {
        if (!renderId) {
            renderId = getRenderId();
        }
        if (!instantiatedComponents[renderId]) {
            instantiatedComponents[renderId] = {};
        }
        if (typeof element === 'string') {
            for (let child of children) {
                if (!child || typeof child === 'string') {
                    continue;
                }
                else if (u.isArray<JSX.Element[]>(child)) {
                    for (let c of child) {
                        instantiateChildComponents(c);
                    }
                }
                else {
                    instantiateChildComponents(child);
                }
            }
        }
        else {
            let elementComponent = new element(props, children);
            instantiatedComponents[renderId][props.id] = elementComponent;
            elementComponent.instantiateComponents(renderId);
        }

        return renderId;

        function instantiateChildComponents(child: JSX.Element): void {
            if (child.isCustomElement) {
                child.instantiateComponents(renderId);
            }
        }
    }

    return {
        isIntrinsic: typeof element === 'string',
        isCustomElement: typeof element !== 'string',
        getComponent: () => component,
        markAsChildOfRootElement,
        instantiateComponents,
        setComponent,
        toString,
        bindDOM,
        toDOM,
    }
}