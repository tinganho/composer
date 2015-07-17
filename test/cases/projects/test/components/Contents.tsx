
/// <reference path='../../../../../typings/react/react.d.ts'/>
/// <reference path='../../../../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../../../../typings/radium/radium.d.ts'/>
/// <reference path='../../../../../typings/platform/platform.d.ts' />
/// <reference path='../../../../../typings/react-addons-pure-render-mixin/react-addons-pure-render-mixin.d.ts'/>

let __r = require;
import { ComposerContent } from '../../../../../src/client/components';
import ReactType = require('react');
let React: typeof ReactType = inClient ? require('public/scripts/vendor/react') : __r('react');
import PureRenderMixinType = require('react-addons-pure-render-mixin');
let PureRenderMixin: typeof PureRenderMixinType = inClient ? require('/public/scripts/vendor/react-with-addons.js') : __r('react-addons-pure-render-mixin');
import RadiumType = require('radium');
let Radium: typeof RadiumType = inClient ? (window as any).Radium : __r('radium');

interface NavigationBarProps {
    a: string;
    b: string;
}

export class NavigationBar extends ComposerContent<NavigationBarProps, {}> {
    public mixins = [PureRenderMixin];

    public componentDidMount() {
        // console.log(React.findDOMNode(this));
    }

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