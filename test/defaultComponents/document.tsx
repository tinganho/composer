
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/platform/platform.d.ts'/>
/// <reference path='../../src/client/components.d.ts'/>
/// <reference path='../../typings/react-addons-pure-render-mixin/react-addons-pure-render-mixin.d.ts'/>

let __r = require;
import { ComposerDocument } from '../../src/client/components';
import ReactType = require('react');
let React: typeof ReactType = inClient ? (window as any).React : __r('react');
import PureRenderMixinType = require('react-addons-pure-render-mixin');
let PureRenderMixin: typeof PureRenderMixinType = inClient ? require('/public/scripts/vendor/react-with-addons.js') : __r('react-addons-pure-render-mixin');

interface Props extends DocumentProps {
    layout: string;
}

export class Document extends ComposerDocument<Props, {}> {
    public mixins = [PureRenderMixin];

    public render() {
        this.props
        return (
            <html lang='en'>
                <head>
                    <title>{this.props.title}</title>
                    <link rel='stylesheet' href='/public/styles/styles.css'/>
                    <script type='text/javascript' dangerouslySetInnerHTML={{ __html: 'window.inServer = false; window.inClient = true;' }}></script>
                    <script type='text/javascript' src="/public/scripts/vendor/promise.js"></script>
                    <script type='text/javascript' src="/public/scripts/vendor/promise.prototype.finally.js"></script>
                    <script type='text/javascript' src="/public/scripts/vendor/system.js"></script>
                    <script type='text/javascript' src="/public/scripts/vendor/react.js"></script>
                    <script type='text/javascript' src="/public/scripts/vendor/radium.js"></script>
                    <script type='text/javascript' src="/public/scripts/startup.js"></script>
                    {this.props.jsonScriptData.map(attr => {
                        return (
                            <script
                                type='application/json'
                                id={attr.id} key={attr.id}
                                dangerouslySetInnerHTML={{ __html: attr.data }}>
                            </script>
                        );
                    })}
                </head>
                <body dangerouslySetInnerHTML={{ __html: '{{layout}}'}}>
                </body>
            </html>
        );
    }
}