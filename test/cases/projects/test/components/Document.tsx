
/// <reference path='../../../../../typings/react/react.d.ts'/>
/// <reference path='../../../../../typings/react/react-jsx.d.ts'/>

import { ComposerDocument, DocumentProps } from '../../../../../src/client/components';
import React = require('react');

interface Props extends DocumentProps {
    layout: string;
}

export class Document extends ComposerDocument<Props, {}> {
    public render() {
        return (
            <html lang='en'>
                <head>
                    <link rel='stylesheet' href='/public/styles/styles.css'/>
                    <script src="/public/scripts/vendor/system.js"></script>
                    <script src="/public/scripts/vendor/react.js"></script>
                    <script src='/public/scripts/html.js'></script>
                    <script src='/public/scripts/startup.js'></script>
                    {this.props.jsonScriptData.map(attr => {
                        <script id={attr.id}>{attr.data}</script>
                    })}
                </head>
                <body>
                    {this.props.layout}
                </body>
            </html>
        );
    }
}

export var defaultConfigs: DocumentProps = {
    confs: ['default']
}