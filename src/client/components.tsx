
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/es6-promise/es6-promise.d.ts'/>
/// <reference path='../../typings/react-addons-pure-render-mixin/react-addons-pure-render-mixin.d.ts'/>
/// <reference path='./components.d.ts'/>

let __r = require;
import ReactType = require('react');
let React: typeof ReactType = inClient ? require('public/scripts/vendor/react') : __r('react');
import RadiumType = require('radium');
let Radium: typeof RadiumType = inClient ? (window as any).Radium : __r('radium');

export abstract class ComposerComponent<P, S> extends React.Component<P, S> {

    /**
     * This static property is a native readonly JS property and it is automatically set to the
     * constructor's name.
     */
    public static name: string;

    /**
     * Some decorators wraps a class with their own class and thus alters the name of a
     * constructor. Please set this property to supercede such changes.
     */
    public static className: string;
}

export class ComposerDocument<Props extends DocumentProps, States> extends ComposerComponent<Props, States> {}

export class ComposerLayout<Props, States> extends ComposerComponent<Props, States> {}

export class ComposerContent<Props, States> extends ComposerComponent<Props, States> {

    static fetch(): Promise<any> {
        return new Promise((resolve, reject) => {
           resolve();
        });
    }
}

interface LinkProps {
    to: string;
    style?: Object;
    children?: any;
}

declare let __Router: any;

@Radium
export class Link extends React.Component<LinkProps, {}> {

    public navigateTo(event: React.MouseEvent) {
        event.preventDefault();

        __Router.navigateTo(this.props.to);
    }

    public render() {
        return (
            <a onClick={this.navigateTo.bind(this)} style={this.props.style}>{this.props.children}</a>
        );
    }
}
