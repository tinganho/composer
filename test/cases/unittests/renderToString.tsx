
/// <reference path='../../../src/component/component.d.ts' />
/// <reference path='../../../typings/mocha/mocha.d.ts' />
/// <reference path='../../../typings/chai/chai.d.ts' />

import React = require('../../../src/component/component');
import { Component } from '../../../src/component/component';
import { expect } from 'chai';

interface P extends Props { }
interface S { }
interface E extends Elements { }

describe('Render to string', () => {
    describe('Element Properties', () => {
        it('id', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i"></div>')
        });

        it('non-id exception', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div></div>);
                }
            }
            function f() {
                let c1 = new (C1 as any)();
            }
            expect(f).to.throw('You must define an id for your component C1');
        });

        it('one property', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div data-a="a"></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i" data-a="a"></div>');
        });

        it('multiple properties', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div data-a="a" data-b="b"></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i" data-a="a" data-b="b"></div>');
        });

        it('element reference', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div ref="a"></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i" data-ref="a"></div>');
        });

        it('camel-cased props to dashed props', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div autoComplete></div>);
                }
            }

            let c1 = new C1({ id: 'i1'});
            expect(c1.toString()).to.equal('<div id="i1" auto-complete></div>');
        });
    });

    describe('Root Element Declaration', () => {
        it('intrinsic root element', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div><div></div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i"><div></div></div>');
        });

        it('component root element', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<C2 id="i2"></C2>);
                }
            }
            class C2 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i2"></div>');
        });
    });

    describe('Element Nesting', () => {
        it('`this.children` reference without passing children', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div><C2 id="i2"></C2></div>);
                }
            }
            class C2 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div>{this.children}</div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i"><div id="i2"></div></div>');
        });

        it('root element with one intrinsic child element', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div><div></div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i"><div></div></div>');
        });

        it('root element with multiple flat intrinsic child elements', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div><div></div><div></div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i"><div></div><div></div></div>');
        });

        it('root element with multiple nested intrinsic child elements', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div><div><div></div></div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(c1.toString()).to.equal('<div id="i"><div><div></div></div></div>');
        });

        it('root element with one child custom element', () => {
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
            expect(c1.toString()).to.equal('<div id="i1"><div id="i2"></div></div>');
        });

        it('root element with multiple flat child custom element', () => {
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
            expect(c1.toString()).to.equal('<div id="i1"><div id="i2"></div><div id="i3"></div></div>');
        });

        it('root element with multiple nested child custom element', () => {
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
            expect(c1.toString()).to.equal('<div id="i1"><div id="i2"><div id="i3"></div></div></div>');
        });
    });
});
