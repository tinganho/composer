

/// <reference path='../../src/component/component.d.ts' />
/// <reference path='../../typings/mocha/mocha.d.ts' />
/// <reference path='../../typings/chai/chai.d.ts' />

import React = require('../../src/component/element');
import { Component } from '../../src/component/component';
import { prepareHTML } from '../../src/harness/componentHarness';
import { expect } from 'chai';

interface P extends Props { }
interface S { }
interface E extends Elements { }

describe('Component Props', () => {
    it('setProp', () => {
        interface P extends Props {
            a: string;
        }
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div></div>);
            }
        }
        let c1 = new C1();
        c1.setProp('a', 'a');
        expect(c1.props.a).to.equal('a');
    });

    it('setProps', () => {
        interface P extends Props {
            a: string;
        }
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div></div>);
            }
        }
        let c1 = new C1();
        c1.setProps({ a: 'a'});
        expect(c1.props).to.deep.equal({ a: 'a'});
    });


    it('unsetProps', () => {
        interface P extends Props {
            a: string;
        }
        class C1 extends Component<P, S, E> {
            public render(): JSX.Element {
                return (<div></div>);
            }
        }
        let c1 = new C1({ a: 'a' });
        c1.unsetProp('a');
        expect(c1.props).to.deep.equal({});
    });
});