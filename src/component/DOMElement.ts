
/// <reference path='./component.d.ts' />

import * as u from './utils';

export class ComposerDOMElement implements DOMElement {
    public nativeElement: HTMLElement;

    constructor(element: HTMLElement | DOMElement) {
        if (this.isComposerDOMElement(element)) {
            this.nativeElement = element.nativeElement;
        }
        else {
            this.nativeElement = element;
        }
    }

    public get id() {
        return this.nativeElement.id;
    }

    public set id(id: string) {
        this.nativeElement.id = id;
    }

    private isComposerDOMElement(element: HTMLElement | DOMElement): element is DOMElement {
        return !!(element as ComposerDOMElement).findOne;
    }

    public findOne(query: string): ComposerDOMElement {
        let el = this.nativeElement.querySelector(query);
        return el ? new ComposerDOMElement(el as HTMLElement) : null;
    }

    public findAll(query: string): ComposerDOMElement[] {
        let elements = this.nativeElement.querySelectorAll(query) as any;
        return u.map(elements as any,element => {
            return new ComposerDOMElement(element as HTMLElement);
        });
    }

    public getText(): string {
        return this.nativeElement.textContent;
    }

    public getAttribute(name: string): string {
        return this.nativeElement.getAttribute(name);
    }

    public setAttribute(name: string, value?: string): ComposerDOMElement {
        this.nativeElement.setAttribute(name, value);
        return this;
    }

    public getHTML(): string {
        return this.nativeElement.innerHTML;
    }

    public append(element: ComposerDOMElement): ComposerDOMElement {
        this.nativeElement.appendChild(element.nativeElement);
        return this;
    }

    public prepend(element: ComposerDOMElement): ComposerDOMElement {
        this.nativeElement.insertBefore(element.nativeElement, this.nativeElement.firstChild);
        return this;
    }

    public before(element: ComposerDOMElement): ComposerDOMElement {
        this.nativeElement.parentNode.insertBefore(element.nativeElement, this.nativeElement);
        return this;
    }

    public after(element: ComposerDOMElement): ComposerDOMElement {
        this.nativeElement.parentNode.insertBefore(element.nativeElement, this.nativeElement.parentNode.lastChild);
        return this;
    }

    public hide(): ComposerDOMElement {
        this.nativeElement.style.display = 'none';
        return this;
    }

    public remove(): void {
        this.nativeElement.parentNode.removeChild(this.nativeElement);
    }

    public addClass(className: string): ComposerDOMElement {
        this.nativeElement.classList.add(className);
        return this;
    }

    public removeClass(className: string): ComposerDOMElement {
        this.nativeElement.classList.remove(className);
        return this;
    }

    public getClasses(): string[] {
        return this.nativeElement.className.split(' ');
    }

    public onClick(listener: EventListener): ComposerDOMElement {
        this.nativeElement.addEventListener('click', listener, false);
        return this;
    }

    public onDbClick(listener: EventListener): ComposerDOMElement {
        this.nativeElement.addEventListener('dbclick', listener, false);
        return this;
    }

    public onSubmit(listener: EventListener): ComposerDOMElement {
        this.nativeElement.addEventListener('submit', listener, false);
        return this;
    }

    public onFocus(listener: EventListener): ComposerDOMElement {
        this.nativeElement.addEventListener('focus', listener, false);
        return this;
    }

    public onBlur(listener: EventListener): ComposerDOMElement {
        this.nativeElement.addEventListener('blur', listener, false);
        return this;
    }
}