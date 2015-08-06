
/// <reference path='../../src/component/component.d.ts' />
/// <reference path='../../typings/mocha/mocha.d.ts' />
/// <reference path='../../typings/chai/chai.d.ts' />

import React = require('../../src/component/element');
import { Component } from '../../src/component/component';
import { getMountedDOMHTMLString } from '../../src/harness/componentHarness';
import { expect } from 'chai';

interface P extends Props { }
interface S { }
interface E extends Elements { }

describe('Render to DOM', () => {
    describe('Element Properties', () => {
        it('id', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i"></div>');
        });

        it('one property', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div data-a="a"></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i" data-a="a"></div>');
        });

        it('multiple properties', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div data-a="a" data-b="b"></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i" data-a="a" data-b="b"></div>');
        });

        it('element reference', () => {
            interface E extends Elements {
                a: DOMElement;
            }
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div ref="a"></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i" data-ref="a"></div>');
            expect(c1.elements.a.addClass).to.not.be.undefined;
        });

        it('camel-cased props to dashed props', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div autoComplete></div>);
                }
            }

            let c1 = new C1({ id: 'i1'});
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i1" auto-complete="true"></div>');
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
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i"><div></div></div>');
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
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i2"></div>');
        });
    });

    describe('Element Nesting', () => {
        it('root element with one intrinsic child element', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div><div></div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i"><div></div></div>');
        });

        it('root element with multiple flat intrinsic child elements', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div><div></div><div></div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i"><div></div><div></div></div>');
        });

        it('root element with multiple nested intrinsic child elements', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div><div><div></div></div></div>);
                }
            }

            let c1 = new C1({ id: 'i'});
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i"><div><div></div></div></div>');
        });

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
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i"><div id="i2"></div></div>');
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
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i1"><div id="i2"></div></div>');
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
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i1"><div id="i2"></div><div id="i3"></div></div>');
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
            expect(getMountedDOMHTMLString(c1.toDOM())).to.equal('<div id="i1"><div id="i2"><div id="i3"></div></div></div>');
        });
    });

    describe('Bindings', () => {
        it('one custom element', () => {
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

            let c1 = new C1({ id: 'i1'});
            c1.toDOM();
            expect(Object.keys(c1.customElements).length).to.equal(1);
            expect(c1.customElements['i2'].toString()).to.equal('<div id="i2"></div>');
        });

        it('multiple flat custom elements', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<C2 id="i2"><C3 id="i3"></C3><C4 id="i4"></C4></C2>);
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
            class C4 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<div></div>);
                }
            }

            let c1 = new C1({ id: 'i1'});
            c1.toDOM();
            expect(c1.customElements['i2'].toString()).to.equal('<div id="i2"><div id="i3"></div><div id="i4"></div></div>');
        });

        it('multiple nested custom elements', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<C2 id="i2"><C3 id="i3"></C3></C2>);
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
            c1.toDOM();
            expect(c1.customElements['i2'].toString()).to.equal('<div id="i2"><div id="i3"></div></div>');
        });
    });

    describe('Stored renderings', () => {
        it('remove renderings on next tick', () => {
            class C1 extends Component<P, S, E> {
                public render(): JSX.Element {
                    return (<C2 id="i2"><C3 id="i3"></C3></C2>);
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
            c1.toDOM();

            expect(React.getInstantiatedComponents(c1.lastRenderId)).to.not.be.undefined;
            setTimeout(() => {
                expect(React.getInstantiatedComponents(c1.lastRenderId)).to.be.undefined;
            }, 0);
        });
    });
});