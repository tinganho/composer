
/// <reference path='../../../src/component/component.d.ts' />
/// <reference path='../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../typings/chai/chai.d.ts' />

import React = require('../../../src/component/component');
import { Component } from '../../../src/component/component';
import { prepareHTML } from '../../../src/harness/componentHarness';
import { expect } from 'chai';

interface P extends Props { }
interface S { }
interface E extends Elements { }

describe('Bind DOM', () => {
    it('root element', () => {
        prepareHTML('<div id="i1"></div>');
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div></div>);
            }
        }

        let c1 = new C1({ id: 'i1'});
        c1.bindDOM();
        expect(c1.root.id).to.equal('i1');
    });

    it('referenced element', () => {
        prepareHTML('<div id="i1"><div data-ref="a">a</div></div>');
        interface E extends Elements {
            a: DOMElement;
        }
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div><div ref="a"></div></div>);
            }
        }

        let c1 = new C1({ id: 'i1'});
        c1.bindDOM();
        expect(c1.elements.a.getHTML()).to.equal('a');
    });

    it('one custom element', () => {
        prepareHTML('<div id="i1"><div id="i2"></div></div>');
        interface E extends Elements {
            a: DOMElement;
        }
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div><C2 id="i2"></C2></div>);
            }
        }
        class C2 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div></div>);
            }
        }

        let c1 = new C1({ id: 'i1'});
        c1.bindDOM();
        expect(Object.keys(c1.customElements).length).to.equal(1);
        expect(c1.customElements['i2'].props.id).to.equal('i2');
    });

    it('multiple flat custom element', () => {
        prepareHTML('<div id="i1"><div id="i2"></div><div id="i3"></div></div>');
        interface E extends Elements {
            a: DOMElement;
        }
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div><C2 id="i2"></C2><C3 id="i3"></C3></div>);
            }
        }
        class C2 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div></div>);
            }
        }
        class C3 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div></div>);
            }
        }

        let c1 = new C1({ id: 'i1'});
        c1.bindDOM();
        expect(Object.keys(c1.customElements).length).to.equal(2);
        expect(c1.customElements['i2'].props.id).to.equal('i2');
        expect(c1.customElements['i3'].props.id).to.equal('i3');
    });

    it('multiple nested custom element', () => {
        prepareHTML('<div id="i1"><div id="i2"><div id="i3"></div></div></div>');
        interface E extends Elements {
            a: DOMElement;
        }
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div><C2 id="i2"><C3 id="i3"></C3></C2></div>);
            }
        }
        class C2 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div>{this.children}</div>);
            }
        }
        class C3 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div></div>);
            }
        }

        let c1 = new C1({ id: 'i1'});
        c1.bindDOM();
        expect(Object.keys(c1.customElements).length).to.equal(1);
        expect(c1.customElements['i2'].props.id).to.equal('i2');
        expect(Object.keys(c1.customElements['i2'].customElements).length).to.equal(1);
        expect(c1.customElements['i2'].customElements['i3'].props.id).to.equal('i3');
    });
});