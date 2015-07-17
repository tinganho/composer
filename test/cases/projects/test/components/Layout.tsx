

/// <reference path='../../../../../typings/react/react.d.ts'/>
/// <reference path='../../../../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../../../../typings/radium/radium.d.ts'/>
/// <reference path='../../../../../typings/react-addons-pure-render-mixin/react-addons-pure-render-mixin.d.ts'/>
/// <reference path='../../../../../src/client/infos.d.ts' />

let __r = require;
import { ComposerLayout, ComposerContent } from '../../../../../src/client/components';
import { NavigationBar, Feed } from './Contents';
import ReactType = require('react');
let React: typeof ReactType = inClient ? require('public/scripts/vendor/react') : __r('react');
import RadiumType = require('radium');
let Radium: typeof RadiumType = inClient ? (window as any).Radium : __r('radium');
import PureRenderMixinType = require('react-addons-pure-render-mixin');
let PureRenderMixin: typeof PureRenderMixinType = inClient ? require('/public/scripts/vendor/react-with-addons') : __r('react-addons-pure-render-mixin');

interface LayoutContents {
    NavigationBar: JSX.Element;
    Feed: JSX.Element;
}

@Radium
export class Layout extends ComposerLayout<LayoutContents, {}> {
    public mixins = [PureRenderMixin];
    public static className = 'Layout';

    public render() {
        return (
            <div id='layout'>
                <header className='TopBar'>
                    {this.props.NavigationBar}
                </header>
                <div className='Body'>
                    {this.props.Feed}
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

export var contentDeclarations: ProvidiedContentDeclarations = {
    NavigationBar: { component: NavigationBar, importPath: 'test/cases/projects/test/components/Contents.js' },
    Feed: { component: Feed, importPath: 'test/cases/projects/test/components/Contents.js' },
}