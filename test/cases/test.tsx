
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/radium/radium.d.ts'/>

import {Page, ComposerDocument, DocumentProps, ComposerLayout, ComposerContent} from '../../src/composer/composer';
import React = require('react');
import Radium = require('radium');

interface Regions {
    topBar: string;
    body: string;
    footer: string;
}

@Radium
export class TestLayout extends ComposerLayout<Regions, {}> {
    public name = 'Body withTopBar withFooter';

    public render() {
        return (
            <div className='Layout' style={[layoutStyles.container]}>
                <header className='TopBar'>{this.props.topBar}</header>
                    <div className='Body'>{this.props.body}</div>
                <footer className='Footer'>{this.props.footer}</footer>
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

interface States {}

interface Contents {
    TopBar: typeof ComposerContent;
    Body: typeof ComposerContent;
    Footer: typeof ComposerContent;
}

