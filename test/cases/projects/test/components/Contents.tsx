
/// <reference path='../../../../../typings/react/react.d.ts'/>
/// <reference path='../../../../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../../../../typings/radium/radium.d.ts'/>

import { ComposerContent } from '../../../../../src/client/components';
import React = require('react');
import Radium = require('radium');

interface NavigationBarProps {
    a: string;
    b: string;
}

export class NavigationBar extends ComposerContent<NavigationBarProps, {}> {

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