

/// <reference path='../../../../../typings/react/react.d.ts'/>
/// <reference path='../../../../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../../../../typings/radium/radium.d.ts'/>
/// <reference path='../../../../../typings/react-addons-pure-render-mixin/react-addons-pure-render-mixin.d.ts'/>
/// <reference path='../../../../../src/client/infos.d.ts' />

let __r = require;
import { ComposerLayout, ComposerContent } from '../../../../../src/client/components';
import { NavigationBar, TodoList } from './Contents';
import ReactType = require('react');
let React: typeof ReactType = inClient ? (window as any).React : __r('react');
import RadiumType = require('radium');
let Radium: typeof RadiumType = inClient ? (window as any).Radium : __r('radium');
import PureRenderMixinType = require('react-addons-pure-render-mixin');
let PureRenderMixin: typeof PureRenderMixinType = inClient ? require('/public/scripts/vendor/react-with-addons') : __r('react-addons-pure-render-mixin');

interface Regions {
    TopBar: JSX.Element;
    Body: JSX.Element;
}

@Radium
export class Layout extends ComposerLayout<Regions, {}> {
    public static className = 'Layout';

    public mixins = [PureRenderMixin];

    public render() {
        return (
            <div id='layout'>
                <header className='TopBar'>
                    {this.props.TopBar}
                </header>
                <div className='Body'>
                    {this.props.Body}
                </div>
            </div>
        );
    }
}

interface StyleRules extends Radium.Style {
    container: Radium.StyleDeclaration;
}

var layoutStyles: StyleRules = {
    container: {
        backgroundColor: '#fff',
        ':hover': {
            background: '#444'
        }
    }
}