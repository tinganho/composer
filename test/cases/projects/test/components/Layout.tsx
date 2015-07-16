

/// <reference path='../../../../../typings/react/react.d.ts'/>
/// <reference path='../../../../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../../../../typings/radium/radium.d.ts'/>
/// <reference path='../../../../../typings/react-addons-pure-render-mixin/react-addons-pure-render-mixin.d.ts'/>

import { ComposerLayout, ComposerContent, ProvidedContentInfos, ContentInfo } from '../../../../../src/client/components';
import { NavigationBar, Feed } from './Contents';
import React = require('react');
import Radium = require('radium');
import PureRenderMixin = require('react-addons-pure-render-mixin');

interface Contents extends ProvidedContentInfos {
    navigationBar: ContentInfo;
    feed: ContentInfo;
}

@Radium
export class Layout extends ComposerLayout<Contents, {}> {
    public mixins = [PureRenderMixin];
    public static className = 'TestLayout';

    public render() {
        return (
            <div className='Layout'>
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

export var contents: Contents = {
    navigationBar: { component: NavigationBar, importPath: 'test/cases/projects/test/components/Contents.js' },
    feed: { component: Feed, importPath: 'test/cases/projects/test/components/Contents.js' },
}