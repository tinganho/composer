
/// <reference path='../../typings/chai/chai.d.ts' />

import React = require('../../src/component/element');
import { Component } from '../../src/component/component';
import { getMountedDOMHTMLString, prepareHTML } from '../../src/harness/componentHarness';
import { expect } from 'chai';

interface P extends Props {
    text?: string;
}
interface S { }
interface E extends Elements {
}

describe('Get instances of', () => {
    it('get one instance', () => {
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<C2 id="i2"></C2>);
            }
        }
        class C2 extends Component<P, S, E> {
            public result() {
                return 'success';
            }
            public render(): JSX.Element {
                return (<div>{this.props.text}</div>);
            }
        }

        let c1 = new C1({ id: 'i1' });
        let { C2i2 } = c1.getInstancesOf('C2i2');
        expect((C2i2 as C2).result()).to.equal('success');
    });

    it('get multiple flat instances', () => {
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div><C2 id="i2"></C2><C3 id="i3"></C3></div>);
            }
        }
        class C2 extends Component<P, S, E> {
            public result() {
                return 'success';
            }
            public render(): JSX.Element {
                return (<div>{this.children}</div>);
            }
        }
        class C3 extends Component<P, S, E> {
            public result() {
                return 'success';
            }
            public render(): JSX.Element {
                return (<div>{this.props.text}</div>);
            }
        }

        let c1 = new C1({ id: 'i1' });
        let { C2i2, C3i3 } = c1.getInstancesOf('C2i2', 'C3i3');
        expect((C2i2 as C2).result()).to.equal('success');
        expect((C3i3 as C2).result()).to.equal('success');
    });

    it('get multiple nested instances', () => {
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<C2 id="i2"><C3 id="i3"></C3></C2>);
            }
        }
        class C2 extends Component<P, S, E> {
            public result() {
                return 'success';
            }
            public render(): JSX.Element {
                return (<div>{this.children}</div>);
            }
        }
        class C3 extends Component<P, S, E> {
            public result() {
                return 'success';
            }
            public render(): JSX.Element {
                return (<div>{this.props.text}</div>);
            }
        }

        let c1 = new C1({ id: 'i1' });
        let { C2i2, C3i3 } = c1.getInstancesOf('C2i2', 'C3i3');
        expect((C2i2 as C2).result()).to.equal('success');
        expect((C3i3 as C2).result()).to.equal('success');
    });


    it('should reuse instances on to string', () => {
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<C2 id="i2"></C2>);
            }
        }
        class C2 extends Component<P, S, E> {
            public result() {
                this.props.text = 'text';
            }
            public render(): JSX.Element {
                return (<div>{this.props.text}</div>);
            }
        }

        let c1 = new C1({ id: 'i1' });
        let { C2i2 } = c1.getInstancesOf('C2i2');
        (C2i2 as C2).result();
        expect(c1.toString()).to.equal('<div id="C2i2">text</div>');
    });

    it('should reuse instances on to DOM', () => {
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<C2 id="i2"></C2>);
            }
        }
        class C2 extends Component<P, S, E> {
            public result() {
                this.props.text = 'text';
            }
            public render(): JSX.Element {
                return (<div>{this.props.text}</div>);
            }
        }

        let c1 = new C1({ id: 'i1' });
        let { C2i2 } = c1.getInstancesOf('C2i2');
        (C2i2 as C2).result();
        expect(getMountedDOMHTMLString(c1.toDOM(c1.lastRenderId))).to.equal('<div id="C2i2">text</div>');
    });

    it('should reuse instances on bind DOM', () => {
        prepareHTML('<div id="C2i3">text</div>');
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<C2 id="i2"></C2>);
            }
        }
        class C2 extends Component<P, S, E> {
            public result() {
                this.props.id = 'i3';
            }
            public render(): JSX.Element {
                return (<div>{this.props.text}</div>);
            }
        }

        let c1 = new C1({ id: 'i1' });
        let { C2i2 } = c1.getInstancesOf('C2i2');
        (C2i2 as C2).result();
        C2i2.bindDOM(c1.lastRenderId);
        expect(C2i2.root.getHTML()).to.equal('text');
    });
});