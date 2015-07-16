
/// <reference path='../../../../../typings/react/react.d.ts'/>
/// <reference path='../../../../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../../../../typings/radium/radium.d.ts'/>
/// <reference path='../../../../../typings/react-addons-pure-render-mixin/react-addons-pure-render-mixin.d.ts'/>

import { ComposerContent } from '../../../../../src/client/components';
import PureRenderMixin = require('react-addons-pure-render-mixin');
import React = require('react');
import Radium = require('radium');

interface NavigationBarProps {
    a: string;
    b: string;
}

export class NavigationBar extends ComposerContent<NavigationBarProps, {}> {
    public mixins = [PureRenderMixin];

    static fetch(): Promise<NavigationBarProps> {
        let promise = new Promise((resolve, reject) => {
            resolve({a: 'a', b: 'b'})
        });

        return promise;
    }

    public render() {
        return (
            <div className='NavigationBar'>{this.props.a + this.props.b}</div>
        );
    }
}

interface FeedProps {
    a: string;
    b: string;
}

export class Feed extends ComposerContent<FeedProps, {}> {
    public mixins = [PureRenderMixin];

    static fetch(): Promise<FeedProps> {
        let promise = new Promise((resolve, reject) => {
            resolve({a: 'a', b: 'b'})
        });

        return promise;
    }

    public render() {
        return (
            <div className='Feed'>{this.props.a + this.props.b}</div>
        );
    }
}