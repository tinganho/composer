
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/radium/radium.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>

import {Page, ComposerDocument, DocumentProps, ComposerLayout, ComposerContent} from '../../src/composer/composer';
import React = require('react');
import Radium = require('radium');

export var route = '/';

interface Contents {
    navigationBar: typeof ComposerContent;
    feed: typeof ComposerContent;
}

@Radium
export class TestLayout extends ComposerLayout<Contents, {}> {

    public render() {
        return (
            <div className='Layout' style={[layoutStyles.container]}>
                <header className='TopBar'>
                    {this.props.navigationBar}
                </header>
                <div className='Body'>
                    {this.props.feed}
                </div>
            </div>
        );
    }
}

interface StyleRules extends Radium.StyleRules {
    container: Radium.CSSStyleDeclaration;
}

var layoutStyles: StyleRules = {
    container: {
        backgroundColor: '#fff',
        ':hover': {
            background: '#444'
        }
    }
}

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

export var contents: Contents = {
    navigationBar: NavigationBar,
    feed: Feed
}